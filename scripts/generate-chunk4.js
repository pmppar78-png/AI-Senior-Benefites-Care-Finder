#!/usr/bin/env node
/**
 * Chunk 4 generator: expand from ~11,221 to ~13,750 pages
 * Creates 10 new subcategory sets × 252 locations = ~2,520 pages
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

const subcategories = [
  {
    dir: 'medicare/part-d',
    title: (loc) => `Medicare Part D in ${loc} (2026) – Prescription Drug Plans & Costs`,
    desc: (loc) => `Compare Medicare Part D prescription drug plans in ${loc} for 2026. See costs, coverage, formularies, and enrollment periods for Medicare drug coverage.`,
    h1: (loc) => `Medicare Part D Prescription Drug Plans in ${loc}`,
    intro: (loc) => `Medicare Part D in ${loc} provides prescription drug coverage through private insurance plans approved by Medicare. This guide covers 2026 plan options, costs, how to compare formularies, enrollment periods, and financial assistance for drug costs.`,
    sections: [
      {heading: 'How Part D Works', content: 'Medicare Part D is optional prescription drug coverage available to everyone with Medicare. You can get Part D through a standalone Prescription Drug Plan (PDP) added to Original Medicare, or through a Medicare Advantage plan that includes drug coverage (MA-PD). Each plan has its own list of covered drugs (formulary), network pharmacies, and cost structure. Plans must meet minimum coverage standards set by Medicare but can vary significantly in what they cover and what you pay.'},
      {heading: 'Costs and Coverage Phases', content: 'Part D costs include a monthly premium (national average around $55 in 2026), an annual deductible (maximum $590 in 2026), copays or coinsurance for each prescription, and the coverage gap. In the initial coverage phase, you pay copays until total drug costs reach $5,030. In the coverage gap (donut hole), you pay 25% of brand-name drug costs. Catastrophic coverage begins after $8,000 in true out-of-pocket costs, where you pay $0 for covered drugs under the Inflation Reduction Act provisions.'},
      {heading: 'Choosing the Right Plan', content: 'When comparing Part D plans, list all your current medications with dosages. Use the Medicare Plan Finder tool to see which plans cover your drugs and at what tier. Consider total annual costs including premiums, deductibles, and copays — not just the monthly premium. Check that your preferred pharmacies are in-network. Review the plan\'s formulary restrictions such as prior authorization, step therapy, and quantity limits. Plans change annually, so review your coverage each fall during open enrollment.'},
      {heading: 'Extra Help (Low-Income Subsidy)', content: 'Medicare Extra Help pays Part D premiums, deductibles, and copays for people with limited income and resources. Full Extra Help is available for those with income below 135% of the Federal Poverty Level and resources below $11,430 (individual) or $22,110 (couple). Partial Extra Help covers those with income up to 150% FPL. Apply through Social Security online, by phone, or at your local office. Many people who qualify have not yet applied.'},
      {heading: 'Enrollment Periods and Penalties', content: 'Enroll in Part D during your Initial Enrollment Period (7 months around your 65th birthday), the Annual Enrollment Period (October 15 – December 7), or a Special Enrollment Period if you lose other creditable drug coverage. If you delay enrollment without creditable coverage, you may pay a late enrollment penalty of 1% of the national base premium multiplied by the number of months without coverage, added permanently to your Part D premium.'}
    ]
  },
  {
    dir: 'medicare/advantage',
    title: (loc) => `Medicare Advantage Plans in ${loc} (2026) – Compare MA Plans & Benefits`,
    desc: (loc) => `Compare Medicare Advantage plans in ${loc} for 2026. See benefits, costs, ratings, and coverage options for MA plans including dental, vision, and hearing.`,
    h1: (loc) => `Medicare Advantage Plans in ${loc}`,
    intro: (loc) => `Medicare Advantage plans in ${loc} are an alternative to Original Medicare offered by private insurance companies. This guide covers 2026 plan options, additional benefits like dental and vision, costs, star ratings, and how to choose the best MA plan for your needs.`,
    sections: [
      {heading: 'What Medicare Advantage Covers', content: 'Medicare Advantage (Part C) plans must cover everything Original Medicare covers (Part A and Part B), but most plans offer additional benefits. Common extras include prescription drug coverage (Part D), dental care including cleanings, fillings, and dentures, vision exams and eyeglasses, hearing exams and hearing aids, fitness programs like SilverSneakers, telehealth services, over-the-counter allowances, meal delivery after hospital stays, and transportation to medical appointments.'},
      {heading: 'Types of MA Plans', content: 'Medicare Advantage plans come in several types. Health Maintenance Organization (HMO) plans require you to use network providers and get referrals for specialists. Preferred Provider Organization (PPO) plans allow out-of-network care at higher costs without referrals. Private Fee-for-Service (PFFS) plans determine how much they pay providers and how much you pay when you receive care. Special Needs Plans (SNPs) are designed for people with specific diseases, limited income, or who live in institutions.'},
      {heading: 'Costs to Expect', content: 'Most MA plans charge a monthly premium in addition to your Part B premium, though many plans offer $0 premiums. Plans set annual out-of-pocket maximums (no higher than $8,850 for in-network services in 2026), which Original Medicare does not have. You will pay copays or coinsurance for services. Some plans offer lower costs for staying in-network. Total costs depend on how much care you use, so compare estimated annual costs based on your health needs rather than just premiums.'},
      {heading: 'Star Ratings', content: 'Medicare rates MA plans on a 1 to 5 star scale based on quality of care, member satisfaction, plan administration, and customer service. Five-star plans offer a Special Enrollment Period allowing you to switch to them at any time. Higher-rated plans generally provide better care coordination, fewer complaints, and better health outcomes. Check Medicare.gov Plan Finder for current ratings. Consider plans rated 4 stars or higher for the best quality experience.'},
      {heading: 'Enrollment and Switching', content: 'Enroll in MA plans during your Initial Enrollment Period when you first become eligible for Medicare, the Annual Enrollment Period (October 15 – December 7), or the Medicare Advantage Open Enrollment Period (January 1 – March 31) to switch to a different MA plan or return to Original Medicare. If you have a Special Enrollment Period due to moving, losing coverage, or qualifying for Extra Help, you can also enroll or switch outside these regular periods.'}
    ]
  },
  {
    dir: 'medicaid/home-care-waivers',
    title: (loc) => `Medicaid Home Care Waivers in ${loc} (2026) – HCBS Programs & Eligibility`,
    desc: (loc) => `Learn about Medicaid home and community-based services waivers in ${loc} for 2026. See HCBS eligibility, covered services, how to apply, and waitlist information.`,
    h1: (loc) => `Medicaid Home Care Waivers in ${loc}`,
    intro: (loc) => `Medicaid home and community-based services (HCBS) waivers in ${loc} allow seniors to receive long-term care at home instead of in a nursing facility. This guide covers 2026 waiver programs, eligibility requirements, services covered, and application procedures.`,
    sections: [
      {heading: 'What Are HCBS Waivers', content: 'Home and Community-Based Services (HCBS) waivers allow states to provide Medicaid-funded long-term care services in home and community settings rather than institutions. These waivers "waive" certain Medicaid rules, allowing states to target services to specific populations, cap enrollment, and offer services not typically covered by Medicaid. HCBS waivers serve seniors, people with disabilities, and individuals with developmental disabilities who would otherwise require nursing home care.'},
      {heading: 'Services Covered', content: 'HCBS waivers typically cover personal care assistance with bathing, dressing, and grooming, homemaker services including meal preparation and housekeeping, adult day health services, respite care for family caregivers, home modifications such as ramps, grab bars, and widened doorways, assistive technology and medical equipment, skilled nursing visits, transportation to medical appointments, case management, and personal emergency response systems. Specific services vary by state and waiver program.'},
      {heading: 'Eligibility Requirements', content: 'To qualify for an HCBS waiver, you generally must meet Medicaid financial eligibility (income and asset limits), require a nursing home level of care as determined by a functional assessment, be able to be safely served in the community with waiver services, and choose to receive services at home rather than in a facility. Many states use higher income limits for HCBS waivers than for regular Medicaid, with some allowing income up to 300% of the SSI federal benefit rate.'},
      {heading: 'Waitlists and Enrollment', content: 'Because HCBS waivers have limited enrollment slots, many states maintain waitlists. Wait times range from a few months to several years depending on the state and waiver program. Some states prioritize applicants based on urgency of need, with those at immediate risk of institutionalization receiving priority. To get on a waitlist, contact your state Medicaid office or Area Agency on Aging. Continue to reaffirm your interest periodically to maintain your place on the list.'},
      {heading: 'How to Apply', content: 'Apply for HCBS waivers through your state Medicaid agency, local Area Agency on Aging, or Aging and Disability Resource Center. The process typically involves a Medicaid financial application, a functional needs assessment conducted by a nurse or social worker, development of a person-centered care plan, and selection of a waiver service provider. Gather financial documents, medical records, and a list of current care needs before applying. An elder law attorney or benefits counselor can help navigate the process.'}
    ]
  },
  {
    dir: 'social-security/disability',
    title: (loc) => `Social Security Disability (SSDI) in ${loc} (2026) – Benefits & How to Apply`,
    desc: (loc) => `Learn about Social Security Disability Insurance (SSDI) in ${loc} for 2026. See eligibility, benefit amounts, application process, and appeal options.`,
    h1: (loc) => `Social Security Disability Benefits in ${loc}`,
    intro: (loc) => `Social Security Disability Insurance (SSDI) in ${loc} provides monthly benefits to people who cannot work due to a significant medical condition. This guide covers 2026 eligibility, benefit amounts, the application process, and what to do if your claim is denied.`,
    sections: [
      {heading: 'SSDI Eligibility', content: 'To qualify for SSDI, you must have a medical condition that prevents you from performing substantial gainful activity (SGA), which means earning more than $1,620 per month in 2026. The condition must be expected to last at least 12 months or result in death. You must have earned enough work credits through Social Security taxes — generally 40 credits (10 years of work), with 20 credits earned in the last 10 years. Younger workers may qualify with fewer credits. Social Security uses a five-step evaluation process to determine disability.'},
      {heading: 'Benefit Amounts', content: 'SSDI benefit amounts are based on your average lifetime earnings covered by Social Security. The average SSDI payment in 2026 is approximately $1,580 per month, with the maximum benefit around $3,822 per month. Benefits begin after a five-month waiting period from the date Social Security determines your disability began. After 24 months of SSDI benefits, you automatically qualify for Medicare. Your dependents (spouse, children) may also receive auxiliary benefits up to the family maximum.'},
      {heading: 'Application Process', content: 'Apply for SSDI online at SSA.gov, by calling 1-800-772-1213, or at your local Social Security office. You will need your Social Security number, birth certificate, medical records and treatment history, names and contact information for all doctors and hospitals, a list of all medications, work history for the past 15 years, and your most recent W-2 or tax return. Initial processing takes 3-6 months. Provide thorough medical evidence to strengthen your claim.'},
      {heading: 'Appeals Process', content: 'About 65% of initial SSDI applications are denied. You have 60 days to appeal at each level. The four appeal levels are: Reconsideration (your claim is reviewed by a different examiner), hearing before an Administrative Law Judge (ALJ), Appeals Council review, and Federal Court review. The ALJ hearing is where most successful appeals are won. Consider hiring a disability attorney or representative who works on contingency (paid from back benefits, capped at 25% or $7,200). Most attorneys offer free consultations.'},
      {heading: 'Working While on SSDI', content: 'Social Security offers work incentives to help SSDI recipients return to work. The Trial Work Period allows you to test your ability to work for 9 months (not necessarily consecutive) within a 60-month period while receiving full benefits. During the Extended Period of Eligibility (36 months), benefits are paid for months you earn below SGA. Expedited Reinstatement allows you to restart benefits within 5 years if you stop working due to your condition. The Ticket to Work program provides free employment support services.'}
    ]
  },
  {
    dir: 'assisted-living/respite-care',
    title: (loc) => `Respite Care in ${loc} (2026) – Short-Term Senior Care Options & Costs`,
    desc: (loc) => `Find respite care options in ${loc} for 2026. Compare short-term care for seniors, costs, types of respite services, and financial assistance for caregivers.`,
    h1: (loc) => `Respite Care Options in ${loc}`,
    intro: (loc) => `Respite care in ${loc} provides temporary relief for family caregivers by offering short-term care for seniors. This guide covers 2026 respite care types, costs, how to find providers, and financial assistance programs to help pay for respite services.`,
    sections: [
      {heading: 'Types of Respite Care', content: 'Respite care comes in several forms to meet different needs. In-home respite brings a caregiver to your home for a few hours or overnight. Adult day programs provide supervised care during daytime hours with activities and meals. Residential respite offers short-term stays (days to weeks) in assisted living facilities or nursing homes. Emergency respite provides immediate care when a caregiver faces a crisis. Specialized respite programs exist for caregivers of people with dementia, developmental disabilities, or complex medical needs.'},
      {heading: 'Costs of Respite Care', content: 'Respite care costs vary by type and location. In-home respite typically costs $15-$30 per hour. Adult day services average $80-$150 per day. Residential respite in assisted living ranges from $150-$300 per day. Nursing home respite costs $250-$500 per day. Some programs offer free or subsidized respite through grants, Medicaid waivers, or nonprofit organizations. Many families use a combination of paid and volunteer respite to manage costs.'},
      {heading: 'Finding Respite Care', content: 'Find respite care through your local Area Agency on Aging, the ARCH National Respite Network, Alzheimer\'s Association (for dementia caregivers), local assisted living and nursing facilities, home care agencies, adult day care centers, faith-based organizations, and your state\'s lifespan respite program. Ask about availability, minimum and maximum stay lengths, medical care capabilities, and activities provided. Visit facilities and interview providers before committing.'},
      {heading: 'Paying for Respite Care', content: 'Financial assistance for respite care is available through several sources. Medicaid HCBS waivers in most states cover some respite hours. The VA provides up to 30 days per year of respite care for veterans. The National Family Caregiver Support Program funds respite through Area Agencies on Aging. Some long-term care insurance policies cover respite. State lifespan respite programs offer grants. The Alzheimer\'s Association and other disease-specific organizations may offer respite grants.'},
      {heading: 'Benefits for Caregivers', content: 'Regular respite care prevents caregiver burnout, which affects an estimated 60% of family caregivers. Studies show that respite care reduces caregiver stress, depression, and health problems. It also benefits care recipients by providing social interaction and stimulation. Experts recommend caregivers use respite services regularly rather than waiting until they reach a crisis point. Even a few hours per week can significantly improve caregiver well-being and the quality of care provided.'}
    ]
  },
  {
    dir: 'veterans-benefits/health-care',
    title: (loc) => `VA Health Care for Veterans in ${loc} (2026) – Enrollment & Benefits`,
    desc: (loc) => `Learn about VA health care benefits in ${loc} for 2026. See enrollment eligibility, priority groups, covered services, and how to find VA medical facilities.`,
    h1: (loc) => `VA Health Care Benefits in ${loc}`,
    intro: (loc) => `VA health care in ${loc} provides comprehensive medical services to eligible veterans through the Veterans Health Administration. This guide covers 2026 enrollment eligibility, priority groups, covered services, copays, and how to access VA medical care.`,
    sections: [
      {heading: 'Eligibility and Enrollment', content: 'Most veterans who served in active military service and were discharged under conditions other than dishonorable are eligible for VA health care. Enrollment priority is based on service-connected disabilities, income, and other factors. Veterans with service-connected disabilities, former POWs, Purple Heart recipients, and those with catastrophic disabilities receive the highest priority. Apply online at VA.gov, by phone at 1-877-222-8387, or in person at any VA medical facility. Have your DD-214 and income information ready.'},
      {heading: 'Priority Groups', content: 'VA assigns veterans to one of eight priority groups that determine enrollment eligibility and copay requirements. Group 1 includes veterans with 50% or higher service-connected disabilities. Group 2 covers 30-40% disabilities. Group 3 covers 10-20% or former POWs and Purple Heart recipients. Group 4 includes veterans receiving Aid & Attendance. Group 5 covers low-income veterans. Groups 6-8 cover other categories including Gulf War veterans, World War I veterans, and higher-income veterans with no service-connected conditions.'},
      {heading: 'Covered Services', content: 'VA health care covers preventive care and screenings, primary care and specialist visits, hospital and surgical care, mental health services including PTSD treatment, prescription medications, diagnostic tests and imaging, physical and occupational therapy, home health and respite care, prosthetics and medical equipment, dental care (for some veterans), vision care and eye exams, audiology and hearing aids, telehealth appointments, and geriatric and long-term care services.'},
      {heading: 'Copays and Costs', content: 'Many veterans receive VA care at no cost, especially those with service-connected disabilities rated 50% or higher. Others may have copays based on their priority group and the type of care. Primary care copays range from $0 to $50 per visit. Specialty care copays range from $0 to $75. Inpatient care copays vary. Prescription copays range from $0 to $11 for a 30-day supply. VA copays are generally lower than private insurance costs. Copay exemptions exist for combat veterans within 5 years of discharge.'},
      {heading: 'Finding VA Care', content: 'Access VA care through VA Medical Centers (VAMCs), Community-Based Outpatient Clinics (CBOCs), Vet Centers for readjustment counseling, and Community Care providers through the MISSION Act when VA care is not available within access standards. Use the VA facility locator at VA.gov to find nearby locations. The MISSION Act allows veterans to see community providers if wait times exceed 20 days or drive times exceed 30 minutes for primary care (60 minutes for specialty care).'}
    ]
  },
  {
    dir: 'low-income-programs/snap',
    title: (loc) => `SNAP Food Benefits for Seniors in ${loc} (2026) – Eligibility & How to Apply`,
    desc: (loc) => `Apply for SNAP food benefits in ${loc} for 2026. See senior eligibility, benefit amounts, simplified application process, and how to use EBT cards.`,
    h1: (loc) => `SNAP Food Benefits for Seniors in ${loc}`,
    intro: (loc) => `SNAP (Supplemental Nutrition Assistance Program) helps seniors in ${loc} afford nutritious food. This guide covers 2026 eligibility rules for older adults, benefit amounts, the simplified application process, and how to use your EBT card.`,
    sections: [
      {heading: 'Eligibility for Seniors', content: 'Seniors age 60 and older may qualify for SNAP if their gross monthly income is at or below 130% of the Federal Poverty Level ($1,580 for an individual, $2,137 for a couple in 2026) and net income is at or below 100% FPL after deductions. Households where all members are elderly or disabled have no gross income test — only the net income limit applies. Resource limits are $4,250 for households with an elderly or disabled member. Your home, one vehicle, and retirement accounts are generally exempt.'},
      {heading: 'Benefit Amounts', content: 'SNAP benefit amounts depend on household size, income, and allowable deductions. The maximum monthly benefit for a single person in 2026 is approximately $292, and for a couple approximately $535. Many seniors receive less than the maximum. The minimum benefit for one or two-person households with an elderly member is approximately $23 per month. Deductions that increase your benefit include shelter costs exceeding half your income (with a cap), medical expenses over $35 per month for elderly/disabled members, and dependent care costs.'},
      {heading: 'Simplified Application', content: 'Seniors have simplified SNAP application options. Many states offer telephone or mail-in applications without requiring an office visit. Elderly and disabled applicants may have a home interview instead of visiting an office. Certification periods are longer for elderly households (typically 24 months vs. 12 months). Required documents include proof of identity, Social Security number, income verification, rent or mortgage receipts, utility bills, and medical expense receipts. Contact your local SNAP office or dial 211 for assistance.'},
      {heading: 'Using Your EBT Card', content: 'SNAP benefits are loaded monthly onto an Electronic Benefit Transfer (EBT) card that works like a debit card at authorized retailers. Use it at grocery stores, supermarkets, farmers markets (many offer bonus programs doubling SNAP dollars for produce), some online grocery delivery services (Amazon, Walmart, and others in most states), and some restaurants through the Restaurant Meals Program for elderly, disabled, or homeless SNAP recipients. EBT covers food items but not alcohol, tobacco, vitamins, hot prepared foods, or non-food household items.'},
      {heading: 'Additional Food Programs', content: 'Seniors can combine SNAP with other food assistance programs. The Commodity Supplemental Food Program (CSFP) provides monthly food boxes to seniors 60+. The Senior Farmers Market Nutrition Program provides vouchers for fresh produce at farmers markets. Meals on Wheels and congregate meal programs through the Older Americans Act serve free meals. Many food banks offer senior-specific distributions. The Emergency Food Assistance Program (TEFAP) provides free food through food banks. None of these programs reduce your SNAP benefits.'}
    ]
  },
  {
    dir: 'home-care/palliative',
    title: (loc) => `Palliative Care at Home in ${loc} (2026) – Services, Costs & Providers`,
    desc: (loc) => `Find palliative care at home in ${loc} for 2026. Learn about comfort care services, costs, insurance coverage, and how palliative care differs from hospice.`,
    h1: (loc) => `Palliative Care at Home in ${loc}`,
    intro: (loc) => `Palliative care at home in ${loc} focuses on improving quality of life for seniors with serious illnesses. This guide covers 2026 services, costs, insurance coverage, how to access home palliative care, and the difference between palliative and hospice care.`,
    sections: [
      {heading: 'What Is Palliative Care', content: 'Palliative care is specialized medical care for people with serious illnesses such as cancer, heart failure, COPD, kidney disease, Parkinson\'s, and dementia. It focuses on relieving symptoms, pain, and stress regardless of the diagnosis or stage of illness. Unlike hospice, palliative care can be received alongside curative treatments at any point during an illness. The goal is to improve quality of life for both the patient and family through expert symptom management, communication support, and care coordination.'},
      {heading: 'Services Provided at Home', content: 'Home palliative care services include pain management and symptom control, medication management and adjustment, coordination with all treating physicians, advance care planning and goals-of-care conversations, emotional and psychological support, social work services for practical needs, spiritual care if desired, caregiver education and support, nutritional guidance, physical therapy to maintain function, and regular in-home visits from a palliative care team including physicians, nurse practitioners, nurses, and social workers.'},
      {heading: 'Palliative Care vs. Hospice', content: 'Palliative care and hospice share a focus on comfort and quality of life, but they differ in key ways. Palliative care has no time restriction and can begin at any stage of illness, while hospice is typically for the last six months of life. Palliative care patients continue receiving curative treatments, while hospice patients generally forgo curative treatment. Palliative care is covered by insurance including Medicare, Medicaid, and private plans under standard medical benefits, while hospice has its own Medicare benefit structure.'},
      {heading: 'Costs and Insurance Coverage', content: 'Palliative care is covered by Medicare, Medicaid, and most private insurance plans as a medical benefit. Costs depend on the specific services provided and your insurance coverage. Under Medicare, palliative care is billed as outpatient medical care with standard Part B copays. Some services may require specialist copays. For Medicaid, coverage varies by state but generally includes palliative care services. Some palliative care programs offer sliding scale fees for those without insurance.'},
      {heading: 'How to Access Palliative Care', content: 'Ask your doctor for a referral to palliative care — you do not need to wait for a terminal diagnosis. Find providers through the Center to Advance Palliative Care provider directory at GetPalliativeCare.org, your local hospital palliative care program (most hospitals with 50+ beds have one), home health agencies with palliative care services, and your insurance company\'s provider directory. When choosing a palliative care provider, ask about their experience with your specific condition, availability for urgent needs, and how they coordinate with your existing care team.'}
    ]
  },
  {
    dir: 'senior-legal/estate-planning',
    title: (loc) => `Estate Planning for Seniors in ${loc} (2026) – Wills, Trusts & Probate`,
    desc: (loc) => `Plan your estate in ${loc} for 2026. Learn about wills, trusts, probate, power of attorney, advance directives, and how to protect your assets for your beneficiaries.`,
    h1: (loc) => `Estate Planning for Seniors in ${loc}`,
    intro: (loc) => `Estate planning in ${loc} helps seniors protect their assets, ensure their wishes are followed, and minimize the burden on their families. This guide covers 2026 essentials including wills, trusts, power of attorney, advance directives, and probate avoidance strategies.`,
    sections: [
      {heading: 'Essential Estate Planning Documents', content: 'Every senior should have these core documents: a Last Will and Testament directing how assets are distributed; a Durable Power of Attorney appointing someone to manage financial affairs if you become incapacitated; a Health Care Power of Attorney (or Health Care Proxy) naming someone to make medical decisions on your behalf; a Living Will or Advance Directive stating your wishes for end-of-life medical care; and a HIPAA Authorization allowing designated individuals to access your medical information. Without these documents, courts may make decisions for you.'},
      {heading: 'Wills vs. Trusts', content: 'A will is the foundation of estate planning, directing asset distribution and naming an executor. However, wills must go through probate, which is public, can be costly, and takes months to years. A revocable living trust avoids probate by transferring assets during your lifetime to a trust you control. Upon your death, the successor trustee distributes assets privately and quickly. Trusts cost more to establish ($1,500-$5,000) but save time and money in the long run for estates with significant assets. Many seniors benefit from having both a will and a trust.'},
      {heading: 'Power of Attorney', content: 'A Durable Power of Attorney (DPOA) is critical for seniors. It authorizes a trusted person (agent) to handle financial matters if you become unable to do so. "Durable" means it remains effective even if you become incapacitated. A "springing" DPOA takes effect only upon incapacity, while an "immediate" DPOA is effective as soon as it is signed. Choose your agent carefully — they will have broad authority over your finances. Consider naming a successor agent in case your first choice is unable to serve. All states have their own DPOA requirements.'},
      {heading: 'Advance Directives', content: 'Advance directives communicate your health care wishes when you cannot speak for yourself. A Living Will specifies what life-sustaining treatments you do or do not want (ventilators, feeding tubes, resuscitation). A Health Care Power of Attorney names your decision-maker for medical situations not covered by your Living Will. A POLST or MOLST form (Physician/Medical Orders for Life-Sustaining Treatment) is a medical order used for seriously ill patients. Review and update advance directives regularly, share copies with your agent, doctors, and family.'},
      {heading: 'Probate and How to Avoid It', content: 'Probate is the court-supervised process of validating a will and distributing assets. It can take 6-18 months, costs 3-8% of estate value, and is public record. Strategies to avoid probate include establishing a revocable living trust, naming beneficiaries on accounts (retirement, life insurance, bank POD, investment TOD), holding property in joint tenancy with right of survivorship, using Transfer on Death deeds for real estate (available in many states), and gifting assets during your lifetime within annual exclusion limits.'}
    ]
  },
  {
    dir: 'long-term-care/medicaid-planning',
    title: (loc) => `Medicaid Long-Term Care Planning in ${loc} (2026) – Protect Your Assets`,
    desc: (loc) => `Plan for Medicaid long-term care coverage in ${loc} for 2026. Learn about asset protection, look-back periods, irrevocable trusts, and spousal protections.`,
    h1: (loc) => `Medicaid Long-Term Care Planning in ${loc}`,
    intro: (loc) => `Medicaid planning in ${loc} helps seniors protect assets while qualifying for long-term care coverage. This guide covers 2026 strategies including asset protection, the look-back period, irrevocable trusts, spousal protections, and when to start planning.`,
    sections: [
      {heading: 'Why Medicaid Planning Matters', content: 'Long-term care costs average $8,000-$10,000 per month for nursing home care and $4,500-$6,500 for assisted living. Most people cannot afford to pay these costs indefinitely from personal savings. Medicare covers only short-term skilled nursing care, not long-term custodial care. Medicaid is the primary payer for long-term care, covering 62% of nursing home residents nationally. However, Medicaid requires you to have limited assets and income. Proper planning helps you qualify without impoverishing your family.'},
      {heading: 'Asset Protection Strategies', content: 'Legal strategies to protect assets include Medicaid Asset Protection Trusts (irrevocable trusts that shield assets after the look-back period), converting countable assets to exempt assets (paying off your mortgage, buying a new vehicle, making home improvements), purchasing an irrevocable burial trust, paying for a Medicaid-compliant annuity that converts assets to income, making caregiver agreements with family members who provide care, and gifting with the half-a-loaf strategy. All strategies must be implemented carefully to avoid penalties. Consult an elder law attorney.'},
      {heading: 'The Look-Back Period', content: 'Medicaid examines financial transactions made during the 60 months (5 years) before your application date. Gifts, transfers for less than fair market value, and certain trust transactions made during this period trigger a penalty period during which Medicaid will not pay for nursing home care. The penalty is calculated by dividing the total transferred amount by the average monthly cost of nursing home care in your state. The look-back period makes early planning essential — ideally beginning at least 5 years before you anticipate needing long-term care.'},
      {heading: 'Spousal Protections', content: 'Federal law prevents the "community spouse" (spouse not in a nursing facility) from being impoverished. The Community Spouse Resource Allowance (CSRA) allows the community spouse to retain approximately half of the couple\'s countable assets, between a minimum of roughly $30,828 and a maximum of roughly $154,140 in 2026. The Monthly Maintenance Needs Allowance (MMNA) allows a portion of the institutional spouse\'s income to go to the community spouse if their income falls below approximately $3,853 per month. Additional protections may be available through fair hearing appeals.'},
      {heading: 'When to Start Planning', content: 'Ideally, begin Medicaid planning at least 5 years before you may need long-term care, well before any health crisis occurs. However, even if you need care now, crisis planning strategies can protect some assets. Key triggers to start planning include turning 60, a spouse being diagnosed with a progressive illness, family history of dementia or conditions requiring long-term care, and lack of long-term care insurance. Consult a certified elder law attorney (CELA) or member of the National Academy of Elder Law Attorneys (NAELA) for state-specific guidance.'}
    ]
  }
];

const categoryNames = {
  'medicare': 'Medicare', 'medicaid': 'Medicaid', 'assisted-living': 'Assisted Living',
  'home-care': 'Home Care', 'social-security': 'Social Security', 'veterans-benefits': 'Veterans Benefits',
  'long-term-care': 'Long-Term Care', 'prescription-assistance': 'Prescription Assistance',
  'disability-benefits': 'Disability Benefits', 'low-income-programs': 'Low-Income Programs',
  'senior-legal': 'Senior Legal'
};

const subcatNames = {
  'part-d': 'Part D Plans', 'advantage': 'Advantage Plans', 'home-care-waivers': 'Home Care Waivers',
  'disability': 'Disability Benefits', 'respite-care': 'Respite Care', 'health-care': 'VA Health Care',
  'snap': 'SNAP Food Benefits', 'palliative': 'Palliative Care', 'estate-planning': 'Estate Planning',
  'medicaid-planning': 'Medicaid Planning'
};

function generateDatePublished(path) {
  let h = 0;
  for (let i = 0; i < path.length; i++) h = ((h << 5) - h + path.charCodeAt(i)) | 0;
  h = Math.abs(h);
  const d = new Date('2024-09-01');
  d.setDate(d.getDate() + (h % 470));
  return d.toISOString().split('T')[0];
}

function generatePage(subcat, locationName, canonicalPath, breadcrumbs) {
  const title = subcat.title(locationName);
  const description = subcat.desc(locationName);
  const h1 = subcat.h1(locationName);
  const intro = subcat.intro(locationName);

  const breadcrumbHtml = breadcrumbs.map((bc, i) => {
    const isLast = i === breadcrumbs.length - 1;
    return `      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        ${isLast ? `<span itemprop="name">${bc.name}</span>` : `<a itemprop="item" href="${bc.url}"><span itemprop="name">${bc.name}</span></a>`}
        <meta itemprop="position" content="${i + 1}" />
      </li>`;
  }).join('\n');

  const sectionsHtml = subcat.sections.map(s => `
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
  <link rel="canonical" href="https://seniorbenefitscarefinder.com/${canonicalPath}/" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="https://seniorbenefitscarefinder.com/${canonicalPath}/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Senior Benefits Care Finder" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="/engine.css" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "description": "${description}",
    "url": "https://seniorbenefitscarefinder.com/${canonicalPath}/",
    "dateModified": "${new Date().toISOString().split('T')[0]}",
    "datePublished": "${generateDatePublished(canonicalPath)}",
    "author": {"@type":"Person","name":"Paul Paradis","url":"https://seniorbenefitscarefinder.com/author/paul-paradis/"},
    "publisher": {"@type":"Organization","name":"Senior Benefits Care Finder","url":"https://seniorbenefitscarefinder.com"}
  }
  </script>
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
      <a href="/editorial-policy/" class="mobile-menu-link">Editorial Policy</a>
      <a href="/how-we-research/" class="mobile-menu-link">How We Research</a>
      <a href="/privacy-policy/" class="mobile-menu-link">Privacy Policy</a>
      <a href="/terms-of-use/" class="mobile-menu-link">Terms of Use</a>
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
${breadcrumbHtml}
      </ol>
    </nav>

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
      <a href="/about/">About</a>
      <a href="/editorial-policy/">Editorial Policy</a>
      <a href="/how-we-research/">How We Research</a>
      <a href="/privacy-policy/">Privacy Policy</a>
      <a href="/terms-of-use/">Terms of Use</a>
      <a href="/contact/">Contact</a>
    </div>
    <p class="footer-copy">&copy; 2026 Senior Benefits Care Finder. All rights reserved.</p>
    <p class="footer-disclaimer">This site is for informational purposes only and does not constitute legal, financial, or medical advice. This site may earn commissions from certain recommended services. The AI assistant may suggest partners or services that this site has a relationship with.</p>
  </footer>

  <script src="/script.js" defer></script>
  <script src="/affiliates.js"></script>
</body>
</html>`;
}

let totalWritten = 0;

for (const subcat of subcategories) {
  const parts = subcat.dir.split('/');
  const catSlug = parts[0];
  const subcatSlug = parts[1];
  const catName = categoryNames[catSlug];
  const subcatName = subcatNames[subcatSlug];

  for (const state of states) {
    const dirPath = path.join(BASE, subcat.dir, state.slug);
    const filePath = path.join(dirPath, 'index.html');
    if (fs.existsSync(filePath)) continue;

    const canonicalPath = `${subcat.dir}/${state.slug}`;
    const breadcrumbs = [
      {name: 'Home', url: '/'},
      {name: catName, url: `/${catSlug}/`},
      {name: subcatName, url: `/${subcat.dir}/`},
      {name: state.name, url: null}
    ];

    const html = generatePage(subcat, state.name, canonicalPath, breadcrumbs);
    fs.mkdirSync(dirPath, {recursive: true});
    fs.writeFileSync(filePath, html);
    totalWritten++;
  }

  for (const state of states) {
    const cities = stateCities[state.slug] || [];
    for (const city of cities) {
      const dirPath = path.join(BASE, subcat.dir, state.slug, city.slug);
      const filePath = path.join(dirPath, 'index.html');
      if (fs.existsSync(filePath)) continue;

      const locationName = `${city.name}, ${state.name}`;
      const canonicalPath = `${subcat.dir}/${state.slug}/${city.slug}`;
      const breadcrumbs = [
        {name: 'Home', url: '/'},
        {name: catName, url: `/${catSlug}/`},
        {name: subcatName, url: `/${subcat.dir}/`},
        {name: state.name, url: `/${subcat.dir}/${state.slug}/`},
        {name: city.name, url: null}
      ];

      const html = generatePage(subcat, locationName, canonicalPath, breadcrumbs);
      fs.mkdirSync(dirPath, {recursive: true});
      fs.writeFileSync(filePath, html);
      totalWritten++;
    }
  }

  console.log(`[${subcat.dir}] done — ${totalWritten} pages written so far`);
}

console.log(`\nTotal new pages written: ${totalWritten}`);
