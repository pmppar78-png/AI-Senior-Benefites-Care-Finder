const fs = require('fs');
const path = require('path');
const { getPriorityPage, priorityPages } = require('../engines/priority-pages');

const ROOT = path.resolve(__dirname, '..');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sectionFor(page) {
  const links = page.priorityActionLinks.map(link => `      <a href="${link.url}" class="info-box" style="text-decoration:none;color:inherit;">
        <h3>${escapeHtml(link.title)}</h3>
        <p>${escapeHtml(link.description)}</p>
      </a>`).join('\n');

  return `  <section class="content-section priority-action-path" id="priority-action-path">
    <h2>${escapeHtml(page.priorityActionHeading)}</h2>
    <p>${escapeHtml(page.priorityActionIntro)}</p>
    <div class="related-links-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-top:1rem;">
${links}
    </div>
  </section>
`;
}

function applyPage(pagePath, spec) {
  const file = path.join(ROOT, pagePath.replace(/^\/|\/$/g, ''), 'index.html');
  if (!fs.existsSync(file)) {
    throw new Error(`Missing page: ${pagePath}`);
  }

  const page = getPriorityPage(pagePath);
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(spec.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*" \/>/i, `<meta name="description" content="${escapeHtml(spec.description)}" />`);
  if (/<meta name="robots" content="[^"]*" \/>/i.test(html)) {
    html = html.replace(/<meta name="robots" content="[^"]*" \/>/i, '<meta name="robots" content="index, follow" />');
  } else {
    html = html.replace(/(<meta name="description" content="[^"]*" \/>)/i, '$1\n  <meta name="robots" content="index, follow" />');
  }
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/i, `<meta property="og:title" content="${escapeHtml(spec.title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/i, `<meta property="og:description" content="${escapeHtml(spec.description)}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/i, `<meta name="twitter:title" content="${escapeHtml(spec.title)}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/i, `<meta name="twitter:description" content="${escapeHtml(spec.description)}" />`);
  html = html.replace(
    /("@type": "Article",\n    "headline": ")[^"]*(",\n    "description": ")[^"]*(")/,
    `$1${escapeHtml(spec.title)}$2${escapeHtml(spec.description)}$3`
  );
  html = html.replace(
    /("@type": "MedicalWebPage",\n    "name": ")[^"]*(",\n    "description": ")[^"]*(")/,
    `$1${escapeHtml(spec.title)}$2${escapeHtml(spec.description)}$3`
  );
  html = html.replace(/<h1>[\s\S]*?<\/h1>/i, `<h1>${escapeHtml(spec.h1)}</h1>`);
  html = html.replace(/<div class="intro-text">[\s\S]*?<\/div>/i, `<div class="intro-text">\n        ${spec.intro}\n      </div>`);

  html = html.replace(/\n  <section class="content-section priority-action-path" id="priority-action-path">[\s\S]*?\n  <\/section>\n/, '\n');
  const insertion = sectionFor(page);
  html = html.replace(/(<\/div>\n\n\n    <!-- Section: [^>]+ -->)/, `</div>\n${insertion}\n\n    <!-- Section: ${html.match(/<!-- Section: ([^>]+) -->/)?.[1] || 'Overview'} -->`);

  fs.writeFileSync(file, html, 'utf8');
  return file;
}

let count = 0;
for (const [pagePath, spec] of Object.entries(priorityPages)) {
  applyPage(pagePath, spec);
  count++;
}

console.log(`Applied priority indexing upgrades to ${count} pages.`);
