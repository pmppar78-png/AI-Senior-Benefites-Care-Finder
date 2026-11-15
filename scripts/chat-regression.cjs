#!/usr/bin/env node
/**
 * Live regression for the /chat assistant: the 6 audit questions plus the
 * 3-turn Medicare Savings Program / Extra Help follow-up (Phase 1 re-audit,
 * Nov 15, 2026). Calls the deployed function; prints answers and checks.
 * Usage: node scripts/chat-regression.cjs [https://seniorbenefitscarefinder.com]
 */
const BASE = process.argv[2] || 'https://seniorbenefitscarefinder.com';
const URL_RE = /https?:\/\/[^\s<>"')\]]+/g;
const TAG_RE = /\[(official|nonprofit|commercial)\]|\(type: (official|nonprofit|commercial)\)/i;
const BARE_RE = /(^|[\s(])(?:www\.)?[a-z0-9-]+\.(?:gov|org|com)\/[^\s]*/i;

const SINGLE = [
  { q: "What is the most I'll have to pay out of pocket for Part D drugs in 2026? Is there still a donut hole?",
    must: [/\$2,100/], mustNot: [/donut hole (is|still) (in effect|exists)/i] },
  { q: "I'm 68, live alone, and get $1,450 a month from Social Security. Can I get SNAP food stamps, and about how much?",
    must: [/\$1,330/, /\$4,750|asset/i] },
  { q: 'What are Medicare Savings Programs and what are the income limits in 2026?',
    must: [/\$1,350/, /\$1,616/, /\$1,816/] },
  { q: 'How do I apply for Extra Help with my prescription costs, and what are the 2026 limits?',
    must: [/\$23,940/, /automatic/i] },
  { q: 'I live in Indiana. Where do I apply for SNAP and does Indiana have an asset limit for seniors?',
    must: [/\$4,750/, /in\.gov\/fssa/] },
  { q: 'My mom in Ohio needs help paying for in-home care. What programs should we look at?',
    must: [/Medicaid/], mustNot: [/Medicaid Savings Program/i] },
];
const MULTI = [
  { q: "I'm 70, single, and my only income is $1,400 a month from Social Security. Do I qualify for a Medicare Savings Program?", must: [/SLMB|Specified Low-Income/i] },
  { q: 'Based on what you just told me, which of those programs would I fall into, and would I also get Extra Help automatically?',
    must: [/automatic/i, /SLMB|Specified Low-Income/i],
    mustNot: [/does not automatically (enroll|qualify)|need to apply separately|must apply separately|not automatically/i] },
  { q: 'And roughly how much would that save me per month on my Part B premium?', must: [/\$202\.90/] },
];

async function ask(messages) {
  const r = await fetch(BASE + '/.netlify/functions/ai-chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }),
  });
  return { status: r.status, reply: (await r.json()).reply || '' };
}
function check(t, a) {
  const fails = [];
  for (const re of t.must || []) if (!re.test(a)) fails.push('missing ' + re);
  for (const re of t.mustNot || []) if (re.test(a)) fails.push('contains ' + re);
  if (TAG_RE.test(a)) fails.push('link-type tag');
  if (BARE_RE.test(a.replace(URL_RE, ''))) fails.push('bare (non-clickable) address');
  return fails;
}
(async () => {
  let bad = 0; const out = [];
  for (const [i, t] of SINGLE.entries()) {
    const { status, reply } = await ask([{ role: 'user', content: t.q }]);
    const f = check(t, reply); if (f.length || status !== 200) bad++;
    out.push({ n: 'Q' + (i + 1), status, pass: !f.length && status === 200, fails: f, urls: reply.match(URL_RE) || [], reply });
  }
  const hist = [];
  for (const [i, t] of MULTI.entries()) {
    hist.push({ role: 'user', content: t.q });
    const { status, reply } = await ask(hist);
    hist.push({ role: 'assistant', content: reply });
    const f = check(t, reply); if (f.length || status !== 200) bad++;
    out.push({ n: 'Multi-turn ' + (i + 1), status, pass: !f.length && status === 200, fails: f, urls: reply.match(URL_RE) || [], reply });
  }
  console.log(JSON.stringify(out, null, 1));
  console.log(bad ? `FAIL: ${bad} check(s) failed` : 'PASS: all chat regression checks passed');
  process.exit(bad ? 1 : 0);
})();
