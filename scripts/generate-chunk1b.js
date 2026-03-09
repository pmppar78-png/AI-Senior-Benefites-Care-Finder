#!/usr/bin/env node
/**
 * Chunk 1b: Generate additional pages to fill the 2,500 chunk target.
 * Adds new provider subcategories + additional topic pages.
 */

const fs = require('fs');
const path = require('path');
const BASE = '/opt/build/repo';

const states = [
  {slug:'alabama',name:'Alabama'},{slug:'alaska',name:'Alaska'},{slug:'arizona',name:'Arizona'},
  {slug:'arkansas',name:'Arkansas'},{slug:'california',name:'California'},{slug:'colorado',name:'Colorado'},
  {slug:'connecticut',name:'Connecticut'},{slug:'delaware',name:'Delaware'},{slug:'florida',name:'Florida'},
  {slug:'georgia',name:'Georgia'},{slug:'hawaii',name:'Hawaii'},{slug:'idaho',name:'Idaho'},
  {slug:'illinois',name:'Illinois'},{slug:'indiana',name:'Indiana'},{slug:'iowa',name:'Iowa'},
  {slug:'kansas',name:'Kansas'},{slug:'kentucky',name:'Kentucky'},{slug:'louisiana',name:'Louisiana'},
  {slug:'maine',name:'Maine'},{slug:'maryland',name:'Maryland'},{slug:'massachusetts',name:'Massachusetts'},
  {slug:'michigan',name:'Michigan'},{slug:'minnesota',name:'Minnesota'},{slug:'mississippi',name:'Mississippi'},
  {slug:'missouri',name:'Missouri'},{slug:'montana',name:'Montana'},{slug:'nebraska',name:'Nebraska'},
  {slug:'nevada',name:'Nevada'},{slug:'new-hampshire',name:'New Hampshire'},{slug:'new-jersey',name:'New Jersey'},
  {slug:'new-mexico',name:'New Mexico'},{slug:'new-york',name:'New York'},{slug:'north-carolina',name:'North Carolina'},
  {slug:'north-dakota',name:'North Dakota'},{slug:'ohio',name:'Ohio'},{slug:'oklahoma',name:'Oklahoma'},
  {slug:'oregon',name:'Oregon'},{slug:'pennsylvania',name:'Pennsylvania'},{slug:'rhode-island',name:'Rhode Island'},
  {slug:'south-carolina',name:'South Carolina'},{slug:'south-dakota',name:'South Dakota'},{slug:'tennessee',name:'Tennessee'},
  {slug:'texas',name:'Texas'},{slug:'utah',name:'Utah'},{slug:'vermont',name:'Vermont'},
  {slug:'virginia',name:'Virginia'},{slug:'washington',name:'Washington'},{slug:'west-virginia',name:'West Virginia'},
  {slug:'wisconsin',name:'Wisconsin'},{slug:'wyoming',name:'Wyoming'}
];

