import { getSupabaseAdmin } from '../_utils/supabase-admin.js';
import { verifyAdmin, sendJson, parseJsonBody } from '../_utils/auth.js';

/**
 * Privileged Client Brands API Handler
 * Handles CRUD operations for dynamic client logo marks.
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
      // GET: List all client brands
      // ---------------------------------------------------------
      case 'GET': {
        const { data, error } = await supabaseAdmin
          .from('client_brands')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        return sendJson(res, 200, { client_brands: data || [] });
      }

      // ---------------------------------------------------------
      // POST: Create a new client brand
      // ---------------------------------------------------------
      case 'POST': {
        const body = await parseJsonBody(req);
        if (!body.name || !String(body.name).trim()) {
          return sendJson(res, 400, { error: 'Brand name is required.' });
        }

        const payload = {
          name: String(body.name).trim(),
          sub: body.sub ? String(body.sub).trim() : '',
          logo_image_url: body.logo_image_url ? String(body.logo_image_url).trim() : '',
          sort_order: Number(body.sort_order) || 0
        };

        const { data, error } = await supabaseAdmin
          .from('client_brands')
          .insert([payload])
          .select();

        if (error) throw error;
        return sendJson(res, 201, { client_brand: data[0] });
      }

      // ---------------------------------------------------------
      // PATCH: Update an existing client brand
      // ---------------------------------------------------------
      case 'PATCH': {
        const body = await parseJsonBody(req);
        const targetId = queryId || body.id;

        if (!targetId) {
          return sendJson(res, 400, { error: 'Client brand ID is required for updates.' });
        }

        const { id: _, ...updateFields } = body;

        const { data, error } = await supabaseAdmin
          .from('client_brands')
          .update(updateFields)
          .eq('id', targetId)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          return sendJson(res, 404, { error: 'Client brand not found.' });
        }

        return sendJson(res, 200, { client_brand: data[0] });
      }

      // ---------------------------------------------------------
      // DELETE: Remove a client brand
      // ---------------------------------------------------------
      case 'DELETE': {
        const body = method === 'DELETE' ? await parseJsonBody(req).catch(() => ({})) : {};
        const targetId = queryId || body.id;

        if (!targetId) {
          return sendJson(res, 400, { error: 'Client brand ID is required for deletion.' });
        }

        const { error } = await supabaseAdmin
          .from('client_brands')
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
    return sendJson(res, 500, { error: err.message || 'Internal server error processing client brand.' });
  }
}
