# Shared terms: explanation modes, definitions and widgets

Every map on this host can explain its hard words the same way, with one glossary and one reader setting. Plain JS, no build step.

- `assets/terms.js`: term boxes, the Plain / Technical / ELI5 control, mode blocks and definitions lists.
- `assets/glossary/<id>.json`: one file per term, shared by every map.
- `assets/widgets.js`: helpers for small interactive widgets; each widget is `assets/widgets/<name>.js`.
- `assets/terms-demo.html`: a test page using all of it.

All maps share one origin, so the mode a reader picks (localStorage `aitools-mode`: `plain`, `tech` or `eli5`) follows them to every map. The old LLM Judges key `llm-judges-mode` is read as a fallback and never written.

## Adopt it on a map page

At the bottom of the page, next to annotate.js:

```html
<script src="https://idvorkin-ai-tools.github.io/assets/terms.js" defer></script>
```

Optional, in `<head>`, so the page paints in the reader's mode before terms.js arrives (the script sets the mode, the style hides other modes' blocks; the style is only needed with mode blocks):

```html
<script>try{var m=localStorage.getItem('aitools-mode')||localStorage.getItem('llm-judges-mode');if(m==='tech'||m==='eli5')document.documentElement.setAttribute('data-'+m,'on')}catch(e){}</script>
<style>html:is([data-tech="on"],[data-eli5="on"]) .plain-only,html:not([data-tech="on"]) .tech-only,html:not([data-eli5="on"]) .eli5-only,html[data-tech="on"] .no-tech{display:none!important}</style>
```

The script injects its own CSS first in `<head>` at zero specificity, so it works on a page with no stylesheet and any rule in the map's CSS wins. It reads the map's colour variables when they exist (`--def`, `--panel`, `--line`, `--ink-mid`, …).

Where the control goes: after the metaphor menu if the top bar has one (`.bar-in .mpick`), else in the top bar before the back link (`.bar-in .back`), else as a small pill fixed bottom left (annotate.js owns top right and bottom right). It shows only on pages with a term, a mode block or a definitions list. A tap swaps the text, shows a short toast and flashes the boxes in view. Only a tap writes storage; other tabs follow through the `storage` event without writing back (writing back made open tabs echo stale values and the mode flipped by itself).

## Term boxes

Wrap the first use of a term on the page, once:

```html
<span class="term" data-term="kappa">Cohen's kappa</span>
```

Wide screens show the box in the right margin beside its line (the page needs a `<main>` with room to its right); narrow screens get a `?` chip that opens it inline. Box only words a smart non-specialist would not know, and never the same term twice on one page.

## Mode blocks

For a passage that reads differently per mode:

```html
<p class="plain-only">…</p>  <p class="tech-only">…</p>  <p class="eli5-only">…</p>
<div class="no-tech">…</div>   <!-- everything but Technical -->
```

The rules only hide, so a block keeps its own `display`. Use them where they are cheap (an extra formula line, one alternate paragraph); don't write three versions of a page. A page with only mode blocks still gets the control.

## Definitions lists

```html
<div data-terms-list></div>          <!-- every term boxed on this page, linked to its first use -->
<div data-terms-list="all"></div>    <!-- the whole shared glossary, A to Z -->
```

Each entry shows the register for the current mode.

## Add a term

1. `ls assets/glossary/` first and **reuse an existing id**. Pages on every map must agree on a term's meaning. If an entry is wrong, fix it for everyone; don't bend it to one page.
2. Add `assets/glossary/<id>.json` (id lowercase-with-hyphens):

   ```json
   {
    "term": "Cohen's kappa",
    "plain": "One everyday sentence.",
    "eli5": "One short, concrete sentence a child would get.",
    "technical": "The precise definition, in one sentence.",
    "formula": "κ = (p<sub>o</sub> − p<sub>e</sub>) / (1 − p<sub>e</sub>)"
   }
   ```

   `term`, `plain`, `eli5` and `technical` are required; values are HTML. `formula` is optional and shows in Technical mode. `m` (one example per LLM Judges metaphor) is optional and shows only on a map with a metaphor menu. One sentence per register, plain words.
3. `python3 scripts/build_glossary_index.py` (rewrites `index.json`, which `data-terms-list="all"` reads).
4. `python3 scripts/check_terms.py` here, and `python3 scripts/check_terms.py <map-dir>` on the map that uses it: every `data-term` has an entry, none is boxed twice on a page, every entry has the required keys, `index.json` is current, and pages that use any of this load terms.js.

## Widgets

```html
<p class="lab-try"><b>Try this</b>One line: what to move, what to watch.</p>
<div data-widget="<name>"></div>
…
<script src="https://idvorkin-ai-tools.github.io/assets/widgets.js" defer></script>
<script src="https://idvorkin-ai-tools.github.io/assets/widgets/<name>.js" defer></script>
```

`assets/widgets/<name>.js` calls `AIToolsWidgets.register('<name>', function (el) {…})`, which builds into every matching element (`<div class="lab" data-lab="<name>">`, the LLM Judges form, works too). Helpers: `slider(id, label, min, max, step, value)` (output in `#<id>-o`), `stat(label, id, note)` inside `<div class="statgrid">`, `presets([[key, label], …])`, `sum(id)` (the `aria-live` one-sentence summary), `table2x2(o)`, `t(x, y, text, cls)` for SVG text, `$(el, id)`, `uid()`, and number formats `f2`, `f3`, `cnt`, `pct` (0/0 prints a dash or "undefined", never NaN). A `<button class="lab-go" data-lab-go="<name>" data-p="<preset>">` elsewhere sets a preset (if the widget sets `el.labPreset`) and scrolls to it.

Rules: keep the maths in its own file with a `node:test` check against the numbers the page prints; native range inputs and buttons only, each labelled; SVG `viewBox` about 360 wide so it reads at 390px.

## Test

Serve this repo and the map from one origin (they share localStorage live), or intercept `https://idvorkin-ai-tools.github.io/**` in Playwright and serve both from disk; the LLM Judges map's `tools/browser_check.cjs` does this with `AITOOLS_HUB=<this repo>`. Check 390px and 1200px in all three modes: no console errors, no horizontal scroll, nothing under the annotate.js buttons.
