import { getSupabaseAdmin } from './supabase-admin.js';

/**
 * Verifies that the incoming request contains a valid Supabase Auth JWT
 * belonging to an authorized studio admin.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<{ user?: import('@supabase/supabase-js').User, error?: string, status?: number }>}
 */
export async function verifyAdmin(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
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
    const hasAdminRole = user.app_metadata?.role === 'admin';

    // Verify authorized studio admin identity
    const isAuthorized = (adminEmail && userEmail === adminEmail) || hasAdminRole;

    if (!isAuthorized) {
      return {
        error: 'Forbidden: You do not have studio administrator privileges.',
        status: 403
      };
    }

    return { user };
  } catch (err) {
    return {
      error: `Authentication service error: ${err.message}`,
      status: 500
    };
  }
}

/**
 * Universal JSON response helper supporting both Vercel/Express and vanilla Node.js http
 */
export function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

/**
 * Universal JSON body parser supporting pre-parsed Vercel/Express bodies and raw streams
 */
export async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Malformed JSON payload');
  }
}
