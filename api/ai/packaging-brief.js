import { sendJson, parseJsonBody } from '../utils/auth.js';

// In-memory sliding window rate limiter
// Limits each IP to 5 requests per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map();

function isRateLimited(clientIp) {
  const now = Date.now();
  const timestamps = (ipRequestHistory.get(clientIp) || []).filter(
    ts => now - ts < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(clientIp, timestamps);
    const oldestTimestamp = timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { limited: true, retryAfterSeconds };
  }

  timestamps.push(now);
  ipRequestHistory.set(clientIp, timestamps);

  // Periodic cleanup if map grows large
  if (ipRequestHistory.size > 10000) {
    for (const [ip, tsList] of ipRequestHistory.entries()) {
      const valid = tsList.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) ipRequestHistory.delete(ip);
      else ipRequestHistory.set(ip, valid);
    }
  }

  return { limited: false };
}

function sanitizeString(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Strip angle brackets
    .trim()
    .slice(0, maxLength);
}

function sanitizeClaims(claims) {
  if (Array.isArray(claims)) {
    return claims.map(c => sanitizeString(String(c), 60)).filter(Boolean).slice(0, 8);
  }
  if (typeof claims === 'string') {
    return claims
      .split(/[,;\n]/)
      .map(c => sanitizeString(c, 60))
      .filter(Boolean)
      .slice(0, 8);
  }
  return [];
}

const REGULATORY_DISCLAIMER =
  'This packaging intelligence brief is an AI-assisted creative strategy document produced by Made by Khizar Studio. It does not constitute formal legal, nutritional, weights-and-measures, barcode, or print-production certification. Consult local regulatory counsel and print packaging specialists prior to commercial manufacture.';

/**
 * Deterministic studio intelligence generator used when GEMINI_API_KEY is not set or as a resilient fallback
 */
