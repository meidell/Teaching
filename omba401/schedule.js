/* =====================================================================
   OMBA401 — the course schedule, in one place.

   THIS FILE IS THE SOURCE OF TRUTH for week dates, syllabus topic numbers,
   Doane chapters and assessment windows. The hub renders its key-dates list
   and chapter map from it, so those cannot drift apart by hand-editing.

   Two things worth knowing before you change anything here:

   1. "topic" is the SYLLABUS's own numbered subject list (1–11). The syllabus
      calls these "chapters" when it states test scope — e.g. "Online Test 1,
      chapters 1 to 6" means topics 1–6, i.e. Weeks 1–4. They are NOT the
      Doane chapter numbers, which live in `doane`. Conflating the two has
      caused a wrong revision instruction on a live week page twice.

   2. DATES COME FROM THE MOODLE ACTIVITY SETTINGS, NOT THE SYLLABUS PDF.
      The PDF lists every assessment one day earlier than Moodle actually
      opens it (Test 1: PDF "week 5" = 3–9 Aug, Moodle = 4–10 Aug; Final:
      PDF 7–14 Sep, Moodle 8–15 Sep). Moodle is what enforces the attempt,
      so Moodle wins. `syllabusSays` records the PDF value only so the
      difference stays visible — do not "correct" the dates to match it.
   ===================================================================== */
(function (root) {
  'use strict';

  var SCHEDULE = {
    weeks: [
      { n: 1,  dates: '6–12 Jul',       topic: '1–3', doane: '1–3',   subject: 'Overview of statistics · data collection · describing data visually' },
      { n: 2,  dates: '13–19 Jul',      topic: '4',   doane: '4',     subject: 'Descriptive statistics' },
      { n: 3,  dates: '20–26 Jul',      topic: '5',   doane: '5–7',   subject: 'Probability · discrete &amp; continuous probability distributions' },
      { n: 4,  dates: '27 Jul – 2 Aug', topic: '6',   doane: '8',     subject: 'Sampling distributions &amp; estimation' },
      { n: 5,  dates: '3–9 Aug',        topic: '7',   doane: '9–10',  subject: 'One-sample &amp; two-sample hypothesis tests' },
      { n: 6,  dates: '10–16 Aug',      topic: '8',   doane: '11',    subject: 'Analysis of variance' },
      { n: 7,  dates: '17–23 Aug',      topic: '9',   doane: '12–13', subject: 'Simple &amp; multiple regression' },
      { n: 8,  dates: '24–30 Aug',      topic: '10',  doane: '14',    subject: 'Time-series analysis' },
      { n: 9,  dates: '31 Aug – 6 Sep', topic: '11',  doane: '15–16', subject: 'Chi-square tests &amp; nonparametric tests' },
      { n: 10, dates: '8–15 Sep',       topic: '—',   doane: '—',     subject: 'Final online exam', examWeek: true }
    ],

    /* Assessment windows as set on the Moodle activities. */
    assessments: [
      { id: 'forum1', label: 'Forum 1',
        detail: 'released Mon 13 Jul · contributions due <b>Sun 2 Aug</b>' },
      { id: 'test1',  label: 'Online Test 1', afterWeek: 4,
        scope: 'syllabus topics 1–6 = <b>Weeks 1–4</b>',
        detail: '<b>4 Aug 00:00 – 10 Aug 23:59</b> · open book, 2 h, one attempt',
        syllabusSays: 'during week 5 (3–9 Aug)' },
      { id: 'forum2', label: 'Forum 2',
        detail: 'released Mon 10 Aug · contributions due <b>Sun 30 Aug</b>' },
      { id: 'test2',  label: 'Online Test 2', afterWeek: 9,
        scope: 'syllabus topics 7–11 = <b>Weeks 5–9</b>',
        detail: '<b>1 Sep 00:00 – 9 Sep 23:59</b> (extended) · open book, 2 h, one attempt',
        syllabusSays: 'during week 9 (31 Aug – 6 Sep)' },
      { id: 'essay',  label: 'Final Essay', scope: 'case study',
        detail: 'due <b>Sun 6 Sep</b>' },
      { id: 'exam',   label: 'Final Exam',
        detail: '<b>8 Sep 9:30 AM – 15 Sep 9:30 AM CEST</b> · <b>closed book</b> (formula sheet allowed), 2 h, one attempt',
        syllabusSays: '7 Sep 9:30 – 14 Sep 9:30' }
    ],

    /* Short forms restated elsewhere on the hub; kept here so they cannot drift. */
    shortForm: {
      examOpens: 'opens 8 Sep',
      courseRuns: '6 July – 15 September 2026',
      examCard: 'Opens 8 Sep, 9:30 AM CEST on Moodle, and is due 15 Sep 9:30 AM CEST. One attempt, sequential questions. (The syllabus PDF says 7–14 Sep; the Moodle activity is the one that counts.)'
    }
  };

  SCHEDULE.week = function (n) {
    for (var i = 0; i < SCHEDULE.weeks.length; i++) {
      if (SCHEDULE.weeks[i].n === n) return SCHEDULE.weeks[i];
    }
    return null;
  };

  /* Localhost-only drift check. A week page declares what it believes via
     data-sched-week / data-sched-assert on <body>; if the page's own header
     disagrees with this file, say so in the console. Never touches the UI. */
  SCHEDULE.check = function () {
    var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (!isLocal) return;
    var body = document.body, n = parseInt(body.getAttribute('data-sched-week'), 10);
    if (!n) return;
    var w = SCHEDULE.week(n);
    if (!w) { console.warn('[schedule] week ' + n + ' is not in schedule.js'); return; }
    var eyebrow = document.querySelector('.eyebrow');
    if (!eyebrow) return;
    var txt = eyebrow.textContent;
    /* Only the numbering is checked. Week headers spell dates out in full
       ("27 July – 2 August") where the hub abbreviates them ("27 Jul – 2 Aug"),
       and the numbering is where every real error has actually occurred. */
    var want = ['Syllabus topic ' + w.topic, 'Doane ch. ' + w.doane];
    want.forEach(function (bit) {
      if (txt.replace(/\s+/g, ' ').indexOf(bit.replace(/\s+/g, ' ')) === -1) {
        console.warn('[schedule] week ' + n + ' header is missing "' + bit + '" — header reads: ' + txt);
      }
    });
  };

  root.OMBA401_SCHEDULE = SCHEDULE;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SCHEDULE.check);
  } else {
    SCHEDULE.check();
  }
})(window);
