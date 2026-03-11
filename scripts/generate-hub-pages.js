#!/usr/bin/env node
/**
 * Generate hub landing pages for all major categories.
 * These are the top-level index pages (e.g., /medicare/index.html)
 * that serve as pillar pages linking to state-specific guides.
 */

const fs = require('fs');
const path = require('path');

const states = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'engines', 'data', 'states.json'), 'utf8'));

const SITE = 'https://seniorbenefitscarefinder.com';
const YEAR = '2026';

// Hub page configurations
const hubs = [
  {
    slug: 'medicare',
    title: `Medicare Plans by State (${YEAR}) – Compare Advantage, Medigap &amp; Part D`,
    metaDesc: `Compare Medicare Advantage, Medigap, and Part D plans across all 50 states. Find ${YEAR} costs, enrollment periods, and coverage options for seniors.`,
    h1: `Medicare Plans by State (${YEAR})`,
    intro: `Understanding Medicare is one of the most important steps for seniors approaching 65 or already enrolled. Our state-by-state Medicare guides cover Medicare Advantage (Part C), Medigap supplement plans, Part D prescription drug coverage, enrollment periods, costs, and tips for choosing the right plan. Each guide is researched from official CMS and state-level sources.`,
    subCategories: [
      { name: 'Medicare Advantage', slug: 'medicare/advantage/', desc: 'Compare MA plans with bundled hospital, medical, and often drug coverage' },
      { name: 'Medigap Plans', slug: 'medicare/supplement/', desc: 'Supplement Original Medicare with standardized Medigap policies' },
      { name: 'Part D Drug Plans', slug: 'medicare/part-d/', desc: 'Compare prescription drug plan costs and formularies' },
      { name: 'Medicare Eligibility', slug: 'medicare/eligibility/', desc: 'Understand who qualifies and when to enroll' },
      { name: 'Medicare Enrollment', slug: 'medicare/enrollment/', desc: 'Enrollment periods, deadlines, and how to sign up' }
    ],
    stateUrlPattern: 'medicare',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What are the main parts of Medicare?', a: 'Medicare has four parts: Part A (hospital insurance), Part B (medical insurance), Part C (Medicare Advantage), and Part D (prescription drug coverage). Parts A and B are "Original Medicare," while Part C bundles coverage through private insurers.' },
      { q: 'When can I enroll in Medicare?', a: 'Your Initial Enrollment Period starts 3 months before you turn 65 and ends 3 months after. The Annual Enrollment Period runs October 15 through December 7 each year. Special Enrollment Periods may apply if you have qualifying life events.' },
      { q: 'What is the difference between Medicare Advantage and Medigap?', a: 'Medicare Advantage (Part C) replaces Original Medicare with an all-in-one plan from a private insurer, often including drug coverage. Medigap supplements Original Medicare by covering out-of-pocket costs like deductibles and copays. You cannot have both simultaneously.' }
    ]
  },
  {
    slug: 'medicaid',
    title: `Medicaid Eligibility by State (${YEAR}) – Income Limits, Programs &amp; Application`,
    metaDesc: `Check Medicaid eligibility, income limits, and application processes by state. ${YEAR} guides for seniors covering waivers, spend-down rules, and dual eligibility.`,
    h1: `Medicaid Eligibility by State (${YEAR})`,
    intro: `Medicaid provides essential healthcare coverage for low-income seniors, people with disabilities, and families. Eligibility rules, income limits, and available programs vary significantly by state. Our guides cover each state's Medicaid program including home and community-based services (HCBS) waivers, spend-down rules, application processes, and dual eligibility with Medicare.`,
    subCategories: [
      { name: 'Medicaid Eligibility', slug: 'medicaid/eligibility/', desc: 'Income and asset limits by state for seniors' },
      { name: 'Medicaid Application', slug: 'medicaid/application/', desc: 'How to apply and what documents you need' },
      { name: 'Waiver Programs', slug: 'medicaid/waiver-programs/', desc: 'HCBS and 1915(c) waiver programs by state' },
      { name: 'Spend-Down Rules', slug: 'medicaid/spend-down/', desc: 'How to qualify when over income limits' },
      { name: 'Home Care Waivers', slug: 'medicaid/home-care-waivers/', desc: 'Medicaid coverage for in-home care services' }
    ],
    stateUrlPattern: 'medicaid',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What are the income limits for Medicaid for seniors?', a: 'Medicaid income limits for seniors vary by state. In most states, the limit is roughly 100-138% of the Federal Poverty Level for aged individuals. Many states also consider assets. Check your specific state guide for current thresholds.' },
      { q: 'Can I have both Medicare and Medicaid?', a: 'Yes. People eligible for both are called "dual eligibles." Medicaid can help pay Medicare premiums, deductibles, and copays. Dual Special Needs Plans (D-SNPs) are designed specifically for dual-eligible beneficiaries.' },
      { q: 'What is the Medicaid spend-down?', a: 'Medicaid spend-down allows people whose income is above the limit to become eligible by "spending down" excess income on medical expenses. Once your medical bills reduce your countable income to the state limit, you qualify for that period.' }
    ]
  },
  {
    slug: 'assisted-living',
    title: `Assisted Living Costs by State (${YEAR}) – Prices, Care Levels &amp; Payment Options`,
    metaDesc: `Compare assisted living costs across all 50 states. ${YEAR} monthly prices, care levels, payment options, and tips for choosing the right community.`,
    h1: `Assisted Living Costs by State (${YEAR})`,
    intro: `Assisted living costs vary dramatically across the United States, from under $3,000 per month in some states to over $7,000 in others. Our state-by-state guides provide detailed cost data, explain different levels of care (independent living, assisted living, memory care), and cover payment options including private pay, long-term care insurance, Medicaid waivers, and VA benefits.`,
    subCategories: [
      { name: 'Cost Guides', slug: 'assisted-living/cost/', desc: 'Monthly costs and pricing by state and city' },
      { name: 'Types of Care', slug: 'assisted-living/types/', desc: 'Independent living, assisted living, and memory care compared' },
      { name: 'Memory Care', slug: 'assisted-living/memory-care/', desc: 'Specialized care for Alzheimer\'s and dementia' },
      { name: 'Respite Care', slug: 'assisted-living/respite-care/', desc: 'Short-term stays for caregiver relief' }
    ],
    stateUrlPattern: 'assisted-living/cost',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What is the average cost of assisted living?', a: 'The national median cost of assisted living is approximately $4,500-$5,000 per month in 2026. However, costs range from about $2,800/month in states like Missouri to over $7,000/month in states like Connecticut and Massachusetts.' },
      { q: 'Does Medicare pay for assisted living?', a: 'No, Medicare does not cover assisted living costs. Payment options include private pay, long-term care insurance, Medicaid waivers (in some states), VA Aid and Attendance benefits, and bridge loans or life insurance conversions.' },
      { q: 'What is the difference between assisted living and a nursing home?', a: 'Assisted living provides help with daily activities (bathing, dressing, medication management) in a residential setting. Nursing homes provide 24-hour skilled nursing care for those with serious medical needs. Assisted living is generally less expensive and more independent.' }
    ]
  },
  {
    slug: 'social-security',
    title: `Social Security Benefits by State (${YEAR}) – Retirement, SSDI &amp; SSI Guides`,
    metaDesc: `Understand Social Security retirement benefits, SSDI, and SSI across all 50 states. ${YEAR} claiming strategies, benefit amounts, and state tax information.`,
    h1: `Social Security Benefits by State (${YEAR})`,
    intro: `Social Security is the foundation of retirement income for most American seniors. Our state-by-state guides cover retirement benefit claiming strategies, Social Security Disability Insurance (SSDI), Supplemental Security Income (SSI), spousal and survivor benefits, state taxation of benefits, and tips for maximizing your monthly payments.`,
    subCategories: [
      { name: 'Retirement Benefits', slug: 'social-security/retirement/', desc: 'Claiming strategies, FRA, and delayed credits' },
      { name: 'Disability (SSDI)', slug: 'social-security/disability/', desc: 'SSDI eligibility, application, and benefit amounts' },
      { name: 'Retirement Planning', slug: 'social-security/retirement-planning/', desc: 'Strategies for maximizing your benefits' },
      { name: 'Survivors Benefits', slug: 'social-security/survivors/', desc: 'Benefits for surviving spouses and dependents' }
    ],
    stateUrlPattern: 'social-security',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'When should I start collecting Social Security?', a: 'You can start at 62 (reduced benefits), at your Full Retirement Age or FRA (66-67 depending on birth year) for full benefits, or delay up to age 70 for maximum benefits (about 8% increase per year of delay). The best time depends on your health, finances, and life expectancy.' },
      { q: 'Which states tax Social Security benefits?', a: 'Most states do not tax Social Security benefits. However, a handful of states do tax some or all benefits, including Colorado, Connecticut, Kansas, Minnesota, Missouri, Montana, Nebraska, New Mexico, Rhode Island, Utah, Vermont, and West Virginia (rules vary).' },
      { q: 'What is the maximum Social Security benefit?', a: 'The maximum monthly Social Security retirement benefit depends on when you claim. For someone claiming at FRA in 2026, the maximum is approximately $3,800-$4,000/month. Delaying to age 70 increases this further.' }
    ]
  },
  {
    slug: 'home-care',
    title: `Home Care Services by State (${YEAR}) – Costs, Agencies &amp; Options`,
    metaDesc: `Compare home care costs, find agencies, and explore in-home care options across all 50 states. ${YEAR} rates for companion care, personal care, and home health.`,
    h1: `Home Care Services by State (${YEAR})`,
    intro: `Home care allows seniors to receive assistance in the comfort of their own home, from companion care and help with daily activities to skilled nursing and therapy. Costs and available services vary significantly by state and city. Our guides cover home care rates, how to find and evaluate agencies, Medicare and Medicaid home care benefits, and family caregiver support programs.`,
    subCategories: [
      { name: 'Home Care Costs', slug: 'home-care/cost/', desc: 'Hourly and monthly rates by state and city' },
      { name: 'Home Care Agencies', slug: 'home-care/agencies/', desc: 'How to find and evaluate home care providers' },
      { name: 'Home Care Services', slug: 'home-care/services/', desc: 'Types of in-home care available' },
      { name: 'Fall Prevention', slug: 'home-care/fall-prevention/', desc: 'Home safety and fall prevention for seniors' },
      { name: 'Palliative Care', slug: 'home-care/palliative/', desc: 'In-home comfort care and pain management' }
    ],
    stateUrlPattern: 'home-care',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'How much does home care cost?', a: 'Home care costs vary widely by state and type of care. The national median for home health aide services is about $27-$30 per hour. Monthly costs for full-time care range from approximately $4,000 to over $6,000 depending on location.' },
      { q: 'Does Medicare cover home care?', a: 'Medicare covers home health care (skilled nursing, physical therapy, etc.) if you are homebound and need intermittent skilled care ordered by a doctor. Medicare does NOT cover long-term custodial home care like help with bathing and dressing.' },
      { q: 'What is the difference between home care and home health care?', a: 'Home care (or companion/personal care) helps with daily activities like bathing, cooking, and companionship. Home health care involves skilled medical services like nursing, physical therapy, and wound care provided by licensed professionals.' }
    ]
  },
  {
    slug: 'veterans-benefits',
    title: `Veterans Benefits by State (${YEAR}) – VA Programs, Aid &amp; Attendance`,
    metaDesc: `Explore veterans benefits across all 50 states. ${YEAR} guides covering VA health care, Aid & Attendance, pensions, state veteran benefits, and how to apply.`,
    h1: `Veterans Benefits by State (${YEAR})`,
    intro: `Veterans and their families may be eligible for a wide range of federal and state benefits. Our guides cover VA health care enrollment, Aid and Attendance pension benefits, VA pension programs, state-specific veteran benefits, caregiver support, and step-by-step application guidance. Each state offers its own unique veteran benefits in addition to federal programs.`,
    subCategories: [
      { name: 'Aid & Attendance', slug: 'veterans-benefits/aid-attendance/', desc: 'VA pension benefit for veterans needing daily living assistance' }
    ],
    stateUrlPattern: 'veterans-benefits',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What is the VA Aid and Attendance benefit?', a: 'Aid and Attendance is an enhanced VA pension benefit for veterans (or surviving spouses) who need help with daily activities like bathing, dressing, or eating. Monthly benefits can exceed $2,000 for a single veteran and more for married veterans.' },
      { q: 'Do I qualify for VA health care?', a: 'Most veterans who served on active duty and were not dishonorably discharged are eligible for VA health care. Priority is based on factors including service-connected disabilities, income, and other criteria. Enrollment is done through VA.gov or your local VA medical center.' },
      { q: 'What state veteran benefits are available?', a: 'Each state offers unique benefits for veterans that may include property tax exemptions, state veteran pensions, education benefits, employment preferences, hunting and fishing license discounts, and more. Check your state guide for specific programs.' }
    ]
  },
  {
    slug: 'prescription-assistance',
    title: `Prescription Assistance Programs by State (${YEAR}) – Drug Cost Help for Seniors`,
    metaDesc: `Find prescription drug assistance programs, discount cards, and cost-saving resources across all 50 states. ${YEAR} guides for Medicare Part D Extra Help and more.`,
    h1: `Prescription Assistance Programs by State (${YEAR})`,
    intro: `Prescription drug costs are a major concern for seniors. Our state-by-state guides cover Medicare Part D Extra Help (Low-Income Subsidy), State Pharmaceutical Assistance Programs (SPAPs), manufacturer patient assistance programs, discount cards, and other resources to help reduce medication costs. Each state has unique programs that can significantly lower out-of-pocket drug expenses.`,
    subCategories: [
      { name: 'Discount Cards', slug: 'prescription-assistance/discount-cards/', desc: 'Compare prescription discount programs' },
      { name: 'Patient Assistance', slug: 'prescription-assistance/patient-assistance/', desc: 'Manufacturer programs for free or low-cost medications' },
      { name: 'Programs', slug: 'prescription-assistance/programs/', desc: 'State and federal prescription assistance programs' }
    ],
    stateUrlPattern: 'prescription-assistance',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What is Medicare Part D Extra Help?', a: 'Extra Help (also called the Low-Income Subsidy) is a Medicare program that helps pay Part D premiums, deductibles, and copays. If you qualify, you could save an average of $5,000 per year on drug costs. Income and asset limits apply.' },
      { q: 'How can I lower my prescription drug costs?', a: 'Options include: applying for Medicare Extra Help, using prescription discount cards like GoodRx, checking manufacturer patient assistance programs, asking your doctor about generic alternatives, comparing pharmacy prices, and exploring your state pharmaceutical assistance program.' }
    ]
  },
  {
    slug: 'low-income-programs',
    title: `Low-Income Assistance Programs by State (${YEAR}) – SNAP, LIHEAP &amp; Housing`,
    metaDesc: `Find low-income assistance programs for seniors across all 50 states. ${YEAR} guides for SNAP, LIHEAP, housing assistance, utility help, and more.`,
    h1: `Low-Income Assistance Programs by State (${YEAR})`,
    intro: `Millions of seniors qualify for assistance programs that can help with food, energy bills, housing, and other essential needs. Our state-by-state guides cover SNAP (food assistance), LIHEAP (energy assistance), Section 8 and senior housing, Lifeline phone/internet discounts, and other local programs. Many eligible seniors are not enrolled in programs they qualify for.`,
    subCategories: [
      { name: 'SNAP Benefits', slug: 'low-income-programs/snap/', desc: 'Food assistance program eligibility and benefits' },
      { name: 'LIHEAP', slug: 'low-income-programs/liheap/', desc: 'Low-Income Home Energy Assistance Program' },
      { name: 'Housing Assistance', slug: 'low-income-programs/housing-assistance/', desc: 'Section 8, senior housing, and rental help' }
    ],
    stateUrlPattern: 'low-income-programs',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What is SNAP and do seniors qualify?', a: 'SNAP (Supplemental Nutrition Assistance Program) provides monthly food benefits loaded onto an EBT card. Seniors 60+ may qualify with income below 130% of the Federal Poverty Level. Many states have simplified applications for elderly households.' },
      { q: 'What is LIHEAP?', a: 'LIHEAP (Low-Income Home Energy Assistance Program) helps low-income households pay heating and cooling bills. Benefits vary by state but can range from $200 to over $1,000. Apply through your state LIHEAP office or local community action agency.' }
    ]
  },
  {
    slug: 'long-term-care',
    title: `Long-Term Care by State (${YEAR}) – Insurance, Planning &amp; Costs`,
    metaDesc: `Plan for long-term care with state-by-state guides on insurance, Medicaid planning, nursing home costs, and care options. ${YEAR} cost data and strategies.`,
    h1: `Long-Term Care by State (${YEAR})`,
    intro: `Planning for long-term care is one of the most important financial decisions seniors and their families face. Our state-by-state guides cover long-term care insurance options, Medicaid planning and spend-down strategies, nursing home costs, the 5-year Medicaid look-back period, hybrid life/LTC policies, and how to protect assets while qualifying for assistance.`,
    subCategories: [
      { name: 'LTC Insurance', slug: 'long-term-care/insurance/', desc: 'Long-term care insurance options and costs' },
      { name: 'Medicaid Planning', slug: 'long-term-care/medicaid-planning/', desc: 'Asset protection and spend-down strategies' },
      { name: 'Nursing Homes', slug: 'long-term-care/nursing-homes/', desc: 'Nursing home costs and quality ratings' }
    ],
    stateUrlPattern: 'long-term-care',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'How much does long-term care cost?', a: 'The national median cost varies by care type: home health aide ~$5,700/month, assisted living ~$4,500/month, and nursing home ~$8,000-$9,000/month for a semi-private room. Costs vary significantly by state and region.' },
      { q: 'What is the Medicaid look-back period?', a: 'The Medicaid look-back period is 5 years (60 months) in most states. Medicaid reviews all asset transfers made during this period when you apply for long-term care coverage. Gifts or transfers below fair market value during this period can result in a penalty period of ineligibility.' }
    ]
  },
  {
    slug: 'disability-benefits',
    title: `Disability Benefits for Seniors (${YEAR}) – SSDI, SSI &amp; Condition-Specific Guides`,
    metaDesc: `Explore disability benefits for seniors including SSDI, SSI, and condition-specific programs. ${YEAR} guides for Alzheimer's, arthritis, diabetes, heart disease, and more.`,
    h1: `Disability Benefits for Seniors (${YEAR})`,
    intro: `Seniors with disabilities may qualify for Social Security Disability Insurance (SSDI), Supplemental Security Income (SSI), and other federal and state programs. Our guides cover eligibility, application processes, and condition-specific benefits for common senior health conditions including Alzheimer's, arthritis, cancer, COPD, diabetes, heart disease, and more.`,
    subCategories: [
      { name: "Alzheimer's & Dementia", slug: 'disability-benefits/alzheimers-disease/', desc: "Benefits and support for Alzheimer's patients and caregivers" },
      { name: 'Arthritis', slug: 'disability-benefits/arthritis/', desc: 'Disability benefits for severe arthritis' },
      { name: 'Cancer', slug: 'disability-benefits/cancer/', desc: 'Fast-track disability and compassionate allowances' },
      { name: 'COPD', slug: 'disability-benefits/copd/', desc: 'Respiratory condition disability benefits' },
      { name: 'Diabetes', slug: 'disability-benefits/diabetes/', desc: 'Benefits for severe diabetes complications' },
      { name: 'Heart Disease', slug: 'disability-benefits/heart-disease/', desc: 'Cardiovascular disability programs' },
      { name: 'SSI Benefits', slug: 'disability-benefits/ssi/', desc: 'Supplemental Security Income for disabled individuals' },
      { name: 'Vision Loss', slug: 'disability-benefits/vision-loss/', desc: 'Benefits for legal blindness and vision impairment' }
    ],
    stateUrlPattern: null,
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What is the difference between SSDI and SSI?', a: 'SSDI (Social Security Disability Insurance) is for people who have worked and paid Social Security taxes. SSI (Supplemental Security Income) is a needs-based program for disabled individuals with limited income and resources, regardless of work history.' },
      { q: 'How do I apply for disability benefits?', a: 'You can apply for SSDI or SSI online at ssa.gov, by phone at 1-800-772-1213, or in person at your local Social Security office. The process requires medical documentation of your condition and its impact on your ability to work.' }
    ]
  },
  {
    slug: 'senior-legal',
    title: `Senior Legal &amp; Estate Planning by State (${YEAR}) – Elder Law Guides`,
    metaDesc: `Find senior legal resources by state including estate planning, power of attorney, elder abuse protection, and elder law attorney directories. ${YEAR} guides.`,
    h1: `Senior Legal &amp; Estate Planning by State (${YEAR})`,
    intro: `Legal planning is essential for protecting seniors' rights, assets, and wishes. Our state-by-state guides cover estate planning basics (wills, trusts, power of attorney), advance directives and living wills, guardianship and conservatorship, elder abuse recognition and reporting, and how to find qualified elder law attorneys in your area.`,
    subCategories: [
      { name: 'Estate Planning', slug: 'senior-legal/estate-planning/', desc: 'Wills, trusts, and power of attorney essentials' },
      { name: 'Elder Abuse', slug: 'senior-legal/elder-abuse/', desc: 'Recognizing, reporting, and preventing elder abuse' }
    ],
    stateUrlPattern: 'senior-legal',
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'What documents should every senior have?', a: 'Every senior should have: a will or trust, durable power of attorney (financial), healthcare power of attorney/healthcare proxy, advance directive or living will, and HIPAA authorization. These documents ensure your wishes are respected and someone you trust can act on your behalf.' },
      { q: 'What is an elder law attorney?', a: 'An elder law attorney specializes in legal issues affecting older adults, including estate planning, Medicaid planning, long-term care, guardianship, elder abuse, and Social Security. The National Academy of Elder Law Attorneys (NAELA) can help you find one in your area.' }
    ]
  },
  {
    slug: 'providers',
    title: `Senior Care Provider Directory (${YEAR}) – Find Providers Near You`,
    metaDesc: `Search our directory of senior care providers including nursing homes, assisted living facilities, home health agencies, hospice, and rehabilitation centers by state.`,
    h1: `Senior Care Provider Directory (${YEAR})`,
    intro: `Finding the right care provider is one of the most important decisions for seniors and their families. Our provider directory helps you research and compare different types of senior care facilities and agencies across the country, including nursing homes, assisted living facilities, home health agencies, hospice providers, memory care facilities, adult day care centers, and rehabilitation centers.`,
    subCategories: [
      { name: 'Nursing Homes', slug: 'providers/nursing-homes/', desc: 'Skilled nursing facilities by state' },
      { name: 'Assisted Living Facilities', slug: 'providers/assisted-living-facilities/', desc: 'Assisted living communities near you' },
      { name: 'Home Health Agencies', slug: 'providers/home-health-agencies/', desc: 'Licensed home health care providers' },
      { name: 'Hospice Providers', slug: 'providers/hospice-providers/', desc: 'End-of-life and palliative care services' },
      { name: 'Memory Care Facilities', slug: 'providers/memory-care-facilities/', desc: 'Specialized dementia and Alzheimer\'s care' },
      { name: 'Adult Day Care', slug: 'providers/adult-day-care/', desc: 'Daytime supervision and activities for seniors' },
      { name: 'Rehabilitation Centers', slug: 'providers/rehabilitation-centers/', desc: 'Physical therapy and rehab services' }
    ],
    stateUrlPattern: null,
    schemaType: 'CollectionPage',
    faqs: [
      { q: 'How do I choose a nursing home?', a: 'Research quality ratings on Medicare.gov Care Compare, visit facilities in person, check state inspection reports, talk to current residents and families, verify staffing levels, understand costs and payment options, and consult your state long-term care ombudsman.' },
      { q: 'What should I look for in a home health agency?', a: 'Look for: state licensing and Medicare certification, caregiver background checks and training, clear care plans, a nurse supervisor, transparent pricing, positive reviews, and whether the agency can accommodate your specific care needs.' }
    ]
  }
];

