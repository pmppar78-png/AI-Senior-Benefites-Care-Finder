#!/usr/bin/env node
/**
 * Corrects outdated or unsourced figures in the hand-built (static) pages at
 * build time, using engines/data/sources/senior-benefits-sourced-2026.json
 * (every figure there carries a source; retrieved 2026-11-15).
 *
 * Why at build time: the same template sentences sit in ~2,000 static pages.
 * Replacing them here keeps the commit small and lets page rewrites (e.g. the
 * SNAP pages being rewritten by hand) take over: a rewritten page no longer
 * contains the old sentence, so nothing is replaced on it.
 *
 * Only exact old sentences are replaced; everything else is left alone.
 * Idempotent. Runs on every Netlify build after the generator.
 * Usage: node scripts/apply-sourced-facts.cjs [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');
const SRC = JSON.parse(fs.readFileSync(path.join(ROOT, 'engines/data/sources/senior-benefits-sourced-2026.json'), 'utf8'));
const states = JSON.parse(fs.readFileSync(path.join(ROOT, 'engines/data/states.json'), 'utf8'));
const BY = Object.fromEntries(states.map(s => [s.slug, s]));
const usd = n => '$' + Math.round(n).toLocaleString('en-US');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const A = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`;

// ---- 1. Fixed sentence replacements (national figures) ----
const NAT_AL = "CareScout's 2025 Cost of Care Survey puts the national median for assisted living at $6,200 per month, with state medians ranging from $4,369 in Mississippi to $12,096 in Hawaii.";
const FIXED = [
  // Part D: the coverage gap ended in 2025; 2026 cap $2,100, deductible $615 (Medicare.gov, CMS)
  ['and how to avoid the coverage gap.', 'and the 2026 Part D out-of-pocket cap of $2,100.'],
  ['Part D costs include a monthly premium, annual deductible, copayments or coinsurance for each prescription, and the coverage gap (donut hole). In 2026, once you and your plan have spent a certain amount, you enter the coverage gap where you pay a higher share until catastrophic coverage kicks in and your costs drop significantly.',
    'Part D costs include a monthly premium, an annual deductible (up to $615 in 2026), and copayments or coinsurance for each prescription. The coverage gap ("donut hole") ended in 2025: in 2026, once your out-of-pocket spending on covered drugs reaches $2,100, you pay nothing more for covered drugs for the rest of the year (the cap rises to $2,400 in 2027). The Medicare Prescription Payment Plan can spread those costs into monthly payments.'],
  ['For Medicare Part D enrollees, using a discount card means the purchase does not count toward the coverage gap (donut hole).',
    'For Medicare Part D enrollees, a drug bought with a discount card instead of your plan does not count toward your Part D deductible or the 2026 $2,100 out-of-pocket cap.'],
  ['Some programs accept Medicare beneficiaries, particularly those in the Part D coverage gap. Each manufacturer sets its own criteria. Income limits range from $40,000 to $100,000+ for a single person depending on the company. Some programs consider medical expenses and family size.',
    'Some programs accept Medicare beneficiaries, though many now ask Part D enrollees to apply for Extra Help first. Each manufacturer sets its own criteria and income limit, so check the program\'s current rules. Some programs consider medical expenses and family size.'],
  ['These programs may supplement Medicare Part D, cover the Part D donut hole gap, or provide standalone coverage.',
    'These programs may help with Part D premiums, deductibles or copays, or provide standalone coverage. As of 2026 only about a dozen states run one.'],
  ['Extra Help eliminates the Medicare Part D "donut hole" coverage gap, so you continue to pay low copays throughout the year.',
    'With Extra Help you pay low copays all year, and the 2026 $2,100 Part D out-of-pocket cap applies to everyone with Part D.'],
  // VA pension with Aid & Attendance: MAPR $29,093/yr for a veteran with no dependents (VA, effective Dec 1, 2025)
  ['Up to $2,431/month for veterans needing daily help.', 'Up to $2,424/month for a single veteran who needs daily help (VA rates effective Dec 1, 2025).'],
  ['Up to $2,431/month for veterans who need help with daily activities.', 'Up to $2,424/month for a single veteran who needs help with daily activities (VA rates effective Dec 1, 2025).'],
  ['— Up to $2,431/mo (2026)', '— Up to $2,424/mo (2026)'],
  ['— Up to $2,431/mo for Veterans', '— Up to $2,424/mo for Veterans'],
  ['(2026) — Up to $2,431/mo', '(2026) — Up to $2,424/mo'],
  ['pays up to $2,431/month.', 'pays up to $2,424/month for a single veteran.'],
  // Medicare Part A deductible 2026 (CMS fact sheet, Nov 14, 2025)
  ['covering costs like the Part A deductible ($1,632 in 2026)', 'covering costs like the Part A deductible ($1,736 in 2026)'],
  // Spousal impoverishment 2026 (CMS CIB, Dec 9, 2025)
  ["The Community Spouse Resource Allowance (CSRA) allows the community spouse to retain approximately half of the couple's countable assets, between a minimum of roughly $30,828 and a maximum of roughly $154,140 in 2026.",
    "The Community Spouse Resource Allowance (CSRA) lets the community spouse keep part of the couple's countable assets: in 2026 the federal minimum is $32,532 and the maximum $162,660 (CMS), and each state sets its standard within that range."],
  ["The Community Spouse Resource Allowance (CSRA) allows the community spouse to keep approximately half of the couple's countable assets up to a maximum of roughly $154,140 in 2026.",
    "The Community Spouse Resource Allowance (CSRA) lets the community spouse keep part of the couple's countable assets, up to the 2026 federal maximum of $162,660 (minimum $32,532, per CMS)."],
  // Care costs: CareScout (formerly Genworth) Cost of Care Survey 2025, national medians
  ['Long-term care costs average $8,000-$10,000 per month for nursing home care and $4,500-$6,500 for assisted living.',
    "CareScout's 2025 national medians are $9,581 a month for a semi-private nursing home room and $6,200 for assisted living."],
  ['Nationally, the average monthly cost is approximately $4,500-$5,000, but prices range from under $3,000 in some rural areas to over $8,000 in major metropolitan areas.', NAT_AL],
  ['The national median cost of assisted living is approximately $4,500-$5,000 per month in 2026.', "CareScout's 2025 national median for assisted living is $6,200 per month."],
  ["According to Genworth's Cost of Care data, the national median hovers around $4,500-$5,000 per month, but costs range widely from approximately $3,000 in lower-cost states to over $7,000 in higher-cost areas.", NAT_AL],
  ["According to Genworth's Cost of Care Survey, the national median cost for assisted living is approximately $4,500 to $5,000 per month, but actual costs range from about $3,000 in lower-cost states to over $7,000 in higher-cost metropolitan areas.", NAT_AL],
  ['Nursing home care is significantly more expensive, with a national median of approximately $8,000–$9,500 per month for a semi-private room.', "Nursing home care costs more: CareScout's 2025 national median is $9,581 per month for a semi-private room."],
  ["Based on Genworth's Cost of Care data, the national median hovers around $4,500 to $5,000 per month, but costs range widely from approximately $3,000 in lower-cost states to over $7,000 in higher-cost areas.", NAT_AL],
  ['The national median cost varies by care type: home health aide ~$5,700/month, assisted living ~$4,500/month, and nursing home ~$8,000-$9,000/month for a semi-private room.',
    "CareScout's 2025 national medians vary by care type: home care about $6,673/month (44 hours a week), assisted living $6,200/month, and a semi-private nursing home room $9,581/month."],
  ['The national median cost for assisted living is approximately $4,500&ndash;$5,500 per month, but prices range widely from under $3,000 in some rural areas to over $8,000 in high-cost states.', NAT_AL],
  ['Nursing home costs in the U.S. average approximately $8,000-$9,000 per month for a semi-private room and $9,000-$10,500 for a private room.',
    "CareScout's 2025 national medians for nursing home care are $9,581 per month for a semi-private room and $10,798 for a private room."],
  ['Memory care costs vary by location and level of care, but typically range from $4,000 to $8,000 per month.',
    "Memory care usually costs more than standard assisted living (CareScout's 2025 national median for assisted living is $6,200 per month) because of extra staffing and secured units; ask each community for its memory care rate."],
  // Medicare Part B deductible 2026: $283 (CMS fact sheet)
  ['except the Part B annual deductible ($257 in 2026)', 'except the Part B annual deductible ($283 in 2026)'],
];

// ---- 2. SNAP state pages (/low-income-programs/snap/<state>/[city]/) ----
// FY2027 (Oct 1, 2026 - Sept 30, 2027) USDA figures and USDA's Nov 2026 BBCE chart.
const SNAP_OLD = [
  'Seniors 60 and older may qualify for SNAP if their gross monthly income is at or below 130% of the Federal Poverty Level (about $1,580/month for one person in 2026). Net income after deductions must be at or below 100% FPL. Seniors receiving SSI are categorically eligible in most states. Households where all members are 60+ or disabled face no asset limits in many states.',
  'The maximum monthly benefit for a one-person household is approximately $291, and for a two-person household approximately $535.',
  "Apply for SNAP at your local Department of Social Services, through your state's online application portal, or by calling your state's SNAP hotline.",
  'no gross income test for households where all members are 60+ or disabled',
];
const USDA_E = SRC.sources.usda_snap_fy27.url;
const USDA_B = SRC.sources.usda_bbce_nov2026.url;
const USDA_A = SRC.sources.usda_snap_fy27_allot.url;
function snapRule(name, sn) {
  const b = sn.bbce, n1 = usd(sn.netIncomeLimit['1']), n2 = usd(sn.netIncomeLimit['2']);
  if (b.uses && name === 'New York') {
    return `New York's broad-based categorical eligibility covers households with dependent-care costs (up to 200% of poverty) or earnings (up to 150%), so most retired seniors use the regular rules: a household with a member 60 or older needs net income at or below ${n1}/month for one person (${n2} for two) and countable resources under $4,750.`;
  }
  if (b.uses) {
    const assets = b.noAssetLimit ? 'no asset test' : `an asset limit of ${b.assetLimit}`;
    return `${name} uses broad-based categorical eligibility (BBCE): a household with gross income up to ${b.grossLimitPct}% of the poverty guideline (${usd(b.grossLimit['1'])}/month for one person, ${usd(b.grossLimit['2'])} for two in FY2027) is categorically eligible, with ${assets}. Households above that limit use the regular rules: with a member 60 or older they skip the gross income test but need net income at or below ${n1}/month for one person (${n2} for two) and countable resources under $4,750.`;
  }
  return `${name} does not use broad-based categorical eligibility${name === 'Indiana' ? ' (it ended on July 1, 2026)' : ''}, so the regular federal rules apply: a household with a member 60 or older skips the gross income test but needs net income at or below ${n1}/month for one person (${n2} for two) and countable resources under $4,750.`;
}
function snapNew(slug) {
  const s = BY[slug]; const sn = SRC.states[s.abbr].snap; const name = s.name;
  const link = sn.agencyUrl || sn.usdaDirectoryUrl;
  const prog = sn.programName;
  const progTxt = (prog === 'SNAP' || prog.startsWith('SNAP') || prog.startsWith('Supplemental')) ? '' : ` (called ${prog} in ${name})`;
  const ma = sn.maxAllotment;
  const maxTxt = slug === 'alaska'
    ? `From October 1, 2026 through September 30, 2027, the maximum monthly benefit in urban Alaska is ${usd(ma['1'])} for one person and ${usd(ma['2'])} for two; rural Alaska maximums are higher (up to $608 and $1,115).`
    : `From October 1, 2026 through September 30, 2027, the maximum monthly benefit is ${usd(ma['1'])} for one person and ${usd(ma['2'])} for two${slug === 'hawaii' ? ' in Hawaii' : ''}.`;
  return [
    `${snapRule(name, sn)} In most states, a household where everyone receives SSI is categorically eligible. Sources: ${A(USDA_B, 'USDA BBCE chart (Nov 2026)')}, ${A(USDA_E, 'USDA SNAP eligibility (FY2027)')}.`,
    `${maxTxt} (${A(USDA_A, 'USDA FY2027 allotments')})`,
    `In ${name}, SNAP${progTxt} is run by the ${A(link, sn.agency)}. You can apply online, by phone, by mail or at a local office.`,
    'no gross income test for households with a member who is 60+ or disabled',
  ];
}

// ---- 3. Static assisted-living cost city pages: add the local CareScout figure ----
function alCityAdd(stateSlug, citySlug) {
  const key = `${stateSlug}/${citySlug}`;
  const hit = (SRC.staticCityCare || {})[key];
  const st = SRC.states[BY[stateSlug].abbr];
  if (!hit) return null;
  if (hit.area) return ` For the ${hit.area} area, CareScout's 2025 median is ${usd(hit.assistedLiving)} per month.`;
  return ` CareScout publishes no separate figure for ${hit.city}; the ${st.name} statewide median is ${usd(st.careCosts2025.assistedLiving)} per month.`;
}

const SKIP_DIRS = new Set(['engines', 'scripts', 'netlify', 'node_modules']);
const counts = {}; let files = 0;
const bump = k => { counts[k] = (counts[k] || 0) + 1; };
// Date these corrections first went live; scripts/build-lastmod.js uses it for
// static pages this script changes.
const SOURCED_FACTS_DATE = '2026-11-15';

/** Returns the corrected HTML for one page (relPath like 'medicare/part-d/index.html'). */
function transform(relPath, h) {
    const rel = relPath.split(/[\\/]/);
    for (let i = 0; i < FIXED.length; i++) {
      if (h.includes(FIXED[i][0])) { h = h.split(FIXED[i][0]).join(FIXED[i][1]); bump('fixed' + i); }
    }
    // These city pages explain how to compare plans; they do not rank plans, so no "Best" claim.
    if (rel[0] === 'medicare' && rel[1] === 'advantage' && /Best Medicare Advantage Plans in /.test(h)) {
      h = h.replace(/Best Medicare Advantage Plans in ([^<"]+?) \((\d{4})\)/g, 'Medicare Advantage Plans in $1 ($2): How to Compare');
      bump('maBest');
    }
    if (rel[0] === 'low-income-programs' && rel[1] === 'snap' && BY[rel[2]] && SNAP_OLD.every(x => h.includes(x))) {
      const nw = snapNew(rel[2]);
      SNAP_OLD.forEach((x, i) => { h = h.split(x).join(nw[i]); });
      bump('snap');
    }
    if (rel[0] === 'assisted-living' && rel[1] === 'cost' && rel.length === 5 && h.includes(NAT_AL)) {
      const add = alCityAdd(rel[2], rel[3]);
      if (add && !h.includes(add)) { h = h.replace(NAT_AL, NAT_AL + add); bump('alCity'); }
    }
    return h;
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!(dir === ROOT && SKIP_DIRS.has(e.name))) walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    const orig = fs.readFileSync(p, 'utf8');
    const h = transform(path.relative(ROOT, p), orig);
    if (h !== orig) { files++; if (!DRY) fs.writeFileSync(p, h, 'utf8'); }
  }
}

module.exports = { transform, SOURCED_FACTS_DATE };
if (require.main !== module) return;
walk(ROOT);
console.log(`${DRY ? '[dry-run] ' : ''}sourced-facts: ${files} files updated`, JSON.stringify(counts));
