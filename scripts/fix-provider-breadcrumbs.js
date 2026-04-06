#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROVIDERS_DIR = path.join(__dirname, '..', 'providers');

const PROVIDER_TYPES = [
  'nursing-homes',
  'assisted-living-facilities',
  'home-health-agencies',
  'hospice-providers',
  'memory-care-facilities',
  'adult-day-care',
  'rehabilitation-centers',
];

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.name === 'index.html') {
      results.push(fullPath);
    }
  }
  return results;
}

function fixBreadcrumbs(filePath) {
  // Extract path parts relative to /providers/
  const relPath = path.relative(PROVIDERS_DIR, filePath);
  const parts = relPath.split(path.sep);
  // Expected: PROVIDER-TYPE/STATE/index.html or PROVIDER-TYPE/STATE/CITY/index.html
  if (parts.length < 3) return false; // Not deep enough (e.g., providers/index.html or providers/TYPE/index.html)

  const providerType = parts[0];
  if (!PROVIDER_TYPES.includes(providerType)) return false;

  const state = parts[1];
  const city = parts.length >= 4 ? parts[2] : null;

  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // Fix visible breadcrumb links and JSON-LD breadcrumb links
  // Pattern: href="/providers/STATE/" should become href="/providers/PROVIDER-TYPE/STATE/"
  // But only when the provider type is NOT already in the URL

  // Fix state-level breadcrumb: /providers/STATE/ -> /providers/PROVIDER-TYPE/STATE/
  // Use a regex that matches /providers/STATE/ but NOT /providers/PROVIDER-TYPE/STATE/
  const statePattern = new RegExp(
    `(href=["'])/providers/${escapeRegex(state)}/(["'])`,
    'g'
  );
  html = html.replace(statePattern, (match, prefix, suffix) => {
    return `${prefix}/providers/${providerType}/${state}/${suffix}`;
  });

  // Also fix full URL versions (with domain)
  const stateFullPattern = new RegExp(
    `(["'])https://seniorbenefitscarefinder\\.com/providers/${escapeRegex(state)}/(["'])`,
    'g'
  );
  html = html.replace(stateFullPattern, (match, q1, q2) => {
    return `${q1}https://seniorbenefitscarefinder.com/providers/${providerType}/${state}/${q2}`;
  });

  // Fix city-level breadcrumb if applicable: /providers/STATE/CITY/ -> /providers/PROVIDER-TYPE/STATE/CITY/
  if (city) {
    const cityPattern = new RegExp(
      `(href=["'])/providers/${escapeRegex(state)}/${escapeRegex(city)}/(["'])`,
      'g'
    );
    html = html.replace(cityPattern, (match, prefix, suffix) => {
      return `${prefix}/providers/${providerType}/${state}/${city}/${suffix}`;
    });

    const cityFullPattern = new RegExp(
      `(["'])https://seniorbenefitscarefinder\\.com/providers/${escapeRegex(state)}/${escapeRegex(city)}/(["'])`,
      'g'
    );
    html = html.replace(cityFullPattern, (match, q1, q2) => {
      return `${q1}https://seniorbenefitscarefinder.com/providers/${providerType}/${state}/${city}/${q2}`;
    });
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  }
  return false;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main
const allFiles = findHtmlFiles(PROVIDERS_DIR);
let fixedCount = 0;
let scannedCount = 0;

for (const file of allFiles) {
  scannedCount++;
  if (fixBreadcrumbs(file)) {
    fixedCount++;
  }
}

console.log(`Scanned ${scannedCount} HTML files.`);
console.log(`Fixed breadcrumbs in ${fixedCount} files.`);
