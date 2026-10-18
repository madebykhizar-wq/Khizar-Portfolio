import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAdmin } from '../api/_utils/auth.js';
import projectsHandler from '../api/admin/projects.js';
import clientBrandsHandler from '../api/admin/client-brands.js';
import uploadHandler from '../api/admin/upload.js';

// Helper mock for response
function createMockRes() {
  return {
    statusCode: null,
    headers: {},
    data: null,
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
      return this;
    },
    writeHead(code, headers) {
      this.statusCode = code;
      if (headers) {
        Object.entries(headers).forEach(([k, v]) => this.setHeader(k, v));
      }
      return this;
    },
    end(body) {
      this.data = body ? JSON.parse(body) : null;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.data = body;
    }
  };
}

test('verifyAdmin rejects request without Authorization header', async () => {
  const req = { headers: {} };
  const result = await verifyAdmin(req);
  assert.equal(result.status, 401);
  assert.match(result.error, /Missing or malformed Authorization header/i);
});

test('verifyAdmin rejects invalid Bearer token', async () => {
  // Set test env variables if not set
  process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key';
  process.env.ADMIN_EMAIL = 'admin@example.com';

  const req = { headers: { authorization: 'Bearer invalid.token.payload' } };
  const result = await verifyAdmin(req);
  assert.equal(result.status, 401);
  assert.match(result.error, /Invalid or expired session token/i);
});

test('projectsHandler rejects unauthenticated GET', async () => {
  const req = { method: 'GET', url: '/api/admin/projects', headers: {} };
  const res = createMockRes();

  await projectsHandler(req, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.data.error, /Unauthorized/i);
});

test('projectsHandler rejects unauthenticated POST', async () => {
  const req = { method: 'POST', url: '/api/admin/projects', headers: {}, body: { title: 'Test' } };
  const res = createMockRes();

  await projectsHandler(req, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.data.error, /Unauthorized/i);
});

test('clientBrandsHandler rejects unauthenticated request', async () => {
  const req = { method: 'GET', url: '/api/admin/client-brands', headers: {} };
  const res = createMockRes();

  await clientBrandsHandler(req, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.data.error, /Unauthorized/i);
});

test('uploadHandler rejects non-POST method', async () => {
  const req = { method: 'GET', url: '/api/admin/upload', headers: {} };
  const res = createMockRes();

  await uploadHandler(req, res);
  assert.equal(res.statusCode, 405);
  assert.match(res.data.error, /Method Not Allowed/i);
});

test('uploadHandler rejects unauthenticated upload attempt', async () => {
  const req = { method: 'POST', url: '/api/admin/upload', headers: { 'content-type': 'image/jpeg' } };
  const res = createMockRes();

  await uploadHandler(req, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.data.error, /Unauthorized/i);
});
