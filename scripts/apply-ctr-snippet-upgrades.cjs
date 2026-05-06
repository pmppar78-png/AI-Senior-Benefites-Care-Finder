#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://seniorbenefitscarefinder.com';
const TODAY = '2026-05-06';

const states = {
  alabama: ['Alabama', 'AL'], alaska: ['Alaska', 'AK'], arizona: ['Arizona', 'AZ'],
  arkansas: ['Arkansas', 'AR'], california: ['California', 'CA'], colorado: ['Colorado', 'CO'],
  connecticut: ['Connecticut', 'CT'], delaware: ['Delaware', 'DE'], florida: ['Florida', 'FL'],
  georgia: ['Georgia', 'GA'], hawaii: ['Hawaii', 'HI'], idaho: ['Idaho', 'ID'],
  illinois: ['Illinois', 'IL'], indiana: ['Indiana', 'IN'], iowa: ['Iowa', 'IA'],
  kansas: ['Kansas', 'KS'], kentucky: ['Kentucky', 'KY'], louisiana: ['Louisiana', 'LA'],
  maine: ['Maine', 'ME'], maryland: ['Maryland', 'MD'], massachusetts: ['Massachusetts', 'MA'],
  michigan: ['Michigan', 'MI'], minnesota: ['Minnesota', 'MN'], mississippi: ['Mississippi', 'MS'],
  missouri: ['Missouri', 'MO'], montana: ['Montana', 'MT'], nebraska: ['Nebraska', 'NE'],
  nevada: ['Nevada', 'NV'], 'new-hampshire': ['New Hampshire', 'NH'], 'new-jersey': ['New Jersey', 'NJ'],
  'new-mexico': ['New Mexico', 'NM'], 'new-york': ['New York', 'NY'], 'north-carolina': ['North Carolina', 'NC'],
  'north-dakota': ['North Dakota', 'ND'], ohio: ['Ohio', 'OH'], oklahoma: ['Oklahoma', 'OK'],
  oregon: ['Oregon', 'OR'], pennsylvania: ['Pennsylvania', 'PA'], 'rhode-island': ['Rhode Island', 'RI'],
  'south-carolina': ['South Carolina', 'SC'], 'south-dakota': ['South Dakota', 'SD'], tennessee: ['Tennessee', 'TN'],
  texas: ['Texas', 'TX'], utah: ['Utah', 'UT'], vermont: ['Vermont', 'VT'],
  virginia: ['Virginia', 'VA'], washington: ['Washington', 'WA'], 'west-virginia': ['West Virginia', 'WV'],
  wisconsin: ['Wisconsin', 'WI'], wyoming: ['Wyoming', 'WY'],
};

