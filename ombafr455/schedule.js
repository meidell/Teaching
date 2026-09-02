/* =====================================================================
   OMBAFR455 — the course schedule, in one place.

   THIS FILE IS THE SOURCE OF TRUTH for week dates, chapter numbers and
   assessment windows. The hub renders its key-dates list, its grade tiles
   and the exam card from it, so those cannot drift apart by hand-editing.
   Same job `omba401/schedule.js` does for the statistics course; if you
   change the pattern in one, change it in both.

   Three things worth knowing before you change anything here:

   1. In THIS course, chapter N = week N. There is no second numbering to
      reconcile — unlike OMBA401, where the syllabus topics and the Doane
      chapters run on different counters. "Online Test 1 covers chapters
      1–4" therefore means Weeks 1 to 4, and nothing more clever.

   2. DATES COME FROM THE MOODLE ACTIVITY SETTINGS, NOT THE SYLLABUS PDF.
      The PDF lists the final exam one day earlier than Moodle opens it
      (PDF 7–14 Sep, Moodle 8–15 Sep) — the same off-by-one already found
      and documented in OMBA401. Moodle is what enforces the attempt, so
      Moodle wins. `syllabusSays` records the PDF value only so the
      difference stays visible — do not "correct" the dates to match it.

   3. ONLINE TEST 2 AND FORUM 2 ARE CANCELLED. They are still listed here,
      with `cancelled:true`, rather than deleted: students hold syllabuses
      and Moodle links that name them, and a missing line reads as an
      oversight where a struck-through one reads as an answer. Weeks 5–8
      are assessed in the Final Exam instead.
   ===================================================================== */
(function (root) {
  'use strict';

  var SCHEDULE = {
    weeks: [
      { n: 1,  dates: '6–12 Jul',       chapter: '1', subject: 'Introduction to Sustainable Investing' },
      { n: 2,  dates: '13–19 Jul',      chapter: '2', subject: 'Building a Sustainable Financial System' },
      { n: 3,  dates: '20–26 Jul',      chapter: '3', subject: 'Regulatory &amp; Policy Environment' },
      { n: 4,  dates: '27 Jul – 2 Aug', chapter: '4', subject: 'Risk Management &amp; Measurement' },
      { n: 5,  dates: '3–9 Aug',        chapter: '5', subject: 'The Sustainable Debt Market' },
      { n: 6,  dates: '10–16 Aug',      chapter: '6', subject: 'The Sustainable Equity Market' },
      { n: 7,  dates: '17–23 Aug',      chapter: '7', subject: 'Sustainable Derivatives &amp; Impact Investing' },
      { n: 8,  dates: '24–30 Aug',      chapter: '8', subject: 'Carbon, Biodiversity Credits &amp; Crowdfunding' },
      { n: 9,  dates: '31 Aug – 6 Sep', chapter: '—', subject: 'No new material · the written assignment is due' },
      { n: 10, dates: '8–15 Sep',       chapter: '—', subject: 'Final online exam', examWeek: true }
    ],

    /* Assessment windows as set on the Moodle activities. */
    assessments: [
      { id: 'forum1', label: 'Forum 1',
        detail: 'released Mon 13 Jul · contributions due <b>Sun 2 Aug</b>' },
      { id: 'test1',  label: 'Online Test 1', afterWeek: 4,
        scope: 'chapters 1–4 = <b>Weeks 1–4</b>',
        detail: '<b>3–9 Aug</b> · on Moodle' },
      { id: 'forum2', label: 'Forum 2', cancelled: true,
        detail: '<b>Cancelled — this forum will not take place.</b> The syllabus lists it; ' +
                'it has been withdrawn and there is nothing to post. Forum 1 and your own ' +
                'post are the whole of the participation mark.',
        syllabusSays: 'released Mon 10 Aug, due Sun 30 Aug' },
      { id: 'test2',  label: 'Online Test 2', cancelled: true,
        detail: '<b>Cancelled — this test will not take place.</b> The syllabus lists it; ' +
                'it has been withdrawn and there is nothing to sit. Chapters 5–8 are ' +
                'assessed in the <b>Final Exam</b> instead.',
        syllabusSays: 'during week 9 (31 Aug – 6 Sep)' },
      { id: 'assign', label: 'Written Assignment', scope: 'Apple green bond',
        detail: 'uploaded to Moodle · due <b>Sun 6 Sep, 23:59 CEST</b>' },
      { id: 'exam',   label: 'Final Exam',
        detail: '<b>8 Sep 9:30 AM – 15 Sep 9:30 AM CEST</b> · on Moodle, one attempt, ' +
                'sequential questions · covers <b>Weeks 1 to 8</b>',
        syllabusSays: '7 Sep 9:30 – 14 Sep 9:30' }
    ],

    /* Short forms restated elsewhere on the hub; kept here so they cannot drift. */
    shortForm: {
      examOpens: 'opens 8 Sep',
      courseRuns: '6 July – 15 September 2026',
      forumTile: 'Forum 1 + 1 own post<br><s>Forum 2 cancelled</s>',
      testTile: 'Online Test 1<br><s>Test 2 cancelled</s>',
      examCard: 'You sit it on the Moodle course page — not on this site. Opens 8 Sep, ' +
                '9:30 AM CEST and is due 15 Sep 9:30 AM CEST. One attempt, sequential ' +
                'questions. It covers the whole course, Weeks 1 to 8 — including the ' +
                'material Online Test 2 would have carried. (The syllabus PDF says ' +
                '7–14 Sep; the Moodle activity is the one that counts.)'
    }
  };

  SCHEDULE.week = function (n) {
    for (var i = 0; i < SCHEDULE.weeks.length; i++) {
      if (SCHEDULE.weeks[i].n === n) return SCHEDULE.weeks[i];
    }
    return null;
  };

  /* Localhost-only drift check. A week page states what it believes in its
     `.eyebrow` ("Week 5 · 3–9 August · Chapter 5"); if the chapter number
     there disagrees with this file, say so in the console. Only the
     numbering is checked — the headers spell dates out in full where the
     hub abbreviates them, and the numbering is where errors actually
     happen. Never touches the UI. */
  SCHEDULE.check = function () {
    var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (!isLocal) return;
    var eyebrow = document.querySelector('.eyebrow');
    if (!eyebrow) return;
    var txt = eyebrow.textContent.replace(/\s+/g, ' ');
    var m = txt.match(/Week\s+(\d+)/);
    if (!m) return;
    var n = parseInt(m[1], 10), w = SCHEDULE.week(n);
    if (!w) { console.warn('[schedule] week ' + n + ' is not in schedule.js'); return; }
    if (w.chapter !== '—' && txt.indexOf('Chapter ' + w.chapter) === -1) {
      console.warn('[schedule] week ' + n + ' should be Chapter ' + w.chapter +
                   ' — header reads: ' + txt);
    }
  };

  root.OMBAFR455_SCHEDULE = SCHEDULE;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SCHEDULE.check);
  } else {
    SCHEDULE.check();
  }
})(window);
