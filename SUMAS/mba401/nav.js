/* =====================================================================
   MBA401 · the course menu — a drawer that shows the whole course as a
   tree (week ▸ part ▸ section) from any page, and jumps straight to a
   section. 19 Oct 2026, a first for this course; port it elsewhere if it
   earns its keep.

   How a week page is built matters here: a week is ONE page whose
   sections are <section class="screen"> blocks, and the page's own
   show(id) switches between them. So a section link is either
       · same page   → show(id), and the hash is set to #<id>
       · other page  → weekX.html#<id>, and this script, loaded there,
                       calls show(id) once the page is ready
   The hash is only #s1…#s8, #ex or #home; #lecture stays the deck's.

   NAV below is the one place the tree is written. It mirrors the hub's
   WEEKS array and each page's SECTIONS array; when a week ships or a
   section is renamed, change it here too — nothing checks it for you.
   Done ticks: the open page's own `progress.done`; any other part's from
   its localStorage blob (mba401_<mod>_progress_v1), the same one its
   page writes, so the ticks are the device's, like the hub's bar.
   ===================================================================== */
(function () {
  'use strict';
  var NAV = [
    { n: 1, title: 'Describing data', parts: [
      { mod: 'w1a', k: '1A', t: 'The whole chain, in one session', href: 'week1a.html', hw: 'week1a-homework.html',
        secs: [['s1', '1A.1', 'One pizzeria is not the market'], ['s2', '1A.2', 'The picture is a probability'], ['s3', '1A.3', 'How wide is the cloud?'],
               ['s4', '1A.4', 'Mean + SD = a probability'], ['s5', '1A.5', 'How wrong could we be?'], ['s6', '1A.6', 'Does this move with that?'],
               ['ex', '1A.7', 'Exercises — worked together'], ['s7', '1A.8', 'Checkpoint'], ['s8', '1A.9', 'Workshop']] },
      { mod: 'w1b', k: '1B', t: 'Descriptive statistics', href: 'week1b.html', hw: 'week1b-homework.html',
        secs: [['s1', '1B.1', 'Thirty prices, one afternoon'], ['s2', '1B.2', 'Three data displays'], ['s3', '1B.3', 'Measures of centre'],
               ['s4', '1B.4', 'Measures of variability'], ['s5', '1B.5', 'Relative position'], ['s6', '1B.6', 'Empirical Rule & Chebyshev'],
               ['ex', '1B.7', 'Exercises — worked together'], ['s7', '1B.8', 'Checkpoint'], ['s8', '1B.9', 'Workshop']] } ] },
    { n: 2, title: 'The normal and sampling distributions', parts: [
      { mod: 'w2a', k: '2A', t: 'Continuous random variables and the normal', href: 'week2a.html', hw: 'week2a-homework.html',
        secs: [['s1', '2A.1', 'Probability is area'], ['s2', '2A.2', 'The bell curve: what µ and σ do'], ['s3', '2A.3', 'One curve, one table'],
               ['s4', '2A.4', 'Standardise, then look up'], ['s5', '2A.5', 'Reading the table in reverse'], ['s6', '2A.6', 'The value behind a percentile'],
               ['ex', '2A.7', 'Exercises — worked together'], ['s7', '2A.8', 'Checkpoint'], ['s8', '2A.9', 'Workshop']] },
      { mod: 'w2b', k: '2B', t: 'Sampling distributions', href: 'week2b.html', hw: 'week2b-homework.html',
        secs: [['s1', '2B.1', 'Another thirty tomorrow'], ['s2', '2B.2', 'Every sample you could draw'], ['s3', '2B.3', 'Why the bell shows up'],
               ['s4', '2B.4', 'One pizzeria vs the average of thirty'], ['s5', '2B.5', 'Any n, if the population is normal'], ['s6', '2B.6', 'The share above CHF 20, again'],
               ['ex', '2B.7', 'Exercises — worked together'], ['s7', '2B.8', 'Checkpoint'], ['s8', '2B.9', 'Workshop']] } ] },
    { n: 3, title: 'Estimation', parts: [
      { mod: 'w3', k: '', t: 'Estimation', href: 'week3.html', hw: 'week3-homework.html',
        secs: [['s1', '3.1', 'Give me a margin'], ['s2', '3.2', 'x̄ ± z·σ/√n'], ['s3', '3.3', 'When n is small, use t'],
               ['s4', '3.4', 'The share above CHF 20, with a margin'], ['s5', '3.5', 'How many pizzerias for ± 1 franc?'], ['s6', '3.6', 'What "95% confident" means'],
               ['ex', '3.7', 'Exercises — worked together'], ['s7', '3.8', 'Checkpoint'], ['s8', '3.9', 'Workshop']] } ] },
    { n: 4, title: 'Testing hypotheses', parts: [
      { mod: 'w4a', k: '4A', t: 'Testing hypotheses', locked: true },
      { mod: 'w4b', k: '4B', t: 'Two-sample problems', locked: true } ] },
    { n: 5, title: 'Correlation and regression', parts: [{ mod: 'w5', k: '', t: 'r, the line, inference on the slope', locked: true }] },
    { n: 6, title: 'Chi-square tests and F-tests', parts: [{ mod: 'w6', k: '', t: 'Independence, goodness of fit, ANOVA', locked: true }] },
    { n: 7, title: 'PCA and non-parametric tests', parts: [{ mod: 'w7', k: '', t: 'Beyond the textbook', locked: true }] },
    { n: 8, title: 'Exercises and repetition', parts: [{ mod: 'w8', k: '', t: 'Exercises and repetition', locked: true }] },
    { n: 9, title: 'Repetition II and the blank test', parts: [
      { mod: 'w9a', k: '9A', t: 'Exercises and repetition II', locked: true },
      { mod: 'w9b', k: '9B', t: 'The blank test', locked: true } ] },
    { n: 10, title: 'Final exam', parts: [{ mod: 'w10', k: '', t: 'Final exam', locked: true }] }
  ];
  var TOOLS = [
    ['practice.html', 'Practice arena', 'endless randomised problems'],
    ['exam-cards.html', 'Exam cards', 'every question from five real exams'],
    ['sampling-sim.html', 'Sampling simulator', 'watch the Central Limit Theorem happen'],
    ['teaching-plan.html', 'Teaching plan', 'the nine weeks, the grading, the dates']
  ];

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var CUR = null, CURHW = false;
  NAV.forEach(function (w) { w.parts.forEach(function (p) {
    if (p.href === here) CUR = p;
    if (p.hw === here) { CUR = p; CURHW = true; }
  }); });
  /* a week page also says which module it is (var MOD='w2a'); trust that
     over the file name, so a renamed or probe copy still knows itself */
  if (!CUR && typeof window.MOD === 'string') NAV.forEach(function (w) { w.parts.forEach(function (p) { if (p.mod === window.MOD) CUR = p; }); });
  var OPEN = {};                      /* which parts are unfolded in the drawer */
  if (CUR) OPEN[CUR.mod] = true;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function doneOf(p) {
    if (CUR === p && !CURHW && window.progress && window.progress.done) return window.progress.done;
    try { var j = JSON.parse(localStorage.getItem('mba401_' + p.mod + '_progress_v1') || 'null'); return (j && j.done) || {}; } catch (e) { return {}; }
  }
  function activeId() {
    var a = document.querySelector('.screen.active');
    return a ? a.id : '';
  }
  function canShow() { return typeof window.show === 'function' && !CURHW; }

  /* ---- DOM ---- */
  var btn, scrim, panel, body;
  function build() {
    var inner = document.querySelector('.topbar-inner');
    if (!inner) return;
    btn = document.createElement('button');
    btn.className = 'nav-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Course menu');
    btn.innerHTML = '<span class="nav-ico">☰</span><span class="nav-lbl">Menu</span>';
    var home = inner.querySelector('a.home');
    if (home) inner.insertBefore(btn, home); else inner.appendChild(btn);

    scrim = document.createElement('div'); scrim.className = 'nav-scrim';
    panel = document.createElement('nav'); panel.className = 'nav-panel'; panel.setAttribute('aria-label', 'Course menu');
    panel.innerHTML = '<div class="nav-hd"><div><div class="nav-eyebrow">Quantitative Methods · SUMAS</div><div class="nav-title">The course</div></div>' +
      '<button class="nav-x" type="button" aria-label="Close">✕</button></div><div class="nav-body"></div>' +
      '<div class="nav-ft"><a href="index.html">↖ Course home</a><span class="nav-hint">Esc closes · ✓ = done on this device</span></div>';
    document.body.appendChild(scrim); document.body.appendChild(panel);
    body = panel.querySelector('.nav-body');
    btn.addEventListener('click', toggle);
    scrim.addEventListener('click', close);
    panel.querySelector('.nav-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
    body.addEventListener('click', onClick);
  }

  function render() {
    var act = activeId();
    var h = '';
    NAV.forEach(function (w) {
      h += '<div class="nav-wk"><div class="nav-wkhd"><span class="nav-wkn">Week ' + w.n + '</span><span class="nav-wkt">' + esc(w.title) + '</span></div>';
      w.parts.forEach(function (p) {
        var isCur = p === CUR, open = !!OPEN[p.mod] && !p.locked;
        var label = (p.k ? p.k + ' · ' : '') + p.t;
        if (p.locked) {
          h += '<div class="nav-part locked"><span class="nav-chev"></span><span class="nav-pt">' + esc(label) + '</span><span class="nav-soon">in preparation</span></div>';
          return;
        }
        var done = doneOf(p), n = 0; p.secs.forEach(function (s) { if (done[s[0]]) n++; });
        h += '<div class="nav-part' + (isCur ? ' cur' : '') + (open ? ' open' : '') + '" data-mod="' + p.mod + '">' +
          '<button class="nav-chev" type="button" data-toggle="' + p.mod + '" aria-label="Show sections">▸</button>' +
          '<a class="nav-pt" href="' + p.href + '">' + esc(label) + '</a>' +
          '<span class="nav-cnt">' + n + '/' + p.secs.length + '</span>' +
          '<a class="nav-hw' + (isCur && CURHW ? ' cur' : '') + '" href="' + p.hw + '" title="Homework">HW</a></div>';
        if (open) {
          h += '<div class="nav-secs">';
          p.secs.forEach(function (s) {
            var on = isCur && !CURHW && act === s[0];
            h += '<a class="nav-sec' + (done[s[0]] ? ' done' : '') + (on ? ' on' : '') + '" href="' + p.href + '#' + s[0] + '" data-sec="' + s[0] + '" data-mod="' + p.mod + '">' +
              '<span class="nav-num">' + esc(s[1]) + '</span><span class="nav-nm">' + esc(s[2]) + '</span><span class="nav-tick">' + (done[s[0]] ? '✓' : '') + '</span></a>';
          });
          h += '</div>';
        }
      });
      h += '</div>';
    });
    h += '<div class="nav-wk tools"><div class="nav-wkhd"><span class="nav-wkn">Tools</span><span class="nav-wkt">open all term</span></div>';
    TOOLS.forEach(function (t) {
      h += '<a class="nav-part tool' + (t[0] === here ? ' cur' : '') + '" href="' + t[0] + '"><span class="nav-chev"></span><span class="nav-pt">' + esc(t[1]) + '</span><span class="nav-soon">' + esc(t[2]) + '</span></a>';
    });
    h += '</div>';
    body.innerHTML = h;
    var cur = body.querySelector('.nav-sec.on') || body.querySelector('.nav-part.cur');
    if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: 'center' }); } catch (e) {} }
  }

  function onClick(e) {
    var t = e.target.closest('[data-toggle]');
    if (t) { var m = t.getAttribute('data-toggle'); OPEN[m] = !OPEN[m]; render(); return; }
    var s = e.target.closest('a.nav-sec');
    if (s && CUR && s.getAttribute('data-mod') === CUR.mod && canShow()) {
      e.preventDefault();
      var id = s.getAttribute('data-sec');
      window.show(id);
      close();
    }
    /* any other link navigates normally; the hash is picked up on arrival */
  }

  function open() { render(); panel.classList.add('open'); scrim.classList.add('open'); document.body.classList.add('nav-open'); var x = panel.querySelector('.nav-x'); if (x) x.focus(); }
  function close() { panel.classList.remove('open'); scrim.classList.remove('open'); document.body.classList.remove('nav-open'); if (btn) btn.focus(); }
  function toggle() { if (panel.classList.contains('open')) close(); else open(); }

  /* ---- the hash: #s3 opens section s3 on arrival; show() keeps it current ---- */
  function hashId() { var m = (location.hash || '').match(/^#(s\d+|ex|home)$/); return m ? m[1] : ''; }
  function wrapShow() {
    if (typeof window.show !== 'function' || window.show.__nav) return;
    var orig = window.show;
    var w = function (id) {
      orig.apply(this, arguments);
      try { history.replaceState(null, '', id === 'home' ? location.pathname + location.search : '#' + id); } catch (e) {}
    };
    w.__nav = true; window.show = w;
  }
  function boot() {
    build();
    if (canShow()) {
      wrapShow();
      var id = hashId();
      if (id && id !== 'home' && document.getElementById(id)) window.show(id);
      window.addEventListener('hashchange', function () { var i = hashId(); if (i && document.getElementById(i) && activeId() !== i) window.show(i); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