function generateDeterministicStudioBrief(input) {
  const { productName, category, packFormat, marketRegion, priceTier, audience, claims, competitors } = input;
  const isPremium = /luxury|prestige|premium/i.test(priceTier);

  return {
    brief_id: `mbk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
    product_name: productName,
    category,
    pack_format: packFormat,
    market_region: marketRegion || 'Global / International',
    price_tier: priceTier || 'Mass Premium',
    executive_summary: `${productName} enters the ${category} landscape competing in the ${priceTier} segment. The packaging system must immediately communicate its core proposition while commanding shelf visual dominance through high-contrast structural discipline and tactile finish hierarchy.`,
    audience_analysis: {
      primary_persona: audience,
      purchase_drivers: [
        'Immediate visual credibility within 1.5 seconds of shelf scan',
        claims.length > 0 ? `Unambiguous front-of-pack validation: ${claims.slice(0, 2).join(' & ')}` : 'Clear differentiation from legacy category incumbents',
        isPremium ? 'Tactile cues that justify a price premium at unboxing' : 'Honest, accessible, and energetic design presence'
      ],
      shelf_touchpoints: [
        'Primary retail eye-level visual anchor (distance: 6–8 feet)',
        'Secondary hand-held inspection (distance: 12 inches — nutrition, claims, finish)',
        'E-commerce thumbnail clarity at 120px scale'
      ]
    },
    shelf_strategy: {
      visual_differentiation: `De-clutter the face panel relative to competitors ${competitors ? `like ${competitors}` : 'in the sector'}. Prioritize negative space and sculptural brandmark proportions over generic visual tropes.`,
      primary_color_strategy: isPremium
        ? 'Deep, muted architectural tones (warm charcoal, deep forest, or raw cream) paired with high-contrast micro-accents.'
        : 'High-chroma, saturated category disruption palette with deliberate contrast barriers.',
      typography_direction: 'Bespoke high-character logotype paired with an authoritative, hyper-legible geometric grotesque for hierarchy readability.',
      material_finish_recommendation: isPremium
        ? 'Matte soft-touch varnish with spot high-build UV and blind deboss on the hero mark.'
        : 'Recyclable FSC-certified uncoated stock with water-based flexo inks.'
    },
    pdp_hierarchy: [
      {
        level: 1,
        element: 'Brandmark / Logotype',
        purpose: 'Establish immediate brand recognition and memory recall within 0.5s.',
        visual_treatment: 'Dominates top 35% of the primary display panel with uncompromised clearspace.'
      },
      {
        level: 2,
        element: 'Product Descriptor & Key Claims',
        purpose: `Instantly articulate what the product is (${category}) and why to choose it.`,
        visual_treatment: claims.length
          ? `Secondary display typography anchored with concise claim badges: ${claims.join(', ')}.`
          : 'High-legibility centered descriptor with clean letter-spacing.'
      },
      {
        level: 3,
        element: 'Volume / Net Weight & Regulatory Base Bar',
        purpose: 'Provide required regulatory weights & measures at base of pack without distracting from hero elements.',
        visual_treatment: 'Clean base-grounded baseline in legal minimum point size.'
      }
    ],
    mandatory_pack_checklist: [
      { item: 'Net Quantity / Net Weight', category: 'Weights & Measures', detail: 'Must be placed in lower 30% of PDP in legal point size.' },
      { item: 'Country of Origin & Manufacturer Address', category: 'Compliance', detail: 'Back-of-pack or side gusset placement.' },
      { item: 'Ingredient & Nutritional Panel / Facts', category: 'Regulatory', detail: `Formatted to target market standards (${marketRegion || 'Target jurisdiction'}).` },
      { item: 'Batch Code, Best-Before & Universal Barcode', category: 'Production', detail: 'Reserve a minimum 32mm × 24mm quiet zone with high-contrast print.' },
      { item: 'Recycling & Material Identification Codes', category: 'Environmental', detail: 'Display applicable Mobius loop and resin identification icons.' }
    ],
    technical_risks_to_resolve: [
      {
        risk: 'Substrate & Ink Absorption Variations',
        impact: 'Color shifts between digital proof and physical press run on chosen format.',
        recommendation: 'Request physical ink drawdowns on exact target stock prior to cylinder engraving.'
      },
      {
        risk: 'Die-Line Crease & Gusset Bleeds',
        impact: 'Key graphic elements encroaching into fold or seal areas.',
        recommendation: 'Maintain minimum 4mm safety margin from all score and cut lines.'
      }
    ],
    studio_creative_angle: 'Packaging is a physical sculpture in consumer space. Rather than treating packaging as a label pasted on a box, Made by Khizar crafts every angle as a holistic, sensory unboxing journey that converts casual browsers into brand evangelists.',
    disclaimer: REGULATORY_DISCLAIMER
  };
}

export default async function handler(req, res) {
  // Method Check
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method Not Allowed. Use POST for packaging brief generation.' });
  }

  // Rate Limiting
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1')
    .split(',')[0]
    .trim();

  const { limited, retryAfterSeconds } = isRateLimited(clientIp);
  if (limited) {
    res.setHeader('Retry-After', String(retryAfterSeconds || 60));
    return sendJson(res, 429, {
      error: `Rate limit reached. Please wait ${retryAfterSeconds || 60} seconds before generating another brief.`
    });
  }

  // Parse Body
  let body;
  try {
    body = await parseJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON payload in request body.' });
  }

  // Validate Required Fields
  const productName = sanitizeString(body.product_name || body.productName, 100);
  const category = sanitizeString(body.category, 80);
  const packFormat = sanitizeString(body.pack_format || body.packFormat, 80);
  const targetAudience = sanitizeString(body.target_audience || body.targetAudience, 250);
  const marketRegion = sanitizeString(body.market_region || body.marketRegion, 80) || 'Global / International';
  const priceTier = sanitizeString(body.price_tier || body.priceTier, 50) || 'Mass Premium';
  const claims = sanitizeClaims(body.key_claims || body.claims);
  const competitors = sanitizeString(body.competitors_or_inspiration || body.competitors, 150);

  if (!productName || productName.length < 2) {
    return sendJson(res, 400, { error: 'Product name is required (minimum 2 characters).' });
  }
  if (!category || category.length < 2) {
    return sendJson(res, 400, { error: 'Product category is required (minimum 2 characters).' });
  }
  if (!packFormat || packFormat.length < 2) {
    return sendJson(res, 400, { error: 'Packaging format is required (e.g. Glass Bottle, Stand-Up Pouch, Carton).' });
  }
  if (!targetAudience || targetAudience.length < 2) {
    return sendJson(res, 400, { error: 'Target audience description is required.' });
  }

  const cleanInput = {
    productName,
    category,
    packFormat,
    marketRegion,
    priceTier,
    audience: targetAudience,
    claims,
    competitors
  };

  const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();

  // If Gemini API Key is available, invoke Gemini 2.5 Flash with structured JSON
  if (geminiApiKey) {
    try {
      const prompt = `You are the Executive Brand Identity & Print Packaging Design Strategist for Made by Khizar Studio.
Generate a structured, professional, commercially sharp packaging intelligence brief in JSON for this product:

PRODUCT NAME: "${cleanInput.productName}"
CATEGORY: "${cleanInput.category}"
PACKAGING FORMAT: "${cleanInput.packFormat}"
TARGET MARKET: "${cleanInput.marketRegion}"
PRICE TIER: "${cleanInput.priceTier}"
TARGET AUDIENCE: "${cleanInput.audience}"
KEY CLAIMS: ${cleanInput.claims.length ? cleanInput.claims.join(', ') : 'None specified'}
COMPETITORS / INSPIRATION: ${cleanInput.competitors || 'Standard category peers'}

Return a single JSON object with EXACTLY this structure:
{
  "executive_summary": "High-impact 2-3 sentence strategic overview of the packaging opportunity",
  "audience_analysis": {
    "primary_persona": "Summary of buyer mindset and behavior",
    "purchase_drivers": ["3 clear reasons they pick this pack up"],
    "shelf_touchpoints": ["3 retail or digital shelf touchpoint requirements"]
  },
  "shelf_strategy": {
    "visual_differentiation": "Specific advice on breaking category visual conventions",
    "primary_color_strategy": "Color strategy recommendation and psychology",
    "typography_direction": "Type hierarchy and aesthetic direction recommendation",
    "material_finish_recommendation": "Specific tactile finishes (e.g. soft-touch, spot UV, hot foil, emboss)"
  },
  "pdp_hierarchy": [
    { "level": 1, "element": "Top element (usually Logotype/Hero Mark)", "purpose": "Strategic purpose", "visual_treatment": "Design execution note" },
    { "level": 2, "element": "Second element (e.g. Product Name & Descriptor)", "purpose": "Strategic purpose", "visual_treatment": "Design execution note" },
    { "level": 3, "element": "Third element (e.g. Key Claims or Origin)", "purpose": "Strategic purpose", "visual_treatment": "Design execution note" }
  ],
  "mandatory_pack_checklist": [
    { "item": "Required element name", "category": "Legal/Compliance/Production", "detail": "Placement and technical guidance" },
    { "item": "Required element name", "category": "Legal/Compliance/Production", "detail": "Placement and technical guidance" },
    { "item": "Required element name", "category": "Legal/Compliance/Production", "detail": "Placement and technical guidance" },
    { "item": "Required element name", "category": "Legal/Compliance/Production", "detail": "Placement and technical guidance" }
  ],
  "technical_risks_to_resolve": [
    { "risk": "Technical or production risk", "impact": "Effect if unaddressed", "recommendation": "How the designer/brand should de-risk" },
    { "risk": "Technical or production risk", "impact": "Effect if unaddressed", "recommendation": "How the designer/brand should de-risk" }
  ],
  "studio_creative_angle": "Khizar Studio's distinctive design perspective on turning this pack into a luxury/high-demand object"
}`;

      const aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (aiResponse.ok) {
        const aiJson = await aiResponse.json();
        const candidateText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          const fullBrief = {
            brief_id: `mbk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            created_at: new Date().toISOString(),
            product_name: cleanInput.productName,
            category: cleanInput.category,
            pack_format: cleanInput.packFormat,
            market_region: cleanInput.marketRegion,
            price_tier: cleanInput.priceTier,
            ...parsed,
            disclaimer: REGULATORY_DISCLAIMER
          };
          return sendJson(res, 200, { success: true, brief: fullBrief });
        }
      }
    } catch (error) {
      console.warn('Gemini AI call failed, falling back to studio engine:', error.message);
    }
  }

  // Graceful Studio Strategy Engine Fallback
  const fallbackBrief = generateDeterministicStudioBrief(cleanInput);
  return sendJson(res, 200, { success: true, brief: fallbackBrief });
}
