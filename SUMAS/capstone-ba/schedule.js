/* =====================================================================
   SUMAS · Bachelor Capstone — the course schedule, in one place.

   THIS FILE IS THE SOURCE OF TRUTH for week dates, every forum and its
   deadline, the three phase deadlines, the exam window and the grade
   weights. The hub, the week pages, forum.html and followup.html all
   render from it, so a date cannot drift between them by hand-editing.

   Everything is computed from ONE constant, START, the Monday of Week 1.
   A new term means changing that line and nothing else. Deadlines are
   expressed as {wk, day, time} — day 0 = that week's Monday — and
   resolved to real dates here, with the Europe/Zurich offset baked in.

   ⚠ This is the BACHELORS edition (Moodle course id 1447, "2026 - Milan &
   Gland - Capstone: AI for Good - Bachelors", printed 6 Oct 2026). Unlike
   the online Masters edition (SUMAS/wind, same START) it MEETS WEEKLY:
   Jan Erik, 6 Oct 2026 — "it starts tomorrow and then every Thursday …
   group activity … and then … with me"; the hours were fixed on 7 Oct as
   17:15–18:15 (group hour) and 18:15–20:15 (class). So Week 1 is
   the week of Mon 5 Oct 2026, the first session is Wed 7 Oct (the
   SESSION_DATES override — delete it if the first session is really Thu 8
   Oct) and every later session is the Thursday of its week. The group
   hour's plan per week is thursday.html; the two folders are independent
   copies.

   ⚠ NOTHING IS HANDED IN ON MOODLE (Jan Erik, 7 Oct 2026: "we will create
   all forums and handings on my site, not in moodle"). The forums are
   forum.html; the four hand-ins (three phase reports and the Phase 2
   proposal) go through handin.html?p=<id>, which writes the file into the
   database the way UMEF/ideas-e1410/submit.html does, and the dashboard's
   "Handed in" tab lists them. The final exam is OPEN BOOK (same day).
   ===================================================================== */
