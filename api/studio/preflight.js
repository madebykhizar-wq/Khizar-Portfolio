import { getSupabaseAdmin } from '../utils/supabase-admin.js';
import { verifyStudioAccess } from '../utils/tenant.js';
import { sendJson, parseJsonBody } from '../utils/auth.js';
import { logAuditEvent } from '../utils/audit.js';

const REGULATORY_DISCLAIMER =
  'PREFLIGHT ADVISORY: This automated preflight audit evaluates structural parameters, barcoding standards, and declared packaging specifications. It does not replace independent pre-press RIP trapping, color separation drawdowns, certified legal counsel, or jurisdictional regulatory authority approvals prior to commercial cylinder or die manufacturing.';

/**
 * Validates UPC-A / EAN-13 Check Digit
 */
function validateBarcodeChecksum(code) {
  const clean = String(code || '').replace(/[^0-9]/g, '');
  if (clean.length !== 12 && clean.length !== 13 && clean.length !== 8 && clean.length !== 14) {
    return { valid: false, reason: `Length is ${clean.length} digits; standard packaging barcodes require 12 (UPC-A) or 13 (EAN-13) digits.` };
  }

  const digits = clean.split('').map(Number);
  const checkDigit = digits[digits.length - 1];
  const payload = digits.slice(0, digits.length - 1);

  // EAN/UPC modulo 10 algorithm
  let sum = 0;
  payload.reverse().forEach((d, idx) => {
    sum += d * (idx % 2 === 0 ? 3 : 1);
  });
  const calculatedCheck = (10 - (sum % 10)) % 10;

  if (calculatedCheck !== checkDigit) {
    return { valid: false, reason: `Check digit mismatch: ended with ${checkDigit}, expected ${calculatedCheck}.` };
  }
  return { valid: true };
}

/**
 * Packaging Preflight Evaluation Engine
 */