// Template function for generating hub pages
function generateHubPage(hub) {
  const canonicalUrl = `${SITE}/${hub.slug}/`;
  const stateLinks = states.map(s => {
    const url = hub.stateUrlPattern ? `/${hub.stateUrlPattern}/${s.slug}/` : null;
    return url ? `        <a href="${url}" class="state-link">${s.name}</a>` : null;
  }).filter(Boolean).join('\n');

  const subCategoryCards = hub.subCategories.map(sc =>
    `        <a class="cluster-card" href="/${sc.slug}">
          <h3>${sc.name}</h3>
          <p>${sc.desc}</p>
        </a>`
  ).join('\n');

  const faqItems = hub.faqs.map(f =>
    `      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">${f.q}</button>
        <div class="faq-answer"><p>${f.a}</p></div>
      </div>`
  ).join('\n');

  const faqSchema = hub.faqs.map((f, i) =>
    `    {
      "@type": "Question",
      "name": ${JSON.stringify(f.q)},
      "acceptedAnswer": {
        "@type": "Answer",
        "text": ${JSON.stringify(f.a)}
      }
    }${i < hub.faqs.length - 1 ? ',' : ''}`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${hub.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${hub.metaDesc}" />
  <meta name="author" content="Paul Paradis" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${hub.title}" />
  <meta property="og:description" content="${hub.metaDesc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Senior Benefits Care Finder" />
  <meta property="article:author" content="${SITE}/author/paul-paradis/" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${hub.title}" />
  <meta name="twitter:description" content="${hub.metaDesc}" />
  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="/engine.css" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Senior Benefits Care Finder",
    "url": "${SITE}",
    "description": "A comprehensive resource helping seniors and their families navigate government benefits, healthcare programs, and care options across all 50 states.",
    "founder": { "@type": "Person", "name": "Paul Paradis" },
    "publishingPrinciples": "${SITE}/editorial-policy/",
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "email": "contact@seniorbenefitscarefinder.com" }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${hub.schemaType}",
    "name": "${hub.h1.replace(/&amp;/g, '&')}",
    "description": "${hub.metaDesc.replace(/&amp;/g, '&')}",
    "url": "${canonicalUrl}",
    "publisher": { "@type": "Organization", "name": "Senior Benefits Care Finder" }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
${faqSchema}
    ]
  }
  </script>
