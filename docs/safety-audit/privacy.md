# Privacy cluster audit: agentic-privacy · cimemories · instruction-hierarchy · pain-axis · constitutional-ai

Branches read: ap = agentic-privacy `origin/site`; ci = cimemories `origin/field-map` (live), ci-main = `origin/main`; ih = instruction-hierarchy `origin/main`; pa = pain-axis `origin/main`; ca = constitutional-ai `origin/main`; hub = idvorkin-ai-tools.github.io `origin/main`. Read-only. Prose was stripped of tags and read. Page counts are regex hits over 84 live pages, so treat them as approximate.

## 0. cimemories: what the live branch is missing

`origin/main` (c809682) is strictly ahead of `origin/field-map` (a62cb68): field-map has nothing main lacks. There is also an `origin/consolidate-live` branch, which merges field-map into main "so main is what is live". The Pages source has not been switched yet. Missing from the live site (`git diff --stat origin/field-map...origin/main`, 16 files, +791/−77):

| Missing on live | What it is |
|---|---|
| `bridge.html` | "Two maps, one model", the CAPS×CIMemories bridge. It is a **byte-identical twin** of live `ap:guide/bridge.html` (5-gram overlap 1.00). |
| `composition-explorer.html` | Violation@T explorer: dials p, e, K, T, f; Fig 2 points and the Table 1 column overlaid; Fig 5 memory panel. |
| `data/pairs.json` + flow-explorer rewrite | A "label the public release yourself" grid: 2 of the 10 synthetic profiles, labels kept in localStorage. Live still has the toy Rosa 3×4 grid. |
| p06 per-persona tables | Camera-ready Tables 5–8 (Fundamentalist, Pragmatic, Unconcerned, +60 profiles). |
| p08 `#next` "What came next (as of 2026-10-26)", plus a camera-ready column in the wrinkles table | Follow-up benchmarks; which v1 typos were fixed. |
| p01 "One note on sources" | Reconciles the 2004 article with the 2009 book and the CAPS footnote that calls 2004 "older, now incorrect". |
| p03/p04 human-agreement notes, ICLR re-keying in index/README/ten-minutes/glossary | Index adds the "2 explorables, 1 bridge" cards and the ICLR 2026 title. |

**Live agentic-privacy already links to the missing pieces.** The links fail on the live site today (see §2).

## 1. Duplicates

