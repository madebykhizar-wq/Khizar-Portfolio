#!/usr/bin/env node

/**
 * =============================================================
 * MBK AI Studio OS — Secret Scanner (Local Pre-Commit / CI)
 * =============================================================
 * Scans the repository for accidental credentials, private keys,
 * service-role tokens, or legacy hardcoded secrets.
 *
 * NOTE: This tool NEVER outputs raw secrets. All values are redacted.
 * =============================================================
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Directories to ignore
const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  '.vercel',
  '.turbo',
  '.next',
  'dist',
  'build',
  'scratch',
  '.system_generated',
  '.user_uploaded'
]);

// Binary / non-text extensions to skip
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.pdf', '.mp4', '.webm', '.ttf', '.woff', '.woff2',
  '.zip', '.tar', '.gz', '.ai', '.psd', '.exe', '.dll'
]);

// Secret Rules definition
const RULES = [
  {
    id: 'PRIVATE_KEY',
    severity: 'CRITICAL',
    description: 'Private Key header detected (PEM format)',
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g
  },
  {
    id: 'GITHUB_PAT',
    severity: 'CRITICAL',
    description: 'GitHub Personal Access Token pattern detected',
    regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b/g
  },
  {
    id: 'OPENAI_API_KEY',
    severity: 'CRITICAL',
    description: 'OpenAI API key detected',
    regex: /\bsk-(?:proj-)?[a-zA-Z0-9-_]{32,}\b/g
  },
  {
    id: 'ANTHROPIC_API_KEY',
    severity: 'CRITICAL',
    description: 'Anthropic API key detected',
    regex: /\bsk-ant-[a-zA-Z0-9-_]{32,}\b/g
  },
  {
    id: 'GOOGLE_API_KEY',
    severity: 'CRITICAL',
    description: 'Google API key detected',
    regex: /\bAIzaSy[a-zA-Z0-9_-]{33}\b/g
  },
  {
    id: 'AWS_ACCESS_KEY',
    severity: 'CRITICAL',
    description: 'AWS Access Key ID detected',
    regex: /\bAKIA[0-9A-Z]{16}\b/g
  },
  {
    id: 'LEGACY_ADMIN_PASSWORD',
    severity: 'WARNING',
    description: 'Legacy hardcoded admin password / array detected (scheduled for removal in Phase D)',
    regex: /Khizar@Studio2026|ADMIN_PASS_HASH\s*=|validPasses\s*=\s*\[/g
  }
];

// Helper to inspect JWT role without exposing tokens
function inspectJwtRole(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.role || null;
  } catch {
    return null;
  }
}

// Check for JWTs (Supabase keys)
function scanJwtTokens(line, filePath, lineNum, findings) {
  const jwtRegex = /\beyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\b/g;
  let match;
  while ((match = jwtRegex.exec(line)) !== null) {
    const token = match[0];
    const role = inspectJwtRole(token);
    if (role === 'service_role') {
      findings.push({
        file: filePath,
        line: lineNum,
        ruleId: 'SUPABASE_SERVICE_ROLE_KEY',
        severity: 'CRITICAL',
        description: 'CRITICAL: Supabase service_role JWT key detected! This key bypasses RLS and must NEVER be public.'
      });
    } else if (role === 'anon') {
      findings.push({
        file: filePath,
        line: lineNum,
        ruleId: 'SUPABASE_ANON_KEY',
        severity: 'INFO',
        description: 'Supabase Public anonKey detected (Public client key used for RLS reads and Supabase Auth).'
      });
    }
  }
}

function scanFile(filePath, relativePath, findings) {
  // Check if file itself is an unignored env file with values
  if (relativePath.startsWith('.env') && relativePath !== '.env.example') {
    findings.push({
      file: relativePath,
      line: 1,
      ruleId: 'TRACKED_ENV_FILE',
      severity: 'CRITICAL',
      description: 'Environment file detected in workspace. Ensure it is not committed.'
    });
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return; // Skip unreadable
  }

  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Skip scanning .env.example or this scanner script itself
    if (relativePath === '.env.example' || relativePath === 'scripts/scan-secrets.js') return;

    // Check JWT tokens
    scanJwtTokens(line, relativePath, lineNum, findings);

    // Check standard rules
    for (const rule of RULES) {
      if (rule.regex.test(line)) {
        findings.push({
          file: relativePath,
          line: lineNum,
          ruleId: rule.id,
          severity: rule.severity,
          description: rule.description
        });
      }
      // Reset regex index for global regexes
      rule.regex.lastIndex = 0;
    }
  });
}

function walkDir(currentDir, findings, stats) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walkDir(fullPath, findings, stats);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!BINARY_EXTENSIONS.has(ext)) {
        stats.filesScanned++;
        scanFile(fullPath, relPath, findings);
      }
    }
  }
}

function run() {
  console.log('\n=============================================================');
  console.log('🔍 MBK AI Studio OS — Secret Scan');
  console.log('Scanning repository for credentials and exposed keys...');
  console.log('=============================================================\n');

  const findings = [];
  const stats = { filesScanned: 0 };

  walkDir(ROOT_DIR, findings, stats);

  console.log(`Scan completed: ${stats.filesScanned} text files inspected.\n`);

  const criticals = findings.filter(f => f.severity === 'CRITICAL');
  const warnings = findings.filter(f => f.severity === 'WARNING');
  const infos = findings.filter(f => f.severity === 'INFO');

  if (findings.length === 0) {
    console.log('✅ Clean scan! No credentials or sensitive patterns found.\n');
    process.exit(0);
  }

  console.log('Findings Summary:');
  console.log(`- 🚨 Critical: ${criticals.length}`);
  console.log(`- ⚠️  Warning:  ${warnings.length}`);
  console.log(`- ℹ️  Info:     ${infos.length}\n`);

  // Report Criticals
  if (criticals.length > 0) {
    console.log('🚨 CRITICAL FINDINGS (Action Required):');
    criticals.forEach(f => {
      console.log(`  [${f.ruleId}] ${f.file}:${f.line}`);
      console.log(`  → ${f.description}\n`);
    });
  }

  // Report Warnings
  if (warnings.length > 0) {
    console.log('⚠️  WARNING FINDINGS (Known Legacy Code):');
    warnings.forEach(f => {
      console.log(`  [${f.ruleId}] ${f.file}:${f.line}`);
      console.log(`  → ${f.description}\n`);
    });
  }

  // Report Infos
  if (infos.length > 0) {
    console.log('ℹ️  INFORMATIONAL (Expected Public Keys):');
    infos.forEach(f => {
      console.log(`  [${f.ruleId}] ${f.file}:${f.line}`);
      console.log(`  → ${f.description}\n`);
    });
  }

  // Exit code: 0 if no unapproved critical secrets exist
  if (criticals.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
