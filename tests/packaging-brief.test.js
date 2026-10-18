import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/ai/packaging-brief.js';

// Mock Response Helper
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

test('packagingBriefHandler rejects non-POST requests with 405', async () => {
  const req = { method: 'GET', headers: {} };
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res._status, 405);
  assert.match(res._body.error, /Method Not Allowed/i);
  assert.equal(res._headers['Allow'], 'POST');
});

test('packagingBriefHandler rejects missing product_name with 400', async () => {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: {
      category: 'Beverage',
      pack_format: 'Can',
      target_audience: 'Gen Z energy drink consumers'
    }
  };
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res._status, 400);
  assert.match(res._body.error, /Product name is required/i);
});

test('packagingBriefHandler rejects missing category with 400', async () => {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: {
      product_name: 'Veloce Cold Brew',
      pack_format: 'Glass Bottle',
      target_audience: 'Coffee enthusiasts'
    }
  };
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res._status, 400);
  assert.match(res._body.error, /Product category is required/i);
});

test('packagingBriefHandler rejects missing pack_format with 400', async () => {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: {
      product_name: 'Veloce Cold Brew',
      category: 'Ready to Drink Coffee',
      target_audience: 'Coffee enthusiasts'
    }
  };
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res._status, 400);
  assert.match(res._body.error, /Packaging format is required/i);
});

test('packagingBriefHandler rejects missing target_audience with 400', async () => {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: {
      product_name: 'Veloce Cold Brew',
      category: 'Ready to Drink Coffee',
      pack_format: 'Glass Bottle'
    }
  };
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res._status, 400);
  assert.match(res._body.error, /Target audience description is required/i);
});

test('packagingBriefHandler generates a valid, structured brief for valid inputs', async () => {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.100' },
    body: {
      product_name: 'Synvora Botanical Elixir',
      category: 'Functional Wellness Tonic',
      pack_format: 'Amber Glass Bottle with Embossed Label',
      market_region: 'United Kingdom / Europe',
      price_tier: 'Prestige / Luxury',
      target_audience: 'Health-conscious urban professionals seeking restorative evening alternatives',
      key_claims: ['Organic Reishi', 'No Added Sugar', 'Zero Alcohol'],
      competitors_or_inspiration: 'Kin Euphorics, Three Spirit'
    }
  };
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res._status, 200);
  assert.equal(res._body.success, true);
  const brief = res._body.brief;

  // Schema verification
  assert.ok(brief.brief_id);
  assert.equal(brief.product_name, 'Synvora Botanical Elixir');
  assert.equal(brief.category, 'Functional Wellness Tonic');
  assert.equal(brief.pack_format, 'Amber Glass Bottle with Embossed Label');
  assert.ok(brief.executive_summary);
  assert.ok(Array.isArray(brief.audience_analysis.purchase_drivers));
  assert.ok(brief.shelf_strategy.visual_differentiation);
  assert.ok(brief.shelf_strategy.material_finish_recommendation);
  assert.ok(Array.isArray(brief.pdp_hierarchy));
  assert.ok(brief.pdp_hierarchy.length >= 3);
  assert.ok(Array.isArray(brief.mandatory_pack_checklist));
  assert.ok(brief.mandatory_pack_checklist.length >= 3);
  assert.ok(Array.isArray(brief.technical_risks_to_resolve));
  assert.ok(brief.studio_creative_angle);

  // Disclaimer verification
  assert.match(brief.disclaimer, /creative strategy document/i);
  assert.match(brief.disclaimer, /not constitute formal legal/i);
});

test('packagingBriefHandler sanitizes input and strips dangerous markup', async () => {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.1.101' },
    body: {
      product_name: '<script>alert("hack")</script>Pure Elixir',
      category: '<b>Health Tonic</b>',
      pack_format: 'Pouch<style>body{color:red}</style>',
      target_audience: 'Curious consumers <script>'
    }
  };
  const res = createMockRes();

  await handler(req, res);

  assert.equal(res._status, 200);
  const brief = res._body.brief;
  assert.ok(!brief.product_name.includes('<script>'));
  assert.ok(!brief.category.includes('<b>'));
  assert.ok(!brief.pack_format.includes('<style>'));
});
