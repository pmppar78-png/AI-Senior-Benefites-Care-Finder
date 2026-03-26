/**
 * Page Generator for Senior Benefits Care Finder
 *
 * Reads engine configs, templates, partials, and data files
 * to produce static HTML pages at scale.
 *
 * Usage:
 *   node engines/generator.js                  # Generate all pages
 *   node engines/generator.js --dry-run        # Preview without writing
 *   node engines/generator.js --engine medicare # Generate one engine only
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENGINES_DIR = __dirname;
const TEMPLATES_DIR = path.join(ENGINES_DIR, 'templates');
const PARTIALS_DIR = path.join(ENGINES_DIR, 'partials');
const DATA_DIR = path.join(ENGINES_DIR, 'data');
const OUTPUT_DIR = ROOT; // Write pages into the project root

// ---------------------------------------------------------------------------
// Template Engine
// ---------------------------------------------------------------------------

class TemplateEngine {
  constructor() {
    this.partials = {};
  }

  loadPartials(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    for (const file of files) {
      const name = path.basename(file, '.html');
      this.partials[name] = fs.readFileSync(path.join(dir, file), 'utf8');
    }
    console.log(`  Loaded ${files.length} partials`);
  }

  render(template, data) {
    let output = template;

    // 1. Include partials (recursive, up to 5 levels deep)
    for (let i = 0; i < 5; i++) {
      const before = output;
      output = this._includePartials(output);
      if (output === before) break;
    }

    // 2. Process {{#each}} loops
    output = this._processLoops(output, data);

    // 3. Process {{#if}} conditionals
    output = this._processConditionals(output, data);

    // 4. Replace variables
    output = this._replaceVariables(output, data);

    return output;
  }

  _includePartials(template) {
    return template.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (match, name) => {
      return this.partials[name] || `<!-- partial "${name}" not found -->`;
    });
  }

  _processConditionals(template, data) {
    // Nested conditionals: process from innermost to outermost
    let output = template;
    let limit = 20;
    while (limit-- > 0) {
      const before = output;
      output = output.replace(
        /\{\{#if\s+([@\w.]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/,
        (match, key, ifBlock, elseBlock) => {
          const value = this._resolve(data, key);
          if (value && (!Array.isArray(value) || value.length > 0)) {
            return ifBlock;
          }
          return elseBlock || '';
        }
      );
      if (output === before) break;
    }
    return output;
  }

  _processLoops(template, data) {
    let output = template;
    let limit = 30;
    while (limit-- > 0) {
      const before = output;
      output = output.replace(
        /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/,
        (match, key, block) => {
          const items = this._resolve(data, key);
          if (!Array.isArray(items)) return '';
          return items.map((item, index) => {
            const ctx = typeof item === 'object' && item !== null
              ? { ...data, ...item, _parent: data }
              : { ...data, _item: item, _parent: data };
            ctx['@index'] = index;
            ctx['@number'] = index + 1;
            ctx['@first'] = index === 0;
            ctx['@last'] = index === items.length - 1;
            ctx['@total'] = items.length;

            let rendered = this._processConditionals(block, ctx);
            rendered = this._replaceVariables(rendered, ctx);
            return rendered;
          }).join('');
        }
      );
      if (output === before) break;
    }
    return output;
  }

  _replaceVariables(template, data) {
    // Unescaped: {{{variable}}}
    let output = template.replace(/\{\{\{([\w.@]+)\}\}\}/g, (match, key) => {
      const val = this._resolve(data, key);
      return val != null ? String(val) : '';
    });
    // Escaped: {{variable}}
    output = output.replace(/\{\{([\w.@]+)\}\}/g, (match, key) => {
      const val = this._resolve(data, key);
      return val != null ? this._escape(String(val)) : '';
    });
    return output;
  }

  _resolve(data, key) {
    if (key.startsWith('@')) return data[key];
    const parts = key.split('.');
    let value = data;
    for (const part of parts) {
      if (value == null) return undefined;
      value = value[part];
    }
    return value;
  }

  _escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// ---------------------------------------------------------------------------
// Page Generator
// ---------------------------------------------------------------------------

class PageGenerator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.engineFilter = options.engineFilter || null;
    this.engineIds = options.engineIds || null;
    this.limit = options.limit || null;
    this.engine = new TemplateEngine();
    this.templates = {};
    this.states = [];
    this.cities = [];
    this.stats = { engines: 0, pages: 0, errors: 0 };
  }

  run() {
    console.log('\n=== Senior Benefits Care Finder — Page Generator ===\n');
    if (this.dryRun) console.log('  [DRY RUN — no files will be written]\n');
    if (this.limit) console.log(`  [LIMIT — max ${this.limit} pages per engine]\n`);

    // Load resources
    this.engine.loadPartials(PARTIALS_DIR);
    this._loadTemplates();
    this._loadReferenceData();

    // Load engine config
    const config = require('./config');
    let engines;

    if (this.engineIds) {
      engines = config.engines.filter(e => this.engineIds.includes(e.id));
    } else if (this.engineFilter) {
      engines = config.engines.filter(e => e.id === this.engineFilter);
    } else {
      engines = config.engines;
    }

    if (engines.length === 0) {
      console.error(`  No engines found matching the given filter`);
      process.exit(1);
    }

    console.log(`\n  Processing ${engines.length} engine(s)...\n`);

    for (const eng of engines) {
      this._processEngine(eng);
    }

    console.log('\n=== Generation Complete ===');
    console.log(`  Engines:  ${this.stats.engines}`);
    console.log(`  Pages:    ${this.stats.pages}`);
    console.log(`  Errors:   ${this.stats.errors}\n`);
  }

  _loadTemplates() {
    if (!fs.existsSync(TEMPLATES_DIR)) return;
    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.html'));
    for (const file of files) {
      const name = path.basename(file, '.html');
      this.templates[name] = fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8');
    }
    console.log(`  Loaded ${files.length} templates`);
  }

  _loadReferenceData() {
    const statesFile = path.join(DATA_DIR, 'states.json');
    const citiesFile = path.join(DATA_DIR, 'top-cities.json');
    if (fs.existsSync(statesFile)) {
      this.states = JSON.parse(fs.readFileSync(statesFile, 'utf8'));
      console.log(`  Loaded ${this.states.length} states`);
    }
    if (fs.existsSync(citiesFile)) {
      this.cities = JSON.parse(fs.readFileSync(citiesFile, 'utf8'));
      console.log(`  Loaded ${this.cities.length} cities`);
    }
  }

  _processEngine(eng) {
    console.log(`  Engine: ${eng.name} (${eng.id})`);
    this.stats.engines++;

    const template = this.templates[eng.template];
    if (!template) {
      console.error(`    Template "${eng.template}" not found — skipping`);
      this.stats.errors++;
      return;
    }

    // Load engine-specific data
    const dataFile = path.join(DATA_DIR, `${eng.id}.json`);
    let entries = [];

    if (fs.existsSync(dataFile)) {
      entries = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      if (!Array.isArray(entries)) entries = [entries];
    } else {
      // Auto-generate entries from reference data based on engine scope
      entries = this._autoGenerateEntries(eng);
    }

    if (entries.length === 0) {
      console.log('    No data entries — skipping (populate data file to generate pages)');
      return;
    }

    // Apply per-engine limit if set
    if (this.limit && entries.length > this.limit) {
      console.log(`    Limiting from ${entries.length} to ${this.limit} entries`);
      entries = entries.slice(0, this.limit);
    }

    for (const entry of entries) {
      try {
        this._generatePage(eng, template, entry);
      } catch (err) {
        console.error(`    Error generating ${entry.slug || 'unknown'}: ${err.message}`);
        this.stats.errors++;
      }
    }
  }

  _autoGenerateEntries(eng) {
    // When no data file exists, return empty — pages won't be generated
    // until data files are populated. This is by design for the engine build phase.
    return [];
  }

  _generatePage(eng, template, entry) {
    // Build full data context
    const data = this._buildContext(eng, entry);

    // Render
    const html = this.engine.render(template, data);

    // Determine output path — use city/state URL pattern when entry has city/state data
    let urlPattern = eng.urlPattern;
    if (data.citySlug && eng.cityUrlPattern) {
      urlPattern = eng.cityUrlPattern;
    } else if (data.stateSlug && eng.stateUrlPattern) {
      urlPattern = eng.stateUrlPattern;
    }
    const urlPath = this._buildUrl(urlPattern, data);
    const outputPath = path.join(OUTPUT_DIR, urlPath, 'index.html');

    if (this.dryRun) {
      console.log(`    [dry-run] Would write: ${urlPath}`);
    } else {
      const dir = path.dirname(outputPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outputPath, html, 'utf8');
      console.log(`    Generated: ${urlPath}`);
    }

    this.stats.pages++;
  }

  _buildContext(eng, entry) {
    // Merge reference data, engine config, and entry data
    const state = entry.stateSlug
      ? this.states.find(s => s.slug === entry.stateSlug)
      : null;
    const city = entry.citySlug
      ? this.cities.find(c => c.slug === entry.citySlug && c.stateSlug === entry.stateSlug)
      : null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const lastUpdated = now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Generate varied datePublished based on content identifier for realistic metadata
    const contentId = `${eng.id}-${entry.stateSlug || ''}-${entry.citySlug || ''}-${entry.slug || ''}`;
    const datePublished = this._generateDatePublished(contentId);

    // Resolve state and city names from reference data (fallback to entry data)
    const resolvedState = state ? state.name : (entry.state || '');
    const resolvedStateAbbr = state ? state.abbr : (entry.stateAbbr || '');
    const resolvedStateSlug = state ? state.slug : (entry.stateSlug || '');
    const resolvedCity = city ? city.name : (entry.city || '');
    const resolvedCitySlug = city ? city.slug : (entry.citySlug || '');

    // Build SEO data with resolved state/city names for proper interpolation
    const seoData = { ...entry, state: resolvedState, stateAbbr: resolvedStateAbbr, stateSlug: resolvedStateSlug, city: resolvedCity, citySlug: resolvedCitySlug, currentYear };

    // Determine canonical URL — city pages get self-referencing canonicals
    let canonicalPattern = eng.urlPattern;
    if (resolvedCitySlug && eng.cityUrlPattern) {
      canonicalPattern = eng.cityUrlPattern;
    } else if (resolvedStateSlug && eng.stateUrlPattern) {
      canonicalPattern = eng.stateUrlPattern;
    }

    return {
      // Engine meta
      engineId: eng.id,
      engineName: eng.name,
      schemaType: eng.schemaType || 'Article',

      // SEO — built from patterns with resolved state/city names
      pageTitle: this._interpolatePattern(eng.seoTitle, seoData),
      metaDescription: this._interpolatePattern(eng.metaDescription, seoData),
      canonicalUrl: `https://seniorbenefitscarefinder.com${this._buildUrl(canonicalPattern, seoData)}/`.replace(/\/\/$/, '/'),

      // Location data
      state: resolvedState,
      stateAbbr: resolvedStateAbbr,
      stateSlug: resolvedStateSlug,
      city: resolvedCity,
      citySlug: resolvedCitySlug,
      county: entry.county || '',
      countySlug: entry.countySlug || '',

      // Time
      currentYear,
      lastUpdated,
      datePublished,

      // Reference data
      allStates: this.states,
      allCities: this.cities,

      // Entry data (overrides anything above)
      ...entry,

      // Ensure resolved names are not overridden by empty entry values
      state: resolvedState,
      stateAbbr: resolvedStateAbbr,
      stateSlug: resolvedStateSlug,
      city: resolvedCity,
      citySlug: resolvedCitySlug,

      // State URL base for correct state-index linking
      stateUrlBase: eng.urlPattern ? eng.urlPattern.replace(/\/\[\w+\]$/g, '').replace(/\/\[\w+\]/g, '') : `/${eng.id}`,

      // Related pages
      relatedEngines: eng.relatedEngines || [],

      // Breadcrumbs
      breadcrumbs: this._buildBreadcrumbs(eng, entry, state, city),

      // Internal links — sibling pages from same engine
      siblingStates: eng.scope === 'state' || eng.scope === 'state+city'
        ? this.states.filter(s => s.slug !== (entry.stateSlug || '')).slice(0, 10)
        : [],
    };
  }

  _buildBreadcrumbs(eng, entry, state, city) {
    const crumbs = [{ label: 'Home', url: '/' }];

    if (eng.category) {
      crumbs.push({ label: eng.categoryLabel || eng.category, url: `/${eng.category}/` });
    }

    if (state) {
      crumbs.push({
        label: state.name,
        url: `/${eng.category || eng.id}/${state.slug}/`
      });
    }

    if (city) {
      crumbs.push({
        label: city.name,
        url: `/${eng.category || eng.id}/${state.slug}/${city.slug}/`
      });
    }

    // Current page
    const currentLabel = entry.breadcrumbLabel || entry.h1 || eng.name;
    crumbs.push({ label: currentLabel, url: null });

    return crumbs;
  }

  _buildUrl(pattern, data) {
    return pattern.replace(/\[(\w+)\]/g, (match, key) => {
      return data[key] != null && data[key] !== '' ? data[key] : '';
    });
  }

  _interpolatePattern(pattern, data) {
    if (!pattern) return '';
    return pattern.replace(/\[(\w+)\]/g, (match, key) => {
      return data[key] != null && data[key] !== '' ? data[key] : '';
    });
  }

  /**
   * Generate a varied datePublished based on a simple hash of the content identifier.
   * Spreads dates between 2024-09-01 and 2025-12-15 to avoid identical timestamps.
   */
  _generateDatePublished(contentId) {
    let hash = 0;
    for (let i = 0; i < contentId.length; i++) {
      hash = ((hash << 5) - hash + contentId.charCodeAt(i)) | 0;
    }
    hash = Math.abs(hash);
    // Range: Sep 2024 to Dec 2025 (~470 days)
    const startDate = new Date('2024-09-01');
    const dayOffset = hash % 470;
    const pubDate = new Date(startDate.getTime() + dayOffset * 86400000);
    return pubDate.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(args) {
  const options = {
    dryRun: args.includes('--dry-run'),
    engineFilter: null,
    batch: null,
    limit: null,
  };

  const engineIdx = args.indexOf('--engine');
  if (engineIdx !== -1 && args[engineIdx + 1]) {
    options.engineFilter = args[engineIdx + 1];
  }

  const batchIdx = args.indexOf('--batch');
  if (batchIdx !== -1 && args[batchIdx + 1]) {
    options.batch = parseInt(args[batchIdx + 1], 10);
  }

  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    options.limit = parseInt(args[limitIdx + 1], 10);
  }

  return options;
}

