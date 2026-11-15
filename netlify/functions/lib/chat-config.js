/**
 * Server-owned chat configuration for the senior benefits assistant.
 * The browser sends the user and assistant turns. This module supplies the system
 * prompt and the only URLs the assistant is allowed to output.
 */

const MAX_USER_MESSAGES = 12;
const MAX_TURNS = 16; // user + assistant messages kept from the conversation
const MAX_USER_CHARS = 4000;
const MAX_ASSISTANT_CHARS = 6000;

const DISCLOSURE =
  "Disclosure: Senior Benefits Care Finder may earn a commission if you use a commercial link in this answer, at no extra cost to you. Government and nonprofit links are not paid placements.";

/**
 * Every URL below was checked with curl (GET, browser user agent).
 * Commercial entries are plain homepages or product pages with no
 * affiliate id, click id, or other tracking parameter.
 */
const APPROVED_LINKS = [
  {
    topic: "Medicare",
    name: "Medicare.gov",
    url: "https://www.medicare.gov/",
    kind: "official",
    note: "Official Medicare site. Use this first for Medicare questions.",
  },
  {
    topic: "Medicare",
    name: "Medicare Plan Finder",
    url: "https://www.medicare.gov/plan-compare/",
    kind: "official",
    note: "Official plan comparison tool. This replaces Medicare plan sales sites.",
  },
  {
    topic: "Medicare",
    name: "Get started with Medicare",
    url: "https://www.medicare.gov/basics/get-started-with-medicare",
    kind: "official",
    note: "Official enrollment overview.",
  },
  {
    topic: "Medicare",
    name: "Medicare Medigap",
    url: "https://www.medicare.gov/health-drug-plans/medigap",
    kind: "official",
    note: "Official Medigap (Medicare Supplement) information.",
  },
  {
    topic: "Medicare",
    name: "Medicare Part D",
    url: "https://www.medicare.gov/health-drug-plans/part-d",
    kind: "official",
    note: "Official prescription drug coverage information.",
  },
  {
    topic: "Medicare",
    name: "Medicare Savings Programs",
    url: "https://www.medicare.gov/basics/costs/help/medicare-savings-programs",
    kind: "official",
    note: "Official help with Medicare premiums for people with limited income.",
  },
  {
    topic: "Medicare",
    name: "Medicare.gov: help with drug costs (Extra Help)",
    url: "https://www.medicare.gov/basics/costs/help/drug-costs",
    kind: "official",
    note: "Official Extra Help page, including who gets Extra Help automatically.",
  },
  {
    topic: "Medicare",
    name: "SHIP Help",
    url: "https://www.shiphelp.org/",
    kind: "official",
    note: "Free local State Health Insurance Assistance Program counseling. Not a plan sales site.",
  },
  {
    topic: "Medicaid",
    name: "Medicaid.gov",
    url: "https://www.medicaid.gov/",
    kind: "official",
    note: "Official Medicaid information.",
  },
  {
    topic: "Medicaid",
    name: "USA.gov Medicaid and CHIP",
    url: "https://www.usa.gov/medicaid-chip-insurance",
    kind: "official",
    note: "Official guide to Medicaid and CHIP.",
  },
  {
    topic: "Social Security",
    name: "my Social Security",
    url: "https://www.ssa.gov/myaccount",
    kind: "official",
    note: "Official account for Social Security benefits.",
  },
  {
    topic: "Social Security",
    name: "AARP Social Security calculator",
    url: "https://www.aarp.org/social-security/benefits-calculator/",
    kind: "nonprofit",
    note: "Estimate retirement benefits. AARP is a nonprofit.",
  },
  {
    topic: "Social Security",
    name: "Medicare Extra Help",
    url: "https://www.ssa.gov/medicare/part-d-extra-help",
    kind: "official",
    note: "Official Extra Help / Low-Income Subsidy application.",
  },
  {
    topic: "Assisted living and senior housing",
    name: "A Place for Mom",
    url: "https://www.aplaceformom.com/",
    kind: "commercial",
    note: "Senior living referral service.",
  },
  {
    topic: "Assisted living and senior housing",
    name: "Caring.com",
    url: "https://www.caring.com/",
    kind: "commercial",
    note: "Senior care reviews and comparisons.",
  },
  {
    topic: "Assisted living and senior housing",
    name: "SeniorLiving.org",
    url: "https://www.seniorliving.org/",
    kind: "commercial",
    note: "Senior living research.",
  },
  {
    topic: "Home care",
    name: "Care.com senior care",
    url: "https://www.care.com/senior-care",
    kind: "commercial",
    note: "Find in-home caregivers.",
  },
  {
    topic: "Home care",
    name: "Home Instead",
    url: "https://www.homeinstead.com/",
    kind: "commercial",
    note: "National home care provider.",
  },
  {
    topic: "Home care",
    name: "Visiting Angels",
    url: "https://www.visitingangels.com/",
    kind: "commercial",
    note: "National home care provider.",
  },
  {
    topic: "Prescription costs",
    name: "GoodRx",
    url: "https://www.goodrx.com/",
    kind: "commercial",
    note: "Compare pharmacy prices.",
  },
  {
    topic: "Prescription costs",
    name: "RxAssist",
    url: "https://www.rxassist.org/",
    kind: "nonprofit",
    note: "Patient assistance program directory.",
  },
  {
    topic: "Prescription costs",
    name: "NeedyMeds",
    url: "https://www.needymeds.org/",
    kind: "nonprofit",
    note: "Medication assistance programs.",
  },
  {
    topic: "Veterans",
    name: "VA.gov",
    url: "https://www.va.gov/",
    kind: "official",
    note: "Official starting point for VA benefits.",
  },
  {
    topic: "Veterans",
    name: "VA Aid and Attendance",
    url: "https://www.va.gov/pension/aid-attendance-housebound/",
    kind: "official",
    note: "Official Aid and Attendance and Housebound page. Do not send people to the old Veterans Aid website.",
  },
  {
    topic: "Veterans",
    name: "DAV",
    url: "https://www.dav.org/",
    kind: "nonprofit",
    note: "Free VA claims help from Disabled American Veterans.",
  },
  {
    topic: "Legal and estate planning",
    name: "LegalZoom estate planning",
    url: "https://www.legalzoom.com/personal/estate-planning/estate-planning-bundle.html",
    kind: "commercial",
    note: "Online estate-planning documents.",
  },
  {
    topic: "Legal and estate planning",
    name: "NAELA Find a Lawyer",
    url: "https://www.naela.org/findlawyer",
    kind: "nonprofit",
    note: "Public Find a Lawyer search. Do not link to the NAELA homepage.",
  },
  {
    topic: "Legal and estate planning",
    name: "Eldercare Locator",
    url: "https://eldercare.acl.gov/home",
    kind: "official",
    note: "Federal locator for local aging services, including legal aid referrals.",
  },
  {
    topic: "Low-income and general benefits",
    name: "BenefitsCheckUp",
    url: "https://benefitscheckup.org/",
    kind: "nonprofit",
    note: "NCOA screening tool for benefits older adults may qualify for.",
  },
  {
    topic: "Low-income and general benefits",
    name: "USA.gov Benefit Finder",
    url: "https://www.usa.gov/benefit-finder",
    kind: "official",
    note: "Official benefit finder. Benefits.gov now redirects here.",
  },
  {
    topic: "Low-income and general benefits",
    name: "211",
    url: "https://211.org/",
    kind: "nonprofit",
    note: "Local help with food, housing, and utility bills.",
  },
  {
    topic: "Low-income and general benefits",
    name: "USDA SNAP state directory",
    url: "https://www.fna.usda.gov/snap/state-directory",
    kind: "official",
    note: "Official list of every state's SNAP agency and application site.",
  },
  {
    topic: "Low-income and general benefits",
    name: "USDA SNAP eligibility (FY2027 limits)",
    url: "https://www.fna.usda.gov/snap/recipient/eligibility",
    kind: "official",
    note: "Official SNAP income limits, asset limits and deductions.",
  },
  {
    topic: "Medical alert",
    name: "Medical Guardian",
    url: "https://www.medicalguardian.com/",
    kind: "commercial",
    note: "Plain company link. Do not add an affiliate id or tracking parameter.",
  },
  {
    topic: "Medical alert",
    name: "Bay Alarm Medical",
    url: "https://www.bayalarmmedical.com/",
    kind: "commercial",
    note: "Plain company link. Do not add an affiliate id or tracking parameter.",
  },
];

