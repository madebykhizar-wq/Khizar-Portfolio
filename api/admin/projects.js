import { getSupabaseAdmin } from '../utils/supabase-admin.js';
import { verifyAdmin, sendJson, parseJsonBody } from '../utils/auth.js';

/**
 * Privileged Portfolio Projects API Handler
 * Handles CRUD and reordering operations for studio administrators.
 * Requires: Authorization: Bearer <supabase_jwt>
 */
export default async function handler(req, res) {
  // Enforce server-side authorization
  const auth = await verifyAdmin(req);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const method = req.method;
  const url = new URL(req.url, 'http://localhost');
  const queryId = req.query?.id || url.searchParams.get('id');

  try {
    switch (method) {
      // ---------------------------------------------------------
      // GET: List all projects (including drafts / unpublished)
      // ---------------------------------------------------------
      case 'GET': {
        const { data, error } = await supabaseAdmin
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        return sendJson(res, 200, { projects: data || [] });
      }

      // ---------------------------------------------------------
      // POST: Create a new project
      // ---------------------------------------------------------
      case 'POST': {
        const body = await parseJsonBody(req);
        if (!body.title || !String(body.title).trim()) {
          return sendJson(res, 400, { error: 'Project title is required.' });
        }

        const projectPayload = {
          ...body,
          published: body.published !== undefined ? Boolean(body.published) : true
        };

        const { data, error } = await supabaseAdmin
          .from('projects')
          .insert([projectPayload])
          .select();

        if (error) throw error;
        return sendJson(res, 201, { project: data[0] });
      }

      // ---------------------------------------------------------
      // PATCH: Update an existing project or bulk reorder
      // ---------------------------------------------------------
      case 'PATCH': {
        const body = await parseJsonBody(req);

        // Bulk reorder support: body = { reorder: [{ id, sort_order }, ...] }
        if (Array.isArray(body.reorder)) {
          for (const item of body.reorder) {
            if (item.id && typeof item.sort_order === 'number') {
              await supabaseAdmin
                .from('projects')
                .update({ sort_order: item.sort_order })
                .eq('id', item.id);
            }
          }
          return sendJson(res, 200, { success: true, message: 'Projects reordered successfully.' });
        }

        const targetId = queryId || body.id;
        if (!targetId) {
          return sendJson(res, 400, { error: 'Project ID is required for updates.' });
        }

        // Clean payload of id field if present in body
        const { id: _, ...updateFields } = body;

        const { data, error } = await supabaseAdmin
          .from('projects')
          .update(updateFields)
          .eq('id', targetId)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          return sendJson(res, 404, { error: 'Project not found.' });
        }

        return sendJson(res, 200, { project: data[0] });
      }

      // ---------------------------------------------------------
      // DELETE: Remove a project
      // ---------------------------------------------------------
      case 'DELETE': {
        const body = method === 'DELETE' ? await parseJsonBody(req).catch(() => ({})) : {};
        const targetId = queryId || body.id;

        if (!targetId) {
          return sendJson(res, 400, { error: 'Project ID is required for deletion.' });
        }

        const { error } = await supabaseAdmin
          .from('projects')
          .delete()
          .eq('id', targetId);

        if (error) throw error;
        return sendJson(res, 200, { success: true, deletedId: targetId });
      }

      default: {
        res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
        return sendJson(res, 405, { error: `Method ${method} Not Allowed.` });
      }
    }
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Internal server error processing project.' });
  }
}
