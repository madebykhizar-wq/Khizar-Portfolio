import { getSupabaseAdmin } from '../_utils/supabase-admin.js';
import { verifyStudioAccess } from '../_utils/tenant.js';
import { sendJson, parseJsonBody } from '../_utils/auth.js';
import { logAuditEvent } from '../_utils/audit.js';

/**
 * Studio OS — Clients API Handler
 * Handles multi-tenant client workspace CRUD with role enforcement.
 */
export default async function handler(req, res) {
  const method = req.method;
  const url = new URL(req.url, 'http://localhost');
  const queryId = req.query?.id || url.searchParams.get('id');

  // Verify caller identity & tenant permissions
  const auth = await verifyStudioAccess(req, queryId || null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    switch (method) {
      // ---------------------------------------------------------
      // GET: List accessible clients
      // ---------------------------------------------------------
      case 'GET': {
        let query = supabaseAdmin.from('clients').select('*').order('name', { ascending: true });

        // If not studio admin, restrict query strictly to user's assigned client IDs
        if (!auth.isStudioAdmin) {
          query = query.in('id', auth.allowedClientIds);
        }

        if (queryId) {
          query = query.eq('id', queryId).single();
        }

        const { data, error } = await query;
        if (error) throw error;

        return sendJson(res, 200, { clients: queryId ? [data] : data || [] });
      }

      // ---------------------------------------------------------
      // POST: Create a new client workspace (Studio Admin Only)
      // ---------------------------------------------------------
      case 'POST': {
        if (!auth.isStudioAdmin) {
          return sendJson(res, 403, { error: 'Forbidden: Only Studio Administrators can create new client workspaces.' });
        }

        const body = await parseJsonBody(req);
        const name = (body.name || '').trim();
        const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

        if (!name || !slug) {
          return sendJson(res, 400, { error: 'Client name and unique slug are required.' });
        }

        const payload = {
          name,
          slug,
          contact_email: (body.contact_email || '').trim() || null
        };

        const { data, error } = await supabaseAdmin.from('clients').insert([payload]).select();
        if (error) throw error;

        const newClient = data[0];
        await logAuditEvent(req, {
          clientId: newClient.id,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'client.create',
          resourceType: 'client',
          resourceId: newClient.id,
          details: { name: newClient.name, slug: newClient.slug }
        });

        return sendJson(res, 201, { client: newClient });
      }

      // ---------------------------------------------------------
      // PATCH: Update client workspace (Studio Admin or client_admin)
      // ---------------------------------------------------------
      case 'PATCH': {
        const body = await parseJsonBody(req);
        const targetId = queryId || body.id;

        if (!targetId) {
          return sendJson(res, 400, { error: 'Client ID is required for updates.' });
        }

        if (!auth.isStudioAdmin && auth.clientRole !== 'client_admin') {
          return sendJson(res, 403, { error: 'Forbidden: Insufficient privileges to update client details.' });
        }

        const { id: _, ...updateFields } = body;
        const { data, error } = await supabaseAdmin
          .from('clients')
          .update({ ...updateFields, updated_at: new Date().toISOString() })
          .eq('id', targetId)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          return sendJson(res, 404, { error: 'Client not found.' });
        }

        await logAuditEvent(req, {
          clientId: targetId,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'client.update',
          resourceType: 'client',
          resourceId: targetId,
          details: updateFields
        });

        return sendJson(res, 200, { client: data[0] });
      }

      default: {
        res.setHeader('Allow', 'GET, POST, PATCH');
        return sendJson(res, 405, { error: `Method ${method} Not Allowed.` });
      }
    }
  } catch (err) {
    return sendJson(res, 500, { error: `Client operation failed: ${err.message}` });
  }
}
