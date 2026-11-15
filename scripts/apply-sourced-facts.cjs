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

// ---- 1b. VA pension and Aid & Attendance body text (rates effective Dec 1, 2025) ----
// Veterans: va.gov/pension/veterans-pension-rates/ ; survivors: VA Survivors Pension rates.
const VA = SRC.federal.vaPension;
const M = VA.mapr;
const VA_V = A(SRC.sources.va_pension_rates.url, 'VA Veterans Pension rates');
const VA_S = A(SRC.sources.va_survivors_pension_rates.url, 'VA Survivors Pension rates');
const mo = n => usd(n / 12);
FIXED.push(
  ['Aid & Attendance rates for 2026 are adjusted for cost of living. Single veterans can receive over $2,200/month, married veterans over $2,600/month, and surviving spouses over $1,400/month. These amounts include the basic pension plus the A&A enhancement.',
    `VA sets a maximum annual pension rate (MAPR) for each household type, and your payment is that rate minus your countable income. For rates effective December 1, 2025, the MAPR with Aid & Attendance is ${usd(M.aidAttendance)} a year (up to ${mo(M.aidAttendance)} a month) for a veteran with no dependents, ${usd(M.aidAttendanceOneDependent)} (${mo(M.aidAttendanceOneDependent)} a month) for a veteran with one dependent, and ${usd(VA.survivorMapr.aidAttendance)} (${mo(VA.survivorMapr.aidAttendance)} a month) for a surviving spouse with no dependents. These amounts include the basic pension plus the A&A increase. Sources: ${VA_V}, ${VA_S}.`],
  ['Basic VA pension rates for 2026 are approximately $16,550 per year for a single veteran and $21,676 for a veteran with a dependent spouse. With Aid & Attendance, rates increase to approximately $27,610 for a single veteran and $32,738 with a dependent. Housebound veterans receive approximately $20,226 per year ($25,354 with dependent). Actual payments are reduced dollar-for-dollar by countable income.',
    `For rates effective December 1, 2025, VA's maximum annual pension rate is ${usd(M.basicNoDependents)} for a veteran with no dependents and ${usd(M.basicOneDependent)} for a veteran with one dependent. With Aid & Attendance the rates are ${usd(M.aidAttendance)} and ${usd(M.aidAttendanceOneDependent)}; with Housebound benefits, ${usd(M.housebound)} and ${usd(M.houseboundOneDependent)}. Your payment is the rate minus your countable income. Source: ${VA_V}.`],
  ['The net worth limit is approximately $150,538 (adjusted annually).',
    `From December 1, 2025, to November 30, 2026, the net worth limit is ${usd(VA.netWorthLimit)} (${VA_V}).`],
  ['The maximum annual pension rate for a single veteran in 2026 is approximately $16,550.',
    `For rates effective December 1, 2025, the maximum annual pension rate for a veteran with no dependents is ${usd(M.basicNoDependents)} (${VA_V}).`],
);

// ---- 1c. Dead official URLs (medicaid.gov retired its index.html paths; checked
// in Chrome on 2026-11-15: old paths return "Page Not Found", new ones load).
const URL_FIX = [
  ['https://www.medicaid.gov/medicaid/long-term-services-supports/institutional-long-term-care/nursing-facilities/index.html', 'https://www.medicaid.gov/medicaid/long-term-services-supports/institutional-long-term-care/nursing-facilities'],
  ['https://www.medicaid.gov/medicaid/long-term-services-supports/institutional-long-term-care/index.html', 'https://www.medicaid.gov/medicaid/long-term-services-supports/institutional-long-term-care'],
  ['https://www.medicaid.gov/medicaid/home-community-based-services/index.html', 'https://www.medicaid.gov/medicaid/home-community-based-services'],
  ['https://www.medicaid.gov/medicaid/eligibility/index.html', 'https://www.medicaid.gov/medicaid/eligibility-policy'],
  ['https://www.medicaid.gov/medicaid/eligibility/"', 'https://www.medicaid.gov/medicaid/eligibility-policy"'],
];

