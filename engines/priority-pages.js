const SITE = 'https://seniorbenefitscarefinder.com';

const cityClusters = {
  losAngeles: [
    ['/medicare/california/los-angeles/', 'Compare 2026 Medicare choices', 'Start with plan counts, drug coverage, and HICAP counseling before changing coverage.'],
    ['/medicaid/eligibility/california/los-angeles/', 'Check Medi-Cal eligibility', 'Use income limits, documents, and county application paths before applying.'],
    ['/prescription-assistance/california/los-angeles/', 'Lower prescription costs', 'Compare Extra Help, PAPs, and pharmacy discounts before paying retail.'],
    ['/home-care/cost/california/los-angeles/', 'Estimate home care costs', 'Price hourly aide support and compare Medicaid, VA, and private-pay options.'],
    ['/assisted-living/cost/california/los-angeles/', 'Compare assisted living costs', 'Review monthly care costs, included services, and payment paths.'],
    ['/long-term-care/california/los-angeles/', 'Plan long-term care funding', 'Connect care setting, Medicaid planning, insurance, and family budget decisions.'],
    ['/social-security/california/los-angeles/', 'Review Social Security timing', 'Compare claiming age, SSI, disability, and local SSA office steps.'],
    ['/veterans-benefits/california/los-angeles/', 'Find veteran benefit support', 'Check Aid and Attendance, VA health care, pension, and caregiver options.'],
  ],
  miami: [
    ['/medicare/florida/miami/', 'Compare Medicare in Miami', 'Check Advantage, Medigap, Part D, and counseling resources before enrolling.'],
    ['/medicaid/eligibility/florida/miami/', 'Check Florida Medicaid eligibility', 'Review income limits, documents, and long-term care coverage steps.'],
    ['/home-care/cost/florida/miami/', 'Price Miami home care', 'Compare hourly aide costs with Medicaid waiver and VA payment options.'],
    ['/assisted-living/cost/florida/miami/', 'Compare Miami assisted living', 'Use cost ranges and payment options before calling facilities.'],
  ],
  houston: [
    ['/medicare/texas/houston/', 'Compare Medicare in Houston', 'Review plan types, Part D coverage, and counseling steps before switching.'],
    ['/medicaid/eligibility/texas/houston/', 'Check Texas Medicaid eligibility', 'Use income limits and application documents before starting an application.'],
    ['/home-care/cost/texas/houston/', 'Price Houston home care', 'Estimate aide hours and compare private pay, Medicaid, and VA help.'],
    ['/assisted-living/cost/texas/houston/', 'Compare Houston assisted living', 'Review monthly costs, care levels, and payment routes.'],
  ],
  phoenix: [
    ['/medicare/arizona/phoenix/', 'Compare Medicare in Phoenix', 'Check plan choices, drug coverage, and counseling resources before enrolling.'],
    ['/medicaid/eligibility/arizona/phoenix/', 'Check AHCCCS eligibility', 'Review eligibility, documents, and care coverage before applying.'],
    ['/home-care/cost/arizona/phoenix/', 'Price Phoenix home care', 'Estimate hourly care and payment options before hiring an agency.'],
    ['/assisted-living/cost/arizona/phoenix/', 'Compare Phoenix assisted living', 'Use care-level costs and payment options to narrow facility calls.'],
  ],
};

