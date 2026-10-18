import crypto from 'node:crypto';
import { getSupabaseAdmin } from '../utils/supabase-admin.js';
import { verifyStudioAccess } from '../utils/tenant.js';
import { sendJson, parseJsonBody } from '../utils/auth.js';
import { logAuditEvent } from '../utils/audit.js';

const PRIVATE_VAULT_BUCKET = 'client-vault';
const MAX_VAULT_FILE_SIZE = 15 * 1024 * 1024; // 15 MB max for packaging vectors & dielines

const ALLOWED_VAULT_MIMES = new Set([
  'application/pdf',
  'application/illustrator',
  'application/postscript',
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/zip',
  'application/octet-stream' // For .ai / .eps packaging die-lines
]);

/**
 * Studio OS — Private Client Vault Files API
 * Enforces per-client access policies and issues short-lived cryptographic signed URLs.
 */
export default async function handler(req, res) {
  const method = req.method;
  const url = new URL(req.url, 'http://localhost');
  const queryClientId = req.query?.client_id || url.searchParams.get('client_id');
  const action = req.query?.action || url.searchParams.get('action') || (method === 'GET' ? 'sign' : 'upload');

  const auth = await verifyStudioAccess(req, queryClientId || null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    // ---------------------------------------------------------
    // GET / Action = sign: Generate short-lived signed URL
    // ---------------------------------------------------------
    if (method === 'GET' || action === 'sign') {
      const filePath = req.query?.path || url.searchParams.get('path');
      const expiresInSeconds = Math.min(3600, Math.max(60, parseInt(req.query?.expires || '900', 10))); // Default 15 mins

      if (!filePath) {
        return sendJson(res, 400, { error: 'File path parameter is required to generate a signed download URL.' });
      }

      // Security check: Verify that file path belongs to an allowed client
      const pathSegments = filePath.split('/');
      const fileOwnerClientId = pathSegments[0];

      if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(fileOwnerClientId)) {
        return sendJson(res, 403, { error: 'Forbidden: Cross-tenant file access blocked.' });
      }

      const { data, error } = await supabaseAdmin.storage
        .from(PRIVATE_VAULT_BUCKET)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) throw error;

      await logAuditEvent(req, {
        clientId: fileOwnerClientId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'file.sign_url',
        resourceType: 'file',
        resourceId: filePath
      });

      return sendJson(res, 200, { signedUrl: data.signedUrl, expiresInSeconds });
    }

    // ---------------------------------------------------------
    // POST / Action = upload: Secure upload to private client vault
    // ---------------------------------------------------------
    if (method === 'POST') {
      const rawContentType = (req.headers['content-type'] || '').toLowerCase().split(';')[0].trim();
      let fileBuffer = null;
      let mimeType = rawContentType;
      let clientId = queryClientId;
      let skuId = req.query?.sku_id || url.searchParams.get('sku_id') || 'general';
      let originalFilename = req.headers['x-filename'] || 'file.bin';

      if (rawContentType === 'application/json') {
        const body = await parseJsonBody(req);
        if (!body.base64 || !body.contentType || !body.clientId) {
          return sendJson(res, 400, { error: 'Missing base64, contentType, or clientId in JSON payload.' });
        }
        fileBuffer = Buffer.from(body.base64, 'base64');
        mimeType = String(body.contentType).toLowerCase().trim();
        clientId = body.clientId;
        skuId = body.skuId || skuId;
        originalFilename = body.filename || originalFilename;
      } else {
        const chunks = [];
        let total = 0;
        for await (const chunk of req) {
          total += chunk.length;
          if (total > MAX_VAULT_FILE_SIZE) {
            return sendJson(res, 413, { error: 'File exceeds maximum vault capacity of 15 MB.' });
          }
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
      }

      if (!clientId) {
        return sendJson(res, 400, { error: 'client_id is required for private vault storage.' });
      }

      // Enforce tenant boundary on upload
      if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(clientId)) {
        return sendJson(res, 403, { error: 'Forbidden: Cross-tenant vault upload denied.' });
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        return sendJson(res, 400, { error: 'Uploaded file is empty.' });
      }

      const ext = originalFilename.includes('.') ? originalFilename.split('.').pop().toLowerCase() : 'bin';
      const safeId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const vaultPath = `${clientId}/${skuId}/${safeId}.${ext}`;

      const { data, error } = await supabaseAdmin.storage
        .from(PRIVATE_VAULT_BUCKET)
        .upload(vaultPath, fileBuffer, {
          contentType: mimeType,
          upsert: false
        });

      if (error) throw error;

      await logAuditEvent(req, {
        clientId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'file.upload',
        resourceType: 'file',
        resourceId: vaultPath,
        details: { sizeBytes: fileBuffer.length, filename: originalFilename, mimeType }
      });

      return sendJson(res, 201, {
        success: true,
        path: vaultPath,
        bucket: PRIVATE_VAULT_BUCKET,
        size: fileBuffer.length
      });
    }

    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: `Method ${method} Not Allowed.` });

  } catch (err) {
    return sendJson(res, 500, { error: `Private vault error: ${err.message}` });
  }
}