const stateCities = {
  'alabama': [{slug:'birmingham',name:'Birmingham'},{slug:'huntsville',name:'Huntsville'},{slug:'montgomery',name:'Montgomery'},{slug:'mobile',name:'Mobile'}],
  'alaska': [{slug:'anchorage',name:'Anchorage'}],
  'arizona': [{slug:'phoenix',name:'Phoenix'},{slug:'tucson',name:'Tucson'},{slug:'mesa',name:'Mesa'},{slug:'chandler',name:'Chandler'},{slug:'scottsdale',name:'Scottsdale'},{slug:'gilbert',name:'Gilbert'},{slug:'glendale',name:'Glendale'},{slug:'tempe',name:'Tempe'}],
  'arkansas': [{slug:'little-rock',name:'Little Rock'}],
  'california': [{slug:'los-angeles',name:'Los Angeles'},{slug:'san-francisco',name:'San Francisco'},{slug:'san-diego',name:'San Diego'},{slug:'san-jose',name:'San Jose'},{slug:'fresno',name:'Fresno'},{slug:'sacramento',name:'Sacramento'},{slug:'oakland',name:'Oakland'},{slug:'anaheim',name:'Anaheim'},{slug:'bakersfield',name:'Bakersfield'},{slug:'santa-ana',name:'Santa Ana'},{slug:'riverside',name:'Riverside'},{slug:'stockton',name:'Stockton'},{slug:'chula-vista',name:'Chula Vista'},{slug:'fremont',name:'Fremont'},{slug:'fontana',name:'Fontana'},{slug:'moreno-valley',name:'Moreno Valley'},{slug:'elk-grove',name:'Elk Grove'},{slug:'garden-grove',name:'Garden Grove'},{slug:'oceanside',name:'Oceanside'},{slug:'escondido',name:'Escondido'}],
  'colorado': [{slug:'denver',name:'Denver'},{slug:'colorado-springs',name:'Colorado Springs'},{slug:'aurora',name:'Aurora'},{slug:'fort-collins',name:'Fort Collins'},{slug:'lakewood',name:'Lakewood'}],
  'connecticut': [{slug:'hartford',name:'Hartford'},{slug:'bridgeport',name:'Bridgeport'},{slug:'new-haven',name:'New Haven'},{slug:'stamford',name:'Stamford'}],
  'delaware': [{slug:'dover',name:'Dover'},{slug:'wilmington-de',name:'Wilmington'}],
  'florida': [{slug:'miami',name:'Miami'},{slug:'orlando',name:'Orlando'},{slug:'tampa',name:'Tampa'},{slug:'jacksonville',name:'Jacksonville'},{slug:'st-petersburg',name:'St. Petersburg'},{slug:'fort-lauderdale',name:'Fort Lauderdale'},{slug:'tallahassee',name:'Tallahassee'},{slug:'cape-coral',name:'Cape Coral'},{slug:'coral-springs',name:'Coral Springs'},{slug:'clearwater',name:'Clearwater'},{slug:'daytona-beach',name:'Daytona Beach'},{slug:'gainesville',name:'Gainesville'},{slug:'port-st-lucie',name:'Port St. Lucie'}],
  'georgia': [{slug:'atlanta',name:'Atlanta'},{slug:'augusta',name:'Augusta'},{slug:'savannah',name:'Savannah'},{slug:'macon',name:'Macon'}],
  'hawaii': [{slug:'honolulu',name:'Honolulu'}],
  'idaho': [{slug:'boise',name:'Boise'},{slug:'nampa',name:'Nampa'}],
  'illinois': [{slug:'chicago',name:'Chicago'},{slug:'aurora-il',name:'Aurora'},{slug:'rockford',name:'Rockford'},{slug:'joliet',name:'Joliet'},{slug:'naperville',name:'Naperville'},{slug:'springfield-il',name:'Springfield'}],
  'indiana': [{slug:'indianapolis',name:'Indianapolis'},{slug:'fort-wayne',name:'Fort Wayne'}],
  'iowa': [{slug:'des-moines',name:'Des Moines'},{slug:'cedar-rapids',name:'Cedar Rapids'}],
  'kansas': [{slug:'wichita',name:'Wichita'},{slug:'overland-park',name:'Overland Park'},{slug:'kansas-city-ks',name:'Kansas City'}],
  'kentucky': [{slug:'louisville',name:'Louisville'},{slug:'lexington',name:'Lexington'}],
  'louisiana': [{slug:'new-orleans',name:'New Orleans'},{slug:'baton-rouge',name:'Baton Rouge'},{slug:'shreveport',name:'Shreveport'}],
  'maine': [{slug:'portland-me',name:'Portland'}],
  'maryland': [{slug:'baltimore',name:'Baltimore'},{slug:'rockville',name:'Rockville'}],
  'massachusetts': [{slug:'boston',name:'Boston'},{slug:'worcester',name:'Worcester'},{slug:'springfield-ma',name:'Springfield'},{slug:'lowell',name:'Lowell'}],
  'michigan': [{slug:'detroit',name:'Detroit'},{slug:'grand-rapids',name:'Grand Rapids'},{slug:'warren',name:'Warren'},{slug:'sterling-heights',name:'Sterling Heights'},{slug:'lansing',name:'Lansing'}],
  'minnesota': [{slug:'minneapolis',name:'Minneapolis'},{slug:'st-paul',name:'St. Paul'},{slug:'rochester-mn',name:'Rochester'}],
  'mississippi': [{slug:'jackson',name:'Jackson'}],
  'missouri': [{slug:'kansas-city',name:'Kansas City'},{slug:'springfield-mo',name:'Springfield'},{slug:'columbia-mo',name:'Columbia'}],
  'montana': [{slug:'billings',name:'Billings'}],
  'nebraska': [{slug:'omaha',name:'Omaha'},{slug:'lincoln',name:'Lincoln'}],
  'nevada': [{slug:'las-vegas',name:'Las Vegas'},{slug:'henderson',name:'Henderson'},{slug:'reno',name:'Reno'},{slug:'north-las-vegas',name:'North Las Vegas'}],
  'new-hampshire': [{slug:'manchester',name:'Manchester'}],
  'new-jersey': [{slug:'newark',name:'Newark'},{slug:'jersey-city',name:'Jersey City'},{slug:'paterson',name:'Paterson'},{slug:'trenton',name:'Trenton'}],
  'new-mexico': [{slug:'albuquerque',name:'Albuquerque'},{slug:'las-cruces',name:'Las Cruces'}],
  'new-york': [{slug:'new-york-city',name:'New York City'},{slug:'buffalo',name:'Buffalo'},{slug:'rochester',name:'Rochester'},{slug:'yonkers',name:'Yonkers'},{slug:'syracuse',name:'Syracuse'}],
  'north-carolina': [{slug:'charlotte',name:'Charlotte'},{slug:'raleigh',name:'Raleigh'},{slug:'greensboro',name:'Greensboro'},{slug:'durham',name:'Durham'},{slug:'winston-salem',name:'Winston-Salem'},{slug:'fayetteville',name:'Fayetteville'},{slug:'cary',name:'Cary'},{slug:'wilmington',name:'Wilmington'}],
  'north-dakota': [{slug:'fargo',name:'Fargo'}],
  'ohio': [{slug:'columbus',name:'Columbus'},{slug:'cleveland',name:'Cleveland'},{slug:'cincinnati',name:'Cincinnati'},{slug:'toledo',name:'Toledo'},{slug:'akron',name:'Akron'},{slug:'dayton',name:'Dayton'}],
  'oklahoma': [{slug:'oklahoma-city',name:'Oklahoma City'},{slug:'tulsa',name:'Tulsa'}],
  'oregon': [{slug:'portland',name:'Portland'},{slug:'eugene',name:'Eugene'},{slug:'salem',name:'Salem'}],
  'pennsylvania': [{slug:'philadelphia',name:'Philadelphia'},{slug:'pittsburgh',name:'Pittsburgh'},{slug:'allentown',name:'Allentown'},{slug:'reading',name:'Reading'}],
  'rhode-island': [{slug:'providence',name:'Providence'}],
  'south-carolina': [{slug:'charleston',name:'Charleston'},{slug:'columbia',name:'Columbia'},{slug:'north-charleston',name:'North Charleston'}],
  'south-dakota': [{slug:'sioux-falls',name:'Sioux Falls'}],
  'tennessee': [{slug:'nashville',name:'Nashville'},{slug:'memphis',name:'Memphis'},{slug:'knoxville',name:'Knoxville'},{slug:'chattanooga',name:'Chattanooga'},{slug:'clarksville',name:'Clarksville'}],
  'texas': [{slug:'houston',name:'Houston'},{slug:'san-antonio',name:'San Antonio'},{slug:'dallas',name:'Dallas'},{slug:'austin',name:'Austin'},{slug:'fort-worth',name:'Fort Worth'},{slug:'el-paso',name:'El Paso'},{slug:'arlington',name:'Arlington'},{slug:'corpus-christi',name:'Corpus Christi'},{slug:'plano',name:'Plano'},{slug:'lubbock',name:'Lubbock'},{slug:'irving',name:'Irving'},{slug:'mckinney',name:'McKinney'},{slug:'denton',name:'Denton'},{slug:'brownsville',name:'Brownsville'}],
  'utah': [{slug:'salt-lake-city',name:'Salt Lake City'},{slug:'west-valley-city',name:'West Valley City'},{slug:'provo',name:'Provo'}],
  'vermont': [{slug:'burlington',name:'Burlington'}],
  'virginia': [{slug:'virginia-beach',name:'Virginia Beach'},{slug:'norfolk',name:'Norfolk'},{slug:'chesapeake',name:'Chesapeake'},{slug:'richmond',name:'Richmond'},{slug:'newport-news',name:'Newport News'}],
  'washington': [{slug:'seattle',name:'Seattle'},{slug:'spokane',name:'Spokane'},{slug:'tacoma',name:'Tacoma'},{slug:'bellevue',name:'Bellevue'},{slug:'vancouver-wa',name:'Vancouver'}],
  'west-virginia': [{slug:'charleston-wv',name:'Charleston'}],
  'wisconsin': [{slug:'milwaukee',name:'Milwaukee'},{slug:'madison',name:'Madison'},{slug:'green-bay',name:'Green Bay'}],
  'wyoming': [{slug:'cheyenne',name:'Cheyenne'}]
};

