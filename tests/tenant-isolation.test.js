import test from 'node:test';
import assert from 'node:assert/strict';
import clientsHandler from '../api/studio/clients.js';
import skusHandler from '../api/studio/skus.js';
import auditHandler from '../api/studio/audit.js';
import filesHandler from '../api/studio/files.js';
// Set test env variables if not set
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key';
process.env.ADMIN_EMAIL = 'admin@example.com';

function createMockRes() {
  return {
    _status: 200,
    _headers: {},
    _body: null,
    setHeader(key, value) {
      this._headers[key] = value;
      return this;
    },
    status(code) {
      this._status = code;
      return this;
    },
    json(data) {
      this._body = data;
      return this;
    },
    writeHead(code, headers) {
      this._status = code;
      Object.assign(this._headers, headers);
      return this;
    },
    end(data) {
      if (typeof data === 'string') {
        try {
          this._body = JSON.parse(data);
        } catch {
          this._body = data;
        }
      }
      return this;
    }
  };
}

// -------------------------------------------------------------
// Unauthenticated Rejection Tests
// -------------------------------------------------------------

test('clientsHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'GET', url: '/api/studio/clients', headers: {} };
  const res = createMockRes();

  await clientsHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('skusHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'GET', url: '/api/studio/skus', headers: {} };
  const res = createMockRes();

  await skusHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('auditHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'GET', url: '/api/studio/audit', headers: {} };
  const res = createMockRes();

  await auditHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('filesHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'GET', url: '/api/studio/files?path=client-1/general/doc.pdf', headers: {} };
  const res = createMockRes();

  await filesHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('clientsHandler rejects invalid Bearer token with 401', async () => {
  const req = {
    method: 'GET',
    url: '/api/studio/clients',
    headers: { authorization: 'Bearer invalid-token-sample' }
  };
  const res = createMockRes();

  await clientsHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('skusHandler rejects invalid Bearer token with 401', async () => {
  const req = {
    method: 'POST',
    url: '/api/studio/skus',
    headers: { authorization: 'Bearer invalid-token-sample', 'content-type': 'application/json' },
    body: { client_id: 'client-123', name: 'Test SKU', sku_code: 'TEST-1' }
  };
  const res = createMockRes();

  await skusHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('filesHandler rejects invalid token on signed URL generation with 401', async () => {
  const req = {
    method: 'GET',
    url: '/api/studio/files?path=client-a/sku-1/dieline.pdf',
    headers: { authorization: 'Bearer bad.token.here' }
  };
  const res = createMockRes();

  await filesHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('auditHandler rejects invalid token with 401', async () => {
  const req = {
    method: 'GET',
    url: '/api/studio/audit?client_id=client-1',
    headers: { authorization: 'Bearer bad.token.here' }
  };
  const res = createMockRes();

  await auditHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

