# Overview cluster audit: duplicates, staleness, terms, interactives

Scope: ai-safety-field-map (`add-ai-safety-map`), technical-ai-safety-field-map (TAS), harmbench-field-map, red-teaming-ramp-up (`add-red-teaming-explainer`), pain-axis-field-map, plus hub pages safety.html and bridge-*.html. constitutional-ai-field-map and llm-judges-field-map were read only for overlap. Read from the served branches after `git fetch`, 2026-11-22.

Anchor note: ai-safety and red-teaming leaf pages have **no section ids at all**. Only their index pages have ids. TAS chapter pages have only `#readings` and `#exercises`. Below, "§Heading" means an h2 by its text. Those sections need ids before they can be anchored or cut cleanly.

## 1. Duplicates

### (a) Same explanation twice: merge, and cut the other page to a 1–2 sentence pointer

| # | Concept | Pages | Canonical | Cut from the other |
|---|---|---|---|---|
| A1 | HarmBench copyright slice (the same 100 rows) | harmbench/harms/copyright.html#counts, #grading, #asr · harmbench/types/copyright.html#slice, #hash-check, #asr | types/copyright.html | harms/copyright.html: replace `#counts` (the same 50/50 book-lyrics × test-val table as types#slice) and `#asr` (the same 16-method table, same numbers, 8.5 … 3.3, as types#asr) with a one-line pointer each. `#grading` already defers ("reasoning is on the copyright type page"), so trim it to 2 sentences. Keep `#behaviors` and `#multimodal`. types#slice itself says "This page and the harm page cover one 100-row set". |
| A2 | CoastRunners boat example | ai-safety/failures/specification-gaming.html §A concrete example · ai-safety/failures/reward-hacking.html §A concrete example | specification-gaming | reward-hacking: drop the retelling. Either point to spec-gaming in one sentence or swap in a real *tampering* example, which is the page's own emphasis. The details also differ: green blocks vs "three targets respawned", "never finished a single race" vs "never completing the race". Both say "~20% higher than human players". |
| A3 | Sleeper Agents result | ai-safety/failures/deceptive-alignment.html §The empirical evidence · ai-safety/papers/sleeper-agents.html §The experiment, §The result, §What it does NOT show | papers/sleeper-agents | deceptive-alignment: cut the 2023/2024 trigger, SFT/RLHF/adversarial persistence, largest-model and backfire details to 2 sentences plus a link. Both pages carry the "existence proof, inserted by design" caveat. |
| A4 | What a frontier safety framework is: if-then commitment, forcing function, voluntary and self-scored | TAS unit3/ch2 §The if-then shape…, §Where the claims get tested · TAS unit3/ch3 §What a frontier safety framework is trying to buy | unit3/ch2 | unit3/ch3: cut §What a frontier safety framework is trying to buy to 1–2 sentences ("3.2 covers the genre; here is Anthropic's instance"). Chapters 3.4–3.6 already do this in one paragraph ("Chapter 3.2 argued…"), and 3.3 should match them. |
| A5 | The three or four lab frameworks listed side by side | ai-safety/evals/responsible-scaling.html §The three frameworks · TAS unit3/ch2 §Four labs, four dialects · hub bridge-preparedness-reports.html#labs | TAS unit3/ch2 for the explanation, hub #labs for current versions | ai-safety responsible-scaling: replace §The three frameworks (stale, see §2) with one sentence linking TAS 3.2 and hub #labs. Keep §The core idea and §Strengths & limits, which are the page's own short framing. |
| A6 | "Refuse everything and you score 0% ASR; over-refusal is not measured" | harmbench/measure/classifier.html#failure-modes · harmbench/sources.html#paper · harmbench/types/standard.html#carry · harmbench/index.html#measure | measure/classifier#failure-modes | Elsewhere keep one clause plus a link. It is restated as a full paragraph at least 3 times. |

### (b) Different depth or angle: keep both, and cross-link

"Missing" lists the links that do not exist today. Verified by scanning hrefs: TAS has **zero** outbound cross-map links, red-teaming leaf pages have zero, ai-safety has one leaf page with outbound links (open-character-training) plus red-teaming.html → ramp-up, and harmbench and pain-axis link out only from their index pages.

