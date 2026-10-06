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
   Gland - Capstone: AI for Good - Bachelors", printed 6 Oct 2026). That
   Moodle page still carried the Masters run's dates (6 April – 15 June
   2026) and said only "Available from 18 October 2026" — a Sunday. START =
   Monday 19 Oct 2026 is therefore an ASSUMPTION; confirm it with the
   programme office. The Masters edition is SUMAS/wind (START 5 Oct 2026);
   the two folders are independent copies. Where a Moodle activity setting
   disagrees, Moodle wins — it enforces the attempt.
   ===================================================================== */
(function (root) {
  'use strict';

  var START = '2026-10-19';          /* Monday of Week 1 — the one line to change. ASSUMED: Moodle says "available from 18 Oct" (a Sunday) */
  var TZ = '+02:00';                 /* CEST until 25 Oct 2026, then CET: see tzFor() */

  /* Grade weights. ⚠ ASSUMED from the Moodle gradebook items (Online
     Discussion Forums · Case Study Written Analysis · Capstone: AI for
     Good · Capstone Final Results) and Week 9's "55% of your course
     grade". The MAM/MBA syllabus PDF is the authority — confirm. */
  var GRADES = [
    { pct: 10, name: 'Discussion forums',       d: 'posts and replies, on this site, every week' },
    { pct: 10, name: 'Phase 1 + Phase 2 reports', d: 'system analysis (W5) · data analysis (W8) · on Moodle' },
    { pct: 55, name: 'Capstone report · Phase 3', d: '4,000–5,000 words · integrates all three phases · W9' },
    { pct: 25, name: 'Final exam',              d: '60 MCQ · closed book · 2 h · W10' }
  ];

  /* The letter-grade scale, from the Moodle "Grading" block (undergraduate
     column). Shown on the hub so a mark out of 100 means something. */
  var SCALE = [
    ['A','93–100'],['A−','90–92'],['B+','87–89'],['B','83–86'],['B−','80–82'],
    ['C+','77–79'],['C','73–76'],['C−','70–72'],['D','63–69'],['F','0–62']
  ];

  /* The Bachelors Moodle course carries a "Zoom Link · Live-streaming
     lesson" the online Masters never had. Day and time are not on the page.
     Set LIVE = {day:'Tuesday', time:'14:00–15:30', where:'Zoom — link on Moodle'}
     once known; null renders as "to be announced" on the hub. */
  var LIVE = null;

  var WEEKS = [
    { n: 1,  role: 'Consultant',        title: 'Introduction to energy consulting & strategic frameworks' },
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
    { id:'f1a', wk:1, short:'Introduce yourself',           title:'Forum 1 · Introduce yourself',
      post:{min:200,max:300,day:2,time:'23:59'} },
    { id:'f1b', wk:1, short:'Data scavenger hunt',          title:'Forum 2 · Data scavenger hunt',
      post:{min:150,max:350,day:6,time:'23:59'}, re:{n:1,min:50,day:6,time:'23:59'} },
    { id:'f1c', wk:1, short:'Stakeholder map',              title:'Forum 3 · Stakeholder map of European offshore wind',
      post:{min:300,max:400,day:6,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f2a', wk:2, short:'Energy market data',           title:'Forum 4 · Three data points, and whether to trust them',
      post:{min:300,max:400,day:3,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f2b', wk:2, short:'Ørsted vs TotalEnergies',      title:'Forum 5 · One metric, two companies',
      post:{min:300,max:400,day:6,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f2c', wk:2, short:'2040 outlook debate',          title:'Forum 6 · The 2040 outlook debate (optional)',
      post:{min:80,max:300,day:6,time:'23:59'}, opt:true },
    { id:'f3a', wk:3, short:'Learning curve',               title:'Forum 7 · Learning curve: your 2040 LCOE projections',
      post:{min:300,max:400,day:5,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f3b', wk:3, short:'The AI audit',                 title:'Forum 8 · The AI audit: where your assistant gets it wrong',
      post:{min:250,max:350,day:6,time:'23:59'} },
    { id:'f3c', wk:3, short:'AI meets the question',        title:'Forum 9 · AI meets the strategic question (optional)',
      post:{min:150,max:400,day:6,time:'23:59'}, opt:true },
    { id:'f4',  wk:4, short:'Share your 2×2',               title:'Forum 10 · Compare your 2×2 with your peers (optional)',
      post:{min:80,max:400,day:6,time:'23:59'}, opt:true },
    { id:'f5',  wk:5, short:'Lock in your axes',            title:'Forum 11 · Lock in your axes',
      post:{min:60,max:200,day:0,time:'23:59'} },
    { id:'f6',  wk:6, short:'Your AI footprint',            title:'Forum 12 · Your AI audit — the energy and carbon of Phase 1',
      post:{min:250,max:350,day:6,time:'23:59'} },
    { id:'f7a', wk:7, short:'Fit your curve',               title:'Forum 13 · Fit your curve',
      post:{min:350,max:450,day:5,time:'23:59'}, re:{n:2,min:60,day:6,time:'23:59'} },
    { id:'f7b', wk:7, short:'Where the curve breaks',       title:'Forum 14 · Where the curve breaks',
      post:{min:300,max:400,day:6,time:'23:59'} },
    { id:'f7c', wk:7, short:'The water you didn\'t measure',title:'Forum 15 · The water you didn\'t measure (optional)',
      post:{min:100,max:200,day:6,time:'23:59'}, opt:true },
    { id:'f8',  wk:8, short:'Rolnick reflection',           title:'Forum 16 · Rolnick reflection (optional)',
      post:{min:150,max:200,day:6,time:'23:59'}, opt:true },
    { id:'f9',  wk:9, short:'Draft recommendation & peer challenge', title:'Forum 17 · Draft recommendation and the peer challenge',
      post:{min:400,max:500,day:2,time:'23:59'}, re:{n:2,min:200,day:4,time:'23:59'} }
  ];

  /* ---- the hand-ins, all on Moodle --------------------------------- */
  var PHASES = [
    { id:'p1', wk:5, day:6, time:'23:59', name:'Phase 1 · Strategic system analysis', words:'1,500–2,000 words', file:'LASTNAME_Phase1_Capstone2026.pdf' },
    { id:'p2p',wk:6, day:4, time:'23:59', name:'Phase 2 · Proposal', words:'≈ 600 words', file:'LASTNAME_Phase2proposal_Capstone2026.pdf' },
    { id:'p2', wk:8, day:6, time:'23:59', name:'Phase 2 · Data analysis report', words:'2,000 words ± 10% + figures', file:'LASTNAME_Phase2_Capstone2026.pdf' },
    { id:'p3', wk:9, day:6, time:'23:59', name:'Phase 3 · Final consulting report', words:'4,000–5,000 words + figures', file:'LASTNAME_Phase3_Capstone2026.pdf' }
  ];
  var EXAM = { wk:10, opens:{day:0,time:'09:30'}, closes:{day:7,time:'09:30'}, minutes:120, questions:60 };

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
  PHASES.forEach(function(p){ p.due=at(p.wk,p.day,p.time); p.dueText=fmtFull(p.due,p.time); });
  EXAM.open = at(EXAM.wk,EXAM.opens.day,EXAM.opens.time); EXAM.close = at(EXAM.wk,EXAM.closes.day,EXAM.closes.time);
  EXAM.openText = fmtFull(EXAM.open,EXAM.opens.time); EXAM.closeText = fmtFull(EXAM.close,EXAM.closes.time);
  WEEKS.forEach(function(w){ w.dates = weekRange(w.n); w.monday=weekMonday(w.n); });

  var S = {
    START:START, GRADES:GRADES, SCALE:SCALE, LIVE:LIVE, WEEKS:WEEKS, FORUMS:FORUMS, PHASES:PHASES, EXAM:EXAM,
    liveText: LIVE ? ('live lesson '+LIVE.day+(LIVE.time?' '+LIVE.time+' CET':'')+(LIVE.where?' · '+LIVE.where:'')) : 'live-streamed lesson on Zoom — link on Moodle, day and time to be announced',
    week:function(n){ for(var i=0;i<WEEKS.length;i++)if(WEEKS[i].n===n)return WEEKS[i]; return null; },
    forum:function(id){ for(var i=0;i<FORUMS.length;i++)if(FORUMS[i].id===id)return FORUMS[i]; return null; },
    forumsOf:function(wk){ return FORUMS.filter(function(f){return f.wk===wk;}); },
    phase:function(id){ for(var i=0;i<PHASES.length;i++)if(PHASES[i].id===id)return PHASES[i]; return null; },
    phasesOf:function(wk){ return PHASES.filter(function(p){return p.wk===wk;}); },
    fmtDay:fmtDay, fmtFull:fmtFull, weekRange:weekRange, weekOfToday:weekOfToday, at:at,
    courseRuns: fmtDay(weekMonday(1))+' – '+fmtDay(EXAM.close)+' '+EXAM.close.getFullYear()
  };
  root.CAPSTONE_SCHEDULE = S;
})(window);
