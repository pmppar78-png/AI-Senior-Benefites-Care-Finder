#!/usr/bin/env node
/**
 * defer-hamburger-init.cjs
 *
 * Wraps the inline hamburger-menu initialization IIFE in a
 * DOMContentLoaded event listener so that its DOM queries and
 * event-listener registrations don't run during the initial
 * HTML parse, freeing the main thread for paint.
 *
 * The exact IIFE pattern (verified across sample template pages and in
 * `engines/partials/header.html`) is:
 *
 *   <script>
 *     (function() {
 *       var btn = document.getElementById('hamburgerBtn');
 *       var menu = document.getElementById('mobileMenu');
 *       btn.addEventListener('click', function() {
 *         var open = menu.classList.toggle('open');
 *         btn.classList.toggle('open', open);
 *         btn.setAttribute('aria-expanded', open);
 *       });
 *       document.addEventListener('click', function(e) {
 *         if (!btn.contains(e.target) && !menu.contains(e.target)) {
 *           menu.classList.remove('open');
 *           btn.classList.remove('open');
 *           btn.setAttribute('aria-expanded', 'false');
 *         }
 *       });
 *     })();
 *   </script>
 *
 * Because the pattern is byte-for-byte identical everywhere, we do a
 * literal string replacement — safer than regex surgery and trivially
 * idempotent (already-wrapped pages won't match).
 *
 * If a page has a variant we don't recognize, it is skipped and counted.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.netlify',
  'netlify',
  'scripts',
]);

function* walkHtml(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkHtml(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

// The two exact literal blocks we expect to find. Both are present in the
// current codebase: one is emitted by `engines/partials/header.html` into
// generated pages; the other is hand-authored into index.html / 404.html /
// senior-discounts/index.html (and the template partial itself).
const OLD_BLOCK = `  <script>
    (function() {
      var btn = document.getElementById('hamburgerBtn');
      var menu = document.getElementById('mobileMenu');
      btn.addEventListener('click', function() {
        var open = menu.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
      });
      document.addEventListener('click', function(e) {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('open');
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    })();
  </script>`;

const NEW_BLOCK = `  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var btn = document.getElementById('hamburgerBtn');
      var menu = document.getElementById('mobileMenu');
      if (!btn || !menu) return;
      btn.addEventListener('click', function() {
        var open = menu.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
      });
      document.addEventListener('click', function(e) {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('open');
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  </script>`;

function transform(html) {
  if (!html.includes(OLD_BLOCK)) return html;
  return html.split(OLD_BLOCK).join(NEW_BLOCK);
}

function main() {
  let scanned = 0;
  let modified = 0;
  let alreadyWrapped = 0;
  let noHamburger = 0;
  for (const file of walkHtml(REPO_ROOT)) {
    scanned++;
    const original = fs.readFileSync(file, 'utf8');
    if (!original.includes('hamburgerBtn')) {
      noHamburger++;
      continue;
    }
    const next = transform(original);
    if (next === original) {
      // Already wrapped or non-matching variant.
      if (original.includes("addEventListener('DOMContentLoaded'")) {
        alreadyWrapped++;
      }
      continue;
    }
    fs.writeFileSync(file, next, 'utf8');
    modified++;
  }
  console.log(
    `[defer-hamburger-init] scanned ${scanned}, modified ${modified}, ` +
      `already-wrapped ${alreadyWrapped}, no-hamburger ${noHamburger}`
  );
}

main();
