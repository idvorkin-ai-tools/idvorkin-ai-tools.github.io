/*
  eval-overlap widget for bridge-preparedness-reports.html#evals: pick a lab
  to see which named evals its latest report gives results for and who else
  reports each; pick an eval to see which labs use it. It reads the page's
  table.evals, so it can never disagree with it. Rules: lab/eval-overlap.js.
*/
(function () {
  var H = window.AIToolsWidgets, E = window.EvalOverlap;
  if (!H || !E) return;
  var SYM = { result: '●', other: '○', none: '–' };

  function readTable(tbl) {
    var rows = [], group = '';
    tbl.querySelectorAll('tr').forEach(function (tr) {
      var td = tr.querySelectorAll('td');
      if (!td.length) return;
      if (tr.classList.contains('grp')) { group = td[0].textContent.trim(); return; }
      var cells = [];
      for (var i = 2; i < td.length; i++) cells.push(td[i].textContent);
      rows.push({ name: td[0].textContent.trim(), group: group, cells: cells });
    });
    return E.build(rows);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function strip(row) {
    return '<span class="eo-strip" aria-hidden="true">' + row.marks.map(function (m, i) {
      return '<span class="eo-' + m.k + '" title="' + E.LABS[i] + '">' + SYM[m.k] + '</span>';
    }).join('') + '</span>';
  }
  function names(idx) { return idx.map(function (i) { return E.LABS[i]; }).join(', '); }

  H.register('eval-overlap', function (el) {
    var tbl = document.querySelector('table.evals');
    if (!tbl) { el.textContent = 'The evals table is missing.'; return; }
    var M = readTable(tbl), p = 'eo' + H.uid();
    var opts = '<option value="">Choose an eval</option>', g = null;
    M.forEach(function (r, i) {
      if (r.group !== g) { if (g !== null) opts += '</optgroup>'; g = r.group; opts += '<optgroup label="' + esc(g) + '">'; }
      opts += '<option value="' + i + '">' + esc(r.name) + '</option>';
    });
    opts += '</optgroup>';
    el.innerHTML =
      '<div class="lab-pre" role="group" aria-label="Pick a lab">' + E.LABS.map(function (n, i) {
        return '<button type="button" aria-pressed="false" data-pick="' + i + '">' + n + '</button>';
      }).join('') + '</div>' +
      '<div class="lab-sl eo-pick"><label for="' + p + '-ev">or pick an eval</label><select id="' + p + '-ev">' + opts + '</select></div>' +
      '<p class="eo-key" aria-hidden="true">Each strip reads ' + E.LABS.join(' · ') + ': ' + SYM.result + ' result, ' + SYM.other + ' used another way, ' + SYM.none + ' not cited.</p>' +
      '<div class="eo-out" id="' + p + '-out"></div>' + H.sum(p + '-sum');
    var sel = H.$(el, p + '-ev'), out = H.$(el, p + '-out'), sum = H.$(el, p + '-sum');
    var btns = el.querySelectorAll('button[data-pick]');

    function showLab(li) {
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-pick') === li)); });
      sel.value = '';
      var r = E.byLab(M, li), lab = E.LABS[li];
      var h = '<ul class="eo-list">' + r.results.map(function (x) {
        var others = x.labs.filter(function (i) { return i !== li; });
        return '<li>' + strip(x.row) + '<span><b>' + esc(x.row.name) + '</b> <span class="eo-dim">' +
          (others.length ? 'also ' + names(others) : 'only ' + lab) + '</span></span></li>';
      }).join('') + '</ul>';
      if (r.other.length) h += '<p class="eo-note">Named but used another way: ' + r.other.map(function (x) {
        return esc(x.row.name) + ' (' + esc(x.note) + ')';
      }).join('; ') + '.</p>';
      out.innerHTML = h;
      var solo = r.results.filter(function (x) { return x.labs.length === 1; }).length;
      sum.textContent = lab + ' reports results on ' + r.results.length + ' of the ' + M.length + ' named evals; ' +
        (solo ? solo + ' of them only ' + lab + ' reports.' : 'another lab reports every one of them.');
    }
    function showEval(i) {
      btns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      sel.value = String(i);
      var row = M[i], labs = E.resultLabs(row);
      out.innerHTML = '<ul class="eo-list">' + row.marks.map(function (m, li) {
        var what = m.k === 'result' ? 'result' + (m.note ? ' (' + esc(m.note) + ')' : '') : m.k === 'other' ? 'used another way: ' + esc(m.note) : 'not cited';
        return '<li><span class="eo-strip" aria-hidden="true"><span class="eo-' + m.k + '">' + SYM[m.k] + '</span></span><span><b>' + E.LABS[li] + '</b> <span class="eo-dim">' + what + '</span></span></li>';
      }).join('') + '</ul>';
      sum.textContent = row.name + ': results from ' + labs.length + ' of 5 labs' + (labs.length ? ' (' + names(labs) + ')' : '') + '.';
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { showLab(+b.getAttribute('data-pick')); }); });
    sel.addEventListener('change', function () { if (sel.value !== '') showEval(+sel.value); });
    showEval(M.indexOf(E.sharedMost(M).rows[0]));
  });
})();