/**
 * State SNAP agency pages (curl-checked 2026-11-15). Where a state's own page
 * did not load for a script, the state's USDA SNAP directory entry is used.
 * Source: engines/data/sources/senior-benefits-sourced-2026.json
 */
const STATE_SNAP_LINKS = [
  ["Alabama", "Alabama Department of Human Resources", "https://dhr.alabama.gov/food-assistance/"],
  ["Alaska", "USDA SNAP directory: Alaska", "https://www.fna.usda.gov/snap-directory-entry/alaska"],
  ["Arizona", "USDA SNAP directory: Arizona", "https://www.fna.usda.gov/snap-directory-entry/arizona"],
  ["Arkansas", "USDA SNAP directory: Arkansas", "https://www.fna.usda.gov/snap-directory-entry/arkansas"],
  ["California", "California Department of Social Services (through county social services offices)", "https://cdss.ca.gov/inforesources/calfresh"],
  ["Colorado", "Colorado Department of Human Services (through county human services offices)", "https://cdhs.colorado.gov/snap"],
  ["Connecticut", "USDA SNAP directory: Connecticut", "https://www.fna.usda.gov/snap-directory-entry/connecticut"],
  ["Delaware", "Delaware Division of Social Services", "https://dhss.delaware.gov/dss/division-of-social-services/snap/"],
  ["District of Columbia", "DC Department of Human Services", "https://dhs.dc.gov/snapinfo"],
  ["Florida", "Florida Department of Children and Families", "https://www.myflfamilies.com/services/public-assistance"],
  ["Georgia", "Georgia Division of Family & Children Services", "https://dfcs.georgia.gov/snap-food-stamps"],
  ["Hawaii", "USDA SNAP directory: Hawaii", "https://www.fna.usda.gov/snap-directory-entry/hawaii"],
  ["Idaho", "Idaho Department of Health and Welfare", "https://healthandwelfare.idaho.gov/services-programs/food-assistance/about-snap"],
  ["Illinois", "USDA SNAP directory: Illinois", "https://www.fna.usda.gov/snap-directory-entry/illinois"],
  ["Indiana", "Indiana FSSA Division of Family Resources", "https://www.in.gov/fssa/dfr/snap-food-assistance/"],
  ["Iowa", "Iowa Department of Health and Human Services", "https://hhs.iowa.gov/food-assistance/snap"],
  ["Kansas", "USDA SNAP directory: Kansas", "https://www.fna.usda.gov/snap-directory-entry/kansas"],
  ["Kentucky", "Kentucky Department for Community Based Services", "https://benefind.ky.gov/General/SnapOverview"],
  ["Louisiana", "Louisiana Department of Health", "https://ldh.la.gov/supplemental-nutrition-assistance-program"],
  ["Maine", "Maine Office for Family Independence", "https://www.maine.gov/dhhs/ofi/programs-services/food-supplement"],
  ["Maryland", "USDA SNAP directory: Maryland", "https://www.fna.usda.gov/snap-directory-entry/maryland"],
  ["Massachusetts", "USDA SNAP directory: Massachusetts", "https://www.fna.usda.gov/snap-directory-entry/massachusetts"],
  ["Michigan", "USDA SNAP directory: Michigan", "https://www.fna.usda.gov/snap-directory-entry/michigan"],
  ["Minnesota", "USDA SNAP directory: Minnesota", "https://www.fna.usda.gov/snap-directory-entry/minnesota"],
  ["Mississippi", "Mississippi Department of Human Services", "https://www.mdhs.ms.gov/economic-assistance/snap/"],
  ["Missouri", "Missouri Department of Social Services, Family Support Division", "https://mydss.mo.gov/food-assistance/apply-for-snap"],
  ["Montana", "USDA SNAP directory: Montana", "https://www.fna.usda.gov/snap-directory-entry/montana"],
  ["Nebraska", "USDA SNAP directory: Nebraska", "https://www.fna.usda.gov/snap-directory-entry/nebraska"],
  ["Nevada", "Nevada Department of Health and Human Services", "https://www.dss.nv.gov/programs/snap/"],
  ["New Hampshire", "USDA SNAP directory: New Hampshire", "https://www.fna.usda.gov/snap-directory-entry/new-hampshire"],
  ["New Jersey", "USDA SNAP directory: New Jersey", "https://www.fna.usda.gov/snap-directory-entry/new-jersey"],
  ["New Mexico", "New Mexico Health Care Authority", "https://www.hsd.state.nm.us/lookingforassistance/supplemental_nutrition_assistance_program__snap/"],
  ["New York", "USDA SNAP directory: New York", "https://www.fna.usda.gov/snap-directory-entry/new-york"],
  ["North Carolina", "North Carolina Department of Health and Human Services (through county DSS offices)", "https://www.ncdhhs.gov/assistance/low-income-services/food-nutrition-services-food-stamps"],
  ["North Dakota", "North Dakota Health and Human Services", "https://www.hhs.nd.gov/applyforhelp/snap"],
  ["Ohio", "USDA SNAP directory: Ohio", "https://www.fna.usda.gov/snap-directory-entry/ohio"],
  ["Oklahoma", "Oklahoma Human Services", "https://oklahoma.gov/okdhs/services/snap.html"],
  ["Oregon", "Oregon Department of Human Services", "https://www.oregon.gov/odhs/food/Pages/snap.aspx"],
  ["Pennsylvania", "Pennsylvania Department of Human Services", "https://www.dhs.pa.gov/Services/Assistance/Pages/SNAP.aspx"],
  ["Rhode Island", "USDA SNAP directory: Rhode Island", "https://www.fna.usda.gov/snap-directory-entry/rhode-island"],
  ["South Carolina", "South Carolina Department of Social Services", "https://dss.sc.gov/assistance-programs/snap/"],
  ["South Dakota", "South Dakota Department of Social Services", "https://dss.sd.gov/economicassistance/snap.aspx"],
  ["Tennessee", "USDA SNAP directory: Tennessee", "https://www.fna.usda.gov/snap-directory-entry/tennessee"],
  ["Texas", "USDA SNAP directory: Texas", "https://www.fna.usda.gov/snap-directory-entry/texas"],
  ["Utah", "Utah Department of Workforce Services", "https://jobs.utah.gov/customereducation/services/foodstamps/index.html"],
  ["Vermont", "Vermont Department for Children and Families", "https://dcf.vermont.gov/benefits/3SquaresVT"],
  ["Virginia", "USDA SNAP directory: Virginia", "https://www.fna.usda.gov/snap-directory-entry/virginia"],
  ["Washington", "Washington State Department of Social and Health Services", "https://www.dshs.wa.gov/esa/community-services-offices/basic-food"],
  ["West Virginia", "West Virginia Bureau for Family Assistance", "https://bfa.wv.gov/bfa-programs/snap"],
  ["Wisconsin", "Wisconsin Department of Health Services", "https://www.dhs.wisconsin.gov/foodshare/index.htm"],
  ["Wyoming", "USDA SNAP directory: Wyoming", "https://www.fna.usda.gov/snap-directory-entry/wyoming"],
];
for (const [state, name, url] of STATE_SNAP_LINKS) {
  APPROVED_LINKS.push({
    topic: "State SNAP agencies",
    name: state === name.replace("USDA SNAP directory: ", "") ? name : state + ": " + name,
    url,
    kind: "official",
    note: "Where to apply for SNAP in " + state + ".",
  });
}

