#!/usr/bin/env node
/**
 * remove-gfonts-preconnect.cjs
 *
 * Removes dead-code Google Fonts preconnect / dns-prefetch <link> tags from
 * template-generated HTML pages.
 *
 * The site's CSS (style.css, engine.css) does NOT @import any Google Fonts
 * and uses system fonts only, so these preconnects are wasted connection
 * negotiations that hurt Core Web Vitals.
 *
 * Removes lines matching:
 *   <link rel="preconnect" href="https://fonts.gstatic.com" ...>
 *   <link rel="dns-prefetch" href="https://fonts.googleapis.com" ...>
 *   <link rel="preconnect" href="https://fonts.googleapis.com" ...>
 *   <link rel="dns-prefetch" href="https://fonts.gstatic.com" ...>
 *
 * Idempotent: re-running leaves already-clean files untouched.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

// Directories to skip entirely. NOTE: `engines/` is intentionally NOT
// skipped because `engines/partials/head.html` is the source-of-truth
// template that the page generator uses; if we don't clean it, the dead
// preconnects will reappear on the next build.
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.netlify',
  'netlify',
  'scripts',
]);

/**
 * Recursively walk a directory, yielding absolute paths to .html files.
 */
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

// Match a full line (including its leading whitespace and trailing newline)
// that is a <link> tag referencing fonts.googleapis.com or fonts.gstatic.com
// with rel=preconnect or rel=dns-prefetch.
// Only match lines whose sole purpose is the preconnect/dns-prefetch link,
// so we never damage adjacent tags.
const DEAD_LINK_RE = /^[ \t]*<link\b[^>]*\brel=["'](?:preconnect|dns-prefetch)["'][^>]*\bhref=["']https?:\/\/fonts\.(?:googleapis|gstatic)\.com[^"']*["'][^>]*\/?>[ \t]*\r?\n/gim;
const DEAD_LINK_RE_ATTR_ORDER = /^[ \t]*<link\b[^>]*\bhref=["']https?:\/\/fonts\.(?:googleapis|gstatic)\.com[^"']*["'][^>]*\brel=["'](?:preconnect|dns-prefetch)["'][^>]*\/?>[ \t]*\r?\n/gim;

function processFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original.replace(DEAD_LINK_RE, '');
  next = next.replace(DEAD_LINK_RE_ATTR_ORDER, '');
  if (next !== original) {
    fs.writeFileSync(file, next, 'utf8');
    return true;
  }
  return false;
}

function main() {
  let scanned = 0;
  let modified = 0;
  for (const file of walkHtml(REPO_ROOT)) {
    scanned++;
    if (processFile(file)) modified++;
  }
  console.log(
    `[remove-gfonts-preconnect] scanned ${scanned} html files, modified ${modified}`
  );
}

main();
