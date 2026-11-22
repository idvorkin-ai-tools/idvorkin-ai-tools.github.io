/*
  terms.js — explanation modes and term boxes for the explainer maps.

  One copy, hosted here, loaded by any map page with
    <script src="https://idvorkin-ai-tools.github.io/assets/terms.js" defer></script>
  How to adopt it: docs/SHARED-TERMS.md. Ported from the LLM Judges map
  (glossary.js and the mode control in its site.js).

  - Term boxes: <span class="term" data-term="ID">text</span> at a term's first
    use. The entry is assets/glossary/ID.json, found relative to this script's
    src. Wide screens: a box in the right margin. Narrow: a "?" chip opens it.
  - Mode: Plain / Technical / ELI5, one at a time, on <html> as data-tech="on"
    or data-eli5="on" (Plain sets neither). Stored under localStorage
    "aitools-mode"; every map shares one origin, so one choice follows the
    reader everywhere. Old "llm-judges-mode" is read as a fallback, never written.
  - Blocks: .plain-only .tech-only .eli5-only .no-tech show in one mode only.
  - <div data-terms-list></div>: this page's terms; ="all": the whole glossary.
  The control shows only on pages with a term, a mode block or a list.
  CSS is injected first in <head> at zero specificity, so page CSS wins.
*/
(function () {
  if (window.AIToolsTerms) return;
  var me = document.currentScript;
  var base = new URL('glossary/', me ? me.src : location.href).href;
  var root = document.documentElement;
  var KEY = 'aitools-mode', OLD = 'llm-judges-mode';
  var MODES = [['plain', 'Plain', 'Everyday words'], ['tech', 'Technical', 'Precise definitions and formulas'], ['eli5', 'ELI5', 'Explained as if to a five-year-old']];
  var SHORT = { plain: 'Plain', tech: 'Tech', eli5: 'ELI5' };
  var MODE_NAME = { plain: ['Plain', 'everyday words'], tech: ['Technical', 'precise definitions and formulas'], eli5: ['ELI5', 'explained as if to a five-year-old'] };
  var BLOCKS = '.plain-only,.tech-only,.eli5-only,.no-tech,[data-terms-list]';
  var RAIL_MIN = 170; // px of right margin needed before boxes move into the rail

  var MONO = "'IBM Plex Mono',ui-monospace,monospace";
  var ACC = 'var(--def,#2b8fc9)';
  var CSS = [
    // mode blocks: hide-only, so a block keeps the page's own display
    'html:is([data-tech="on"],[data-eli5="on"]) .plain-only{display:none!important}',
    'html:not([data-tech="on"]) .tech-only{display:none!important}',
    'html:not([data-eli5="on"]) .eli5-only{display:none!important}',
    'html[data-tech="on"] .no-tech{display:none!important}',
    ':where(.term.gl-ready){border-bottom:1px dotted ' + ACC + ';color:inherit}',
    ':where(.gl-chip){display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin:0 2px 0 3px;padding:0;' +
      'border:1px solid color-mix(in srgb,' + ACC + ' 50%,transparent);border-radius:50%;background:color-mix(in srgb,' + ACC + ' 8%,transparent);color:' + ACC + ';' +
      'font:600 11px/1 ' + MONO + ';vertical-align:2px;cursor:pointer}',
    ':where(.gl-chip:hover,.gl-chip[aria-expanded=true]){background:' + ACC + ';color:var(--bg,#fff)}',
    ':where(.gl-box){display:none;margin:8px 0 10px;padding:9px 12px;border:1px solid var(--line,rgba(128,128,128,.35));border-left:3px solid ' + ACC + ';' +
      'border-radius:0 8px 8px 0;background:var(--panel,rgba(128,128,128,.08));font-size:13.5px;line-height:1.5;color:var(--ink-mid,inherit);font-style:normal;font-weight:400;text-align:left;text-indent:0}',
    ':where(.gl-box.gl-open){display:block}',
    ':where(.gl-box>span){display:block}',
    ':where(.gl-box .gl-t,.gl-list dt){font-family:' + MONO + ';font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:' + ACC + ';margin-bottom:3px}',
    ':where(.gl-box .gl-ex){margin-top:4px;font-size:12.5px}',
    ':where(.gl-reg){display:inline-block;font-family:' + MONO + ';font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;' +
      'color:var(--bg,#fff);background:var(--off,#c77d00);border-radius:3px;padding:0 4px;margin-right:6px;vertical-align:1px}',
    ':where(.gl-f){display:block;margin-top:5px;font-family:' + MONO + ';font-size:12px;color:var(--ink,inherit);' +
      'background:var(--panel-2,rgba(128,128,128,.1));border:1px solid var(--line-soft,rgba(128,128,128,.25));border-radius:6px;padding:5px 8px;overflow-x:auto}',
    ':where(html.gl-rail-on .gl-chip){display:none}',
    ':where(.gl-rail){position:absolute;z-index:2}',
    ':where(.gl-rail .gl-box){display:block;position:absolute;left:0;right:0;margin:0;font-size:12.5px}',
    // definitions list
    ':where(.gl-list){margin:18px 0;padding:0}',
    ':where(.gl-list .gl-list-h){font-family:' + MONO + ';font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-dim,inherit);opacity:.85;margin:0 0 8px}',
    ':where(.gl-list dl){margin:0}',
    ':where(.gl-list dt){margin:14px 0 2px}',
    ':where(.gl-list .gl-list-a){color:inherit;text-decoration:none}',
    ':where(.gl-list dd){margin:0;padding:0 0 10px 12px;border-left:2px solid var(--line,rgba(128,128,128,.35));font-size:14.5px;line-height:1.55;color:var(--ink-mid,inherit)}',
    ':where(.gl-list dd>span){display:block}',
    // registers: one shows at a time (after the display:block rules above, same zero specificity)
    ':where(.gl-box,.gl-list) :where(.gl-eli5,.gl-tech){display:none}',
    ':where(html[data-eli5="on"]) :where(.gl-box,.gl-list) :where(.gl-eli5),:where(html[data-tech="on"]) :where(.gl-box,.gl-list) :where(.gl-tech){display:block}',
    ':where(html[data-eli5="on"],html[data-tech="on"]) :where(.gl-box,.gl-list) :where(.gl-plain){display:none}',
    // the Plain / Technical / ELI5 control
    ':where(.modesel){display:inline-flex;flex-shrink:0;border:1px solid var(--line,rgba(128,128,128,.45));border-radius:8px;overflow:hidden;background:var(--panel,transparent)}',
    ':where(.modesel button){min-height:44px;min-width:44px;padding:0 10px;margin:0;border:0;border-left:1px solid var(--line,rgba(128,128,128,.45));background:transparent;' +
      'color:var(--ink-dim,inherit);font-family:' + MONO + ';font-size:11.5px;letter-spacing:.02em;cursor:pointer;white-space:nowrap;' +
      '-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
    ':where(.modesel button:first-child){border-left:0}',
    ':where(.modesel button:hover){color:var(--ink,inherit)}',
    ':where(.modesel button[aria-checked=true]){background:' + ACC + ';color:var(--bg,#fff);font-weight:700}',
    ':where(.modesel button:focus-visible){outline:2px solid var(--off-bright,' + ACC + ');outline-offset:-3px}',
    ':where(.modesel .ms-short){display:none}',
    '@media (max-width:700px){:where(.modesel .ms-full){display:none}:where(.modesel .ms-short){display:inline}}',
    '@media (max-width:480px){:where(.modesel button){padding:0 6px;font-size:11px}}',
    // in a top bar that has no metaphor menu: sit before the back link
    ':where(.modesel.aitm-solo){margin-left:auto}',
    '.bar-in .modesel.aitm-solo+.back{margin-left:0}',
    // no top bar: a fixed pill, bottom left (annotate.js owns top right and bottom right)
    '.modesel.aitm-float{position:fixed;z-index:9990;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));' +
      'background:var(--panel-2,var(--aitm-bg,Canvas));box-shadow:0 4px 18px rgba(0,0,0,.3)}',
    '.modesel.aitm-float .ms-full{display:none}.modesel.aitm-float .ms-short{display:inline}',
    // annotate.js's Comments pill (bottom right) spans a phone's width: sit above it
    '@media (max-width:700px){html:has(#blog-annot-pill):not(.blog-annot-off) .modesel.aitm-float{bottom:calc(100px + env(safe-area-inset-bottom,0px))}' +
      'html:has(#blog-annot-pill):not(.blog-annot-off) .gl-toast{bottom:calc(156px + env(safe-area-inset-bottom,0px))}}',
    // feedback
    ':where(.gl-toast){position:fixed;left:50%;bottom:18px;transform:translate(-50%,20px);opacity:0;pointer-events:none;z-index:9991;' +
      'max-width:min(520px,calc(100vw - 32px));font-family:' + MONO + ';font-size:12px;color:var(--ink,inherit);background:var(--panel-2,var(--aitm-bg,Canvas));' +
      'border:1px solid ' + ACC + ';border-radius:8px;padding:8px 12px;box-shadow:0 6px 24px rgba(0,0,0,.35);transition:opacity .2s,transform .2s}',
    ':where(html.aitm-has-float .gl-toast){bottom:calc(70px + env(safe-area-inset-bottom,0px))}',
    ':where(.gl-toast.gl-show){opacity:1;transform:translate(-50%,0)}',
    ':where(.gl-toast b){color:' + ACC + '}',
    ':where(.gl-toast .gl-toast-ex){display:block;margin-top:5px;color:var(--ink-mid,inherit);font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:13px;line-height:1.4;letter-spacing:0}',
    '@media (prefers-reduced-motion:no-preference){:where(.gl-box.gl-flash){animation:glflash 1.2s ease-out}}',
    '@keyframes glflash{0%{box-shadow:0 0 0 4px color-mix(in srgb,' + ACC + ' 60%,transparent)}100%{box-shadow:0 0 0 0 transparent}}'
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'aitools-terms-css';
  st.textContent = CSS;
  var head = document.head || root;
  head.insertBefore(st, head.firstChild);

  // ---- mode ----
  // Only a tap writes storage. Storage events and bfcache restores just apply
  // the stored value: writing back from a storage handler made open tabs
  // re-broadcast stale values to each other, so the mode flipped on its own.
  function valid(m) { return m === 'plain' || m === 'tech' || m === 'eli5'; }
  function stored() {
    try {
      var m = localStorage.getItem(KEY);
      if (valid(m)) return m;
      m = localStorage.getItem(OLD); // read-only fallback, never written
      if (valid(m)) return m;
    } catch (e) {}
    return 'plain';
  }
  function getMode() { return root.getAttribute('data-tech') === 'on' ? 'tech' : root.getAttribute('data-eli5') === 'on' ? 'eli5' : 'plain'; }
  // source: 'user' (a tap on this page) or 'sync' (another tab, or a restore)
  function apply(m, source) {
    if (!valid(m)) return;
    var changed = m !== getMode();
    if (m === 'tech') root.setAttribute('data-tech', 'on'); else root.removeAttribute('data-tech');
    if (m === 'eli5') root.setAttribute('data-eli5', 'on'); else root.removeAttribute('data-eli5');
    var segs = document.querySelectorAll('.modesel button[data-mode]');
    for (var i = 0; i < segs.length; i++) {
      var on = segs[i].getAttribute('data-mode') === m;
      segs[i].setAttribute('aria-checked', on ? 'true' : 'false');
      segs[i].tabIndex = on ? 0 : -1;
    }
    if (source === 'user') {
      try { if (localStorage.getItem(KEY) !== m) localStorage.setItem(KEY, m); } catch (e) {}
    }
    if (changed || source === 'user') {
      try { document.dispatchEvent(new CustomEvent('aitools:mode', { detail: { mode: m, source: source } })); } catch (e) {}
    }
  }
  apply(stored(), 'sync');
  window.addEventListener('storage', function (e) { if (e.key === KEY && valid(e.newValue)) apply(e.newValue, 'sync'); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) apply(stored(), 'sync'); });

  function control() {
    var wrap = document.createElement('div');
    wrap.className = 'modesel';
    wrap.setAttribute('role', 'radiogroup');
    wrap.setAttribute('aria-label', 'How terms are explained');
    var cur = getMode();
    MODES.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-mode', d[0]);
      b.setAttribute('aria-checked', d[0] === cur ? 'true' : 'false');
      b.tabIndex = d[0] === cur ? 0 : -1;
      b.setAttribute('aria-label', d[1] + ' explanations');
      b.title = d[2];
      b.innerHTML = '<span class="ms-full">' + d[1] + '</span><span class="ms-short">' + SHORT[d[0]] + '</span>';
      b.addEventListener('click', function () { apply(d[0], 'user'); });
      wrap.appendChild(b);
    });
    // arrow keys move between the three, like native radios
    wrap.addEventListener('keydown', function (e) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!keys[e.key]) return;
      e.preventDefault();
      var bs = wrap.querySelectorAll('button'), at = 0;
      for (var i = 0; i < bs.length; i++) if (bs[i].getAttribute('data-mode') === getMode()) at = i;
      var nb = bs[(at + keys[e.key] + bs.length) % bs.length];
      apply(nb.getAttribute('data-mode'), 'user');
      nb.focus();
    });
    return wrap;
  }
  function placeControl() {
    if (document.querySelector('.modesel') || !document.querySelector('.term[data-term],' + BLOCKS)) return;
    var wrap = control();
    var bar = document.querySelector('.bar-in');
    var mp = bar && bar.querySelector('.mpick');
    if (mp) mp.parentNode.insertBefore(wrap, mp.nextSibling);
    else if (bar) {
      wrap.classList.add('aitm-solo');
      bar.insertBefore(wrap, bar.querySelector('.back'));
    } else {
      wrap.classList.add('aitm-float');
      root.classList.add('aitm-has-float');
      root.style.setProperty('--aitm-bg', pageBg());
      document.body.appendChild(wrap);
    }
  }
  // the first opaque background up the tree, for the fixed pill and toast
  function pageBg() {
    var els = [document.body, root];
    for (var i = 0; i < els.length; i++) {
      var c = getComputedStyle(els[i]).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c;
    }
    return 'Canvas';
  }

  // ---- glossary ----
  var cache = {};
  function load(id) {
    if (!cache[id]) {
      cache[id] = fetch(base + encodeURIComponent(id) + '.json')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .catch(function () { if (window.console) console.warn('terms: no glossary entry for ' + id); return null; });
    }
    return cache[id];
  }
  // m (per-metaphor examples) only on maps with a metaphor menu (html[data-metaphor])
  function mx(m) {
    return '<span class="mx">' + Object.keys(m).map(function (k) { return '<span data-m="' + k + '">' + m[k] + '</span>'; }).join('') + '</span>';
  }
  function registers(d, ex) {
    var h = '<span class="gl-plain">' + d.plain + '</span>';
    if (ex && d.m && root.hasAttribute('data-metaphor')) h += '<span class="gl-ex gl-plain">' + mx(d.m) + '</span>';
    h += '<span class="gl-eli5"><span class="gl-reg">ELI5</span>' + d.eli5 + '</span>';
    h += '<span class="gl-tech"><span class="gl-reg">Technical</span>' + d.technical +
      (d.formula ? '<span class="gl-f">' + d.formula + '</span>' : '') + '</span>';
    return h;
  }

  var items = [], rail = null;
  function build(el, d, n) {
    var id = 'gl-' + el.getAttribute('data-term') + '-' + n;
    var box = document.createElement('span');
    box.className = 'gl-box';
    box.id = id;
    box.setAttribute('role', 'note');
    box.innerHTML = '<span class="gl-t">' + d.term + '</span>' + registers(d, true);
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'gl-chip';
    chip.setAttribute('aria-expanded', 'false');
    chip.setAttribute('aria-controls', id);
    chip.setAttribute('aria-label', 'What ' + el.textContent.trim() + ' means');
    chip.textContent = '?';
    chip.addEventListener('click', function () {
      var open = chip.getAttribute('aria-expanded') !== 'true';
      chip.setAttribute('aria-expanded', open ? 'true' : 'false');
      box.classList.toggle('gl-open', open);
    });
    el.classList.add('gl-ready');
    el.insertAdjacentElement('afterend', chip);
    chip.insertAdjacentElement('afterend', box);
    items.push({ term: el, chip: chip, box: box });
  }

  function layout() {
    var main = document.querySelector('main');
    if (!main || !items.length) return;
    var mr = main.getBoundingClientRect();
    var room = root.clientWidth - mr.right;
    var wide = room >= RAIL_MIN + 16;
    root.classList.toggle('gl-rail-on', wide);
    if (!wide) {
      items.forEach(function (it) {
        if (it.box.parentNode !== it.chip.parentNode) it.chip.insertAdjacentElement('afterend', it.box);
      });
      if (rail) rail.style.display = 'none';
      return;
    }
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'gl-rail';
      document.body.appendChild(rail);
    }
    rail.style.display = '';
    rail.style.left = (mr.right + window.scrollX + 4) + 'px';
    rail.style.width = Math.min(250, room - 28) + 'px';
    var railTop = mr.top + window.scrollY;
    rail.style.top = railTop + 'px';
    var bottom = 0;
    items.forEach(function (it) { if (it.box.parentNode !== rail) rail.appendChild(it.box); });
    items.forEach(function (it) {
      var want = it.term.getBoundingClientRect().top + window.scrollY - railTop - 4;
      var top = Math.max(want, bottom);
      it.box.style.top = top + 'px';
      bottom = top + it.box.offsetHeight + 10;
    });
  }
  var queued = false;
  function relayout() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; layout(); });
  }

  // A tap on this page gets a short toast and a flash on the boxes in view
  // (on phones, where boxes start closed, the nearest one opens). Changes
  // synced from another tab only swap the text.
  var toast = null, toastTimer = 0;
  function feedback(m) {
    var mode = MODE_NAME[m] || MODE_NAME.plain;
    var vh = window.innerHeight, seen = [], railOn = root.classList.contains('gl-rail-on');
    items.forEach(function (it) {
      var r = (railOn ? it.box : it.term).getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) seen.push(it);
    });
    if (!railOn && seen.length && !seen.some(function (it) { return it.box.classList.contains('gl-open'); })) seen[0].chip.click();
    seen.forEach(function (it) {
      it.box.classList.remove('gl-flash'); void it.box.offsetWidth; it.box.classList.add('gl-flash');
    });
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'gl-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    // no box on screen: show the nearest term's text in the new mode in the toast
    var sample = '';
    if (!seen.length && items.length) {
      var near = items.slice().sort(function (x, y) { return dist(x) - dist(y); })[0];
      var clone = near.box.querySelector(m === 'tech' ? '.gl-tech' : m === 'eli5' ? '.gl-eli5' : '.gl-plain').cloneNode(true);
      var lab = clone.querySelector('.gl-reg');
      if (lab) lab.remove();
      sample = near.box.querySelector('.gl-t').textContent + ': ' + clone.textContent.trim();
      if (sample.length > 170) sample = sample.slice(0, 167).replace(/\s+\S*$/, '') + '…';
    }
    toast.innerHTML = '';
    var b = document.createElement('b');
    b.textContent = mode[0] + ' mode';
    toast.appendChild(b);
    toast.appendChild(document.createTextNode(items.length ? ': term boxes now use ' + mode[1] + '.' : ': ' + mode[1] + '.'));
    if (sample) {
      var ex = document.createElement('span');
      ex.className = 'gl-toast-ex';
      ex.textContent = sample;
      toast.appendChild(ex);
    }
    toast.classList.add('gl-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('gl-show'); }, sample ? 4500 : 2600);
  }
  function dist(it) {
    var r = it.term.getBoundingClientRect();
    return r.top > window.innerHeight ? r.top - window.innerHeight : r.bottom < 0 ? -r.bottom : 0;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  // <div data-terms-list> (this page's boxed terms) or data-terms-list="all"
  function renderList(div, ids, link) {
    Promise.all(ids.map(load)).then(function (ds) {
      var rows = [];
      ds.forEach(function (d, i) { if (d) rows.push({ id: ids[i], d: d }); });
      if (!link) rows.sort(function (a, b) { return a.d.term.replace(/<[^>]*>/g, '').localeCompare(b.d.term.replace(/<[^>]*>/g, ''), 'en', { sensitivity: 'base' }); });
      var h = '<div class="gl-list-h">Definitions</div><dl>';
      rows.forEach(function (r) {
        var t = link && link[r.id] ? '<a class="gl-list-a" href="#' + esc(link[r.id]) + '">' + r.d.term + '</a>' : r.d.term;
        h += '<dt id="def-' + esc(r.id) + '">' + t + '</dt><dd>' + registers(r.d, false) + '</dd>';
      });
      div.classList.add('gl-list');
      div.setAttribute('aria-label', 'Definitions');
      div.innerHTML = h + '</dl>';
    });
  }
  function lists(els) {
    var divs = document.querySelectorAll('[data-terms-list]');
    if (!divs.length) return;
    var ids = [], link = {};
    els.forEach(function (el) {
      var id = el.getAttribute('data-term');
      if (link[id]) return;
      if (!el.id) el.id = 'term-' + id;
      link[id] = el.id;
      ids.push(id);
    });
    var all = null;
    for (var i = 0; i < divs.length; i++) {
      if (divs[i].getAttribute('data-terms-list') === 'all') {
        all = all || fetch(base + 'index.json').then(function (r) { return r.json(); });
        (function (div) { all.then(function (a) { renderList(div, a, null); }); })(divs[i]);
      } else renderList(divs[i], ids, link);
    }
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    placeControl();
    document.addEventListener('aitools:mode', function (e) {
      relayout();
      if (e.detail && e.detail.source === 'user') feedback(e.detail.mode);
    });
    var els = Array.prototype.slice.call(document.querySelectorAll('.term[data-term]'));
    lists(els);
    if (!els.length) return;
    var ids = {};
    els.forEach(function (el) { ids[el.getAttribute('data-term')] = 1; });
    var uniq = Object.keys(ids);
    Promise.all(uniq.map(load)).then(function (ds) {
      var got = {};
      uniq.forEach(function (id, i) { got[id] = ds[i]; });
      els.forEach(function (el, n) { var d = got[el.getAttribute('data-term')]; if (d) build(el, d, n); });
      layout();
      window.addEventListener('resize', relayout);
      if (window.ResizeObserver) new ResizeObserver(relayout).observe(document.querySelector('main') || document.body);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
      window.addEventListener('load', relayout);
      // a metaphor menu or a mode change changes text length, so boxes move
      new MutationObserver(relayout).observe(root, { attributes: true, attributeFilter: ['data-metaphor', 'data-tech', 'data-eli5'] });
    });
  }
  // Deferred scripts run while readyState is already "interactive" but before
  // DOMContentLoaded, when a map's own DOMContentLoaded work (judges' metaphor
  // menu, which the control sits after) has not run yet. So wait for it, unless
  // the page has fully loaded; load is a backstop (start runs once).
  if (document.readyState === 'complete') start();
  else { document.addEventListener('DOMContentLoaded', start); window.addEventListener('load', start); }

  window.AIToolsTerms = { getMode: getMode, setMode: function (m) { apply(m, 'user'); }, glossary: base };
})();
