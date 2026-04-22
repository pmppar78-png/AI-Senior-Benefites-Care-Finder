#!/usr/bin/env node
/**
 * add-defer-to-scripts.cjs
 *
 * Adds `defer` to <script src="/affiliates.js"> and <script src="/script.js">
 * tags that lack it. These scripts are not render-critical and blocking the
 * parser on them hurts LCP / INP.
 *
 * Rules:
 *   - Match ONLY external-src script tags pointing at /affiliates.js or /script.js
 *     (absolute root-relative paths — no relative variants exist in this repo).
 *   - Skip tags that already have `defer` or `async` attributes.
 *   - Never touch inline scripts or other external scripts.
 *   - Idempotent: re-runs leave already-deferred files untouched.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

// Directories to skip. `engines/` is included so the template partial
// `engines/partials/footer.html` also gets defer added at the source.
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.netlify',
  'netlify',
  'scripts',
]);

function* walkHtml(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkHtml(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

// Match the opening <script ...> tag that references /affiliates.js or /script.js.
// Captures the attributes portion so we can inspect for existing defer/async.
// NB: this regex only matches the opening tag, not inline script bodies.
const SCRIPT_TAG_RE = /<script\b([^>]*\bsrc=["'](?:\/(?:affiliates|script))\.js["'][^>]*)>/gi;

function transform(html) {
  return html.replace(SCRIPT_TAG_RE, (full, attrs) => {
    // Already has defer or async — leave untouched.
    if (/\b(defer|async)\b/i.test(attrs)) return full;
    // Insert ` defer` just before the closing `>`. Preserve self-close if any.
    const trimmed = attrs.replace(/\s+$/, '');
    return `<script${trimmed} defer>`;
  });
}

function main() {
  let scanned = 0;
  let modified = 0;
  for (const file of walkHtml(REPO_ROOT)) {
    scanned++;
    const original = fs.readFileSync(file, 'utf8');
    const next = transform(original);
    if (next !== original) {
      fs.writeFileSync(file, next, 'utf8');
      modified++;
    }
  }
  console.log(
    `[add-defer-to-scripts] scanned ${scanned} html files, modified ${modified}`
  );
}

main();