const topics = [
  ['medicare/advantage', 'Medicare Advantage', 'Compare HMO/PPO choices, drug coverage, dental and vision extras, costs, enrollment timing, and local counseling steps.'],
  ['medicare/enrollment', 'Medicare Enrollment', 'Check enrollment windows, deadlines, penalties, required steps, and what to verify before signing up or changing coverage.'],
  ['medicare/eligibility', 'Medicare Eligibility', 'Check age, disability, work-credit, enrollment-period, and document steps before applying for Medicare coverage.'],
  ['medicare/part-d', 'Medicare Part D', 'Compare drug formularies, pharmacy costs, Extra Help, penalties, and annual plan review steps before choosing coverage.'],
  ['medicare/supplement-plans', 'Medicare Supplement Plans', 'Compare Plan G, Plan N, premiums, enrollment windows, underwriting risk, and how Medigap differs from Advantage.'],
  ['medicare/supplement', 'Medigap Plans', 'Compare Plan G, Plan N, premiums, enrollment windows, underwriting risk, and how Medigap differs from Advantage.'],
  ['medicaid/eligibility', 'Medicaid Eligibility', 'Check income limits, assets, senior coverage, documents, application options, and practical next steps before applying.'],
  ['medicaid/application', 'Medicaid Application Help', 'See documents, application paths, timing, denial fixes, and free local help options before submitting Medicaid forms.'],
  ['medicaid/waiver-programs', 'Medicaid Waiver Help', 'Review HCBS waivers, home-care coverage, eligibility, waitlists, and where to start when care is needed.'],
  ['medicaid/home-care-waivers', 'Medicaid Home Care Waivers', 'Check home-care waiver eligibility, covered services, waitlists, documents, and next steps for in-home support.'],
  ['medicaid/spend-down', 'Medicaid Spend Down', 'Understand asset rules, income strategies, spousal protections, look-back risks, and safer next steps for care planning.'],
  ['prescription-assistance/programs', 'Prescription Assistance', 'Find Extra Help, patient assistance programs, discount cards, state help, and next steps to lower medication costs.'],
  ['prescription-assistance/patient-assistance', 'Patient Assistance', 'Check manufacturer programs, income rules, Medicare coordination, application documents, and medication savings steps.'],
  ['prescription-assistance/discount-cards', 'Rx Discount Cards', 'Compare free discount cards, pharmacy prices, insurance tradeoffs, and ways to reduce out-of-pocket prescription costs.'],
  ['low-income-programs/snap', 'SNAP Benefits for Seniors', 'Check food assistance eligibility, deductions, documents, benefit rules, and application steps for older adults.'],
  ['low-income-programs/liheap', 'LIHEAP Energy Help', 'Check utility-bill help, crisis assistance, weatherization, income limits, documents, and application timing.'],
  ['low-income-programs/housing-assistance', 'Senior Housing Assistance', 'Review rental help, vouchers, subsidized housing, waitlists, eligibility, documents, and local next steps.'],
  ['home-care/cost-guide', 'Home Care Cost Help', 'Estimate hourly rates, care hours, Medicare limits, Medicaid waivers, VA help, and what to ask before hiring care.'],
  ['home-care/cost', 'Home Care Cost Help', 'Estimate hourly rates, care hours, Medicare limits, Medicaid waivers, VA help, and what to ask before hiring care.'],
  ['home-care/services', 'Home Care Services', 'Compare personal care, skilled nursing, companion care, therapy, payment options, and agency-selection next steps.'],
  ['home-care/agencies', 'Home Care Agencies', 'Compare provider types, licensing checks, caregiver screening, costs, contracts, and questions to ask before hiring.'],
  ['home-care/palliative', 'Palliative Home Care', 'Understand comfort-focused care, Medicare coverage limits, caregiver support, costs, and when to ask for help.'],
  ['home-care/respite', 'Respite Care Help', 'Compare short-term care options, caregiver relief, adult day care, home care, costs, and payment-help paths.'],
  ['assisted-living/costs', 'Assisted Living Cost Help', 'Compare monthly costs, care-level fees, memory care, Medicaid waiver limits, VA help, and payment options.'],
  ['assisted-living/cost', 'Assisted Living Cost Help', 'Compare monthly costs, care-level fees, memory care, Medicaid waiver limits, VA help, and payment options.'],
  ['assisted-living/types', 'Assisted Living Options', 'Compare assisted living, memory care, residential care homes, respite care, costs, and how to choose.'],
  ['assisted-living/memory-care', 'Memory Care Help', 'Compare dementia care, safety features, staffing, monthly costs, payment help, and questions for facility tours.'],
  ['veterans-benefits/aid-attendance', 'VA Aid and Attendance', 'Check eligibility, monthly pension add-ons, care-cost uses, documents, application steps, and accredited help.'],
  ['veterans-benefits/pension', 'VA Pension Benefits', 'Review wartime service rules, income and asset limits, Aid and Attendance, application documents, and next steps.'],
  ['veterans-benefits/health-care', 'VA Health Care', 'Check enrollment, priority groups, covered services, VA facilities, community care, and cost-sharing basics.'],
  ['veterans-benefits/healthcare', 'VA Health Care', 'Check enrollment, priority groups, covered services, VA facilities, community care, and cost-sharing basics.'],
  ['long-term-care/insurance', 'Long-Term Care Insurance', 'Compare policy costs, hybrid options, Medicaid alternatives, care settings, and timing before buying coverage.'],
  ['long-term-care/medicaid-planning', 'Long-Term Care Medicaid Help', 'Review Medicaid planning, care costs, spend-down rules, look-back risks, and safer next steps.'],
  ['long-term-care/nursing-homes', 'Nursing Home Help', 'Compare nursing home costs, Medicare limits, Medicaid coverage, quality checks, and what families should inspect.'],
  ['social-security/disability', 'SSDI Benefits', 'Check SSDI eligibility, work credits, medical records, appeal steps, Medicare timing, and next actions.'],
  ['social-security/retirement-planning', 'Social Security Planning', 'Compare claiming ages, spousal benefits, work rules, taxes, and timing decisions before filing.'],
  ['social-security/retirement', 'Social Security Retirement', 'Compare claiming ages, spousal benefits, work rules, taxes, and timing decisions before filing.'],
  ['social-security/survivors', 'Survivor Benefits', 'Check widow, widower, child, and divorced-spouse rules, benefit amounts, documents, and application steps.'],
  ['disability-benefits/ssi', 'SSI Benefits', 'Check income and resource limits, disability or age rules, Medicaid links, documents, and application steps.'],
  ['senior-legal/estate-planning', 'Estate Planning for Seniors', 'Review wills, trusts, power of attorney, healthcare directives, Medicaid planning, and affordable legal help.'],
  ['senior-legal/elder-abuse', 'Elder Abuse Reporting', 'Recognize warning signs, report concerns, find APS and legal help, and protect older adults from exploitation.'],
];