</head>
<body class="site-body">
  <header class="site-header">
    <div class="logo-block">
      <div class="logo-icon">✦</div>
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
      <a href="/about/" class="mobile-menu-link">About Us</a>
      <a href="/author/paul-paradis/" class="mobile-menu-link">Our Author</a>
      <a href="/editorial-policy/" class="mobile-menu-link">Editorial Standards</a>
      <a href="/how-we-research/" class="mobile-menu-link">How We Research</a>
      <a href="/fact-checking/" class="mobile-menu-link">Fact-Checking Policy</a>
      <a href="/privacy-policy/" class="mobile-menu-link">Privacy Policy</a>
      <a href="/terms-of-use/" class="mobile-menu-link">Terms of Use</a>
      <a href="/contact/" class="mobile-menu-link">Contact</a>
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
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumbs" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="/"><span itemprop="name">Home</span></a>
          <meta itemprop="position" content="1" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <span class="current" itemprop="name">${hub.h1.replace(/ \(\d{4}\)/, '')}</span>
          <meta itemprop="position" content="2" />
        </li>
      </ol>
    </nav>

    <section class="engine-hero">
      <h1>${hub.h1}</h1>
      <div class="intro-text">
        <p>${hub.intro}</p>
      </div>
      <div class="hero-meta">
        <span>Updated: March ${YEAR}</span>
        <span>Covers all 50 states</span>
      </div>
    </section>

    <div class="meta-badges">
      <span class="meta-badge">Updated: March ${YEAR}</span>
      <span class="meta-badge verified">Fact-Checked</span>
      <span class="meta-badge">Hub Guide</span>
    </div>

    <div style="display:flex;align-items:center;gap:0.75rem;padding:1rem 1.25rem;background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:0.75rem;margin:1rem 0;">
      <div>
        <span style="font-size:0.82rem;color:var(--text-muted);">Written &amp; researched by</span>
        <a href="/author/paul-paradis/" style="color:var(--accent);text-decoration:none;font-weight:500;font-size:0.92rem;display:block;margin-top:0.15rem;">Paul Paradis</a>
        <span style="font-size:0.78rem;color:var(--text-muted);">Founder &amp; Independent Researcher</span>
      </div>
    </div>

    <div class="page-disclaimer">
      <strong>Important:</strong> This page is for informational purposes only. It does not constitute financial, legal, tax, medical, or insurance advice. Always confirm details with official program representatives and licensed professionals before making decisions.
    </div>

