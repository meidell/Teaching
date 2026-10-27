/* =====================================================================
   /shared/period.js — is a course running now? (27 Oct 2026)

   Jan Erik: "highlight courses that take place currently and slightly
   gray out others where there is no activity (for all courses)".
   Read by the school landing pages (/GBS/, /SUMAS/, /UMEF/, /Kalaidos/,
   /HEG/) and the /admin/ console. Everything comes from courses.json:

     period {start, end}        explicit term, for courses with no schedule
     schedule.dates [...]       first and last session date
     schedule.first + sessions  weekly from `first` (online courses too)

   States:
     now      from 7 days before the first session to 14 days after the
              last (exams, marking, late forums)        → highlighted
     soon     first session within the next 30 days     → normal + "starts"
     ended · later · open (evergreen, no cohort)        → slightly greyed
     unknown  live course with no dates at all          → left as it is

   CoursePeriod.decorate(c) → {state, cls, tag}: `cls` is a class string
   to append to the card (' is-now' / ' is-idle'), `tag` a small HTML
   chip, in the page's language (<html lang="fr"> → French). The CSS is
   injected here once, so a page needs no stylesheet change.
   ===================================================================== */
(function (root) {
  'use strict';
  var DAY = 864e5;
  function d(s) { return new Date(String(s).slice(0, 10) + 'T12:00:00Z'); }
  function iso(t) { return t.toISOString().slice(0, 10); }
  function todayISO() {
    try { return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' }); }
    catch (e) { return iso(new Date()); }
  }

  function of(c, today) {
    today = today || todayISO();
    if (!c || c.status === 'archived') return { state: 'ended' };
    var p = c.period, s = c.schedule || {}, start, end, dates = null, weekly = false;
    if (p && p.start) { start = p.start; end = p.end || p.start; }
    else if (Array.isArray(s.dates) && s.dates.length) {
      dates = s.dates.map(String).sort(); start = dates[0]; end = dates[dates.length - 1];
    } else if (s.first) {
      start = s.first; weekly = true;
      var e = d(s.first); e.setUTCDate(e.getUTCDate() + 7 * Math.max(0, (s.sessions || 1) - 1)); end = iso(e);
    }
    if (!start) return { state: c.status === 'evergreen' ? 'open' : 'unknown' };
    var t = +d(today), t0 = +d(start), t1 = +d(end);
    if (t < t0 - 7 * DAY) return { state: (t0 - t <= 30 * DAY) ? 'soon' : 'later', start: start, end: end };
    if (t > t1 + 14 * DAY) return { state: 'ended', start: start, end: end };
    var r = { state: 'now', start: start, end: end };
    if (dates) { for (var i = 0; i < dates.length; i++) if (dates[i] >= today) { r.next = dates[i]; break; } }
    else if (weekly) {
      var k = Math.max(0, Math.ceil((t - t0) / (7 * DAY))), nx = t0 + 7 * k * DAY;
      if (/async/i.test(String(s.time || ''))) {
        r.week = Math.min(s.sessions || 99, Math.floor((t - t0) / (7 * DAY)) + 1); r.weeks = s.sessions;
      } else if (nx <= t1 && !/arrang/i.test(String(s.time || ''))) r.next = iso(new Date(nx));
    }
    return r;
  }

  function fr() { return /^fr/i.test((document.documentElement.lang || '')); }
  function fmt(s) {
    return d(s).toLocaleDateString(fr() ? 'fr-CH' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  }

  function decorate(c, today) {
    var p = of(c, today), F = fr(), tag = '';
    if (p.state === 'now') {
      var more = p.next ? (p.next === (today || todayISO()) ? (F ? ' · séance aujourd’hui' : ' · session today') : (F ? ' · prochaine séance ' : ' · next session ') + fmt(p.next))
               : p.week ? (F ? ' · semaine ' : ' · week ') + p.week + (p.weeks ? (F ? ' sur ' : ' of ') + p.weeks : '') : '';
      tag = '<span class="pd-tag">● ' + (F ? 'En cours' : 'Running now') + more + '</span>';
    } else if (p.state === 'soon') {
      tag = '<span class="pd-tag soon">' + (F ? 'Commence ' : 'Starts ') + fmt(p.start) + '</span>';
    }
    var idle = p.state === 'ended' || p.state === 'later' || p.state === 'open';
    return { state: p.state, cls: p.state === 'now' ? ' is-now' : (idle ? ' is-idle' : ''), tag: tag, p: p };
  }

  /* one stylesheet for every page that loads this file */
  if (typeof document !== 'undefined' && !document.getElementById('pd-css')) {
    var st = document.createElement('style'); st.id = 'pd-css';
    st.textContent =
      '.is-now{border-color:var(--accent,#4A8B3A)!important;box-shadow:0 0 0 2px var(--accent,#4A8B3A),0 10px 26px rgba(0,0,0,.10)!important;}' +
      '.is-idle{opacity:.55;filter:grayscale(.55);transition:opacity .2s,filter .2s;}' +
      '.is-idle:hover,.is-idle:focus-within{opacity:1;filter:none;}' +
      '.pd-tag{display:inline-block;font:700 11px/1.3 "Helvetica Neue",Arial,sans-serif;letter-spacing:.03em;padding:4px 10px;border-radius:20px;background:var(--accent,#4A8B3A);color:#fff;margin:0 6px 6px 0;white-space:nowrap;}' +
      '.pd-tag.soon{background:transparent;color:var(--accent-deep,var(--accent,#2C5530));box-shadow:inset 0 0 0 1px currentColor;}' +
      'tr.is-now td:first-child{box-shadow:inset 4px 0 0 var(--accent,#4A8B3A);}' +
      'tr.is-idle{opacity:.5;filter:grayscale(.5);} tr.is-idle:hover{opacity:1;filter:none;}' +
      '@media print{.is-idle{opacity:1;filter:none;}}';
    (document.head || document.documentElement).appendChild(st);
  }

  root.CoursePeriod = { of: of, decorate: decorate };
})(typeof window !== 'undefined' ? window : this);
