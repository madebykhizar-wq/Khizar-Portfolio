import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('robots.txt exists, allows search and AI search crawlers, and references sitemap.xml', () => {
  const robotsPath = path.join(rootDir, 'robots.txt');
  assert.ok(fs.existsSync(robotsPath), 'robots.txt must exist');
  const content = fs.readFileSync(robotsPath, 'utf8');

  assert.ok(content.includes('User-agent: *'), 'Must declare default user-agent');
  assert.ok(content.includes('Disallow: /admin/'), 'Must disallow admin area');
  assert.ok(content.includes('Disallow: /api/'), 'Must disallow private API routes');
  assert.ok(content.includes('OAI-SearchBot'), 'Must include OAI-SearchBot directive for ChatGPT search');
  assert.ok(content.includes('PerplexityBot'), 'Must include PerplexityBot directive');
  assert.ok(content.includes('Sitemap: https://madebykhizar.com/sitemap.xml'), 'Must declare sitemap location');
});

test('llms.txt exists and contains authoritative studio and services summary', () => {
  const llmsPath = path.join(rootDir, 'llms.txt');
  assert.ok(fs.existsSync(llmsPath), 'llms.txt must exist');
  const content = fs.readFileSync(llmsPath, 'utf8');

  assert.ok(content.includes('Made By Khizar'), 'Must include brand name');
  assert.ok(content.includes('Khizar Hayat'), 'Must include founder name');
  assert.ok(content.includes('Brand Identity Systems'), 'Must include Brand Identity service');
  assert.ok(content.includes('Packaging & Label Design'), 'Must include Packaging service');
  assert.ok(content.includes('Synvora'), 'Must include case study references');
  assert.ok(content.includes('BIOXY'), 'Must include case study references');
});

test('sitemap.xml exists, is valid XML, and includes all canonical pages & project case studies', () => {
  const sitemapPath = path.join(rootDir, 'sitemap.xml');
  assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist');
  const content = fs.readFileSync(sitemapPath, 'utf8');

  assert.ok(content.startsWith('<?xml'), 'Must start with XML declaration');
  assert.ok(content.includes('<urlset'), 'Must contain urlset root tag');
  assert.ok(content.includes('https://madebykhizar.com/'), 'Must contain home URL');
  assert.ok(content.includes('https://madebykhizar.com/services.html'), 'Must contain services URL');
  assert.ok(content.includes('https://madebykhizar.com/work.html'), 'Must contain work URL');
  assert.ok(content.includes('https://madebykhizar.com/about.html'), 'Must contain about URL');
  assert.ok(content.includes('https://madebykhizar.com/packaging-intelligence.html'), 'Must contain packaging intelligence URL');
  assert.ok(content.includes('https://madebykhizar.com/projects/synvora.html'), 'Must contain synvora project URL');
  assert.ok(content.includes('https://madebykhizar.com/projects/bioxy.html'), 'Must contain bioxy project URL');
  assert.ok(!content.includes('/admin/'), 'Sitemap must never include admin URLs');
  assert.ok(!content.includes('/api/'), 'Sitemap must never include api URLs');
});

const pagesToTest = [
  'index.html',
  'services.html',
  'work.html',
  'about.html',
  'packaging-intelligence.html',
  'privacy.html',
  'terms.html',
  'refund-policy.html',
  'projects/synvora.html',
  'projects/bioxy.html'
];

for (const pageRel of pagesToTest) {
  test(`${pageRel} has complete, crawlable metadata and valid JSON-LD schema`, () => {
    const fullPath = path.join(rootDir, pageRel);
    assert.ok(fs.existsSync(fullPath), `${pageRel} must exist`);
    const html = fs.readFileSync(fullPath, 'utf8');

    // Title & description checks
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    assert.ok(titleMatch && titleMatch[1].trim().length > 10, `${pageRel} must have a descriptive title`);

    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    assert.ok(descMatch && descMatch[1].trim().length > 30, `${pageRel} must have a compelling meta description`);

    // Canonical link check
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    assert.ok(canonicalMatch && canonicalMatch[1].startsWith('https://madebykhizar.com/'), `${pageRel} must have canonical link to https://madebykhizar.com/`);

    // Open Graph checks
    assert.ok(html.includes('og:title'), `${pageRel} must have og:title`);
    assert.ok(html.includes('og:description'), `${pageRel} must have og:description`);
    assert.ok(html.includes('og:image'), `${pageRel} must have og:image`);

    // JSON-LD schema check (if present on index, services, work, about, projects)
    const schemaMatches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
    if (pageRel !== 'privacy.html' && pageRel !== 'terms.html' && pageRel !== 'refund-policy.html') {
      assert.ok(schemaMatches.length > 0, `${pageRel} must contain JSON-LD schema`);
      for (const match of schemaMatches) {
        let parsed = null;
        assert.doesNotThrow(() => {
          parsed = JSON.parse(match[1]);
        }, `${pageRel} JSON-LD must be valid JSON`);
        assert.ok(parsed && parsed['@context'] === 'https://schema.org', `${pageRel} JSON-LD context must be https://schema.org`);
      }
    }
  });
}
