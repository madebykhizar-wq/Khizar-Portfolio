import { getSupabaseAdmin } from '../_utils/supabase-admin.js';
import { verifyStudioAccess } from '../_utils/tenant.js';
import { sendJson } from '../_utils/auth.js';

/**
 * Studio OS — Attributable Audit Log API Handler
 * Returns immutable logs of actions taken within the tenant scope.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method Not Allowed. Use GET to view audit logs.' });
  }

  const url = new URL(req.url, 'http://localhost');
  const targetClientId = req.query?.client_id || url.searchParams.get('client_id');
  const limit = Math.min(100, Math.max(1, parseInt(req.query?.limit || url.searchParams.get('limit') || '50', 10)));

  // Enforce tenant authorization
  const auth = await verifyStudioAccess(req, targetClientId || null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (targetClientId) {
      query = query.eq('client_id', targetClientId);
    } else if (!auth.isStudioAdmin) {
      query = query.in('client_id', auth.allowedClientIds);
    }

    const { data: logs, error } = await query;
    if (error) throw error;

    return sendJson(res, 200, { audit_logs: logs || [] });
  } catch (err) {
    return sendJson(res, 500, { error: `Failed to retrieve audit logs: ${err.message}` });
  }
}