const priorityPages = {
  '/medicare/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Los Angeles Medicare Decisions 2026: Plans, Costs, Next Steps',
    description: 'Decide what to do next with Los Angeles Medicare in 2026: compare 50 Advantage plans, Medigap, Part D, drug coverage, networks, and HICAP help.',
    h1: 'Los Angeles Medicare Decisions for 2026',
    intro: '<p>This Los Angeles Medicare guide is built for the moment before a coverage decision: choosing between Original Medicare, Medigap, Medicare Advantage, and Part D. Start by checking your doctors, prescriptions, ZIP-code plan availability, and HICAP counseling options, then use the cost and enrollment sections below to decide what to compare next.</p>',
    actionIntro: 'Use these Los Angeles pages together when Medicare costs, Medi-Cal eligibility, drug expenses, and care needs affect the same household decision.',
  },
  '/medicaid/eligibility/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Medi-Cal Los Angeles 2026: Eligibility, Documents, Apply',
    description: 'Check 2026 Medi-Cal eligibility in Los Angeles, including income limits, assets, documents, county application steps, and what seniors should do next.',
    h1: 'Medi-Cal Eligibility and Application Steps in Los Angeles',
    intro: '<p>This page helps Los Angeles seniors and caregivers decide whether to start a Medi-Cal application, gather documents, or compare dual-eligible help with Medicare. Review the income and asset limits first, then use the application and waiver sections to choose the next step before contacting the county office.</p>',
    actionIntro: 'Medi-Cal often affects Medicare premiums, prescription help, home care, and long-term care planning, so these related Los Angeles guides should be reviewed together.',
  },
  '/prescription-assistance/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Los Angeles Prescription Help 2026: Extra Help, PAPs, Discounts',
    description: 'Find the next step for lowering Los Angeles prescription costs in 2026: Extra Help, manufacturer PAPs, Part D review, and pharmacy discount options.',
    h1: 'Prescription Cost Help for Los Angeles Seniors',
    intro: '<p>Use this Los Angeles prescription assistance guide when a medication is unaffordable, newly denied, or no longer covered well by a Part D plan. Start with Extra Help eligibility, then compare manufacturer patient assistance, pharmacy discount prices, and annual Part D plan review steps.</p>',
    actionIntro: 'Prescription savings usually connect back to Medicare plan selection, Medi-Cal eligibility, and broader low-income support.',
  },
  '/home-care/cost/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Los Angeles Home Care Costs 2026: Hourly Rates, Payment Help',
    description: 'Estimate Los Angeles home care costs for 2026, compare aide hours, Medicaid HCBS, VA benefits, agency vetting, and what to do before hiring care.',
    h1: 'Los Angeles Home Care Cost and Payment Guide',
    intro: '<p>This Los Angeles home care page is for families deciding whether in-home help is affordable and what payment path to check first. Estimate the number of weekly aide hours, compare the monthly cost against assisted living, and review Medi-Cal, VA, and agency-vetting steps before signing with a provider.</p>',
    actionIntro: 'Home care decisions should be compared against assisted living, long-term care funding, Medi-Cal, and veteran benefits before care is scheduled.',
  },
  '/assisted-living/cost/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Los Angeles Assisted Living Costs 2026: Pay, Compare, Decide',
    description: 'Compare Los Angeles assisted living costs for 2026, care levels, included services, payment options, memory care, and next steps before touring.',
    h1: 'Los Angeles Assisted Living Cost Decisions',
    intro: '<p>This guide helps Los Angeles families decide whether assisted living is financially realistic before calling communities. Compare monthly cost ranges, care-level add-ons, memory care, and payment options, then use the related home care and long-term care pages to test alternatives.</p>',
    actionIntro: 'Assisted living should be evaluated beside home care, long-term care planning, Medi-Cal, and veterans benefits because each can change the monthly budget.',
  },
  '/long-term-care/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Los Angeles Long-Term Care 2026: Costs, Medicaid, Insurance',
    description: 'Plan Los Angeles long-term care in 2026 with cost comparisons, Medicaid planning, insurance options, care settings, and next actions for families.',
    h1: 'Long-Term Care Planning in Los Angeles',
    intro: '<p>This Los Angeles long-term care guide is for families comparing care settings, funding sources, and timing. Start by identifying whether the need is home care, assisted living, memory care, or nursing-home level care, then review Medicaid planning, insurance, and payment trade-offs before committing money.</p>',
    actionIntro: 'Long-term care planning works best when Los Angeles care costs, Medi-Cal rules, veteran support, and Social Security income are reviewed together.',
  },
  '/social-security/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Los Angeles Social Security 2026: Claiming, SSI, Local Steps',
    description: 'Use Los Angeles Social Security guidance for 2026 to compare claiming age, retirement income, SSI, SSDI, local office steps, and benefit decisions.',
    h1: 'Social Security Decisions for Los Angeles Seniors',
    intro: '<p>This Los Angeles Social Security guide focuses on decisions that change monthly income: when to claim retirement benefits, whether SSI or disability help applies, and what to prepare before contacting SSA. Use it alongside Medicare and Medi-Cal pages when benefit income affects coverage or care affordability.</p>',
    actionIntro: 'Social Security income influences Medicare affordability, Medi-Cal eligibility, prescription help, and care budgets.',
  },
  '/veterans-benefits/california/los-angeles/': {
    cluster: 'losAngeles',
    title: 'Los Angeles Veterans Benefits 2026: VA Care, Pension, Aid',
    description: 'Find Los Angeles veterans benefit next steps for 2026, including Aid and Attendance, VA health care, pension, caregiver support, and senior care costs.',
    h1: 'Veterans Benefits for Los Angeles Seniors',
    intro: '<p>This Los Angeles veterans benefits page is for veterans, spouses, and caregivers deciding which VA support to check first. Review Aid and Attendance, pension, VA health care, caregiver support, and care-cost links before comparing private-pay senior care options.</p>',
    actionIntro: 'Veteran benefits can change the best care option, especially when home care, assisted living, long-term care, and Medicare are also in play.',
  },
  '/medicare/florida/miami/': {
    cluster: 'miami',
    title: 'Miami Medicare Decisions 2026: Plans, Costs, Enrollment',
    description: 'Decide next steps for Medicare in Miami in 2026: compare Advantage, Medigap, Part D, doctor networks, prescription costs, and SHINE counseling.',
    h1: 'Miami Medicare Decisions for 2026',
    intro: '<p>This Miami Medicare guide is designed for choosing what to compare next, not just reading plan definitions. Check doctors, prescriptions, county plan availability, and SHINE counseling resources before using the plan, cost, and enrollment sections below.</p>',
    actionIntro: 'Miami Medicare choices often overlap with Medicaid eligibility, home care needs, and assisted living costs.',
  },
  '/medicaid/eligibility/florida/miami/': {
    cluster: 'miami',
    title: 'Miami Medicaid Eligibility 2026: Limits, Documents, Apply',
    description: 'Check Miami Medicaid eligibility in 2026 with income and asset limits, required documents, application steps, long-term care rules, and next actions.',
    h1: 'Medicaid Eligibility and Application Steps in Miami',
    intro: '<p>This Miami Medicaid page helps seniors decide whether to apply, gather documents, or ask for long-term care coverage guidance. Start with income and asset limits, then review application methods and programs that may help with care costs.</p>',
    actionIntro: 'Medicaid can affect Medicare out-of-pocket costs, home care access, and assisted living planning in Miami.',
  },
  '/home-care/cost/florida/miami/': {
    cluster: 'miami',
    title: 'Miami Home Care Costs 2026: Hourly Aide Rates, Payment Help',
    description: 'Estimate Miami home care costs for 2026, compare aide hours, Medicaid waiver coverage, VA benefits, and what to check before hiring an agency.',
    h1: 'Miami Home Care Cost and Payment Guide',
    intro: '<p>This Miami home care guide helps families turn an hourly rate into a real monthly budget. Estimate weekly aide hours, compare agency and care-type costs, and review Medicaid, VA, and assisted living alternatives before hiring care.</p>',
    actionIntro: 'Home care affordability in Miami should be checked beside Medicaid, Medicare, and assisted living costs.',
  },
  '/assisted-living/cost/florida/miami/': {
    cluster: 'miami',
    title: 'Miami Assisted Living Costs 2026: Compare Care and Payment',
    description: 'Compare 2026 Miami assisted living costs, care levels, memory care, included services, payment options, and next steps before touring facilities.',
    h1: 'Miami Assisted Living Cost Decisions',
    intro: '<p>This Miami assisted living guide is for narrowing choices before tours begin. Review monthly cost ranges, what is included, care-level add-ons, memory care, and payment options, then compare home care and Medicaid possibilities.</p>',
    actionIntro: 'Miami assisted living decisions are stronger when home care, Medicaid, and Medicare costs are reviewed together.',
  },
  '/medicare/texas/houston/': {
    cluster: 'houston',
    title: 'Houston Medicare Decisions 2026: Plans, Costs, Next Steps',
    description: 'Compare Houston Medicare options for 2026, including Advantage, Medigap, Part D, provider networks, enrollment timing, and free counseling steps.',
    h1: 'Houston Medicare Decisions for 2026',
    intro: '<p>This Houston Medicare guide helps seniors decide what to compare before enrolling or switching. Start with doctor networks, prescription coverage, plan costs, and counseling resources, then use the enrollment section to avoid timing mistakes.</p>',
    actionIntro: 'Houston Medicare decisions often connect with Medicaid eligibility, home care affordability, and assisted living planning.',
  },
  '/medicaid/eligibility/texas/houston/': {
    cluster: 'houston',
    title: 'Houston Medicaid Eligibility 2026: Limits, Documents, Apply',
    description: 'Check Houston Medicaid eligibility for 2026: income and asset limits, documents, application steps, senior programs, and what to do next.',
    h1: 'Medicaid Eligibility and Application Steps in Houston',
    intro: '<p>This Houston Medicaid page helps seniors and caregivers decide whether to start an application, prepare documents, or explore long-term care coverage. Review the limits first, then use the application and program sections to choose a practical next step.</p>',
    actionIntro: 'Houston Medicaid eligibility can affect Medicare costs, home care coverage, and assisted living or long-term care planning.',
  },
  '/home-care/cost/texas/houston/': {
    cluster: 'houston',
    title: 'Houston Home Care Costs 2026: Hourly Rates and Payment Help',
    description: 'Estimate Houston home care costs in 2026, compare aide hours, agency vetting, Medicaid coverage, VA help, and assisted living alternatives.',
    h1: 'Houston Home Care Cost and Payment Guide',
    intro: '<p>This Houston home care guide helps families decide if in-home support fits the budget before calling agencies. Convert hourly rates into weekly and monthly costs, compare payment options, and check assisted living alternatives when care hours grow.</p>',
    actionIntro: 'Home care decisions in Houston should be reviewed with Medicaid eligibility, assisted living costs, and Medicare coverage needs.',
  },
  '/assisted-living/cost/texas/houston/': {
    cluster: 'houston',
    title: 'Houston Assisted Living Costs 2026: Compare, Pay, Decide',
    description: 'Compare Houston assisted living costs for 2026 with care levels, memory care, included services, payment options, and next steps before tours.',
    h1: 'Houston Assisted Living Cost Decisions',
    intro: '<p>This Houston assisted living page helps families compare facility costs before scheduling tours. Review monthly rates, care-level add-ons, memory care, and payment options, then compare home care if only limited help is needed.</p>',
    actionIntro: 'Houston assisted living choices are easier to evaluate alongside home care, Medicaid, and Medicare cost pages.',
  },
  '/medicare/arizona/phoenix/': {
    cluster: 'phoenix',
    title: 'Phoenix Medicare Decisions 2026: Plans, Costs, Enrollment',
    description: 'Compare Phoenix Medicare options for 2026, including Advantage plans, Medigap, Part D, network checks, counseling, and enrollment next steps.',
    h1: 'Phoenix Medicare Decisions for 2026',
    intro: '<p>This Phoenix Medicare guide focuses on the practical choice ahead: which coverage path to compare and what to verify before enrolling. Check providers, prescriptions, plan availability, and counseling options before using the cost and enrollment sections below.</p>',
    actionIntro: 'Phoenix Medicare choices often overlap with AHCCCS eligibility, prescription costs, home care, and assisted living decisions.',
  },
  '/medicaid/eligibility/arizona/phoenix/': {
    cluster: 'phoenix',
    title: 'Phoenix AHCCCS Eligibility 2026: Limits, Documents, Apply',
    description: 'Check AHCCCS eligibility in Phoenix for 2026 with income limits, documents, application steps, senior coverage, and what to do next.',
    h1: 'AHCCCS Eligibility and Application Steps in Phoenix',
    intro: '<p>This Phoenix AHCCCS page helps seniors decide whether to apply, gather documents, or compare coverage with Medicare and care needs. Start with eligibility limits, then review application methods, programs, and waiver-related care options.</p>',
    actionIntro: 'AHCCCS can affect Medicare out-of-pocket costs, home care payment options, and assisted living planning in Phoenix.',
  },
  '/home-care/cost/arizona/phoenix/': {
    cluster: 'phoenix',
    title: 'Phoenix Home Care Costs 2026: Hourly Rates, Payment Help',
    description: 'Estimate Phoenix home care costs in 2026, compare aide hours, care types, AHCCCS coverage, VA support, and agency selection steps.',
    h1: 'Phoenix Home Care Cost and Payment Guide',
    intro: '<p>This Phoenix home care guide helps families estimate real monthly cost before hiring an agency. Compare hourly aide rates, care types, and payment options, then review AHCCCS, VA, and assisted living alternatives if the care need is growing.</p>',
    actionIntro: 'Phoenix home care planning should be compared with AHCCCS, Medicare, and assisted living cost decisions.',
  },
  '/assisted-living/cost/arizona/phoenix/': {
    cluster: 'phoenix',
    title: 'Phoenix Assisted Living Costs 2026: Compare Care and Pay',
    description: 'Compare Phoenix assisted living costs for 2026, care levels, memory care, included services, payment options, and next steps before tours.',
    h1: 'Phoenix Assisted Living Cost Decisions',
    intro: '<p>This Phoenix assisted living guide helps families decide what is affordable before facility tours. Review monthly costs, care-level fees, memory care, and payment options, then compare home care and AHCCCS support where relevant.</p>',
    actionIntro: 'Phoenix assisted living choices are clearer when home care, AHCCCS, and Medicare costs are reviewed together.',
  },
};

function buildActionLinks(pagePath, clusterName) {
  return (cityClusters[clusterName] || [])
    .filter(([url]) => url !== pagePath)
    .slice(0, 6)
    .map(([url, title, description]) => ({ url, title, description }));
}

function getPriorityPage(pathname) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const page = priorityPages[normalized];
  if (!page) return null;
  return {
    ...page,
    canonicalUrl: `${SITE}${normalized}`,
    priorityActionHeading: page.actionHeading || 'Next steps connected to this decision',
    priorityActionIntro: page.actionIntro,
    priorityActionLinks: buildActionLinks(normalized, page.cluster),
    robotsDirective: 'index, follow',
  };
}

module.exports = {
  getPriorityPage,
  priorityPages,
};
