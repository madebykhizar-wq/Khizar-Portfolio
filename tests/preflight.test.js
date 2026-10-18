import test from 'node:test';
import assert from 'node:assert/strict';
import preflightHandler, {
  validateBarcodeChecksum,
  evaluatePackagingPreflight,
  REGULATORY_DISCLAIMER
} from '../api/studio/preflight.js';

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

test('preflightHandler rejects unauthenticated request with 401', async () => {
  const req = { method: 'POST', url: '/api/studio/preflight', headers: {}, body: { sku_id: '123' } };
  const res = createMockRes();

  await preflightHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Unauthorized/i);
});

test('preflightHandler rejects invalid Bearer token with 401', async () => {
  const req = {
    method: 'GET',
    url: '/api/studio/preflight?sku_id=123',
    headers: { authorization: 'Bearer invalid-token-xyz' }
  };
  const res = createMockRes();

  await preflightHandler(req, res);

  assert.equal(res._status, 401);
  assert.match(res._body.error, /Invalid or expired/i);
});

// -------------------------------------------------------------
// GS1 Barcode Modulo 10 Checksum Tests
// -------------------------------------------------------------

test('validateBarcodeChecksum passes valid 12-digit UPC-A', () => {
  // 012345678905:
  // Odd positions from right: 0, 8, 6, 4, 2, 0 -> sum = 20 * 3 = 60
  // Even positions from right: 9, 7, 5, 3, 1 -> sum = 25
  // Total = 85 -> (10 - (85 % 10)) % 10 = 5.
  const result = validateBarcodeChecksum('012345678905');
  assert.equal(result.valid, true);
});

test('validateBarcodeChecksum passes valid 13-digit EAN-13', () => {
  // Common valid EAN-13: 4006381333931 (Stabilo Point 88)
  const result = validateBarcodeChecksum('4006381333931');
  assert.equal(result.valid, true);
});

test('validateBarcodeChecksum rejects mismatched check digit', () => {
  const result = validateBarcodeChecksum('012345678909'); // Check digit is 9 instead of 5
  assert.equal(result.valid, false);
  assert.match(result.reason, /Check digit mismatch/i);
});

test('validateBarcodeChecksum rejects non-standard barcode lengths', () => {
  const result = validateBarcodeChecksum('12345');
  assert.equal(result.valid, false);
  assert.match(result.reason, /Length is 5 digits/i);
});

// -------------------------------------------------------------
// Packaging Preflight Evaluation Engine Tests
// -------------------------------------------------------------

test('evaluatePackagingPreflight flags zero/negative dimensions with CRITICAL severity and status fail', () => {
  const result = evaluatePackagingPreflight({
    sku: {
      dimensions: { width_mm: 0, height_mm: 0, depth_mm: 0 },
      barcode_upc: '012345678905'
    },
    brandKnowledge: []
  });

  assert.equal(result.status, 'fail');
  const dimFinding = result.findings.find(f => f.rule === 'structural.dimensions.nonzero');
  assert.ok(dimFinding);
  assert.equal(dimFinding.severity, 'CRITICAL');
});

test('evaluatePackagingPreflight flags invalid barcode checksum with CRITICAL severity', () => {
  const result = evaluatePackagingPreflight({
    sku: {
      dimensions: { width_mm: 120, height_mm: 200, depth_mm: 45 },
      barcode_upc: '999999999999' // Invalid check digit
    },
    brandKnowledge: []
  });

  assert.equal(result.status, 'fail');
  const barcodeFinding = result.findings.find(f => f.rule === 'barcode.checksum');
  assert.ok(barcodeFinding);
  assert.equal(barcodeFinding.severity, 'CRITICAL');
});

test('evaluatePackagingPreflight returns pass with 100 score for complete production specifications', () => {
  const result = evaluatePackagingPreflight({
    sku: {
      dimensions: { width_mm: 85, height_mm: 140, depth_mm: 35, unit: 'mm' },
      barcode_upc: '012345678905',
      materials: '350gsm SBS C1S Board',
      dieline_file_url: 'https://vault.supabase.co/dieline.pdf',
      artwork_file_url: 'https://vault.supabase.co/artwork.pdf',
      claims: ['100% Recyclable', 'Cruelty Free', 'Net Wt. 50g']
    },
    brandKnowledge: [
      {
        id: 'rule-1',
        knowledge_type: 'regulatory_mandate',
        is_active: true,
        title: 'FSC Certified Stock',
        content: 'FSC logo must appear on bottom panel.'
      }
    ]
  });

  assert.equal(result.status, 'pass');
  assert.equal(result.score, 100);
  assert.ok(result.findings.some(f => f.rule === 'brand_rule.rule-1'));
  assert.equal(result.disclaimer, REGULATORY_DISCLAIMER);
});
