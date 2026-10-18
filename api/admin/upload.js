import crypto from 'node:crypto';
import { getSupabaseAdmin } from '../utils/supabase-admin.js';
import { verifyAdmin, sendJson } from '../utils/auth.js';

// Strict Allowlist for Media Formats
const ALLOWED_MIME_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/svg+xml', '.svg'],
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm']
]);

// Maximum File Size: 5 MB (5,242,880 bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Privileged Media Upload API Handler
 * Enforces MIME-type allowlists, 5 MB file size caps, and filename sanitization.
 * Requires: Authorization: Bearer <supabase_jwt>
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed. Use POST for uploads.' });
  }

  // 1. Enforce Server-Side Authorization
  const auth = await verifyAdmin(req);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 2. Determine Content-Type
  const rawContentType = (req.headers['content-type'] || '').toLowerCase().split(';')[0].trim();

  let fileBuffer = null;
  let mimeType = rawContentType;

  try {
    // A. Handle JSON base64 upload payload
    if (rawContentType === 'application/json') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const jsonBody = JSON.parse(Buffer.concat(chunks).toString('utf8'));

      if (!jsonBody.base64 || !jsonBody.contentType) {
        return sendJson(res, 400, { error: 'Missing base64 or contentType in JSON payload.' });
      }

      mimeType = String(jsonBody.contentType).toLowerCase().trim();
      fileBuffer = Buffer.from(jsonBody.base64, 'base64');
    } 
    // B. Handle Direct Binary Stream upload (Preferred from browser fetch)
    else {
      // Pre-check Content-Length header if present
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > MAX_FILE_SIZE) {
        return sendJson(res, 413, { error: 'File exceeds maximum allowed size of 5 MB.' });
      }

      const chunks = [];
      let totalBytes = 0;

      for await (const chunk of req) {
        totalBytes += chunk.length;
        if (totalBytes > MAX_FILE_SIZE) {
          return sendJson(res, 413, { error: 'File upload exceeds maximum allowed size of 5 MB.' });
        }
        chunks.push(chunk);
      }

      fileBuffer = Buffer.concat(chunks);
    }

    // 3. Validate MIME Type against Strict Allowlist
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return sendJson(res, 400, {
        error: `Unsupported file type "${mimeType}". Allowed types: ${Array.from(ALLOWED_MIME_TYPES.keys()).join(', ')}.`
      });
    }

    // 4. Validate Byte Size
    if (!fileBuffer || fileBuffer.length === 0) {
      return sendJson(res, 400, { error: 'Uploaded file is empty.' });
    }
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return sendJson(res, 413, { error: 'File exceeds maximum allowed size of 5 MB.' });
    }

    // 5. Generate Cryptographically Safe Unique Filename
    const extension = ALLOWED_MIME_TYPES.get(mimeType);
    const uniqueId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const filePath = `uploads/${uniqueId}${extension}`;

    // 6. Upload to Supabase Storage via Service-Role Client
    const { data, error } = await supabaseAdmin.storage
      .from('site-assets')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 7. Construct Public CDN URL
    const supabaseUrl = process.env.SUPABASE_URL.replace(/\/+$/, '');
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/site-assets/${filePath}`;

    return sendJson(res, 201, {
      success: true,
      url: publicUrl,
      path: filePath,
      size: fileBuffer.length,
      mimeType: mimeType
    });

  } catch (err) {
    return sendJson(res, 500, { error: `Upload processing failed: ${err.message}` });
  }
}
