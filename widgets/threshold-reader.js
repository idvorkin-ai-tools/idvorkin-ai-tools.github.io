/*
  threshold-reader widget for bridge-preparedness-reports.html#deltas: pick a
  lab and one of its printed thresholds, slide a score, read which side of
  the bar it lands on. Data and rules: lab/threshold-reader.js.
*/
(function () {
  var H = window.AIToolsWidgets, R = window.ThresholdReader;
  if (!H || !R) return;

  function track(e, v) {
    var x0 = 14, x1 = 346, sx = function (u) { return x0 + (u - e.min) / (e.max - e.min) * (x1 - x0); };
    var bx = sx(e.bar), vx = sx(v), okLeft = e.dir !== 'ge';
    return '<svg viewBox="0 0 360 58" role="img" aria-label="Score ' + R.fmt(e, v) + ' against a bar at ' + R.fmt(e, e.bar) + '">' +
      '<rect class="tr-track" x="' + x0 + '" y="22" width="' + (x1 - x0) + '" height="8" rx="4"/>' +
      '<rect class="tr-side" x="' + (okLeft ? x0 : bx) + '" y="22" width="' + (okLeft ? bx - x0 : x1 - bx) + '" height="8" rx="4"/>' +
      '<line class="tr-bar" x1="' + bx + '" y1="12" x2="' + bx + '" y2="40"/>' +
      H.t(bx, 10, 'bar ' + R.fmt(e, e.bar), 'tr-lbl', 'text-anchor="middle"') +
      '<circle class="tr-dot" cx="' + vx + '" cy="26" r="7"/>' +
      H.t(x0, 54, R.fmt(e, e.min), 'tr-lbl') + H.t(x1, 54, R.fmt(e, e.max), 'tr-lbl', 'text-anchor="end"') +
      '</svg>';
  }

  H.register('threshold-reader', function (el) {
    var p = 'tr' + H.uid(), lab = R.LABS[0], ent = null;
    el.innerHTML =
      '<div class="lab-pre" role="group" aria-label="Pick a lab">' + R.LABS.map(function (n) {
        return '<button type="button" aria-pressed="false" data-pick="' + n + '">' + n + '</button>';
      }).join('') + '</div>' +
      '<div class="lab-sl tr-pick"><label for="' + p + '-e">Printed threshold</label><select id="' + p + '-e"></select></div>' +
      '<div class="lab-ctl"><div class="lab-sl"><label for="' + p + '-s" id="' + p + '-sl">Score</label>' +
      '<input type="range" id="' + p + '-s"><output for="' + p + '-s" id="' + p + '-s-o"></output></div></div>' +
      '<div id="' + p + '-svg"></div>' + H.sum(p + '-sum') + '<p class="tr-note" id="' + p + '-note"></p>';
    var sel = H.$(el, p + '-e'), s = H.$(el, p + '-s'), btns = el.querySelectorAll('button[data-pick]');
    var ctl = el.querySelector('.lab-ctl'), pick = el.querySelector('.tr-pick');

    function draw() {
      H.$(el, p + '-note').textContent = R.NOTES[lab];
      if (!ent) {
        ctl.hidden = true; pick.hidden = true; H.$(el, p + '-svg').innerHTML = '';
        H.$(el, p + '-sum').textContent = lab + ' prints no numeric threshold on this page.';
        return;
      }
      ctl.hidden = false; pick.hidden = false;
      var v = +s.value, r = R.read(ent, v);
      H.$(el, p + '-s-o').textContent = R.fmt(ent, v);
      H.$(el, p + '-svg').innerHTML = track(ent, v);
      el.classList.toggle('tr-met', r.met);
      H.$(el, p + '-sum').textContent = lab + ', ' + ent.area + ' at ' + R.fmt(ent, v) + ': ' + r.text;
    }
    function pickEntry(i) {
      ent = R.forLab(lab)[i] || null;
      if (ent) {
        s.min = ent.min; s.max = ent.max; s.step = ent.step; s.value = ent.value;
        H.$(el, p + '-sl').textContent = 'Slide the score (' + (ent.unit === '%' ? 'percent' : 'times') + ')';
      }
      draw();
    }
    function pickLab(n) {
      lab = n;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pick') === n)); });
      sel.innerHTML = R.forLab(n).map(function (e, i) { return '<option value="' + i + '">' + e.area.replace(/&/g, '&amp;') + '</option>'; }).join('');
      pickEntry(0);
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pickLab(b.getAttribute('data-pick')); }); });
    sel.addEventListener('change', function () { pickEntry(+sel.value); });
    s.addEventListener('input', draw);
    pickLab(R.LABS[0]);
  });
})();