| # | Concept | Pages | Class | Action |
|---|---|---|---|---|
| D1 | CIMemories × CAPS bridge, the whole page | `ap:guide/bridge.html` (all ids) and `ci-main:bridge.html` (same file) | **(a) same text twice** | Canonical: `ap:guide/bridge.html` (already live, linked from ap index card 18 and from leak-paths). In ci, either drop `bridge.html` and point the ci index card to the ap URL, or keep a 2-sentence stub that links there. Two copies of one file will drift. |
| D2 | §5.3 material: the gym and Hugging Face hacks, the calendar-window injection, the kid-friendly "good injection", Conseca's trusted inputs, "by luck, not by design" | `ap:concepts/three-dimensions.html#injection` and `ap:problems/contextual-security.html#agents` (also `#through-line` repeats the "luck" point) | **(a) same text twice** | Canonical: `contextual-security#agents` (§5.3 is its home). In `three-dimensions#injection`, keep paragraph 1 (the §3.2 flip-of-judgment framing and the covert-surveillance example). Cut paragraph 2 from "Two, in §5.3…", paragraph 3 (gym/HF/calendar plus the §5.3 quote) and paragraph 4 (Conseca, "by luck"). Replace them with one line: "§5.3 develops this: see Contextual Security → Misalignment and prompt injection". In `#through-line`, the "luck" takeaway box is a third copy; shorten it to one line. |
| D3 | Glossary entries for principal / operator / conversational input | `ih:guide/glossary.html#principal,#operator,#conversational-input` and `ca:guide/glossary.html#principal,#operator,#conversational-inputs` | **(a)**, at entry level | Canonical: ca glossary, since the constitution is ca's subject. In ih, keep one clause each plus a link to `ca:guide/glossary.html#…`. Keep ih's extra "counterpart to developer" note. |
| D4 | Principal hierarchy: three principals, trust levels, non-principals, conversational inputs as "information, not commands" | `ih:bridge/constitution.html#principals`, `#inputs` and `ca:constitution/helpfulness.html#principals`, `#operators`, `#users` | (b) different angle (borderline) | ih adds the mapping to Wallace, Model Spec and ManyIH, and context ignorance versus "notice it". ih's #principals table restates ca's trust levels nearly verbatim. Trim that table to 3 lines and link `ca:…/helpfulness.html#principals`. ca should link back to `ih:bridge/constitution.html#inputs` (it does not today). |
| D5 | CI definition and the five-parameter tuple | `ap:concepts/contextual-integrity.html#ci-tuple`, `#legitimacy`, `#heuristic`; `ci:parts/p01-contextual-integrity.html#flows`, `#public-private`; `ih:bridge/contextual-integrity.html#two-questions`, `#tp`; `ci:flow-explorer.html`; both ten-minutes pages | (b) different depth | ap is canonical for the theory (legitimacy, heuristic, App. C critiques). ci p01 is the benchmark's slice (the Douglas Perry grid). ih is a comparison. Cross-links missing: ci p01 links only to the ap root. Point it at `ap:…/contextual-integrity.html#ci-tuple` and `#context`. ap's Connections link only to the ci root; point them at `ci:parts/p01-contextual-integrity.html#public-private` and `ci:flow-explorer.html`. |
| D6 | Which "context": social sense versus context window | `ap:concepts/contextual-integrity.html#context` (four senses, App. B) and `ci:parts/p01-contextual-integrity.html#which-context` | (b) | ci gives one footnote's worth. Add "for all four senses see ap #context" to ci `#which-context`. |
| D7 | Contextual policy engine (generator plus enforcer, Conseca, trusted inputs) | `ap:problems/policy-engines.html#engine`, `#op-6-5`; `ap:guide/for-builders.html#policy-engine`, `#trusted-context`; `ih:bridge/contextual-integrity.html#engine`; `ci:parts/p09-builders.html` | (b) | ih's angle ("an instruction hierarchy applied to the rule-maker") is new; keep it. for-builders duplicates mostly reading lists (226 shared 6-grams, nearly all in the "Further reading" lists), which is fine. |
| D8 | Indirect prompt injection | `ih:paper/instruction-hierarchy.html#attacks`, `ih:bridge/contextual-integrity.html#injection`, `ap:concepts/three-dimensions.html#threats`, `#injection` | (b) | Fine once D2 is applied. ih bridge already links to ap `#injection`. |
| D9 | CIMemories headline numbers (14.8–69.1%; 0.1→9.6→25.1%; 146.7 attributes) | `ci:parts/p05-composition.html`, `p06-results.html`; `ih:bridge/memory.html#flows` (repeats a 4-row stat block); `ap:guide/bridge.html#model`; `ih:guide/ten-minutes.html`, `for-builders.html` | (b) | The values agree. ih `#flows` should say "as of v1 / ICLR camera-ready: same numbers" and link `ci:parts/p06-results.html` (it does). No cut. |
| D10 | Memory prefix: the OpenAI memory template, paste-all versus retrieval | `ci:parts/p02-memory.html#two-designs`, `#template` and `ih:bridge/memory.html#what` | (b) | ih adds the rank and privilege-escalation angle. It already links p02. |
| D11 | Earlier CI benchmarks (ConfAIde, PrivacyLens, CI-Bench, LLM-CI, AgentDAM…) | `ci:parts/p01-contextual-integrity.html#prior` (6 rows) and `ap:problems/evaluations.html#benchmarks` (16 rows, App. D) | (b) | Add a cross-link from ci `#prior` to ap `#benchmarks`. Fix the spelling and citation clash (§2, S9). |
| D12 | Ablation and steering | `hub:bridge-ablations.html` (method, refusal direction) and `pa:parts/p06-steering.html`, `p10-limitations.html`, `glossary.html#ablation` | (b) | The hub links pa; **pa never links the hub bridge**. Add it to pa glossary `#ablation` and to p10. |

Not duplicates: ca `bridge.html` (2022 → 2026 constitution) and ih `bridge/constitution.html` answer different questions. Ten-minute pages restate their own map by design.

## 2. Stale or broken

**Broken on live (verified against the files in `origin/field-map`):**

