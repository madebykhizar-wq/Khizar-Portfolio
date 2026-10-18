import { getSupabaseAdmin } from '../_utils/supabase-admin.js';
import { verifyStudioAccess } from '../_utils/tenant.js';
import { sendJson, parseJsonBody } from '../_utils/auth.js';
import { logAuditEvent } from '../_utils/audit.js';

const REGULATORY_DISCLAIMER =
  'LEGAL & REGULATORY NOTICE: This packaging design brief and specification matrix is generated for creative, structural, and pre-production scoping purposes only. Final packaging artwork, dielines, barcoding (UPC/EAN/GS1), net quantity declarations, allergen callouts, nutrition facts, and jurisdictional regulatory statements must be independently validated by certified regulatory, legal, and pre-press specialists prior to commercial die-cutting or plate production.';

/**
 * Deterministic Studio Strategy Engine (Brand-Knowledge Grounded Fallback)
 * Produces structured, highly professional packaging intelligence when Gemini key is offline.
 */
function generateDeterministicRAGBrief({ sku, clientName, brandKnowledge, customContext }) {
  const dims = sku.dimensions || {};
  const dimStr = (dims.width_mm || dims.height_mm || dims.depth_mm)
    ? `${dims.width_mm || 0}W × ${dims.height_mm || 0}H × ${dims.depth_mm || 0}D ${dims.unit || 'mm'}`
    : 'Dimensions pending structural dieline confirmation';

  const claimsList = Array.isArray(sku.claims) && sku.claims.length ? sku.claims : ['Premium Quality', 'Studio Engineered'];

  // Categorize brand knowledge items
  const colorRules = brandKnowledge.filter(k => k.knowledge_type === 'color_palette').map(k => `${k.title}: ${k.content}`);
  const typographyRules = brandKnowledge.filter(k => k.knowledge_type === 'typography').map(k => `${k.title}: ${k.content}`);
  const regulatoryRules = brandKnowledge.filter(k => k.knowledge_type === 'regulatory_mandate').map(k => `${k.title}: ${k.content}`);
  const generalGuidelines = brandKnowledge.filter(k => !['color_palette', 'typography', 'regulatory_mandate'].includes(k.knowledge_type)).map(k => `${k.title}: ${k.content}`);

  return {
    strategy_executive_summary: `Comprehensive packaging intelligence for ${sku.name} (${sku.sku_code || 'SKU'}), engineered for ${clientName || 'Brand Workspace'}. This brief synthesizes the structural realities of ${sku.pack_format || 'custom packaging'} with ${brandKnowledge.length} active brand knowledge guidelines to ensure shelf dominance, preflight readiness, and compliance integrity.`,
    brand_positioning_and_narrative: {
      positioning_statement: `Sophisticated, high-retention visual architecture designed for modern retail and unboxing excellence.`,
      target_audience_matrix: sku.target_market ? `Target demographic in ${sku.target_market} demanding premium craftsmanship and sustainable transparency.` : `Discerning lifestyle and luxury consumers prioritizing material tactile quality.`,
      brand_voice_alignment: generalGuidelines.length ? generalGuidelines.slice(0, 2).join(' | ') : `Authoritative, modern, minimalist, and detail-oriented.`
    },
    visual_hierarchy_and_aesthetic_direction: {
      color_system: colorRules.length ? colorRules.join('; ') : `Primary brand base with metallic or spot UV accentuation; strict adherence to brand standards.`,
      typography_hierarchy: typographyRules.length ? typographyRules.join('; ') : `Primary display serif/grotesque for product hero title, paired with clean geometric sans-serif for regulatory and ingredient disclosures.`,
      finishes_and_treatments: sku.materials ? `${sku.materials}; matte soft-touch lamination recommended for tactile shelf grip.` : `Soft-touch aqueous coating with subtle debossed logo mark.`
    },
    structural_and_dieline_specifications: {
      pack_format: sku.pack_format || 'Custom Folding Carton / Rigid Box',
      engineered_dimensions: dimStr,
      substrate_recommendation: sku.materials || '350gsm FSC-Certified Virgin White SBS Board with tear-resistant grain alignment.',
      dieline_preflight_checklist: [
        'Ensure minimum 3mm external bleed around all trim cutlines',
        'Keep typography and critical barcode elements at least 4mm inside die-creases',
        'Verify die crease scores account for caliper thickness and fiber fold direction',
        'Vector vector layers separated into CUT, CREASE, BLEED, and ARTWORK spot color channels'
      ]
    },
    claims_and_compliance_matrix: {
      declared_claims: claimsList,
      mandatory_regulatory_callouts: regulatoryRules.length ? regulatoryRules : [
        'Net weight / fill volume declaration in lower 30% of primary display panel',
        'Recycling symbol & material code identifier on bottom closure flap',
        'Distributor/Brand registered address and country of origin mark'
      ],
      barcode_specifications: {
        code: sku.barcode_upc || 'Pending GS1 Allocation',
        format: 'UPC-A / EAN-13 vector symbol (100% SC2 scale, dark ink on solid white knock-out background)'
      }
    },
    grounded_brand_guidelines_applied: brandKnowledge.map(k => ({
      title: k.title,
      type: k.knowledge_type,
      applied_directive: k.content
    })),
    disclaimer: REGULATORY_DISCLAIMER
  };
}