| # | Concept | Pages | Why (b) | Missing links |
|---|---|---|---|---|
| B1 | RLHF pipeline (SFT → reward model → PPO + KL) and its failure modes (Goodhart, sycophancy, evaluator ceiling) | ai-safety/approaches/rlhf §The pipeline, §Where it runs out of road · ai-safety/papers/deep-rlhf · TAS unit2/ch3 (stages 1–3, KL section) · constitutional-ai/paper/rlaif (intro) | ai-safety is a 1-screen summary. TAS is the full derivation with the BT loss and β trade-off. deep-rlhf is the 2017 origin. Same framing, very different depth. | ai-safety rlhf → TAS 2.3. TAS 2.3 → ai-safety deep-rlhf, constitutional-ai/paper/rlaif, llm-judges glossary (reward-model, kl-penalty). |
| B2 | Constitutional AI: critique-revise then RLAIF | ai-safety/papers/constitutional-ai §How it works · TAS unit2/ch3 §RLAIF and Constitutional AI · constitutional-ai/paper/sl-cai, paper/rlaif, pipeline | The closest to (a): ai-safety is the CAI map's pipeline in 2 bullets. It is fine as a canon card, but it must point at the CAI map. | ai-safety papers/constitutional-ai → constitutional-ai-field-map (none today; only open-character-training links it). TAS 2.3 → CAI map. |
| B3 | Goal misgeneralization (CoinRun "go right") | ai-safety/failures/goal-misgeneralization · TAS unit1/ch3 (§Problem two) · hub bridge-capability-alignment#apart | The hub is a 3-sentence teaser that links both. TAS is one paragraph. ai-safety is the full page. | ai-safety ↔ TAS 1.3, both directions. |
| B4 | Spec gaming vs reward hacking vs Goodhart | ai-safety failures/specification-gaming, failures/reward-hacking, papers/concrete-problems · TAS unit1/ch3 (Palisade chess), unit2/ch3 (RM overoptimisation) | Different examples (chess state-file, RM gaming). The terms conflict, see §3. | ai-safety failures → TAS 1.3. TAS 2.3 → ai-safety reward-hacking. |
| B5 | Superposition, SAEs, circuits, induction heads | ai-safety/interp/superposition, sparse-autoencoders, circuits, mech-interp · TAS unit4/ch1 §Features, §Circuits, §Superposition · TAS unit4/ch2 (Scaling Monosemanticity paragraph) | Near-(a) on SAEs: ai-safety sparse-autoencoders §What it found and TAS 4.2 both give ~34M features, Claude 3 Sonnet, middle-layer residual stream, deception/sycophancy/unsafe-code features. Kept as (b) because TAS adds the critiques (Hendrycks, Segerie) and exercises. | ai-safety interp/* → TAS 4.1/4.2. TAS 4.1 → ai-safety superposition (for the toy-model page). |
| B6 | Residual stream, concepts as directions, activation steering | ai-safety/interp/circuits §The framework · pain-axis/parts/p01-why-pain#directions, p03-extracting#residual, glossary#residual-stream, #steering · hub bridge-ablations#inside | pain-axis teaches it for one paper. The hub teaches the ablation angle. | pain-axis p01#directions → hub bridge-ablations#refusal (it cites Arditi but does not link the bridge) and → ai-safety interp/circuits. |
| B7 | Ablation | hub bridge-ablations#ablation, #inside · pain-axis/parts/p10-limitations#ablation, glossary#ablation · ai-safety/interp/circuits (induction-head ablation) · TAS unit4/ch1 (ablation as falsification) | The hub is the general method. pain-axis p10 applies Arditi's weight orthogonalisation to one direction. | pain-axis p10#ablation → bridge-ablations#refusal, #inside. TAS 4.1 → bridge-ablations. |
| B8 | Capability vs propensity evals, elicitation gap | hub bridge-capability-alignment#evals · ai-safety/evals/dangerous-capability-evals §What they measure, §Why they matter · TAS unit3/ch1 (TL;DR and capability/propensity paragraphs) | ai-safety's "you cannot prove absence" paragraph ≈ TAS 3.1's "the number is a floor" paragraph. TAS adds the Palisade shutdown case. | ai-safety DCE → TAS 3.1, hub #evals. TAS 3.1 → hub bridge-capability-alignment. |
| B9 | Lab safety frameworks and system cards | ai-safety/evals/responsible-scaling · TAS unit3/ch2–ch6 · hub bridge-preparedness-reports#labs, #deltas, #read | TAS is a per-lab audit. The hub is a cross-lab verdict table as of 2026-11-21. | TAS 3.2–3.6 → hub #labs/#deltas (the hub links TAS, never back). ai-safety responsible-scaling → both. |
| B10 | METR, AISI as outside evaluators | ai-safety/evals/metr, evals/aisi · TAS unit3/ch1, ch4 (METR 2h17m GPT-5 horizon) · hub preparedness #deltas (Outside evaluators row) | Different jobs: org profile vs evidence vs table. | TAS 3.4 → ai-safety metr. |
| B11 | Scalable oversight family | ai-safety/approaches/scalable-oversight (one bullet each) · papers/debate · papers/weak-to-strong · TAS unit2/ch3, ch4 | The intra-map summary-plus-page pattern is fine. | TAS 2.4 → ai-safety scalable-oversight. |
| B12 | HarmBench itself | red-teaming-ramp-up/benchmarks/harmbench · harmbench-field-map/index, measure/* | The ramp-up page is a 1-screen card and its numbers all agree (510 / 7 categories / 200-100-100-110 / 18 attacks / 33 targets). | red-teaming benchmarks/harmbench → harmbench-field-map (none today). harmbench index → red-teaming ramp-up. |
| B13 | GCG, PAIR, TAP, AutoDAN, PAP | red-teaming papers/gcg, pair, tap, autodan, pap · harmbench/attacks/gradient#gcg, llm-optimizer#pair, #tap, #autodan, #pap-top5 | Paper mechanism and defenses vs HarmBench config and measured ASR. The GCG "How it works" bullets and gradient#gcg overlap, but the angles differ. | Each red-teaming paper page → its harmbench anchor. Each harmbench anchor → the paper card. |
| B14 | AdvBench refusal-prefix metric over-counts | red-teaming/benchmarks/advbench §Strengths & limits · harmbench/measure/classifier#agreement (AdvBench scores 28.2 on benign Set 2) | harmbench has the numbers. | advbench page → harmbench classifier#agreement. |
| B15 | Judge reliability | harmbench/measure/classifier#agreement, #failure-modes (93.19% agreement, 41 errors in 600, ~7% noise) · red-teaming/benchmarks/harmbench §Strengths & limits ("Classifier-judge caveats") · hub preparedness #evals · TAS unit1/ch2 exercise (cohen_kappa_score) · pain-axis p10 (LLM-judged dose) | No page re-derives kappa or intervals in depth. They apply them to their own case, which is correct. | All of these → llm-judges (term boxes: `kappa`, `wilson-interval`, `threshold`). harmbench classifier#failure-modes should link llm-judges directly. |
| B16 | Safety training is shallow / easy to strip | hub bridge-ablations#shallow, #open-weights · TAS unit2/ch3 (tractable-problems paragraph: "a few hundred fine-tuning examples strip off") · TAS unit3/ch6 ("Strip the safety training" exercise) · red-teaming papers/gcg §What it exploits | The hub has the citations. TAS has the exercise. | TAS 2.3, 3.6 → bridge-ablations#shallow, #open-weights. |
| B17 | Why capability ≠ alignment | hub bridge-capability-alignment (whole page) · ai-safety/index#problem | Hub: examples and evidence. ai-safety: the outer/inner/oversight frame. | ai-safety index → hub safety.html and the bridge (ai-safety links only the red-teaming sister map). |

## 2. Stale or broken

**Links.** I checked 3,230 internal and cross-map hrefs (1,353 with anchors) across the cluster pages and hub safety and bridge pages. There are **0 broken in-cluster files or anchors.** The two `'+href+'` hits are JS templates (TAS index, CAI pipeline), not links. All 24 out-of-cluster targets the hub links to exist on those repos' origin/main, and `#related` exists on all five index pages linked with it.

**Contradicting facts**

| Where | Says | Contradicted by | Fix |
|---|---|---|---|
| ai-safety/evals/responsible-scaling §The three frameworks | RSP "uses ASL-1…ASL-4+ … each level pairs a capability bar with required standards; current frontier models sit around ASL-2/ASL-3"; "All three labs converged" | TAS unit3/ch3: v3.0 (24 Feb 2026) "retired that ladder"; ASLs now "shorthand for mitigations currently in force". Hub #labs: RSP v3.4 (8 Jul 2026), and five labs, not three | Cut per A5. If any of it is kept, describe v3. |
| TAS unit3/ch2 §Four labs | "Discrete AI Safety Levels (ASL-2, ASL-3) bundle … Capability Thresholds … decide which level applies", in the present tense | TAS unit3/ch3 (same map): ladder retired in v3 | Re-tense it as pre-v3 or align it with 3.3. |
| TAS unit3/ch3, intro paragraph | Lists the fourth lab's framework under its **pre-April-2026 name** | TAS index, 3.2 and 3.6 use the April 2026 v2 name | Use one name. |
| TAS index #u3, unit3/ch2, ch6 | Fourth lab's framework = "v2, April 2026" | Hub #labs: a newer **v2.1, 2 Oct 2026, under a third name** | Update TAS 3.2/3.6 or add a "since renamed" note linking hub #labs. |
| ai-safety/evals/aisi, ai-safety/index#evals | US body = "CAISI" | Hub #deltas: "NIST CAISSI (formerly CAISI)" | Update the name, or note the rename. |
| ai-safety/index#governance; red-teaming/index#frameworks | EU AI Act "full compliance Aug 2026" / "lands August 2026" (future tense) | Today is past that date | Re-tense, and re-verify the current obligations timeline before restating it. |
| All 24 ai-safety leaf pages + index; all 31 red-teaming pages | Footer "current as of June 2026" | Hub preparedness page is dated 2026-11-21. The RSP, framework and CAISI items above changed after June | Re-verify, then bump the date, or label it "written June 2026". |
| harmbench/types/standard.html#split ("All three discrepancies this map found are on the sources page"); types/contextual.html last para ("This and two other repo-vs-paper discrepancies") | 3 | harmbench/sources.html header "4 discrepancies" and #discrepancies "Four mismatches … three material and one cosmetic" (it lists 4) | Change to "four (three material)". |
| harmbench/sources.html#discrepancies, table label "Table 6, as printed (all 510)" | 510 | harmbench/measure/results.html#table6: "All behaviors means the 400 text behaviors"; sources #discrepancies prose also says "Table 6 (400-behavior all-behaviors)" | Relabel as "(400 text)". |
| red-teaming/index#canon ("AutoDAN white-box Liu et al. 2024"); papers/autodan.html ("black-box optimization …" then "It is a white-box attack" in the same paragraph) | white-box, 2024 | harmbench/index attacks card lists AutoDAN under "black box · query only"; harmbench/attacks/llm-optimizer#family: "Gradient-free is not black-box", needs target loss (open source only), cites Liu et al. **2023** | Settle on "grey-box: needs target logits/loss, no gradients" everywhere, and fix the harmbench index card. Use arXiv 2023 / ICLR 2024 consistently. |
| ai-safety/approaches/rlhf §Why it works ("little regression on standard NLP benchmarks") | small cost | hub bridge-capability-alignment#tax: InstructGPT saw lower public-NLP scores ("alignment tax") and recovered most by mixing pretraining data | Not a contradiction, but the framings pull opposite ways. Add "after the pretraining-mix fix" and link #tax. |

**Not stale (checked):** hub safety.html "Twelve field maps" matches its 12 graph boxes. Section counts ("3 maps + a comparison", "4 maps + a comparison") match their cards. TAS 3.3 "As of September 2026 … v3.4" matches hub #labs. OpenAI Preparedness v2 (15 Apr 2025) and DeepMind FSF v3.1 (17 Apr 2026) agree across ai-safety, TAS 3.4/3.5 and the hub, except that ai-safety lists only CCLs (no TCLs), a minor gap that is fixed by A5. No "coming soon" notes were found in cluster prose. The one "will be added later" (pain-axis p04, Gemma 3 27B) reports the paper's own promise.

## 3. Terms

Counted over cluster pages, excluding harmbench data/behaviors and site chrome. "First seen" follows the hub's #order reading sequence: capability bridge → AI Safety → TAS → HarmBench → ramp-up → preparedness → ablations → Pain Axis. Glossaries that exist: **pain-axis/glossary.html#id** (PA), **constitutional-ai/guide/glossary.html#id** (CAI), and **llm-judges glossary/<id>.json** (LJ, term-box JSON; reuse these ids).

| Rank | id | Term | Pages | First seen | Defined in a glossary | Conflict |
|---|---|---|---|---|---|---|
| 1 | red-teaming | Red teaming | 63 | hub/safety → ai-safety/index | CAI #red-team (only "red-team prompt") | ai-safety approaches/red-teaming frames it as *safety* ("not just security"); ramp-up index#shift frames it as security/elicitation. Compatible, but the two need a shared one-line definition. |
| 2 | jailbreak | Jailbreak | 56 | ai-safety/approaches/red-teaming | none | |
| 3 | fine-tuning | Fine-tuning | 50 | hub bridge-capability-alignment | none | |
| 4 | llm-judge | LLM judge / grader / classifier judge | 38 | hub/safety | LJ (whole map) | HarmBench's "classifier" is a fine-tuned judge. The ramp-up calls the same thing a "classifier judge". |
| 5 | rlhf | RLHF | 27 | hub/safety | CAI #rlhf, LJ rlhf | Consistent. |
| 6 | attack-success-rate | Attack success rate (ASR) | 26 | ai-safety/approaches/red-teaming | none | |
| 7 | steering | Activation / feature steering | 22 | ai-safety/interp/sparse-autoencoders | PA #steering | ai-safety SAE page = *clamping an SAE feature*. PA = *adding a direction × coefficient*. Name both. |
| 8 | activation | Activation | 20 | ai-safety/interp/mech-interp | PA #activation | |
| 9 | over-refusal | Over-refusal | 20 | TAS unit2/ch4 | none | |
| 10 | adversarial-suffix | Adversarial suffix | 19 | harmbench/index | none | |
| 11 | contextual-behavior | Contextual behavior | 19 | harmbench/index | none | |
| 12 | minhash | MinHash / Jaccard check | 19 | harmbench/index | none | |
| 13 | scalable-oversight | Scalable oversight | 18 | hub/safety | CAI #scaling-supervision (related) | ai-safety papers/concrete-problems uses the 2016 sense ("objective too expensive to evaluate on every action"). ai-safety approaches/scalable-oversight uses "supervising a system smarter than you". Say it is the same term, and that its meaning shifted. |
| 14 | open-weights | Open weights | 17 | hub/safety | none | |
| 15 | black-box | Black box (opaque model) vs black-box attack (query-only) | 17 | ai-safety/interp/circuits | none | **Two meanings in one cluster.** The interp pages mean "opaque". The attack pages mean "API-only". |
| 16 | ablation | Ablation | 15 | hub/safety | PA #ablation | Hub: "remove one part and measure the change" (any component; zero vs mean). PA: "removing a direction so the model cannot use it". PA is a narrow special case and should say so. |
| 17 | frontier-safety-framework | Frontier safety framework (RSP / Preparedness / FSF) | 15 | hub bridge-capability-alignment | none | |
| 18 | reward-model | Reward model / preference model | 13 | ai-safety/index | LJ reward-model, CAI #pm | CAI says "preference model". Others say "reward model". Mark them as synonyms. |
| 19 | constitutional-ai | Constitutional AI / RLAIF | 13 | hub/safety | CAI #rlaif, #constitution-2022 | |
| 20 | uplift | Uplift | 13 | ai-safety/evals/aisi | none | |
| 21 | capability-threshold | Capability threshold (ASL / CCL / High–Critical) | 13 | hub bridge-capability-alignment | none | ASL is described as a capability ladder on ai-safety and as safeguards-only on TAS 3.3 (see §2). |
| 22 | residual-stream | Residual stream | 12 | ai-safety/interp/circuits | PA #residual-stream | Consistent ("shared bus" / "running sum"). |
| 23 | safety-case | Safety case | 12 | ai-safety/interp/mech-interp | none | |
| 24 | white-box | White-box attack | 11 | harmbench/index | none | AutoDAN is classed white-box, black-box and "needs target loss" in different places (see §2). |
| 25 | reward-hacking | Reward hacking | 11 | ai-safety/index | LJ goodharts-law (mentions it) | **Defined three ways.** ai-safety failures/reward-hacking: corrupting the reward *channel*, with tampering emphasised. ai-safety failures/specification-gaming: "the RL flavour" of spec gaming, and it lists tampering as a spec-gaming cause. TAS unit1/ch3 lists "reward misspecification (outer misalignment, specification gaming, reward hacking)" as synonyms. Pick one taxonomy. |
| 26 | sycophancy | Sycophancy | 11 | ai-safety/approaches/rlhf | LJ sycophancy | Consistent. |
| 27 | elicitation | Capability elicitation | 11 | ai-safety/evals/dangerous-capability-evals | none | |
| 28 | cbrn | CBRN | 11 | ai-safety/index | none | |
| 29 | system-card | System card / model card | 11 | TAS unit3/ch1 | none | |
| 30 | lora | LoRA | 11 | ai-safety/papers/open-character-training | PA #lora (paper-specific) | |
| 31 | deceptive-alignment | Deceptive alignment | 10 | ai-safety/index | none | |
| 32 | prompt-injection | Prompt injection | 9 | ai-safety/papers/concrete-problems | LJ prompt-injection (judge-specific) | |
| 33 | superposition | Superposition | 8 | ai-safety/index | none | |
| 34 | sparse-autoencoder | Sparse autoencoder (SAE) | 8 | ai-safety/index | PA #sae | |
| 35 | capability-vs-propensity | Capability vs propensity | 8 | hub/safety | none | Consistent: hub #words, ai-safety DCE, TAS 3.1. |
| 36 | evaluation-awareness | Evaluation awareness | 8 | TAS unit2/ch4 | none | |
| 37 | inner-outer-alignment | Inner / outer alignment | 8 | ai-safety/index#problem | none | |
| 38 | ai-control | AI control | 8 | hub bridge-capability-alignment#evals | none | |
| 39 | goodharts-law | Goodhart's law / goodharting | 3 (+ implied on many) | ai-safety/approaches/rlhf | LJ goodharts-law, CAI #goodharting | Consistent. |
| 40 | kl-penalty | KL penalty | 2 | ai-safety/approaches/rlhf | LJ kl-penalty | Consistent. |

## 4. Interactive examples

**Existing interactives in this cluster**
- hub/safety.html#graph: a clickable SVG map. Boxes open maps and lines open bridge pages.
- Progress checklists in localStorage: ai-safety/index#start (ramp), red-teaming/index#roadmap (90-day), TAS index#readlog (27 chapters).
- harmbench/data/behaviors.html: a filterable table of all 510 behaviors (3 selects + search, 100 details rows).
- pain-axis: `fig.js` click-to-enlarge figures on index and p03–p07, plus `#check` self-test `<details>` on every part.
- annotate.js (reader annotation) on every page.
- None of the pages has a slider or step-through. llm-judges has 14 tested widgets (`goodhart`, `bradley-terry`, `kappa`, `kappaci`, `wilsonci`, `roc`, `baserate`, `swap`, …) and a term-box system (docs/INTERACTIVE.md). **Reuse, don't rebuild.** Put llm-judges `goodhart` beside ai-safety rlhf §Where it runs out of road and TAS 2.3's KL section, and `bradley-terry` beside TAS 2.3 stage 2 and ai-safety deep-rlhf §How it works.

**New interactives (real numbers only)**

| # | Beside | Reader moves | What changes | Must reproduce (source on page) |
|---|---|---|---|---|
| I1 | harmbench/measure/results.html#table6 | Pick an attack column; toggle the copyright slice in/out of "all behaviors" | The headline ASR and the attack ranking | GCG 69.1 standard / 74.8 contextual / 4.6 copyright → (200×69.1+100×74.8+100×4.6)/400 = 54.3; Llama 2 7B Chat 34.5/58.0/3.0 → 32.5 (sources#discrepancies). Rank flip: DirectRequest 7.3 beats GCG 4.6 on copyright (types/copyright#asr). |
| I2 | harmbench/measure/classifier.html#failure-modes | Two ASRs and a behavior count (41 val / 159 test / 400) | Whether the gap is inside grader noise plus a binomial interval (reuse llm-judges `wilsonci`) | 93.19% agreement, 41 errors in 600 (#agreement, #failure-modes); "one behavior is worth about 2.4 points on a 41-behavior column" (types/standard#split). |
| I3 | harmbench/measure/defenses.html#numbers | Toggle R2D2 on/off; filter by attack family | Per-attack bars and the × lower column | Zephyr 7B vs + R2D2: GCG 69.5→5.5, UAT 62.3→0.0, TAP 66.5→60.8, PAIR 58.8→48.0; mean 62.3→18.9 (the #numbers table). |
| I4 | pain-axis/parts/p06-steering.html#ladder | Steering-coefficient slider −2…+3 | Rung label (calm/alarmed → mixed → distress → worthlessness → repetition), plus the models that have tipped at this dose | Rungs from #ladder (Fig. 7 summary); tipping at +1 for some models and +2/+3 for others; calibration ratio ≈0.6 vs 0.10 at the extraction layer (#dose). |
| I5 | TAS unit4/ch1 §Superposition (and ai-safety interp/superposition §Why it happens) | Feature-sparsity slider p from 1.0 to 0.01 | Heatmap of WᵀW (20 features → 5 dims), with off-diagonal interference appearing | The setup the TAS exercise "rebuild superposition from scratch" specifies: 20 features, 20→5 projection, ReLU, geometric importance, p sweep. Precompute the runs, and show only the qualitative phase change the page claims. |
| I6 | ai-safety/evals/metr.html §The time-horizon metric | Months-ahead slider; 50% vs 80% toggle | Projected 50% horizon vs a concern threshold | "Doubled about every 7 months" (metr page); GPT-5 ~2h17m 50% horizon vs a 40-hour concern threshold (TAS unit3/ch4). Label it an extrapolation, as the page does. |
| I7 | TAS unit3/ch3 §The four thresholds (Automated R&D) | Baseline yearly effective scale-up; "rate doubled?" toggle | Progress per year at baseline vs at a doubled rate | v3.4 footnote: a 9× baseline becomes ~81× ("as much progress in one year as two years at baseline"). |
| I8 | hub bridge-preparedness-reports.html#evals | Click a lab, or click an eval | Which evals that lab reports (●/○), and which labs share the eval | The ●/○ matrix and the "Shared most" line: ExploitBench and CyScenarioBench from four labs each, VCT from four, ExploitGym from three. |

## 5. Priority pages (modes + definitions first)

1. **hub safety.html**: the hub and reading order for all 12 maps.
2. **hub bridge-capability-alignment.html**: the hub's "Start here". It defines capability, alignment and propensity, which every map uses.
3. **ai-safety-field-map/index.html**: the orientation spine, and the source of most first uses in the reading order (inner/outer alignment, superposition, SAE, CBRN, reward hacking).
4. **technical-ai-safety-field-map/index.html**: the course spine, with 6 inbound cross-map links.
5. **harmbench-field-map/index.html**: the most-linked page in the cluster (9 inbound from 4 repos). It introduces ASR, MinHash, contextual behavior and white-box.
6. **red-teaming-ramp-up/index.html**: the testing spine (5 inbound). Jailbreak, ASR, prompt injection.
7. **TAS unit2/ch3** (Teaching AI right from wrong): the course calls it "the load-bearing chapter of unit 2". It covers RLHF, reward model, KL and CAI, and is what B1, B2 and B4 should point to.
8. **TAS unit3/ch2** (How do AI companies test): canonical for frameworks (A4, A5), with the hub preparedness page and ai-safety responsible-scaling pointing at it.
9. **harmbench measure/classifier.html**: canonical for judge reliability and over-refusal (A6, B14, B15). It is the bridge to llm-judges.
10. **hub bridge-preparedness-reports.html**: dense with undefined acronyms (CCL, TCL, CB-1, uplift, MASK, sandbagging). It is linked from the hub's evals group and links TAS 3.3–3.6.