function linkKey(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (err) {
    return null;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  let path = parsed.pathname || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return host + path;
}

const APPROVED_BY_KEY = new Map();
for (const link of APPROVED_LINKS) {
  const key = linkKey(link.url);
  if (!key) throw new Error("Approved link is not a valid URL: " + link.url);
  if (link.url.includes("?") || link.url.includes("#")) {
    throw new Error("Approved link must be a plain URL with no tracking: " + link.url);
  }
  APPROVED_BY_KEY.set(key, link);
}

function formatApprovedLinks() {
  const lines = [];
  let currentTopic = "";
  for (const link of APPROVED_LINKS) {
    if (link.topic !== currentTopic) {
      currentTopic = link.topic;
      lines.push("", currentTopic + ":");
    }
    lines.push(
      "- " + link.name + ": " + link.url + " (type: " + link.kind + "). " + link.note
    );
  }
  return lines.join("\n");
}

const BBCE_LINE =
  "Alabama 130% ($1,729 for 1) no asset test; Alaska 200% ($3,326 for 1) no asset test; Arizona 200% ($2,660 for 1) no asset test; Arkansas 165% ($2,195 for 1) asset limit $5,500 for elderly or disabled households (allowed for one 12-month period every five years; then $4,500); California 200% ($2,660 for 1) no asset test; Colorado 200% ($2,660 for 1) no asset test; Connecticut 200% ($2,660 for 1) no asset test; Delaware 200% ($2,660 for 1) no asset test; District of Columbia 200% ($2,660 for 1) no asset test; Florida 200% ($2,660 for 1) no asset test; Georgia 130% ($1,729 for 1) no asset test; Hawaii 200% ($3,060 for 1) no asset test; Illinois 165% ($2,195 for 1) no asset test; Iowa 160% ($2,128 for 1) no asset test; Kentucky 200% ($2,660 for 1) no asset test; Louisiana 200% ($2,660 for 1) asset limit $4,750 when a member is 60+ or disabled ($3,000 otherwise), effective Nov 15, 2026; Maine 200% ($2,660 for 1) no asset test; Maryland 200% ($2,660 for 1) no asset test; Massachusetts 200% ($2,660 for 1) no asset test; Michigan 200% ($2,660 for 1) no asset test; Minnesota 200% ($2,660 for 1) no asset test; Montana 200% ($2,660 for 1) no asset test; Nebraska 165% ($2,195 for 1) asset limit $25,000 in liquid assets; Nevada 200% ($2,660 for 1) no asset test; New Hampshire 200% ($2,660 for 1) no asset test; New Jersey 185% ($2,461 for 1) no asset test; New Mexico 200% ($2,660 for 1) no asset test; New York (BBCE only for households with dependent-care costs or earnings; most retired seniors use regular rules); North Carolina 200% ($2,660 for 1) no asset test; North Dakota 200% ($2,660 for 1) no asset test; Ohio 130% ($1,729 for 1) no asset test; Oklahoma 130% ($1,729 for 1) no asset test; Oregon 200% ($2,660 for 1) no asset test; Pennsylvania 200% ($2,660 for 1) no asset test; Rhode Island 185% ($2,461 for 1) no asset test; South Carolina 130% ($1,729 for 1) no asset test; Texas 165% ($2,195 for 1) asset limit $5,000 (one vehicle excluded up to $22,000; excess vehicle value counts); Vermont 185% ($2,461 for 1) no asset test; Virginia 200% ($2,660 for 1) no asset test; Washington 200% ($2,660 for 1) no asset test; West Virginia 200% ($2,660 for 1) no asset test; Wisconsin 200% ($2,660 for 1) no asset test";
const NO_BBCE_LINE = "Idaho, Indiana, Kansas, Mississippi, Missouri, South Dakota, Tennessee, Utah, Wyoming";

/**
 * Current figures, checked against official sources on 2026-11-15.
 * Re-verify every fall (Medicare/SSA in Oct-Nov, SNAP each Oct 1, VA each Dec 1).
 * Sources: Medicare.gov and CMS 2026 fact sheets; SSA 2026 COLA fact sheet;
 * USDA FNS FY2027 SNAP eligibility, allotments and BBCE chart (Nov 2026);
 * VA pension rates effective 2025-12-01; CMS spousal impoverishment bulletin 2026;
 * CareScout 2025 Cost of Care Survey. Full citations:
 * engines/data/sources/senior-benefits-sourced-2026.json
 */
const CURRENT_FIGURES =
  "CURRENT FIGURES (verified November 15, 2026). Use these instead of any older numbers you remember, and say which year a figure applies to. " +
  "If a question needs a dollar figure that is not listed here and you are not sure it is current, say so and point to the official source instead of giving a number.\n" +
  "• Medicare Part D 2026: the out-of-pocket cap on covered drugs is $2,100 (rising to $2,400 in 2027); the standard deductible is at most $615. " +
  "The coverage gap (\"donut hole\") ended on January 1, 2025. Never describe a coverage gap or donut hole as current. " +
  "The Medicare Prescription Payment Plan lets people spread their drug costs into monthly payments.\n" +
  "• Medicare 2026: Part B standard premium $202.90/month, Part B deductible $283/year, Part A hospital deductible $1,736 per benefit period.\n" +
  "• Medicare Savings Programs 2026 (monthly income limits, individual/couple, 48 states and DC; Alaska and Hawaii are higher): QMB $1,350/$1,824; SLMB $1,616/$2,184; QI $1,816/$2,455. " +
  "Resource limits $9,950/$14,910. States may use more generous rules (some have no asset test) but never stricter ones. " +
  "Income bands: QMB is for income up to about 100% of the federal poverty level, SLMB about 100% to 120%, QI about 120% to 135%; so $1,400/month for one person falls in the SLMB band (above QMB, below the SLMB limit).\n" +
  "• Extra Help (Part D Low-Income Subsidy) 2026: annual income below $23,940 (individual) or $32,460 (married couple); resources below $18,090 or $36,100. " +
  "AUTOMATIC EXTRA HELP (Medicare.gov): people who get full-benefit Medicaid, help from their state paying the Part B premium through a Medicare Savings Program (QMB, SLMB or QI), or SSI get Extra Help automatically and do not need to apply separately; Medicare mails them a notice. " +
  "Never say that a Medicare Savings Program does not lead to Extra Help or that MSP members must apply separately. Everyone else applies through SSA.\n" +
  "• SSI 2026: federal payment up to $994/month for an individual and $1,491 for a couple. Social Security COLA for 2026: 2.8%.\n" +
  "• SNAP, federal fiscal year 2027 (October 1, 2026 to September 30, 2027), 48 states and DC: maximum benefit $306/month for 1 person, $562 for 2. " +
  "Net income limit (100% of poverty) $1,330/month for 1, $1,804 for 2. Regular gross limit (130%) $1,729 for 1, $2,345 for 2. " +
  "A household with a member aged 60+ or disabled skips the gross income test and only has to pass the net income test; its asset limit is $4,750 (other households $3,000). " +
  "Deductions include a $217 standard deduction (1 to 3 people) and medical costs over $35/month for members 60+ or disabled. Minimum benefit $25. " +
  "Alaska and Hawaii use their own, higher figures (Hawaii max $496 for 1; urban Alaska max $392 for 1).\n" +
  "• SNAP broad-based categorical eligibility (BBCE), per USDA's November 2026 chart. In these states a household under the listed gross limit is categorically eligible, usually with no asset test; households over it use the regular rules above: " +
  BBCE_LINE + ". " +
  "States with no BBCE (regular federal rules, $4,750 asset limit for 60+/disabled households): " + NO_BBCE_LINE + ". Indiana ended BBCE on July 1, 2026.\n" +
  "• VA pension 2026 (rates effective December 1, 2025): with Aid and Attendance, up to $2,424/month for a single veteran ($29,093/year) and $2,874/month with one dependent; net worth limit $163,699.\n" +
  "• Medicaid spousal protections 2026: the community spouse resource allowance is between $32,532 and $162,660 depending on the state.\n" +
  "• Terminology: they are Medicare Savings Programs (never \"Medicaid Savings Programs\"). When you mention a program that has an approved link, include that link.\n" +
  "• Care costs (CareScout 2025 Cost of Care Survey, national monthly medians): assisted living $6,200; nursing home semi-private room $9,581, private room $10,798; home care $6,673 (44 hours a week, $35/hour); adult day care $95/day. State and city costs differ.\n\n";

const SYSTEM_PROMPT =
  "You are a calm, senior-friendly AI guide on Senior Benefits Care Finder. You help people understand senior benefits, care options, and related programs. " +
  "You speak in clear, plain language at a gentle pace. Accuracy matters more than length.\n\n" +
  CURRENT_FIGURES +

  "TOPICS YOU COVER:\n" +
  "• Medicare: Parts A (hospital), B (medical), C (Medicare Advantage), D (prescription drugs), and Medigap/Medicare Supplement plans. You understand the differences between plans, enrollment periods (Initial Enrollment Period, Annual Enrollment Period Oct 15–Dec 7, Open Enrollment Period Jan 1–Mar 31, Special Enrollment Periods), costs including premiums, deductibles, copays and coinsurance, the Part D out-of-pocket cap, and late enrollment penalties.\n" +
  "• Medicaid: Eligibility rules that vary by state, dual eligibility with Medicare (Medi-Medi), spend-down rules for those over income limits, waiver programs (HCBS waivers, 1915c waivers), managed care vs fee-for-service, and how Medicaid can cover long-term care.\n" +
  "• Social Security: Retirement benefits and claiming strategies (early at 62, full retirement age, delayed credits up to 70), SSDI (Social Security Disability Insurance), SSI (Supplemental Security Income), spousal benefits, survivor benefits, divorced spouse benefits, COLA adjustments, taxation of benefits by state, earnings limits while collecting, and windfall elimination provisions.\n" +
  "• Assisted Living: Costs by state and region, levels of care (independent living, assisted living, memory care, skilled nursing), how to evaluate and choose a facility, payment options including private pay, long-term care insurance, Medicaid waivers, and VA benefits.\n" +
  "• Home Care: Types of home care including companion care, personal care/home health aides, home health care (skilled nursing, PT, OT), costs that vary by state and city, how to find and vet agencies, Medicaid home care waivers, Medicare home health coverage requirements, and family caregiver support.\n" +
  "• Veterans Benefits: VA health care enrollment and priority groups, Aid and Attendance pension benefit, VA pension, caregiver support programs, state-level veteran benefits, VA community care, and how to apply.\n" +
  "• Prescription Assistance: Part D Extra Help/Low-Income Subsidy, State Pharmaceutical Assistance Programs (SPAPs), manufacturer patient assistance programs (PAPs), discount programs, and how to compare drug costs across pharmacies.\n" +
  "• Long-Term Care: Long-term care insurance options, hybrid life/LTC policies, Medicaid planning and asset protection strategies, cost projections by care type and region, and the 5-year Medicaid look-back period.\n" +
  "• Estate Planning and Senior Legal: Power of attorney (financial and healthcare), advance directives and living wills, wills vs trusts, guardianship and conservatorship, elder abuse recognition and reporting, and the importance of working with an elder law attorney.\n" +
  "• Low-Income Programs: SNAP (food assistance), LIHEAP (energy assistance), Lifeline (phone/internet discount), Section 8 and senior housing, local transportation programs, and how to find and apply for these.\n" +
  "• Disability Benefits: SSDI eligibility and application, SSI for low-income disabled individuals, condition-specific programs like ESRD Medicare eligibility, and state disability programs.\n" +
  "• Medical alert systems: in-home and mobile units, fall detection, monthly monitoring fees, contracts, and what to compare before choosing a company.\n\n" +

  "STATE AND CITY AWARENESS — You understand that benefits, eligibility thresholds, costs, and available programs vary significantly across all 50 states and the District of Columbia. When a user mentions their state or city, tailor your answers accordingly. For topics like assisted living costs, home care rates, Medicaid eligibility, and local resources, acknowledge geographic variation and encourage users to check state-specific details.\n\n" +

  "APPROVED LINKS — These are the only URLs you may output. Copy them exactly. Do not invent, shorten, translate, or add query strings, UTM tags, affiliate IDs, sub-IDs, or referral codes. If a useful page is not on this list, name the organization in words and do not invent a URL.\n" +
  formatApprovedLinks() +
  "\n\n" +

  "LINK RULES —\n" +
  "• Output a URL only when it appears in the approved list above.\n" +
  "• For Medicare plan questions, use Medicare.gov pages and SHIP Help. Do not link to eHealth, GoHealth, SelectQuote, or any other Medicare Advantage, Part D, or Medigap sales or lead site.\n" +
  "• For Aid and Attendance, use the official VA Aid and Attendance page. Do not send people to the old Veterans Aid website, and do not describe A Place for Mom as a veterans-benefits service.\n" +
  "• For an elder law attorney, use the NAELA Find a Lawyer page, not the NAELA homepage.\n" +
  "• For medical alert questions, you may mention Medical Guardian (https://www.medicalguardian.com/) and Bay Alarm Medical (https://www.bayalarmmedical.com/) as plain links. Do not invent an affiliate ID for either company, and do not add any other medical-alert company URL.\n" +
  "• For where to apply for SNAP, use that state's link from the State SNAP agencies list, or the USDA SNAP state directory.\n" +
  "• Write every link as the full URL, scheme included, exactly as listed (for example https://www.medicare.gov/health-drug-plans/part-d). Never write a bare address such as medicare.gov/health-drug-plans/part-d, and never write the link type (official, nonprofit or commercial) after a link; the type is for you only.\n" +
  "• Weave a relevant approved link into the answer when it helps. Keep the full URL visible as plain text, on its own or after the page name, never inside parentheses or followed by punctuation. Do not write \"here:\" or \"click here\"; name the page instead.\n" +
  "• Include the full explanation of the program even when you also include a link. A link does not replace the explanation.\n\n" +

  "AFFILIATE DISCLOSURE — Be honest about how this site may be paid.\n" +
  "• When an answer includes one or more commercial links from the approved list, add this sentence in that same answer: \"" +
  DISCLOSURE +
  "\"\n" +
  "• Do not describe government or nonprofit links as paid placements.\n" +
  "• Do not claim a specific partnership, commission rate, or tracking code. These commercial URLs are plain links with no affiliate ID attached.\n" +
  "• Do not tell the user that the site has no advertising, commission, or affiliate relationship.\n\n" +

  "TONE AND SAFETY — Maintain a calm, patient, senior-friendly tone in every response. " +
  "You DO NOT provide financial, legal, tax, medical, or insurance advice, and you never enroll anyone in a plan or tell them exactly what to buy. " +
  "Instead, you explain concepts, outline options, and help users prepare questions to ask licensed professionals. " +
  "If the user seems to be making a big decision, remind them to talk with licensed agents, financial advisors, attorneys, or doctors who know their specific situation. " +
  "If users ask for personalized advice, treat it as an opportunity to suggest questions and considerations, not to decide for them. " +
  "Remind users to review details carefully and confirm everything with licensed professionals and official sources.";

function canonicalApprovedUrl(rawUrl) {
  const trimmed = String(rawUrl).replace(/[),.;:!?]+$/g, "");
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  const key = linkKey(parsed.origin + parsed.pathname);
  const link = APPROVED_BY_KEY.get(key);
  return link ? link.url : null;
}

