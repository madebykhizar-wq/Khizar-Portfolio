import { getSupabaseAdmin } from './supabase-admin.js';

/**
 * Multi-Tenant Authorization Resolver
 * Verifies caller JWT and enforces strict tenant boundaries.
 * Guarantees that Client A users cannot query or mutate Client B data.
 *
 * @param {import('http').IncomingMessage} req
 * @param {string|null} targetClientId - Optional specific client_id being targeted
 * @returns {Promise<{
 *   user?: import('@supabase/supabase-js').User,
 *   isStudioAdmin?: boolean,
 *   allowedClientIds?: string[],
 *   clientRole?: string,
 *   error?: string,
 *   status?: number
 * }>}
 */
export async function verifyStudioAccess(req, targetClientId = null) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return {
      error: 'Unauthorized: Missing or malformed Authorization header.',
      status: 401
    };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return {
        error: 'Unauthorized: Invalid or expired session token.',
        status: 401
      };
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const isStudioAdmin = (adminEmail && userEmail === adminEmail) || user.app_metadata?.role === 'admin';

    // Studio Admin has global multi-tenant access across all clients
    if (isStudioAdmin) {
      return {
        user,
        isStudioAdmin: true,
        allowedClientIds: ['*'],
        clientRole: 'studio_admin'
      };
    }

    // Resolve client memberships for standard client users
    const { data: memberships, error: memberErr } = await supabaseAdmin
      .from('client_members')
      .select('client_id, role')
      .eq('user_id', user.id);

    if (memberErr) {
      return {
        error: `Failed to resolve tenant memberships: ${memberErr.message}`,
        status: 500
      };
    }

    const allowedClientIds = (memberships || []).map(m => m.client_id);

    // If request targets a specific client, verify membership strictly
    if (targetClientId) {
      const match = (memberships || []).find(m => String(m.client_id) === String(targetClientId));
      if (!match) {
        return {
          error: 'Forbidden: You do not have permission to access this client workspace.',
          status: 403
        };
      }
      return {
        user,
        isStudioAdmin: false,
        allowedClientIds,
        clientRole: match.role
      };
    }

    if (allowedClientIds.length === 0) {
      return {
        error: 'Forbidden: Your account is not assigned to any client workspace.',
        status: 403
      };
    }

    return {
      user,
      isStudioAdmin: false,
      allowedClientIds,
      clientRole: memberships[0]?.role || 'client_viewer'
    };

  } catch (err) {
    return {
      error: `Authentication service error: ${err.message}`,
      status: 500
    };
  }
}
