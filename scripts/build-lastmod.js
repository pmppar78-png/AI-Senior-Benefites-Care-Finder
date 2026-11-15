#!/usr/bin/env node
/**
 * Writes engines/data/lastmod.json: { "/url/path/": "YYYY-MM-DD" } using the
 * last git commit that touched each page's index.html. The generator uses it
 * for truthful sitemap <lastmod> on hand-authored/static pages (engine pages
 * use CONTENT_DATE in engines/generator.js). Run after committing page edits:
 *   node scripts/build-lastmod.js && node engines/generator.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const log = execSync("git log --format=@%cs --name-only -- '*index.html'", { cwd: ROOT, maxBuffer: 1 << 30 }).toString();
const out = {};
let date = null;
for (const line of log.split('\n')) {
  if (line.startsWith('@')) { date = line.slice(1); continue; }
  if (!line.endsWith('index.html') || line.startsWith('engines/')) continue;
  const url = '/' + line.replace(/index\.html$/, '');
  if (!(url in out) && fs.existsSync(path.join(ROOT, line))) out[url] = date;
}
// Static state/city pages (/<topic>/<sub>/<state>/[city]/) get their city-link
// section injected at build time by scripts/add-static-city-links.cjs (added
// 2026-11-15), so their live content changed then even if the file did not.
const BUILD_LINKS_DATE = '2026-11-15';
const STATES = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'engines/data/states.json'), 'utf8')).map(s => s.slug));
for (const url of Object.keys(out)) {
  const seg = url.split('/').filter(Boolean);
  if (seg.length >= 3 && STATES.has(seg[2]) && out[url] < BUILD_LINKS_DATE) out[url] = BUILD_LINKS_DATE;
}
// Static pages whose figures are corrected at build time by
// scripts/apply-sourced-facts.cjs changed live on that script's date.
const { transform, SOURCED_FACTS_DATE } = require('./apply-sourced-facts.cjs');
for (const url of Object.keys(out)) {
  if (out[url] >= SOURCED_FACTS_DATE) continue;
  const rel = url.slice(1) + 'index.html';
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (transform(rel, html) !== html) out[url] = SOURCED_FACTS_DATE;
}
// Uncommitted edits count as today.
const today = new Date().toISOString().slice(0, 10);
const dirty = execSync('git status --porcelain', { cwd: ROOT, maxBuffer: 1 << 30 }).toString().split('\n');
for (const l of dirty) {
  const f = l.slice(3).trim();
  if (f.endsWith('index.html') && !f.startsWith('engines/')) out['/' + f.replace(/index\.html$/, '')] = today;
}
// Keep the file small: URLs dated CONTENT_DATE are omitted because the
// generator falls back to CONTENT_DATE for any URL not listed here.
const CONTENT_DATE = fs.readFileSync(path.join(ROOT, 'engines/generator.js'), 'utf8').match(/const CONTENT_DATE = '([\d-]+)'/)[1];
const sorted = Object.fromEntries(Object.keys(out).sort().filter(k => out[k] !== CONTENT_DATE).map(k => [k, out[k]]));
fs.writeFileSync(path.join(ROOT, 'engines/data/lastmod.json'), JSON.stringify(sorted, null, 0).replace(/,"/g, ',\n"') + '\n');
console.log(`lastmod.json: ${Object.keys(sorted).length} URLs dated before ${CONTENT_DATE}`);
