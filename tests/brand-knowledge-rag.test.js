import test from 'node:test';
import assert from 'node:assert/strict';
import brandKnowledgeHandler from '../api/studio/brand-knowledge.js';
import briefRagHandler from '../api/studio/brief-rag.js';

// Set test environment configuration
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
// Security & Authentication Gate Tests
// -------------------------------------------------------------

test('brandKnowledgeHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'GET', url: '/api/studio/brand-knowledge', headers: {} };
  const res = createMockRes();

  await brandKnowledgeHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('briefRagHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'POST', url: '/api/studio/brief-rag', headers: {}, body: { sku_id: '123' } };
  const res = createMockRes();

  await briefRagHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('briefRagHandler rejects non-POST requests with 405', async () => {
  const req = { method: 'GET', url: '/api/studio/brief-rag', headers: {} };
  const res = createMockRes();

  await briefRagHandler(req, res);

  assert.equal(res._status, 405);
  assert.match(res._body.error, /Method Not Allowed/i);
});

test('brandKnowledgeHandler rejects invalid Bearer token with 401', async () => {
  const req = {
    method: 'GET',
    url: '/api/studio/brand-knowledge',
    headers: { authorization: 'Bearer invalid-token-xyz' }
  };
  const res = createMockRes();

  await brandKnowledgeHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /token|session/i);
});

test('briefRagHandler rejects invalid Bearer token with 401', async () => {
  const req = {
    method: 'POST',
    url: '/api/studio/brief-rag',
    headers: { authorization: 'Bearer invalid-token-xyz' },
    body: { client_id: 'client-1' }
  };
  const res = createMockRes();

  await briefRagHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /token|session/i);
});
