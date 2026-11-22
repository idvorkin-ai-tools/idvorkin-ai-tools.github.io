// node --test tools/tests/
// Every threshold the widget offers must be printed on the page, and each
// rule must flip exactly at its bar.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../../lab/threshold-reader.js');

const html = fs.readFileSync(path.join(__dirname, '../../bridge-preparedness-reports.html'), 'utf8')
  .replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('every printed threshold is on the page', () => {
  for (const e of R.ENTRIES) assert.ok(html.includes(e.src), e.src);
});

test('bars match the printed numbers', () => {
  const bar = (src) => R.ENTRIES.find((e) => e.src === src).bar;
  assert.strictEqual(bar('at least 80% refusal on BioTIER'), 80);
  assert.strictEqual(bar('at least 40% on MASK'), 40);
  assert.strictEqual(bar('at most 50% on Agentic Misalignment'), 50);
  assert.strictEqual(bar('83% on GPQA Diamond'), 83);
  assert.strictEqual(bar('90% on PostTrainBench Lite'), 90);
  assert.strictEqual(bar('doubling the rate of AI progress'), 2);
  assert.strictEqual(bar('replacing all research staff within 5× the cost'), 5);
  assert.strictEqual(bar('under 1 in 20 answers on restricted bio queries'), 5);
  assert.strictEqual(bar('under 1 in 2 dishonest on MASK'), 50);
});

test('rules flip at the bar', () => {
  assert.ok(R.met('ge', 80, 80) && !R.met('ge', 79, 80));
  assert.ok(R.met('le', 5, 5) && !R.met('le', 5.5, 5));
  assert.ok(R.met('lt', 4, 5) && !R.met('lt', 5, 5));
  assert.ok(R.met('ge', 2.0000000001, 2) && R.met('ge', 0.1 * 20, 2));
});

test('each entry starts inside its slider and DeepMind has none', () => {
  for (const e of R.ENTRIES) {
    assert.ok(e.min <= e.bar && e.bar <= e.max, e.src);
    assert.ok(e.min <= e.value && e.value <= e.max, e.src);
    assert.ok(R.NOTES[e.lab], e.lab);
  }
  assert.strictEqual(R.forLab('Google DeepMind').length, 0);
  for (const l of R.LABS) assert.ok(R.NOTES[l], l);
});