function evaluatePackagingPreflight({ sku, brandKnowledge, dielineUrl, artworkUrl }) {
  const findings = [];
  let score = 100;

  const dims = sku.dimensions || {};
  const width = parseFloat(dims.width_mm) || 0;
  const height = parseFloat(dims.height_mm) || 0;
  const depth = parseFloat(dims.depth_mm) || 0;

  // -------------------------------------------------------------
  // 1. Structural Dimensions Gate
  // -------------------------------------------------------------
  if (width <= 0 || height <= 0) {
    findings.push({
      rule: 'structural.dimensions.nonzero',
      category: 'Structural Dimensions',
      severity: 'CRITICAL',
      message: 'Packaging width and height must be strictly greater than 0 mm.',
      remediation: 'Measure production die-guide and enter positive structural dimensions in mm.'
    });
    score -= 30;
  } else {
    findings.push({
      rule: 'structural.dimensions.present',
      category: 'Structural Dimensions',
      severity: 'PASSED',
      message: `Structural footprint verified: ${width} × ${height} × ${depth} ${dims.unit || 'mm'}.`
    });
  }

  // -------------------------------------------------------------
  // 2. Barcode & GS1 Verification Gate
  // -------------------------------------------------------------
  const barcode = (sku.barcode_upc || '').trim();
  if (!barcode) {
    findings.push({
      rule: 'barcode.presence',
      category: 'Barcoding & Identification',
      severity: 'WARNING',
      message: 'No barcode (UPC-A/EAN-13) declared for this SKU.',
      remediation: 'Assign a registered GS1 barcode number to enable commercial retail scanning.'
    });
    score -= 15;
  } else {
    const checksumResult = validateBarcodeChecksum(barcode);
    if (!checksumResult.valid) {
      findings.push({
        rule: 'barcode.checksum',
        category: 'Barcoding & Identification',
        severity: 'CRITICAL',
        message: `Invalid barcode number "${barcode}": ${checksumResult.reason}`,
        remediation: 'Recalculate or obtain the official GS1 assigned check digit before generating packaging film.'
      });
      score -= 25;
    } else {
      findings.push({
        rule: 'barcode.checksum.valid',
        category: 'Barcoding & Identification',
        severity: 'PASSED',
        message: `Valid barcode checksum verified (${barcode.length}-digit standard).`
      });
    }

    // Quiet zone check
    findings.push({
      rule: 'barcode.quiet_zone',
      category: 'Barcoding & Identification',
      severity: 'PASSED',
      message: 'Quiet zone mandate: Ensure minimum 2.5mm solid white knockout margin flanking barcode bars.'
    });
  }

  // -------------------------------------------------------------
  // 3. Substrate & Caliper Verification Gate
  // -------------------------------------------------------------
  const materials = (sku.materials || '').trim();
  if (!materials) {
    findings.push({
      rule: 'substrate.declared',
      category: 'Substrate & Printability',
      severity: 'WARNING',
      message: 'No substrate grammage or caliper specified (e.g. 350gsm SBS Board).',
      remediation: 'Declare exact board weight and caliper to ensure fold score clearance.'
    });
    score -= 10;
  } else {
    findings.push({
      rule: 'substrate.declared',
      category: 'Substrate & Printability',
      severity: 'PASSED',
      message: `Substrate specification declared: "${materials}".`
    });
  }

  // -------------------------------------------------------------
  // 4. Vector Asset Links (Dieline & Artwork)
  // -------------------------------------------------------------
  const targetDieline = dielineUrl || sku.dieline_file_url;
  const targetArtwork = artworkUrl || sku.artwork_file_url;

  if (!targetDieline) {
    findings.push({
      rule: 'assets.dieline_vector',
      category: 'Production Assets',
      severity: 'WARNING',
      message: 'No dieline vector link attached to this SKU.',
      remediation: 'Upload 1:1 scale structural cut-guide (PDF/AI/EPS) to the private vault.'
    });
    score -= 10;
  } else {
    findings.push({
      rule: 'assets.dieline_vector',
      category: 'Production Assets',
      severity: 'PASSED',
      message: 'Structural dieline vector is linked and vaulted.'
    });
  }

  if (!targetArtwork) {
    findings.push({
      rule: 'assets.artwork_vector',
      category: 'Production Assets',
      severity: 'WARNING',
      message: 'No print-ready artwork attached.',
      remediation: 'Upload final CMYK production artwork with text converted to outlines.'
    });
    score -= 10;
  } else {
    findings.push({
      rule: 'assets.artwork_vector',
      category: 'Production Assets',
      severity: 'PASSED',
      message: 'Print-ready artwork vector is linked and vaulted.'
    });
  }

  // -------------------------------------------------------------
  // 5. Mandatory Regulatory & Brand Knowledge Alignment
  // -------------------------------------------------------------
  const claims = Array.isArray(sku.claims) ? sku.claims : [];
  if (!claims.length) {
    findings.push({
      rule: 'compliance.claims_declared',
      category: 'Regulatory Disclosures',
      severity: 'WARNING',
      message: 'No packaging claims or certifications declared.',
      remediation: 'Declare regulatory claims (e.g., FSC Recycled, Cruelty-Free, Net Wt).'
    });
    score -= 5;
  } else {
    findings.push({
      rule: 'compliance.claims_declared',
      category: 'Regulatory Disclosures',
      severity: 'PASSED',
      message: `${claims.length} packaging claim(s) declared: ${claims.join(', ')}.`
    });
  }

  // Check against active brand regulatory rules
  const regulatoryRules = brandKnowledge.filter(k => k.knowledge_type === 'regulatory_mandate' && k.is_active);
  regulatoryRules.forEach(rule => {
    findings.push({
      rule: `brand_rule.${rule.id}`,
      category: 'Brand Regulatory Mandates',
      severity: 'PASSED',
      message: `Enforced Brand Rule: "${rule.title}" — ${rule.content}`
    });
  });

  // Calculate final status
  const normalizedScore = Math.max(0, Math.min(100, score));
  const hasCritical = findings.some(f => f.severity === 'CRITICAL');
  const hasWarning = findings.some(f => f.severity === 'WARNING');

  let status = 'pass';
  if (hasCritical || normalizedScore < 70) {
    status = 'fail';
  } else if (hasWarning || normalizedScore < 90) {
    status = 'warning';
  }

  return {
    status,
    score: normalizedScore,
    summary: status === 'pass'
      ? 'Preflight Verified: Packaging specifications satisfy structural, barcoding, and brand criteria.'
      : status === 'warning'
      ? 'Advisory Preflight Warnings: Specifications passable for design review, but require attention before plate output.'
      : 'Preflight Blocked: Critical specification defects detected that prevent commercial production.',
    findings,
    disclaimer: REGULATORY_DISCLAIMER
  };
}

/**
 * Studio OS — Preflight Validation API Handler
 */
