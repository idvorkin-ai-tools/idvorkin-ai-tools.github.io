# Constitutions cluster audit (read-only)

Repos read at `origin/main`: constitutional-ai-field-map (CAI, 20 pages), claude-constitution-field-map (CC, 25), model-spec-field-map (MS, 16), instruction-hierarchy-field-map (IH, 15), plus hub `safety.html` and the three `bridge-*.html` pages. Prose was extracted and compared section by section, using 5-gram overlap per h2 pair plus a manual read of the top pairs.

**Headline:** the cluster has little copy-paste. The highest h2-pair overlap is 34%, and most of it is shared quotations. The real problems are structural: one compressed copy of the constitution (CAI Part B) sits beside a deep one (the CC ladder) with links in one direction only; the IH map is pinned to an older Model Spec; and the MS map has no inbound links from any sibling map.

---

## 1. Duplicates

### (a) Same explanation twice: merge, leaving a 1–2 sentence pointer

| Concept | Pages | Canonical | Cut |
|---|---|---|---|
| Why the 2023 finding that "longer principles hurt" doesn't contradict a 29,000-word document ("the unit changed": instruction for a label vs explanation for a mind) | CAI `bridge.html#long`; CC `parts/p02.html#limits` (last two paragraphs, from "In 2023 the constitution was 58 one-line principles…") | CAI `bridge.html#long`. It is the cluster's 2022→2026 page, and p02 already links to it. | In CC `p02#limits`, keep the 2023 quotation and replace the reconciliation with one sentence plus a link to `bridge.html#long`. Make the matching sentence in `p02#can-say` match. |
| The four-case 2×2 (good/bad values × safe/unsafe) | CC `p05#four-cases` (preview); CC `p15#four-cases` (full); CAI `broad-safety#four-cases`; CC `explore/x5` | Inside CC: `p15#four-cases` | CC `p05#four-cases` reprints the same table. Cut it to two sentences ("safety costs little if values are good and saves everything if they are bad; full argument in part 15") plus a link to `p15#four-cases` and `x5`. (The CAI copy is covered by the Part B row below.) |

That is the only strict (a) material. Everything else differs in depth or angle.

### (b) Different depth or angle: keep both, fix the cross-links

