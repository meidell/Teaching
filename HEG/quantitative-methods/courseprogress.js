/* =====================================================================
   HEG · Quantitative Methods I — the course-progress ("mama") bar.
   Same two modes as HEG/statistics/courseprogress.js, from which this is
   ported:
     • full    — bar + per-chapter cards + caption, on index.html
     • compact — segmented bar only, in the top banner of every week page
   Overall % = mean of chapter fractions over the LIVE chapters that count.
   Reads local progress instantly (qm1_done_<mod>, written by
   /shared/progress.js), then refines from Firebase qm1/<sid>/mod when the
   student is signed in through /shared/login.js (qm1_auth).

   THE YEAR IS ONE BAR. This module runs two semesters, so both are listed
   from day one: the fall weeks are w1…w16 and the spring weeks s1…s16.
   That split is not cosmetic — presence.js picks its sessions with
   /^w(\d+)$/, so naming the spring weeks s* keeps them out of the
   register's dropdown, which covers the fall sessions only.

   A week that is not yet written is live:false — drawn hatched, excluded
   from the percentage — and flips to live:true the day its page ships.
   Homework is its own chapter because the dashboard tracks it as its own
   module.
   ⚠ Adding a REQUIRED chapter mid-semester lowers every student's
   displayed percentage. Every week of the year is therefore listed here
   ALREADY, hatched; shipping a page flips a flag and never changes the
   denominator, because pctOf() averages over the live chapters only.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="qm1", K="qm1";
  var CHAPTERS=[
    /* ---------------- FALL SEMESTER ---------------- */
    {mod:'w1',    short:'W1', name:'Fall W1 · Leveling up, functions and graphs',        total:9, live:true, href:'week1.html'},
    {mod:'w1-hw', short:'HW1',name:'Fall W1 · Homework — the ten printed problems', total:11,live:true,href:'week1-homework.html'},
    {mod:'w2',    short:'W2', name:'Fall W2 · Operations on functions',                  total:8, live:true, href:'week2.html'},
    {mod:'w2-hw', short:'HW2',name:'Fall W2 · Homework — the twelve printed problems', total:12,live:true,href:'week2-homework.html'},
    {mod:'w3',    short:'W3', name:'Fall W3 · Lines, parabolas and systems',             total:8, live:false},
    {mod:'w4',    short:'W4', name:'Fall W4 · Rate of change and the derivative',        total:8, live:false},
    {mod:'w5',    short:'W5', name:'Fall W5 · Differentiation rules',                    total:8, live:false},
    {mod:'w6',    short:'W6', name:'Fall W6 · Self-study week — the business case',      total:4, live:false},
    {mod:'w7',    short:'W7', name:'Fall W7 · Applications of the derivative',           total:8, live:false},
    {mod:'w8',    short:'W8', name:'Fall W8 · Optimization in one variable',             total:8, live:false},
    {mod:'w9',    short:'W9', name:'Fall W9 · Midterm · introduction to integration',    total:6, live:false},
    {mod:'w10',   short:'W10',name:'Fall W10 · Integration and surpluses',               total:8, live:false},
    {mod:'w11',   short:'W11',name:'Fall W11 · Data, collection and sampling',           total:8, live:false},
    {mod:'w12',   short:'W12',name:'Fall W12 · Describing data with graphs and tables',  total:8, live:false},
    {mod:'w13',   short:'W13',name:'Fall W13 · Describing data with numerical measures', total:8, live:false},
    {mod:'w14',   short:'W14',name:'Fall W14 · Bivariate data, independence, inequality',total:8, live:false},
    {mod:'w15',   short:'W15',name:'Fall W15 · Review — no new material',                total:4, live:false},
    {mod:'w16',   short:'W16',name:'Fall W16–17 · Fall semester exam',                   total:1, live:false},
    /* ---------------- SPRING SEMESTER ---------------- */
    {mod:'s1',    short:'S1', name:'Spring W1 · Foundations of probability',             total:8, live:false},
    {mod:'s2',    short:'S2', name:'Spring W2 · Rules of probability',                   total:8, live:false},
    {mod:'s3',    short:'S3', name:'Spring W3 · Discrete distributions',                 total:8, live:false},
    {mod:'s4',    short:'S4', name:'Spring W4 · Continuous distributions and the normal',total:8, live:false},
    {mod:'s5',    short:'S5', name:'Spring W5 · Probabilities for decisions · Bayes',    total:8, live:false},
    {mod:'s6',    short:'S6', name:'Spring W6 · Time value of money · interest rates',   total:8, live:false},
    {mod:'s7',    short:'S7', name:'Spring W7 · Annuities and perpetuities',             total:8, live:false},
    {mod:'s8',    short:'S8', name:'Spring W8 · Net present value and project valuation',total:8, live:false},
    {mod:'s9',    short:'S9', name:'Spring W9 · Portfolio return and risk',              total:8, live:false},
    {mod:'s10',   short:'S10',name:'Spring W10 · Vectors and matrices',                  total:8, live:false},
    {mod:'s11',   short:'S11',name:'Spring W11 · Determinants, inverses and systems',    total:8, live:false},
    {mod:'s12',   short:'S12',name:'Spring W12 · Linear regression',                     total:8, live:false},
    {mod:'s13',   short:'S13',name:'Spring W13 · Selected topics',                       total:6, live:false},
    {mod:'s14',   short:'S14',name:'Spring W14 · Selected topics',                       total:6, live:false},
    {mod:'s15',   short:'S15',name:'Spring W15 · Review — no new material',              total:4, live:false},
    {mod:'s16',   short:'S16',name:'Spring W16–17 · Spring semester exam',               total:1, live:false}
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
      + (up?' '+up+' more weeks unlock across the year — the hatched segments. The bar shows both semesters, so you can see the whole module at once.':'');
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