topics.sort((a, b) => b[0].length - a[0].length);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === '.netlify' || entry.name === 'node_modules') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else if (entry.isFile() && entry.name === 'index.html') out.push(file);
  }
  return out;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeJson(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function titleCaseSlug(slug) {
  return slug
    .split('-')
    .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join(' ')
    .replace(/\bDc\b/g, 'DC')
    .replace(/\bMn\b/g, 'MN')
    .replace(/\bDe\b/g, 'DE')
    .replace(/\bIl\b/g, 'IL')
    .replace(/\bKs\b/g, 'KS')
    .replace(/\bMa\b/g, 'MA')
    .replace(/\bMe\b/g, 'ME')
    .replace(/\bMo\b/g, 'MO')
    .replace(/\bWa\b/g, 'WA')
    .replace(/\bWv\b/g, 'WV');
}

function trimDescription(text) {
  if (text.length <= 158) return text;
  const cut = text.slice(0, 155);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.]$/, '')}...`;
}

function canonicalPath(html) {
  const match = html.match(/<link rel="canonical" href="https:\/\/seniorbenefitscarefinder\.com([^"]*)" \/>/i);
  return match ? match[1] : null;
}

function locationFor(urlPath, topicPrefix) {
  const parts = urlPath.replace(/^\/|\/$/g, '').split('/');
  const prefixParts = topicPrefix.split('/');
  const rest = parts.slice(prefixParts.length);
  const stateSlug = rest.find(part => states[part]);
  const state = stateSlug ? states[stateSlug] : null;
  const citySlug = stateSlug ? rest[rest.indexOf(stateSlug) + 1] : null;
  if (!stateSlug || !state) return null;
  const city = citySlug ? titleCaseSlug(citySlug) : null;
  return {
    long: city ? `${city}, ${state[0]}` : state[0],
    short: city ? `${city}, ${state[1]}` : state[0],
  };
}

function buildSnippet(topic, loc) {
  const [prefix, label, promise] = topic;
  const title = `${loc.short} ${label} (2026)`;
  const description = trimDescription(`${label} in ${loc.long}: eligibility, costs, documents, savings options, and practical next steps.`);
  const h1 = `${label} in ${loc.long}`;
  const intro = `Use this guide to decide what to check next for ${label} in ${loc.long}. It focuses on eligibility, costs, documents, payment-help options, and practical next steps so seniors and caregivers can move from research to action without guessing.`;

  return { prefix, title, description, h1, intro };
}

function replaceAttr(html, selector, value) {
  const escaped = escapeHtml(value);
  return html.replace(new RegExp(`(<meta ${selector} content=")[^"]*(" \\/>)`, 'i'), `$1${escaped}$2`);
}

