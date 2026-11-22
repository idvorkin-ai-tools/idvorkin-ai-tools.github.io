/*
  widgets.js — shared helpers for small interactive widgets on the explainer maps.

  Load it once, then one file per widget, all deferred, in this order:
    <script src="https://idvorkin-ai-tools.github.io/assets/widgets.js" defer></script>
    <script src="https://idvorkin-ai-tools.github.io/assets/widgets/<name>.js" defer></script>
  and mark where it goes: <div data-widget="<name>"></div> (or the LLM Judges
  form, <div class="lab" data-lab="<name>"></div>).

  A widget file calls AIToolsWidgets.register('<name>', function (el) {...});
  the function builds into every matching element. Maths belongs in its own
  tested file; widgets only draw. See docs/SHARED-TERMS.md.
  Ported from the LLM Judges map's widgets.js, minus its metaphor words.
  CSS is injected first in <head> at zero specificity, so page CSS wins.
*/
(function () {
  if (window.AIToolsWidgets) return;
  var MONO = "'IBM Plex Mono',ui-monospace,monospace";
  var ACC = 'var(--def,#2b8fc9)';
  var LINE = 'var(--line,rgba(128,128,128,.35))';
  var CSS = [
    ':where(.lab-try){clear:both;font-family:' + MONO + ';font-size:12.5px;color:' + ACC + ';margin:22px 0 6px;max-width:none}',
    ':where(.lab-try b){color:var(--ink,inherit);font-weight:600;letter-spacing:.08em;text-transform:uppercase;font-size:10.5px;margin-right:6px}',
    ':where(.lab){clear:both;border:1px solid ' + LINE + ';border-left:3px solid ' + ACC + ';border-radius:0 12px 12px 0;background:var(--panel,rgba(128,128,128,.06));padding:14px 16px 10px;margin:0 0 24px;scroll-margin-top:72px}',
    ':where(.lab svg){display:block;width:100%;height:auto;margin:6px 0}',
    ':where(.lab-pre){display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}',
    ':where(.lab-pre button,.lab-go){font-family:' + MONO + ';font-size:12px;color:var(--ink-mid,inherit);background:var(--panel-2,rgba(128,128,128,.1));border:1px solid ' + LINE + ';border-radius:6px;padding:6px 10px;cursor:pointer;min-height:32px;display:inline-flex;align-items:center;gap:6px}',
    ':where(.lab-pre button:hover,.lab-go:hover){border-color:' + ACC + ';color:var(--ink,inherit)}',
    ':where(.lab-ctl){display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:4px 18px;margin:8px 0}',
    ':where(.lab-sl){display:grid;grid-template-columns:minmax(0,1fr) 64px;gap:0 10px;align-items:center;padding:4px 0}',
    ':where(.lab-sl label){grid-column:1/-1;font-size:13px;color:var(--ink-mid,inherit);line-height:1.35}',
    ':where(.lab-sl input[type=range]){width:100%;accent-color:' + ACC + ';min-height:28px;margin:0}',
    ':where(.lab-sl output){font-family:' + MONO + ';font-size:13px;color:var(--ink,inherit);text-align:right;white-space:nowrap}',
    ':where(.lab .statgrid){display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:8px 0}',
    ':where(.lab .statgrid .s){border:1px solid var(--line-soft,rgba(128,128,128,.25));border-radius:8px;padding:8px 10px;background:var(--panel-2,rgba(128,128,128,.08))}',
    ':where(.lab .statgrid .s .k){font-family:' + MONO + ';font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-dim,inherit)}',
    ':where(.lab .statgrid .s .v){font-size:18px;font-weight:600;margin-top:3px;font-family:' + MONO + ';color:var(--ink,inherit)}',
    ':where(.lab .statgrid .s .n){font-size:12px;color:var(--ink-dim,inherit);margin-top:2px}',
    ':where(.lab-sum){font-size:13px;color:var(--ink-dim,inherit);margin:6px 0 4px;max-width:none}',
    ':where(.lab-cmt){width:100%;border-collapse:collapse;font-size:12.5px;table-layout:fixed}',
    ':where(.lab-cmt th){font-family:' + MONO + ';font-weight:500;font-size:11px;color:var(--ink-dim,inherit);text-align:center;padding:4px;line-height:1.3}',
    ':where(.lab-cmt tr th:first-child){text-align:right;width:34%}',
    ':where(.lab-cmt th i){display:block;font-style:normal}',
    ':where(.lab-cmt td){text-align:center;font-family:' + MONO + ';font-size:20px;font-weight:600;padding:8px 4px;border:1px solid ' + LINE + '}',
    ':where(.lab-cmt td small){display:block;font-size:10px;font-weight:400;color:var(--ink-dim,inherit)}',
    ':where(.lab-cmt td.ok){color:#2fa760;background:rgba(91,214,138,.1)} :where(.lab-cmt td.crit){color:var(--crit,#d93a3f);background:rgba(229,72,77,.08)}'
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'aitools-widgets-css';
  st.textContent = CSS;
  var head = document.head || document.documentElement;
  head.insertBefore(st, head.firstChild);

  function t(x, y, s, cls, extra) {
    return '<text x="' + x + '" y="' + y + '" class="' + (cls || 't-mid') + '" ' + (extra || '') + '>' + s + '</text>';
  }
  // Number formats. Undefined values (0/0) print as a dash or "undefined", never NaN.
  // f3: 3 decimals, trailing zeros trimmed to at least 2 (0.80, 0.467, 0.15).
  function f3(x) {
    if (x === null || !isFinite(x)) return '&mdash;';
    return x.toFixed(3).replace(/0$/, '').replace(/^-0\.00$/, '0.00');
  }
  function f2(x) { return x === null || !isFinite(x) ? 'undefined' : x.toFixed(2).replace(/^-0\.00$/, '0.00'); }
  function cnt(x) { var r = Math.round(x * 10) / 10; return (r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)); }
  function pct(x) { return x === null || !isFinite(x) ? '&mdash;' : (Math.round(x * 1000) / 10) + '%'; }
  // A labelled range input with an <output id="<id>-o">.
  function slider(id, label, min, max, step, val) {
    return '<div class="lab-sl"><label for="' + id + '">' + label + '</label>' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">' +
      '<output for="' + id + '" id="' + id + '-o"></output></div>';
  }
  // One stat tile; put several inside <div class="statgrid">.
  function stat(k, id, note) {
    return '<div class="s"><div class="k">' + k + '</div><div class="v" id="' + id + '"></div>' + (note ? '<div class="n" id="' + id + '-n"></div>' : '') + '</div>';
  }
  function presets(list) {
    return '<div class="lab-pre" role="group" aria-label="Presets">' + list.map(function (p) {
      return '<button type="button" data-p="' + p[0] + '">' + p[1] + '</button>';
    }).join('') + '</div>';
  }
  // The one-sentence summary screen readers hear after each change.
  function sum(id) { return '<p class="lab-sum" id="' + id + '" aria-live="polite"></p>'; }
  function $(root, id) { return root.querySelector('#' + id); }
  // A 2x2 count table. o = { cols: [h1, h2], rows: [{ head, sub }, { head, sub }],
  //   cells: [[{ v, ok, note }, …], […]] }  (ok: true = agreement cell, false = error cell)
  function table2x2(o) {
    var h = '<table class="lab-cmt"><tr><th></th><th>' + o.cols[0] + '</th><th>' + o.cols[1] + '</th></tr>';
    for (var r = 0; r < 2; r++) {
      var row = o.rows[r];
      h += '<tr><th>' + row.head + (row.sub !== undefined ? ' <i>' + row.sub + '</i>' : '') + '</th>';
      for (var c = 0; c < 2; c++) {
        var x = o.cells[r][c];
        h += '<td class="' + (x.ok ? 'ok' : 'crit') + '">' + x.v + (x.note ? '<small>' + x.note + '</small>' : '') + '</td>';
      }
      h += '</tr>';
    }
    return h + '</table>';
  }
  var uidN = 0;
  function uid() { return ++uidN; }
  var makers = {};
  function register(name, fn) { makers[name] = fn; if (document.readyState === 'complete') initAll(); }
  function nameOf(el) { return el.getAttribute('data-widget') || el.getAttribute('data-lab'); }
  function initAll() {
    document.querySelectorAll('[data-widget],.lab[data-lab]').forEach(function (el) {
      var mk = makers[nameOf(el)];
      if (!mk || el.getAttribute('data-ready')) return;
      el.classList.add('lab');
      try { mk(el); el.setAttribute('data-ready', '1'); }
      catch (e) { el.textContent = 'This widget failed to load.'; if (window.console) console.error(e); }
    });
    // <button class="lab-go" data-lab-go="<name>" data-p="<preset>"> elsewhere on the page:
    // sets a preset (if the widget sets el.labPreset) and scrolls to the widget.
    document.querySelectorAll('[data-lab-go]').forEach(function (bt) {
      if (bt.getAttribute('data-ready')) return;
      bt.setAttribute('data-ready', '1');
      bt.addEventListener('click', function () {
        var n = bt.getAttribute('data-lab-go');
        var el = document.querySelector('[data-widget="' + n + '"],.lab[data-lab="' + n + '"]');
        if (!el) return;
        if (el.labPreset) el.labPreset(bt.getAttribute('data-p'));
        el.scrollIntoView({ block: 'start' });
        var f = el.querySelector('input,button'); if (f) f.focus({ preventScroll: true });
      });
    });
  }
  // Deferred scripts run in order before DOMContentLoaded, so every
  // widgets/<name>.js has registered by then; load is a backstop (idempotent).
  if (document.readyState === 'complete') setTimeout(initAll, 0);
  else { document.addEventListener('DOMContentLoaded', initAll); window.addEventListener('load', initAll); }
  window.AIToolsWidgets = {
    t: t, f2: f2, f3: f3, cnt: cnt, pct: pct, slider: slider, stat: stat, presets: presets, sum: sum,
    table2x2: table2x2, $: $, uid: uid, register: register, init: initAll
  };
})();
