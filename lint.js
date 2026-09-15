#!/usr/bin/env node
/* ============================================================
   Copy linter. Walks every user-facing string in screens.js and
   fails on the constructions we've banned. Run: node lint.js
   ------------------------------------------------------------
   These rules came out of review, one at a time, each after a
   single flagged line turned out to be a house-style tic
   repeated eight or nine times. Checking by memory does not
   work, so this checks instead.
   ============================================================ */
const fs = require("fs"), path = require("path");
const Module = require("module");
const src = fs.readFileSync(path.join(__dirname, "screens.js"), "utf8") + "\nmodule.exports={SCREENS};";
const m = new Module(); m._compile(src, "screens.js");
const SCREENS = m.exports.SCREENS;

/* deliberate exceptions, each with a reason */
const ALLOW = [
  [/testimonial/, "quoted speech from a person"],
  [/subcta/,      "question plus link, not a sentence pair"],
  [/paywall\.h1/, "FilmTailor's own pricing line, quoted verbatim"]
];
const allowed = p => ALLOW.some(([re]) => re.test(p));

const SKIP_KEYS = ["id","kind","key","varKey","stackKey","v","art","skip","optsFrom","style","name","kw"];
const strings = [];
function walk(o, p){
  if (o == null) return;
  if (typeof o === "string") return strings.push([p, o]);
  if (Array.isArray(o)) return o.forEach((v,i) => walk(v, p+"["+i+"]"));
  if (typeof o === "object") for (const k in o) {
    if (SKIP_KEYS.includes(k)) continue;
    walk(o[k], p+"."+k);
  }
}
/* paths are keyed by screen id so a failure names the screen */
SCREENS.forEach(s => walk(s, s.id));

const RULES = [
  ["em dash", /—/,
    "Rewrite the sentence. No em dashes anywhere."],
  ["the word 'land'", /\bland(s|ed|ing)?\b/i,
    "Banned outright. Use 'no ending', 'fell flat', 'finish'."],
  ["magic adverb", /\b(actually|genuinely|quietly|truly|deeply|simply)\b/i,
    "Delete it. It never adds information."],
  ["vague verb", /\b(travels?|unlocks?|transforms?|elevates?|resonates?|taps into|speaks to|fuels?|sharpens?|shows? up|draw on|the output)\b/i,
    "Say the work it describes instead."],
  ["personified abstraction", /\b(day one|week one|week two|the plan|your plan|the vault|interviews|rooms?|the story|stories|confidence|timing|the deck|your deck|a deck|decks|the script|a treatment|an idea deck|credits|meetings)\b\s+(asks?|teaches?|rewards?|turns? up|knows?|decides?|wants?|follows?|drifts?|warms?|gives?|gave|tells?|told|pulls?|does|sells?|proves?|carr(y|ies)|comes? from)\b/i,
    "Decks, rooms and days don't do things. Say 'I'll' or 'you'll'."],
  ["passive or agentless", /\b(sits|gets? (written|cut|rehearsed|tested|drilled|read|opened)|are (locked|made|framed)|is (rehearsed|written|made))\b/i,
    "Name who does it."],
  ["antithesis", /\bit'?s not [^,.]{2,40}[,.] ?it'?s\b|\bisn'?t [^,.]{2,40}[,.] ?it'?s\b|\bnot [^,.]{2,40}, but\b/i,
    "False profundity through contrast. State the thing."],
  ["stakes inflation", /\b(the single biggest|the rarest|the highest score|the most persuasive)\b/i,
    "Superlatives as emphasis. Cut."]
];

let fails = 0;
for (const [name, re, hint] of RULES) {
  const hits = strings.filter(([p,t]) => re.test(t) && !allowed(p));
  if (!hits.length) continue;
  fails += hits.length;
  console.log("\n✗ " + name.toUpperCase() + "  (" + hint + ")");
  hits.forEach(([p,t]) => console.log("   " + p + "\n     " + t));
}

/* the one-two punch: a sentence followed by one that only justifies it */
const sentences = t => t.split(/(?<=[.!?])\s+/).filter(x => x.trim().length > 2);
const punch = strings.filter(([p,t]) => !allowed(p) && sentences(t).length > 1);
if (punch.length) {
  fails += punch.length;
  console.log("\n✗ ONE-TWO PUNCH  (one sentence per string; the second is never needed)");
  punch.forEach(([p,t]) => console.log("   " + p + "\n     " + t));
}

console.log(fails
  ? "\n" + fails + " problem" + (fails>1?"s":"") + " in " + strings.length + " strings\n"
  : "\n✓ clean across " + strings.length + " strings\n");
process.exit(fails ? 1 : 0);
