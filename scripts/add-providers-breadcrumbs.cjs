#!/usr/bin/env node

/**
 * Adds BreadcrumbList JSON-LD to every index.html under three /providers/ subtrees:
 *   - memory-care-facilities
 *   - assisted-living-facilities
 *   - hospice-providers
 *
 * - Derives breadcrumb trail from directory path.
 * - Idempotent: skips any file that already contains "@type":"BreadcrumbList".
 * - Inserts the new <script type="application/ld+json"> block just before </head>.
 * - Reports counts added vs skipped.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const PROVIDERS_DIR = path.join(REPO_ROOT, 'providers');
const BASE_URL = 'https://seniorbenefitscarefinder.com';

const SUBTREES = [
  {
    slug: 'memory-care-facilities',
    label: 'Memory Care Facilities',
  },
  {
    slug: 'assisted-living-facilities',
    label: 'Assisted Living Facilities',
  },
  {
    slug: 'hospice-providers',
    label: 'Hospice Providers',
  },
];

// State slug -> display name (covers 50 states + DC).
const STATE_NAMES = {
  alabama: 'Alabama', alaska: 'Alaska', arizona: 'Arizona', arkansas: 'Arkansas',
  california: 'California', colorado: 'Colorado', connecticut: 'Connecticut',
  delaware: 'Delaware', florida: 'Florida', georgia: 'Georgia', hawaii: 'Hawaii',
  idaho: 'Idaho', illinois: 'Illinois', indiana: 'Indiana', iowa: 'Iowa',
  kansas: 'Kansas', kentucky: 'Kentucky', louisiana: 'Louisiana', maine: 'Maine',
  maryland: 'Maryland', massachusetts: 'Massachusetts', michigan: 'Michigan',
  minnesota: 'Minnesota', mississippi: 'Mississippi', missouri: 'Missouri',
  montana: 'Montana', nebraska: 'Nebraska', nevada: 'Nevada',
  'new-hampshire': 'New Hampshire', 'new-jersey': 'New Jersey',
  'new-mexico': 'New Mexico', 'new-york': 'New York',
  'north-carolina': 'North Carolina', 'north-dakota': 'North Dakota',
  ohio: 'Ohio', oklahoma: 'Oklahoma', oregon: 'Oregon', pennsylvania: 'Pennsylvania',
  'rhode-island': 'Rhode Island', 'south-carolina': 'South Carolina',
  'south-dakota': 'South Dakota', tennessee: 'Tennessee', texas: 'Texas',
  utah: 'Utah', vermont: 'Vermont', virginia: 'Virginia', washington: 'Washington',
  'west-virginia': 'West Virginia', wisconsin: 'Wisconsin', wyoming: 'Wyoming',
  'district-of-columbia': 'District of Columbia',
};

function toProperCase(slug) {
  if (!slug) return '';
  if (STATE_NAMES[slug]) return STATE_NAMES[slug];
  return slug
    .split('-')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function findIndexHtml(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findIndexHtml(full));
    } else if (entry.isFile() && entry.name === 'index.html') {
      out.push(full);
    }
  }
  return out;
}

function buildBreadcrumbList(filePath, subtree) {
  const rel = path.relative(PROVIDERS_DIR, filePath);
  const parts = rel.split(path.sep);
  // parts like: ['memory-care-facilities', 'california', 'anaheim', 'index.html']
  //          or ['memory-care-facilities', 'index.html']
  //          or ['memory-care-facilities', 'california', 'index.html']

  const items = [
    { name: 'Home', url: `${BASE_URL}/` },
    { name: 'Providers', url: `${BASE_URL}/providers/` },
    { name: subtree.label, url: `${BASE_URL}/providers/${subtree.slug}/` },
  ];

  // Drop the trailing 'index.html' to work with directory segments only.
  const dirParts = parts.slice(0, -1); // e.g. ['memory-care-facilities', 'california', 'anaheim']

  if (dirParts.length >= 2) {
    // state level
    const stateSlug = dirParts[1];
    items.push({
      name: toProperCase(stateSlug),
      url: `${BASE_URL}/providers/${subtree.slug}/${stateSlug}/`,
    });
  }
  if (dirParts.length >= 3) {
    // city level
    const stateSlug = dirParts[1];
    const citySlug = dirParts[2];
    items.push({
      name: toProperCase(citySlug),
      url: `${BASE_URL}/providers/${subtree.slug}/${stateSlug}/${citySlug}/`,
    });
  }

  const listItems = items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.url,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems,
  };
}

function alreadyHasBreadcrumb(html) {
  // Tolerate whitespace variations.
  return /"@type"\s*:\s*"BreadcrumbList"/.test(html);
}

function insertBreadcrumb(html, jsonLd) {
  const block =
    '<script type="application/ld+json">\n  ' +
    JSON.stringify(jsonLd, null, 2).replace(/\n/g, '\n  ') +
    '\n  </script>\n';
  const headCloseRe = /<\/head>/i;
  if (!headCloseRe.test(html)) return null;
  return html.replace(headCloseRe, `  ${block}</head>`);
}

function run() {
  let added = 0;
  let skipped = 0;
  let missingHead = 0;
  const skippedFiles = [];

  for (const subtree of SUBTREES) {
    const subtreeDir = path.join(PROVIDERS_DIR, subtree.slug);
    const files = findIndexHtml(subtreeDir);
    for (const file of files) {
      const html = fs.readFileSync(file, 'utf8');
      if (alreadyHasBreadcrumb(html)) {
        skipped++;
        continue;
      }
      const jsonLd = buildBreadcrumbList(file, subtree);
      const updated = insertBreadcrumb(html, jsonLd);
      if (!updated) {
        missingHead++;
        skippedFiles.push(file);
        continue;
      }
      fs.writeFileSync(file, updated, 'utf8');
      added++;
    }
  }

  console.log(`BreadcrumbList JSON-LD insertion complete.`);
  console.log(`  Added:   ${added}`);
  console.log(`  Skipped: ${skipped} (already had BreadcrumbList)`);
  if (missingHead > 0) {
    console.log(`  Missing </head>: ${missingHead}`);
    for (const f of skippedFiles) console.log(`    - ${f}`);
  }
}

run();
