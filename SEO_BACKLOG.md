# Made By Khizar (MBK) — SEO & Discovery Prioritized Backlog

**Last Updated:** October 20, 2026  
**Website:** https://madebykhizar.com/  
**Maintained By:** Khizar Hayat & Engineering Team  

This document tracks upcoming and ongoing technical, content, and conversion improvements prioritized by commercial impact and implementation effort.

---

## Priority 0 — Immediate Next Steps (Owner Action Required)

| Task | Category | Impact | Owner / Action |
| :--- | :--- | :--- | :--- |
| **Verify Google Search Console** | Crawl & Indexing | Critical | Sign in to [Google Search Console](https://search.google.com/search-console), add `https://madebykhizar.com/`, and submit `https://madebykhizar.com/sitemap.xml`. |
| **Verify Bing Webmaster Tools** | Crawl & Indexing | High | Import property from GSC into [Bing Webmaster Tools](https://www.bing.com/webmasters) and confirm sitemap submission. |
| **Mark Conversions in GA4** | Lead Attribution | High | In Google Analytics 4 (`G-Z4F0DLWNJM`) -> Admin -> Events, toggle `generate_lead` and `contact_whatsapp_click` as **Key Events** (Conversions). |
| **Cross-Link Behance to Standalone Case Studies** | Social & Discovery | High | In Behance project descriptions for Synvora, Bioxy, and Logofolio Vol. 1, add direct links to `https://madebykhizar.com/projects/synvora.html` and `https://madebykhizar.com/projects/bioxy.html`. |
| **Add Website Link on LinkedIn Profile** | Entity Authority | High | In Khizar's LinkedIn profile header, ensure the primary custom button points to `https://madebykhizar.com/`. |

---

## Priority 1 — High-Impact Content & AEO Opportunities

| Task | Scope | Impact | Details |
| :--- | :--- | :--- | :--- |
| **Authoritative FMCG Packaging Guide** | New Content | High | Publish a comprehensive guide on "How to Engineer Product Packaging for Maximum Retail Shelf Impact," covering PDP visual hierarchy, finish selection, and barcode compliance. |
| **Printer Dieline Preparation Guide** | Educational / Lead Magnet | Medium-High | Publish a technical guide explaining bleed formulas, vector trapping, knockout vs overprint, and Pantone matching for founders preparing for production runs. |
| **Verified Testimonial Additions** | Social Proof / CRO | High | When authentic written permissions are received from clients (e.g. Bioxy S.L., Pakson Boss, Synvora), add their quotes to `SITE_CONFIG.testimonials` in `js/config.js` to automatically display them in the dedicated social proof section. |

---

## Priority 2 — Long-Term Technical & Brand Authority

| Task | Scope | Impact | Details |
| :--- | :--- | :--- | :--- |
| **Packaging Intelligence Lead Capture** | Product / CRO | Medium | On `packaging-intelligence.html`, offer an optional "Email me this generated PDF brief" input to capture qualified packaging design leads. |
| **Local WebP Image Optimization** | Performance | Medium | For any high-resolution client project covers hosted locally in `assets/projects/`, generate responsive WebP variants with `srcset` for faster mobile load times. |
| **Press & Editorial Features** | Backlinks / PR | High | Submit standout packaging projects (e.g. Bioxy, Synvora) to packaging design blogs (Packaging of the World, World Packaging Design Society, Dieline Community). |

---

## Changelog & Completed Milestones
- **2026-10-20:** Full technical SEO, AEO, GEO, and CRO implementation completed:
  - Created 7 pre-rendered static case study pages in `projects/`.
  - Fixed empty DOM shells across all public pages with server-rendered semantic HTML.
  - Implemented valid Schema.org graphs (`Person`, `ProfessionalService`, `Service`, `FAQPage`, `CollectionPage`, `CreativeWork`, `BreadcrumbList`).
  - Added official `llms.txt` and enriched `robots.txt` for AI discovery bots.
  - Updated `sitemap.xml` with all 15 canonical URLs.
  - Added GA4 lead conversion tracking for inquiries, WhatsApp, and email interactions.
  - Automated project generation in `scripts/build.js` and added 54 passing automated tests in `tests/seo.test.js`.
