import { getSupabaseAdmin } from '../_utils/supabase-admin.js';
import { verifyStudioAccess } from '../_utils/tenant.js';
import { sendJson, parseJsonBody } from '../_utils/auth.js';
import { logAuditEvent } from '../_utils/audit.js';

/**
 * Studio OS — SKUs (Packaging & Product Records) API Handler
 * Handles structured packaging specifications, revisions, and tenant isolation.
 */
export default async function handler(req, res) {
  const method = req.method;
  const url = new URL(req.url, 'http://localhost');
  const queryId = req.query?.id || url.searchParams.get('id');
  const queryClientId = req.query?.client_id || url.searchParams.get('client_id');

  // 1. Enforce Authentication & Tenant Permissions First
  const auth = await verifyStudioAccess(req, queryClientId || null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // If a specific SKU id is provided, fetch its client_id to enforce tenant check
  let targetClientId = queryClientId;
  if (queryId && !targetClientId) {
    const { data: skuRecord } = await supabaseAdmin
      .from('skus')
      .select('client_id')
      .eq('id', queryId)
      .single();
    if (skuRecord) {
      targetClientId = skuRecord.client_id;
      if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(targetClientId)) {
        return sendJson(res, 403, { error: 'Forbidden: You do not have permission to access this SKU.' });
      }
    }
  }

  try {
    switch (method) {
      // ---------------------------------------------------------
      // GET: List SKUs or retrieve single SKU with revision history
      // ---------------------------------------------------------
      case 'GET': {
        // If retrieving a single SKU
        if (queryId) {
          const { data: sku, error: skuErr } = await supabaseAdmin
            .from('skus')
            .select('*')
            .eq('id', queryId)
            .single();

          if (skuErr || !sku) {
            return sendJson(res, 404, { error: 'SKU not found.' });
          }

          // Fetch revision history
          const { data: revisions } = await supabaseAdmin
            .from('sku_revisions')
            .select('*')
            .eq('sku_id', queryId)
            .order('revision_number', { ascending: false });

          return sendJson(res, 200, { sku, revisions: revisions || [] });
        }

        // List SKUs across allowed tenant scope
        let query = supabaseAdmin.from('skus').select('*').order('created_at', { ascending: false });

        if (targetClientId) {
          query = query.eq('client_id', targetClientId);
        } else if (!auth.isStudioAdmin) {
          query = query.in('client_id', auth.allowedClientIds);
        }

        const { data: skus, error } = await query;
        if (error) throw error;

        return sendJson(res, 200, { skus: skus || [] });
      }

      // ---------------------------------------------------------
      // POST: Create a new SKU record & initialize revision 1
      // ---------------------------------------------------------
      case 'POST': {
        if (!auth.isStudioAdmin && auth.clientRole === 'client_viewer') {
          return sendJson(res, 403, { error: 'Forbidden: View-only accounts cannot create SKUs.' });
        }

        const body = await parseJsonBody(req);
        const clientId = targetClientId || body.client_id;
        const name = (body.name || '').trim();
        const skuCode = (body.sku_code || '').trim().toUpperCase();

        if (!clientId || !name || !skuCode) {
          return sendJson(res, 400, { error: 'client_id, name, and sku_code are required.' });
        }

        // Verify caller access to specified client
        if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(clientId)) {
          return sendJson(res, 403, { error: 'Forbidden: Cross-tenant SKU creation blocked.' });
        }

        const skuPayload = {
          client_id: clientId,
          brand_id: body.brand_id || null,
          name,
          sku_code: skuCode,
          category: body.category || '',
          pack_format: body.pack_format || '',
          dimensions: body.dimensions || { width_mm: 0, height_mm: 0, depth_mm: 0 },
          materials: body.materials || '',
          claims: Array.isArray(body.claims) ? body.claims : [],
          target_market: body.target_market || '',
          barcode_upc: body.barcode_upc || '',
          status: body.status || 'draft',
          current_revision: 1
        };

        const { data: newSkus, error: insertErr } = await supabaseAdmin
          .from('skus')
          .insert([skuPayload])
          .select();

        if (insertErr) throw insertErr;
        const createdSku = newSkus[0];

        // Automatically initialize revision 1
        await supabaseAdmin.from('sku_revisions').insert([{
          sku_id: createdSku.id,
          client_id: clientId,
          revision_number: 1,
          change_summary: 'Initial SKU specification created',
          dieline_file_url: body.dieline_file_url || null,
          artwork_file_url: body.artwork_file_url || null,
          created_by: auth.user.id
        }]);

        // Attributable audit log
        await logAuditEvent(req, {
          clientId,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'sku.create',
          resourceType: 'sku',
          resourceId: createdSku.id,
          details: { name: createdSku.name, sku_code: createdSku.sku_code }
        });

        return sendJson(res, 201, { sku: createdSku });
      }

      // ---------------------------------------------------------
      // PATCH: Update SKU specifications or bump revision
      // ---------------------------------------------------------
      case 'PATCH': {
        if (!auth.isStudioAdmin && auth.clientRole === 'client_viewer') {
          return sendJson(res, 403, { error: 'Forbidden: View-only accounts cannot modify SKUs.' });
        }

        const body = await parseJsonBody(req);
        const skuId = queryId || body.id;

        if (!skuId) {
          return sendJson(res, 400, { error: 'SKU ID is required for updates.' });
        }

        // Fetch existing SKU to check current revision
        const { data: existingSku, error: fetchErr } = await supabaseAdmin
          .from('skus')
          .select('*')
          .eq('id', skuId)
          .single();

        if (fetchErr || !existingSku) {
          return sendJson(res, 404, { error: 'SKU not found.' });
        }

        // Verify tenant permission
        if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(existingSku.client_id)) {
          return sendJson(res, 403, { error: 'Forbidden: Cross-tenant modification denied.' });
        }

        const { id: _, client_id: __, bump_revision, revision_summary, dieline_file_url, artwork_file_url, ...updateFields } = body;

        let nextRevisionNumber = existingSku.current_revision;
        if (bump_revision) {
          nextRevisionNumber += 1;
          updateFields.current_revision = nextRevisionNumber;

          // Record new revision in sku_revisions
          await supabaseAdmin.from('sku_revisions').insert([{
            sku_id: skuId,
            client_id: existingSku.client_id,
            revision_number: nextRevisionNumber,
            change_summary: revision_summary || `Revision ${nextRevisionNumber} update`,
            dieline_file_url: dieline_file_url || null,
            artwork_file_url: artwork_file_url || null,
            created_by: auth.user.id
          }]);
        }

        const { data: updatedSkus, error: updateErr } = await supabaseAdmin
          .from('skus')
          .update({ ...updateFields, updated_at: new Date().toISOString() })
          .eq('id', skuId)
          .select();

        if (updateErr) throw updateErr;

        // Attributable audit log
        await logAuditEvent(req, {
          clientId: existingSku.client_id,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: bump_revision ? 'sku.revision_bump' : 'sku.update',
          resourceType: 'sku',
          resourceId: skuId,
          details: { updatedFields: Object.keys(updateFields), revision: nextRevisionNumber }
        });

        return sendJson(res, 200, { sku: updatedSkus[0] });
      }

      // ---------------------------------------------------------
      // DELETE: Delete SKU record
      // ---------------------------------------------------------
      case 'DELETE': {
        if (!auth.isStudioAdmin && auth.clientRole !== 'client_admin') {
          return sendJson(res, 403, { error: 'Forbidden: Only administrators can delete SKU records.' });
        }

        const body = method === 'DELETE' ? await parseJsonBody(req).catch(() => ({})) : {};
        const skuId = queryId || body.id;

        if (!skuId) {
          return sendJson(res, 400, { error: 'SKU ID is required for deletion.' });
        }

        const { data: existingSku } = await supabaseAdmin
          .from('skus')
          .select('client_id, name, sku_code')
          .eq('id', skuId)
          .single();

        if (existingSku && !auth.isStudioAdmin && !auth.allowedClientIds.includes(existingSku.client_id)) {
          return sendJson(res, 403, { error: 'Forbidden: Cross-tenant deletion denied.' });
        }

        const { error: delErr } = await supabaseAdmin.from('skus').delete().eq('id', skuId);
        if (delErr) throw delErr;

        if (existingSku) {
          await logAuditEvent(req, {
            clientId: existingSku.client_id,
            userId: auth.user.id,
            userEmail: auth.user.email,
            action: 'sku.delete',
            resourceType: 'sku',
            resourceId: skuId,
            details: { name: existingSku.name, sku_code: existingSku.sku_code }
          });
        }

        return sendJson(res, 200, { success: true, deletedId: skuId });
      }

      default: {
        res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
        return sendJson(res, 405, { error: `Method ${method} Not Allowed.` });
      }
    }
  } catch (err) {
    return sendJson(res, 500, { error: `SKU operation failed: ${err.message}` });
  }
}
