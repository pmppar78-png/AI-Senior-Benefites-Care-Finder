#!/usr/bin/env node
/**
 * rebuild-sitemap.js
 *
 * Scans the project root for every `index.html` and rewrites:
 *   - /sitemap.xml                       — sitemap index (or flat fallback)
 *   - /sitemap-<silo>.xml                — one per top-level silo
 *
 * Excludes .netlify, node_modules, .git, /404.html, /chat.html.
 *
 * lastmod is staggered per URL using a stable hash so URLs keep the same date
 * across re-runs. Dates spread across the 45 days ending 2026-04-22.
 *
 * Usage:
 *   node scripts/rebuild-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://seniorbenefitscarefinder.com';

// 45-day rolling window anchored on 2026-04-22 (today per audit context).
const LASTMOD_END = new Date('2026-04-22');
const LASTMOD_WINDOW_DAYS = 45;

const EXCLUDED_DIRS = new Set(['.netlify', 'node_modules', '.git', 'engines', 'scripts']);
// Exclude these html files (by basename) at the repo root only.
const EXCLUDED_ROOT_FILES = new Set(['404.html', 'chat.html']);

// Silo buckets. A URL is bucketed by its first path segment.
// Any first segment not listed here falls into 'trust'.
const SILO_MAP = {
  medicare: 'medicare',
  medicaid: 'medicaid',
  'assisted-living': 'assisted-living',
  'veterans-benefits': 'veterans',
  'social-security': 'social-security',
  'home-care': 'home-care',
  'prescription-assistance': 'prescription',
  'senior-legal': 'legal',
  'long-term-care': 'long-term-care',
  'low-income-programs': 'low-income',
  'disability-benefits': 'disability',
  providers: 'providers',
  compare: 'compare',
  tools: 'tools',
  // Everything else (about, contact, author, policies, informational) -> trust
};

const TRUST_SILO = 'trust';
const TRUST_SEGMENTS = new Set([
  'about', 'author', 'contact',
  'editorial-policy', 'privacy-policy', 'terms-of-use',
  'transparency', 'fact-checking', 'how-we-research',
  'medical-review-policy', 'sources-methodology', 'sitemap-guide',
  'caregiver-resources', 'senior-care-planning', 'senior-discounts',
  'senior-financial-assistance', 'senior-life-insurance',
  'medical-alert-systems', 'dental-vision-hearing', 'dual-eligible',
]);

function stableHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function lastmodForUrl(urlPath) {
  const hash = stableHash(urlPath);
  const offset = hash % LASTMOD_WINDOW_DAYS; // 0..44
  const d = new Date(LASTMOD_END.getTime() - offset * 86400000);
  return d.toISOString().split('T')[0];
}

function walk(dir, results) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith('.')) continue; // skip hidden
      walk(path.join(dir, entry.name), results);
    } else if (entry.isFile() && entry.name === 'index.html') {
      results.push(path.join(dir, 'index.html'));
    }
  }
  // Also pick up root-level non-index HTML? No — audit scope is directory pages.
}

function fileToUrlPath(absPath) {
  // Strip ROOT prefix, then drop trailing '/index.html'.
  let rel = absPath.substring(ROOT.length);
  if (!rel.startsWith('/')) rel = '/' + rel;
  // /foo/bar/index.html -> /foo/bar/
  rel = rel.replace(/\/index\.html$/, '/');
  if (rel === '') rel = '/';
  return rel;
}

function assignSilo(urlPath) {
  if (urlPath === '/') return TRUST_SILO;
  const firstSegment = urlPath.split('/').filter(Boolean)[0] || '';
  if (SILO_MAP[firstSegment]) return SILO_MAP[firstSegment];
  if (TRUST_SEGMENTS.has(firstSegment)) return TRUST_SILO;
  return TRUST_SILO;
}

function priorityFor(urlPath) {
  if (urlPath === '/') return '1.0';
  const segments = urlPath.split('/').filter(Boolean).length;
  if (segments <= 1) return '0.9';
  if (segments === 2) return '0.9';
  return '0.7';
}

function changefreqFor(urlPath) {
  if (urlPath === '/') return 'weekly';
  const segments = urlPath.split('/').filter(Boolean).length;
  if (segments <= 2) return 'weekly';
  return 'monthly';
}

function buildUrlsetXml(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const u of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${u.path}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  return xml;
}

function buildIndexXml(siloFiles, indexLastmod) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const f of siloFiles) {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/${f}</loc>\n`;
    xml += `    <lastmod>${indexLastmod}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }
  xml += '</sitemapindex>\n';
  return xml;
}

function main() {
  const files = [];
  walk(ROOT, files);

  // Build URL records, applying exclusions.
  const urlRecords = [];
  const seen = new Set();
  for (const abs of files) {
    const urlPath = fileToUrlPath(abs);
    // Skip root-level excluded html files. (Not applicable here since we
    // only collect index.html — chat.html and 404.html have their own path
    // and are skipped automatically. Still, guard against directories named
    // 'chat' or '404'.)
    const first = urlPath.split('/').filter(Boolean)[0] || '';
    if (first === 'chat' || first === '404') continue;
    if (seen.has(urlPath)) continue;
    seen.add(urlPath);
    urlRecords.push({
      path: urlPath,
      silo: assignSilo(urlPath),
      lastmod: lastmodForUrl(urlPath),
      priority: priorityFor(urlPath),
      changefreq: changefreqFor(urlPath),
    });
  }

  // Group by silo.
  const bySilo = {};
  for (const u of urlRecords) {
    if (!bySilo[u.silo]) bySilo[u.silo] = [];
    bySilo[u.silo].push(u);
  }

  // Sort each silo's URLs for stable output.
  for (const silo of Object.keys(bySilo)) {
    bySilo[silo].sort((a, b) => a.path.localeCompare(b.path));
  }

  // Ordered silos — keep deterministic ordering in the index.
  const SILO_ORDER = [
    'medicare', 'medicaid', 'assisted-living', 'veterans',
    'social-security', 'home-care', 'prescription', 'legal',
    'long-term-care', 'low-income', 'disability',
    'providers', 'compare', 'tools', 'trust',
  ];

  const siloFiles = [];
  // Compute stats.
  const stats = {};
  let total = 0;

  for (const silo of SILO_ORDER) {
    const list = bySilo[silo];
    if (!list || list.length === 0) continue;
    const filename = `sitemap-${silo}.xml`;
    const xml = buildUrlsetXml(list);
    fs.writeFileSync(path.join(ROOT, filename), xml, 'utf8');
    siloFiles.push(filename);
    stats[silo] = list.length;
    total += list.length;
  }

  // Pick up any silo that wasn't in SILO_ORDER (safety net).
  for (const silo of Object.keys(bySilo)) {
    if (SILO_ORDER.includes(silo)) continue;
    const list = bySilo[silo];
    const filename = `sitemap-${silo}.xml`;
    const xml = buildUrlsetXml(list);
    fs.writeFileSync(path.join(ROOT, filename), xml, 'utf8');
    siloFiles.push(filename);
    stats[silo] = list.length;
    total += list.length;
  }

  // Index lastmod = most recent date used in any silo.
  const indexLastmod = LASTMOD_END.toISOString().split('T')[0];
  const indexXml = buildIndexXml(siloFiles, indexLastmod);
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), indexXml, 'utf8');

  console.log('Sitemap rebuild complete.');
  console.log(`Total URLs: ${total}`);
  for (const silo of siloFiles) {
    const key = silo.replace(/^sitemap-/, '').replace(/\.xml$/, '');
    console.log(`  ${silo}: ${stats[key]} URLs`);
  }
  console.log(`Wrote ${siloFiles.length} silo sitemaps + 1 index (sitemap.xml).`);
}

main();