${hub.subCategories.length > 0 ? `    <section class="content-section">
      <h2>Explore by Topic</h2>
      <div class="cluster-grid">
${subCategoryCards}
      </div>
    </section>` : ''}

${stateLinks ? `    <section class="content-section">
      <h2>Select Your State</h2>
      <p>Choose your state below for localized information, costs, eligibility details, and resources specific to where you live.</p>
      <div class="state-grid">
${stateLinks}
      </div>
    </section>` : ''}

    <section class="content-section">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
${faqItems}
      </div>
    </section>

    <section class="cta-section">
      <h2>Need Help Understanding Your Options?</h2>
      <p>Our AI guide can help you explore benefits, compare options, and prepare questions for licensed professionals.</p>
      <div class="cta-buttons">
        <a href="/chat.html" class="btn-primary">Talk to the AI Guide &#8599;</a>
        <a href="/tools/senior-care-cost-explorer/" class="btn-outline">Care Cost Explorer</a>
        <a href="/" class="btn-outline">Back to Home</a>
      </div>
      <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.8rem;">
        The AI assistant may suggest partners or services that this site has a relationship with. This does not influence our editorial content.
      </p>
    </section>

  </main>

  <footer class="site-footer">
    <div style="max-width:960px;margin:0 auto;">
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.5rem 1.2rem;margin-bottom:0.8rem;font-size:0.82rem;">
        <a href="/medicare/" style="color:var(--text-muted);text-decoration:none;">Medicare</a>
        <a href="/medicaid/" style="color:var(--text-muted);text-decoration:none;">Medicaid</a>
        <a href="/assisted-living/" style="color:var(--text-muted);text-decoration:none;">Assisted Living</a>
        <a href="/social-security/" style="color:var(--text-muted);text-decoration:none;">Social Security</a>
        <a href="/home-care/" style="color:var(--text-muted);text-decoration:none;">Home Care</a>
        <a href="/veterans-benefits/" style="color:var(--text-muted);text-decoration:none;">Veterans Benefits</a>
        <a href="/prescription-assistance/" style="color:var(--text-muted);text-decoration:none;">Rx Assistance</a>
        <a href="/dental-vision-hearing/" style="color:var(--text-muted);text-decoration:none;">Dental, Vision &amp; Hearing</a>
        <a href="/senior-life-insurance/" style="color:var(--text-muted);text-decoration:none;">Life Insurance</a>
        <a href="/medical-alert-systems/" style="color:var(--text-muted);text-decoration:none;">Medical Alerts</a>
        <a href="/caregiver-resources/" style="color:var(--text-muted);text-decoration:none;">Caregiver Resources</a>
        <a href="/senior-discounts/" style="color:var(--text-muted);text-decoration:none;">Senior Discounts</a>
        <a href="/compare/" style="color:var(--text-muted);text-decoration:none;">Compare Options</a>
        <a href="/tools/senior-care-cost-explorer/" style="color:var(--text-muted);text-decoration:none;">Care Cost Explorer</a>
      </div>
      <p class="footer-text">
        Information only &middot; Not financial, legal, tax, medical, or insurance advice &middot; Always speak with licensed professionals before making decisions.
      </p>
      <p class="footer-text small" style="margin-top:0.3rem;">
        This site may earn commissions from certain recommended services. Some links on this site may be affiliate or sponsored links. We may receive compensation when you click through or make a purchase. This does not affect our editorial independence or the accuracy of our information.
      </p>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.5rem 1rem;margin-top:0.5rem;font-size:0.78rem;">
        <a href="/about/" style="color:var(--text-muted);text-decoration:none;">About Us</a>
        <a href="/author/paul-paradis/" style="color:var(--text-muted);text-decoration:none;">Our Author</a>
        <a href="/editorial-policy/" style="color:var(--text-muted);text-decoration:none;">Editorial Standards</a>
        <a href="/how-we-research/" style="color:var(--text-muted);text-decoration:none;">How We Research</a>
        <a href="/fact-checking/" style="color:var(--text-muted);text-decoration:none;">Fact-Checking</a>
        <a href="/privacy-policy/" style="color:var(--text-muted);text-decoration:none;">Privacy Policy</a>
        <a href="/terms-of-use/" style="color:var(--text-muted);text-decoration:none;">Terms of Use</a>
        <a href="/contact/" style="color:var(--text-muted);text-decoration:none;">Contact</a>
      </div>
      <p class="footer-text small" style="margin-top:0.6rem;">
        &copy; ${YEAR} Senior Benefits Care Finder. For advertising and partnership inquiries only, email <a href="mailto:advertise@seniorbenefitscarefinder.com" style="color:var(--text-muted);">advertise@seniorbenefitscarefinder.com</a>.
      </p>
    </div>
  </footer>
  <script>
    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        this.closest('.faq-item').classList.toggle('open');
      });
    });
  </script>
  <script src="/affiliates.js"></script>
</body>
</html>`;
}

// Generate all hub pages
let generated = 0;
for (const hub of hubs) {
  const dir = path.join(__dirname, '..', hub.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, 'index.html');
  // Only create if it doesn't exist (don't overwrite existing pages like compare/)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, generateHubPage(hub), 'utf8');
    generated++;
    console.log(`Created: ${hub.slug}/index.html`);
  } else {
    console.log(`Skipped (exists): ${hub.slug}/index.html`);
  }
}

console.log(`\nDone. Generated ${generated} hub pages.`);