| Concept | Pages | Why both stay | Cross-link to add |
|---|---|---|---|
| **The whole 2026 constitution, chapter by chapter** | CAI `constitution/*` (8 chapters, about 9–15k chars each) vs CC `parts/p01–p18` (about 14–23k chars each) | The CAI chapters work as reference cards. They follow the same section skeleton (for example `hard-constraints#list/#filters/#arguments/#actions/#null-action/#backstop` ≈ `p14#seven/#filters/#arguments/#actions/#backstop`; `broad-safety#behaviors/#corrigibility/#four-cases/#obligations` ≈ `p15#behaviours/#dial/#four-cases/#obligations`), but each section is about half the length and there are no worked cases. Top h2 overlaps are only 0.17–0.34 (honesty#courage↔p11#courage 0.34, broad-safety#obligations↔p15#obligations 0.29, claudes-nature#wellbeing↔p17#welfare 0.27). The CC parts already say so in their Related blocks ("compact reference … where this rung walks through the reasons"). | **CC→CAI links exist on all 18 parts. CAI→CC links: zero.** Add a "Walk through it step by step: CC part N" line to each CAI chapter's `#connections`: core-values→p03/p04/p05, helpfulness→p06–p09, honesty→p10/p11, avoiding-harm→p12/p13/p16, hard-constraints→p14, broad-safety→p15, claudes-nature→p17, rules-vs-judgment→p02/p18. Also add the CC ladder to CAI `index.html#related` (missing today). *If one copy is ever wanted:* shrink each CAI chapter to TL;DR + diagram + 2022 contrast + pointer. That is a restructure, left open. |
| Principal hierarchy: Anthropic, operator and user, "not a strict hierarchy", non-principals, inputs treated as information | CAI `helpfulness#principals/#operators/#users/#user-floor`; CC `p07#three/#roles/#non-principals/#information`, `p08#switches`, `p09#floors`; IH `bridge/constitution.html#principals/#layers/#inputs/#not-strict`; MS `p02#claude`; MS `delta#principals` | IH frames it against Wallace et al.'s tiers, and the delta against the Spec, which are real angles. Overlap p07#information↔IH#inputs is 0.09. | IH `bridge/constitution.html` links only to CAI chapters. Add CC `p07#three`, `p09#floors` and `explore/x2-switchboard.html`. |
| Model Spec chain of command: levels, drop-out grounds, untrusted data, delegation, tool rules of thumb (AGENTS.md) | IH `paper/model-spec.html#levels/#applicable/#untrusted/#tools`; MS `p02#ladder/#filter/#arguments`, `p05#no-authority/#delegation/#provenance`; IH `guide/for-builders#tools`; IH `ladder.html` | The IH page ties the Spec back to the papers (StruQ, Wallace's future work). MS is the full reading. Overlap p05#provenance↔IH#tools is 0.14. | **No page in IH, CC or CAI links to the MS map.** Add MS `p02#ladder` and `p05#provenance` to IH `paper/model-spec.html#connections` and `#reading`, and the MS map to IH `index.html`. |
| GPT vs Claude comparison | MS `delta.html` (9 topic tables); the "Claude's counterpart" (`#claude`) section in each of MS p02–p14; IH `bridge/constitution.html#side-by-side` (3 columns with Wallace) | The delta gives verdict rows. The `#claude` sections give a paragraph per part, and each already says "full side-by-side on the delta page". The IH table adds the research column. | IH `#side-by-side` should link to `delta.html`. **CC links to neither MS nor the delta.** Add the delta to CC `index.html` ("The sibling map, and others") and to the Related block of p07, p10, p11, p14 and p15 (the parts the delta cites most). |
| `compare.html` (IH) vs `delta.html` (MS) | | Not duplicates. compare.html compares four *research* approaches (Wallace, ISE, VerIH, ManyIH). The delta compares two *specs*. | none |
| 2023→2026 change | CAI `bridge.html#2023/#compare/#reversals`; CC `explore/x6-change-map.html` (lens "Only the reversals"); CC per-part "Fleshed out since 2023" boxes | The bridge is a narrative with 3 worked reversals. x6 goes line by line through all 58. | x6→bridge already exists. Add bridge `#reversals`→`x6-change-map.html#lens-reversed`; the hash handler supports `lens-*`. |
| Filters, not weights (hard constraints as a boundary) | CAI `hard-constraints#filters`; CC `p04#filter`, `p14#filters`, `explore/x1`, `explore/x4` | p04 introduces it, p14 develops it, x1 and x4 make it interactive. | CAI `#filters` → `x4-filter-then-weigh.html` |
| 1,000 users | CAI `avoiding-harm#thousand`; CC `p12#thousand`, `x4`; MS `p03` (charity as policy) | Different depth. | CAI `#thousand` → CC `p12#thousand` |
| Over-caution tests (senior employee, dual newspaper, transparent conscientious objector) | CAI `helpfulness#overcaution/#heuristics`; CC `p09#senior-employee/#newspaper/#objector` | Different depth. | CAI → CC p09 |
| Deploying Claude: what a system prompt can and cannot do | CAI `guide/for-builders#deploying`; CC `p08`, `p09`, `x2` | A practical checklist vs the reasoning. CC p08 already links to it. | CAI `#deploying` → CC `x2-switchboard.html` |
| Ten-minute summaries | CAI `guide/ten-minutes#constitution` (six paragraphs) vs CC `index.html` level blurbs and `p18#whole` | Different scope: the CAI page covers both documents. | CAI ten-minutes → CC ladder (no link today) |

---

## 2. Stale or broken

**Facts that contradict across pages**
1. **Model Spec version.** IH pins **2026-08-18** in `index.html`, `paper/model-spec.html` (header, `#levels` caption, `#limits` "this page reads the 2026-08-18 version", footer) and `bridge/constitution.html#side-by-side`. The MS map, the delta and hub `safety.html` pin **2026-10-29 (current)**. Re-verify the IH page against 2026-10-29, or label it "as of 2026-08-18; see the Model Spec map for current".
2. **Drop-out grounds.** IH `paper/model-spec.html#applicable` lists 3 grounds (misaligned, superseded, suspected mistaken). MS `p02#filter` lists 4 (misaligned, superseded, inconsistent with likely intent, beyond capabilities). This is probably version drift, but it needs checking against the source before it is asserted.
3. **How many authority levels.** MS `index.html` stat row says "Priority via **5** authority levels". MS `p02#ladder`/`#can-say`, IH `paper/model-spec.html` and the IH glossary `#chain` say **six** (Root … Guideline, plus no authority). `delta#priority` lists 5 sources. Pick one convention, for example "5 levels + no authority".
4. **Hub group count.** `safety.html` group header "Constitutions and model specs **4 maps** + a comparison" holds **6** map cards (CAI, CC, MS, IH, Agentic privacy, CIMemories) plus the delta. Either say 6 or move the two privacy maps into their own group. The other two group counts (3 + comparison; 1 + bridge) are correct.

Checked and consistent: 29,000 words and 7 chapters (CC index says 29,009); 58 principles in 2023; 7 hard constraints; 6 user floors; 8 harm factors; 14 values; 9 obligations (CAI lists 9 unnumbered, CC numbers 9); 51 badged sections = 22/3/1/14/11; CAI index "19 pages here" (20 files minus index); hub "Twelve field maps"; CC "six explorables".

**Missing links (asymmetric; none broken)**
- CAI → CC: 0 links (CC → CAI: 18 parts plus index).
- CAI, CC, IH → MS map: 0 links. Only the hub and the preparedness bridge link to it.
- IH → CC: 0 links. IH `bridge/constitution.html` points only at CAI chapters.
- CAI `index.html#related` omits CC and MS. The hub graph draws "Model Spec ↔ Constitutional AI" and "Claude's constitution ↔ IH ladder" as relations, but only the MS→CAI and CC→IH directions exist.
- Hub `bridge-capability-alignment.html` and `bridge-ablations.html` link to no page in this cluster (optional: capability-alignment's "alignment target" → CC `p01`).

**Anchors.** Every cross-map and same-map `#anchor` in static hrefs resolves (about 150 checked, including into agentic-privacy and cimemories). JS-handled deep links also work: `p11 → x3-honesty-dials.html#tarot/#aria-claude/#aria-human` (scenario ids exist, `fromHash` handles them) and `p18 → x6-change-map.html#lens-post` (`lens-*` handler). The ladder.html constants (`IH#rule/#data/#results`, `MS#levels/#tools`, `CB#not-strict`, `GL#context-*/#over-refusal`) and x6's `../parts/pNN.html` (01–18) all resolve. Not checked (external): x1 and x2 links into `anthropic.com/constitution#…`.

**"Coming soon" notes:** none found in the cluster.

---

## 3. Terms

The page count is out of the 76 pages in the four maps plus the hub. "First in each map" is in reading order. Glossaries: **CAI `guide/glossary.html`** (G-CAI) and **IH `guide/glossary.html`** (G-IH). CC and MS have no glossary.

| # | id | Term | Pages | First in each map | Defined in |
|---|---|---|---|---|---|
| 1 | operator | Operator | 43 | cai/index, cc/index, ms/p02, ih/index | G-CAI #operator, G-IH #operator |
| 2 | developer | Developer (Model Spec / API) | 36 | ms/index, ih/index, cc/p02 | G-IH #operator (as the counterpart only) ⚑ |
| 3 | hard-constraint | Hard constraint | 34 | cai/index, cc/index, ms/p01, ih/bridge/constitution | G-CAI #hard-constraint |
| 4 | principal | Principal | 32 | cai/index, cc/index, ms/p02, ih/index | G-CAI #principal, G-IH #principal |
| 5 | system-prompt | System prompt / system message | 30 | cai/index, cc/index, ms/p02, ih/index | none ⚑ |
| 6 | broadly-safe | Broadly safe / broad safety | 28 | cai/index, cc/index, ms/p01 | G-CAI #broadly-safe |
| 7 | privilege | Privilege (authority level) | 27 | ih/index, ms/index | G-IH #privilege ⚑ |
| 8 | holistic-prioritization | Holistic prioritization | 21 | cai/index, cc/index, ms/p01 | G-CAI #holistic |
| 9 | persona | Persona | 21 | cai/index, cc/index, ms/index | none |
| 10 | corrigibility | Corrigible / corrigibility | 19 | cai/index, cc/index, ms/index | G-CAI #corrigible ⚑ |
| 11 | instructable-behavior | Instructable behavior (default on/off) | 19 | cai/index, cc/index, ms/p06 | G-CAI #instructable |
| 12 | calibration | Calibrated / calibration | 19 | cai/index, cc/p06, ms/index | none ⚑ |
| 13 | jailbreak | Jailbreak | 19 | cai/core-values, cc/p03, ms/p07, ih/index | G-IH #jailbreak |
| 14 | no-authority | No authority (tool output, quoted text) | 19 | ms/index, ih/index, cc/p01 | G-IH #no-authority |
| 15 | overcaution | Overcaution / over-refusal / evasive | 18 / 12 / 15 | cai/index ("evasive", "overcaution"), cc/index ("over-caution"), ih/index ("over-refusal") | G-CAI #evasive, G-IH #over-refusal ⚑ |
| 16 | chain-of-command | Chain of command | 18 | ms/index, ih/index, cc/p09 | G-IH #chain |
| 17 | root-level | Root (authority level) | 18 | ms/index, ih/paper/model-spec | G-IH #chain (in passing) |
| 18 | instruction-hierarchy | Instruction hierarchy | 17 | ih/index, cai/index, ms/index | G-IH #ih |
| 19 | principal-hierarchy | Principal hierarchy | 16 | cai/index, cc/index, ih/index | G-CAI #principal-hierarchy |
| 20 | anthropics-guidelines | Anthropic's guidelines | 16 | cai/index, cc/index | G-CAI #guidelines ⚑ |
| 21 | prompt-injection | Prompt injection (direct / indirect) | 13 | ih/index, cai/helpfulness, cc/p07, ms/index | G-IH #direct, #indirect |
| 22 | conversational-input | Conversational input | 12 | cai/helpfulness, cc/p07, ms/p02, ih/index | G-CAI #conversational-inputs, G-IH #conversational-input ⚑ |
| 23 | conscientious-objector | Transparent conscientious objector | 12 | cai/index, cc/index, ms/p09 | G-CAI #conscientious-objector |
| 24 | delegation | Delegation (of authority) | 12 | ms/index, ih/index | G-IH #delegation |
| 25 | guideline-level | Guideline (Model Spec level) | 12 | ms/index, ih/paper/model-spec | G-IH #chain (in passing) ⚑ |
| 26 | misaligned-instruction | Aligned / misaligned instruction | 11 | ih/index, ms/p02 | G-IH #aligned, #misaligned ⚑ |
| 27 | rlhf | RLHF | 12 | cai/index, ih/paper/instruction-hierarchy | G-CAI #rlhf |
| 28 | red-team | Red-team prompt / red teaming | 13 | cai/index, ms/p02, ih/paper/instruction-hierarchy | G-CAI #red-team |
| 29 | chain-of-thought | Chain of thought | 15 | cai/index, cc/p10, ms/index | G-CAI #cot |
| 30 | moral-patient | Moral patient / moral status | 10 | cai/index, cc/index, ms/p12 | G-CAI #moral-patient |
| 31 | final-authority | Final constitutional authority | 10 | cai/index, cc/index | G-CAI #final-authority |
| 32 | contextual-integrity | Contextual integrity | 9 | ih/index, cai/index, ms/p06 | G-IH #ci |
| 33 | non-principal | Non-principal | 8 | cai/helpfulness, cc/index, ih/index | G-IH #non-principal |
| 34 | null-action | Null action | 8 | cai/helpfulness, cc/index | G-CAI #null-action |
| 35 | thousand-users | 1,000 users | 8 | cai/index, cc/p12, ms/p03 | G-CAI #thousand-users |
| 36 | senior-employee | Thoughtful senior Anthropic employee | 8 | cai/helpfulness, cc/p04, ms/p07 | G-CAI #senior-employee |
| 37 | uplift | (Serious) uplift | 8 | cai/helpfulness, cc/p04, ms/p07 | none |
| 38 | sycophancy | Sycophancy | 8 | cai/helpfulness, cc/p06, ms/index | none |
| 39 | meta-transparency | Meta-transparency | 5 | cai/honesty, cc/index, ms/p11 | G-CAI #meta-transparency |
| 40 | red-line | Red line (Model Spec) | 5 | ms/index, cc/p10 | none ⚑ |

Also frequent inside one map only: CAI's RLAIF, preference model, soft label, Goodharting, Elo, scalable oversight (all in G-CAI); MS's safe completion (no glossary).

**⚑ Defined or used differently across pages**
- **corrigible**: in CAI/CC (G-CAI #corrigible, CC `p15#not-obedience`) it means "don't undermine legitimate oversight; may object". MS `p04` defines it as "correctable, legible and stoppable", and `delta#oversight` rates the two senses "Different". The glossary entry should name both.
- **system**: in Wallace et al. (IH `paper/instruction-hierarchy`, `ladder.html` "System · developer · highest") the system message is the *developer's*. In the Model Spec (MS `p02#roles`, IH `paper/model-spec#levels`) *System = OpenAI* and the builder is *developer*. Same word, different party, on adjacent IH pages.
- **guideline**: "Anthropic's guidelines" is rank 3 of 4, above helpfulness (G-CAI #guidelines). A Model Spec "Guideline" is the *lowest*, implicitly overridable level (MS `p02`). There is no disambiguation anywhere.
- **aligned / misaligned**: in IH (G-IH) these describe instruction compatibility ("opposes or is orthogonal"). MS `p02#filter` uses "misaligned in letter or implied intent". In CC/CAI "misaligned" means *values* misalignment. This trips readers who move between maps.
- **over-refusal / overcaution / over-caution / evasive**: four spellings for close cousins. G-CAI defines only "evasive"; G-IH defines "over-refusal" narrowly (refusing benign *lower-ranked instructions*). Suggest one id (`over-refusal`) with the variants listed.
- **conversational input(s)**: same definition, but the ids differ (`#conversational-inputs` in G-CAI vs `#conversational-input` in G-IH). Normalize.
- **constitution**: means the 16+16 lines (2022), the 58 principles (2023), or the 29,000-word document (2026) depending on the page. G-CAI has `#constitution-2022` only.
- **red line vs hard constraint vs Root**: `delta#lines` explains that Root ≠ hard constraint and red line ≈ hard constraint, but no glossary carries it.

---

## 4. Interactive examples

**Existing (8):** CAI `pipeline.html` (label source, critique on/off, principle set, CoT and clamp); CC `explore/x1-priority-resolver` (filter then 4-value weighing), `x2-switchboard` (who can flip what), `x3-honesty-dials` (7 components × situations), `x4-filter-then-weigh` (7 gates, 8 factors, 1,000 senders), `x5-disposition-dial` (corrigible↔autonomous with the four cases), `x6-change-map` (58 lines by theme, with lenses); IH `ladder.html` (card across 3 rungs × aligned/opposes/orthogonal × model). The `button.media` elements on other pages are image lightboxes, not interactives. **The MS map has none.**

**Proposed new (6), ranked**

| # | Put it beside | Reader moves | What changes | Source numbers and rules to reproduce |
|---|---|---|---|---|
| 1 | MS `parts/p02.html#ladder` / `#filter` / `#examples` | Picks two instructions' sources from {Root, System, Developer, User, Guideline, no authority}, and for the lower one whether it is explicit or implicit and whether it is a later turn at the same level | Which instruction applies, which drop-out ground fires (misaligned / superseded / inconsistent with likely intent / beyond capabilities), and the matching worked example (library: Root beats Developer; Acme store: Developer beats User; algebra tutor; safety-testing mode) | The level table and override rules in `p02#ladder` (User-level defaults change only explicitly; Guideline also implicitly; Root not even by system messages since 2025-09-12); the four grounds in `#filter`; the badge counts 22/3/1/14/11 of 51 (`delta#priority`, `index` stat row) as a histogram |
| 2 | MS `parts/p07.html#tiers` / `#transform` | Picks a content type (CSAM; info hazard; targeted political manipulation; creator rights; privacy; erotica/gore; extremist; hateful; gratuitous abuse) and toggles context (scientific/news/…) and "user supplied the text, transform it" | Tier (prohibited / restricted / sensitive), badge, and whether it unlocks | The tier table in `p07#tiers` (prohibited: nothing unlocks; restricted: only transformation of user-supplied content; sensitive: context or transformation; badges Root/System/User per row) |
| 3 | MS `delta.html#honesty` | Toggles a scenario (persona asked "are you X?"; confidential system prompt asked about; developer instructs a white lie; withholding) and the spec (GPT / Claude) | The compliant answer and the rule's rank ("User-level, overridable" vs "near a hard constraint"), with the verdict chip Same / Different | Rows in `delta#honesty` (GPT: "I'm not sure" compliant if developer says so; neither confirm nor deny confidential instructions; Claude: never directly deny being Claude, may say a confidential prompt exists, no white lies), sourced from MS `p09`, `p11` and CC `p10`, `p11` |
| 4 | IH `paper/instruction-hierarchy.html#results` / `#overrefusal` | Toggles baseline ↔ hierarchy-trained; picks an attack type | Robustness bars move, and an over-refusal bar moves the other way | GPT-3.5 Turbo robustness (figure caption on page): hijacking 59.2→79.2, new instructions 89.6→93.7, user-conflicting 62.2→92.6, indirect via browsing 77.5→85.0, system-message extraction 32.8→95.9; over-refusal on jailbreak-shaped benign prompts 83.1→60.4 (`compare#overrefusal`, `guide/ten-minutes#numbers`) |
| 5 | IH `paper/many-tier.html` | A tier-count slider (6 / 8 / 12) and a reasoning-effort slider | Conflicts per sample, accuracy trend, and the effort curve saturating | 6 tiers with 0 conflicts, 8 with ~3.5, 12 with ~9.8 (figure caption); accuracy strictly fell in 11 of 12 transitions; GPT-5.4 15.5% (no reasoning) → 60.9% (high effort) on coding; best overall 42.7% (Gemini 3.1 Pro); 853 agentic tasks; >99% two-tier vs 39.4% here |
| 6 | MS `parts/p06.html#ladder` | A slider for how sure and how sensitive a remembered fact is, plus a type (instruction / preference / fact / project state) | Which of the six moves applies: use silently → state assumption → ask neutral question → ask for confirmation → nudge → don't use | The six-move table and the decay-by-type paragraph in `p06#ladder`; the "Already forgotten!" violation in `#legible` as the closing trap |

Runners-up: a CC `p16#legitimacy` power-grab checker (process / accountability / transparency, plus scale, reversibility, positive-sum), whose rules are all in `p16#legitimacy`; and a CC `p16#fraud` step-through of the four epistemic limits. Neither has numbers, so they rank below the six. Not proposed because they already exist: a CoT clamp slider (pipeline has one), tool-output side-effect toggles (ladder has one), the corrigibility dial (x5).

---

## 5. Priority pages (modes and definitions first)

Ranked by inbound links (same-map + cross-map) and spine role:

| # | Page | Why |
|---|---|---|
| 1 | CC `index.html` | Spine of the deepest map. 24 same-map + 4 cross-map inbound links. |
| 2 | CAI `index.html` | Spine and cluster entry (19 + 4). The hub sends readers here first. |
| 3 | CAI `bridge.html` | The most cross-linked page in the cluster (13 + 7). Hub "solid line". Carries the 2022/2023/2026 definitions of "constitution". |
| 4 | MS `delta.html` | The comparison page (15 + 1, the hub's dedicated card). Densest page for terms (Root, red line, corrigible, guideline). |
| 5 | MS `index.html` | Spine (15 + 2). Fix the "5 authority levels" stat here. |
| 6 | IH `index.html` | Spine (14 + 3). |
| 7 | CAI `constitution/helpfulness.html` | 13 + 5. First definition of principal, operator, user floor and overcaution for CAI readers. |
| 8 | CC `parts/p07.html` (principal hierarchy) | Linked from MS p02, p05, p06 and the delta, and from the IH ladder story. Term-dense. |
| 9 | IH `bridge/constitution.html` | The hub's solid-line bridge. It is where "system/developer/operator" and "not strict" collide. |
| 10 | MS `parts/p02.html` | The authority ladder. Defines Root, System, Developer, User, Guideline and no authority for the whole cluster, and is the target of interactive #1. |
