import { getSupabaseAdmin } from '../_utils/supabase-admin.js';
import { verifyStudioAccess } from '../_utils/tenant.js';
import { sendJson, parseJsonBody } from '../_utils/auth.js';
import { logAuditEvent } from '../_utils/audit.js';

/**
 * Studio OS — Brand Knowledge & Guidelines API
 * Manages tenant-isolated brand guidelines, design rules, color palettes,
 * and packaging mandates used for Retrieval-Augmented Brief Generation.
 */
export default async function handler(req, res) {
  const method = req.method;
  const url = new URL(req.url, 'http://localhost');
  const queryId = req.query?.id || url.searchParams.get('id');
  const queryClientId = req.query?.client_id || url.searchParams.get('client_id');
  const queryBrandId = req.query?.brand_id || url.searchParams.get('brand_id');

  // 1. Verify Authentication & Tenant Permissions
  const auth = await verifyStudioAccess(req, queryClientId || null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // If a specific knowledge item id is passed, resolve its client_id to enforce tenant check
  let targetClientId = queryClientId;
  if (queryId && !targetClientId) {
    const { data: record } = await supabaseAdmin
      .from('brand_knowledge')
      .select('client_id')
      .eq('id', queryId)
      .single();
    if (record) {
      targetClientId = record.client_id;
      if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(targetClientId)) {
        return sendJson(res, 403, { error: 'Forbidden: Access to this brand knowledge item is denied.' });
      }
    }
  }

  try {
    switch (method) {
      // ---------------------------------------------------------
      // GET: Retrieve brand knowledge items for tenant
      // ---------------------------------------------------------
      case 'GET': {
        let query = supabaseAdmin
          .from('brand_knowledge')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryId) {
          query = query.eq('id', queryId).single();
          const { data, error } = await query;
          if (error || !data) return sendJson(res, 404, { error: 'Brand knowledge item not found.' });
          return sendJson(res, 200, { brand_knowledge: data });
        }

        if (targetClientId) {
          query = query.eq('client_id', targetClientId);
        } else if (!auth.isStudioAdmin) {
          query = query.in('client_id', auth.allowedClientIds);
        }

        if (queryBrandId) {
          query = query.eq('brand_id', queryBrandId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return sendJson(res, 200, { brand_knowledge: data || [] });
      }

      // ---------------------------------------------------------
      // POST: Create a new brand knowledge item
      // ---------------------------------------------------------
      case 'POST': {
        if (!auth.isStudioAdmin && auth.clientRole === 'client_viewer') {
          return sendJson(res, 403, { error: 'Forbidden: View-only accounts cannot create brand knowledge.' });
        }

        const body = await parseJsonBody(req);
        const clientId = targetClientId || body.client_id;
        const title = (body.title || '').trim();
        const content = (body.content || '').trim();

        if (!clientId || !title || !content) {
          return sendJson(res, 400, { error: 'client_id, title, and content are required.' });
        }

        if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(clientId)) {
          return sendJson(res, 403, { error: 'Forbidden: Cross-tenant creation blocked.' });
        }

        const payload = {
          client_id: clientId,
          brand_id: body.brand_id || null,
          title,
          knowledge_type: body.knowledge_type || 'guidelines',
          content,
          tags: Array.isArray(body.tags) ? body.tags : [],
          is_active: body.is_active !== undefined ? Boolean(body.is_active) : true
        };

        const { data, error } = await supabaseAdmin
          .from('brand_knowledge')
          .insert([payload])
          .select();

        if (error) throw error;
        const created = data[0];

        await logAuditEvent(req, {
          clientId,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'brand_knowledge.create',
          resourceType: 'brand_knowledge',
          resourceId: created.id,
          details: { title: created.title, knowledge_type: created.knowledge_type }
        });

        return sendJson(res, 201, { brand_knowledge: created });
      }

      // ---------------------------------------------------------
      // PATCH: Update an existing brand knowledge item
      // ---------------------------------------------------------
      case 'PATCH': {
        if (!auth.isStudioAdmin && auth.clientRole === 'client_viewer') {
          return sendJson(res, 403, { error: 'Forbidden: View-only accounts cannot modify brand knowledge.' });
        }

        const body = await parseJsonBody(req);
        const itemId = queryId || body.id;

        if (!itemId) {
          return sendJson(res, 400, { error: 'Knowledge item ID is required for updates.' });
        }

        const { data: existing, error: fetchErr } = await supabaseAdmin
          .from('brand_knowledge')
          .select('*')
          .eq('id', itemId)
          .single();

        if (fetchErr || !existing) {
          return sendJson(res, 404, { error: 'Brand knowledge item not found.' });
        }

        if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(existing.client_id)) {
          return sendJson(res, 403, { error: 'Forbidden: Cross-tenant modification denied.' });
        }

        const { id: _, client_id: __, ...updateFields } = body;
        updateFields.updated_at = new Date().toISOString();

        const { data: updated, error: updateErr } = await supabaseAdmin
          .from('brand_knowledge')
          .update(updateFields)
          .eq('id', itemId)
          .select();

        if (updateErr) throw updateErr;

        await logAuditEvent(req, {
          clientId: existing.client_id,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'brand_knowledge.update',
          resourceType: 'brand_knowledge',
          resourceId: itemId,
          details: updateFields
        });

        return sendJson(res, 200, { brand_knowledge: updated[0] });
      }

      // ---------------------------------------------------------
      // DELETE: Remove a brand knowledge item
      // ---------------------------------------------------------
      case 'DELETE': {
        if (!auth.isStudioAdmin && auth.clientRole !== 'client_admin') {
          return sendJson(res, 403, { error: 'Forbidden: Only administrators can delete brand knowledge items.' });
        }

        if (!queryId) {
          return sendJson(res, 400, { error: 'Knowledge item ID is required for deletion.' });
        }

        const { data: existing, error: fetchErr } = await supabaseAdmin
          .from('brand_knowledge')
          .select('*')
          .eq('id', queryId)
          .single();

        if (fetchErr || !existing) {
          return sendJson(res, 404, { error: 'Brand knowledge item not found.' });
        }

        if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(existing.client_id)) {
          return sendJson(res, 403, { error: 'Forbidden: Cross-tenant deletion denied.' });
        }

        const { error: delErr } = await supabaseAdmin
          .from('brand_knowledge')
          .delete()
          .eq('id', queryId);

        if (delErr) throw delErr;

        await logAuditEvent(req, {
          clientId: existing.client_id,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'brand_knowledge.delete',
          resourceType: 'brand_knowledge',
          resourceId: queryId,
          details: { title: existing.title }
        });

        return sendJson(res, 200, { success: true, message: 'Brand knowledge item deleted.' });
      }

      default:
        res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
        return sendJson(res, 405, { error: `Method ${method} not allowed.` });
    }
  } catch (err) {
    return sendJson(res, 500, { error: `Brand Knowledge API error: ${err.message}` });
  }
}
