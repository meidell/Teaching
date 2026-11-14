/* =====================================================================
   SCHOOL DATA — one fictitious Geneva business school, generated, static.
   14 Nov 2026, Jan Erik: "the world's best LMS, CRM and management system
   for business schools (BBA, Master, MBA, DBA), 100–400 students, Geneva …
   start with the perfect dashboards (static data) for the director, the
   programme managers, sales & marketing, the professor and the student."

   EVERYTHING HERE IS INVENTED. The school, the people and the numbers are
   made up so the dashboards can be designed against something realistic:
   ~310 students, Swiss grading (1–6, pass 4.0), ECTS credits, CHF fees,
   two intakes (September, February), the 80 % attendance rule, a CRM
   pipeline for the September 2027 intake compared week by week with the
   September 2026 cycle. Generated from a fixed seed, so every page sees the
   same school and the numbers agree across dashboards.
   "Today" is Saturday 14 November 2026, week 11 of the autumn term.
   ===================================================================== */
(function () {
  'use strict';
  /* ---- deterministic randomness ---- */
  let seed = 20261114;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  const pick = a => a[Math.floor(rnd() * a.length)];
  const between = (a, b) => a + rnd() * (b - a);
  const int = (a, b) => Math.floor(between(a, b + 1));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
  function gauss(m, s) { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function weighted(obj) { const tot = Object.values(obj).reduce((a, b) => a + b, 0); let x = rnd() * tot; for (const [k, w] of Object.entries(obj)) { x -= w; if (x <= 0) return k; } return Object.keys(obj)[0]; }

  const TODAY = '2026-11-14', TERM_WEEK = 11, TERM_WEEKS = 14;

  /* ---- the school and its programmes ---- */
  const school = { name: 'Lakeside School of Management', short: 'LSM', city: 'Geneva', term: 'Autumn 2026', today: TODAY, termWeek: TERM_WEEK, termWeeks: TERM_WEEKS, fictitious: true };
  const programs = [
    { id: 'bba', name: 'Bachelor of Business Administration', short: 'BBA', level: 'Bachelor', years: 3, ects: 180, fee: 31500, feeUnit: 'per year', mode: 'Full time · weekdays', manager: 'Claire Dubois', intakes: ['Sep', 'Feb'], capacity: 200 },
    { id: 'msc', name: 'MSc in International Management', short: 'MSc', level: 'Master', years: 1.5, ects: 90, fee: 36000, feeUnit: 'per year', mode: 'Full time · weekdays', manager: 'Marco Bernasconi', intakes: ['Sep', 'Feb'], capacity: 80 },
    { id: 'emba', name: 'Executive MBA', short: 'EMBA', level: 'MBA', years: 1.5, ects: 90, fee: 54000, feeUnit: 'programme', mode: 'Part time · Fri–Sat every other week', manager: 'Sophie Lambert', intakes: ['Sep', 'Feb'], capacity: 50 },
    { id: 'dba', name: 'Doctor of Business Administration', short: 'DBA', level: 'Doctorate', years: 3.5, ects: 180, fee: 62000, feeUnit: 'programme', mode: 'Part time · residencies + supervision', manager: 'Prof. Anil Mehta', intakes: ['Sep'], capacity: 30 },
  ];
  const P = {}; programs.forEach(p => P[p.id] = p);

  /* ---- a SECOND random stream for the student's own record (v2, 14 Nov 2026): curriculum history,
     assignment-by-assignment status, participation, contact details. Kept apart from rnd() so that
     adding detail here does not reshuffle the numbers the other seven dashboards were built on. ---- */
  let seed2 = 77011426;
  function rnd2() { seed2 |= 0; seed2 = seed2 + 0x6D2B79F5 | 0; let t = Math.imul(seed2 ^ seed2 >>> 15, 1 | seed2); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function gauss2(m, s) { let u = 0, v = 0; while (!u) u = rnd2(); while (!v) v = rnd2(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const pick2 = a => a[Math.floor(rnd2() * a.length)];

  /* ---- the academic rules a student is measured against ---- */
  const rules = {
    pass: 4.0, minGrade: 1.0, maxGrade: 6.0, attendance: 80,
    missingCounts: 1.0,   /* an assignment never handed in counts as the lowest grade */
    honours: [{ min: 5.0, name: 'with distinction' }, { min: 5.5, name: 'with high distinction' }],
    retake: 'A failed course is retaken once, in the same season one year later. The better of the two grades counts.',
  };
  /* ---- ONE set of alert thresholds for the whole system (programme v2, 14 Nov 2026: the programme page,
     the professor page and the overview's signals used three different sets). Every page reads these. ---- */
  const thresholds = {
    /* a COURSE is flagged when … */
    course: { attendance: 85, failShare: 15, gradingDays: 14, feedback: 3.8, handedIn: 85 },
    /* a STUDENT shows an academic warning sign when … (fees and permits are administrative, counted apart) */
    student: { attendance: 80, grade: 4.0, missing: 4, quietDays: 14, missingInCourse: 2, overdueDays: 30 },
    /* days since the last contact with an applicant, and since a request was opened */
    contact: { act: 7, late: 14 },
  };

  /* ---- the CURRICULUM: every semester of every programme, adding up to the programme's ECTS.
     Semester n is taught in autumn when n is odd and in spring when n is even; a semester marked
     `any` (the thesis or project semester) runs in both. A February intake therefore starts with
     semester 2 and takes semester 1 in its first autumn. `sec` names the autumn 2026 course section
     that teaches the item; items without a section (thesis, internship, project) are supervised. ---- */
  const C = (title, ects, type, extra) => Object.assign({ title, ects, type: type || 'course' }, extra || {});
  const curriculum = {
    bba: [
      { n: 1, items: [C('Principles of Management', 7.5), C('Financial Accounting', 7.5), C('Microeconomics', 7.5), C('Business Mathematics', 7.5)] },
      { n: 2, items: [C('Macroeconomics', 7.5), C('Management Accounting', 7.5), C('Business Communication', 7.5), C('Introduction to Law', 7.5)] },
      { n: 3, items: [C('Marketing Fundamentals', 7.5), C('Corporate Finance', 7.5), C('Statistics for Business', 7.5), C('Organisational Behaviour', 7.5)] },
      { n: 4, note: 'You may spend this semester on exchange at a partner university instead; its 30 ECTS replace the four courses.', items: [C('Operations Management', 7.5), C('Business Ethics', 7.5), C('Elective 1', 7.5, 'elective'), C('Elective 2', 7.5, 'elective')] },
      { n: 5, items: [C('Strategic Management', 7.5), C('Digital Business & AI', 7.5), C('International Business Law', 7.5), C('Entrepreneurship Lab', 7.5)] },
      { n: 6, items: [C('Internship (at least 12 weeks)', 15, 'internship'), C('Bachelor thesis', 15, 'thesis')] },
    ],
    msc: [
      { n: 1, items: [C('Global Strategy', 7.5), C('Managerial Finance', 7.5), C('Data Analytics for Managers', 7.5), C('Cross-cultural Leadership', 7.5)] },
      { n: 2, items: [C('International Marketing', 7.5), C('Corporate Governance', 7.5), C('Specialisation course 1', 7.5, 'elective'), C('Specialisation course 2', 7.5, 'elective')] },
      { n: 3, any: true, items: [C('Sustainable Supply Chains', 6), C('Research Methods', 6), C('Master thesis', 18, 'thesis')] },
    ],
    emba: [
      { n: 1, items: [C('Leading Change', 10), C('Finance for Executives', 10), C('Strategy Execution', 10)] },
      { n: 2, items: [C('Marketing for Executives', 10), C('Operations & Innovation', 10), C('International residency (one week abroad)', 10)] },
      { n: 3, any: true, items: [C('Digital Transformation', 6), C('Negotiation', 6), C('Applied workplace project', 18, 'project')] },
    ],
    dba: [
      { n: 1, items: [C('Advanced Research Design', 10), C('Quantitative Methods', 10), C('Research proposal', 10, 'milestone')] },
      { n: 2, items: [C('Qualitative Methods', 10), C('Literature review', 10, 'milestone'), C('Proposal defence and ethics approval', 10, 'milestone')] },
      { n: 3, items: [C('Doctoral Seminar I', 10, 'course', { sec: 'Doctoral Seminar' }), C('Thesis research: data collection', 20, 'thesis')] },
      { n: 4, items: [C('Thesis research: analysis', 30, 'thesis')] },
      { n: 5, items: [C('Doctoral Seminar II', 10, 'course', { sec: 'Doctoral Seminar' }), C('Thesis research: first full draft', 10, 'thesis')] },
      { n: 6, items: [C('Thesis writing', 20, 'thesis')] },
      { n: 7, items: [C('Doctoral Seminar III', 10, 'course', { sec: 'Doctoral Seminar' }), C('Thesis submission and defence', 10, 'thesis')] },
    ],
  };
  /* codes: an item taught by a current section takes the section's code (set below); every other
     item gets <PROG><semester>5<n>, which no section code uses */
  Object.entries(curriculum).forEach(([pid, sems]) => sems.forEach(m => m.items.forEach((it, i) => { it.sem = m.n; it.code = pid.toUpperCase().slice(0, 3) + (m.n * 100 + 50 + i + 1); if (!it.sec && it.type === 'course') it.sec = it.title; })));
  const ELECTIVES = { bba: ['Luxury Brand Management', 'Sports Business', 'Fintech Fundamentals', 'Hospitality Management', 'Family Business', 'Sustainability Reporting'], msc: ['Specialisation: Finance · Valuation', 'Specialisation: Finance · Risk', 'Specialisation: Marketing · Brand Strategy', 'Specialisation: Marketing · Digital Analytics'] };
  const ectsOf = (pid, title) => { for (const m of curriculum[pid]) for (const it of m.items) if (it.sec === title) return it.ects; return 6; };

  /* ---- names ---- */
  const FIRST = ['Léa', 'Lucas', 'Chloé', 'Noah', 'Emma', 'Luca', 'Sofia', 'Matteo', 'Aisha', 'Omar', 'Yasmine', 'Karim', 'Priya', 'Arjun', 'Mei', 'Wei', 'Hana', 'Kenji', 'Amara', 'Chinedu', 'Fatou', 'Mamadou', 'Ana', 'João', 'Camila', 'Diego', 'Olga', 'Dmitri', 'Elif', 'Mehmet', 'Nour', 'Rami', 'Sara', 'David', 'Laura', 'Nicolas', 'Julia', 'Thomas', 'Anna', 'Max', 'Inès', 'Hugo', 'Zoé', 'Elias', 'Mila', 'Leon', 'Alice', 'Samuel', 'Nina', 'Jonas', 'Lina', 'Adam', 'Maya', 'Yann', 'Clara', 'Gabriel', 'Rania', 'Tarek', 'Ayşe', 'Ivan'];
  const LAST = ['Müller', 'Meier', 'Rossi', 'Bianchi', 'Dubois', 'Martin', 'Bernard', 'Favre', 'Rochat', 'Keller', 'Schmid', 'Gerber', 'Haddad', 'Khoury', 'Sharma', 'Patel', 'Chen', 'Wang', 'Tanaka', 'Sato', 'Okafor', 'Adeyemi', 'Diallo', 'Ndiaye', 'Silva', 'Santos', 'García', 'López', 'Ivanova', 'Petrov', 'Yılmaz', 'Demir', 'Mansour', 'Farah', 'Novak', 'Kovač', 'Andersen', 'Lindqvist', "O'Brien", 'Moreau', 'Laurent', 'Girard', 'Perrin', 'Fontana', 'Ricci', 'Weber', 'Wagner', 'Hoffmann', 'Kim', 'Park', 'Nguyen', 'Tran', 'Rahman', 'Hossain', 'Mendes', 'Costa', 'Abdi', 'Hassan', 'Zhou', 'Lin'];
  const used = new Set();
  function person() { let n; do { n = pick(FIRST) + ' ' + pick(LAST); } while (used.has(n)); used.add(n); return n; }

  const REGIONS = { CH: 'Switzerland', FR: 'France', EU: 'Rest of Europe', ME: 'Middle East', AF: 'Africa', AS: 'Asia', AM: 'Americas' };
  const MIX = {
    bba: { CH: 30, FR: 14, EU: 16, ME: 12, AF: 10, AS: 12, AM: 6 },
    msc: { CH: 12, FR: 10, EU: 18, ME: 14, AF: 16, AS: 22, AM: 8 },
    emba: { CH: 55, FR: 20, EU: 12, ME: 6, AF: 3, AS: 2, AM: 2 },
    dba: { CH: 30, FR: 15, EU: 15, ME: 15, AF: 15, AS: 5, AM: 5 },
  };

  /* ---- faculty ---- */
  const AREAS = ['Finance', 'Accounting', 'Marketing', 'Strategy', 'Economics', 'Data & AI', 'Operations', 'Leadership & HR', 'Law & Ethics', 'Entrepreneurship', 'Statistics', 'Digital Business'];
  const faculty = [];
  const facNames = ['Dr. Hélène Favre', 'Prof. Jan Erik Meidell', 'Dr. Paolo Ricci', 'Dr. Nadia Haddad', 'Prof. Thomas Keller', 'Dr. Aiko Tanaka', 'Dr. Samuel Okafor', 'Dr. Isabelle Moreau', 'Prof. Anil Mehta', 'Dr. Lars Andersen', 'Dr. Camille Perrin', 'Dr. Youssef Mansour', 'Dr. Elena Ivanova', 'Dr. Marc Gerber', 'Dr. Priya Sharma', 'Dr. Luca Fontana', 'Dr. Sarah Weber', 'Dr. Daniel Costa'];
  facNames.forEach((n, i) => { used.add(n.replace(/^(Dr\.|Prof\.) /, ''));
    faculty.push({ id: 'f' + (i + 1), name: n, area: AREAS[i % AREAS.length], type: i < 7 ? 'Core faculty' : 'Adjunct', contractBasis: 'teaching hours for the autumn 2026 term', contractHours: i < 7 ? 180 : int(40, 90), eval: r1(clamp(gauss(4.25, 0.35), 3.2, 4.9)), availabilitySent: rnd() > 0.28 }); });

  /* ---- the autumn 2026 course sections ---- */
  const COURSE_TITLES = {
    bba: [['Principles of Management', 1], ['Financial Accounting', 1], ['Microeconomics', 1], ['Business Mathematics', 1], ['Marketing Fundamentals', 2], ['Corporate Finance', 2], ['Statistics for Business', 2], ['Organisational Behaviour', 2], ['Strategic Management', 3], ['Digital Business & AI', 3], ['International Business Law', 3], ['Entrepreneurship Lab', 3]],
    msc: [['Global Strategy', 1], ['Managerial Finance', 1], ['Data Analytics for Managers', 1], ['Cross-cultural Leadership', 1], ['Sustainable Supply Chains', 2], ['Research Methods', 2]],
    emba: [['Leading Change', 1], ['Finance for Executives', 1], ['Strategy Execution', 1], ['Digital Transformation', 2], ['Negotiation', 2]],
    dba: [['Advanced Research Design', 1], ['Quantitative Methods', 1], ['Doctoral Seminar', 2]],
  };
  const AREA_OF = t => /Account/.test(t) ? 'Accounting' : /Financ/.test(t) ? 'Finance' : /Market/.test(t) ? 'Marketing' : /Strateg/.test(t) ? 'Strategy' : /econom/i.test(t) ? 'Economics' : /Data|Digital|AI/.test(t) ? 'Data & AI' : /Supply/.test(t) ? 'Operations' : /Leader|Behaviour|Change|Management/.test(t) ? 'Leadership & HR' : /Law/.test(t) ? 'Law & Ethics' : /Entrepre|Negotiation/.test(t) ? 'Entrepreneurship' : /Statist|Math|Quantitative|Research/.test(t) ? 'Statistics' : 'Digital Business';
  const sections = [];
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let secN = 0;
  Object.entries(COURSE_TITLES).forEach(([pid, list]) => list.forEach(([title, yr]) => {
    const area = AREA_OF(title);
    const cands = faculty.filter(f => f.area === area);
    const prof = cands.length ? pick(cands) : pick(faculty);
    secN++;
    const day = pid === 'emba' ? pick(['Fri', 'Sat']) : pid === 'dba' ? 'Sat' : pick(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    const start = pid === 'emba' || pid === 'dba' ? pick([9, 13.5]) : pick([8.5, 10.25, 13.5, 15.25]);
    sections.push({ id: 's' + secN, code: pid.toUpperCase().slice(0, 3) + (yr * 100 + secN % 50), title, prog: pid, year: yr, prof: prof.id, ects: ectsOf(pid, title),
      day, start, hours: pid === 'emba' || pid === 'dba' ? 3.5 : 1.5 * 2, room: pick(['A101', 'A204', 'B12', 'B15', 'C3 (lab)', 'Aula', 'Online']), sessions: TERM_WEEKS, held: pid === 'emba' ? 6 : pid === 'dba' ? 3 : TERM_WEEK - 1,
      quality: clamp(gauss(0, 1), -2.2, 2.2) /* hidden: how well this course is going */, students: [] });
  }));

  /* the instructor whose site this is teaches the statistics */
  const jem = faculty.find(f => /Meidell/.test(f.name)); jem.area = 'Statistics';
  sections.filter(x => /Statistics|Quantitative|Data Analytics/.test(x.title)).forEach(x => x.prof = jem.id);
  /* every faculty member teaches at least one section: take one from whoever has the most */
  faculty.forEach(f => {
    if (sections.some(x => x.prof === f.id)) return;
    const load = {}; sections.forEach(x => load[x.prof] = (load[x.prof] || 0) + 1);
    const busiest = Object.keys(load).sort((a, b) => load[b] - load[a])[0];
    const give = sections.filter(x => x.prof === busiest).pop(); give.prof = f.id;
  });

  /* ---- students ---- */
  const COHORTS = {
    bba: [['2026-09', 1, 58], ['2026-02', 1, 9], ['2025-09', 2, 52], ['2025-02', 2, 6], ['2024-09', 3, 49]],
    msc: [['2026-09', 1, 34], ['2026-02', 1, 12], ['2025-09', 2, 24]],
    emba: [['2026-09', 1, 26], ['2026-02', 1, 11], ['2025-09', 2, 14]],
    dba: [['2026-09', 1, 7], ['2025-09', 2, 6], ['2024-09', 3, 5], ['2023-09', 4, 4]],
  };
  const students = [];
  let stN = 0;
  Object.entries(COHORTS).forEach(([pid, list]) => list.forEach(([cohort, yr, n]) => {
    for (let i = 0; i < n; i++) {
      stN++;
      const region = weighted(MIX[pid]);
      const ability = gauss(0, 1), engagement = gauss(0, 1);
      const age = pid === 'bba' ? int(18, 24) : pid === 'msc' ? int(22, 30) : pid === 'emba' ? int(31, 49) : int(35, 58);
      const s = { id: 'st' + stN, name: person(), prog: pid, cohort, year: yr, region, nationality: REGIONS[region], age, ability, engagement,
        advisor: pick(faculty.filter(f => f.type === 'Core faculty')).id, sections: [], status: 'active' };
      /* withdrawals and leaves this year, mostly from the less engaged */
      const wr = engagement < -1.4 ? 0.35 : engagement < -0.8 ? 0.08 : 0.01;
      if (rnd() < wr) s.status = rnd() < 0.6 ? 'withdrawn' : 'on leave';
      students.push(s);
    }
  }));
  /* enrol each active student in the sections of their programme and year */
  students.forEach(s => {
    if (s.status !== 'active') return;
    sections.filter(x => x.prog === s.prog && (x.year === s.year || (s.prog === 'dba' && s.year > 2 && x.year === 2))).forEach(x => { s.sections.push(x.id); x.students.push(s.id); });
  });

  /* ---- per student, per section: attendance, grades, submissions, and weekly attendance ---- */
  const records = {};   /* key st|sec */
  const weekAtt = {};   /* sec → [week 1..held] attendance % */
  sections.forEach(x => {
    weekAtt[x.id] = [];
    for (let w = 1; w <= x.held; w++) {
      const drift = -0.9 * (w - 1) * (x.quality < -0.8 ? 1.6 : 0.7);
      weekAtt[x.id].push(r1(clamp(93 + x.quality * 2.5 + drift + gauss(0, 2.2), 55, 100)));
    }
  });
  /* ---- the term calendar: week 1 starts Monday 31 August 2026 ---- */
  const WEEK1 = Date.UTC(2026, 7, 31);
  const dayOf = (w, d) => new Date(WEEK1 + ((w - 1) * 7 + Math.max(0, DAYS.indexOf(d))) * 864e5).toISOString().slice(0, 10);
  const weekStart = w => dayOf(w, 'Mon');
  /* the grading scheme of every section: assignments 40 %, participation 10 %, the final 50 % */
  const SPLITS = [[5, 10, 5, 10, 10], [10, 5, 10, 5, 10], [8, 8, 8, 8, 8], [5, 5, 10, 10, 10]];
  const ANAMES = ['Case analysis', 'Problem set', 'Group project milestone', 'Reflection paper', 'Quiz', 'Data exercise'];
  sections.forEach(x => {
    curriculum[x.prog].forEach(m => m.items.forEach(it => { if (it.sec === x.title) { it.code = x.code; } }));
    x.components = { assignments: 40, participation: 10, final: 50, finalName: x.prog === 'dba' ? 'Final paper' : x.prog === 'emba' ? 'Final case exam' : 'Final exam' };
  });
  /* five assignments per section, due on the day the class meets: three before today, two after */
  const ASG = {}, assignments = [];
  sections.forEach(x => {
    const split = pick2(SPLITS), weeks = [2 + Math.floor(rnd2() * 3), 5 + Math.floor(rnd2() * 3), 8 + Math.floor(rnd2() * 3), 12 + Math.floor(rnd2() * 2), 14];
    ASG[x.id] = weeks.map((w, k) => { const due = dayOf(w, x.day);
      const a = { id: x.id + 'a' + k, sec: x.id, n: k + 1, title: pick2(ANAMES) + ' ' + (k + 1), week: w, due, weight: split[k], past: due < TODAY };
      assignments.push(a); return a; });
  });
  const FB = {
    hi: ['Clear structure, and every number is traced to the data. Keep this level for the exam.', 'Your recommendation follows from the analysis and says what to do first. Well done.', 'Strong work. The comparison table made the argument easy to check.'],
    mid: ['The analysis is correct, but the recommendation does not say what the company should do first.', 'Show your calculation steps: two figures could not be traced to the data.', 'Good start. Answer the question asked in part 2 directly before you discuss alternatives.'],
    lo: ['The main question is not answered. Come to an office hour and we will go through the method together.', 'Several calculations are wrong. Redo part 2 with the formula from the session slides and hand it in again.', 'The text describes the case but does not analyse it. Use the framework from the course to structure your answer.'],
  };
  const comment = g => pick2(g >= 5 ? FB.hi : g >= 4 ? FB.mid : FB.lo);

  students.forEach(s => {
    if (s.status !== 'active') return;
    s.sections.forEach(sid => {
      const x = sections.find(y => y.id === sid);
      const att = clamp(Math.round(88 + s.engagement * 7 + x.quality * 2.5 + gauss(0, 4)), 35, 100);
      /* the draws of the first version are kept in the same order, so the other dashboards keep their numbers */
      const subsTotalV1 = Math.max(2, Math.round(x.held * 0.4));
      const handIn = clamp(0.9 + s.engagement * 0.12 + gauss(0, 0.06), 0.2, 1);
      const subsDoneV1 = clamp(Math.round(subsTotalV1 * handIn), 0, subsTotalV1);
      const level = r1(clamp(4.85 + s.ability * 0.45 + s.engagement * 0.22 + x.quality * 0.15 + gauss(0, 0.28), 1.5, 6));
      const waiting = subsDoneV1 && rnd() < (x.quality < -1 ? 0.32 : 0.07) ? 1 : 0;
      const lastSubmitDays = int(0, s.engagement < -1 ? 21 : 9);
      /* each assignment: due (not yet), missing, submitted (not graded yet) or graded, with a grade and feedback */
      const asg = ASG[sid].map(a => {
        if (!a.past) return { a: a.id, st: 'due' };
        if (rnd2() > handIn) return { a: a.id, st: 'missing' };
        const g = r1(clamp(level + gauss2(0, 0.35), 1, 6));
        return { a: a.id, st: 'graded', g, fb: comment(g), late: rnd2() < 0.06 };
      });
      /* "not graded yet" is always the most recent assignment, handed in after the last grading round */
      if (waiting) { const lastPast = asg.filter(z => z.st !== 'due').pop(), dueA = lastPast && ASG[sid].find(a => a.id === lastPast.a), waited = dueA ? (Date.parse(TODAY) - Date.parse(dueA.due)) / 864e5 : 0;
        /* a course that is going well grades within two weeks; only a struggling one lets work wait longer */
        if (lastPast && lastPast.st === 'graded' && (waited <= 14 || x.quality < -1)) { lastPast.st = 'submitted'; delete lastPast.g; delete lastPast.fb; delete lastPast.late; } }
      const graded = asg.filter(z => z.st === 'graded'), wOf = z => ASG[sid].find(a => a.id === z.a).weight;
      const grade = graded.length ? r1(graded.reduce((t, z) => t + z.g * wOf(z), 0) / graded.reduce((t, z) => t + wOf(z), 0)) : level;
      const past = asg.filter(z => z.st !== 'due');
      /* participation so far: the professor's interim mark, mostly from attendance */
      const part = r1(clamp(3.4 + (att - 75) / 12 + s.engagement * 0.3 + gauss2(0, 0.3), 1, 6));
      records[s.id + '|' + sid] = { att, subsTotal: past.length, subsDone: past.filter(z => z.st !== 'missing').length, grade, ungraded: asg.filter(z => z.st === 'submitted').length, lastSubmitDays, asg, part };
    });
  });

  /* ---- each student's path through the curriculum: terms from intake to graduation ---- */
  const seasonName = t => (t.s === 'A' ? 'Autumn ' : 'Spring ') + t.y;
  const nextT = t => t.s === 'A' ? { s: 'S', y: t.y + 1 } : { s: 'A', y: t.y };
  const intakeT = c => c.slice(5) === '09' ? { s: 'A', y: +c.slice(0, 4) } : { s: 'S', y: +c.slice(0, 4) };
  const NOW_T = { s: 'A', y: 2026 }, same = (a, b) => a.s === b.s && a.y === b.y;
  const endOf = t => t.s === 'A' ? `January ${t.y + 1}` : `June ${t.y}`;
  function buildPlan(s) {
    const sems = curriculum[s.prog], done = new Set(), terms = [];
    const fits = (m, t) => !done.has(m.n) && (m.any || (t.s === 'A' ? m.n % 2 === 1 : m.n % 2 === 0));
    let t = intakeT(s.cohort), guard = 0;
    while (done.size < sems.length && guard++ < 20) {
      const when = same(t, NOW_T) ? 'now' : (t.y < NOW_T.y || (t.y === NOW_T.y && t.s === 'S')) ? 'past' : 'future';
      const m = sems.find(x => fits(x, t));
      if (m) { done.add(m.n); terms.push({ label: seasonName(t), t, sem: m.n, when, note: m.note || null, items: [] }); }
      t = nextT(t);
    }
    const prof = area => { const c = faculty.filter(f => f.area === area); return (c.length ? pick2(c) : pick2(faculty)).id; };
    const usedEl = new Set(), retakes = [];
    terms.forEach(term => {
      sems.find(m => m.n === term.sem).items.forEach(it0 => {
        const it = { code: it0.code, title: it0.title, ects: it0.ects, type: it0.type, sem: it0.sem };
        if (it0.type === 'elective' && term.when === 'past' && ELECTIVES[s.prog]) { let e; do { e = pick2(ELECTIVES[s.prog]); } while (usedEl.has(e) && usedEl.size < ELECTIVES[s.prog].length); usedEl.add(e); it.title = e; it.elective = true; }
        if (term.when === 'now') { const x = sections.find(y => y.title === it0.sec && s.sections.includes(y.id)); it.status = 'now'; if (x) { it.secId = x.id; it.prof = x.prof; it.code = x.code; } }
        else if (term.when === 'future') it.status = 'planned';
        else {
          it.prof = prof(AREA_OF(it.title));
          const g = r1(clamp(4.85 + s.ability * 0.45 + s.engagement * 0.2 + gauss2(0, 0.35), 2.5, 6));
          it.grade = g; it.att = clamp(Math.round(88 + s.engagement * 7 + gauss2(0, 5)), 45, 100);
          /* a failed course is retaken in the same season one year later: already done, running now, or still ahead */
          const rt = nextT(nextT(term.t)), nowTerm = terms.find(x => x.when === 'now');
          if (g >= rules.pass) it.status = 'passed';
          else if (same(rt, NOW_T)) { it.status = 'failedNow'; it.retakeTerm = seasonName(rt);
            nowTerm.items.push({ code: it.code, title: it.title, ects: it.ects, type: it.type, sem: it.sem, status: 'now', retakeOf: g }); }
          else if (rt.y > NOW_T.y || (rt.y === NOW_T.y && rt.s === 'A')) { it.status = 'retake'; it.retakeTerm = seasonName(rt); it.retakeT = rt; retakes.push(it); }
          else { it.status = 'passed'; it.firstGrade = g; it.grade = r1(4 + rnd2() * 0.9); it.retakeTerm = seasonName(rt); }
        }
        term.items.push(it);
      });
      const gi = term.items.filter(i => i.grade != null);
      term.avg = gi.length ? r2(gi.reduce((a, i) => a + i.grade * i.ects, 0) / gi.reduce((a, i) => a + i.ects, 0)) : null;
      term.att = gi.length ? Math.round(gi.reduce((a, i) => a + i.att, 0) / gi.length) : null;
      term.ects = term.items.reduce((a, i) => a + i.ects, 0);
    });
    const all = terms.flatMap(x => x.items), passed = all.filter(i => i.status === 'passed');
    const earned = passed.reduce((a, i) => a + i.ects, 0);
    const avg = passed.length ? r2(passed.reduce((a, i) => a + i.grade * i.ects, 0) / earned) : null;
    /* graduation: the end of the last semester, or of a retake term if one comes later */
    let gradT = terms[terms.length - 1].t;
    retakes.forEach(r => { if (r.retakeT.y > gradT.y || (r.retakeT.y === gradT.y && r.retakeT.s === 'A' && gradT.s === 'S')) gradT = r.retakeT; });
    const onSchedule = same(gradT, terms[terms.length - 1].t);
    return { terms, earned, now: terms.find(x => x.when === 'now').ects, left: P[s.prog].ects - earned - terms.find(x => x.when === 'now').ects,
      avg, retakes, grad: { term: seasonName(gradT), date: endOf(gradT), onSchedule, scheduled: endOf(terms[terms.length - 1].t) } };
  }

  /* =====================================================================
     SESSIONS — one row per meeting of every section (professor v2, 14 Nov 2026):
     date, topic, kind, materials posted, attendance taken, what was covered.
     Weekly courses (BBA, MSc) meet in each of the 14 weeks; the EMBA meets on
     the teaching weekends of the odd weeks (7 times); the DBA meets in four
     residencies (weeks 1, 5, 9, 13). A session is held when its date is
     before today. Built after the records, so the first version's draws are
     untouched; x.held and x.sessions now come from this list.
     ===================================================================== */
  const TOPICS = {
    Finance: ['Time value of money', 'Risk and return', 'Cost of capital', 'Capital budgeting', 'Valuation with DCF', 'Capital structure', 'Working capital'],
    Accounting: ['The accounting equation', 'The income statement', 'The balance sheet', 'The cash-flow statement', 'Accruals and adjustments', 'Ratio analysis', 'Cost behaviour'],
    Marketing: ['Customer needs and segments', 'Targeting and positioning', 'The product and the brand', 'Pricing', 'Channels', 'Communication and digital media', 'The marketing plan'],
    Strategy: ['What strategy is', 'Industry analysis', 'Resources and capabilities', 'Competitive advantage', 'Corporate strategy', 'International strategy', 'Executing a strategy'],
    Economics: ['Supply and demand', 'Elasticity', 'Costs and production', 'Market structures', 'Market failure', 'Macroeconomic indicators', 'Monetary and fiscal policy'],
    'Data & AI': ['Data in business decisions', 'Cleaning and preparing data', 'Descriptive analytics', 'Dashboards that answer a question', 'Predictive models', 'Machine learning in practice', 'AI governance and limits'],
    Operations: ['Processes and capacity', 'Inventory', 'Quality management', 'Supply-chain design', 'Sourcing and suppliers', 'Sustainability in the chain', 'Risk and resilience'],
    'Leadership & HR': ['What leaders do', 'Motivation', 'Teams and groups', 'Communication', 'Power and influence', 'Culture', 'Leading change'],
    'Law & Ethics': ['Legal systems and sources', 'Contracts', 'Company law', 'Employment law', 'Intellectual property', 'Competition law', 'Ethics and compliance'],
    Entrepreneurship: ['Finding an opportunity', 'Customer discovery', 'The business model', 'Prototyping and testing', 'Financing a venture', 'Negotiating with partners', 'The pitch'],
    Statistics: ['Describing data', 'Probability', 'Distributions', 'Sampling and estimation', 'Hypothesis tests', 'Regression', 'Forecasting'],
    'Digital Business': ['Digital business models', 'Platforms', 'E-commerce', 'Digital marketing', 'Data and privacy', 'Technology strategy', 'Digital transformation'],
  };
  const MATS = ['Slides', 'Reading', 'Exercise sheet', 'Case', 'Dataset', 'Video'];
  sections.forEach(x => {
    const weeks = x.prog === 'emba' ? [1, 3, 5, 7, 9, 11, 13] : x.prog === 'dba' ? [1, 5, 9, 13] : Array.from({ length: TERM_WEEKS }, (_, i) => i + 1);
    const tl = TOPICS[AREA_OF(x.title)] || TOPICS['Digital Business'], n = weeks.length;
    /* attendance by session: the first version generated it for the sessions held before week 11;
       a held session after that gets a value from the second stream, on the same drift */
    const att = weekAtt[x.id];
    let carry = 0;
    x.sessionList = weeks.map((w, i) => {
      const date = dayOf(w, x.day), held = date < TODAY;
      const topic = n >= 14 ? (i === 0 ? 'Introduction and course plan' : i === n - 1 ? 'Review and exam preparation' : tl[Math.floor((i - 1) / 2) % tl.length] + (i % 2 ? ' · lecture' : ' · case workshop'))
        : n === 7 ? tl[i] : ['Residency 1 · ' + tl[0] + ' and ' + tl[1], 'Residency 2 · ' + tl[2] + ' and ' + tl[3], 'Residency 3 · ' + tl[4] + ' and ' + tl[5], 'Residency 4 · ' + tl[6] + ' and thesis colloquium'][i];
      const kind = n >= 14 ? (i === 0 || i === n - 1 ? 'Lecture' : i % 2 ? 'Lecture' : 'Case workshop') : n === 7 ? 'Teaching weekend' : 'Residency';
      const ses = { n: i + 1, week: w, date, start: x.start, hours: x.hours, topic, kind, held, room: x.room, due: [] };
      if (held) {
        if (att[i] == null) att[i] = r1(clamp(93 + x.quality * 2.5 - 0.9 * i * (x.quality < -0.8 ? 1.6 : 0.7) + gauss2(0, 2.2), 55, 100));
        ses.attTaken = rnd2() < (x.quality < -1 ? 0.8 : 0.95);
        ses.att = ses.attTaken ? att[i] : null;
        ses.materials = MATS.slice(0, 2 + Math.floor(rnd2() * 2)).map(m => ({ name: m, posted: true }));
        if (carry) { ses.covered = 'partly'; ses.note = 'Also finished the end of the previous session.'; carry = 0; }
        if (rnd2() < (x.quality < -0.8 ? 0.25 : 0.1)) { ses.covered = 'partly'; ses.note = 'Ran out of time: the last part moves to the next session.'; carry = 1; }
        else if (!ses.covered) ses.covered = 'as planned';
      } else {
        const next = !x.sessionNextSet; x.sessionNextSet = true; ses.next = next;
        ses.materials = MATS.slice(0, 2).map(m => ({ name: m, posted: next ? rnd2() < 0.6 : false }));
      }
      return ses;
    });
    delete x.sessionNextSet;
    /* not taken = no figure: the chart shows a gap */
    att.length = x.sessionList.filter(z => z.held).length;
    x.sessionList.forEach((z, i) => { if (z.held && !z.attTaken) att[i] = null; });
    ASG[x.id].forEach(a => { const z = x.sessionList.slice().reverse().find(q => q.date <= a.due) || x.sessionList[0]; z.due.push(a.id); a.session = z.n; });
    x.held = x.sessionList.filter(z => z.held).length;
    x.sessions = n;
    if (x.prog === 'dba') x.residencies = x.sessionList.map(z => z.date);
  });

  /* ---- student roll-ups ---- */
  students.forEach(s => {
    const recs = s.sections.map(sid => records[s.id + '|' + sid]);
    s.attendance = recs.length ? Math.round(recs.reduce((a, r) => a + r.att, 0) / recs.length) : null;
    s.avgGrade = recs.length ? r1(recs.reduce((a, r) => a + r.grade, 0) / recs.length) : null;
    s.missing = recs.reduce((a, r) => a + (r.subsTotal - r.subsDone), 0);
    s.lastLoginDays = s.status !== 'active' ? int(30, 120) : clamp(Math.round(Math.abs(gauss(1.5 - s.engagement * 2.5, 3))), 0, 40);
    const p = P[s.prog];
    const perYearCredits = p.ects / p.years;
    s.ectsReq = p.ects;
    if (s.status === 'active') {
      /* credits come from the course history: what was passed before this term, what is taken now */
      s.plan = buildPlan(s);
      s.ectsEarned = s.plan.earned; s.ectsThisTerm = s.plan.now;
    } else {
      s.ectsEarned = Math.round(clamp((s.year - 1) * perYearCredits * clamp(0.95 + s.ability * 0.04, 0.8, 1), 0, p.ects));
      s.ectsThisTerm = 0;
    }
    /* fees: invoiced this academic year, paid, overdue */
    const annual = p.feeUnit === 'per year' ? p.fee : Math.round(p.fee / p.years);
    s.scholarship = rnd() < (s.prog === 'bba' ? 0.18 : s.prog === 'msc' ? 0.25 : 0.06) ? pick([10, 15, 20, 25, 30]) : 0;
    s.invoiced = s.status === 'withdrawn' ? Math.round(annual * 0.5) : Math.round(annual * (1 - s.scholarship / 100));
    const payProfile = rnd() * 0.96 + (s.engagement > 0 ? 0.04 : 0);
    s.paid = payProfile < 0.8 ? s.invoiced : payProfile < 0.93 ? Math.round(s.invoiced * pick([0.5, 0.66, 0.75])) : Math.round(s.invoiced * pick([0, 0.25, 0.33]));
    s.overdue = Math.max(0, s.invoiced - s.paid - (payProfile < 0.93 && payProfile >= 0.8 ? Math.round(s.invoiced * 0.25) : 0));
    s.overdueDays = s.overdue ? int(5, 95) : 0;
    s.visa = (s.region === 'CH' || s.region === 'FR' || s.region === 'EU') ? null : (rnd() < 0.08 ? 'renewal pending' : 'valid');
    /* risk: the reasons, each one checkable */
    /* the risk level counts ACADEMIC signs only; fees and permits are listed apart and never added in */
    const why = [], adm = [], T = thresholds.student;
    if (s.status === 'active') {
      if (s.attendance !== null && s.attendance < T.attendance) why.push(`attendance ${s.attendance} % (rule: ${T.attendance} %)`);
      if (s.avgGrade !== null && s.avgGrade < T.grade) why.push(`average ${s.avgGrade.toFixed(1)} (pass: ${T.grade.toFixed(1)})`);
      if (s.missing >= T.missing) why.push(`${s.missing} assignments not handed in`);
      if (s.lastLoginDays >= T.quietDays) why.push(`no login for ${s.lastLoginDays} days`);
      if (s.overdueDays > T.overdueDays) adm.push(`CHF ${s.overdue.toLocaleString('en-CH')} overdue ${s.overdueDays} days`);
      if (s.visa === 'renewal pending') adm.push('residence permit renewal pending');
    }
    s.riskReasons = why; s.adminReasons = adm;
    s.risk = why.length >= 3 ? 'high' : why.length === 2 ? 'medium' : why.length === 1 ? 'watch' : 'none';
    s.satisfaction = s.status === 'active' ? r1(clamp(gauss(4.0 + s.engagement * 0.25, 0.5), 1, 5)) : null;
  });

  /* ---- section roll-ups ---- */
  sections.forEach(x => {
    const recs = x.students.map(id => records[id + '|' + x.id]);
    x.enrolled = recs.length;
    x.attendance = recs.length ? Math.round(recs.reduce((a, r) => a + r.att, 0) / recs.length) : null;
    x.avgGrade = recs.length ? r1(recs.reduce((a, r) => a + r.grade, 0) / recs.length) : null;
    x.failRate = recs.length ? Math.round(100 * recs.filter(r => r.grade < 4).length / recs.length) : null;
    x.ungraded = recs.reduce((a, r) => a + r.ungraded, 0);
    int(3, x.quality < -1 ? 24 : 12);   /* the first version's draw, kept for the numbers after it */
    /* how long the oldest submission has waited: from its due date to today */
    const waitDays = recs.flatMap(r => r.asg.filter(z => z.st === 'submitted').map(z => Math.round((Date.parse(TODAY) - Date.parse(ASG[x.id].find(a => a.id === z.a).due)) / 864e5)));
    x.oldestUngradedDays = waitDays.length ? Math.max(...waitDays) : 0;
    x.submissionRate = recs.length ? Math.round(100 * recs.reduce((a, r) => a + r.subsDone, 0) / recs.reduce((a, r) => a + r.subsTotal, 0)) : null;
    x.feedback = r1(clamp(4.05 + x.quality * 0.35 + gauss(0, 0.15), 2.6, 4.9));
    x.feedbackN = Math.round(recs.length * between(0.45, 0.8));
    x.weekAtt = weekAtt[x.id];
    x.atRisk = x.students.filter(id => { const st = students.find(s => s.id === id); return st.risk === 'high' || st.risk === 'medium'; }).length;
  });
  faculty.forEach(f => {
    const mine = sections.filter(x => x.prof === f.id);
    f.sections = mine.map(x => x.id);
    f.hoursTerm = mine.reduce((a, x) => a + x.hours * x.sessions, 0);
    f.ungraded = mine.reduce((a, x) => a + x.ungraded, 0);
    f.studentCount = new Set(mine.flatMap(x => x.students)).size;
  });

  /* ---- assignments with due dates (for the student and professor views) ---- */
  /* the assignments are built above, before the records. The first version drew three per section
     here (9 draws each); the same draws are spent so the numbers after this point do not move. */
  for (let i = 0; i < sections.length * 9; i++) rnd();
  /* contact details for the student's contact card (fictitious; .example is a reserved domain) */
  const OFF_H = [[9, 10.5], [12.25, 13.25], [14, 15.5], [16, 17]];
  faculty.forEach(f => { const n = f.name.replace(/^(Dr\.|Prof\.) /, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(' ');
    f.email = n[0] + '.' + n[n.length - 1] + '@lakeside.example';
    f.office = f.type === 'Core faculty' ? pick2(['A3.12', 'A3.14', 'B2.05', 'B2.07', 'C1.02']) : 'Shared adjunct office B1.01';
    const h = pick2(OFF_H); f.officeHours = { day: pick2(['Mon', 'Tue', 'Wed', 'Thu']), from: h[0], to: h[1], online: rnd2() < 0.4 }; });

  /* ---- history: headcount, retention, revenue (academic years) ---- */
  const YEARS = ['2021–22', '2022–23', '2023–24', '2024–25', '2025–26', '2026–27'];
  const headcount = {
    bba: [128, 141, 150, 162, 171, 0], msc: [38, 44, 52, 61, 66, 0], emba: [41, 44, 46, 49, 47, 0], dba: [14, 16, 19, 20, 21, 0],
  };
  programs.forEach(p => headcount[p.id][5] = students.filter(s => s.prog === p.id && s.status === 'active').length);
  const budgetHeadcount = { bba: 176, msc: 72, emba: 52, dba: 22 };
  const retention = {   /* % of a September cohort still enrolled one year later */
    bba: [84, 86, 85, 88, 87], msc: [91, 92, 90, 93, 92], emba: [95, 94, 96, 95, 93], dba: [93, 95, 94, 96, 95],
  };
  const revenue = YEARS.map((y, i) => i < 5 ? programs.reduce((a, p) => a + headcount[p.id][i] * (p.feeUnit === 'per year' ? p.fee : p.fee / p.years) * 0.9, 0) : null);
  const invoicedYTD = students.reduce((a, s) => a + s.invoiced, 0), collectedYTD = students.reduce((a, s) => a + s.paid, 0);
  const budgetRevenue = 9450000;
  const satisfactionTrend = { terms: ['Spr 24', 'Aut 24', 'Spr 25', 'Aut 25', 'Spr 26', 'Aut 26*'], value: [3.9, 4.0, 4.0, 4.1, 4.05, r2(students.filter(s => s.satisfaction).reduce((a, s) => a + s.satisfaction, 0) / students.filter(s => s.satisfaction).length)] };
  const graduateOutcomes = { employed6m: 87, salaryMedianCHF: 78000, response: 71, cohort: 'June 2025', surveyed: 'December 2025' };   /* the latest survey: June 2026 graduates are surveyed in December 2026 */

  /* ---- CRM: the September 2027 cycle against the September 2026 cycle ----
     weeks are counted back from the intake (week 0 = 1 September); today is
     41 weeks before September 2027. Leads/apps/deposits per program per week. */
  const CHANNELS = [
    { id: 'seo', name: 'Organic search & website' }, { id: 'paid', name: 'Paid search' }, { id: 'social', name: 'Social ads (Meta, LinkedIn)' },
    { id: 'agents', name: 'Education agents' }, { id: 'fairs', name: 'Fairs & open days' }, { id: 'referral', name: 'Alumni & student referrals' }, { id: 'corp', name: 'Corporate partners' },
  ];
  const CH_MIX = {
    bba: { seo: 30, paid: 22, social: 16, agents: 14, fairs: 12, referral: 6, corp: 0 },
    msc: { seo: 26, paid: 24, social: 18, agents: 20, fairs: 6, referral: 6, corp: 0 },
    emba: { seo: 18, paid: 12, social: 20, agents: 2, fairs: 10, referral: 16, corp: 22 },
    dba: { seo: 30, paid: 8, social: 22, agents: 6, fairs: 4, referral: 22, corp: 8 },
  };
  const CONV = {   /* lead → application → admitted → deposit; by channel quality */
    seo: [0.16, 0.62, 0.55], paid: [0.09, 0.58, 0.48], social: [0.07, 0.55, 0.45], agents: [0.28, 0.66, 0.5], fairs: [0.14, 0.6, 0.52], referral: [0.3, 0.72, 0.66], corp: [0.34, 0.8, 0.72],
  };
  const SPEND = { seo: 38000, paid: 96000, social: 74000, agents: 0, fairs: 52000, referral: 9000, corp: 18000 };   /* CHF, last 12 months; agents are paid on commission */
  const AGENT_COMMISSION = 3200;   /* CHF per deposited student */
  const target = { bba: 66, msc: 42, emba: 30, dba: 8 };          /* September 2027 enrolment targets */
  const lastCycleFinal = { bba: 62, msc: 38, emba: 27, dba: 7 };  /* September 2026 actual intake (deposits) */
  const WEEKS_BACK = 52, NOW = 41;   /* week index: 52 = 52 weeks before intake … 0 = intake week */
  function seasonal(w) { /* share of the cycle's leads arriving in week w before intake (more in autumn and spring) */
    const x = (WEEKS_BACK - w) / WEEKS_BACK; return 0.6 + 0.9 * Math.exp(-Math.pow((x - 0.25) / 0.12, 2)) + 1.1 * Math.exp(-Math.pow((x - 0.62) / 0.14, 2)); }
  const leadsPerCycle = { bba: 1150, msc: 980, emba: 310, dba: 120 };
  const growth = { bba: 1.08, msc: 1.17, emba: 0.92, dba: 1.05 };   /* this cycle vs last, so far */
  const crm = { channels: CHANNELS, weeksBack: WEEKS_BACK, nowWeek: NOW, cycle: 'September 2027', lastCycle: 'September 2026', target, lastCycleFinal, spend: SPEND, agentCommission: AGENT_COMMISSION, series: {}, funnel: {}, byChannel: {}, byRegion: {}, response: [], openApps: [] };
  const sumSeason = (() => { let t = 0; for (let w = WEEKS_BACK; w >= 0; w--) t += seasonal(w); return t; })();
  programs.forEach(p => {
    const prev = [], cur = [], prevApps = [], curApps = [], prevDep = [], curDep = [];
    for (let w = WEEKS_BACK; w >= 0; w--) {
      const base = leadsPerCycle[p.id] * seasonal(w) / sumSeason;
      const lp = Math.max(0, Math.round(base * between(0.8, 1.2)));
      prev.push(lp);
      cur.push(w >= NOW ? Math.max(0, Math.round(base * growth[p.id] * between(0.78, 1.22))) : null);
    }
    /* applications lag leads by ~3 weeks, deposits by ~8 */
    const appRate = p.id === 'emba' ? 0.2 : p.id === 'dba' ? 0.22 : 0.13;
    const depRate = lastCycleFinal[p.id] / (leadsPerCycle[p.id] * appRate);
    prev.forEach((l, i) => { prevApps.push(Math.round((prev[i - 3] || 0) * appRate * between(0.8, 1.2))); prevDep.push(Math.round((prevApps[i - 5] || 0) * depRate * between(0.6, 1.4))); });
    cur.forEach((l, i) => { if (l === null) { curApps.push(null); curDep.push(null); return; } curApps.push(Math.round((cur[i - 3] || 0) * appRate * (p.id === 'msc' ? 1.05 : p.id === 'emba' ? 0.88 : 1) * between(0.8, 1.2))); curDep.push(Math.round((curApps[i - 5] || 0) * depRate * between(0.6, 1.4))); });
    crm.series[p.id] = { leadsPrev: prev, leads: cur, appsPrev: prevApps, apps: curApps, depositsPrev: prevDep, deposits: curDep };
    const cum = a => a.reduce((s, v) => s + (v || 0), 0);
    const leadsN = cum(cur), appsN = cum(curApps), depN = cum(curDep);
    const admitted = Math.round(appsN * (p.id === 'dba' ? 0.5 : 0.6));
    const complete = Math.round(appsN * 0.78);
    crm.funnel[p.id] = { leads: leadsN, applications: appsN, complete, admitted, deposits: Math.min(depN, admitted),
      leadsPrevSameWeek: cum(prev.slice(0, WEEKS_BACK - NOW + 1)), appsPrevSameWeek: cum(prevApps.slice(0, WEEKS_BACK - NOW + 1)), depositsPrevSameWeek: cum(prevDep.slice(0, WEEKS_BACK - NOW + 1)),
      depositsPrevFinal: lastCycleFinal[p.id] };
    /* by channel: leads and deposits so far this cycle */
    crm.byChannel[p.id] = {};
    CHANNELS.forEach(c => {
      const share = (CH_MIX[p.id][c.id] || 0) / 100; const l = Math.round(leadsN * share * between(0.85, 1.15));
      const a = Math.round(l * CONV[c.id][0] * between(0.85, 1.15)); const ad = Math.round(a * CONV[c.id][1]); const d = Math.round(ad * CONV[c.id][2] * (depN / Math.max(1, admitted)) * 0.9);
      crm.byChannel[p.id][c.id] = { leads: l, applications: a, admitted: ad, deposits: d };
    });
    /* make the channel split add up EXACTLY to the funnel (largest remainder), so no page shows two totals */
    const fit = (key, total) => { const raw = CHANNELS.map(c => crm.byChannel[p.id][c.id][key]), sum = raw.reduce((x, y) => x + y, 0) || 1;
      const exact = raw.map(v => v * total / sum), base = exact.map(Math.floor); let rest = total - base.reduce((x, y) => x + y, 0);
      exact.map((v, i) => [v - base[i], i]).sort((x, y) => y[0] - x[0]).forEach(([, i]) => { if (rest > 0) { base[i]++; rest--; } });
      CHANNELS.forEach((c, i) => crm.byChannel[p.id][c.id][key] = base[i]); };
    fit('leads', leadsN); fit('applications', appsN); fit('admitted', admitted); fit('deposits', Math.min(depN, admitted));
    crm.byRegion[p.id] = {};
    Object.keys(REGIONS).forEach(r => { crm.byRegion[p.id][r] = Math.round(appsN * (MIX[p.id][r] / 100) * between(0.7, 1.3)); });
  });
  /* forecast: deposits at intake = deposits so far ÷ share of last cycle's deposits that had arrived by this week */
  /* forecast: last cycle's final intake × this cycle's pace (applications so far ÷ applications by the same
     week last cycle, leads as a lighter second signal). This early in the cycle the range is wide on purpose. */
  programs.forEach(p => {
    const f = crm.funnel[p.id];
    const paceA = f.appsPrevSameWeek ? f.applications / f.appsPrevSameWeek : 1, paceL = f.leadsPrevSameWeek ? f.leads / f.leadsPrevSameWeek : 1;
    f.pace = r2(clamp(0.7 * paceA + 0.3 * paceL, 0.7, 1.4));   /* tiny programmes swing wildly early on: the pace is capped */
    f.forecast = Math.round(lastCycleFinal[p.id] * f.pace);
    f.forecastLow = Math.round(f.forecast * 0.8); f.forecastHigh = Math.round(f.forecast * 1.15);
  });
  /* the February 2027 intake: closing now (deadline 15 January) */
  crm.feb = { deadline: '2027-01-15', start: '2027-02-08', target: { bba: 10, msc: 14, emba: 12, dba: 0 }, programs: {} };
  programs.forEach(p => { if (p.id === 'dba') return; const tg = crm.feb.target[p.id];
    const apps = Math.round(tg * between(2.2, 3.0)), adm = Math.round(apps * between(0.55, 0.7)), dep = Math.round(tg * (p.id === 'emba' ? between(0.45, 0.6) : between(0.6, 0.85)));
    crm.feb.programs[p.id] = { applications: apps, admitted: adm, deposits: dep, target: tg, lastYear: Math.round(tg * between(0.8, 1.1)) }; });
  /* lead response time: median hours to first contact, per week, last 12 weeks */
  for (let i = 0; i < 12; i++) crm.response.push({ week: `W${45 - 11 + i}`, hours: r1(clamp(gauss(i < 7 ? 6 : 14, 2.5), 2, 30)) });
  /* applications waiting, oldest first */
  const OWNERS = ['Julie (admissions)', 'Karim (admissions)', 'Agent: EduLink Lagos', 'Agent: Study Gulf Dubai', 'Nina (EMBA advisor)'];
  for (let i = 0; i < 22; i++) {
    const pid = weighted({ bba: 9, msc: 8, emba: 3, dba: 2 });
    const stage = weighted({ 'File incomplete': 5, 'Interview to book': 3, 'Decision pending': 3, 'Offer sent, no deposit': 4, 'Visa documents': 2 });
    crm.openApps.push({ name: person(), prog: pid, region: REGIONS[weighted(MIX[pid])], stage, daysWaiting: int(2, 46), owner: pick(OWNERS), source: pick(CHANNELS).name });
  }
  crm.openApps.sort((a, b) => b.daysWaiting - a.daysWaiting);
  crm.events = [
    { date: '2026-11-21', what: 'Open day on campus (BBA, MSc)', registered: 64 },
    { date: '2026-11-26', what: 'EMBA info evening, online', registered: 31 },
    { date: '2026-12-03', what: 'QS World MBA Tour, Zurich', registered: null },
    { date: '2027-01-15', what: 'Application deadline, February 2027 intake', registered: null },
  ];

  /* ---- ADMISSIONS & STUDENT OFFICE: files, documents, visas, registrar work ---- */
  const DOCS = ['Passport', 'Diploma', 'Transcripts', 'English test', 'CV', 'Motivation letter', 'Application fee'];
  const files = [];
  /* every open application of the February 2027 intake, and the early September 2027 ones */
  const fileCount = { bba: 26, msc: 34, emba: 22, dba: 3 };
  Object.entries(fileCount).forEach(([pid, n]) => { for (let i = 0; i < n; i++) {
    const region = weighted(MIX[pid]), nonEU = !['CH', 'FR', 'EU'].includes(region);
    const intake = pid === 'dba' || rnd() < 0.35 ? '2027-09' : '2027-02';
    const missing = DOCS.filter(d => rnd() < (d === 'English test' ? 0.28 : d === 'Transcripts' ? 0.22 : d === 'Application fee' ? 0.1 : 0.07));
    const stage = missing.length ? 'Documents missing' : weighted({ 'Ready for review': 4, 'Interview booked': 3, 'Decision pending': 3, 'Offer sent': 4, 'Deposit paid': 3 });
    const visa = nonEU && (stage === 'Offer sent' || stage === 'Deposit paid') ? weighted({ 'Visa letter to issue': 2, 'Embassy appointment': 3, 'Waiting for permit': 3, 'Permit granted': 2 }) : null;
    files.push({ id: 'ap' + (files.length + 1), name: person(), prog: pid, intake, region: REGIONS[region], nonEU, missing, stage, visa,
      daysOpen: int(1, 70), lastTouchDays: int(0, 25), owner: pick(['Julie', 'Karim', 'Nina']) });
  } });
  const registrar = {
    files,
    docs: DOCS,
    /* grade entry for the term: how many sections have entered their midterm grades */
    gradeEntryDeadline: '2026-11-20',
    requests: [
      { type: 'Transcript', open: 9, oldestDays: 6 }, { type: 'Enrolment certificate (permit, insurance)', open: 14, oldestDays: 3 },
      { type: 'Diploma (June 2026 graduates)', open: 23, oldestDays: 41 }, { type: 'Credit transfer / recognition', open: 5, oldestDays: 18 },
      { type: 'Leave of absence', open: 3, oldestDays: 2 }, { type: 'Withdrawal & refund', open: 2, oldestDays: 9 },
    ],
    permitsExpiring: students.filter(s => s.visa === 'renewal pending').length + 6,
    examRegistrationOpen: '2026-11-16', examRegistrationClose: '2026-11-30', examSessionStart: '2026-12-14',
    clashes: 4,    /* students booked in two places at once next week */
    roomUse: { A101: 78, A204: 64, B12: 71, B15: 52, 'C3 (lab)': 93, Aula: 38 },   /* % of teaching hours used */
  };

  /* ---- FINANCE: cash by month, receivables, costs, margin per programme ---- */
  const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const plan = [0.14, 0.26, 0.12, 0.06, 0.05, 0.04, 0.12, 0.07, 0.04, 0.04, 0.03, 0.03];   /* share of the year's tuition expected each month */
  const yearTuition = budgetRevenue;
  const cashPlan = plan.map(x => Math.round(yearTuition * x));
  const cashActual = [Math.round(cashPlan[0] * 1.04), Math.round(cashPlan[1] * 0.93), Math.round(cashPlan[2] * 0.88), Math.round(cashPlan[3] * 0.55 * 0.9), null, null, null, null, null, null, null, null];   /* November half done */
  const cashLastYear = plan.map((x, i) => Math.round(yearTuition * 0.94 * x * between(0.9, 1.08)));
  const aging = { '0–30 days': 0, '31–60 days': 0, '61–90 days': 0, 'over 90 days': 0 };
  students.forEach(s => { if (!s.overdue) return; const d = s.overdueDays; aging[d <= 30 ? '0–30 days' : d <= 60 ? '31–60 days' : d <= 90 ? '61–90 days' : 'over 90 days'] += s.overdue; });
  const costs = {   /* CHF, academic year 2026–27, budget */
    facultyCore: 1980000, facultyAdjunct: 0, staff: 2380000, campus: 1860000, marketing: Object.values(SPEND).reduce((a, b) => a + b, 0) + 120000, agentCommissions: 0, it: 380000, accreditation: 95000,
  };
  const ADJ_RATE = 190;   /* CHF per teaching hour */
  costs.facultyAdjunct = Math.round(faculty.filter(f => f.type === 'Adjunct').reduce((a, f) => a + Math.min(f.hoursTerm || 0, 120), 0) * 2 * ADJ_RATE);
  costs.agentCommissions = Math.round(62 * 0.14 * AGENT_COMMISSION + 38 * 0.2 * AGENT_COMMISSION);
  /* insurance, depreciation, administration and other: sized so the year's operating result is 2.6 % of the
     revenue forecast, in line with the margin history (director v2, 14 Nov 2026) */
  costs.other = Math.round(budgetRevenue * 0.972 * 0.974 - Object.values(costs).reduce((a, b) => a + b, 0));
  /* margin per programme: faculty cost shared by teaching hours, marketing by the programme's share of
     leads, overheads (staff, campus, IT, accreditation) by headcount */
  const marginByProgram = {};
  const hoursOf = pid => sections.filter(x => x.prog === pid).reduce((a, x) => a + x.hours * x.sessions, 0);
  const allHours = programs.reduce((a, p) => a + hoursOf(p.id), 0);
  const overhead = costs.staff + costs.campus + costs.it + costs.accreditation + costs.other;
  const activeN = students.filter(s => s.status === 'active').length;
  programs.forEach(p => {
    const st = students.filter(s => s.prog === p.id);
    const rev = st.reduce((a, s) => a + s.invoiced, 0);
    const teach = Math.round((costs.facultyCore + costs.facultyAdjunct) * hoursOf(p.id) / allHours);
    const mkt = Math.round(costs.marketing * (p.id === 'bba' ? 0.42 : p.id === 'msc' ? 0.33 : p.id === 'emba' ? 0.19 : 0.06));
    const scholar = st.reduce((a, s) => a + (s.scholarship ? Math.round((s.invoiced / (1 - s.scholarship / 100)) * s.scholarship / 100) : 0), 0);
    const n = st.filter(s => s.status === 'active').length, oh = Math.round(overhead * n / activeN);
    marginByProgram[p.id] = { revenue: rev, scholarships: scholar, teaching: teach, marketing: mkt, contribution: rev - teach - mkt, overhead: oh, net: rev - teach - mkt - oh, students: n };
  });
  const finance = { months: MONTHS, cashPlan, cashActual, cashLastYear, aging, costs, marginByProgram, adjunctRate: ADJ_RATE,
    scholarshipsTotal: Object.values(marginByProgram).reduce((a, m) => a + m.scholarships, 0),
    commissionsDue: [{ agent: 'EduLink Lagos', students: 4, chf: 4 * AGENT_COMMISSION, due: '2026-11-30' }, { agent: 'Study Gulf Dubai', students: 3, chf: 3 * AGENT_COMMISSION, due: '2026-12-15' }, { agent: 'Campus Asia Partners', students: 2, chf: 2 * AGENT_COMMISSION, due: '2026-12-15' }],
    yearForecast: Math.round(budgetRevenue * 0.972), budget: budgetRevenue, cashOnHandCHF: 2140000, monthlyBurnCHF: 640000 };

  /* ---- QUALITY & ACCREDITATION ---- */
  faculty.forEach((f, i) => { f.doctorate = i < 7 ? true : i % 2 === 0; f.qualification = f.doctorate ? (i % 4 === 3 ? 'Practice academic' : 'Scholarly academic') : (i % 3 === 0 ? 'Scholarly practitioner' : 'Instructional practitioner'); f.publications3y = f.doctorate ? int(0, 7) : int(0, 2); });
  /* =====================================================================
     QUALITY (v2, 14 Nov 2026 — Jan Erik's fourth scope memo). The checklist is keyed to the quality
     standards for INSTITUTIONAL accreditation of the HEdA Accreditation Ordinance as revised and in
     force from 15 July 2026 (procedures the AAQ opens from that date use them). Standard wording is
     quoted from the AAQ's English report template for institutional accreditation, 6 October 2026:
     https://aaq.ch/wp/wp-content/uploads/dlm_uploads/2026/10/2026-10-06-Template-Bericht-Inst.-Akkreditierung_EN.docx
     The ordinance itself is on fedlex (SR 414.205.3); check the wording there before quoting it outside
     this demo. Everything about the school — evidence, owners, dates, findings — is invented.
     ===================================================================== */
  const QS = (ref, heading, text) => ({ ref, heading, text });
  const QHEAD = { 1: 'Organisation and management', 2: 'Governance', 3: 'Quality management', 4: 'Teaching', 5: 'Research', 6: 'Services', 7: 'Staff', 8: 'Finances', 9: 'Infrastructure' };
  const QAREAS = [{ id: 'I', name: 'Organisation and management, governance and quality management', headings: [1, 2, 3] }, { id: 'II', name: 'Teaching, research and services', headings: [4, 5, 6] }, { id: 'III', name: 'Staff, finances and infrastructure', headings: [7, 8, 9] }];
  const QSTD = [
    QS('1', 1, 'The higher education institution or other institution within the higher education sector (hereafter referred to as ‘higher education institution’) shall have an organisational structure and management system that enables it to fulfil its mission.'),
    QS('2.1', 2, 'The higher education institution shall safeguard the freedom and independence of teaching and research.'),
    QS('2.2', 2, 'The higher education institution shall safeguard the participatory rights of all representative groups at all levels and enable them to function independently.'),
    QS('2.3', 2, 'The higher education institution shall publish information on its organisation, governance, funding and activities.'),
    QS('2.4', 2, 'The higher education institution shall perform its functions with due regard for social sustainability. It shall promote equal opportunities, particularly in relation to gender equality, diversity and inclusion. It shall set objectives in this area and monitor their attainment.'),
    QS('2.5', 2, 'The higher education institution shall perform its functions with due regard for economic and environmental sustainability. It shall set objectives in this area and monitor their attainment.'),
    QS('3.1', 3, 'The higher education institution shall have a quality management system that supports it in attaining its strategic and operational objectives. It shall establish its quality management system through a participatory process and foster a culture of quality.'),
    QS('3.2', 3, 'The higher education institution’s quality management system shall have transparently and clearly assigned tasks and responsibilities.'),
    QS('3.3', 3, 'The higher education institution shall review its quality management system regularly and make adjustments where necessary.'),
    QS('4.1', 4, 'The higher education institution shall deliver teaching in accordance with its institutional type. It shall set teaching objectives and monitor their attainment.'),
    QS('4.2', 4, 'The higher education institution shall structure its range of study programmes and its qualifications in accordance with its institutional type. It shall determine the qualifications to be acquired through the study programmes and publish these qualifications.'),
    QS('4.3', 4, 'The higher education institution shall regulate all phases of study (particularly admission criteria, academic progress, mobility, recognition of academic performance, and graduation) in accordance with its institutional type and the quality assurance standards and guidelines in the European Higher Education Area. It shall have an appropriate procedure for handling student complaints. It shall set out these regulations and publish them.'),
    QS('4.4', 4, 'The higher education institution shall evaluate its teaching regularly. It shall inform the relevant stakeholders of both the results and the measures taken in response.'),
    QS('5.1', 5, 'The higher education institution shall conduct research in accordance with its institutional type. It shall set research objectives and monitor their attainment.'),
    QS('5.2', 5, 'The higher education institution shall evaluate its research regularly. It shall inform the relevant stakeholders of both the results and the measures taken in response.'),
    QS('6.1', 6, 'The higher education institution shall provide services in accordance with its institutional type. It shall set objectives for its services and monitor their attainment.'),
    QS('6.2', 6, 'The higher education institution shall evaluate its services regularly. It shall inform the relevant stakeholders of both the results and the measures taken in response.'),
    QS('7.1', 7, 'The higher education institution shall have a staff planning strategy appropriate to its institutional type and shall employ its own academic, technical and administrative staff.'),
    QS('7.2', 7, 'The higher education institution shall have transparent, non-discriminatory procedures for selecting, appointing and promoting staff. Their academic qualifications shall be appropriate to the institutional type. The higher education institution shall inform the relevant stakeholders of this procedure.'),
    QS('7.3', 7, 'The higher education institution shall evaluate its academic, technical and administrative staff regularly.'),
    QS('7.4', 7, 'The higher education institution shall support the career development of all staff in general and of early-career researchers in particular.'),
    QS('8', 8, 'The higher education institution shall have a financial planning strategy appropriate to its institutional type and shall possess the financial resources necessary to fulfil its mission and ensure its long-term existence.'),
    QS('9', 9, 'The higher education institution shall have an infrastructure planning strategy appropriate to its institutional type. It shall possess the infrastructure (including premises in Switzerland, access to libraries, and research infrastructure) and all other resources necessary to fulfil its mission.'),
  ];
  /* the people who own evidence (fictitious; the programme managers are those of data.js) */
  const OWN = { quality: 'Dr. Nadia Haddad, head of quality', director: 'School director', office: 'Head of the student office', finance: 'Finance director', hr: 'HR manager', library: 'Librarian', research: 'Prof. Thomas Keller, research dean', comms: 'Communications manager', facilities: 'Facilities manager', bba: 'Claire Dubois, BBA manager', msc: 'Marco Bernasconi, MSc manager', careers: 'Head of career services' };
  /* what we will show for each standard: our one-paragraph line of argument, and the drafting state */
  const QNARR = {
    '1': ['The board, the director and the academic council each have written duties; the organisation chart and the mission statement show how decisions reach the programmes.', 'reviewed', 'director'],
    '2.1': ['Academic freedom is in the faculty regulations and the conflict-of-interest rules keep sponsors and owners out of grading and research choices.', 'first draft', 'director'],
    '2.2': ['Students, faculty and staff each elect members of the academic council; its minutes show their votes on the study regulations.', 'reviewed', 'quality'],
    '2.3': ['The website publishes the organisation, the fees, the funding sources and an annual report; the annual quality report is not yet published.', 'first draft', 'comms'],
    '2.4': ['The school has started an equal-opportunities plan with objectives on gender balance in faculty hiring and on access for students with disabilities.', 'not started', 'hr'],
    '2.5': ['Financial sustainability is in the three-year plan; environmental objectives (travel, energy of the campus) are still to be set.', 'not started', 'finance'],
    '3.1': ['The quality policy, adopted by the board, links each strategic objective to an indicator on this dashboard; students and employers sit on the quality committee.', 'reviewed', 'quality'],
    '3.2': ['A responsibility matrix names who measures, who acts and who reports for every quality process.', 'first draft', 'quality'],
    '3.3': ['The quality committee reviews the system each June; the 2025 review changed the course evaluation and the assurance-of-learning cycle.', 'first draft', 'quality'],
    '4.1': ['Each programme has learning goals; assurance of learning measures them twice in a cycle and records the action taken in between.', 'first draft', 'quality'],
    '4.2': ['The four programmes (BBA, MSc, EMBA, DBA) follow the Bologna levels; each publishes its learning outcomes and ECTS.', 'reviewed', 'bba'],
    '4.3': ['The study regulations cover admission, progression, retakes, recognition and graduation; the complaints and appeals procedure is published.', 'reviewed', 'office'],
    '4.4': ['Every course is evaluated each term; the results and the professor’s response go back to the class and to the programme committee.', 'first draft', 'quality'],
    '5.1': ['As a business school of the university type for continuing education, research focuses on applied management; core faculty have publication objectives.', 'first draft', 'research'],
    '5.2': ['The research dean reviews output every year; an external review of research has not yet taken place.', 'not started', 'research'],
    '6.1': ['Career services, executive education and the library serve students, alumni and companies, each with yearly objectives.', 'first draft', 'careers'],
    '6.2': ['Career services are surveyed each year; the library and executive education are not yet evaluated.', 'not started', 'careers'],
    '7.1': ['The staffing plan sets the share of teaching given by core faculty and the student-faculty ratio the school aims for.', 'reviewed', 'hr'],
    '7.2': ['Hiring follows a published procedure with a committee; qualifications are recorded for every faculty member.', 'first draft', 'hr'],
    '7.3': ['Every member of staff has a yearly review; faculty reviews include the course evaluations.', 'reviewed', 'hr'],
    '7.4': ['A development budget per person and a mentoring scheme for early-career faculty support careers.', 'first draft', 'hr'],
    '8': ['The three-year financial plan shows tuition, costs and reserves; whether the DBA should cover its share of the overheads is the open question.', 'first draft', 'finance'],
    '9': ['The Geneva campus, the library contracts and the IT systems are listed with their renewal dates.', 'reviewed', 'facilities'],
  };
  /* EVIDENCE: one object per piece of evidence, keyed to a standard */
  const EV = (id, ref, title, desc, owner, due, status, docs, reviewed, reviewer, comment) => ({ id, ref, title, desc, owner, due, status, docs: docs || [], reviewed: reviewed || null, reviewer: reviewer || null, comment: comment || null });
  const D = (title, version, date) => ({ title, version, date });
  const evidence = [
    EV('E01', '1', 'Organisation chart and duties of each body', 'Who decides what: board, director, academic council, programme committees.', OWN.director, '2026-10-30', 'in place', [D('Organisation chart', 'v4', '2026-09-01'), D('Duties of the governing bodies', 'v2', '2026-03-12')], '2026-10-02', 'Mock panel', 'Clear. Add who replaces the director when absent.'),
    EV('E02', '1', 'Mission statement and strategy 2025–2030', 'The mission, the strategic objectives and their indicators.', OWN.director, '2026-10-30', 'in place', [D('Strategy 2025–2030', 'v1.2', '2025-06-20')], '2026-10-02', 'Mock panel', 'Indicators match the dashboard.'),
    EV('E03', '2.1', 'Conflict-of-interest rules', 'Rules that keep owners, sponsors and employers out of grading and research choices.', null, '2026-11-06', 'missing', [], null, null, null),
    EV('E04', '2.1', 'Academic freedom clause in the faculty regulations', 'The article that guarantees freedom of teaching and research.', OWN.director, '2026-11-30', 'incomplete', [D('Faculty regulations', 'v3 draft', '2026-10-15')], '2026-10-20', 'Head of quality', 'The clause covers teaching but not research.'),
    EV('E05', '2.2', 'Academic council minutes, 2024–2026', 'Minutes showing student, faculty and staff members voting.', OWN.quality, '2026-10-30', 'in place', [D('Minutes 2024–25', 'final', '2025-07-01'), D('Minutes 2025–26', 'final', '2026-07-03')], '2026-10-02', 'Mock panel', null),
    EV('E06', '2.3', 'Public information: website, fees, funding', 'What the public can read about the organisation, its funding and its activities.', OWN.comms, '2026-11-20', 'incomplete', [D('Website audit', 'v1', '2026-09-28')], '2026-10-02', 'Mock panel', 'Funding sources are not on the website.'),
    EV('E07', '2.3', 'Annual quality report, published', 'The yearly report of the quality committee, on the website.', null, '2026-11-13', 'missing', [], null, null, null),
    EV('E08', '2.4', 'Equal-opportunities plan with objectives', 'Objectives on gender equality, diversity and inclusion, and how they are monitored.', OWN.hr, '2026-12-11', 'missing', [], null, null, null),
    EV('E09', '2.5', 'Sustainability objectives and monitoring', 'Economic and environmental objectives with indicators.', OWN.finance, '2027-01-15', 'incomplete', [D('Three-year financial plan', 'v2', '2026-06-30')], '2026-10-20', 'Head of quality', 'Economic part only; environmental objectives are missing.'),
    EV('E10', '3.1', 'Quality policy adopted by the board', 'The policy and the board decision that adopted it.', OWN.quality, '2026-10-16', 'in place', [D('Quality policy', 'v2', '2025-11-14'), D('Board decision', 'final', '2025-11-20')], '2026-10-02', 'Mock panel', null),
    EV('E11', '3.1', 'Stakeholders in the quality committee', 'Students, faculty, staff and employers named on the committee, with meeting attendance.', OWN.quality, '2026-11-13', 'incomplete', [D('Committee members', 'v1', '2026-09-10')], '2026-10-02', 'Mock panel', 'No employer member yet.'),
    EV('E12', '3.2', 'Quality responsibility matrix', 'Who measures, who acts and who reports, for each quality process.', OWN.quality, '2026-11-27', 'incomplete', [D('Responsibility matrix', 'v0.3', '2026-10-28')], '2026-11-04', 'Head of quality', 'Missing the services and research processes.'),
    EV('E13', '3.3', 'Yearly review of the quality system', 'Minutes of the June review and the changes it made.', OWN.quality, '2026-10-30', 'in place', [D('Quality review 2025', 'final', '2025-06-27'), D('Quality review 2026', 'final', '2026-06-26')], '2026-10-02', 'Mock panel', null),
    EV('E14', '4.1', 'Assurance of learning: two measurement cycles', 'Each programme goal measured twice, with the action taken in between.', OWN.quality, '2026-12-04', 'incomplete', [D('Assurance-of-learning report', 'v1', '2026-07-10')], '2026-10-20', 'Head of quality', 'DBA has one cycle only.'),
    EV('E15', '4.2', 'Programme learning outcomes, published', 'The learning outcomes and ECTS of each programme, as published.', OWN.bba, '2026-10-16', 'in place', [D('Programme handbooks (4)', '2026–27', '2026-08-25')], '2026-10-02', 'Mock panel', null),
    EV('E16', '4.3', 'Study regulations, published', 'Admission, progression, retakes, recognition and graduation rules.', OWN.office, '2026-10-16', 'in place', [D('Study regulations', 'v5', '2026-08-01')], '2026-10-02', 'Mock panel', null),
    EV('E17', '4.3', 'Complaints and appeals procedure', 'How a student complains or appeals a grade, with time limits.', OWN.office, '2026-10-16', 'in place', [D('Complaints and appeals procedure', 'v2', '2025-09-01')], '2026-10-02', 'Mock panel', 'Add the number of cases per year.'),
    EV('E18', '4.4', 'Course evaluations with follow-up', 'Results of every course evaluation and what the professor changed.', OWN.quality, '2026-11-27', 'incomplete', [D('Evaluation results, spring 2026', 'final', '2026-07-15')], '2026-10-20', 'Head of quality', 'The follow-up actions are recorded for half of the courses.'),
    EV('E19', '5.1', 'Research objectives and output of core faculty', 'Objectives per core faculty member and publications over three years.', OWN.research, '2026-11-27', 'incomplete', [D('Research report 2025', 'v1', '2026-03-30')], '2026-10-20', 'Head of quality', 'Objectives are set for four of seven core faculty.'),
    EV('E20', '5.2', 'Evaluation of research', 'A regular review of research, with the results reported.', OWN.research, '2026-12-18', 'missing', [], null, null, null),
    EV('E21', '6.1', 'Service objectives: career services, executive education, library', 'Yearly objectives for each service.', OWN.careers, '2026-11-13', 'in place', [D('Service objectives 2026', 'v1', '2026-02-02')], '2026-10-02', 'Mock panel', null),
    EV('E22', '6.2', 'Evaluation of services', 'Surveys of the services and the measures taken.', OWN.careers, '2026-11-06', 'incomplete', [D('Career services survey 2026', 'final', '2026-06-12')], '2026-10-20', 'Head of quality', 'Library and executive education are not evaluated.'),
    EV('E23', '7.1', 'Staffing plan and student–faculty ratio', 'The staffing plan and the ratio with its calculation.', OWN.hr, '2026-10-16', 'in place', [D('Staffing plan 2026–2029', 'v1', '2026-05-18')], '2026-10-02', 'Mock panel', null),
    EV('E24', '7.2', 'Hiring procedure and faculty qualifications', 'The published hiring procedure and the qualification of every faculty member.', OWN.hr, '2026-10-30', 'in place', [D('Hiring procedure', 'v2', '2025-04-01'), D('Faculty qualification list', 'autumn 2026', '2026-09-15')], '2026-10-02', 'Mock panel', null),
    EV('E25', '7.3', 'Yearly staff reviews', 'The review process and the share of staff reviewed.', OWN.hr, '2026-10-30', 'in place', [D('Staff review process', 'v1', '2024-09-01')], '2026-10-02', 'Mock panel', null),
    EV('E26', '7.4', 'Career development and mentoring', 'The development budget and the mentoring of early-career faculty.', OWN.hr, '2026-11-06', 'incomplete', [D('Development budget', '2026', '2026-01-15')], '2026-10-20', 'Head of quality', 'No mentoring scheme is written down.'),
    EV('E27', '8', 'Three-year financial plan', 'Tuition, costs and reserves for three years.', OWN.finance, '2026-11-20', 'incomplete', [D('Financial plan 2026–2029', 'v2', '2026-06-30')], '2026-10-20', 'Head of quality', 'Must show the decision on the DBA, which does not cover its share of the overheads.'),
    EV('E28', '9', 'Campus, library and IT', 'Premises in Geneva, library access and IT, with renewal dates.', OWN.facilities, '2026-10-16', 'in place', [D('Infrastructure plan', 'v1', '2026-04-20'), D('Library licences', '2026', '2026-01-10')], '2026-10-02', 'Mock panel', null),
  ];
  const STATUS_ORDER = { missing: 0, incomplete: 1, 'in place': 2 };
  const standards = QSTD.map(q => { const ev = evidence.filter(e => e.ref === q.ref), n = QNARR[q.ref];
    const miss = ev.filter(e => e.status === 'missing').length, part = ev.filter(e => e.status === 'incomplete').length;
    /* our own rating on the AAQ's four-level scale, from the state of the evidence */
    const self = miss ? 'partially fulfilled' : part ? 'largely fulfilled' : 'entirely fulfilled';
    const hist = ev.filter(e => e.reviewed).map(e => ({ date: e.reviewed, who: e.reviewer, note: `${e.title}: ${e.comment || 'no remark'}` })).sort((a, b) => b.date.localeCompare(a.date));
    return { ...q, headingName: QHEAD[q.heading], area: QAREAS.find(a => a.headings.includes(q.heading)).id, narrative: n[0], draft: n[1], author: OWN[n[2]], evidence: ev.map(e => e.id), self, history: hist }; });

  /* LEARNING GOALS with two measurement cycles: instrument, course, sample, result */
  const LG = (prog, goal, target, c1, c2, instrument, course, n1, n2) => ({ prog, goal, target, met: c2 ? c2[1] : c1[1], instrument, course,
    cycles: [{ term: c1[0], met: c1[1], n: n1 }].concat(c2 ? [{ term: c2[0], met: c2[1], n: n2 }] : []) });
  const learningGoals = [
    LG('bba', 'Analyse a business problem with quantitative tools', 80, ['Spring 2025', 68], ['Spring 2026', 74], 'Rubric on the data case in the final exam', 'Statistics for Business', 49, 52),
    LG('bba', 'Communicate a recommendation in writing', 80, ['Spring 2025', 79], ['Spring 2026', 83], 'Rubric on the written case report', 'Strategic Management', 47, 49),
    LG('bba', 'Apply ethical reasoning to a business case', 80, ['Spring 2025', 81], ['Spring 2026', 79], 'Rubric on the ethics essay', 'Business Ethics', 50, 51),
    LG('msc', 'Design an international strategy with evidence', 80, ['Autumn 2024', 78], ['Autumn 2025', 85], 'Rubric on the strategy project', 'Global Strategy', 28, 31),
    LG('msc', 'Lead a culturally diverse team project', 80, ['Autumn 2024', 86], ['Autumn 2025', 88], 'Peer and supervisor rating of the team project', 'Cross-cultural Leadership', 28, 31),
    LG('emba', 'Lead an organisational change plan', 80, ['Autumn 2024', 89], ['Autumn 2025', 91], 'Rubric on the change plan', 'Leading Change', 20, 22),
    LG('emba', 'Make a financially sound investment decision', 80, ['Autumn 2024', 71], ['Autumn 2025', 77], 'Rubric on the investment case', 'Finance for Executives', 20, 22),
    LG('dba', 'Produce research that meets doctoral standards', 80, ['Autumn 2025', 70], null, 'Rubric applied at the proposal defence', 'Proposal defence and ethics approval', 10, 0),
  ];

  /* ACTIONS — closing the loop: one record per finding, with the second measurement and its result */
  const AC = (id, source, ref, finding, action, owner, opened, due, state, m1, m2, unit) => ({ id, source, ref, finding, action, owner, opened, due, state, m1, m2, unit });
  const actions = [
    AC('A01', 'Learning goal', '4.1', 'BBA: only 68 % of students analysed the data case correctly (target 80 %).', 'Added two workshops on regression and a practice data case to Statistics for Business.', OWN.bba, '2025-07-10', '2026-06-30', 'done', { term: 'Spring 2025', v: 68 }, { term: 'Spring 2026', v: 74 }, '% meeting the goal'),
    AC('A02', 'Learning goal', '4.1', 'BBA: ethical reasoning fell from 81 % to 79 % (target 80 %).', 'Add a graded ethics question to two core courses.', OWN.bba, '2026-07-10', '2026-12-18', 'in progress', { term: 'Spring 2026', v: 79 }, null, '% meeting the goal'),
    AC('A03', 'Learning goal', '4.1', 'EMBA: 71 % made a sound investment decision (target 80 %).', 'Pre-reading and an online valuation module before Finance for Executives.', OWN.quality, '2025-02-01', '2025-09-30', 'done', { term: 'Autumn 2024', v: 71 }, { term: 'Autumn 2025', v: 77 }, '% meeting the goal'),
    AC('A04', 'Learning goal', '4.1', 'DBA: 70 % of proposals met the doctoral standard (target 80 %); one cycle only.', 'Proposal-writing workshop in residency 2 and a second measurement at the 2026 defences.', null, '2026-01-20', '2026-10-31', 'in progress', { term: 'Autumn 2025', v: 70 }, null, '% meeting the goal'),
    AC('A05', 'Course evaluation', '4.4', 'Course evaluations: the follow-up action is recorded for only half of the courses.', 'Every professor answers the evaluation in writing within two weeks; the template is in the LMS.', OWN.quality, '2026-07-15', '2026-11-06', 'in progress', { term: 'Spring 2026', v: 50 }, null, '% of courses with a recorded follow-up'),
    AC('A06', 'Course evaluation', '4.4', 'Response rate to course evaluations was 52 % in spring 2026 (target 60 %).', 'Ten minutes of class time for the evaluation in week 13.', OWN.quality, '2026-07-15', '2026-12-18', 'in progress', { term: 'Spring 2026', v: 52 }, null, '% response'),
    AC('A07', 'Complaint', '4.3', 'Seven complaints in spring 2026, four about late grades.', 'Grade-entry deadline per assignment, with a reminder to professors after 7 days.', OWN.office, '2026-07-01', '2026-12-18', 'in progress', { term: 'Spring 2026', v: 4 }, null, 'complaints about late grades'),
    AC('A08', 'Complaint', '9', 'Students complained about the room C3 lab being too small for 30.', 'Move the data courses to the Aula on lab days.', OWN.facilities, '2026-03-02', '2026-09-01', 'done', { term: 'Spring 2026', v: 3 }, { term: 'Autumn 2026', v: 0 }, 'complaints about the room'),
    AC('A09', 'Panel condition, 2021', '3.2', 'Condition of the 2021 accreditation: tasks and responsibilities in quality management are not assigned clearly.', 'Write the responsibility matrix and have it approved by the quality committee.', OWN.quality, '2021-06-15', '2026-11-27', 'in progress', null, null, null),
    AC('A10', 'Panel recommendation, 2021', '2.3', 'Recommendation of the 2021 accreditation: publish an annual quality report.', 'Publish the first annual quality report on the website.', null, '2021-06-15', '2026-11-13', 'in progress', null, null, null),
    AC('A11', 'Panel recommendation, 2021', '4.4', 'Recommendation of the 2021 accreditation: tell students what changed after the evaluations.', 'A "you said, we did" page per programme each term.', OWN.msc, '2021-06-15', '2025-12-31', 'done', null, null, null),
    AC('A12', 'Panel recommendation, 2021', '5.1', 'Recommendation of the 2021 accreditation: set research objectives for core faculty.', 'Research objectives in each core faculty member’s yearly review.', OWN.research, '2021-06-15', '2026-09-30', 'in progress', { term: '2024', v: 2 }, { term: '2026', v: 4 }, 'core faculty with objectives (of 7)'),
  ];
  /* derived: overdue = past its due date and not done */
  actions.forEach(a => { a.overdue = a.state !== 'done' && a.due < TODAY;
    a.result = !a.m1 ? (a.state === 'done' ? 'done, nothing to measure' : 'no measurement planned') : !a.m2 ? 'awaiting the second measurement'
      : (/complaint/.test(a.unit) ? a.m2.v < a.m1.v : a.m2.v > a.m1.v) ? 'improved' : 'not improved'; });
  const previous = { date: '2021-06-15', result: 'Accredited with one condition', decision: 'Swiss Accreditation Council', ordinance: 'HEdA Accreditation Ordinance of 2015', conditions: ['A09'], recommendations: ['A10', 'A11', 'A12'] };

  const quality = {
    framework: 'Swiss institutional accreditation under the HEdA Accreditation Ordinance, revised standards in force since 15 July 2026 (AAQ)',
    source: { title: 'AAQ, report template for institutional accreditation (English), 6 October 2026', url: 'https://aaq.ch/wp/wp-content/uploads/dlm_uploads/2026/10/2026-10-06-Template-Bericht-Inst.-Akkreditierung_EN.docx' },
    scale: ['entirely fulfilled', 'largely fulfilled', 'partially fulfilled', 'not fulfilled'],
    nextVisit: '2027-05-18', areas: QAREAS, headings: QHEAD, standards, evidence, owners: OWN, learningGoals, actions, previous,
    facultyCategories: 'AACSB',
    complaints: [{ term: 'Spr 25', n: 6 }, { term: 'Aut 25', n: 4 }, { term: 'Spr 26', n: 7 }, { term: 'Aut 26', n: 3 }],
    gradeAppeals: 5, evalResponseTarget: 60,
  };

  /* ---- what the director needs at a glance: alerts derived from the data ---- */
  const active = students.filter(s => s.status === 'active');
  /* ---- the decision calendar: the dates by which someone must decide something (the school's own
     calendar, fictitious like everything here). A dashboard counts down to each one. ---- */
  const calendar = [
    { id: 'exam-reg', date: '2026-11-16', event: 'Exam registration opens', decide: 'Decide which students with fees overdue for more than 60 days may not register for exams', owner: 'finance', role: 'Finance' },
    { id: 'grades', date: '2026-11-20', event: 'Midterm grades are due', decide: 'Chase or reassign the grading of any professor with more than 20 submissions waiting', owner: 'professor', role: 'Programme managers' },
    { id: 'mkt-plan', date: '2026-11-27', event: 'The spring marketing plan is locked', decide: 'Move budget to the channels that bring EMBA applications, or lower the EMBA target', owner: 'marketing', role: 'Director with Sales & marketing' },
    { id: 'adjuncts', date: '2026-11-27', event: 'Last day to approve spring adjunct contracts (week 13)', decide: 'Approve or cancel the adjunct hires for the spring term', owner: 'director', role: 'Director' },
    { id: 'timetable', date: '2026-12-04', event: 'The spring timetable is published', decide: 'Accept that faculty who sent no availability get a timetable without their input', owner: 'programme', role: 'Programme managers' },
    { id: 'budget', date: '2026-12-15', event: 'Board meeting: budget 2027–28', decide: 'Set fees and intake targets, and decide the future of the DBA, which covers its own costs but not its share of the overheads', owner: 'director', role: 'Director' },
    { id: 'accr-owners', date: '2026-12-18', event: 'Accreditation: evidence owners named', decide: 'Name one owner for every missing or incomplete piece of evidence', owner: 'quality', role: 'Quality & accreditation' },
    { id: 'feb-deadline', date: '2027-01-15', event: 'Application deadline, February 2027 intake', decide: 'Extend the deadline or close the intake below target', owner: 'marketing', role: 'Sales & marketing' },
  ];

  /* =====================================================================
     STATUS HISTORY, CASES, PAST COHORTS (programme v2, 14 Nov 2026). Generated after everything else,
     from the second random stream, so no number above moves.
     ===================================================================== */
  const isoBetween = (a, b) => new Date(Date.parse(a) + rnd2() * (Date.parse(b) - Date.parse(a))).toISOString().slice(0, 10);
  const startOf = c => c.slice(5) === '09' ? c.slice(0, 4) + '-09-14' : c.slice(0, 4) + '-02-09';
  const W_REASONS = ['Moved to another school', 'Financial reasons', 'Health or family reasons', 'Did not pass the first year', 'Student permit refused or not renewed', 'Took a job'];
  const L_REASONS = ['Health', 'Family reasons', 'Work commitment', 'Military or civil service', 'Financial reasons'];
  students.forEach(s => {
    s.started = startOf(s.cohort);
    s.statusLog = [{ date: s.started, ev: 'Enrolled' }];
    if (s.status === 'withdrawn') {
      const w = /Did not pass/; let r = pick2(W_REASONS); if (s.year === 1 && rnd2() < 0.3) r = 'Did not pass the first year';
      if (w.test(r) && s.cohort >= '2026-01') r = pick2(W_REASONS.filter(x => !w.test(x)));
      if (/permit/.test(r) && !s.visa) r = 'Moved to another school';   /* only a non-European student needs a permit */
      s.withdrawn = { date: isoBetween(s.started, '2026-11-10'), reason: r };
      s.statusLog.push({ date: s.withdrawn.date, ev: 'Withdrew', why: r });
    }
    if (s.status === 'on leave') {
      const from = isoBetween(s.cohort >= '2026-01' ? s.started : '2026-02-01', '2026-10-20');
      s.leave = { from, reason: pick2(L_REASONS), back: rnd2() < 0.6 ? 'Spring 2027' : 'Autumn 2027' };
      s.statusLog.push({ date: from, ev: 'Leave of absence', why: s.leave.reason + ', back ' + s.leave.back });
    }
    if (s.plan && s.plan.retakes.length) s.statusLog.push({ date: '2026-07-01', ev: 'Must retake ' + s.plan.retakes.length + ' course' + (s.plan.retakes.length > 1 ? 's' : ''), why: s.plan.retakes.map(i => i.title).join(', ') });
  });
  /* a CASE for every student at academic risk who has one open: who owns it, what was done, what changed */
  const ACTIONS = ['Advisor meeting', 'E-mail reminder from the programme office', 'Study plan agreed', 'Referred to learning support', 'Meeting with the course professor'];
  const NEXT = ['Check attendance again in two weeks', 'Second meeting after the midterm grades', 'Confirm the study plan before exam registration closes', 'Follow up with the professor'];
  const cases = [];
  students.filter(s => s.status === 'active' && (s.risk === 'high' || s.risk === 'medium')).forEach(s => {
    if (rnd2() < 0.22) return;   /* nobody has opened a case yet: a gap the manager should see */
    const opened = isoBetween('2026-09-28', '2026-11-06'), action = pick2(ACTIONS);
    const owner = action === 'Advisor meeting' || action === 'Study plan agreed' ? s.advisor : action === 'Meeting with the course professor' ? sections.find(x => x.id === s.sections[0]).prof : 'office';
    const daysOpen = Math.round((Date.parse(TODAY) - Date.parse(opened)) / 864e5);
    const attBefore = clamp(s.attendance + Math.round(gauss2(-4, 3)), 40, 100);
    const outcome = daysOpen < 14 ? 'too early' : s.engagement > -1.2 && rnd2() < 0.55 ? 'improved' : 'no change';
    cases.push({ sid: s.id, prog: s.prog, opened, action, actionDate: isoBetween(opened, '2026-11-12'), owner, next: pick2(NEXT), outcome, attBefore, attNow: s.attendance, gradeNow: s.avgGrade });
  });
  /* PAST COHORTS: the September intakes that have finished, as counts (their students are no longer in the
     records). Current cohorts are counted from the students themselves on the page. */
  const PAST = { bba: ['2020-09', '2021-09', '2022-09', '2023-09'], msc: ['2021-09', '2022-09', '2023-09', '2024-09'], emba: ['2021-09', '2022-09', '2023-09', '2024-09'], dba: ['2018-09', '2019-09', '2020-09', '2021-09', '2022-09'] };
  const SIZE = { bba: 52, msc: 30, emba: 22, dba: 6 }, DROP = { bba: 0.13, msc: 0.07, emba: 0.06, dba: 0.25 };
  const pastCohorts = {};
  Object.entries(PAST).forEach(([pid, list]) => { pastCohorts[pid] = list.map(c => {
    const started = Math.max(3, Math.round(SIZE[pid] * (0.85 + rnd2() * 0.3))), withdrawn = Math.round(started * DROP[pid] * (0.6 + rnd2() * 0.8));
    const done = started - withdrawn, late1 = Math.round(done * (pid === 'dba' ? 0.3 : 0.1) * (0.5 + rnd2())), late2 = Math.round(done * (pid === 'dba' ? 0.25 : 0.04) * (0.5 + rnd2()));
    const still = pid === 'dba' && c === '2022-09' ? Math.max(1, Math.round(done * 0.4)) : 0;
    const reasons = {}; for (let i = 0; i < withdrawn; i++) { const r = pick2(W_REASONS); reasons[r] = (reasons[r] || 0) + 1; }
    return { cohort: c, started, withdrawn, onTime: done - late1 - late2 - still, late1, late2, still, reasons }; }); });

  /* =====================================================================
     ADMISSIONS v2 (14 Nov 2026 — Jan Erik's fifth scope memo): ONE applicant dataset.
     Every application of the February 2027 intake and of the September 2027 cycle so far is a file,
     and the counts match the CRM funnel exactly (applications, admitted, deposits per programme), so
     admissions and marketing can never disagree. Each file has a REAL stage (applied → review →
     interview → decision → offer → deposit, or closed: rejected / withdrew / declined the offer), a
     separate flag for missing documents, and a dated list of events. registrar.files and
     crm.openApps are both derived from it. Generated from the second stream, after everything else.
     ===================================================================== */
  const w2 = obj => { const tot = Object.values(obj).reduce((a, b) => a + b, 0); let x = rnd2() * tot; for (const [k, v] of Object.entries(obj)) { x -= v; if (x <= 0) return k; } return Object.keys(obj)[0]; };
  const person2 = () => { let n; do { n = pick2(FIRST) + ' ' + pick2(LAST); } while (used.has(n)); used.add(n); return n; };
  const addDays = (iso, d) => new Date(Date.parse(iso) + d * 864e5).toISOString().slice(0, 10);
  const daysSince = iso => Math.round((Date.parse(TODAY) - Date.parse(iso)) / 864e5);
  const STAGES = ['applied', 'review', 'interview', 'decision', 'offer', 'deposit'];
  const STAGE_NAME = { applied: 'Applied', review: 'Under review', interview: 'Interview', decision: 'Decision', offer: 'Offer sent', deposit: 'Deposit paid', rejected: 'Rejected', withdrew: 'Withdrew', declined: 'Declined the offer' };
  const ADM_OWNERS = { bba: ['Julie (admissions)', 'Karim (admissions)'], msc: ['Karim (admissions)', 'Julie (admissions)'], emba: ['Nina (EMBA advisor)'], dba: ['Prof. Anil Mehta (DBA director)'] };
  const AGENTS = ['Agent: EduLink Lagos', 'Agent: Study Gulf Dubai'];
  const DECLINE = ['Chose another school', 'Could not finance the studies', 'Student permit refused', 'Employer did not sponsor', 'Personal reasons'];
  const REJECT = ['Academic record below the entry requirement', 'English level below the requirement', 'Not enough work experience for the programme'];
  /* the visa lead time is a SETTING with its source, not a sentence in a page */
  const visaPolicy = { leadWeeksMin: 8, leadWeeksMax: 12, source: 'The school’s own record of its 2023–2026 intakes (fictitious): weeks from the visa letter to a Geneva study permit (cantonal population office OCPM).', letterWeeksBefore: 14, embassyWeeksBefore: 11 };
  const START = { '2027-02': crm.feb.start, '2027-09': '2027-09-13' };   /* the September date is crm.intakeDate too */
  const applicants = [];
  function makeFile(pid, intake, end) {
    const region = w2(MIX[pid]), nonEU = !['CH', 'FR', 'EU'].includes(region);
    const agent = nonEU && pid !== 'emba' && pid !== 'dba' && rnd2() < 0.35 ? pick2(AGENTS) : null;
    const owner = agent || pick2(ADM_OWNERS[pid]);
    const chId = w2(CH_MIX[pid]);   /* drawn once: inside find() it would be redrawn for every channel */
    const source = agent ? 'Education agents' : CHANNELS.find(c => c.id === chId).name;
    /* how far the file went: the index of the last stage it reached */
    const reached = end === 'deposit' ? 5 : end === 'offer' || end === 'declined' ? 4 : end === 'rejected' ? 3 : end === 'withdrew' ? Math.floor(rnd2() * 3) : STAGES.indexOf(end);
    const open = !['deposit', 'rejected', 'withdrew', 'declined'].includes(end);
    /* the application date: older for files that went further */
    let applied = addDays(TODAY, -Math.round(6 + reached * 12 + rnd2() * 20));
    const ev = [{ date: applied, kind: 'stage', what: 'Application received', by: 'Applicant' }];
    const docsMissing = reached <= 1 && open ? DOCS.filter(d => rnd2() < (d === 'English test' ? 0.35 : d === 'Transcripts' ? 0.28 : d === 'Application fee' ? 0.12 : 0.08)) : [];
    DOCS.filter(d => !docsMissing.includes(d)).forEach(d => ev.push({ date: addDays(applied, Math.floor(rnd2() * 10)), kind: 'doc', what: d + ' received', by: 'Applicant' }));
    let t = addDays(applied, 4 + Math.floor(rnd2() * 6)); const stageDates = { applied };
    for (let k = 1; k <= reached; k++) { stageDates[STAGES[k]] = t; ev.push({ date: t, kind: 'stage', what: { review: 'File complete, under review', interview: pid === 'dba' ? 'Interview with a possible supervisor booked' : 'Interview booked', decision: 'Interview held; file to the admissions committee', offer: 'Admitted; offer letter sent', deposit: 'Deposit paid' }[STAGES[k]], by: owner });
      t = addDays(t, 5 + Math.floor(rnd2() * 12)); }
    let lastStage = Object.values(stageDates).sort().pop();
    if (lastStage > TODAY) { /* keep every event in the past */ const shift = daysSince(lastStage) - 1; ev.forEach(e => e.date = addDays(e.date, shift)); Object.keys(stageDates).forEach(k => stageDates[k] = addDays(stageDates[k], shift)); lastStage = addDays(lastStage, shift); }
    /* an offer still open was usually sent in the last four weeks: move the whole file forward to that */
    if (end === 'offer') { const want = 2 + Math.floor(rnd2() * 26), shift = daysSince(stageDates.offer) - want;
      if (shift > 0) { ev.forEach(e => e.date = addDays(e.date, shift)); Object.keys(stageDates).forEach(k => stageDates[k] = addDays(stageDates[k], shift)); lastStage = addDays(lastStage, shift); } }
    applied = stageDates.applied;   /* contacts and days open count from the (possibly moved) application date */
    let closed = null;
    if (end === 'rejected') closed = { date: addDays(lastStage, 3), what: 'Not admitted', why: pick2(REJECT) };
    if (end === 'withdrew') closed = { date: addDays(lastStage, 4 + Math.floor(rnd2() * 8)), what: 'Withdrew the application', why: pick2(DECLINE) };
    if (end === 'declined') closed = { date: addDays(lastStage, 6 + Math.floor(rnd2() * 10)), what: 'Declined the offer', why: pick2(DECLINE) };
    if (closed) { if (closed.date > TODAY) closed.date = addDays(TODAY, -1); ev.push({ date: closed.date, kind: 'stage', what: `${closed.what}: ${closed.why}`, by: end === 'rejected' ? 'Admissions committee' : 'Applicant' }); }
    /* contacts: reminders, calls and e-mails; how long since the last one is the main measure */
    const nC = 1 + Math.floor(rnd2() * 4), silence = open ? Math.floor(Math.abs(gauss2(4, 7))) : 0;
    for (let k = 0; k < nC; k++) { const d = addDays(TODAY, -silence - Math.floor(rnd2() * Math.max(1, daysSince(applied) - silence)));
      ev.push({ date: d < applied ? applied : d, kind: 'contact', what: pick2(docsMissing.length ? ['Reminder sent: documents missing', 'Call: documents explained'] : ['E-mail answered', 'Call logged', 'Reminder sent']), by: owner }); }
    if (open) ev.push({ date: addDays(TODAY, -silence), kind: 'contact', what: docsMissing.length ? 'Reminder sent: ' + docsMissing.join(', ') : 'Call logged', by: owner });
    /* scholarship and conditions on an offer */
    const scholarship = reached >= 4 && rnd2() < (pid === 'msc' ? 0.3 : pid === 'bba' ? 0.2 : 0.08) ? pick2([10, 15, 20, 25]) : 0;
    /* visa: only non-European admitted applicants; steps dated back from the programme start */
    let visa = null, visaSteps = null;
    if (nonEU && reached >= 4 && end !== 'declined') {
      const st0 = START[intake], letterBy = addDays(st0, -7 * visaPolicy.letterWeeksBefore), embassyBy = addDays(st0, -7 * visaPolicy.embassyWeeksBefore);
      const step = w2(intake === '2027-02' ? { 'Visa letter to issue': 1, 'Embassy appointment': 3, 'Waiting for permit': 4, 'Permit granted': 2 } : { 'Visa letter to issue': 5, 'Embassy appointment': 1 });
      visa = step;
      const letter = step === 'Visa letter to issue' ? null : addDays(stageDates.offer, 3), appt = step === 'Visa letter to issue' || step === 'Embassy appointment' ? null : addDays(letter, 14 + Math.floor(rnd2() * 10));
      visaSteps = { letterBy, embassyBy, letter, appt, permitExpected: appt ? addDays(letter, 7 * Math.round((visaPolicy.leadWeeksMin + visaPolicy.leadWeeksMax) / 2)) : letter ? addDays(letter, 7 * visaPolicy.leadWeeksMax) : null, granted: step === 'Permit granted' ? addDays(TODAY, -Math.floor(rnd2() * 10) - 1) : null };
      if (letter && letter <= TODAY) ev.push({ date: letter, kind: 'visa', what: 'Visa letter issued', by: owner });
      if (appt && appt <= TODAY) ev.push({ date: appt, kind: 'visa', what: 'Embassy appointment held', by: 'Applicant' });
      if (visaSteps.granted) ev.push({ date: visaSteps.granted, kind: 'visa', what: 'Study permit granted', by: 'OCPM Geneva' });
    }
    ev.forEach(e => { if (e.date > TODAY) e.date = TODAY; });
    ev.sort((a, b) => a.date.localeCompare(b.date));
    const lastContact = ev.filter(e => e.kind === 'contact').map(e => e.date).sort().pop() || applied;
    const extra = pid === 'emba' ? { sponsor: rnd2() < 0.6 ? pick2(['Firmenich', 'Banque Lombard', 'SGS', 'Lakeside Pharma', 'Geneva Airport']) + ' (fictitious)' : null } : pid === 'dba' ? { proposal: reached >= 1 ? 'received' : 'awaited', supervisor: reached >= 2 ? pick2(faculty.filter(f => f.doctorate)).name : null } : pid === 'bba' ? { guarantor: rnd2() < 0.7 ? 'Parent' : 'Self-funded', diplomaRecognition: nonEU ? (reached >= 1 ? 'Recognised' : 'Being checked') : 'Recognised' } : {};
    const stage = open ? STAGES[reached] : end;
    applicants.push({ id: 'ap' + (applicants.length + 1), name: person2(), prog: pid, intake, region: REGIONS[region], nonEU, owner, agent: !!agent, source,
      stage, stageName: STAGE_NAME[stage], open, reached, closed, missing: docsMissing, visa, visaSteps, scholarship, stageDates, events: ev, extra,
      daysOpen: daysSince(applied), lastContact, lastTouchDays: daysSince(lastContact) });
  }
  /* counts per programme and intake, taken from the CRM so both pages agree */
  function fill(pid, intake, apps, admitted, deposits) {
    const declined = Math.round((admitted - deposits) * 0.25), offers = admitted - deposits - declined;
    const notAdm = apps - admitted, rejected = Math.round(notAdm * 0.22), withdrew = Math.round(notAdm * 0.12), openNA = notAdm - rejected - withdrew;
    for (let i = 0; i < deposits; i++) makeFile(pid, intake, 'deposit');
    for (let i = 0; i < offers; i++) makeFile(pid, intake, 'offer');
    for (let i = 0; i < declined; i++) makeFile(pid, intake, 'declined');
    for (let i = 0; i < rejected; i++) makeFile(pid, intake, 'rejected');
    for (let i = 0; i < withdrew; i++) makeFile(pid, intake, 'withdrew');
    for (let i = 0; i < openNA; i++) makeFile(pid, intake, w2({ applied: 3, review: 3, interview: 2, decision: 2 }));
  }
  programs.forEach(p => { const fb = crm.feb.programs[p.id]; if (fb) fill(p.id, '2027-02', fb.applications, fb.admitted, fb.deposits);
    const f = crm.funnel[p.id]; fill(p.id, '2027-09', f.applications, f.admitted, f.deposits); });
  registrar.files = applicants;
  registrar.stages = STAGES; registrar.stageNames = STAGE_NAME; registrar.visaPolicy = visaPolicy; registrar.intakeStart = START;
  registrar.intakes = [{ id: '2027-02', name: 'February 2027', start: START['2027-02'], deadline: crm.feb.deadline, target: crm.feb.target }, { id: '2027-09', name: crm.cycle, start: START['2027-09'], deadline: null, target: crm.target }];
  /* the marketing page's waiting list is now the open files of this same dataset */
  crm.openApps = applicants.filter(f => f.open).map(f => ({ id: f.id, name: f.name, prog: f.prog, region: f.region, stage: f.stageName + (f.missing.length ? ' · documents missing' : ''), daysWaiting: f.lastTouchDays, owner: f.owner, source: f.source })).sort((a, b) => b.daysWaiting - a.daysWaiting);

  /* RESIDENCE PERMITS of enrolled non-European students: one dated row each, instead of a count */
  registrar.permits = students.filter(s => s.status === 'active' && s.visa).map(s => { const exp = s.visa === 'renewal pending' ? addDays(TODAY, 5 + Math.floor(rnd2() * 50)) : addDays(TODAY, 40 + Math.floor(rnd2() * 330));
    return { sid: s.id, expires: exp, status: s.visa === 'renewal pending' ? 'renewal filed, waiting for OCPM' : daysSince(exp) > -60 ? 'renew now' : 'valid' }; }).sort((a, b) => a.expires.localeCompare(b.expires));
  registrar.permitsExpiring = registrar.permits.filter(p => p.status !== 'valid').length;

  /* STUDENT-OFFICE CASES: every open request as a case (student, type, owner, opened, service target, status) */
  const SVC = { 'Transcript': 5, 'Enrolment certificate (permit, insurance)': 3, 'Diploma (June 2026 graduates)': 30, 'Credit transfer / recognition': 20, 'Leave of absence': 10, 'Withdrawal & refund': 15 };
  const OFFICE = ['Sandra (student office)', 'Luc (student office)', 'Head of the student office'];
  registrar.cases = [];
  registrar.requests.forEach(r => { for (let i = 0; i < r.open; i++) {
    const age = i === 0 ? r.oldestDays : Math.floor(rnd2() * (r.oldestDays + 1));
    const grad = /Diploma/.test(r.type), s = grad ? null : pick2(active);
    registrar.cases.push({ id: 'C' + String(registrar.cases.length + 1).padStart(3, '0'), type: r.type, sid: s ? s.id : null, name: s ? s.name : person2(), prog: s ? s.prog : w2({ bba: 4, msc: 3, emba: 2 }), grad,
      owner: pick2(OFFICE), opened: addDays(TODAY, -age), target: SVC[r.type], status: age > SVC[r.type] ? 'late' : rnd2() < 0.4 ? 'in progress' : 'new' }); } });

  /* =====================================================================
     MARKETING v2 (14 Nov 2026 — Jan Erik's sixth scope memo): the link between the CRM and the
     student records. Every student carries the channel (and agent) that brought them; last cycle's
     funnel per channel ends at ARRIVED, counted from the real September 2026 students; spend is
     recorded per channel, programme and month; every lead that has not applied yet is a record with
     an owner, a score, its first-response time and a next action. Second stream, after everything.
     ===================================================================== */
  const AGENT_OF = { AF: 'EduLink Lagos', ME: 'Study Gulf Dubai', AS: 'Campus Asia Partners' };
  const REG_KEY = {}; Object.entries(REGIONS).forEach(([k, v]) => REG_KEY[v] = k);
  students.forEach(s => {
    const nonEU = !['CH', 'FR', 'EU'].includes(s.region);
    if (nonEU && AGENT_OF[s.region] && s.prog !== 'emba' && rnd2() < 0.4) { s.source = 'agents'; s.agent = AGENT_OF[s.region]; }
    else { const m = Object.assign({}, CH_MIX[s.prog]); delete m.agents; s.source = w2(m); s.agent = null; }
  });
  crm.intakeDate = '2027-09-13'; crm.responseTarget = 4;
  crm.forecastRule = 'The range is a rule of thumb, 80 % to 115 % of the forecast: the school has no record yet of how far past forecasts missed.';
  crm.events.forEach(e => e.progs = /Open day/.test(e.what) ? ['bba', 'msc'] : /EMBA/.test(e.what) ? ['emba'] : /MBA Tour/.test(e.what) ? ['emba', 'msc'] : /February/.test(e.what) ? ['bba', 'msc', 'emba'] : programs.map(p => p.id));

  /* SPEND per channel, programme and month (Dec 2025 – Nov 2026, November half spent). The yearly totals
     are crm.spend; the split by programme follows each programme's leads in the channel; the months follow
     the recruiting season. "This cycle" = September to November 2026. */
  const SM = ['Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026'];
  const SEAS = [0.06, 0.1, 0.1, 0.11, 0.1, 0.08, 0.06, 0.04, 0.06, 0.11, 0.11, 0.07];
  crm.spendMonths = SM; crm.cycleMonths = [9, 10, 11]; crm.spendBy = {};
  programs.forEach(p => { crm.spendBy[p.id] = {}; CHANNELS.forEach(c => { const tot = programs.reduce((a, q) => a + crm.byChannel[q.id][c.id].leads, 0) || 1, share = crm.byChannel[p.id][c.id].leads / tot;
    crm.spendBy[p.id][c.id] = SEAS.map(x => Math.round(SPEND[c.id] * share * x * (0.85 + rnd2() * 0.3))); }); });

  /* LAST CYCLE (September 2026) per channel, to the day of arrival: applications → admitted → deposit →
     visa refused / no-show → ARRIVED. "Arrived" is counted from the students of the 2026-09 cohort. */
  const AR = { agents: 0.5, seo: 0.62, paid: 0.55, social: 0.5, fairs: 0.6, referral: 0.75, corp: 0.8 }, YL = { agents: 0.55, seo: 0.6, paid: 0.55, social: 0.5, fairs: 0.6, referral: 0.75, corp: 0.85 };
  crm.lastCycleByChannel = {};
  programs.forEach(p => { const coh = students.filter(s => s.prog === p.id && s.cohort === '2026-09'), out = {};
    CHANNELS.forEach(c => { const arrived = coh.filter(s => s.source === c.id).length; out[c.id] = { arrived, visaRefused: 0, noShow: 0 }; });
    let gap = crm.lastCycleFinal[p.id] - coh.length;
    while (gap > 0) { const nonEUch = ['agents', 'social', 'paid', 'seo'], c = rnd2() < 0.6 ? pick2(nonEUch) : pick2(CHANNELS).id; if (rnd2() < 0.55 && (c === 'agents' || c === 'social' || c === 'paid')) out[c].visaRefused++; else out[c].noShow++; gap--; }
    CHANNELS.forEach(c => { const o = out[c.id]; o.deposits = o.arrived + o.visaRefused + o.noShow; o.admitted = o.deposits ? Math.round(o.deposits / YL[c.id]) : 0; o.applications = o.admitted ? Math.round(o.admitted / AR[c.id]) : 0;
      /* first-year retention: the September 2025 intake, including those who left during their first year */
      const c25 = students.filter(s => s.prog === p.id && s.cohort === '2025-09' && s.source === c.id).length;
      o.started25 = c25; o.left25 = 0; });
    crm.lastCycleByChannel[p.id] = out; });
  /* first-year leavers of the September 2025 intake (no longer in the records), sized to the retention history */
  programs.forEach(p => { const out = crm.lastCycleByChannel[p.id], now25 = students.filter(s => s.prog === p.id && s.cohort === '2025-09' && s.status !== 'withdrawn').length;
    const ret = retention[p.id][retention[p.id].length - 1] / 100, leavers = Math.max(0, Math.round(now25 / ret - now25));
    const WL = { agents: 3, social: 2, paid: 1.5, seo: 1, fairs: 1, referral: 0.5, corp: 0.5 };
    for (let i = 0; i < leavers; i++) { const c = w2(Object.fromEntries(CHANNELS.map(ch => [ch.id, (out[ch.id].started25 + 0.5) * WL[ch.id]]))); out[c].left25++; }
    CHANNELS.forEach(c => { out[c.id].started25 += out[c.id].left25; }); });

  /* LEADS that have not applied yet, one record each (the funnel's leads minus its applications) */
  const LEAD_OWNERS = { bba: ['Julie (admissions)', 'Karim (admissions)'], msc: ['Karim (admissions)', 'Julie (admissions)'], emba: ['Nina (EMBA advisor)'], dba: ['Prof. Anil Mehta (DBA director)'] };
  const LOST = ['Chose another school', 'Fee too high', 'Wrong programme for the person', 'No answer after three contacts', 'Wants an online programme'];
  const NEXTA = { new: 'First call', contacted: 'Send the programme brochure and book a call', qualified: 'Invite to apply: send the application link', nurturing: 'Invite to the next event' };
  const cycleStart = addDays(TODAY, -(WEEKS_BACK - NOW) * 7);
  crm.leads = [];
  programs.forEach(p => { const n = crm.funnel[p.id].leads - crm.funnel[p.id].applications, chW = Object.fromEntries(CHANNELS.map(c => [c.id, Math.max(0, crm.byChannel[p.id][c.id].leads - crm.byChannel[p.id][c.id].applications)]));
    for (let i = 0; i < n; i++) {
      const ch = w2(chW), region = ch === 'agents' ? pick2(['AF', 'ME', 'AS']) : w2(MIX[p.id]);
      const owner = ch === 'agents' ? 'Agent: ' + AGENT_OF[region] : pick2(LEAD_OWNERS[p.id]);
      const age = Math.floor(rnd2() * daysSince(cycleStart)), created = addDays(TODAY, -age);
      /* first answer: slower in the last weeks, as the school-wide trend shows; agents answer themselves */
      const resp = age < 3 && rnd2() < 0.5 ? null : r1(clamp(gauss2(age < 28 ? 13 : 6, age < 28 ? 6 : 3) * (owner.startsWith('Agent') ? 0.7 : owner.startsWith('Nina') ? 0.8 : 1), 0.5, 72));
      const stage = resp == null ? 'new' : w2({ contacted: 4, qualified: 2.5, nurturing: 2.5, lost: 1.6 });
      const score = clamp(Math.round(gauss2(stage === 'qualified' ? 72 : stage === 'nurturing' ? 50 : stage === 'lost' ? 20 : 45, 14) + (ch === 'referral' || ch === 'corp' ? 10 : 0)), 1, 99);
      const last = stage === 'new' ? null : addDays(TODAY, -Math.min(age, Math.floor(Math.abs(gauss2(0, stage === 'nurturing' ? 12 : 6)))));
      const lead = { id: 'ld' + (crm.leads.length + 1), name: person2(), prog: p.id, channel: ch, region: REGIONS[region], owner, created, firstResponseH: resp, stage, score, lastContact: last };
      if (stage === 'lost') lead.lost = pick2(LOST);
      else lead.next = { what: NEXTA[stage], due: stage === 'new' ? addDays(created, 1) : addDays(last, stage === 'qualified' ? 4 : stage === 'nurturing' ? 21 : 7) };
      crm.leads.push(lead);
    } });

  /* =====================================================================
     DIRECTOR v2 (14 Nov 2026 — Jan Erik's seventh scope memo). History for every headline figure,
     the cash projection, one worked decision with options and modelled effects, the decision log,
     the strategy goals, the people figures, the risk register. Fictitious, like everything here.
     ===================================================================== */
  /* CASH: from today to the end of the academic year, by the plan's inflows and the monthly costs */
  {
    const F = finance, mi = 3 /* November */, out = [];
    let cash = F.cashOnHandCHF + Math.max(0, F.cashPlan[mi] - (F.cashActual[mi] || 0)) - F.monthlyBurnCHF / 2;
    out.push({ month: 'Nov', cash: Math.round(cash) });
    for (let m = mi + 1; m < 12; m++) { cash += F.cashPlan[m] - F.monthlyBurnCHF; out.push({ month: F.months[m], cash: Math.round(cash) }); }
    F.cashProjection = out; F.cashLow = out.reduce((a, b) => b.cash < a.cash ? b : a); F.monthsOfCover = Math.round(10 * F.cashOnHandCHF / F.monthlyBurnCHF) / 10;
    F.cashNote = 'End-of-month cash if tuition arrives as planned and costs run at CHF ' + Math.round(F.monthlyBurnCHF / 1000) + 'K a month.';
    /* the operating result this year: the revenue forecast less all costs */
    const costTot = Object.values(F.costs).reduce((a, b) => a + b, 0);
    F.costsBudget = { facultyCore: 1950000, facultyAdjunct: 210000, staff: 2350000, campus: 1860000, marketing: 420000, agentCommissions: 45000, it: 360000, accreditation: 80000, other: Math.round(F.costs.other * 0.97 / 1000) * 1000 };
    F.result = F.yearForecast - costTot; F.costTotal = costTot;
  }
  /* HISTORY for the headline tiles (the last value is this year or this term) */
  const lastHC = YEARS.map((_, i) => programs.reduce((a, p) => a + headcount[p.id][i], 0));
  const retSchool = [0, 1, 2, 3, 4].map(i => Math.round(programs.reduce((a, p) => a + retention[p.id][i] * headcount[p.id][i], 0) / lastHC[i]));
  const riskNow = Math.round(1000 * active.filter(s => s.risk === 'high' || s.risk === 'medium').length / active.length) / 10;
  const trends = {
    collectionRate: { labels: ['2022–23', '2023–24', '2024–25', '2025–26', '2026–27'], value: [91, 93, 92, 94, Math.round(100 * collectedYTD / invoicedYTD)], note: 'share of the year’s invoices collected by mid-November' },
    atRiskShare: { labels: ['Spr 24', 'Aut 24', 'Spr 25', 'Aut 25', 'Spr 26', 'Aut 26'], value: [9.4, 8.8, 10.1, 9.0, 8.3, riskNow] },
    retention: { labels: YEARS.slice(0, 5), value: retSchool },
    employed6m: { labels: ['June 2021', 'June 2022', 'June 2023', 'June 2024', 'June 2025'], value: [82, 84, 85, 86, graduateOutcomes.employed6m], response: [64, 66, 70, 68, graduateOutcomes.response] },
    sepIntake: { labels: ['Sep 2022', 'Sep 2023', 'Sep 2024', 'Sep 2025', 'Sep 2026'], value: [132, 141, 150, 158, Object.values(crm.lastCycleFinal).reduce((a, b) => a + b, 0)] },
    cashMid: { labels: ['Nov 22', 'Nov 23', 'Nov 24', 'Nov 25', 'Nov 26'], value: [1620000, 1810000, 1950000, 2260000, finance.cashOnHandCHF] },
    complaints: quality.complaints.map(c => c.n),
  };
  /* ONE WORKED DECISION: the future of the DBA, at the board meeting on the budget. The model is simple and
     says so: students follow intake minus graduations and drop-outs; revenue per student-year is this year's;
     overheads are fixed for the school, so only the CONTRIBUTION changes the school's result. */
  const dbaM = finance.marginByProgram.dba, perSY = dbaM.revenue / dbaM.students, ohPer = dbaM.overhead / dbaM.students;
  const GRADS = [4, 5, 6], DBA_DROP = 1;
  const pathOf = intake => { let n = dbaM.students; return [0, 1, 2].map(y => (n = Math.max(0, n + intake[y] - GRADS[y] - (n > 6 ? DBA_DROP : 0)))); };
  const OPT = (id, name, what, intake, feeUp, teachF, mktF, risks) => {
    const st = pathOf(intake);
    /* a fee rise applies to new candidates only: their share of the students grows each year */
    const rev = st.map((n, y) => Math.round(n * perSY * (1 + feeUp * Math.min(1, intake.slice(0, y + 1).reduce((a, b) => a + b, 0) / Math.max(1, n)))));
    const teach = st.map((n, y) => Math.round(dbaM.teaching * Math.pow(1.03, y + 1) * teachF[y]));
    const mkt = [0, 1, 2].map(y => Math.round(dbaM.marketing * mktF[y]));
    const contr = rev.map((r, y) => r - teach[y] - mkt[y]), alloc = st.map(n => Math.round(n * ohPer));
    return { id, name, what, intake, students: st, revenue: rev, teaching: teach, marketing: mkt, contribution: contr, overheadAllocated: alloc, net: contr.map((c, y) => c - alloc[y]), risks };
  };
  const decisionSupport = [{
    id: 'dba-future', window: 'budget', owner: 'Director, with the board',
    title: 'The future of the DBA',
    years: ['2027–28', '2028–29', '2029–30'],
    question: 'The DBA brings in more than it costs to teach and market, but not enough to carry its share of the school’s overheads. Keep it as it is, raise its fee, stop new intakes, or teach part of it with the EMBA?',
    facts: [`${dbaM.students} candidates this year bring CHF ${Math.round(dbaM.revenue / 1000)}K in tuition.`, `Teaching (CHF ${Math.round(dbaM.teaching / 1000)}K) and marketing (CHF ${Math.round(dbaM.marketing / 1000)}K) leave a contribution of CHF ${Math.round(dbaM.contribution / 1000)}K: what the DBA adds to the school's result.`, `Its share of the overheads, allocated by headcount, is CHF ${Math.round(dbaM.overhead / 1000)}K, so it shows CHF ${Math.round(dbaM.net / 1000)}K after the allocation.`, 'The overheads (staff, campus, IT, accreditation, insurance, depreciation and administration) do not fall if the DBA closes: the school would lose the contribution and keep the costs.'],
    model: 'Students = last year’s students + intake − graduations (4, 5, 6) − one drop-out a year. Revenue per student-year = this year’s (CHF ' + Math.round(perSY).toLocaleString('en-CH') + '); a fee rise applies to new candidates only. Teaching grows 3 % a year. Overheads are allocated by headcount, as in the margin table.',
    options: [
      OPT('A', 'Keep it as it is', 'Admit 8 candidates a year, as planned.', [8, 8, 8], 0, [1, 1, 1], [1, 1, 1], 'The allocated shortfall stays. It is an accounting view, not cash.'),
      OPT('B', 'Raise the fee by 10 % and admit 6 a year', 'The fee for new candidates rises from CHF 62,000 to CHF 68,200 for the programme.', [6, 6, 6], 0.1, [1, 0.95, 0.95], [1, 1, 1], 'Fewer applicants may come. Check what the competing DBAs charge first.'),
      OPT('C', 'Stop new intakes from September 2027', 'No new candidates; the current ones finish their theses.', [0, 0, 0], 0, [0.95, 0.75, 0.5], [0.3, 0, 0], 'The school loses the contribution and keeps the overheads. Doctoral supervision is part of the core faculty’s research profile for accreditation.'),
      OPT('D', 'Teach two residencies with EMBA modules', 'Admit 8 a year; candidates take two of their four residencies in EMBA module weekends.', [8, 8, 8], 0, [0.6, 0.6, 0.6], [1, 1, 1], 'The shared modules must still meet the doctoral level; supervision stays separate.'),
    ],
  }];
  /* THE DECISION LOG: what was decided, what was expected, and what happened */
  const decisionLog = [
    { date: '2025-12-12', decision: 'EMBA fee', chose: 'Hold the EMBA fee at CHF 54,000 for 2026–27', owner: 'Director', expected: 'Keep the EMBA September intake at 26 or more', review: '2026-10-01', actual: 'September 2026 intake: 26', result: 'worked' },
    { date: '2026-02-20', decision: 'Marketing mix', chose: 'Move CHF 30K from fairs to paid search', owner: 'Sales & marketing', expected: 'More MSc applications by June', review: '2026-06-30', actual: 'MSc applications 17 % above the cycle before', result: 'worked' },
    { date: '2026-03-15', decision: 'Grading delays', chose: 'Set a grade-entry deadline per assignment', owner: 'Programme managers', expected: 'Fewer complaints about late grades', review: '2026-12-18', actual: 'Measured again in December', result: 'open' },
    { date: '2026-05-08', decision: 'Agents', chose: 'Add a third agent for Asia (Campus Asia Partners)', owner: 'Director', expected: '6 deposits from Asia for September 2026', review: '2026-09-30', actual: '2 deposits from the new agent', result: 'did not work' },
  ];
  /* STRATEGY 2025–2030: the multi-year goals, each with its measure, target and the series so far */
  const strategy = [
    { goal: 'Grow to 330 students by 2028–29', measure: 'students enrolled', target: 330, unit: '', labels: YEARS, series: lastHC },
    { goal: 'Raise the share of master and executive students to 45 %', measure: '% of students in the MSc, EMBA and DBA', target: 45, unit: ' %', labels: YEARS, series: YEARS.map((_, i) => Math.round(100 * (headcount.msc[i] + headcount.emba[i] + headcount.dba[i]) / lastHC[i])) },
    { goal: 'Keep first-year retention at 90 % or more', measure: '% of a September intake still enrolled a year later', target: 90, unit: ' %', labels: YEARS.slice(0, 5), series: retSchool },
    { goal: 'Graduates employed six months after graduation: 90 %', measure: '% employed (survey)', target: 90, unit: ' %', labels: ['2021', '2022', '2023', '2024', '2025'], series: [82, 84, 85, 86, graduateOutcomes.employed6m] },
    { goal: 'Pass the institutional accreditation in May 2027', measure: '% of evidence in place', target: 100, unit: ' %', labels: ['Mar 26', 'Jun 26', 'Sep 26', 'Nov 26'], series: [32, 38, 43, Math.round(100 * evidence.filter(e => e.status === 'in place').length / evidence.length)] },
    { goal: 'An operating margin of 5 % of revenue', measure: 'result ÷ revenue, %', target: 5, unit: ' %', labels: YEARS, series: [-1.5, 0.8, 2.1, 3.4, 2.6, Math.round(1000 * finance.result / finance.yearForecast) / 10] },
  ];
  /* PEOPLE: faculty and staff, the figures a director needs (staff are counted, not named) */
  const people = { staff: 24, staffVacancies: 2, facultyVacancies: 1, turnover12m: { faculty: 2, staff: 3 }, staffNote: 'administrative staff in full-time equivalents' };
  /* RISK REGISTER: likelihood and impact 1–5, owner, mitigation */
  const risks = [
    { risk: 'Accreditation granted with conditions, or refused', area: 'Regulatory', owner: 'Head of quality', likelihood: 3, impact: 5, mitigation: 'Evidence owners named by 18 December; mock visit in March 2027.' },
    { risk: 'EMBA intake falls under 20', area: 'Financial', owner: 'Sales & marketing', likelihood: 3, impact: 4, mitigation: 'Corporate accounts plan; decision at the marketing lock on 27 November.' },
    { risk: 'Student permits refused for students from outside Europe', area: 'Operational', owner: 'Head of the student office', likelihood: 2, impact: 3, mitigation: 'Visa letters 14 weeks before the start; agent briefing on documents.' },
    { risk: 'Cash falls under three months of costs in summer', area: 'Financial', owner: 'Finance director', likelihood: 2, impact: 4, mitigation: 'Collections plan for the overdue fees; a credit line agreed with the bank.' },
    { risk: 'A loss of two core faculty', area: 'Operational', owner: 'HR manager', likelihood: 2, impact: 4, mitigation: 'Succession for each core course; adjunct pool by area.' },
    { risk: 'A grading or data-protection incident made public', area: 'Reputational', owner: 'Director', likelihood: 1, impact: 4, mitigation: 'Grade-entry deadlines; data-protection training for all staff in January.' },
  ];

  /* LAST WEEK: the same headline figures as they stood on Saturday 7 November 2026, for the weekly briefing */
  const appsNowAll = programs.reduce((a, p) => a + crm.funnel[p.id].applications, 0) + Object.values(crm.feb.programs).reduce((a, x) => a + x.applications, 0);
  const depNowAll = programs.reduce((a, p) => a + crm.funnel[p.id].deposits, 0) + Object.values(crm.feb.programs).reduce((a, x) => a + x.deposits, 0);
  const lastWeek = { date: '2026-11-07',
    atRisk: active.filter(s => s.risk === 'high' || s.risk === 'medium').length + 3, applications: appsNowAll - 11, deposits: depNowAll - 4,
    cashOnHand: finance.cashOnHandCHF + 95000, evidenceInPlace: evidence.filter(e => e.status === 'in place').length - 2,
    overdue60: students.filter(s => s.overdueDays > 60).length - 2, ungraded: sections.reduce((a, x) => a + x.ungraded, 0) - 18,
    decisionsPending: null };

  window.SCHOOL = {
    school, programs, P, faculty, sections, students, records, assignments, regions: REGIONS,
    history: { years: YEARS, headcount, budgetHeadcount, retention, revenue, budgetRevenue, invoicedYTD, collectedYTD, satisfactionTrend, graduateOutcomes },
    crm, registrar, finance, quality, calendar, rules, curriculum, thresholds, cases, pastCohorts, trends, decisionSupport, decisionLog, strategy, people, risks, lastWeek,
    /* helpers every page uses */
    util: {
      active, byId: id => students.find(s => s.id === id) || faculty.find(f => f.id === id) || sections.find(x => x.id === id),
      sec: id => sections.find(x => x.id === id), prof: id => faculty.find(f => f.id === id), rec: (st, sec) => records[st + '|' + sec],
      chf: n => 'CHF ' + Math.round(n).toLocaleString('de-CH').replace(/’/g, "'"), pct: n => Math.round(n) + ' %',
      grade: g => g == null ? '—' : g.toFixed(1), dayOf, weekStart, asgOf: sec => ASG[sec],
      time: h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`,
    },
  };
})();
