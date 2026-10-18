import { getSupabaseAdmin } from './supabase-admin.js';

/**
 * Attributable Studio OS Audit Logger
 * Logs critical operations (SKU creation, updates, dieline uploads, status changes)
 * with user ID, email, IP address, and payload diffs.
 */
export async function logAuditEvent(req, {
  clientId = null,
  userId = null,
  userEmail = null,
  action,
  resourceType,
  resourceId = null,
  details = {}
}) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const clientIp = req
      ? (req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim()
      : 'internal';

    const payload = {
      client_id: clientId,
      user_id: userId,
      user_email: userEmail,
      action,
      resource_type: resourceType,
      resource_id: String(resourceId || ''),
      details: typeof details === 'object' ? details : { raw: details },
      ip_address: clientIp
    };

    const { error } = await supabaseAdmin.from('audit_logs').insert([payload]);
    if (error) {
      console.warn('Audit log write warning:', error.message);
    }
  } catch (err) {
    console.warn('Audit log service error:', err.message);
  }
}
