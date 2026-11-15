#!/usr/bin/env node
/**
 * Adds crawlable city links to the hand-built (non-engine) state and city
 * pages, e.g. /medicare/part-d/<state>/ and /medicare/part-d/<state>/<city>/.
 * Before this, ~7,200 city pages had zero internal links pointing at them
 * (sitemap-only), which is why Google left most of them "Discovered - not
 * indexed". Idempotent: pages that already have id="city-guides" are skipped
 * (engine pages render that section from engines/partials/city-links.html).
 *
 * Runs on every Netlify build (see netlify.toml) after the generator.
 * Usage: node scripts/add-static-city-links.cjs [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');
const states = JSON.parse(fs.readFileSync(path.join(ROOT, 'engines/data/states.json'), 'utf8'));
const cities = JSON.parse(fs.readFileSync(path.join(ROOT, 'engines/data/top-cities.json'), 'utf8'));
const stateBySlug = Object.fromEntries(states.map(s => [s.slug, s]));
const cityName = (stateSlug, slug) => {
  const c = cities.find(x => x.slug === slug && x.stateSlug === stateSlug);
  if (c) return c.name;
  const abbr = (stateBySlug[stateSlug]?.abbr || 'zz').toLowerCase();
  return slug.replace(new RegExp(`-${abbr}$`), '').split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const hasPage = d => fs.existsSync(path.join(d, 'index.html'));
const subPages = d => fs.readdirSync(d, { withFileTypes: true })
  .filter(e => e.isDirectory() && hasPage(path.join(d, e.name))).map(e => e.name);

function label(stateDir, stateName) {
  const h = fs.readFileSync(path.join(stateDir, 'index.html'), 'utf8');
  const m = h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  let t = m ? decode(m[1].replace(/<[^>]+>/g, '').trim()) : '';
  t = t.replace(new RegExp(`\\s+(in|for)\\s+${stateName}.*$`, 'i'), '').trim();
  return t || 'Guides';
}

function insert(file, block) {
  const h = fs.readFileSync(file, 'utf8');
  if (h.includes('id="city-guides"')) return false;
  const i = h.lastIndexOf('</main>');
  if (i < 0) return false;
  if (!DRY) fs.writeFileSync(file, h.slice(0, i) + block + h.slice(i), 'utf8');
  return true;
}

let stateCount = 0, cityCount = 0;
for (const top of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!top.isDirectory() || top.name.startsWith('.') || ['engines', 'scripts', 'netlify', 'node_modules'].includes(top.name)) continue;
  const topDir = path.join(ROOT, top.name);
  for (const sub of fs.readdirSync(topDir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    const subDir = path.join(topDir, sub.name);
    for (const st of fs.readdirSync(subDir, { withFileTypes: true })) {
      if (!st.isDirectory() || !stateBySlug[st.name]) continue;
      const stateDir = path.join(subDir, st.name);
      if (!hasPage(stateDir)) continue;
      const s = stateBySlug[st.name];
      const kids = subPages(stateDir).sort((a, b) => cityName(s.slug, a).localeCompare(cityName(s.slug, b)));
      if (!kids.length) continue;
      const base = `/${top.name}/${sub.name}/${s.slug}/`;
      const lab = esc(label(stateDir, s.name));
      const link = slug => `        <a class="state-link" href="${base}${slug}/">${esc(cityName(s.slug, slug))}, ${s.abbr}</a>\n`;
      const stateBlock = `    <section class="related-section" id="city-guides">\n      <h2>${lab} by City in ${s.name}</h2>\n      <div class="state-grid">\n${kids.map(link).join('')}      </div>\n    </section>\n`;
      if (insert(path.join(stateDir, 'index.html'), stateBlock)) stateCount++;
      for (const c of kids) {
        const others = kids.filter(k => k !== c);
        if (!others.length) continue; // breadcrumb already links the state page
        const cityBlock = `    <section class="related-section" id="city-guides">\n      <h2>${lab} in Other ${s.name} Cities</h2>\n      <div class="state-grid">\n${others.map(link).join('')}        <a class="state-link" href="${base}">All of ${s.name}</a>\n      </div>\n    </section>\n`;
        if (insert(path.join(stateDir, c, 'index.html'), cityBlock)) cityCount++;
      }
    }
  }
}
console.log(`${DRY ? '[dry-run] ' : ''}city-link sections added: ${stateCount} state pages, ${cityCount} city pages`);
