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
    faculty.push({ id: 'f' + (i + 1), name: n, area: AREAS[i % AREAS.length], type: i < 7 ? 'Core faculty' : 'Adjunct', contractHours: i < 7 ? 180 : int(40, 90), eval: r1(clamp(gauss(4.25, 0.35), 3.2, 4.9)), availabilitySent: rnd() > 0.28 }); });

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
    sections.push({ id: 's' + secN, code: pid.toUpperCase().slice(0, 3) + (yr * 100 + secN % 50), title, prog: pid, year: yr, prof: prof.id, ects: pid === 'dba' ? 10 : pid === 'bba' ? 5 : 6,
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
  students.forEach(s => {
    if (s.status !== 'active') return;
    s.sections.forEach(sid => {
      const x = sections.find(y => y.id === sid);
      const att = clamp(Math.round(88 + s.engagement * 7 + x.quality * 2.5 + gauss(0, 4)), 35, 100);
      const subsTotal = Math.max(2, Math.round(x.held * 0.4));
      const subsDone = clamp(Math.round(subsTotal * clamp(0.9 + s.engagement * 0.12 + gauss(0, 0.06), 0.2, 1)), 0, subsTotal);
      const grade = r1(clamp(4.85 + s.ability * 0.45 + s.engagement * 0.22 + x.quality * 0.15 + gauss(0, 0.28), 1.5, 6));
      const ungraded = subsDone && rnd() < (x.quality < -1 ? 0.32 : 0.07) ? 1 : 0;
      records[s.id + '|' + sid] = { att, subsTotal, subsDone, grade, ungraded, lastSubmitDays: int(0, s.engagement < -1 ? 21 : 9) };
    });
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
    s.ectsEarned = Math.round(clamp((s.year - 1) * perYearCredits * clamp(0.95 + s.ability * 0.04, 0.8, 1), 0, p.ects));
    s.ectsThisTerm = s.sections.reduce((a, sid) => a + sections.find(y => y.id === sid).ects, 0);
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
    const why = [];
    if (s.status === 'active') {
      if (s.attendance !== null && s.attendance < 80) why.push(`attendance ${s.attendance} % (rule: 80 %)`);
      if (s.avgGrade !== null && s.avgGrade < 4) why.push(`average ${s.avgGrade.toFixed(1)} (pass: 4.0)`);
      if (s.missing >= 4) why.push(`${s.missing} assignments not handed in`);
      if (s.lastLoginDays >= 14) why.push(`no login for ${s.lastLoginDays} days`);
      if (s.overdueDays > 30) why.push(`CHF ${s.overdue.toLocaleString('en-CH')} overdue ${s.overdueDays} days`);
      if (s.visa === 'renewal pending') why.push('residence permit renewal pending');
    }
    s.riskReasons = why;
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
    x.oldestUngradedDays = x.ungraded ? int(3, x.quality < -1 ? 24 : 12) : 0;
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
  const assignments = [];
  sections.forEach((x, i) => {
    const names = ['Case analysis', 'Problem set', 'Group project milestone', 'Reflection paper', 'Quiz', 'Data exercise'];
    for (let k = 0; k < 3; k++) {
      const due = new Date(Date.UTC(2026, 10, 14 + (k === 0 ? -int(2, 9) : k === 1 ? int(2, 8) : int(10, 26))));
      assignments.push({ id: x.id + 'a' + k, sec: x.id, title: pick(names) + ' ' + (k + 2), due: due.toISOString().slice(0, 10), weight: pick([10, 15, 20, 25]), past: k === 0 });
    }
  });

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
  const graduateOutcomes = { employed6m: 87, salaryMedianCHF: 78000, response: 71 };

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
  /* margin per programme: faculty cost shared by teaching hours, marketing by the programme's share of
     leads, overheads (staff, campus, IT, accreditation) by headcount */
  const marginByProgram = {};
  const hoursOf = pid => sections.filter(x => x.prog === pid).reduce((a, x) => a + x.hours * x.sessions, 0);
  const allHours = programs.reduce((a, p) => a + hoursOf(p.id), 0);
  const overhead = costs.staff + costs.campus + costs.it + costs.accreditation;
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
  const quality = {
    framework: 'Swiss institutional accreditation (HEdA, AAQ) · 5 standard areas',
    nextVisit: '2027-05-18',
    standards: [
      { area: '1 · Quality assurance strategy', items: [['Quality policy adopted by the board', 'done'], ['Quality cycle described (plan–do–check–act)', 'done'], ['Stakeholders involved: students, faculty, employers', 'partial']] },
      { area: '2 · Governance', items: [['Organisation chart and responsibilities', 'done'], ['Academic council minutes (last 2 years)', 'done'], ['Conflict-of-interest rules', 'missing']] },
      { area: '3 · Teaching, research, services', items: [['Programme learning goals for every programme', 'done'], ['Assurance of learning results (2 cycles)', 'partial'], ['Course evaluations with follow-up actions', 'partial'], ['Research output of core faculty', 'partial']] },
      { area: '4 · Resources', items: [['Faculty qualification profile', 'done'], ['Student–faculty ratio', 'done'], ['Financial plan (3 years)', 'partial'], ['Library and digital resources', 'done']] },
      { area: '5 · Communication', items: [['Public information is accurate and current', 'partial'], ['Complaints and appeals procedure', 'done'], ['Annual quality report published', 'missing']] },
    ],
    learningGoals: [
      { prog: 'bba', goal: 'Analyse a business problem with quantitative tools', target: 80, met: 74 },
      { prog: 'bba', goal: 'Communicate a recommendation in writing', target: 80, met: 83 },
      { prog: 'bba', goal: 'Apply ethical reasoning to a business case', target: 80, met: 79 },
      { prog: 'msc', goal: 'Design an international strategy with evidence', target: 80, met: 85 },
      { prog: 'msc', goal: 'Lead a culturally diverse team project', target: 80, met: 88 },
      { prog: 'emba', goal: 'Lead an organisational change plan', target: 80, met: 91 },
      { prog: 'emba', goal: 'Make a financially sound investment decision', target: 80, met: 77 },
      { prog: 'dba', goal: 'Produce research that meets doctoral standards', target: 80, met: 70 },
    ],
    complaints: [{ term: 'Spr 25', n: 6 }, { term: 'Aut 25', n: 4 }, { term: 'Spr 26', n: 7 }, { term: 'Aut 26', n: 3 }],
    gradeAppeals: 5, evalResponseTarget: 60,
  };

  /* ---- what the director needs at a glance: alerts derived from the data ---- */
  const active = students.filter(s => s.status === 'active');
  window.SCHOOL = {
    school, programs, P, faculty, sections, students, records, assignments, regions: REGIONS,
    history: { years: YEARS, headcount, budgetHeadcount, retention, revenue, budgetRevenue, invoicedYTD, collectedYTD, satisfactionTrend, graduateOutcomes },
    crm, registrar, finance, quality,
    /* helpers every page uses */
    util: {
      active, byId: id => students.find(s => s.id === id) || faculty.find(f => f.id === id) || sections.find(x => x.id === id),
      sec: id => sections.find(x => x.id === id), prof: id => faculty.find(f => f.id === id), rec: (st, sec) => records[st + '|' + sec],
      chf: n => 'CHF ' + Math.round(n).toLocaleString('de-CH').replace(/’/g, "'"), pct: n => Math.round(n) + ' %',
      grade: g => g == null ? '—' : g.toFixed(1),
      time: h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`,
    },
  };
})();