(function (root) {
  'use strict';

  var START = '2026-10-05';          /* Monday of Week 1 — the one line to change (Jan Erik, 6 Oct 2026: "it starts tomorrow") */
  var TZ = '+02:00';                 /* CEST until 25 Oct 2026, then CET: see tzFor() */

  /* ---- the class: EIGHT students, TWO TEAMS OF FOUR (Jan Erik, 7 Oct 2026) ----
     The capstone report is ONE PER TEAM, written on report.html; the forums
     stay individual. Teams form in Week 1 on the site (week1.html) and live
     at <ns>/_teams/<id>. The two companies are the brief's; the Italian
     major replaced TotalEnergies on 7 Oct 2026 ("replace total with a
     similar italian company also active in wind"): Eni, through Plenitude,
     is the hedged oil-and-gas major with a renewables arm and minority
     offshore-wind stakes — the same bet TotalEnergies represented. */
  var TEAMS = [ { id:'t1', label:'Team 1' }, { id:'t2', label:'Team 2' } ];
  var TEAM_SIZE = 4, CLASS_SIZE = 8;
  var COMPANIES = {
    a: { name:'Ørsted', country:'Denmark', bet:'pure-play', d:'Transformed from an oil & gas company into the world\'s largest offshore wind developer. A pure-play bet on renewables.' },
    b: { name:'Eni', country:'Italy', bet:'hedged', d:'An integrated oil & gas major that has moved its renewables, retail and e-mobility into Plenitude, and holds minority stakes in offshore wind (Dogger Bank, Vårgrønn in Norway) rather than leading projects. A hedged transition strategy.' }
  };

  /* Grade weights. ⚠ ASSUMED from the Moodle gradebook items (Online
     Discussion Forums · Case Study Written Analysis · Capstone: AI for
     Good · Capstone Final Results) and Week 9's "55% of your course
     grade". The MAM/MBA syllabus PDF is the authority — confirm. */
  var GRADES = [
    { pct: 10, name: 'Discussion forums',       d: 'posts and replies, on this site, every week' },
    { pct: 10, name: 'Phase 1 + Phase 2 reports', d: 'system analysis (W5) · data analysis (W8) · handed in on this site' },
    { pct: 55, name: 'Capstone report · Phase 3', d: '4,000–5,000 words · integrates all three phases · W9' },
    { pct: 25, name: 'Final exam',              d: '60 MCQ · open book · 2 h · W10' }
  ];
  /* The letter-grade scale that used to sit here (A 93–100 … F 0–62) was
     removed from the hub on 7 Oct 2026 at Jan Erik's request. */

  /* ---- the weekly session -------------------------------------------
     Every Thursday: 17:15–18:15 the GROUP HOUR (students together online,
     no instructor — the plan per week is in thursday.html and on each week
     page), then 18:15–20:15 the class with Jan Erik. `day` is counted from
     the week's Monday (3 = Thursday). SESSION_DATES overrides a single
     week's date — Week 1 meets on Wednesday 7 Oct 2026, the day after the
     course opened. The Zoom link is on Moodle. */
  var SESSION = { day:3, group:['17:15','18:15'], cls:['18:15','20:15'], where:'Zoom — the link is on Moodle' };
  /* The shared canvas the group hour is written on — a Google Doc Jan Erik owns, one block per group per week; link-editable. null = not created yet. */
  var CANVAS = 'https://docs.google.com/document/d/1zx6ZK3LTskvNQpA9rKX7GAn3DYY0ju14XBgwk6YWiSU/edit';  /* created 7 Oct 2026 in Jan Erik's Drive; sharing must be 'anyone with the link · editor' */
  var SESSION_DATES = { 1:'2026-10-07' };

  var WEEKS = [
    { n: 1,  role: 'Consultant',        title: 'Organising the project — the brief, the teams, the plan' },
    { n: 2,  role: 'Data analyst',      title: 'Understanding the European wind energy market' },
    { n: 3,  role: 'Data analyst',      title: 'AI tools for sustainability analysis' },
    { n: 4,  role: 'Foresight analyst', title: 'Strategic forecasting and scenario planning' },
    { n: 5,  role: 'Systems analyst',   title: 'Workshop — project design and system mapping · Phase 1' },
    { n: 6,  role: 'Strategy analyst',  title: 'From narrative to numbers — the quantitative pivot' },
    { n: 7,  role: 'Technology analyst',title: 'Learning curves and their limits' },
    { n: 8,  role: 'Foresight analyst', title: 'Forecasting under uncertainty · Phase 2' },
    { n: 9,  role: 'Advisor',           title: 'The consulting recommendation · Phase 3' },
    { n: 10, role: '—',                 title: 'Revision and the final exam', examWeek: true }
  ];

  /* ---- the forums ---------------------------------------------------
     id       the Firebase node  <ns>/_forum/<id>/posts  and the module id
     post     {min,max} words, due {day,time} (day 0 = Monday of `wk`)
     re       {n, min} replies required, due {day,time}; absent = no replies
     opt      true = optional, no deadline enforced, not in the 10%
  ---------------------------------------------------------------------- */
  var FORUMS = [
    /* Week 1 is ORGANISING THE PROJECT (7 Oct 2026) and carries NO forum:
       the teams present themselves LIVE on the call (Jan Erik, 7 Oct 2026:
       "presentations to be done online — not in a forum"), and that is the
       week's participation mark. f1a (introduce yourself) was removed that
       day; the old data scavenger hunt (f1b) was dropped the day before —
       Week 2's f2a is the same task done properly — and the stakeholder map
       (f1c) moved to Week 2. Ids are kept: they are database paths. Titles
       are numbered 1–15 in order. */
    { id:'f2a', wk:2, short:'Energy market data',           title:'Forum 1 · Three data points, and whether to trust them',
      post:{min:300,max:400,day:3,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f1c', wk:2, short:'Stakeholder map',              title:'Forum 2 · Stakeholder map of European offshore wind',
      post:{min:300,max:400,day:6,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f2b', wk:2, short:'Ørsted vs Eni',                title:'Forum 3 · One metric, two companies',
      post:{min:300,max:400,day:6,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f2c', wk:2, short:'2040 outlook debate',          title:'Forum 4 · The 2040 outlook debate (optional)',
      post:{min:80,max:300,day:6,time:'23:59'}, opt:true },
    { id:'f3a', wk:3, short:'Learning curve',               title:'Forum 5 · Learning curve: your 2040 LCOE projections',
      post:{min:300,max:400,day:5,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f3b', wk:3, short:'The AI audit',                 title:'Forum 6 · The AI audit: where your assistant gets it wrong',
      post:{min:250,max:350,day:6,time:'23:59'} },
    { id:'f3c', wk:3, short:'AI meets the question',        title:'Forum 7 · AI meets the strategic question (optional)',
      post:{min:150,max:400,day:6,time:'23:59'}, opt:true },
    { id:'f4',  wk:4, short:'Share your 2×2',               title:'Forum 8 · Compare your 2×2 with your peers (optional)',
      post:{min:80,max:400,day:6,time:'23:59'}, opt:true },
    { id:'f5',  wk:5, short:'Lock in your axes',            title:'Forum 9 · Lock in your axes',
      post:{min:60,max:200,day:0,time:'23:59'} },
    { id:'f6',  wk:6, short:'Your AI footprint',            title:'Forum 10 · Your AI audit — the energy and carbon of Phase 1',
      post:{min:250,max:350,day:6,time:'23:59'} },
    { id:'f7a', wk:7, short:'Fit your curve',               title:'Forum 11 · Fit your curve',
      post:{min:350,max:450,day:5,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f7b', wk:7, short:'Where the curve breaks',       title:'Forum 12 · Where the curve breaks',
      post:{min:300,max:400,day:6,time:'23:59'} },
    { id:'f7c', wk:7, short:'The water you didn\'t measure',title:'Forum 13 · The water you didn\'t measure (optional)',
      post:{min:100,max:200,day:6,time:'23:59'}, opt:true },
    { id:'f8',  wk:8, short:'Rolnick reflection',           title:'Forum 14 · Rolnick reflection (optional)',
      post:{min:150,max:200,day:6,time:'23:59'}, opt:true },
    { id:'f9',  wk:9, short:'Draft recommendation & peer challenge', title:'Forum 15 · Draft recommendation and the peer challenge',
      post:{min:400,max:500,day:2,time:'23:59'}, re:{n:2,min:200,day:4,time:'23:59'} }
  ];

  /* ---- the hand-ins — all on THIS SITE ----------------------------------
     Each phase is a set of sections of the TEAM REPORT (report.html); a
     team hands a phase in from that page, which freezes a snapshot at
     _teams/<team>/handin/<id>. handin.html?p=<id> is the side door for a
     PDF (figures, an appendix, or the whole thing if a team insists);
     `file` is the name it asks for. `secs` names the report sections the
     phase covers — report.html reads it. */
  var PHASES = [
    { id:'p1', wk:5, day:6, time:'23:59', name:'Phase 1 · Strategic system analysis', words:'1,500–2,000 words', file:'TEAM_Phase1_Capstone2026.pdf', secs:['r1','r2','r3','r4','r5','r6','r7'], min:1500, max:2000 },
    { id:'p2p',wk:6, day:4, time:'23:59', name:'Phase 2 · Proposal', words:'≈ 600 words', file:'TEAM_Phase2proposal_Capstone2026.pdf', secs:['r8'], min:400, max:800 },
    { id:'p2', wk:8, day:6, time:'23:59', name:'Phase 2 · Data analysis report', words:'2,000 words ± 10% + figures', file:'TEAM_Phase2_Capstone2026.pdf', secs:['r9','r10','r11','r12'], min:1800, max:2200 },
    { id:'p3', wk:9, day:6, time:'23:59', name:'Phase 3 · Final consulting report', words:'4,000–5,000 words + figures', file:'TEAM_Phase3_Capstone2026.pdf', secs:['r0','r13','r14','r15','r16','r17','r18'], min:4000, max:5000, whole:true }
  ];
  /* openBook: Jan Erik, 7 Oct 2026 — "final exam will be open book". The
     week-10 page, the hub, the glossary and the Thursday plan all read it. */
  var EXAM = { wk:10, opens:{day:0,time:'09:30'}, closes:{day:7,time:'09:30'}, minutes:120, questions:60, openBook:true };

  /* ---- date arithmetic --------------------------------------------- */
  function pad(n){return (n<10?'0':'')+n;}
  function tzFor(d){ /* Europe/Zurich: CEST until the last Sunday of October 2026 (25 Oct, 03:00) */
    return d.getTime() < Date.parse('2026-10-25T03:00:00+02:00') ? '+02:00' : '+01:00';
  }
  function weekMonday(wk){ var d=new Date(START+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+7*(wk-1)); return d; }
  function at(wk,day,time){
    var m=weekMonday(wk); m.setUTCDate(m.getUTCDate()+day);
    var iso=m.toISOString().slice(0,10)+'T'+(time||'23:59')+':00';
    return new Date(Date.parse(iso+tzFor(new Date(iso+TZ))));
  }
  var DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], MONS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtDay(d){ var z=new Date(d); return DAYS[(z.getDay()+6)%7]+' '+z.getDate()+' '+MONS[z.getMonth()]; }
  function fmtFull(d,time){ return fmtDay(d)+(time?' · '+time:''); }
  function weekRange(wk){
    var a=weekMonday(wk), b=new Date(a); b.setUTCDate(b.getUTCDate()+6);
    var sa=a.getUTCDate()+(a.getUTCMonth()!==b.getUTCMonth()?' '+MONS[a.getUTCMonth()]:''), sb=b.getUTCDate()+' '+MONS[b.getUTCMonth()];
    return sa+' – '+sb;
  }
  function weekOfToday(){
    var now=Date.now(), s=weekMonday(1).getTime();
    if(now<s)return 0;
    var w=Math.floor((now-s)/(7*86400000))+1; return w>10?11:w;
  }

  /* resolve every deadline once, so pages can just read .due / .reDue */
  FORUMS.forEach(function(f){
    f.due = at(f.wk,f.post.day,f.post.time);
    f.dueText = fmtFull(f.due,f.post.time);
    if(f.re){ f.reDue = at(f.wk,f.re.day,f.re.time); f.reDueText = fmtFull(f.reDue,f.re.time); }
  });
  PHASES.forEach(function(p){ p.due=at(p.wk,p.day,p.time); p.dueText=fmtFull(p.due,p.time); p.href='report.html#'+p.id; p.fileHref='handin.html?p='+p.id; });
  EXAM.open = at(EXAM.wk,EXAM.opens.day,EXAM.opens.time); EXAM.close = at(EXAM.wk,EXAM.closes.day,EXAM.closes.time);
  EXAM.openText = fmtFull(EXAM.open,EXAM.opens.time); EXAM.closeText = fmtFull(EXAM.close,EXAM.closes.time);
  WEEKS.forEach(function(w){ w.dates = weekRange(w.n); w.monday=weekMonday(w.n); });

  /* the session of each week: a real date, and the strings the pages print */
  function sessionOf(wk){
    var d; if(SESSION_DATES[wk]){ d=new Date(SESSION_DATES[wk]+'T12:00:00Z'); } else { d=weekMonday(wk); d.setUTCDate(d.getUTCDate()+SESSION.day); }
    var day=fmtDay(d);
    return { date:d, day:day, group:SESSION.group[0]+'–'+SESSION.group[1], cls:SESSION.cls[0]+'–'+SESSION.cls[1], where:SESSION.where,
             text: day+' · '+SESSION.group[0]+' group hour · '+SESSION.cls[0]+'–'+SESSION.cls[1]+' with Jan Erik',
             odd: !!SESSION_DATES[wk] };
  }
  WEEKS.forEach(function(w){ w.session=sessionOf(w.n); });

  var S = {
    START:START, GRADES:GRADES, TEAMS:TEAMS, TEAM_SIZE:TEAM_SIZE, CLASS_SIZE:CLASS_SIZE, COMPANIES:COMPANIES, SESSION:SESSION, CANVAS:CANVAS, WEEKS:WEEKS, FORUMS:FORUMS, PHASES:PHASES, EXAM:EXAM,
    session:sessionOf,
    liveText: 'Thursdays on Zoom — '+SESSION.group[0]+'–'+SESSION.group[1]+' the group hour, '+SESSION.cls[0]+'–'+SESSION.cls[1]+' with Jan Erik (the first session is Wed 7 Oct)',
    week:function(n){ for(var i=0;i<WEEKS.length;i++)if(WEEKS[i].n===n)return WEEKS[i]; return null; },
    forum:function(id){ for(var i=0;i<FORUMS.length;i++)if(FORUMS[i].id===id)return FORUMS[i]; return null; },
    forumsOf:function(wk){ return FORUMS.filter(function(f){return f.wk===wk;}); },
    team:function(id){ for(var i=0;i<TEAMS.length;i++)if(TEAMS[i].id===id)return TEAMS[i]; return null; },
    phase:function(id){ for(var i=0;i<PHASES.length;i++)if(PHASES[i].id===id)return PHASES[i]; return null; },
    phasesOf:function(wk){ return PHASES.filter(function(p){return p.wk===wk;}); },
    fmtDay:fmtDay, fmtFull:fmtFull, weekRange:weekRange, weekOfToday:weekOfToday, at:at,
    courseRuns: fmtDay(weekMonday(1))+' – '+fmtDay(EXAM.close)+' '+EXAM.close.getFullYear()
  };
  root.CAPSTONE_SCHEDULE = S;
})(window);
