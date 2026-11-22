// node --test tools/tests/
// The "Shared most" line on bridge-preparedness-reports.html#evals must follow
// from the page's own matrix as lab/eval-overlap.js reads it.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../../lab/eval-overlap.js');

const html = fs.readFileSync(path.join(__dirname, '../../bridge-preparedness-reports.html'), 'utf8');
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function matrix() {
  const tbl = html.match(/<table class="kv evals">([\s\S]*?)<\/table>/)[1];
  const rows = [];
  let group = '';
  for (const tr of tbl.match(/<tr[^>]*>[\s\S]*?<\/tr>/g)) {
    const tds = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1]));
    if (!tds.length) continue;
    if (/class="grp"/.test(tr)) { group = tds[0]; continue; }
    rows.push({ name: tds[0], group, cells: tds.slice(2) });
  }
  return E.build(rows);
}
const count = (M, name) => E.resultLabs(M.find((r) => r.name === name)).length;

test('five lab columns per row', () => {
  for (const r of matrix()) assert.strictEqual(r.marks.length, 5, r.name);
});

test('reproduces the "Shared most" line', () => {
  const M = matrix();
  assert.ok(/ExploitBench and CyScenarioBench \(results from four labs each/.test(html));
  assert.strictEqual(count(M, 'ExploitBench'), 4);
  assert.strictEqual(count(M, 'CyScenarioBench'), 4);
  assert.strictEqual(count(M, 'VCT'), 4);
  assert.strictEqual(count(M, 'ExploitGym'), 3);
  const top = E.sharedMost(M);
  assert.strictEqual(top.n, 4);
  assert.deepStrictEqual(top.rows.map((r) => r.name).sort(), ['CyScenarioBench', 'ExploitBench', 'VCT']);
  // "everyone but xAI" / "everyone but DeepMind"
  assert.deepStrictEqual(E.resultLabs(M.find((r) => r.name === 'ExploitBench')), [0, 1, 2, 3]);
  assert.deepStrictEqual(E.resultLabs(M.find((r) => r.name === 'VCT')), [0, 1, 2, 4]);
});

test("xAI's cyber tests overlap the others only on CyberGym, shared with Meta", () => {
  const M = matrix().filter((r) => r.group === 'Cyber' && r.marks[4].k === 'result');
  assert.deepStrictEqual(M.map((r) => r.name), ['CyberGym']);
  assert.deepStrictEqual(E.resultLabs(M[0]), [0, 4]);
});

test('marks: result, other use, not cited', () => {
  assert.deepStrictEqual(E.mark('● C'), { k: 'result', note: 'C' });
  assert.deepStrictEqual(E.mark('○ honeypot'), { k: 'other', note: 'honeypot' });
  assert.strictEqual(E.mark('–').k, 'none');
});
