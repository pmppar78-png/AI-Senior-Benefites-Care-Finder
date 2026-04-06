#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = new Set(['engines', 'node_modules', '.netlify', '.git']);

const NEW_LINKS = `
        <a href="/medicare/" style="color:var(--text-muted);text-decoration:none;">Medicare</a>
        <a href="/medicaid/" style="color:var(--text-muted);text-decoration:none;">Medicaid</a>
        <a href="/assisted-living/" style="color:var(--text-muted);text-decoration:none;">Assisted Living</a>
        <a href="/social-security/" style="color:var(--text-muted);text-decoration:none;">Social Security</a>
        <a href="/home-care/" style="color:var(--text-muted);text-decoration:none;">Home Care</a>
        <a href="/veterans-benefits/" style="color:var(--text-muted);text-decoration:none;">Veterans Benefits</a>
        <a href="/prescription-assistance/" style="color:var(--text-muted);text-decoration:none;">Rx Assistance</a>
        <a href="/low-income-programs/" style="color:var(--text-muted);text-decoration:none;">Low-Income Programs</a>
        <a href="/long-term-care/" style="color:var(--text-muted);text-decoration:none;">Long-Term Care</a>
        <a href="/disability-benefits/" style="color:var(--text-muted);text-decoration:none;">Disability Benefits</a>
        <a href="/senior-legal/" style="color:var(--text-muted);text-decoration:none;">Senior Legal</a>
        <a href="/dental-vision-hearing/" style="color:var(--text-muted);text-decoration:none;">Dental, Vision &amp; Hearing</a>
        <a href="/dual-eligible/" style="color:var(--text-muted);text-decoration:none;">Dual Eligible</a>
        <a href="/senior-life-insurance/" style="color:var(--text-muted);text-decoration:none;">Life Insurance</a>
        <a href="/senior-financial-assistance/" style="color:var(--text-muted);text-decoration:none;">Financial Assistance</a>
        <a href="/medical-alert-systems/" style="color:var(--text-muted);text-decoration:none;">Medical Alerts</a>
        <a href="/caregiver-resources/" style="color:var(--text-muted);text-decoration:none;">Caregiver Resources</a>
        <a href="/senior-discounts/" style="color:var(--text-muted);text-decoration:none;">Senior Discounts</a>
        <a href="/providers/" style="color:var(--text-muted);text-decoration:none;">Find Providers</a>
        <a href="/compare/" style="color:var(--text-muted);text-decoration:none;">Compare Options</a>
        <a href="/tools/senior-care-cost-explorer/" style="color:var(--text-muted);text-decoration:none;">Care Cost Explorer</a>
      `;

// The opening tag for the category nav div inside the footer
const OPEN_TAG = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.5rem 1.2rem;margin-bottom:0.8rem;font-size:0.82rem;">';

function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Must have a site-footer containing the category nav div
  const footerIdx = content.indexOf('<footer class="site-footer">');
  if (footerIdx === -1) return false;

  // Find the opening tag of the category nav div after the footer start
  const divStart = content.indexOf(OPEN_TAG, footerIdx);
  if (divStart === -1) return false;

  // Find the closing </div> for this div
  const afterOpen = divStart + OPEN_TAG.length;
  const divEnd = content.indexOf('</div>', afterOpen);
  if (divEnd === -1) return false;

  // Check if the content between the tags contains footer category links (the /medicare/ link)
  const innerContent = content.substring(afterOpen, divEnd);
  if (!innerContent.includes('href="/medicare/"')) return false;

  // Build the replacement: keep the opening tag, insert new links, then closing tag
  const newContent = content.substring(0, afterOpen) + NEW_LINKS + content.substring(divEnd);

  // Only write if something actually changed
  if (newContent === content) return false;

  fs.writeFileSync(filePath, newContent, 'utf8');
  return true;
}

const files = collectHtmlFiles(ROOT);
let modified = 0;

for (const f of files) {
  if (processFile(f)) {
    modified++;
  }
}

console.log(`Scanned ${files.length} HTML files, modified ${modified} files.`);
