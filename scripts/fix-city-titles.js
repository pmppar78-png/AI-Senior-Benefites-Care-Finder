#!/usr/bin/env node
/**
 * fix-city-titles.js
 *
 * Finds all city-level HTML pages whose <title> and meta description tags
 * reference only the state name instead of the city name, and rewrites them
 * to include "City, ST" (or "City, StateName") matching the H1.
 */

const fs = require('fs');
const path = require('path');

// ── state look-ups ──────────────────────────────────────────────────────────
const STATES = [
  {slug:'alabama',name:'Alabama',abbr:'AL'},{slug:'alaska',name:'Alaska',abbr:'AK'},
  {slug:'arizona',name:'Arizona',abbr:'AZ'},{slug:'arkansas',name:'Arkansas',abbr:'AR'},
  {slug:'california',name:'California',abbr:'CA'},{slug:'colorado',name:'Colorado',abbr:'CO'},
  {slug:'connecticut',name:'Connecticut',abbr:'CT'},{slug:'delaware',name:'Delaware',abbr:'DE'},
  {slug:'florida',name:'Florida',abbr:'FL'},{slug:'georgia',name:'Georgia',abbr:'GA'},
  {slug:'hawaii',name:'Hawaii',abbr:'HI'},{slug:'idaho',name:'Idaho',abbr:'ID'},
  {slug:'illinois',name:'Illinois',abbr:'IL'},{slug:'indiana',name:'Indiana',abbr:'IN'},
  {slug:'iowa',name:'Iowa',abbr:'IA'},{slug:'kansas',name:'Kansas',abbr:'KS'},
  {slug:'kentucky',name:'Kentucky',abbr:'KY'},{slug:'louisiana',name:'Louisiana',abbr:'LA'},
  {slug:'maine',name:'Maine',abbr:'ME'},{slug:'maryland',name:'Maryland',abbr:'MD'},
  {slug:'massachusetts',name:'Massachusetts',abbr:'MA'},{slug:'michigan',name:'Michigan',abbr:'MI'},
  {slug:'minnesota',name:'Minnesota',abbr:'MN'},{slug:'mississippi',name:'Mississippi',abbr:'MS'},
  {slug:'missouri',name:'Missouri',abbr:'MO'},{slug:'montana',name:'Montana',abbr:'MT'},
  {slug:'nebraska',name:'Nebraska',abbr:'NE'},{slug:'nevada',name:'Nevada',abbr:'NV'},
  {slug:'new-hampshire',name:'New Hampshire',abbr:'NH'},{slug:'new-jersey',name:'New Jersey',abbr:'NJ'},
  {slug:'new-mexico',name:'New Mexico',abbr:'NM'},{slug:'new-york',name:'New York',abbr:'NY'},
  {slug:'north-carolina',name:'North Carolina',abbr:'NC'},{slug:'north-dakota',name:'North Dakota',abbr:'ND'},
  {slug:'ohio',name:'Ohio',abbr:'OH'},{slug:'oklahoma',name:'Oklahoma',abbr:'OK'},
  {slug:'oregon',name:'Oregon',abbr:'OR'},{slug:'pennsylvania',name:'Pennsylvania',abbr:'PA'},
  {slug:'rhode-island',name:'Rhode Island',abbr:'RI'},{slug:'south-carolina',name:'South Carolina',abbr:'SC'},
  {slug:'south-dakota',name:'South Dakota',abbr:'SD'},{slug:'tennessee',name:'Tennessee',abbr:'TN'},
  {slug:'texas',name:'Texas',abbr:'TX'},{slug:'utah',name:'Utah',abbr:'UT'},
  {slug:'vermont',name:'Vermont',abbr:'VT'},{slug:'virginia',name:'Virginia',abbr:'VA'},
  {slug:'washington',name:'Washington',abbr:'WA'},{slug:'west-virginia',name:'West Virginia',abbr:'WV'},
  {slug:'wisconsin',name:'Wisconsin',abbr:'WI'},{slug:'wyoming',name:'Wyoming',abbr:'WY'},
  {slug:'district-of-columbia',name:'District of Columbia',abbr:'DC'},
];

const slugToState = {};
for (const s of STATES) slugToState[s.slug] = s;

const nameToState = {};
for (const s of STATES) nameToState[s.name.toLowerCase()] = s;

const abbrToState = {};
for (const s of STATES) abbrToState[s.abbr] = s;

// ── helpers ─────────────────────────────────────────────────────────────────

/**
 * Recursively collect all index.html files under `dir`.
 */
