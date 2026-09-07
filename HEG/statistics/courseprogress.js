/* =====================================================================
   HEG · Applied Statistics — the course-progress ("mama") bar.
   Ported from ideas-e1410/courseprogress.js; same two modes:
     • full    — bar + per-week cards + caption, on index.html
     • compact — segmented bar only, in the top banner of every week page
   Overall % = mean of chapter fractions over the LIVE chapters that count.
   Reads local progress instantly (stats_done_<mod>, written by
   /shared/progress.js), then refines from Firebase statistics/<sid>/mod
   when the student is signed in through /shared/login.js (stats_auth).

   The sixteen weeks of the HEG syllabus are all listed so the bar has the
   shape of the whole semester from day one; a week that is not yet
   written is live:false — drawn hatched, excluded from the percentage —
   and flips to live:true the day its page ships. Homework is its own
   chapter because the dashboard tracks it as its own module.
   ⚠ Adding a REQUIRED chapter mid-semester lowers every student's
   displayed percentage; tools (practice arena, exam cards, simulators)
   are therefore opt:true — listed, never counted.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="statistics", K="stats";
  var CHAPTERS=[
    {mod:'w1',    short:'W1', name:'Week 1 · Introduction — before the formulas',   total:8,live:true, href:'week1.html'},
    {mod:'w1-hw', short:'HW1',name:'Week 1 · Homework — describe the market',       total:24,live:true,href:'week1-homework.html'},
    {mod:'w2',    short:'W2', name:'Week 2 · Descriptive statistics',                total:8,live:true, href:'week2.html'},
    {mod:'w2-hw', short:'HW2',name:'Week 2 · Homework — picture & place the data',  total:20,live:true,href:'week2-homework.html'},
    {mod:'w3',    short:'W3', name:'Week 3 · Discrete random variables',             total:8,live:false},
    {mod:'w4',    short:'W4', name:'Week 4 · Continuous random variables',           total:8,live:false},
    {mod:'w5',    short:'W5', name:'Week 5 · Sampling distributions',                total:8,live:false},
    {mod:'w6',    short:'W6', name:'Week 6 · Estimation',                            total:8,live:false},
    {mod:'w7',    short:'W7', name:'Week 7 · Testing hypotheses',                    total:8,live:false},
    {mod:'w8',    short:'W8', name:'Week 8 · Two-sample problems',                   total:8,live:false},
    {mod:'w9',    short:'W9', name:'Week 9 · Correlation and regression',            total:8,live:false},
    {mod:'w10',   short:'W10',name:'Week 10 · Chi-square tests and F-tests',         total:8,live:false},
    {mod:'w11',   short:'W11',name:'Week 11 · PCA and non-parametric tests',         total:6,live:false},
    {mod:'w12',   short:'W12',name:'Week 12 · Working in R',                         total:6,live:false},
    {mod:'w13',   short:'W13',name:'Week 13 · Exercises and repetition I',           total:4,live:false},
    {mod:'w14',   short:'W14',name:'Week 14 · Exercises and repetition II',          total:4,live:false},
    {mod:'w15',   short:'W15',name:'Week 15 · The blank test',                       total:2,live:false},
    {mod:'w16',   short:'W16',name:'Week 16 · Final exam',                           total:1,live:false},
    /* tools: listed and ticked, never part of the percentage */
    {mod:'practice',     short:'PA', name:'Practice arena — endless randomised problems', total:8,live:true,opt:true,href:'practice.html'},
    {mod:'sampling-sim', short:'SIM',name:'Sampling-distribution simulator',              total:1,live:true,opt:true,href:'sampling-sim.html'},
    {mod:'exam',         short:'EX', name:'Exam cards — every archetype, fresh numbers',  total:6,live:true,opt:true,href:'exam-cards.html'}
  ];
  function localDone(mod){try{var o=JSON.parse(localStorage.getItem(K+'_done_'+mod)||'{}');var n=0;for(var k in o){if(o[k])n++;}return n;}catch(e){return 0;}}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  /* build the chapter data straight from a student's Firebase mod object —
     used by the instructor dashboard to draw each student's course bar */
  function dataFromMods(modObj){var data={};CHAPTERS.forEach(function(c){var n=0,node=modObj&&modObj[c.mod];if(node&&node.done){for(var k in node.done){if(node.done[k])n++;}}data[c.mod]={done:Math.min(c.total,n)};});return data;}
  function counted(){return CHAPTERS.filter(function(c){return !c.opt;});}
  function pctOf(data){var u=counted().filter(function(c){return c.live;}),s=0;if(!u.length)return 0;u.forEach(function(c){s+=c.total?Math.min(1,data[c.mod].done/c.total):0;});return Math.round(s/u.length*100);}
  function caption(data){
    var live=counted().filter(function(c){return c.live;});
    var done=live.filter(function(c){return data[c.mod].done>=c.total;}).length;
    var up=counted().filter(function(c){return !c.live;}).length;
    return (done===live.length
      ? '✓ You’re up to date — everything published so far is done.'
      : 'You’ve completed '+done+' of '+live.length+' published chapters. The bar fills as you finish each week’s lesson and homework.')
      + (up?' '+up+' more weeks unlock as the semester goes on — the hatched segments.':'')
      + ' The tools at the bottom are for practice and never count against you.';
  }
  function buildList(data,el){
    el.innerHTML='';
    CHAPTERS.forEach(function(c){
      var d=data[c.mod].done,st,cls;
      if(!c.live){st='Upcoming';cls='up';}
      else if(d>=c.total){st='Done ✓';cls='done';}
      else if(d>0){st=d+'/'+c.total;cls='prog';}
      else if(c.opt){st='Optional';cls='up';}
      else{st='Not started';cls='prog';}
      var ci=document.createElement('div');ci.className='ci'+(c.opt?' opt':'');
      ci.innerHTML='<span></span><span class="st '+cls+'"></span>';
      if(c.href&&c.live){
        var a=document.createElement('a');a.href=c.href;a.textContent=c.name;
        a.style.cssText='color:inherit;text-decoration:none;border-bottom:1px dotted currentColor;';
        ci.children[0].appendChild(a);
      } else ci.children[0].textContent=c.name;
      ci.children[1].textContent=st;
      el.appendChild(ci);
    });
  }
  function paint(data,opts){
    if(opts.bar){
      opts.bar.innerHTML='';
      counted().forEach(function(c){
        var frac=c.total?Math.min(1,data[c.mod].done/c.total):0;
        if(opts.compact){
          var seg=document.createElement('div');seg.className='cseg'+(!c.live?' locked':'');
          seg.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':'upcoming');
          seg.innerHTML='<div class="cf" style="width:'+(frac*100)+'%"></div>';
          opts.bar.appendChild(seg);
        }else{
          var col=document.createElement('div');col.className='segcol';
          col.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':'upcoming');
          col.innerHTML='<div class="seg'+(!c.live?' locked':'')+(frac>=1?' done':'')+'"><div class="fill" style="width:'+(frac*100)+'%"></div></div><span class="code"></span>';
          col.querySelector('.code').textContent=c.short;
          opts.bar.appendChild(col);
        }
      });
    }
    if(opts.pct)opts.pct.textContent=pctOf(data)+'%';
    if(opts.cap)opts.cap.textContent=caption(data);
    if(opts.list)buildList(data,opts.list);
    if(opts.reveal)opts.reveal.style.display='block';
  }
  function render(opts){
    var data={};CHAPTERS.forEach(function(c){data[c.mod]={done:Math.min(c.total,localDone(c.mod))};});
    paint(data,opts);
    var a=auth();
    if(a){
      fetch(DB+'/'+NS+'/'+a.sid+'/mod.json').then(function(r){return r.json();}).then(function(m){
        if(!m)return;
        CHAPTERS.forEach(function(c){var node=m[c.mod];if(node&&node.done){var n=0;for(var k in node.done){if(node.done[k])n++;}n=Math.min(c.total,n);if(n>data[c.mod].done)data[c.mod].done=n;}});
        paint(data,opts);
      }).catch(function(){});
    }
  }
  return {CHAPTERS:CHAPTERS,render:render,pct:pctOf,paint:paint,dataFromMods:dataFromMods,auth:auth};
})();
