#!/usr/bin/env node
// Single source of truth check: life-factors.html's <select> option values
// must match every place life-calculator.js compares against them - switch
// statements AND bare `factors.x === 'value'` checks (the recommendations
// engine uses the latter almost exclusively, and it's the same bug class).
//
// This is a formalized version of the ad-hoc diff script that found the
// C1/C2 bugs in the pre-2.5.0 audit (~8 form fields silently doing nothing
// because their HTML values didn't match any calculator case). Building
// this script found three more of the same bug still live in the
// recommendations engine - dailySteps and fruitsVegetables checks that had
// been fixed in their switch statements but not in the parallel direct
// comparisons a few hundred lines away.
//
// Usage: node check-factor-values.js  (exit 0 = clean, exit 1 = real drift)
//   DEAD OPTION / UNREACHABLE CASE are blocking - a wired-up field whose
//   values don't match is a silent user-facing bug, the exact C1/C2 class.
//   ORPHANED is a warning, not blocking - it means the calculator has scoring
//   logic for a factor no form field supplies at all, which is a product
//   scope question (ship the field or delete the logic), not drift.

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, 'life-factors.html');
const CALC_PATH = path.join(__dirname, 'life-calculator.js');
const JS_PATH = path.join(__dirname, 'life-factors.js');

const html = fs.readFileSync(HTML_PATH, 'utf8');
const calc = fs.readFileSync(CALC_PATH, 'utf8');
const js = fs.readFileSync(JS_PATH, 'utf8');

// --- Step 1: derive the HTML-id -> factor-key mapping from life-factors.js.
// This is itself a single source of truth: the getValue('factor-x') calls
// that build the object passed to the calculator.
const keyToHtmlId = {};
const mappingRe = /(\w+):\s*(?:parseFloat\()?getValue\('(factor-[\w-]+)'\)/g;
let m;
while ((m = mappingRe.exec(js))) {
  keyToHtmlId[m[1]] = m[2];
}

// --- Step 2: extract every <select id="factor-..."> block's option values.
const selectRe = /<select id="(factor-[\w-]+)"[^>]*>([\s\S]*?)<\/select>/g;
const htmlValuesById = {};
while ((m = selectRe.exec(html))) {
  const id = m[1];
  const body = m[2];
  const values = [...body.matchAll(/<option value="([^"]*)"/g)]
    .map(o => o[1])
    .filter(v => v !== ''); // skip placeholder "Choose..." options
  htmlValuesById[id] = values;
}

// --- Step 3: collect every value life-calculator.js checks each factor
// against, from two sources: switch/case blocks, and bare
// `factors.key === 'value'` comparisons (the recommendations engine's style).
const jsValuesByKey = {}; // key -> Set<value>

function addValue(key, value) {
  if (!jsValuesByKey[key]) jsValuesByKey[key] = new Set();
  jsValuesByKey[key].add(value);
}

const switchRe = /switch\s*\(\s*(\w+)\s*\)\s*\{([\s\S]*?)\n\s{0,4}\}/g;
while ((m = switchRe.exec(calc))) {
  const key = m[1];
  const body = m[2];
  for (const c of body.matchAll(/case\s+'([^']*)'/g)) {
    addValue(key, c[1]);
  }
}

const directCompareRe = /factors\.(\w+)\s*===\s*'([^']*)'/g;
while ((m = directCompareRe.exec(calc))) {
  addValue(m[1], m[2]);
}

// --- Cross-check ---
const errors = [];
const warnings = [];

for (const key of Object.keys(jsValuesByKey)) {
  const htmlId = keyToHtmlId[key];
  const jsValues = [...jsValuesByKey[key]];

  if (!htmlId) {
    warnings.push(`ORPHANED: life-calculator.js checks "${key}" against ${jsValues.length} value(s), but no form field in life-factors.js ever supplies it - this logic never runs. Either wire up a field for it or delete the dead logic.`);
    continue;
  }

  const htmlValues = htmlValuesById[htmlId] || [];
  const missingFromJs = htmlValues.filter(v => !jsValues.includes(v));
  const missingFromHtml = jsValues.filter(v => !htmlValues.includes(v));

  if (missingFromJs.length) {
    errors.push(`DEAD OPTION: #${htmlId} offers ${missingFromJs.map(v => `"${v}"`).join(', ')} but life-calculator.js never checks "${key}" against ${missingFromJs.length === 1 ? 'that value' : 'those values'} - selecting ${missingFromJs.length === 1 ? 'it' : 'them'} does nothing.`);
  }
  if (missingFromHtml.length) {
    errors.push(`UNREACHABLE VALUE: life-calculator.js checks "${key}" against ${missingFromHtml.map(v => `"${v}"`).join(', ')} but #${htmlId} never offers ${missingFromHtml.length === 1 ? 'that value' : 'those values'} - dead code, can never trigger.`);
  }
}

for (const e of errors) console.error(e);
if (warnings.length) {
  console.error(`\n${warnings.length} non-blocking warning(s):`);
  for (const w of warnings) console.error(w);
}

if (errors.length === 0) {
  console.log(`\nOK: ${Object.keys(jsValuesByKey).length} factor(s) checked, no value mismatches between life-factors.html and life-calculator.js.`);
  process.exit(0);
} else {
  console.error(`\n${errors.length} blocking issue(s) found between life-factors.html and life-calculator.js.`);
  process.exit(1);
}
