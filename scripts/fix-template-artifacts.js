#!/usr/bin/env node
/**
 * fix-template-artifacts.js
 *
 * Removes raw Handlebars template syntax that was not processed during
 * static-site generation.  Only removes template tags — never touches
 * the real content they wrap.
 *
 * Patterns handled (each on its own line, possibly with whitespace):
 *   {{#if ...}}   {{/if}}   {{else}}
 *   {{#each ...}} {{/each}}
 *   {{> partial}}
 *   {{variable}}  {{{variable}}}
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.netlify', 'engines']);

// Matches a line that contains ONLY whitespace + a Handlebars tag + whitespace
const STANDALONE_TAG_LINE = /^[ \t]*\{\{[#/>{]?[^}]*\}\}\}?[ \t]*$/;

/**
 * Recursively collect all .html files, skipping excluded directories.
 */
function collectHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Returns true if a line is purely a Handlebars tag (with optional whitespace).
 */
function isStandaloneTagLine(line) {
  return STANDALONE_TAG_LINE.test(line);
}

/**
 * Quick check: does the file content contain any raw Handlebars syntax?
 */
function containsTemplateSyntax(content) {
  return /\{\{/.test(content);
}

/**
 * Process a single file.  Returns true if the file was modified.
 */
function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!containsTemplateSyntax(original)) return false;

  const lines = original.split('\n');
  const cleaned = [];

  for (const line of lines) {
    if (isStandaloneTagLine(line)) {
      // Drop the entire line — it is only a template tag.
      continue;
    }

    // For inline leftover tags embedded within real content,
    // strip them but keep surrounding text.
    let fixed = line;
    // Triple-brace unescaped variables: {{{var}}}
    fixed = fixed.replace(/\{\{\{[^}]+\}\}\}/g, '');
    // Block helpers / partials / variables: {{...}}
    fixed = fixed.replace(/\{\{[^}]+\}\}/g, '');

    cleaned.push(fixed);
  }

  const result = cleaned.join('\n');
  if (result !== original) {
    fs.writeFileSync(filePath, result, 'utf8');
    return true;
  }
  return false;
}

// ── Main ──────────────────────────────────────────────────────────────
const files = collectHtmlFiles(ROOT);
let fixedCount = 0;

for (const f of files) {
  if (fixFile(f)) fixedCount++;
}

console.log(`Scanned ${files.length} HTML files.`);
console.log(`Fixed ${fixedCount} files with raw Handlebars template artifacts.`);
