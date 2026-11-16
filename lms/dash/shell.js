/* =====================================================================
   The frame every role dashboard shares: the top bar (school, the eight
   roles, light/dark), programme colours, stat tiles, status pills, and a
   few formatting helpers. A page calls Dash.shell('<role id>') first.
   ===================================================================== */
/* ---- the sign-in (16 Nov 2026): no session → the Lakeside sign-in page, which brings the
   reader back here afterwards. The session is the platform's (localStorage jem_lms = {t, user}).
   The data on these pages is invented and public in data.js; the sign-in decides who uses the
   tool, it does not hide the data. ---- */
(function () {
  let s = null; try { s = JSON.parse(localStorage.getItem('jem_lms') || 'null'); } catch (e) {}
  if (!s || !s.t) {
    const here = location.pathname.split('/').pop() || 'index.html';
    location.replace('login.html?next=' + encodeURIComponent(here + location.search + location.hash));
    document.documentElement.style.visibility = 'hidden';
  }
})();
window.Dash = (function () {
  'use strict';
  const S = window.SCHOOL, esc = Charts.esc;
  const ROLES = [
    { id: 'director', href: 'director.html', name: 'Director', q: 'Is the school on track this year, and what needs my decision?' },
    { id: 'programme', href: 'programme.html', name: 'Programme manager', q: 'How is my programme doing, and which students and courses need help?' },
    { id: 'marketing', href: 'marketing.html', name: 'Sales & marketing', q: 'Will we fill the next intakes, and which channels deliver?' },
    { id: 'admissions', href: 'admissions.html', name: 'Admissions & student office', q: 'Which files, visas and requests are waiting, and for whom?' },
    { id: 'finance', href: 'finance.html', name: 'Finance', q: 'Is the cash coming in, who owes what, and which programme pays?' },
    { id: 'quality', href: 'quality.html', name: 'Quality & accreditation', q: 'Can we prove quality to the accreditors, and where is the evidence thin?' },
    { id: 'professor', href: 'professor.html', name: 'Professor', q: 'What do I teach this week, what must I grade, and who is slipping?' },
    { id: 'student', href: 'student.html', name: 'Student', q: 'Am I on track, what is due, and what do I owe?' },
  ];
  /* programme colours: categorical slots 1–4, fixed to the programme (never to rank) */
  const PC = { bba: 'var(--s1)', msc: 'var(--s2)', emba: 'var(--s3)', dba: 'var(--s4)' };

  /* ---- dark by default (fanzclub style); the switch offers light and is remembered per device ---- */
  function applyTheme() { let t = null; try { t = localStorage.getItem('dash_theme'); } catch (e) {} if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  applyTheme();
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';   /* dark is the default look (fanzclub style) */
    const next = cur === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('dash_theme', next); } catch (e) {}
    applyTheme(); Charts.redrawAll();
  }

  function shell(role) {
    if (!document.querySelector('link[rel=icon]')) { const l = document.createElement('link'); l.rel = 'icon'; l.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%231c5cab'/%3E%3Cpath d='M10 37 L22 22 L29 29 L37 16 L54 37 Z' fill='white'/%3E%3Cpath d='M10 45 Q17 41 24 45 T38 45 T54 45' fill='none' stroke='white' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E"; document.head.appendChild(l); }
    const top = document.createElement('div'); top.className = 'top';
    top.innerHTML = `<div class="top-in">
      <a class="brand" href="index.html" title="${esc(S.school.name)}"><svg class="lgo" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29.5" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M10 36 L22 22 L29 29 L37 17 L54 36 Z" fill="currentColor"/><path d="M9 42 Q16.5 38 24 42 T39 42 T54 42" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" opacity=".75"/><path d="M13 49 Q19.5 45.5 26 49 T39 49 T51 49" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" opacity=".5"/></svg><span>${esc(S.school.name)}</span></a>
      <nav class="roles">${ROLES.map(r => `<a href="${r.href}" class="${r.id === role ? 'on' : ''}">${esc(r.name)}</a>`).join('')}</nav>
      <span class="fict" title="Every name and number on these pages is invented">Fictitious data · ${esc(S.school.term)}, week ${S.school.termWeek}</span>
      <span class="me" id="meChip"></span>
      <button class="tbtn" id="themeBtn" type="button" aria-label="Switch light or dark">◐</button></div>`;
    document.body.insertBefore(top, document.body.firstChild);
    document.getElementById('themeBtn').onclick = toggleTheme;
    /* who is signed in, and the way to another profile or out */
    let ses = null; try { ses = JSON.parse(localStorage.getItem('jem_lms') || 'null'); } catch (e) {}
    const u = (ses && ses.user) || {};
    if (ses && ses.t) {
      try { localStorage.setItem('dash_role', role || 'overview'); } catch (e) {}
      const ini = ((u.name || u.email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('') || '?').toUpperCase();
      document.getElementById('meChip').innerHTML = `<a href="login.html" class="av${u.is_superadmin ? ' adm' : ''}" title="Signed in as ${esc(u.name ? u.name + ' (' + u.email + ')' : u.email || '')}${u.is_superadmin ? ', main admin' : ''}. Choose another profile.">${esc(ini)}</a>
        <button type="button" class="out" id="outBtn">Sign out</button>`;
      document.getElementById('outBtn').onclick = async () => {
        const api = (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem('jem_lms_api')) || 'https://teaching-api-1t2r.onrender.com';
        try { await fetch(api + '/auth/logout', { method: 'POST', headers: { authorization: 'Bearer ' + ses.t } }); } catch (e) {}
        try { localStorage.removeItem('jem_lms'); localStorage.removeItem('dash_role'); } catch (e) {}
        location.href = 'login.html';
      };
    }
    const r = ROLES.find(x => x.id === role); if (r) document.title = `${r.name} · ${S.school.name}`;
  }

  /* ---- formatting ---- */
  const chf = n => n == null ? '—' : 'CHF ' + Math.round(n).toLocaleString('de-CH').replace(/’/g, "'");
  const chfK = n => n == null ? '—' : Math.abs(n) >= 1e6 ? 'CHF ' + (Math.round(n / 1e4) / 100).toLocaleString('en') + 'M' : 'CHF ' + Math.round(n / 1000) + 'K';
  const num = n => n == null ? '—' : Math.round(n).toLocaleString('de-CH').replace(/’/g, "'");
  const pct = (n, d) => n == null ? '—' : (Math.round(n * Math.pow(10, d || 0)) / Math.pow(10, d || 0)) + ' %';
  const date = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const dateLong = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const daysUntil = iso => Math.round((new Date(iso + 'T12:00:00') - new Date(S.school.today + 'T12:00:00')) / 864e5);

  /* a signed change, coloured by whether up is good, with the period named */
  function delta(now, before, opts) {
    opts = opts || {}; if (before == null || now == null) return '';
    const d = now - before, good = opts.downIsGood ? d < 0 : d > 0, cls = Math.abs(d) < (opts.flat || 1e-9) ? 'flat' : good ? 'up' : 'down';
    const txt = opts.pct ? (d > 0 ? '+' : '') + (Math.round(1000 * d / before) / 10) + ' %' : (d > 0 ? '+' : d < 0 ? '−' : '±') + (opts.fmt || num)(Math.abs(d));
    return `<span class="${cls}">${d > 0 ? '▲' : d < 0 ? '▼' : '●'} ${esc(txt)}</span> ${esc(opts.vs || '')}`;
  }
  /* a stat tile: label · value · delta · optional sparkline id */
  function tile(o) {
    return `<div class="tile"><div class="lab">${esc(o.lab)}</div><div class="val">${esc(o.val)}${o.unit ? `<small>${esc(o.unit)}</small>` : ''}</div>${o.delta ? `<div class="delta">${o.delta}</div>` : ''}${o.spark ? `<div class="spk" id="${o.spark}"></div>` : ''}${o.note ? `<div class="delta">${esc(o.note)}</div>` : ''}</div>`;
  }
  /* ---- the ONE course check every page uses (thresholds live in data.js) ----
     returns [{key, kind, text}], each reason in words with its threshold */
  function courseIssues(x) {
    const T = S.thresholds.course, r = [];
    if (!x.enrolled) return r;
    if (x.attendance != null && x.attendance < T.attendance) r.push({ key: 'att', kind: 'crit', text: `attendance ${x.attendance} % (alert below ${T.attendance} %)` });
    if (x.failRate != null && x.failRate >= T.failShare) r.push({ key: 'fail', kind: 'crit', text: `${x.failRate} % of students below ${S.rules.pass.toFixed(1)} (alert from ${T.failShare} %)` });
    if (x.oldestUngradedDays > T.gradingDays) r.push({ key: 'grading', kind: 'serious', text: `oldest submission waits ${x.oldestUngradedDays} days for a grade (alert after ${T.gradingDays})` });
    if (x.submissionRate != null && x.submissionRate < T.handedIn) r.push({ key: 'handed', kind: 'serious', text: `${x.submissionRate} % of work handed in (alert below ${T.handedIn} %)` });
    if (x.feedback < T.feedback) r.push({ key: 'fb', kind: 'warn', text: `student feedback ${x.feedback.toFixed(1)} of 5 (alert below ${T.feedback})` });
    return r;
  }
  const courseRule = () => { const T = S.thresholds.course; return `attendance under ${T.attendance} %, ${T.failShare} % or more of students under ${S.rules.pass.toFixed(1)}, a submission waiting more than ${T.gradingDays} days for a grade, under ${T.handedIn} % of work handed in, or student feedback under ${T.feedback} of 5`; };
  /* status: colour + dot + word, never colour alone */
  const st = (kind, word) => `<span class="st ${kind}">${esc(word)}</span>`;
  const riskSt = r => r === 'high' ? st('crit', 'High risk') : r === 'medium' ? st('serious', 'At risk') : r === 'watch' ? st('warn', 'Watch') : st('good', 'On track');
  const progKey = pid => `<i class="key" style="background:${PC[pid]}"></i>${esc(S.P[pid].short)}`;

  /* =====================================================================
     SIGNALS — the same exceptions everywhere (14 Nov 2026, the director's review: "highlight where
     the problems are, show the direction, time the decisions"). decisions() is the director's list;
     signals() gives every role a status (crit · serious · warn · good), one counted line and a count;
     windows() turns the decision calendar into countdowns. The overview and the director page both
     read these, so they can never disagree.
     ===================================================================== */
  /* every deadline comes from the school calendar (S.calendar), so the decision list and the windows agree */
  const cal = id => S.calendar.find(c => c.id === id);
  const byOf = id => cal(id) ? cal(id).date : null;
  function decisions() {
    const C = S.crm, F = S.finance, Q = S.quality, acts = [];
    S.programs.forEach(p => { const f = C.funnel[p.id]; if (f.forecast < C.target[p.id]) acts.push({ sev: 3, kind: 'crit', role: 'marketing', w: `${p.short}: September 2027 forecast ${f.forecast} for a target of ${C.target[p.id]}`, d: `Applications are running at ${Math.round(f.pace * 100)} % of last year's pace. Decide on extra recruitment spend or a revised target before the marketing plan is locked.`, go: 'marketing.html?p=' + p.id, gl: 'Sales & marketing', win: 'mkt-plan', by: byOf('mkt-plan') }); });
    /* a programme LOSES money only when its contribution (tuition − teaching − marketing) is negative; a negative
       net after the allocated overheads is a different and weaker fact, worded as such */
    S.programs.forEach(p => { const m = F.marginByProgram[p.id];
      if (m.contribution < 0) acts.push({ sev: 3, kind: 'crit', role: 'finance', w: `${p.short} loses ${chfK(-m.contribution)} this year`, d: `${m.students} students bring ${chfK(m.revenue)}; teaching ${chfK(m.teaching)} and marketing ${chfK(m.marketing)} cost more. Decide its size, fee or format at the budget meeting.`, go: 'finance.html', gl: 'Finance', win: 'budget', by: byOf('budget') });
      else if (m.net < 0) acts.push({ sev: 2.5, kind: 'serious', role: 'director', w: `${p.short} does not cover its share of the overheads`, d: `It adds ${chfK(m.contribution)} to the school's result (tuition less teaching and marketing), but its allocated share of the overheads is ${chfK(m.overhead)}. Closing it would not remove those overheads. Decide its size, fee or format at the budget meeting.`, go: 'director.html#decisions', gl: 'Options', win: 'budget', by: byOf('budget'), support: p.id === 'dba' ? 'dba-future' : null }); });
    const over60 = F.aging['61–90 days'] + F.aging['over 90 days'];
    if (over60 > 50000) acts.push({ sev: 2, kind: 'serious', role: 'finance', w: `${chfK(over60)} of tuition overdue more than 60 days`, d: `${S.students.filter(s => s.overdueDays > 60).length} students. Decide whether they may register for exams; registration opens ${date(S.registrar.examRegistrationOpen)}.`, go: 'finance.html', gl: 'Finance', win: 'exam-reg', by: byOf('exam-reg') });
    const backlog = S.faculty.slice().sort((a, b) => b.ungraded - a.ungraded)[0];
    if (backlog.ungraded > 20) acts.push({ sev: 2, kind: 'serious', role: 'professor', w: `${backlog.name}: ${backlog.ungraded} submissions not graded`, d: `Midterm grades are due ${date(S.registrar.gradeEntryDeadline)}. Students cannot see their standing until they are entered.`, go: 'professor.html?id=' + backlog.id, gl: 'Professor', win: 'grades', by: byOf('grades') });
    const missing = Q.evidence.filter(e => e.status === 'missing').length, partial = Q.evidence.filter(e => e.status === 'incomplete').length;
    acts.push({ sev: 2, kind: 'warn', role: 'quality', w: `Accreditation visit ${date(Q.nextVisit)}: ${missing} pieces of evidence missing, ${partial} incomplete`, d: `${daysUntil(Q.nextVisit)} days to go. Name an owner for each missing item.`, go: 'quality.html', gl: 'Quality', win: 'accr-owners', by: byOf('accr-owners') });
    const resp = C.response, rNow = resp.slice(-4).reduce((a, r) => a + r.hours, 0) / 4, rBefore = resp.slice(0, 4).reduce((a, r) => a + r.hours, 0) / 4;
    if (rNow > rBefore * 1.4) acts.push({ sev: 1, kind: 'warn', role: 'marketing', w: `Leads now wait ${Math.round(rNow)} hours for a first answer`, d: `It was ${Math.round(rBefore)} hours two months ago. Leads answered late convert less often; check admissions staffing.`, go: 'marketing.html', gl: 'Sales & marketing' });
    const noAvail = S.faculty.filter(f => !f.availabilitySent).length;
    if (noAvail) acts.push({ sev: 1, kind: 'warn', role: 'programme', w: `${noAvail} faculty have not sent their spring availability`, d: 'The spring timetable cannot take them into account without it.', go: '/lms/planner.html', gl: 'Teaching availability', win: 'timetable', by: byOf('timetable') });
    return acts.sort((a, b) => b.sev - a.sev || (a.by || '9').localeCompare(b.by || '9'));
  }
  /* countdown to each date of the decision calendar */
  function windows() {
    return S.calendar.map(c => { const d = daysUntil(c.date); return { ...c, days: d, kind: d < 0 ? 'none' : d <= 7 ? 'crit' : d <= 21 ? 'serious' : 'warn', word: d < 0 ? 'Passed' : d <= 7 ? 'Closing' : d <= 21 ? 'Soon' : 'Ahead' }; })
      .filter(c => c.days >= 0).sort((a, b) => a.days - b.days);
  }
  const cdown = d => d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
  /* one status per role, computed from the same data the role's own dashboard shows */
  function signals() {
    const A = S.util.active, F = S.finance, C = S.crm, R = S.registrar, Q = S.quality, acts = decisions(), out = {};
    const crit = acts.filter(a => a.kind === 'crit').length;
    out.director = { kind: crit ? 'crit' : acts.length ? 'serious' : 'good', count: acts.length,
      line: `${acts.length} decisions pending, ${crit} of them critical. The next deadline: ${windows()[0] ? windows()[0].event.toLowerCase() + ' ' + cdown(windows()[0].days) : 'none'}.` };
    const flagged = S.sections.filter(x => courseIssues(x).length), high = A.filter(s => s.risk === 'high').length;
    out.programme = { kind: high >= 15 ? 'crit' : flagged.length ? 'serious' : 'good', count: flagged.length + high,
      line: `${flagged.length} of ${S.sections.length} courses past an alert threshold; ${high} students at high academic risk.` };
    const behind = S.programs.filter(p => C.funnel[p.id].forecast < C.target[p.id]), apps = S.programs.reduce((a, p) => a + C.funnel[p.id].applications, 0), appsLY = S.programs.reduce((a, p) => a + C.funnel[p.id].appsPrevSameWeek, 0);
    const febGap = Object.values(C.feb.programs).reduce((a, x) => a + Math.max(0, x.target - x.deposits), 0);
    out.marketing = { kind: behind.some(p => C.funnel[p.id].forecastHigh < C.target[p.id]) ? 'crit' : behind.length || febGap ? 'serious' : 'good', count: behind.length + (febGap ? 1 : 0),
      line: `${behind.length ? behind.map(p => p.short).join(', ') + ' behind target for September 2027' : 'Every programme on target for September 2027'}; applications ${apps >= appsLY ? '+' : ''}${Math.round(100 * (apps - appsLY) / Math.max(1, appsLY))} % against last year; ${febGap} February deposits still needed.` };
    const stale = R.files.filter(f => f.open && f.lastTouchDays > S.thresholds.contact.late).length, visaFeb = R.files.filter(f => f.intake === '2027-02' && (f.visa === 'Visa letter to issue' || f.visa === 'Embassy appointment')).length, oldReq = R.requests.filter(r => r.oldestDays >= 30).length;
    out.admissions = { kind: stale > 10 || oldReq ? 'serious' : stale ? 'warn' : 'good', count: stale + visaFeb + oldReq,
      line: `${stale} open files with no contact for over ${S.thresholds.contact.late} days; ${visaFeb} February starters still at the visa letter or embassy step; ${oldReq} request type${oldReq === 1 ? '' : 's'} waiting over 30 days.` };
    const overdue = S.students.reduce((a, s) => a + s.overdue, 0), debtors = S.students.filter(s => s.overdue > 0).length, over60 = F.aging['61–90 days'] + F.aging['over 90 days'];
    out.finance = { kind: over60 > 150000 ? 'serious' : over60 ? 'warn' : 'good', count: S.students.filter(s => s.overdueDays > 60).length,
      line: `${chfK(overdue)} overdue across ${debtors} students, ${chfK(over60)} of it over 60 days; ${Math.round(100 * S.history.collectedYTD / S.history.invoicedYTD)} % of the year's tuition collected.` };
    const miss = Q.evidence.filter(e => e.status === 'missing').length, part = Q.evidence.filter(e => e.status === 'incomplete').length, goalsLow = Q.learningGoals.filter(g => g.met < g.target).length;
    out.quality = { kind: miss ? 'serious' : part ? 'warn' : 'good', count: miss + part,
      line: `${miss} pieces of evidence missing and ${part} incomplete, ${daysUntil(Q.nextVisit)} days before the visit; ${goalsLow} of ${Q.learningGoals.length} learning goals under target.` };
    const late = S.faculty.filter(f => f.ungraded > 20), maxF = S.faculty.slice().sort((a, b) => b.ungraded - a.ungraded)[0], noAvail = S.faculty.filter(f => !f.availabilitySent).length;
    out.professor = { kind: late.length ? 'serious' : noAvail ? 'warn' : 'good', count: late.length + noAvail,
      line: `${late.length} professor${late.length === 1 ? '' : 's'} with more than 20 submissions to grade (most: ${maxF.name}, ${maxF.ungraded}); ${noAvail} without spring availability.` };
    const atRisk = A.filter(s => s.risk === 'high' || s.risk === 'medium').length, blocked = A.filter(s => s.sections.some(x => S.util.rec(s.id, x).att < 80)).length;
    out.student = { kind: atRisk / A.length > 0.15 ? 'serious' : atRisk ? 'warn' : 'good', count: atRisk,
      line: `${atRisk} of ${A.length} students at risk (${Math.round(100 * atRisk / A.length)} %); ${blocked} under 80 % attendance in at least one course before exam registration.` };
    return out;
  }
  const KWORD = { crit: 'Critical', serious: 'Act', warn: 'Watch', good: 'On track', none: 'Passed' };

  /* =====================================================================
     ABSENCES (16 Nov 2026) — one flow for three roles. The student sends a request (student.html), the
     student office accepts or refuses it (admissions.html → Student office), and the professor sees a
     notice (professor.html). The seed requests are S.absences; what is done in this browser lives in ONE
     localStorage key, `dash_absences` = { added: [requests], decided: { id: {status, by, at, comment} } },
     so an action on one page shows on the others. Nothing is sent anywhere.
     Attendance figures in data.js are NOT recomputed: att() gives the overlay (missed, excused, and the
     rate counted without the excused sessions) next to the recorded figure.
     ===================================================================== */
  const abs = (function () {
    const KEY = 'dash_absences', AR = S.absenceRules, RN = {}; AR.reasons.forEach(r => RN[r.id] = r.name);
    const load = () => { let o = null; try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} return o && typeof o === 'object' ? { added: o.added || [], decided: o.decided || {} } : { added: [], decided: {} }; };
    const save = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
    function all() {
      const o = load();
      return S.absences.concat(o.added).map(r => { const d = o.decided[r.id]; return d ? Object.assign({}, r, d, { local: true }) : Object.assign({}, r); });
    }
    const nowStamp = () => S.school.today + 'T16:' + new Date().toTimeString().slice(3, 5);   /* the demo's "now" is 14 Nov 2026 at 16:00 */
    const addWork = (d, n) => { let t = d; while (n > 0) { const x = new Date(t + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + 1); t = x.toISOString().slice(0, 10); const wd = x.getUTCDay(); if (wd && wd !== 6) n--; } return t; };
    function send(sid, sessions, reason, note, doc) {
      const o = load(), s = S.util.byId(sid), n = S.absences.length + o.added.length + 1;
      const r = { id: 'A' + String(n).padStart(3, '0') + 'w', sid, prog: s.prog, sessions, reason, note, doc: doc || null, sent: nowStamp(), answerBy: addWork(S.school.today, AR.target), status: 'pending', by: null, at: null, comment: '', mine: true };
      o.added.push(r); save(o); return r;
    }
    function decide(id, status, by, comment) { const o = load(); o.decided[id] = { status, by, at: nowStamp(), comment: comment || '' }; save(o); }
    function undo(id) { const o = load(); delete o.decided[id]; save(o); }
    function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
    const forStudent = sid => all().filter(r => r.sid === sid);
    /* every session excused by an accepted request: [{sid, sec, date, n, reason, id}] */
    const excused = () => all().filter(r => r.status === 'accepted').flatMap(r => r.sessions.map(z => ({ sid: r.sid, sec: z.sec, date: z.date, n: z.n, reason: r.reason, id: r.id })));
    const excusedIn = secId => excused().filter(e => e.sec === secId);
    /* the attendance overlay for one student in one course */
    function att(sid, secId) {
      const x = S.util.sec(secId), r = S.util.rec(sid, secId), taken = x.sessionList.filter(z => z.held && z.attTaken);
      const present = Math.round(r.att * taken.length / 100), missed = taken.length - present;
      const ex = excused().filter(e => e.sid === sid && e.sec === secId), past = ex.filter(e => e.date < S.school.today), coming = ex.filter(e => e.date >= S.school.today);
      const exPast = Math.min(missed, past.filter(e => taken.some(z => z.date === e.date)).length);
      const counted = taken.length - exPast;
      return { recorded: r.att, taken: taken.length, present, missed, excused: exPast, absent: missed - exPast, coming: coming.length, adjusted: counted ? Math.round(100 * present / counted) : null, list: ex };
    }
    const reasonName = id => RN[id] || id;
    const statusSt = r => r.status === 'pending' ? st('warn', 'Waiting') : r.status === 'accepted' ? st('good', 'Accepted') : st('serious', 'Refused');
    /* the message the student receives after a decision (a demo: nothing is sent) */
    function message(r) {
      const s = S.util.byId(r.sid), list = r.sessions.map(z => `${S.util.sec(z.sec).title} on ${date(z.date)}`).join(', ');
      return r.status === 'accepted'
        ? `Hello ${s.name.split(' ')[0]}, your absence request is accepted for ${list}. ${r.sessions.length > 1 ? 'These sessions are' : 'This session is'} marked excused and ${r.sessions.length > 1 ? 'do' : 'does'} not count against the ${AR.attendance} % attendance rule.${r.comment ? ' ' + r.comment : ''} Your professors are told that you are excused. The student office`
        : `Hello ${s.name.split(' ')[0]}, your absence request for ${list} is refused. ${r.comment || (r.sessions.length > 1 ? 'The sessions count as absent.' : 'The session counts as absent.')} The student office`;
    }
    return { all, send, decide, undo, reset, forStudent, excused, excusedIn, att, reasonName, statusSt, message, addWork, KEY, rules: AR };
  })();

  return { abs, decisions, signals, windows, cdown, KWORD, courseIssues, courseRule, S, ROLES, PC, shell, chf, chfK, num, pct, date, dateLong, daysUntil, delta, tile, st, riskSt, progKey, esc };
})();
