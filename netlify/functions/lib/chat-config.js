/**
 * Server-owned chat configuration for the senior benefits assistant.
 * The browser sends user messages only. This module supplies the system
 * prompt and the only URLs the assistant is allowed to output.
 */

const MAX_USER_MESSAGES = 12;
const MAX_USER_CHARS = 4000;

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
      "- " + link.name + " (" + link.url + ") [" + link.kind + "]. " + link.note
    );
  }
  return lines.join("\n");
}

const SYSTEM_PROMPT =
  "You are a comprehensive senior benefits expert and calm, senior-friendly AI guide. You help people understand ALL aspects of senior benefits, care options, and related programs. " +
  "You speak in clear, plain language at a gentle pace and provide thorough, knowledgeable answers.\n\n" +

  "EXPERT KNOWLEDGE BASE — You are deeply knowledgeable about:\n" +
  "• Medicare: Parts A (hospital), B (medical), C (Medicare Advantage), D (prescription drugs), and Medigap/Medicare Supplement plans. You understand the differences between plans, enrollment periods (Initial Enrollment Period, Annual Enrollment Period Oct 15–Dec 7, Open Enrollment Period Jan 1–Mar 31, Special Enrollment Periods), costs including premiums, deductibles, copays and coinsurance, coverage gaps, the Part D donut hole, and late enrollment penalties.\n" +
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
  "• Weave a relevant approved link into the answer when it helps. Keep the full URL visible as plain text.\n" +
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

  let out = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (match, label, url) => {
    const canonical = rewrite(url);
    return canonical ? label + " (" + canonical + ")" : label;
  });

  out = out.replace(/https?:\/\/[^\s<>"')\]]+/g, (url) => {
    const canonical = rewrite(url);
    if (canonical) return canonical;
    return "";
  });

  out = out.replace(/[ \t]{2,}/g, " ").replace(/ +\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (commercial && !/commission|affiliate|sponsored|may earn/i.test(out)) {
    out = out + "\n\n" + DISCLOSURE;
  }
  return out;
}

/**
 * Accept only user-role messages. Any system, developer, tool, or assistant
 * message from the browser is discarded so the caller cannot replace this
 * module's system prompt.
 */
function buildModelMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return { error: "Send a messages array containing only user messages." };
  }

  const users = [];
  for (const message of rawMessages) {
    if (!message || typeof message !== "object") continue;
    if (message.role !== "user") continue;
    if (typeof message.content !== "string") continue;
    const content = message.content.trim().slice(0, MAX_USER_CHARS);
    if (!content) continue;
    users.push({ role: "user", content });
  }

  const turns = users.slice(-MAX_USER_MESSAGES);
  if (turns.length === 0) {
    return { error: "Send at least one user message." };
  }

  return {
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...turns],
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
