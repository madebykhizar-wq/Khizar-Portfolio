import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.resolve(rootDir, 'public');

console.log('[build] Preparing static output in public/ ...');

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const filesToCopy = [
  'index.html',
  'work.html',
  'services.html',
  'about.html',
  'packaging-intelligence.html',
  'privacy.html',
  'terms.html',
  'refund-policy.html',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
];

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(outDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

const dirsToCopy = [
  'admin',
  'assets',
  'content',
  'css',
  'js',
  'projects',
];

for (const dir of dirsToCopy) {
  const src = path.join(rootDir, dir);
  const dest = path.join(outDir, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

console.log('[build] Static assets successfully assembled into public/.');
