#!/usr/bin/env node
/**
 * Adds crawlable city links to the hand-built (non-engine) state and city
 * pages, e.g. /medicare/part-d/<state>/ and /medicare/part-d/<state>/<city>/.
 * Before this, ~7,200 city pages had zero internal links pointing at them
 * (sitemap-only), which is why Google left most of them "Discovered - not
 * indexed". Idempotent: pages that already have id="city-guides" are skipped
 * (engine pages render that section from engines/partials/city-links.html).
 *
 * The section goes just before the page's FAQ so the FAQ stays the last
 * content section (falls back to the end of <main> when a page has no FAQ).
 * Headings are short and topic-based ("SNAP help by city").
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
const hasPage = d => fs.existsSync(path.join(d, 'index.html'));
const subPages = d => fs.readdirSync(d, { withFileTypes: true })
  .filter(e => e.isDirectory() && hasPage(path.join(d, e.name))).map(e => e.name);

// Short topic names for the section headings, keyed by "<top>/<sub>".
const TOPICS = {
  'veterans-benefits/pension': 'VA pension help', 'veterans-benefits/health-care': 'VA health care guides',
  'veterans-benefits/aid-attendance': 'Aid & Attendance guides', 'social-security/survivors': 'Survivor benefit guides',
  'social-security/retirement-planning': 'Retirement planning guides', 'social-security/retirement': 'Social Security guides',
  'social-security/disability': 'SSDI guides', 'senior-legal/estate-planning': 'Estate planning guides',
  'senior-legal/elder-abuse': 'Elder abuse help', 'providers/rehabilitation-centers': 'Rehab center guides',
  'providers/nursing-homes': 'Nursing home guides', 'providers/memory-care-facilities': 'Memory care guides',
  'providers/hospice-providers': 'Hospice guides', 'providers/home-health-agencies': 'Home health guides',
  'providers/assisted-living-facilities': 'Assisted living guides', 'providers/adult-day-care': 'Adult day care guides',
  'prescription-assistance/programs': 'Prescription help', 'prescription-assistance/patient-assistance': 'Patient assistance guides',
  'prescription-assistance/discount-cards': 'Rx discount card guides', 'medicare/supplement-plans': 'Medigap guides',
  'medicare/supplement': 'Medicare Supplement guides', 'medicare/part-d': 'Part D guides', 'medicare/enrollment': 'Medicare enrollment guides',
  'medicare/eligibility': 'Medicare eligibility guides', 'medicare/advantage': 'Medicare Advantage guides',
  'medicaid/waiver-programs': 'Medicaid waiver guides', 'medicaid/spend-down': 'Spend-down guides',
  'medicaid/home-care-waivers': 'Home care waiver guides', 'medicaid/eligibility': 'Medicaid eligibility guides',
  'medicaid/application': 'Medicaid application help', 'low-income-programs/snap': 'SNAP help',
  'low-income-programs/liheap': 'Energy bill help', 'low-income-programs/housing-assistance': 'Housing help',
  'long-term-care/nursing-homes': 'Nursing home guides', 'long-term-care/medicaid-planning': 'Medicaid planning guides',
  'long-term-care/insurance': 'LTC insurance guides', 'home-care/services': 'Home care guides',
  'home-care/palliative': 'Palliative care guides', 'home-care/fall-prevention': 'Fall prevention guides',
  'home-care/cost': 'Home care cost guides', 'home-care/agencies': 'Home care agency guides',
  'disability-benefits/ssi': 'SSI guides', 'assisted-living/types': 'Assisted living guides',
  'assisted-living/respite-care': 'Respite care guides', 'assisted-living/memory-care': 'Memory care guides',
  'assisted-living/cost': 'Assisted living cost guides',
};
const topic = (top, sub) => TOPICS[`${top}/${sub}`] || 'City guides';

// Where the FAQ starts: a section/div whose id is "faq" or whose class has
// faq-block / faq-section, else an <h2> reading "FAQ" or "Frequently asked
// questions" (moving back to its <section> when the heading opens one).
function faqStart(h) {
  const box = /<(section|div)\b[^>]*(\bid="faq"|\bclass="[^"]*\bfaq(?:-block|-section)\b[^"]*")[^>]*>/i.exec(h);
  if (box) return box.index;
  const hd = /<h2[^>]*>\s*(?:FAQs?\b|Frequently Asked Questions)/i.exec(h);
  if (!hd) return -1;
  const before = h.slice(0, hd.index);
  const sec = /<section\b[^>]*>\s*$/i.exec(before);
  return sec ? sec.index : hd.index;
}

function insert(file, block) {
  const h = fs.readFileSync(file, 'utf8');
  if (h.includes('id="city-guides"')) return false;
  const end = h.lastIndexOf('</main>');
  if (end < 0) return false;
  const f = faqStart(h);
  const i = f > 0 && f < end ? f : end;
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
      const lab = esc(topic(top.name, sub.name));
      const link = slug => `        <a class="state-link" href="${base}${slug}/">${esc(cityName(s.slug, slug))}, ${s.abbr}</a>\n`;
      const stateBlock = `    <section class="related-section" id="city-guides">\n      <h2>${lab} by city</h2>\n      <div class="state-grid">\n${kids.map(link).join('')}      </div>\n    </section>\n`;
      if (insert(path.join(stateDir, 'index.html'), stateBlock)) stateCount++;
      for (const c of kids) {
        const others = kids.filter(k => k !== c);
        if (!others.length) continue; // breadcrumb already links the state page
        const cityBlock = `    <section class="related-section" id="city-guides">\n      <h2>${lab} for other ${s.name} cities</h2>\n      <div class="state-grid">\n${others.map(link).join('')}        <a class="state-link" href="${base}">All of ${s.name}</a>\n      </div>\n    </section>\n`;
        if (insert(path.join(stateDir, c, 'index.html'), cityBlock)) cityCount++;
      }
    }
  }
}
console.log(`${DRY ? '[dry-run] ' : ''}city-link sections added: ${stateCount} state pages, ${cityCount} city pages`);