/**
 * Batch mode splits engines into numbered groups so generation
 * can be run incrementally without exceeding memory/time limits.
 *
 * Batch assignments (14 engines, 3 batches):
 *   Batch 1: medicare, medicaid, assisted-living, social-security, home-care
 *   Batch 2: prescription-assistance, veterans-benefits, comparison, low-income-programs, disability-benefits
 *   Batch 3: long-term-care, senior-legal, provider-directory, authority-page
 */
const BATCH_MAP = {
  1: ['medicare', 'medicaid', 'assisted-living', 'social-security', 'home-care'],
  2: ['prescription-assistance', 'veterans-benefits', 'comparison', 'low-income-programs', 'disability-benefits'],
  3: ['long-term-care', 'senior-legal', 'provider-directory', 'authority-page'],
};

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Load engine config
  const config = require('./config');

  // Resolve which engines to run
  let engineIds = null;

  if (options.batch) {
    engineIds = BATCH_MAP[options.batch];
    if (!engineIds) {
      console.error(`Unknown batch number: ${options.batch}. Valid batches: ${Object.keys(BATCH_MAP).join(', ')}`);
      process.exit(1);
    }
    console.log(`\n  Batch ${options.batch}: ${engineIds.join(', ')}`);
  }

  if (options.engineFilter) {
    engineIds = [options.engineFilter];
  }

  // Apply engine filter
  if (engineIds) {
    options.engineFilter = null; // handled here
    const generator = new PageGenerator({ ...options, engineIds });
    generator.run();
  } else {
    const generator = new PageGenerator(options);
    generator.run();
  }
}

main();