function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.netlify' || entry.name === '.git') continue;
      walk(full, results);
    } else if (entry.name === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

/**
 * From the H1, extract city name and the "City, XX" or "City, StateName" string.
 * Returns { city, stateAbbr, stateName, cityStateH1 } or null.
 *
 * Patterns matched:
 *   "in Los Angeles, CA (2026)"   -> city="Los Angeles", stateAbbr="CA"
 *   "in Cheyenne, Wyoming"        -> city="Cheyenne", stateName="Wyoming"
 */
function extractCityFromH1(html) {
  // Match H1 content
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) return null;
  const h1Text = h1Match[1].trim();

  // Pattern 1: "in City, XX" where XX is a 2-letter state abbreviation
  const abbrPattern = /in\s+(.+?),\s*([A-Z]{2})\b/;
  const abbrMatch = h1Text.match(abbrPattern);
  if (abbrMatch) {
    const city = abbrMatch[1].trim();
    const abbr = abbrMatch[2];
    const stateObj = abbrToState[abbr];
    if (stateObj) {
      return { city, stateAbbr: abbr, stateName: stateObj.name, cityStateStr: `${city}, ${abbr}` };
    }
  }

  // Pattern 2: "in City, StateName" where StateName is a full state name
  const fullPattern = /in\s+(.+?),\s*([A-Z][a-z]+(?:\s+[A-Za-z]+)*)/;
  const fullMatch = h1Text.match(fullPattern);
  if (fullMatch) {
    const city = fullMatch[1].trim();
    const possibleState = fullMatch[2].trim();
    const stateObj = nameToState[possibleState.toLowerCase()];
    if (stateObj) {
      return { city, stateAbbr: stateObj.abbr, stateName: stateObj.name, cityStateStr: `${city}, ${possibleState}` };
    }
  }

  return null;
}

/**
 * Determine the state name that currently appears in a tag value.
 * We look for the full state name in the string.
 */
function findStateNameInText(text, stateName) {
  // Look for the state name (case-sensitive since state names are proper nouns)
  return text.includes(stateName);
}

/**
 * Replace the state name with the city+state string in a tag value.
 * Only replaces the FIRST occurrence that looks like a standalone state reference.
 * E.g., "Assisted Living Cost in Alabama" -> "Assisted Living Cost in Huntsville, AL"
 */
function replaceStateWithCity(text, stateName, cityStateStr) {
  // Replace " in StateName" with " in City, ST"
  const inPattern = new RegExp(`(\\bin\\s+)${escapeRegex(stateName)}\\b`);
  if (inPattern.test(text)) {
    return text.replace(inPattern, `$1${cityStateStr}`);
  }

  // Replace standalone state name occurrence
  const standalonePattern = new RegExp(`\\b${escapeRegex(stateName)}\\b`);
  if (standalonePattern.test(text)) {
    return text.replace(standalonePattern, cityStateStr);
  }

  return text;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── main ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const allFiles = walk(ROOT);
let modified = 0;
let skipped = 0;

for (const filePath of allFiles) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Extract city info from H1
  const cityInfo = extractCityFromH1(html);
  if (!cityInfo) continue; // Not a city page or no recognizable pattern

  const { city, stateAbbr, stateName, cityStateStr } = cityInfo;

  // Check if the <title> already contains the city name
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!titleMatch) continue;
  const titleText = titleMatch[1];

  // If the title already contains the city name, skip this file
  if (titleText.includes(city)) {
    skipped++;
    continue;
  }

  // Confirm the title contains the state name (so we have something to replace)
  if (!findStateNameInText(titleText, stateName)) {
    skipped++;
    continue;
  }

  let newHtml = html;

  // Fix <title>
  newHtml = newHtml.replace(
    /<title>([\s\S]*?)<\/title>/i,
    (match, content) => `<title>${replaceStateWithCity(content, stateName, cityStateStr)}</title>`
  );

  // Fix <meta name="description">
  newHtml = newHtml.replace(
    /(<meta\s+name="description"\s+content=")([\s\S]*?)(")/i,
    (match, prefix, content, suffix) => `${prefix}${replaceStateWithCity(content, stateName, cityStateStr)}${suffix}`
  );

  // Fix og:title
  newHtml = newHtml.replace(
    /(<meta\s+property="og:title"\s+content=")([\s\S]*?)(")/i,
    (match, prefix, content, suffix) => `${prefix}${replaceStateWithCity(content, stateName, cityStateStr)}${suffix}`
  );

  // Fix og:description
  newHtml = newHtml.replace(
    /(<meta\s+property="og:description"\s+content=")([\s\S]*?)(")/i,
    (match, prefix, content, suffix) => `${prefix}${replaceStateWithCity(content, stateName, cityStateStr)}${suffix}`
  );

  // Fix twitter:title
  newHtml = newHtml.replace(
    /(<meta\s+name="twitter:title"\s+content=")([\s\S]*?)(")/i,
    (match, prefix, content, suffix) => `${prefix}${replaceStateWithCity(content, stateName, cityStateStr)}${suffix}`
  );

  // Fix twitter:description
  newHtml = newHtml.replace(
    /(<meta\s+name="twitter:description"\s+content=")([\s\S]*?)(")/i,
    (match, prefix, content, suffix) => `${prefix}${replaceStateWithCity(content, stateName, cityStateStr)}${suffix}`
  );

  if (newHtml !== html) {
    fs.writeFileSync(filePath, newHtml, 'utf8');
    modified++;
  } else {
    skipped++;
  }
}

console.log(`Done. Modified ${modified} files. Skipped ${skipped} files (already correct or no match).`);
