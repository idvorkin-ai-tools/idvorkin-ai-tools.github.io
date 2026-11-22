/*
  threshold-reader: the only numeric thresholds bridge-preparedness-reports.html
  prints (the "Threshold style" row of #deltas), and the rule for reading a
  score against each. src is the page's own wording; the test checks that
  every src still appears on the page, so the widget cannot drift from it.
*/
(function (root) {
  var LABS = ['Meta', 'OpenAI', 'Anthropic', 'Google DeepMind', 'xAI'];
  var NOTES = {
    Meta: 'Three levels (critical, high, moderate or lower), set by whether the model could substantially help a threat scenario. These numbers are illustrations. Version 2 changed critical risk from stop to develop with mitigations, and added numeric acceptance criteria.',
    OpenAI: 'High and Critical are defined in words. The card prints these cutoffs as indicative; the framework leaves the call to holistic judgment. For a Critical cyber model, v2 says to halt further development until Critical-standard safeguards are specified.',
    Anthropic: 'Mostly arguments rather than levels; this is the one number. Reports use labels like CB-1, CB-2, Autonomy-1 and Autonomy-2. The latest card has the model meeting Autonomy-1 but not Autonomy-2, the R&D level, and calls that assessment uncertain.',
    'Google DeepMind': 'Critical Capability Levels (severe harm), Tracked Capability Levels (significant harm) and earlier alert thresholds are written in words. The numeric rule-out bars are in each report, not on this page, so there is nothing to slide.',
    xAI: 'Risk tiers with no published numbers. The December 2025 version had the two bars below; the June 2026 version removed both, so today there is nothing published to cross.'
  };
  // dir: 'ge' met when value >= bar, 'le' when value <= bar, 'lt' when value < bar.
  var ENTRIES = [
    { lab: 'Meta', area: 'Bio: BioTIER refusal rate', unit: '%', min: 0, max: 100, step: 1, value: 70, bar: 80, dir: 'ge',
      src: 'at least 80% refusal on BioTIER',
      yes: 'Meets the illustrative bar: at least 80% refusal on BioTIER.', no: 'Misses the illustrative bar of at least 80% refusal on BioTIER.' },
    { lab: 'Meta', area: 'Honesty: MASK score', unit: '%', min: 0, max: 100, step: 1, value: 30, bar: 40, dir: 'ge',
      src: 'at least 40% on MASK',
      yes: 'Meets the illustrative bar: at least 40% on MASK.', no: 'Misses the illustrative bar of at least 40% on MASK.' },
    { lab: 'Meta', area: 'Misalignment: Agentic Misalignment score', unit: '%', min: 0, max: 100, step: 1, value: 60, bar: 50, dir: 'le',
      src: 'at most 50% on Agentic Misalignment',
      yes: 'Meets the illustrative bar: at most 50% on Agentic Misalignment.', no: 'Misses the illustrative bar of at most 50% on Agentic Misalignment.' },
    { lab: 'OpenAI', area: 'GPQA Diamond score', unit: '%', min: 50, max: 100, step: 1, value: 78, bar: 83, dir: 'ge',
      src: '83% on GPQA Diamond',
      yes: 'At or past the card\'s indicative cutoff of 83%. Indicative only: the level is still a judgment call.', no: 'Below the card\'s indicative cutoff of 83% on GPQA Diamond.' },
    { lab: 'OpenAI', area: 'AI self-improvement: PostTrainBench Lite score', unit: '%', min: 50, max: 100, step: 1, value: 85, bar: 90, dir: 'ge',
      src: '90% on PostTrainBench Lite',
      yes: 'At or past the card\'s indicative cutoff of 90%. Indicative only: the level is still a judgment call.', no: 'Below the card\'s indicative cutoff of 90% on PostTrainBench Lite.' },
    { lab: 'Anthropic', area: 'Automated R&D: rate of AI progress, times today\'s', unit: '×', min: 1, max: 3, step: 0.1, value: 1.4, bar: 2, dir: 'ge',
      src: 'doubling the rate of AI progress',
      yes: 'Doubling or more: past the automated R&D threshold.', no: 'Less than double the rate of AI progress: short of the automated R&D threshold.' },
    { lab: 'Anthropic', area: 'Automated R&D: cost to replace all research staff, times their cost', unit: '×', min: 1, max: 10, step: 0.5, value: 8, bar: 5, dir: 'le',
      src: 'replacing all research staff within 5× the cost',
      yes: 'Within 5× the cost: past the automated R&D threshold.', no: 'More than 5× the cost: short of the automated R&D threshold.' },
    { lab: 'xAI', area: 'Bio: restricted bio queries answered (December 2025)', unit: '%', min: 0, max: 20, step: 1, value: 8, bar: 5, dir: 'lt',
      src: 'under 1 in 20 answers on restricted bio queries',
      yes: 'Under 1 in 20: inside the December 2025 bar.', no: '1 in 20 or more: over the December 2025 bar.' },
    { lab: 'xAI', area: 'Honesty: dishonest answers on MASK (December 2025)', unit: '%', min: 0, max: 100, step: 1, value: 60, bar: 50, dir: 'lt',
      src: 'under 1 in 2 dishonest on MASK',
      yes: 'Under 1 in 2: inside the December 2025 bar.', no: '1 in 2 or more: over the December 2025 bar.' }
  ];
  function met(dir, v, bar) {
    if (dir === 'ge') return v >= bar - 1e-9;
    if (dir === 'le') return v <= bar + 1e-9;
    return v < bar - 1e-9;
  }
  function read(e, v) { var m = met(e.dir, v, e.bar); return { met: m, text: m ? e.yes : e.no }; }
  function forLab(lab) { return ENTRIES.filter(function (e) { return e.lab === lab; }); }
  function fmt(e, v) { return e.unit === '%' ? Math.round(v) + '%' : (Math.round(v * 10) / 10).toFixed(1) + '×'; }
  var api = { LABS: LABS, NOTES: NOTES, ENTRIES: ENTRIES, met: met, read: read, forLab: forLab, fmt: fmt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ThresholdReader = api;
})(this);
