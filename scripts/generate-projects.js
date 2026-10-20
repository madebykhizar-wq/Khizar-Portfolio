import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const projectsDir = path.resolve(rootDir, 'projects');

const projectsDataPath = path.resolve(rootDir, 'content', 'projects.json');
if (!fs.existsSync(projectsDataPath)) {
  console.error('[generate-projects] content/projects.json not found!');
  process.exit(1);
}

const { projects } = JSON.parse(fs.readFileSync(projectsDataPath, 'utf8'));

if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateProjectHtml(p) {
  const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const title = `${p.title} — Brand & Packaging Case Study | Made by Khizar`;
  const rawDesc = p.description || p.caseStudy?.intro || `Explore the ${p.title} brand identity and design case study by Khizar Hayat (Made by Khizar).`;
  const description = rawDesc.replace(/\s+/g, ' ').trim().slice(0, 160);
  const canonicalUrl = `https://madebykhizar.com/projects/${slug}.html`;
  const previewImage = p.cover || p.thumbnail || 'https://madebykhizar.com/assets/my-photo.jpg';
  const fullPreviewImage = previewImage.startsWith('http') ? previewImage : `https://madebykhizar.com/${previewImage.replace(/^\/+/, '')}`;
  const services = Array.isArray(p.services) ? p.services : [p.tag || 'Brand Identity'];
  const year = p.year || '2026';
  const client = p.client || p.title;

  const introParagraphs = (p.caseStudy?.intro || p.description || '')
    .split(/\r?\n\s*\r?\n/)
    .map(para => para.trim())
    .filter(Boolean);

  const images = Array.isArray(p.images) && p.images.length ? p.images : [p.cover || p.thumbnail].filter(Boolean);

  const sections = Array.isArray(p.caseStudy?.sections) ? p.caseStudy.sections : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${canonicalUrl}#project`,
        "url": canonicalUrl,
        "name": p.title,
        "headline": `${p.title} — ${p.category || 'Brand Identity'} Case Study`,
        "description": description,
        "image": fullPreviewImage,
        "dateCreated": year,
        "genre": p.category || "Brand Identity",
        "keywords": services.join(", "),
        "creator": {
          "@type": "Person",
          "@id": "https://madebykhizar.com/#person",
          "name": "Khizar Hayat",
          "url": "https://madebykhizar.com/"
        },
        "publisher": {
          "@type": "ProfessionalService",
          "@id": "https://madebykhizar.com/#business",
          "name": "Made by Khizar",
          "url": "https://madebykhizar.com/"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://madebykhizar.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Selected Work",
            "item": "https://madebykhizar.com/work.html"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": p.title,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:site_name" content="Made by Khizar">
<meta property="og:image" content="${escapeHtml(fullPreviewImage)}">
<meta property="og:image:alt" content="${escapeHtml(p.title)} project showcase">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(fullPreviewImage)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="../assets/logo.svg">
<link rel="icon" type="image/png" sizes="48x48" href="../assets/favicon-48.png">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">
<link rel="apple-touch-icon" href="../assets/favicon-180.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700;800&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="../css/styles.css">
<style>
  .project-page {
    padding-top: clamp(80px, 12vh, 120px);
    padding-bottom: 80px;
  }
  .breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-soft);
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .breadcrumb-nav a {
    color: var(--text-soft);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .breadcrumb-nav a:hover {
    color: var(--accent);
  }
  .breadcrumb-sep {
    opacity: 0.4;
  }
  .project-hero-header {
    margin-bottom: 40px;
  }
  .project-hero-header h1 {
    font-size: clamp(34px, 5vw, 56px);
    line-height: 1.08;
    margin-bottom: 18px;
    font-weight: 800;
  }
  .project-meta-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 18px 0;
    border-top: 1px solid rgba(0,0,0,0.08);
    border-bottom: 1px solid rgba(0,0,0,0.08);
    margin-bottom: 36px;
    font-size: 14px;
  }
  html[data-theme="dark"] .project-meta-strip {
    border-color: rgba(255,255,255,0.08);
  }
  .project-meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .project-meta-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-soft);
    font-weight: 600;
  }
  .project-meta-val {
    font-weight: 600;
    color: var(--ink);
  }
  .project-gallery-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin: 40px 0;
  }
  .project-image-box {
    border-radius: 14px;
    overflow: hidden;
    background: var(--paper);
    border: 1px solid rgba(0,0,0,0.06);
  }
  html[data-theme="dark"] .project-image-box {
    border-color: rgba(255,255,255,0.06);
  }
  .project-image-box img {
    width: 100%;
    height: auto;
    display: block;
  }
  .project-story-block {
    margin: 48px 0;
  }
  .project-story-block h2 {
    font-size: clamp(22px, 3vw, 32px);
    margin-bottom: 14px;
  }
  .project-story-block p {
    font-size: 17px;
    line-height: 1.65;
    color: var(--text-soft);
    max-width: 760px;
  }
  .project-cta-card {
    background: var(--dark);
    color: #fff;
    border-radius: 18px;
    padding: clamp(32px, 5vw, 54px);
    margin-top: 64px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .project-cta-card h2 {
    color: #fff;
    font-size: clamp(26px, 3.5vw, 40px);
    line-height: 1.15;
    margin: 0;
  }
  .project-cta-card p {
    color: #b5c2ba;
    font-size: 17px;
    max-width: 600px;
    margin: 0;
  }
</style>
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
</head>
<body data-page="project-detail">

<a href="#main-content" class="skip-link">Skip to main content</a>

<header>
  <nav class="wrap" id="site-nav">
    <a href="../index.html" class="logo" aria-label="MadebyKhizar - Brand & Packaging Studio">
      <img src="../assets/logo.svg" alt="MadebyKhizar" class="logo-img">
      <span class="logo-text-group">
        <span class="logo-title">MadebyKhizar</span>
        <span class="logo-subtitle">Brand &amp; Packaging Studio</span>
      </span>
    </a>
    <div class="navlinks open">
      <div class="nav-menu">
        <a href="../work.html">Work</a>
        <a href="../services.html">Services</a>
        <a href="../about.html">About</a>
      </div>
      <div class="nav-actions">
        <a href="../index.html#contact" class="nav-cta-pill">
          <span class="nav-cta-text">Start a Project</span>
          <span class="nav-cta-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </nav>
</header>

<main id="main-content" class="project-page">
  <div class="wrap">
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <a href="../index.html">Home</a>
      <span class="breadcrumb-sep" aria-hidden="true">/</span>
      <a href="../work.html">Selected Work</a>
      <span class="breadcrumb-sep" aria-hidden="true">/</span>
      <span aria-current="page">${escapeHtml(p.title)}</span>
    </nav>

    <div class="project-hero-header">
      <p class="eyebrow">${escapeHtml(p.category)} · ${escapeHtml(p.tag)}</p>
      <h1>${escapeHtml(p.title)}</h1>
      <div class="project-intro-text">
        ${introParagraphs.map(pText => `<p style="font-size:19px;line-height:1.6;color:var(--text-soft);max-width:760px;margin-bottom:12px;">${escapeHtml(pText)}</p>`).join('')}
      </div>
    </div>

    <div class="project-meta-strip">
      <div class="project-meta-item">
        <span class="project-meta-label">Client</span>
        <span class="project-meta-val">${escapeHtml(client)}</span>
      </div>
      <div class="project-meta-item">
        <span class="project-meta-label">Year</span>
        <span class="project-meta-val">${escapeHtml(year)}</span>
      </div>
      <div class="project-meta-item">
        <span class="project-meta-label">Category</span>
        <span class="project-meta-val">${escapeHtml(p.category)}</span>
      </div>
      <div class="project-meta-item">
        <span class="project-meta-label">Deliverables</span>
        <span class="project-meta-val">${escapeHtml(services.join(', '))}</span>
      </div>
    </div>

    <div class="project-gallery-stack">
      ${images.map((imgUrl, idx) => `
        <figure class="project-image-box">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.title)} — visual presentation slide ${idx + 1}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async">
        </figure>
      `).join('')}
    </div>

    ${sections.map((sec, secIdx) => `
      <section class="project-story-block">
        ${sec.heading ? `<h2>${escapeHtml(sec.heading)}</h2>` : ''}
        ${sec.body ? `<p>${escapeHtml(sec.body)}</p>` : ''}
        ${Array.isArray(sec.images) && sec.images.length ? `
          <div class="project-gallery-stack" style="margin-top:24px;">
            ${sec.images.map((secImg, sIdx) => `
              <figure class="project-image-box">
                <img src="${escapeHtml(secImg)}" alt="${escapeHtml(sec.heading || p.title)} — image ${sIdx + 1}" loading="lazy" decoding="async">
              </figure>
            `).join('')}
          </div>
        ` : ''}
      </section>
    `).join('')}

    ${p.caseStudy?.testimonial?.quote ? `
      <div style="background:var(--paper);border-left:3px solid var(--accent);padding:28px 32px;border-radius:12px;margin:48px 0;">
        <blockquote style="font-size:20px;font-style:italic;margin-bottom:12px;color:var(--ink);">"${escapeHtml(p.caseStudy.testimonial.quote)}"</blockquote>
        <p style="font-weight:600;margin:0;color:var(--ink);">${escapeHtml(p.caseStudy.testimonial.name || '')} <span style="font-weight:400;color:var(--text-soft);">${escapeHtml(p.caseStudy.testimonial.role ? '— ' + p.caseStudy.testimonial.role : '')}</span></p>
      </div>
    ` : ''}

    <div class="project-cta-card">
      <h2>Building a brand in ${escapeHtml(p.category)}?</h2>
      <p>Let's design a coherent brand identity, packaging system, or product range that stands out on the shelf and scales effortlessly.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;">
        <a href="../index.html#contact" class="btn solid" style="background:#fff;color:#0B1F17;">Start a Project →</a>
        ${p.behanceLink ? `<a href="${escapeHtml(p.behanceLink)}" target="_blank" rel="noopener" class="btn outline" style="border-color:rgba(255,255,255,0.3);color:#fff;">View on Behance ↗</a>` : ''}
      </div>
    </div>
  </div>
</main>

<footer>
  <div class="wrap" id="site-footer">
    <span>© 2026 Made by Khizar. All rights reserved.</span>
    <span class="footer-brand"><img src="../assets/logo.svg" alt="" class="footer-logo">MADE BY KHIZAR</span>
    <nav class="footer-policies" aria-label="Policies">
      <a href="../privacy.html">Privacy</a>
      <a href="../terms.html">Terms</a>
      <a href="../refund-policy.html">Refund Policy</a>
      <a href="../sitemap.xml">Sitemap</a>
    </nav>
  </div>
</footer>

<script src="../js/config.js"></script>
<script src="../js/cookie-consent.js"></script>
</body>
</html>`;
}

console.log('[generate-projects] Generating static project pages...');
for (const p of projects) {
  const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const outPath = path.resolve(projectsDir, `${slug}.html`);
  const html = generateProjectHtml(p);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`  ✓ Generated projects/${slug}.html`);
}
console.log(`[generate-projects] Successfully created ${projects.length} static project pages.`);
