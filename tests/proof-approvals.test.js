import test from 'node:test';
import assert from 'node:assert/strict';
import proofsHandler, { generateDigitalSignature } from '../api/studio/proofs.js';

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

test('proofsHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'POST', url: '/api/studio/proofs', headers: {}, body: { sku_id: '123' } };
  const res = createMockRes();

  await proofsHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('proofsHandler rejects invalid Bearer token with 401', async () => {
  const req = {
    method: 'GET',
    url: '/api/studio/proofs?sku_id=123',
    headers: { authorization: 'Bearer invalid-token-xyz' }
  };
  const res = createMockRes();

  await proofsHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Invalid or expired/i);
});

test('proofsHandler rejects unsupported HTTP method with 405', async () => {
  const req = {
    method: 'DELETE',
    url: '/api/studio/proofs?sku_id=123',
    headers: {}
  };
  const res = createMockRes();

  await proofsHandler(req, res);

  // Auth runs first -> 401
  assert.equal(res._status, 401);
});

// -------------------------------------------------------------
// Digital Signature Cryptographic Verification Tests
// -------------------------------------------------------------

test('generateDigitalSignature produces deterministic 64-char hex SHA-256 digest', () => {
  const sig1 = generateDigitalSignature({
    skuId: 'sku-uuid-1234',
    revisionNumber: 2,
    status: 'approved',
    decisionBy: 'lead.designer@brand.com',
    timestamp: '2026-10-18T12:00:00.000Z'
  });

  const sig2 = generateDigitalSignature({
    skuId: 'sku-uuid-1234',
    revisionNumber: 2,
    status: 'approved',
    decisionBy: 'lead.designer@brand.com',
    timestamp: '2026-10-18T12:00:00.000Z'
  });

  assert.equal(typeof sig1, 'string');
  assert.equal(sig1.length, 64);
  assert.match(sig1, /^[0-9a-f]{64}$/);
  assert.equal(sig1, sig2, 'Signatures for identical payloads must match');
});

test('generateDigitalSignature detects alterations in revision or approver identity', () => {
  const sigA = generateDigitalSignature({
    skuId: 'sku-uuid-1234',
    revisionNumber: 1,
    status: 'approved',
    decisionBy: 'director@brand.com',
    timestamp: '2026-10-18T12:00:00.000Z'
  });

  const sigB = generateDigitalSignature({
    skuId: 'sku-uuid-1234',
    revisionNumber: 2, // Different revision
    status: 'approved',
    decisionBy: 'director@brand.com',
    timestamp: '2026-10-18T12:00:00.000Z'
  });

  const sigC = generateDigitalSignature({
    skuId: 'sku-uuid-1234',
    revisionNumber: 1,
    status: 'approved',
    decisionBy: 'unauthorized@brand.com', // Different actor
    timestamp: '2026-10-18T12:00:00.000Z'
  });

  assert.notEqual(sigA, sigB, 'Hash must change when revision bumps');
  assert.notEqual(sigA, sigC, 'Hash must change when approver changes');
});