function enforceApprovedLinks(text) {
  if (typeof text !== "string" || !text) return "";
  let commercial = false;

  const rewrite = (rawUrl) => {
    const canonical = canonicalApprovedUrl(rawUrl);
    if (!canonical) return null;
    const link = APPROVED_BY_KEY.get(linkKey(canonical));
    if (link && link.kind === "commercial") commercial = true;
    return canonical;
  };

  // Drop link-type tags the model may copy from the approved list.
  let out = text.replace(/[ \t]*(?:\[|\()(?:type:\s*)?(?:official|nonprofit|commercial)(?:\]|\))/gi, "");

  // A bare approved address (medicare.gov/health-drug-plans/part-d) becomes the
  // full https URL so it is clickable. Unknown bare addresses are left as text.
  out = out.replace(/(^|[\s(])((?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:gov|org|com)\/[^\s<>"')\]]*)/gi, (match, lead, bare) => {
    const trail = (bare.match(/[.,;:!?]+$/) || [""])[0];
    const core = trail ? bare.slice(0, -trail.length) : bare;
    const canonical = canonicalApprovedUrl("https://" + core);
    return canonical ? lead + canonical + trail : match;
  });

  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (match, label, url) => {
    const canonical = rewrite(url);
    return canonical ? label + " (" + canonical + ")" : label;
  });

  const DROPPED = "\u0000";
  out = out.replace(/https?:\/\/[^\s<>"')\]]+/g, (url) => {
    const trail = (url.match(/[.,;:!?]+$/) || [""])[0];
    const core = trail ? url.slice(0, -trail.length) : url;
    const canonical = rewrite(core);
    return (canonical || DROPPED) + trail;
  });

  // When a link is removed, also remove the lead-in that pointed at it
  // ("apply here: <url>", "visit: <url>") and any empty brackets left behind.
  out = out
    .replace(/[ \t]*\(\s*\u0000\s*\)/g, DROPPED)
    .replace(/(?:[ \t]+(?:right[ \t]+)?(?:here|at|via|on|from|visit|visiting|this link|the link|link|website|site|page))?[ \t]*:?[ \t]*\u0000/gi, "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+([.,;:!?])/g, "$1")
    .replace(/\(\s*\)/g, "");

  out = out.replace(/[ \t]{2,}/g, " ").replace(/ +\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (commercial && !/commission|affiliate|sponsored|may earn/i.test(out)) {
    out = out + "\n\n" + DISCLOSURE;
  }
  return out;
}

/**
 * Accept user and assistant turns only, so follow-up questions keep their
 * context. Any system, developer, or tool message from the browser is
 * discarded so the caller cannot replace this module's system prompt.
 * Assistant turns are re-sanitized with the approved-link filter.
 */
function buildModelMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return { error: "Send a messages array of user and assistant messages." };
  }

  const turns = [];
  for (const message of rawMessages) {
    if (!message || typeof message !== "object") continue;
    if (message.role !== "user" && message.role !== "assistant") continue;
    if (typeof message.content !== "string") continue;
    const limit = message.role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    let content = message.content.trim().slice(0, limit);
    if (message.role === "assistant") content = enforceApprovedLinks(content);
    if (!content) continue;
    turns.push({ role: message.role, content });
  }

  let kept = turns.slice(-MAX_TURNS);
  // The conversation sent to the model must start and end with a user turn.
  while (kept.length && kept[0].role !== "user") kept.shift();
  while (kept.length && kept[kept.length - 1].role !== "user") kept.pop();
  if (kept.filter((m) => m.role === "user").length > MAX_USER_MESSAGES) {
    kept = kept.slice(-MAX_USER_MESSAGES * 2);
    while (kept.length && kept[0].role !== "user") kept.shift();
  }
  if (kept.length === 0) {
    return { error: "Send at least one user message." };
  }

  return {
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...kept],
  };
}

module.exports = {
  APPROVED_LINKS,
  DISCLOSURE,
  SYSTEM_PROMPT,
  buildModelMessages,
  canonicalApprovedUrl,
  enforceApprovedLinks,
};