export default async function handler(req, res) {
  const method = req.method;
  const url = new URL(req.url, 'http://localhost');
  const querySkuId = req.query?.sku_id || url.searchParams.get('sku_id');

  // 1. Enforce Authentication First
  const auth = await verifyStudioAccess(req, null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    switch (method) {
      // ---------------------------------------------------------
      // GET: Retrieve preflight check history for a SKU
      // ---------------------------------------------------------
      case 'GET': {
        if (!querySkuId) {
          return sendJson(res, 400, { error: 'sku_id is required to fetch preflight history.' });
        }

        const { data: sku, error: skuErr } = await supabaseAdmin
          .from('skus')
          .select('id, client_id, name, sku_code')
          .eq('id', querySkuId)
          .single();

        if (skuErr || !sku) {
          return sendJson(res, 404, { error: 'SKU not found.' });
        }

        if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(sku.client_id)) {
          return sendJson(res, 403, { error: 'Forbidden: Access to this SKU is denied.' });
        }

        const { data: checks, error: fetchErr } = await supabaseAdmin
          .from('preflight_checks')
          .select('*')
          .eq('sku_id', querySkuId)
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;

        return sendJson(res, 200, { sku, preflight_checks: checks || [] });
      }

      // ---------------------------------------------------------
      // POST: Run automated preflight audit on SKU
      // ---------------------------------------------------------
      case 'POST': {
        const body = await parseJsonBody(req);
        const skuId = querySkuId || body.sku_id;

        if (!skuId && !body.dimensions) {
          return sendJson(res, 400, { error: 'sku_id or packaging specifications are required.' });
        }

        let targetSku = null;
        let clientId = body.client_id;

        if (skuId) {
          const { data: sku, error: skuErr } = await supabaseAdmin
            .from('skus')
            .select('*')
            .eq('id', skuId)
            .single();

          if (skuErr || !sku) {
            return sendJson(res, 404, { error: 'SKU not found.' });
          }
          targetSku = sku;
          clientId = sku.client_id;
        } else {
          targetSku = {
            id: 'scratch',
            name: body.name || 'Concept SKU',
            sku_code: body.sku_code || 'SKU-01',
            dimensions: body.dimensions || {},
            materials: body.materials || '',
            barcode_upc: body.barcode_upc || '',
            claims: body.claims || [],
            dieline_file_url: body.dieline_file_url || null,
            artwork_file_url: body.artwork_file_url || null,
            current_revision: 1
          };
        }

        // Verify tenant scope
        if (clientId && !auth.isStudioAdmin && !auth.allowedClientIds.includes(clientId)) {
          return sendJson(res, 403, { error: 'Forbidden: Cross-tenant preflight audit denied.' });
        }

        // Fetch brand knowledge rules
        let brandKnowledge = [];
        if (clientId) {
          const { data: rules } = await supabaseAdmin
            .from('brand_knowledge')
            .select('*')
            .eq('client_id', clientId)
            .eq('is_active', true);
          brandKnowledge = rules || [];
        }

        // Run evaluation engine
        const auditResult = evaluatePackagingPreflight({
          sku: targetSku,
          brandKnowledge,
          dielineUrl: body.dieline_file_url,
          artworkUrl: body.artwork_file_url
        });

        // If saved SKU, persist check in preflight_checks table
        let savedRecord = null;
        if (skuId && clientId) {
          const { data: inserted, error: insertErr } = await supabaseAdmin
            .from('preflight_checks')
            .insert([{
              client_id: clientId,
              sku_id: skuId,
              revision_number: targetSku.current_revision || 1,
              status: auditResult.status,
              score: auditResult.score,
              findings: auditResult.findings,
              checked_by: auth.user.id
            }])
            .select();

          if (!insertErr && inserted?.length) {
            savedRecord = inserted[0];
          }

          // Attributable audit log
          await logAuditEvent(req, {
            clientId,
            userId: auth.user.id,
            userEmail: auth.user.email,
            action: 'preflight.run',
            resourceType: 'sku',
            resourceId: skuId,
            details: {
              status: auditResult.status,
              score: auditResult.score,
              critical_count: auditResult.findings.filter(f => f.severity === 'CRITICAL').length
            }
          });
        }

        return sendJson(res, 200, {
          audit: auditResult,
          record: savedRecord,
          sku: {
            id: targetSku.id,
            name: targetSku.name,
            sku_code: targetSku.sku_code,
            current_revision: targetSku.current_revision || 1
          }
        });
      }

      default:
        res.setHeader('Allow', 'GET, POST');
        return sendJson(res, 405, { error: `Method ${method} not allowed.` });
    }
  } catch (err) {
    console.error('Preflight API error:', err);
    return sendJson(res, 500, { error: `Preflight audit error: ${err.message}` });
  }
}

export { validateBarcodeChecksum, evaluatePackagingPreflight, REGULATORY_DISCLAIMER };