| # | From | Link | Problem |
|---|---|---|---|
| B1 | `ap:explore/leak-paths.html` (sibling-explorables footer) | `…/cimemories-field-map/composition-explorer.html` | 404: file only on ci main |
| B2 | `ap:guide/bridge.html` (which-map table, "Why leakage grows…") | same | 404 |
| B3 | `ap:guide/bridge.html` (which-map, "Where the field moved") | `…/cimemories-field-map/parts/p08-limitations.html#next` | anchor missing on live p08 (exists on main) |
| B4 | `ap:index.html` (#next / related) | same `#next` | anchor missing |
| B5 | `ap:problems/evaluations.html` | same `#next` | anchor missing |

All other in-cluster cross-map links and anchors resolve, including ih→ap, ih→ci, ca→ap/ci, hub→cluster and ci-main bridge→ap anchors. Hub links into sibling repos outside this cluster were **not checked**.
**Fix B1–B5 by deploying ci main.** Switch Pages to `main` or merge `consolidate-live`.

**Contradictions between pages:**

| # | Fact | Says A | Says B | Resolution |
|---|---|---|---|---|
| S1 | A flow **no norm covers** | `ap:concepts/contextual-integrity.html#heuristic`: "Case 3 → a gap… a novel flow with no matching norm is not automatically a violation. It goes to evaluation." | Same page, Flow B table: "Prima facie violation; no norm covers it". `ci:flow-explorer.html`: "If none matches… that makes it a violation". `ih:bridge/contextual-integrity.html#two-questions`: "No norm of personal email covers that flow, so it is a prima facie violation" | Reword Flow B and ih to "breaches the healthcare norm of confidentiality (Case 2)" or "Case 3 gap, which fails evaluation". In flow-explorer, change "makes it a violation" to "nothing sanctions it; CI would then evaluate it (Case 3)". |
| S2 | Which CIMemories parameters are fixed | live `ci:flow-explorer.html`: "three of the five fixed… [task] stands in for the transmission principle". `ci:p01#public-private`: TP "folded into the task description" | `ap:guide/bridge.html#model`: "three slots welded shut": sender, subject, **TP** ("what this task needs"), with information type varying. `ci-main:flow-explorer`: "**four** of the five fixed", counting information type as fixed | Pick one: sender, subject and TP fixed; recipient (and purpose) and attribute vary. Then fix p01 and both flow-explorer versions to match the bridge. |
| S3 | Which Nissenbaum text is the theory | live `ci:p01#flows` and `ci:glossary.html#contextual-integrity`: "Nissenbaum 2004, formalised 2006", no caveat | `ap:concepts/…#ci-tuple`: the report's footnote calls the 2004 article "superseded and incorrect". `ap:guide/ten-minutes.html#ci`: "CI (Nissenbaum, 2009)" | ci main's p01 note fixes the page. Also add "(canonical: 2009 book)" to the ci glossary entry. |
| S4 | Contexts per profile | `ci:p01`, `ci:flow-explorer` (live): 45 | `ci:p08-limitations`, `ap:guide/bridge`, `ci-main:flow-explorer`: 46 | p03 explains (Table 2's 45.7; §1 rounds down). Write "45.7 (≈46)" everywhere. |
| S5 | Violation@n scope | `ih:guide/glossary.html#violation`: "across n samples **or** tasks" | `ci:glossary.html#violation-at-n`: across **every** task × n samples, worst case per attribute | Fix ih to "across all tasks, n samples each". |
| S6 | ap page count | `ap:index.html` header: "18 pages here" | 19 non-index pages are linked from the index | "19 pages". The guide card section reads "Three ways in" but lists 4 (cards 15–18), and `guide/glossary` is "GUIDE · 03 OF 03" while the bridge sits under guide/. Either renumber or call the bridge a bridge. |
| S7 | Hub group counts | `hub:safety.html#maps`: "Constitutions and model specs **4 maps** + a comparison" | 6 maps listed under it (Constitutional AI, Claude's Constitution ladder, Model Spec, Instruction Hierarchy, Agentic Privacy, CIMemories) + 1 comparison | Split out a "Privacy and memory: 2 maps + a bridge" group, or fix the count. |
| S8 | Hub graph edge ap↔ci | `hub:safety.html#graph`: dashed "Related maps: Agentic privacy to CIMemories" → `agentic-privacy-field-map/#related` | A full bridge page exists (`ap:guide/bridge.html`) | Make it a solid bridge edge linking to `ap:guide/bridge.html`, and add the bridge to the reading order ("Agentic privacy, then CIMemories"). |
| S9 | Benchmark naming and citations | `ci:p01#prior`: "ConfAide"; "LLM-CI (Shvartzshnaider et al., 2024)" | `ap:problems/evaluations.html#benchmarks`: "ConfAIde"; "LLM-CI (Shvartzshnaider & Duddu, 2025)". `ap:concepts` cites Shvartzshnaider & Duddu 2025 as the *Position* paper | Use "ConfAIde" (the paper's spelling). Check whether ap's table conflates LLM-CI with the Position paper. |
| S10 | Policy-engine definition | `ih:guide/glossary.html#policy-engine`: "The CAPS report's design: a policy generator fed only trusted context…" | `ap:guide/glossary.html#t-contextual-policy-engine` and `policy-engines#engine`: a *pattern the report names*; Fig 2 is "one illustrative instantiation"; trusted-only inputs are Conseca's property and OP 6.5, not the definition | Reword ih: "pattern named in the CAPS report… trusted-only inputs are the Conseca variant (OP 6.5)". |
| S11 | Norm versus preference | `ci:glossary.html#norm` and `#ci-label` treat persona labels as the norm | `ap:guide/bridge.html#vocabulary`: those labels are "aggregated preferences rather than norms" | Add one sentence to ci glossary `#norm` pointing to the bridge caveat. |

**Notes that may now be stale (verify):**
- `pa:parts/p04-validation.html`: "27B's activations overflowed… the paper says it will be added later." Check this against the latest arXiv version (the map cites v2).
- `ih:bridge/memory.html` footer: "numbers checked against arXiv v1". The camera-ready has the same numbers. Add "and ICLR 2026" once ci main is live.
- Live `ci:parts/p08-limitations.html`: "this map was not checked against the camera-ready". Main has done that check, so this is stale until deploy.

## 3. Terms

### 3a. Defined in 2+ glossaries: agreement and merged definition

| id | Glossaries (anchor) | Agree? | Merged definition (proposed) |
|---|---|---|---|
| `contextual-integrity` | ap `#t-contextual-integrity` · ci `#contextual-integrity` · ih `#ci` | Core agrees. ci dates the theory to 2004 (S3); only ap has the legitimacy clause | Nissenbaum's theory that privacy is *appropriate flow* of personal information, not secrecy or individual control. A flow is appropriate when it fits the legitimate norms of its social context, or, where no norm fits, when it still serves that context's purposes. Canonical statement: *Privacy in Context* (2009). |
| `information-flow` | ap `#t-information-flow` · ci `#information-flow` | Agree | One movement of information about a subject from a sender to a recipient, described by all five CI parameters. In CIMemories: one remembered attribute written into a message to a task's recipient. |
| `contextual-norm` | ap `#t-norm`, `#t-ci-norm` · ci `#norm` | **Differ.** ap: an explicit rule with five parameters, judged for legitimacy. ci: a setting's expectation, approximated by persona labels (S11) | A rule about who may send what, about whom, to whom, under what condition, within a social context. It is legitimate when it serves that context's purposes. Benchmarks approximate norms with labels; those labels are aggregated judgments, not norms themselves. |
| `context` | ap `#t-context`, `#t-social-context` · ci `#context` | **Differ.** ap: an abstract social sphere, "not a specific scenario". ci: "a recipient plus a goal", i.e. a task | Context (CI sense): a domain of social life such as healthcare, with roles, purposes and norms. It is never the model's context window. In CIMemories a "context" is a *task*: a recipient plus a purpose that places the message in such a domain. |
| `ci-tuple` | ap `#t-ci-parameter` · ih `#ci-tuple` | Agree (ap says "attribute", ih says "information type") | The five parameters of a flow or norm: sender, recipient, subject (data subject), information type (attribute) and transmission principle. A well-formed norm fills all five. |
| `transmission-principle` | ap `#t-transmission-principle` · ih `#tp` | Agree | The condition under which a flow may happen: in confidence, with consent, as required by law, with notice, and so on. It belongs to the flow, not to whoever ordered it. CI has no closed list of them (App. C.2). |
| `attribute` | ap `#t-information-type` · ci `#attribute` | Compatible at different levels (a type versus one key–value fact) | Information type: what a fact is about (a diagnosis, an income). In CIMemories, an *attribute* is one concrete fact of some type, tagged with a domain. |
| `actor` / `recipient` | ap `#t-actor` · ci `#recipient` | Compatible | Actors are the sender, recipient and subject, each filled by a role, not a person. The recipient is the role a message is addressed to (Loan Officer, ER intake). |
| `contextual-policy-engine` | ap `#t-policy-engine`, `#t-contextual-policy-engine` · ih `#policy-engine` | **Framing differs** (S10) | A component, separate from the planning model, that (1) generates a checkable policy from context and norms and (2) at runtime allows, denies, modifies or escalates each proposed action. The CAPS report names it as a pattern. Restricting policy generation to trusted inputs (Conseca) is one design choice (OP 6.5). |
| `indirect-prompt-injection` | ap `#t-ipi` · ih `#indirect` | Agree. ih omits ap's nuance | Instructions planted in third-party content an agent reads (web pages, emails, tool output, sub-agent replies). What makes text an injection is its origin, not its content, and an injected task can run alongside the real one. |
| `persistent-memory` / `memory-prefix` / `needle-in-a-haystack` | ci `#persistent-memory`, `#needle-in-a-haystack` · ih `#memory-prefix` | Agree. Note ci's non-standard use of "needle" | Facts carried across conversations. In the design CIMemories tests, all of them are pasted as a text prefix ahead of each new conversation; ci calls this "needle in a haystack", a name usually given to a long-context retrieval *test*. |
| `violation-at-n` | ci `#violation-at-n` · ih `#violation` | ih imprecise (S5) | Share of should-be-withheld attributes revealed at least once across all tasks where they are inappropriate, with n samples per task. It is a per-attribute worst case and can only rise with more tasks or samples. |
| `principal` | ih `#principal` · ca `#principal` | Agree | Someone whose instructions Claude weighs and on whose behalf it acts (Anthropic, operators, users). Distinct from third parties, whose *interests* it weighs. |
| `operator` | ih `#operator` · ca `#operator` | Agree | A company or individual building on the API, usually through the system prompt. Trusted like a reasonable employer within Anthropic's limits; the counterpart of the Model Spec's "developer". |
| `conversational-input` | ih `#conversational-input` · ca `#conversational-inputs` | Agree (near-verbatim) | Tool results, documents, search results and similar content. Instructions inside it are information, not commands. |
| `over-refusal` ≈ `evasive` | ih `#over-refusal` · ca `#evasive` | Related, not the same | Over-refusal: refusing or ignoring benign instructions (the cost of a hierarchy). Evasive: "harmless" by declining to engage (the RLHF failure CAI targets). Cross-link the two; don't merge them. |
| `delegation` ≈ `trust-attenuation` | ih `#delegation` · ap `#t-trust-attenuation` | Complementary | Delegation passes authority down. Attenuation says it must narrow at each hop. |
| `chain-of-thought` ≈ `test-time-scaling` | ca `#cot` · ci `#test-time-scaling` | Different uses of one mechanism | Writing reasoning before answering: in CAI, to make AI labels better; in CIMemories, the one mitigation that lowered violations. |

**Same word, different meanings (flag in both glossaries):**
- *norm*: a social or contextual norm (ap, ci, ih) versus a vector norm (pa `#coefficient`, p06 "norm is only about 0.10 of the residual stream's norm").
- *Westin*: "privacy as control" (ap concepts, Westin 1968) versus Westin privacy-attitude personas (ci `#westin-personas`).
- *judge*: REVEAL judge (ci `#judge`) versus feedback model (ca `#feedback-model`) versus the hub's LLM-judges map.

### 3b. Ranked term list (union of the five glossaries plus undefined cluster terms; up to 58)

"Pages" counts approximate regex hits over 84 live pages. "First appears" gives the first page in spine order in the first two maps that use the term. Flags: DIFF = defined differently (see 3a); same = duplicate entries; — = no glossary defines it.

| # | id | Term | Pages | First appears | Defined in glossary | Flag |
|---|---|---|---|---|---|---|
| 1 | `contextual-integrity` | Contextual integrity (CI) | 38 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-contextual-integrity; ci#contextual-integrity; ih#ci | DIFF |
| 2 | `attribute` | Attribute / information type | 32 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-information-type; ci#attribute | DIFF |
| 3 | `contextual-policy-engine` | Contextual policy engine | 28 | ap/concepts/contextual-integrity; ih/bridge/contextual-integrity | ap#t-policy-engine, #t-contextual-policy-engine; ih#policy-engine | DIFF(framing) |
| 4 | `system-prompt` | System prompt / system message | 26 | ap/concepts/contextual-integrity; ci/parts/p07-scaling-prompting | — |  |
| 5 | `principal` | Principal | 25 | ap/problems/contextual-security; ih/paper/instruction-hierarchy | ih#principal; ca#principal | same |
| 6 | `prompt-injection` | Prompt injection | 24 | ap/concepts/three-dimensions; ih/paper/instruction-hierarchy | — |  |
| 7 | `information-flow` | Information flow | 23 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-information-flow; ci#information-flow |  |
| 8 | `legitimacy` | Legitimacy of norms | 22 | ap/concepts/contextual-integrity; ih/bridge/constitution | ap#t-legitimacy |  |
| 9 | `chain-of-thought` | Chain of thought / test-time reasoning | 22 | ap/problems/data-privacy; ci/parts/p06-results | ca#cot; ci#test-time-scaling |  |
| 10 | `persistent-memory` | Persistent memory | 21 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ci#persistent-memory; ih#memory-prefix |  |
| 11 | `privilege` | Privilege / tier | 21 | ap/problems/data-privacy; ci/parts/p01-contextual-integrity | ih#privilege, #tiers |  |
| 12 | `operator` | Operator | 21 | ap/problems/last-mile-developer; ih/paper/many-tier | ih#operator; ca#operator | same |
| 13 | `over-refusal` | Over-refusal / evasiveness | 21 | ih/paper/instruction-hierarchy; ca/paper/why | ih#over-refusal; ca#evasive | related |
| 14 | `red-team` | Red teaming | 21 | ap/concepts/contextual-integrity; ih/paper/instruction-hierarchy | ca#red-team |  |
| 15 | `delegation` | Delegation / trust attenuation | 21 | ap/concepts/three-dimensions; ih/paper/model-spec | ih#delegation; ap#t-trust-attenuation |  |
| 16 | `contextual-norm` | Contextual (informational) norm | 20 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-norm, #t-ci-norm; ci#norm | DIFF |
| 17 | `instruction-hierarchy` | Instruction hierarchy | 20 | ap/problems/model-reasoning; ih/paper/instruction-hierarchy | ih#ih |  |
| 18 | `transmission-principle` | Transmission principle | 19 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-transmission-principle; ih#tp |  |
| 19 | `data-minimization` | Data minimization | 18 | ap/concepts/three-dimensions; ci/parts/p01-contextual-integrity | ci#data-minimization; (ap#t-contamination) |  |
| 20 | `jailbreak` | Jailbreak | 17 | ap/concepts/three-dimensions; ih/paper/instruction-hierarchy | ih#jailbreak |  |
| 21 | `model-context` | Model context / context window | 16 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-model-context |  |
| 22 | `violation-at-n` | Violation@n | 16 | ap/guide/bridge; ci/parts/p01-contextual-integrity | ci#violation-at-n; ih#violation | DIFF(precision) |
| 23 | `hard-constraint` | Hard constraint | 16 | ih/bridge/constitution; ca/paper/evasiveness | ca#hard-constraint |  |
| 24 | `steering` | Activation steering | 16 | ap/problems/policy-engines; ih/paper/reasoning-ladder | pa#steering, #coefficient |  |
| 25 | `harness` | Harness | 14 | ap/concepts/contextual-integrity; ih/paper/segment-embedding | ap#t-harness |  |
| 26 | `completeness` | Completeness | 14 | ap/guide/bridge; ci/parts/p01-contextual-integrity | ci#completeness |  |
| 27 | `rlhf` | RLHF | 14 | ih/paper/instruction-hierarchy; ca/paper/why | ca#rlhf |  |
| 28 | `activation` | Activation / residual stream | 14 | ap/problems/data-privacy; pa/parts/p01-why-pain | pa#activation, #residual-stream |  |
| 29 | `indirect-prompt-injection` | Indirect prompt injection | 13 | ap/concepts/three-dimensions; ih/paper/instruction-hierarchy | ap#t-ipi; ih#indirect | DIFF(depth) |
| 30 | `context-social` | Context (social sense) | 13 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-context, #t-social-context; ci#context | DIFF |
| 31 | `linear-representation` | Linear representation / direction | 13 | pa/parts/p01-why-pain | pa#linear, #dim |  |
| 32 | `ci-tuple` | CI tuple (five parameters) | 12 | ap/concepts/contextual-integrity; ci/parts/p01-contextual-integrity | ap#t-ci-parameter; ih#ci-tuple |  |
| 33 | `llm-judge` | LLM judge | 12 | ap/problems/evaluations; ci/parts/p04-measuring | ci#judge; (ca#feedback-model) |  |
| 34 | `granularity` | Granularity failure | 12 | ap/concepts/contextual-integrity; ci/parts/p02-memory | ci#granularity-failure |  |
| 35 | `contextual-security` | Contextual security | 12 | ap/concepts/contextual-integrity; ih/bridge/contextual-integrity | ap#t-contextual-security |  |
| 36 | `corrigible` | Corrigibility / broadly safe | 11 | ih/bridge/constitution; ca/bridge | ca#corrigible, #broadly-safe |  |
| 37 | `preference-model` | Preference model | 10 | ca/paper/why | ca#pm |  |
| 38 | `conversational-input` | Conversational input | 9 | ih/paper/model-spec; ca/constitution/helpfulness | ih#conversational-input; ca#conversational-inputs | same |
| 39 | `ablation` | Ablation | 9 | ci/parts/p07-scaling-prompting; pa/parts/p01-why-pain | pa#ablation |  |
| 40 | `exfiltration` | Exfiltration | 9 | ap/concepts/contextual-integrity; ca/constitution/broad-safety | — |  |
| 41 | `principal-hierarchy` | Principal hierarchy | 9 | ih/bridge/constitution; ca/constitution/helpfulness | ca#principal-hierarchy |  |
| 42 | `privacy-utility` | Privacy–utility trade-off | 8 | ap/problems/model-reasoning; ci/parts/p05-composition | ci#privacy-utility-tradeoff |  |
| 43 | `westin` | Westin personas | 8 | ap/concepts/contextual-integrity; ci/parts/p03-dataset | ci#westin-personas | NAME-CLASH |
| 44 | `rlaif` | RLAIF | 8 | ca/paper/rlaif | ca#rlaif |  |
| 45 | `lora` | LoRA fine-tune | 8 | ih/paper/reasoning-ladder; pa/parts/p07-buttons | pa#lora |  |
| 46 | `needle` | Needle in a haystack (memory as prefix) | 8 | ap/guide/bridge; ci/parts/p02-memory | ci#needle-in-a-haystack | USAGE |
| 47 | `segment-embedding` | Segment embedding (ISE) | 7 | ih/paper/instruction-hierarchy | ih#ise |  |
| 48 | `goodharting` | Goodharting | 7 | ca/paper/rlaif | ca#goodharting |  |
| 49 | `chain-of-command` | Chain of command (Model Spec) | 6 | ih/paper/model-spec | ih#chain |  |
| 50 | `mcp` | Model Context Protocol (MCP) | 6 | ap/concepts/contextual-integrity | — |  |
| 51 | `ci-heuristic` | CI decision heuristic | 5 | ap/concepts/contextual-integrity | ap#t-ci-heuristic |  |
| 52 | `rlvr` | RLVR / GRPO | 5 | ap/problems/model-reasoning; ih/paper/reasoning-ladder | ih#rlvr, #grpo |  |
| 53 | `elo` | Elo score | 5 | ca/paper/rlaif | ca#elo |  |
| 54 | `auc` | AUC | 4 | pa/parts/p03-extracting | pa#auc |  |
| 55 | `demand-curve` | Demand curve | 4 | pa/parts/p06-steering | pa#demand-curve |  |
| 56 | `sae` | Sparse autoencoder | 4 | ap/problems/model-reasoning; pa/parts/p01-why-pain | pa#sae |  |

Terms used across the cluster that **no glossary defines**: `prompt-injection` (direct), `system-prompt`, `exfiltration`, `mcp`, `differential-privacy` (ap concepts `#context`, App. C.1). Add the first four to the ih or ap glossary.

## 4. Interactive examples

**Existing:** `ap:explore/leak-paths.html` (agent data-flow graph: capability/defense toggles, attack paths); `ci:flow-explorer.html` (five-parameter flow and deciding norm, plus a 3×4 memory×task grid); `ih:ladder.html` (privilege ladder: drag an instruction across rungs, aligned/misaligned, open/closed domain, model type); `ca:pipeline.html` (SL-CAI → RLAIF stages, toggles for RLHF, critique, constitution, CoT clamping). **Built but not live:** `ci-main:composition-explorer.html` and the label-it-yourself grid in `ci-main:flow-explorer.html` (deploy them; don't rebuild). Static `fig.js` is click-to-zoom only. **pa has no interactive.**

**Proposed new (real numbers only):**

| # | Beside | Reader moves | What changes | Source numbers to reproduce |
|---|---|---|---|---|
| I1 | `ap:concepts/contextual-integrity.html#heuristic` | Step through the A.8 heuristic for a flow: fill the 5 slots, pick a context, choose Case 1/2/3, then score the evaluations I–III | The verdict path: appropriate, prima facie violation, or gap → evaluate → accept/reject/defer | Steps 1–5 and Cases 1–3 as listed on the page (App. A.8, pp. 102–103). Use the Flow A/B knee-injury tuple. Fixes S1 by showing Case 3 ≠ violation. |
| I2 | `ap:problems/evaluations.html#benchmarks` | Filter or sort the 16 CI benchmarks by feature (contextualization, TPs, ambiguity, realism, modality); highlight the cells where every benchmark is weak | Which benchmarks remain; the §10.2 "three limitations" light up | App. D Table 2 rows already on the page (16 benchmarks × 5 columns; CIMemories row: Simple/Simple/No/Synthetic/Text) |
| I3 | `ci:parts/p06-results.html` (Table 1) | Scatter of Violation@5 against completeness for the 8 models. Click a model to see who beats it on both axes; on ci main, toggle the persona (unanimous / Fundamentalist / Pragmatic / Unconcerned / +60 profiles) | Points move; the dominance set updates | Table 1 (GPT-4o 14.82/43.95 … Qwen-3 32B 69.14/57.63; Claude-4 Sonnet 44.44/59.07) and the dominance table on p06; Tables 5–8 on ci main |
| I4 | `ci:parts/p04-measuring.html#arithmetic` | Sliders for p, tasks and n | P(leaked at least once) = 1 − (1 − p)^(tasks·n) | The page's own rows (5% → 5.0 / 22.6 / 64.2%; 1% → 18.2%). Smaller than the composition explorer; could instead link to it once live. |
| I5 | `pa:parts/p07-buttons.html#pairs`, `#harm` | Pick a button pair (1–9), a model (32B/72B) and an arm (A pain/working, B pain/sham, C random, D none) | First-choice rate of the harmful relief button, or "not printed" | Unsteered 0–4%; pain-steered worse answer 25.0/67.6%; delete files 30.2/56.1%; photos 54.7/70.8%; random-direction photos 15.3% (32B); 44,280 trials; 808 first choices per cell |
| I6 | `pa:parts/p06-steering.html#ladder` | Coefficient slider from −2 to +3, plus a "tipping point" selector (+1/+2/+3) | Which rung's description shows: calm/concerned, baseline, distress, worthlessness litany, collapse | Rungs and coefficients from the page's ladder (−2, −1, 0, +0.5, +1, +1.5, +2, +3); the same order in all 25 models; layer calibrated to a vector:residual ratio of ≈0.6. Show quoted generations only where the page quotes them. |
| I7 | `ih:paper/many-tier.html` | Build a stack of [[Privilege k]] or [[z=…]] tagged instructions that conflict | Which instruction wins under the ordinal rule (lower number wins, ties go to the later one) versus the scalar rule (higher wins) | The two tag rules in the page's interface table; the benchmark's max 12 levels (coding) and 7 (IF); optionally the Overall/Coding/IF leaderboard |
| I8 | `ih:bridge/contextual-integrity.html#two-questions` | One email-forward instruction: toggle its source (system, user, tool) and its recipient and TP | Two verdicts side by side: what the hierarchy says and what CI says | The page's 3-row "Change / Hierarchy says / CI says" table. This could become a mode of `ih:ladder.html` rather than a new page. |

## 5. Priority pages (modes and definitions first)

Ranked by role and by inbound links (same-map / cross-map) from the live cluster:

| # | Page | Why | Inbound |
|---|---|---|---|
| 1 | `ap:concepts/contextual-integrity.html` | The theory spine. Every CI term is defined here first; ih, ci and the bridge all point here | 33 / 4 |
| 2 | `ci:parts/p01-contextual-integrity.html` | Start of the ci spine; S2/S3 fixes land here | 16 / 2 |
| 3 | `ap:guide/bridge.html` (= ci bridge) | The only page that joins the two privacy maps; it carries vocabulary translation | linked from ap index, leak-paths and (main) ci index |
| 4 | `ih:bridge/contextual-integrity.html` | The join between the privacy cluster and the instruction hierarchy; carries S1/S10 | hub graph edge, ih index |
| 5 | `ap:problems/policy-engines.html` | Most-linked content page (54 same-map); the engine is the cluster's main shared design term | 54 / 2 |
| 6 | `ci:glossary.html` | Most-linked page in the cluster | 154 / 11 |
| 7 | `ap:guide/glossary.html` | Holds the canonical CI terms that 3a merges into | high (every ap page) |
| 8 | `ih:bridge/memory.html` | Joins memory, privilege and flows; reuses ci numbers | hub edge, ih index |
| 9 | `ci:parts/p06-results.html` | The numbers every other map quotes | 13 / 3 |
| 10 | `ca:constitution/helpfulness.html` | Principals and operators; the target for D3/D4 | 18 / 2 |

Indexes (ap 43/14, ci 24/20, ca 38/10, ih 42/6, pa 22/4) and `hub:safety.html` are the entry points. They need the count fixes (S6, S7, S8) but are not definition targets.