/**
 * Studio OS — Retrieval-Augmented Brief Generation Handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed. Use POST to generate a brand-grounded brief.' });
  }

  // 1. Enforce Authentication First
  const auth = await verifyStudioAccess(req, null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const body = await parseJsonBody(req);
  const skuId = body.sku_id;
  let clientId = body.client_id;

  const supabaseAdmin = getSupabaseAdmin();

  // If sku_id is provided, resolve SKU and its client_id
  let skuRecord = null;
  if (skuId) {
    const { data: fetchedSku, error: skuErr } = await supabaseAdmin
      .from('skus')
      .select('*')
      .eq('id', skuId)
      .single();

    if (skuErr || !fetchedSku) {
      return sendJson(res, 404, { error: 'SKU not found.' });
    }
    skuRecord = fetchedSku;
    clientId = fetchedSku.client_id;
  }

  if (!clientId) {
    return sendJson(res, 400, { error: 'client_id or sku_id is required.' });
  }

  // 2. Enforce Tenant Scope Permissions
  if (!auth.isStudioAdmin && !auth.allowedClientIds.includes(clientId)) {
    return sendJson(res, 403, { error: 'Forbidden: Access to this client workspace is denied.' });
  }

  try {
    // 3. Resolve Client Info
    const { data: clientData } = await supabaseAdmin
      .from('clients')
      .select('name, slug')
      .eq('id', clientId)
      .single();
    const clientName = clientData?.name || 'Client Workspace';

    // 4. Retrieve Active Brand Knowledge (RAG step)
    let knowledgeQuery = supabaseAdmin
      .from('brand_knowledge')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (skuRecord?.brand_id || body.brand_id) {
      knowledgeQuery = knowledgeQuery.or(`brand_id.eq.${skuRecord?.brand_id || body.brand_id},brand_id.is.null`);
    }

    const { data: knowledgeItems } = await knowledgeQuery;
    const brandKnowledge = knowledgeItems || [];

    // Synthesize SKU object if not fetched directly
    const targetSku = skuRecord || {
      name: body.product_name || 'New Packaging Concept',
      sku_code: body.sku_code || 'SKU-NEW',
      pack_format: body.pack_format || 'Box / Carton',
      category: body.category || 'Packaging Design',
      dimensions: body.dimensions || { width_mm: 0, height_mm: 0, depth_mm: 0, unit: 'mm' },
      materials: body.materials || '',
      claims: Array.isArray(body.claims) ? body.claims : [],
      barcode_upc: body.barcode_upc || '',
      target_market: body.target_market || ''
    };

    let brief = null;

    // 5. Dual-Engine Generation (Gemini 2.5 Flash if available, else Deterministic Studio Strategy)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const knowledgePromptContext = brandKnowledge.map(k => `[BRAND RULE: ${k.knowledge_type.toUpperCase()}] ${k.title}: ${k.content}`).join('\n');
        const dimensionsStr = `${targetSku.dimensions?.width_mm || 0}W × ${targetSku.dimensions?.height_mm || 0}H × ${targetSku.dimensions?.depth_mm || 0}D ${targetSku.dimensions?.unit || 'mm'}`;

        const prompt = `You are the lead packaging director at Made by Khizar AI Studio OS.
Synthesize a comprehensive, brand-grounded packaging design brief and preflight engineering specification for:
- Client: ${clientName}
- Product: ${targetSku.name} (${targetSku.sku_code})
- Packaging Format: ${targetSku.pack_format}
- Structural Dimensions: ${dimensionsStr}
- Materials / Substrate: ${targetSku.materials || 'Not specified'}
- Barcode / GTIN: ${targetSku.barcode_upc || 'Pending'}
- Declared Claims: ${targetSku.claims?.join(', ') || 'None'}
- Target Market: ${targetSku.target_market || 'General'}

CRITICAL: Ground all recommendations in the following ACTIVE BRAND KNOWLEDGE & GUIDELINES:
${knowledgePromptContext || 'No brand guidelines stored; apply high-end studio best practices.'}

Respond ONLY in valid, parseable JSON matching this exact structure:
{
  "strategy_executive_summary": "string",
  "brand_positioning_and_narrative": {
    "positioning_statement": "string",
    "target_audience_matrix": "string",
    "brand_voice_alignment": "string"
  },
  "visual_hierarchy_and_aesthetic_direction": {
    "color_system": "string",
    "typography_hierarchy": "string",
    "finishes_and_treatments": "string"
  },
  "structural_and_dieline_specifications": {
    "pack_format": "string",
    "engineered_dimensions": "string",
    "substrate_recommendation": "string",
    "dieline_preflight_checklist": ["string"]
  },
  "claims_and_compliance_matrix": {
    "declared_claims": ["string"],
    "mandatory_regulatory_callouts": ["string"],
    "barcode_specifications": {
      "code": "string",
      "format": "string"
    }
  }
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        const aiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          })
        });

        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          const rawText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            brief = JSON.parse(rawText);
            brief.grounded_brand_guidelines_applied = brandKnowledge.map(k => ({
              title: k.title,
              type: k.knowledge_type,
              applied_directive: k.content
            }));
            brief.disclaimer = REGULATORY_DISCLAIMER;
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini RAG synthesis fallback triggered:', geminiErr.message);
      }
    }

    // Fallback if Gemini unavailable or failed
    if (!brief) {
      brief = generateDeterministicRAGBrief({
        sku: targetSku,
        clientName,
        brandKnowledge,
        customContext: body.custom_context
      });
    }

    // 6. Log Attributable Audit Event
    await logAuditEvent(req, {
      clientId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'ai.generate_rag_brief',
      resourceType: 'sku',
      resourceId: skuId || 'custom',
      details: {
        product_name: targetSku.name,
        sku_code: targetSku.sku_code,
        grounded_knowledge_count: brandKnowledge.length
      }
    });

    return sendJson(res, 200, {
      brief,
      sku: targetSku,
      grounded_knowledge_count: brandKnowledge.length,
      engine: geminiApiKey ? 'gemini-2.5-flash-rag' : 'studio-strategy-rag'
    });
  } catch (err) {
    console.error('RAG brief error:', err);
    return sendJson(res, 500, { error: `Failed to generate brand brief: ${err.message}` });
  }
}
