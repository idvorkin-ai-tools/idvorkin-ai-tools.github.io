/*
  eval-overlap: pure helpers for the "evals they cite" matrix on
  bridge-preparedness-reports.html#evals. The widget reads the page's own
  table, so this file holds no data, only the reading rules:
  a cell starting with ● is a reported result, ○ is a mention used another
  way (the note says how), anything else is not cited.
  Tested by tools/tests/eval-overlap.test.js against the page.
*/
(function (root) {
  var LABS = ['Meta', 'OpenAI', 'Anthropic', 'Google DeepMind', 'xAI'];

  function mark(cell) {
    var s = String(cell).replace(/\s+/g, ' ').trim();
    var c = s.charAt(0);
    if (c === '●') return { k: 'result', note: s.slice(1).trim() };
    if (c === '○') return { k: 'other', note: s.slice(1).trim() };
    return { k: 'none', note: '' };
  }

  // rows: [{ name, group, cells: [five cell texts in LABS order] }]
  function build(rows) {
    return rows.map(function (r) {
      return { name: r.name, group: r.group, marks: r.cells.map(mark) };
    });
  }

  function resultLabs(row) {
    var out = [];
    row.marks.forEach(function (m, i) { if (m.k === 'result') out.push(i); });
    return out;
  }

  // What one lab cites: evals with a result (most widely reported first),
  // then evals it names but uses another way.
  function byLab(matrix, li) {
    var results = [], other = [];
    matrix.forEach(function (row) {
      var m = row.marks[li];
      if (m.k === 'result') results.push({ row: row, labs: resultLabs(row) });
      else if (m.k === 'other') other.push({ row: row, note: m.note });
    });
    results.sort(function (a, b) { return b.labs.length - a.labs.length; });
    return { results: results, other: other };
  }

  // The evals with results from the most labs.
  function sharedMost(matrix) {
    var best = 0, rows = [];
    matrix.forEach(function (row) {
      var n = resultLabs(row).length;
      if (n > best) { best = n; rows = [row]; } else if (n === best) rows.push(row);
    });
    return { n: best, rows: rows };
  }

  var api = { LABS: LABS, mark: mark, build: build, resultLabs: resultLabs, byLab: byLab, sharedMost: sharedMost };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EvalOverlap = api;
})(this);