function updateHtml(html, snippet, urlPath) {
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(snippet.title)}</title>`);
  out = replaceAttr(out, 'name="description"', snippet.description);
  out = replaceAttr(out, 'property="og:title"', snippet.title);
  out = replaceAttr(out, 'property="og:description"', snippet.description);
  out = replaceAttr(out, 'name="twitter:title"', snippet.title);
  out = replaceAttr(out, 'name="twitter:description"', snippet.description);

  const canonical = `${BASE_URL}${urlPath}`;
  out = out.replace(/(<meta property="og:url" content=")[^"]*(" \/>)/i, `$1${canonical}$2`);

  out = out.replace(/<h1>([\s\S]*?)<\/h1>/i, `<h1>${escapeHtml(snippet.h1)}</h1>`);
  if (/<p class="engine-intro">[\s\S]*?<\/p>/i.test(out)) {
    out = out.replace(/<p class="engine-intro">[\s\S]*?<\/p>/i, `<p class="engine-intro">${escapeHtml(snippet.intro)}</p>`);
  } else if (/<div class="intro-text">\s*<p>[\s\S]*?<\/p>\s*<\/div>/i.test(out)) {
    out = out.replace(/<div class="intro-text">\s*<p>[\s\S]*?<\/p>\s*<\/div>/i, `<div class="intro-text">\n        <p>${escapeHtml(snippet.intro)}</p>\n      </div>`);
  }

  out = out.replace(/("headline": ")[^"]*(",\n\s*"description": ")[^"]*(")/g, `$1${escapeJson(snippet.title)}$2${escapeJson(snippet.description)}$3`);
  out = out.replace(/("@type": "MedicalWebPage",\n\s*"name": ")[^"]*(",\n\s*"description": ")[^"]*(")/g, `$1${escapeJson(snippet.title)}$2${escapeJson(snippet.description)}$3`);
  out = out.replace(/("dateModified": ")[^"]*(")/g, `$1${TODAY}$2`);

  return out;
}

function updateSitemapDates(changedUrls) {
  const sitemapFiles = fs.readdirSync(ROOT).filter(name => /^sitemap.*\.xml$/.test(name));
  for (const name of sitemapFiles) {
    const file = path.join(ROOT, name);
    let xml = fs.readFileSync(file, 'utf8');
    let touched = false;
    for (const urlPath of changedUrls) {
      const loc = `${BASE_URL}${urlPath}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(<loc>${loc}<\\/loc>\\n\\s*<lastmod>)[^<]+(<\\/lastmod>)`, 'g');
      if (re.test(xml)) {
        xml = xml.replace(re, `$1${TODAY}$2`);
        touched = true;
      }
    }
    if (name === 'sitemap.xml') {
      xml = xml.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${TODAY}</lastmod>`);
      touched = true;
    }
    if (touched) fs.writeFileSync(file, xml, 'utf8');
  }
}

const changedUrls = [];
let examined = 0;
let skippedPriority = 0;

for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const urlPath = canonicalPath(html);
  if (!urlPath) continue;
  examined++;
  if (html.includes('priority-action-path')) {
    skippedPriority++;
    continue;
  }
  const normalized = urlPath.replace(/^\/|\/$/g, '');
  const topic = topics.find(([prefix]) => normalized === prefix || normalized.startsWith(`${prefix}/`));
  if (!topic) continue;
  const loc = locationFor(urlPath, topic[0]);
  if (!loc) continue;
  const snippet = buildSnippet(topic, loc);
  const next = updateHtml(html, snippet, urlPath);
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    changedUrls.push(urlPath);
  }
}

updateSitemapDates(changedUrls);

console.log(`Examined ${examined} pages.`);
console.log(`Skipped ${skippedPriority} already-prioritized pages.`);
console.log(`Upgraded ${changedUrls.length} CTR snippets.`);