function generatePage(title, description, canonicalPath, h1, intro, sections, locationName) {
  const sectionsHtml = sections.map(s => `
    <section class="info-block">
      <h2>${s.heading}</h2>
      <p>${s.content}</p>
    </section>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${description}" />
  <link rel="canonical" href="https://seniorbenefitscarefinder.com/${canonicalPath}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="https://seniorbenefitscarefinder.com/${canonicalPath}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Senior Benefits Care Finder" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="/engine.css" />
</head>
<body class="site-body">
  <header class="site-header">
    <div class="logo-block">
      <div class="logo-icon">&#10022;</div>
      <a href="/" class="logo-text" style="text-decoration:none;color:inherit;">
        <span class="logo-title">Senior Benefits Care Finder</span>
        <span class="logo-subtitle">Trust-first guide for seniors &amp; caregivers</span>
      </a>
    </div>
    <div class="header-right">
      <a href="/chat.html" class="btn-ai-pill">Try our AI</a>
      <button class="hamburger-btn" id="hamburgerBtn" aria-label="Open menu" aria-expanded="false">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
    <nav class="mobile-menu" id="mobileMenu">
      <a href="/" class="mobile-menu-link">Home</a>
      <a href="/chat.html" class="mobile-menu-link">Talk to the AI guide</a>
      <a href="/medicare/" class="mobile-menu-link">Medicare</a>
      <a href="/medicaid/" class="mobile-menu-link">Medicaid</a>
      <a href="/assisted-living/" class="mobile-menu-link">Assisted Living</a>
      <a href="/social-security/" class="mobile-menu-link">Social Security</a>
      <a href="/home-care/" class="mobile-menu-link">Home Care</a>
      <a href="/veterans-benefits/" class="mobile-menu-link">Veterans Benefits</a>
    </nav>
  </header>
  <script>
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
  </script>

  <main class="engine-page">
    <article class="engine-content">
      <h1>${h1}</h1>
      <p class="engine-intro">${intro}</p>
${sectionsHtml}
      <section class="info-block">
        <h2>Need Help?</h2>
        <p>Finding the right benefits and care options can be complex. <a href="/chat.html">Talk to our AI guide</a> for personalized assistance, or explore our other resources to learn more about programs available in ${locationName}.</p>
      </section>
    </article>
  </main>

  <footer class="site-footer">
    <div class="footer-links">
      <a href="/about">About</a>
      <a href="/editorial-policy">Editorial Policy</a>
      <a href="/how-we-research">How We Research</a>
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms-of-use">Terms of Use</a>
      <a href="/contact">Contact</a>
    </div>
    <p class="footer-copy">&copy; 2026 Senior Benefits Care Finder. All rights reserved.</p>
    <p class="footer-disclaimer">This site is for informational purposes only and does not constitute legal, financial, or medical advice.</p>
  </footer>
  <script src="/script.js" defer></script>
</body>
</html>`;
}

// New provider types to add
const newProviderTypes = [
  {
    slug: 'memory-care-facilities',
    name: 'Memory Care Facilities',
    sections: [
      {heading: 'About Memory Care', content: 'Memory care facilities provide specialized care for individuals with Alzheimer\'s disease, dementia, and other memory-related conditions. These facilities offer secure environments, structured activities, and specially trained staff to support cognitive function and daily living.'},
      {heading: 'Services Provided', content: 'Memory care services typically include 24-hour supervised care, medication management, assistance with daily activities, cognitive stimulation programs, physical exercise programs, nutritious meals, and behavioral management. Many facilities also offer art therapy, music therapy, and reminiscence therapy.'},
      {heading: 'Costs', content: 'Memory care costs vary by location and level of care, but typically range from $4,000 to $8,000 per month. Some facilities offer all-inclusive pricing while others charge separately for different levels of care. Long-term care insurance, VA benefits, and Medicaid may help cover costs.'},
      {heading: 'Choosing a Facility', content: 'When evaluating memory care facilities, consider staff-to-resident ratios, staff training in dementia care, safety features like secured doors and monitored exits, activity programs, family involvement policies, and the overall environment and cleanliness of the facility.'}
    ]
  },
  {
    slug: 'rehabilitation-centers',
    name: 'Rehabilitation Centers',
    sections: [
      {heading: 'About Senior Rehabilitation', content: 'Senior rehabilitation centers provide short-term and long-term therapy services to help older adults recover from surgery, illness, injury, or stroke. These centers offer comprehensive programs designed to restore function, mobility, and independence.'},
      {heading: 'Types of Therapy', content: 'Rehabilitation centers offer physical therapy for mobility and strength, occupational therapy for daily living skills, speech therapy for communication and swallowing, cardiac rehabilitation, pulmonary rehabilitation, and neurological rehabilitation for stroke and brain injury recovery.'},
      {heading: 'Medicare Coverage', content: 'Medicare covers skilled nursing facility rehabilitation for up to 100 days following a qualifying hospital stay of at least 3 days. Days 1-20 are fully covered, days 21-100 require a daily copayment. Medicare also covers outpatient rehabilitation with a doctor\'s order.'},
      {heading: 'Finding a Center', content: 'Look for rehabilitation centers that are Medicare-certified, have high star ratings on Medicare.gov, offer the specific therapies needed, have experienced therapists, maintain low readmission rates, and provide a comfortable recovery environment.'}
    ]
  }
];

let written = 0;

for (const provType of newProviderTypes) {
  for (const state of states) {
    const dirPath = path.join(BASE, 'providers', provType.slug, state.slug);
    const filePath = path.join(dirPath, 'index.html');
    if (fs.existsSync(filePath)) continue;

    const title = `${provType.name} in ${state.name} (2026) – Find Providers Near You`;
    const desc = `Find ${provType.name.toLowerCase()} in ${state.name}. Compare providers, services, costs, and ratings for 2026.`;
    const h1 = `${provType.name} in ${state.name}`;
    const intro = `Find and compare ${provType.name.toLowerCase()} in ${state.name}. This guide covers available providers, services offered, costs, and how to choose the right facility for your needs in 2026.`;
    const canonical = `providers/${provType.slug}/${state.slug}`;

    const html = generatePage(title, desc, canonical, h1, intro, provType.sections, state.name);
    fs.mkdirSync(dirPath, {recursive: true});
    fs.writeFileSync(filePath, html);
    written++;
  }

  for (const state of states) {
    const cities = stateCities[state.slug] || [];
    for (const city of cities) {
      const dirPath = path.join(BASE, 'providers', provType.slug, state.slug, city.slug);
      const filePath = path.join(dirPath, 'index.html');
      if (fs.existsSync(filePath)) continue;

      const loc = `${city.name}, ${state.name}`;
      const title = `${provType.name} in ${loc} (2026) – Find Providers Near You`;
      const desc = `Find ${provType.name.toLowerCase()} in ${loc}. Compare providers, services, costs, and ratings for 2026.`;
      const h1 = `${provType.name} in ${loc}`;
      const intro = `Find and compare ${provType.name.toLowerCase()} in ${loc}. This guide covers available providers, services offered, costs, and how to choose the right facility for your needs in 2026.`;
      const canonical = `providers/${provType.slug}/${state.slug}/${city.slug}`;

      const html = generatePage(title, desc, canonical, h1, intro, provType.sections, loc);
      fs.mkdirSync(dirPath, {recursive: true});
      fs.writeFileSync(filePath, html);
      written++;
    }
  }
  console.log(`[providers/${provType.slug}] done — ${written} pages written so far`);
}

console.log(`\nTotal additional pages written: ${written}`);