// ---- 1d. Fresh intros for static families that opened with the same boilerplate ----
const BOILER = /<p class="engine-intro">Use this guide to decide what to check next for ([^<]+?) in ([^<]+?)\. It focuses on eligibility, costs, documents, payment-help options, and practical next steps so seniors and caregivers can move from research to action without guessing\.<\/p>/;
const MED = SRC.federal.medicare;
const L_PF = A('https://www.medicare.gov/plan-compare/', "Medicare's Plan Finder");
const L_SHIP = A('https://www.shiphelp.org/', 'SHIP');
const L_PD = A(SRC.sources.medicare_partd_costs.url, 'Medicare.gov');
const L_AA = A('https://www.va.gov/pension/aid-attendance-housebound/', 'VA Aid and Attendance');
const L_EN = A('https://www.usa.gov/help-with-energy-bills', 'USA.gov energy help');
const pick = (key, arr) => arr[[...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % arr.length];
// State-specific 2026 plan counts from CMS's landscape file, so each state's intro carries its
// own sourced numbers rather than only the place name.
const L_CMS = A(SRC.sources.cms_landscape_2026.url, "CMS's landscape data");
const money2 = n => '$' + Number(n).toFixed(2);
function stateLandscapeFact(kind, loc) {
  const parts = loc.split(', ');
  const stName = parts[parts.length - 1];
  const city = parts.length > 1 ? parts[0] : null;
  const st = Object.values(SRC.states).find(x => x.name === stName);
  const m = st && st.medicare2026;
  if (!m) return '';
  const where = city ? `somewhere in ${stName} (not every plan is sold in ${city})` : `in ${stName}`;
  if (kind === 'Medicare Advantage' && m.maPlans) {
    const prem = m.maMedianPremium === 0 ? 'the median plan premium is $0' : `the median plan premium is ${money2(m.maMedianPremium)} a month`;
    return `For 2026, ${L_CMS} show ${m.maPlans} Medicare Advantage plans offered ${where}; ${m.maZeroPremium} of them charge no premium of their own, and ${prem}.`;
  }
  if (kind === 'Medicare Part D' && m.pdpPlans) {
    return `For 2026, ${L_CMS} list ${m.pdpPlans} stand-alone Part D plans in ${stName}, with a median premium of ${money2(m.pdpMedianPremium)} a month${m.pdpLowestPremium != null ? ` and the lowest at ${money2(m.pdpLowestPremium)}` : ''}.`;
  }
  return '';
}
const INTROS = {
  'Medicare Advantage': loc => [
    `Medicare Advantage (Part C) plans are sold by private insurers that contract with Medicare, and the plans offered change by county each year. This page covers the plan types, extra benefits, costs and star ratings to compare in ${loc}. To see the plans sold at your ZIP code, use ${L_PF}; free one-on-one counseling is available from your state's ${L_SHIP} program.`,
    `In ${loc}, as everywhere, Medicare Advantage plans are run by private insurers under contract with Medicare, so the choices depend on your county and change every year. Below are the plan types, extras, costs and star ratings worth comparing. ${L_PF} lists the plans at your ZIP code, and your state's ${L_SHIP} program offers free, unbiased counseling.`,
  ],
  'Medicare Part D': loc => [
    `Medicare Part D plans help pay for prescription drugs. In 2026 the deductible is at most ${usd(MED.partDDeductible2026)}, and once you have paid ${usd(MED.partDOutOfPocketCap2026)} out of pocket for covered drugs you pay nothing more that year (${L_PD}). This page explains what to compare in ${loc}: premiums, each plan's drug list, preferred pharmacies, and help such as Extra Help.`,
    `Part D is Medicare's prescription drug coverage. For 2026, plans can charge a deductible of up to ${usd(MED.partDDeductible2026)}, and out-of-pocket spending on covered drugs is capped at ${usd(MED.partDOutOfPocketCap2026)} a year (${L_PD}). For ${loc}, the sections below cover premiums, drug lists, pharmacy networks and the programs that lower costs.`,
  ],
  'VA Aid and Attendance': loc => [
    `Aid and Attendance is an added amount on a VA pension for wartime veterans and surviving spouses who need help with daily activities. At rates effective December 1, 2025, a veteran with no dependents can receive up to ${mo(M.aidAttendance)} a month, minus countable income (${L_AA}). This page covers eligibility, amounts and how to apply from ${loc}.`,
    `Veterans and surviving spouses in ${loc} who need help with bathing, dressing or other daily activities may qualify for Aid and Attendance, an increase to the VA pension. For rates effective December 1, 2025, the maximum for a veteran with no dependents is ${usd(M.aidAttendance)} a year (${mo(M.aidAttendance)} a month), reduced by countable income (${L_AA}).`,
  ],
  'VA Pension Benefits': loc => [
    `VA pension is a monthly, needs-based payment for wartime veterans who are 65 or older or permanently disabled and have limited income and net worth. For rates effective December 1, 2025, the maximum is ${usd(M.basicNoDependents)} a year for a veteran with no dependents, minus countable income (${VA_V}). This page covers eligibility, limits and how to apply from ${loc}.`,
    `Wartime veterans in ${loc} who are 65 or older, or permanently disabled, may qualify for a VA pension if their income and net worth are limited. At rates effective December 1, 2025, a veteran with no dependents can receive up to ${usd(M.basicNoDependents)} a year, less countable income, and the net worth limit is ${usd(VA.netWorthLimit)} (${VA_V}).`,
  ],
  'LIHEAP Energy Help': loc => [
    `The Low Income Home Energy Assistance Program (LIHEAP) is federally funded and run by each state; it helps pay heating and cooling bills and energy emergencies. This page explains who usually qualifies and how to apply in ${loc}. For other energy-bill programs, see ${L_EN}.`,
    `LIHEAP, the Low Income Home Energy Assistance Program, helps households with limited income pay heating and cooling bills; each state runs its own program with federal money. Here is what to expect when applying in ${loc}, with ${L_EN} listing related programs such as weatherization.`,
  ],
};


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
    // Spelling: the city is McKinney, TX (URL slugs stay lowercase).
    if (h.includes('Mckinney')) { h = h.split('Mckinney').join('McKinney'); bump('mckinney'); }
    // Medicare Advantage state titles read "... Plans 2026 — Compare Options & Enroll"; match the city-page wording.
    if (/ Medicare Advantage Plans 2026 — Compare Options &amp; Enroll/.test(h)) {
      h = h.replace(/([A-Z][A-Za-z. ]+?) Medicare Advantage Plans 2026 — Compare Options &amp; Enroll/g, 'Medicare Advantage Plans in $1 (2026): How to Compare');
      bump('maStateTitle');
    }
    for (let i = 0; i < FIXED.length; i++) {
      if (h.includes(FIXED[i][0])) { h = h.split(FIXED[i][0]).join(FIXED[i][1]); bump('fixed' + i); }
    }
    for (const [a, b] of URL_FIX) {
      if (h.includes(a)) { h = h.split(a).join(b); bump('url'); }
    }
    const bm = h.match(BOILER);
    if (bm && INTROS[bm[1]]) {
      const loc = bm[2];
      const fact = stateLandscapeFact(bm[1], loc);
      const intro = `<p class="engine-intro">${pick(relPath, INTROS[bm[1]](loc))}${fact ? ' ' + fact : ''}</p>`;
      h = h.replace(BOILER, () => intro);
      bump('intro');
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
    // Two old national-cost sentences on one page both map to NAT_AL; keep the first only.
    if (h.split(NAT_AL).length > 2) {
      const i = h.indexOf(NAT_AL) + NAT_AL.length;
      h = h.slice(0, i) + h.slice(i).split(' ' + NAT_AL).join('').split(NAT_AL).join('');
      bump('natAlDedupe');
    }
    return h;
}

// ---- 4. Dates: schema dateModified and a visible byline follow the sitemap date ----
// The sitemap date comes from engines/data/lastmod.json (git history plus this
// script's own changes; see scripts/build-lastmod.js), falling back to the
// generator's CONTENT_DATE. Static pages kept a hard-coded dateModified that
// went stale when this script changed them; this keeps the three in step.
const LASTMOD = JSON.parse(fs.readFileSync(path.join(ROOT, 'engines/data/lastmod.json'), 'utf8'));
const CONTENT_DATE = fs.readFileSync(path.join(ROOT, 'engines/generator.js'), 'utf8').match(/const CONTENT_DATE = '([\d-]+)'/)[1];
const longDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const toIso = v => { if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10); const d = new Date(v + ' 12:00 UTC'); return isNaN(d) ? null : d.toISOString().slice(0, 10); };
let GENERATED = null;
try { GENERATED = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'engines/data/.generated-urls.json'), 'utf8'))); } catch (e) { /* generator not run */ }
let SITEMAP_DATES = null;
function sitemapDate(url) {
  if (!SITEMAP_DATES) {
    SITEMAP_DATES = {};
    for (const f of fs.readdirSync(ROOT).filter(n => /^sitemap.*\.xml$/.test(n))) {
      const x = fs.readFileSync(path.join(ROOT, f), 'utf8');
      for (const m of x.matchAll(/<loc>https:\/\/seniorbenefitscarefinder\.com([^<]*)<\/loc>\s*<lastmod>([\d-]{10})/g)) SITEMAP_DATES[m[1]] = m[2];
    }
  }
  return SITEMAP_DATES[url];
}
// Page-level schema (WebPage, CollectionPage, ProfilePage) with no dateModified gets one: the
// visible "Updated" date when the page shows one, otherwise the sitemap date. Hub pages with
// no visible date also get a byline line under the H1 with that same date.
function addMissingDates(url, h) {
  const vis = (h.match(/Updated:?\s*(?:<time datetime="([\d-]{10})">)?([A-Z][a-z]+ \d{1,2}, \d{4})/) || []);
  const date = vis[1] || (vis[2] && toIso(vis[2])) || sitemapDate(url) || LASTMOD[url] || CONTENT_DATE;
  h = h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, body, c) => {
    if (/"dateModified"/.test(body) || !/"@type"\s*:\s*"(WebPage|CollectionPage|ProfilePage)"/.test(body)) return m;
    bump('schemaDateAdded');
    return a + body.replace(/("@type"\s*:\s*"(?:WebPage|CollectionPage|ProfilePage)",)/, `$1 "dateModified": "${date}",`) + c;
  });
  if (!vis.length && /<h1>[^<]*<\/h1>\s*<p>Select your state/.test(h)) {
    h = h.replace(/(<h1>[^<]*<\/h1>)(\s*<p>Select your state)/, `$1\n    <p class="page-byline" style="font-size:0.85rem;color:var(--text-muted);margin:0.25rem 0 1rem;">By <a href="/author/paul-paradis/">Paul Paradis</a> &middot; Updated <time datetime="${date}">${longDate(date)}</time></p>$2`);
    bump('hubByline');
  }
  return h;
}
function syncDates(relPath, h) {
  const url = '/' + relPath.split(path.sep).join('/').replace(/index\.html$/, '');
  h = addMissingDates(url, h);
  const date = LASTMOD[url] || CONTENT_DATE;
  // Engine-generated pages already carry CONTENT_DATE in schema and sitemap;
  // only hand-built pages (no engine hero) are synced here.
  const isStatic = GENERATED ? !GENERATED.has(url) : !/class="engine-hero"/.test(h);
  if (isStatic) h = h.replace(/("dateModified"\s*:\s*")([^"]+)(")/g, (m, a, v, b) => {
    const iso = toIso(v);
    if (iso === date) return m;
    const pub = (h.match(/"datePublished"\s*:\s*"([^"]+)"/) || [])[1];
    if (pub && toIso(pub) && toIso(pub) > date) return m;
    bump('dateModified'); return a + date + b;
  });
  // Hand-built pages with no visible date get a byline under the H1, plus
  // WebPage schema when they have no dateModified at all.
  const handBuilt = /<article class="engine-content">\s*<h1>/.test(h);
  if (handBuilt && !/class="page-byline"/.test(h) && !/(meta-badge">|<span>)Updated/.test(h)) {
    h = h.replace(/(<article class="engine-content">\s*<h1>[^<]*<\/h1>)/, `$1\n      <p class="page-byline" style="font-size:0.85rem;color:var(--text-muted);margin:0.25rem 0 1rem;">By <a href="/author/paul-paradis/">Paul Paradis</a> &middot; Updated <time datetime="${date}">${longDate(date)}</time></p>`);
    bump('byline');
    if (!/"dateModified"/.test(h)) {
      const title = ((h.match(/<h1>([^<]*)<\/h1>/) || [])[1] || '').replace(/&amp;/g, '&');
      const ld = { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: 'https://seniorbenefitscarefinder.com' + url, dateModified: date, author: { '@type': 'Person', name: 'Paul Paradis', url: 'https://seniorbenefitscarefinder.com/author/paul-paradis/' } };
      h = h.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n</head>`);
      bump('webpageSchema');
    }
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
    const rel = path.relative(ROOT, p);
    const h = syncDates(rel, transform(rel, orig));
    if (h !== orig) { files++; if (!DRY) fs.writeFileSync(p, h, 'utf8'); }
  }
}

module.exports = { transform, SOURCED_FACTS_DATE };
if (require.main !== module) return;
walk(ROOT);
console.log(`${DRY ? '[dry-run] ' : ''}sourced-facts: ${files} files updated`, JSON.stringify(counts));
