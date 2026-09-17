/* =====================================================================
   GBS · The Creator Economy & Search Everywhere Optimization —
   the course-progress ("mama") bar.  Ported from
   HEG/quantitative-methods/courseprogress.js; two modes:
     • full    — bar + per-session cards + caption, on index.html
     • compact — segmented bar only, in the top banner of a session page
   Overall % = mean of chapter fractions over the LIVE chapters that count.
   Reads local progress instantly (creator_done_<mod>, written by
   /shared/progress.js), then refines from Firebase creator/<sid>/mod when
   the student is signed in through /shared/login.js (creator_auth).

   ⚠ THE MODULE IDS ARE THE SCHOOL'S WEEK NUMBERS, NOT 1…11.
   The GBS academic calendar runs Week 01…Week 11 with Week 09 given over
   to Specialization Module 1, so this course teaches w1…w8, w10, w11 and
   then presentation week. There is deliberately NO w9 chapter — the hub
   still draws a card for that week so the grid does not lie about the
   term, but nothing is tracked against it. Numbering the sessions 1…11
   instead would mean every conversation with a student needed translating
   between "session 9" and "week 10"; this way the site, the timetable and
   the room all say the same number.

   ⚠ Adding a REQUIRED chapter mid-term lowers every enrolled student's
   displayed percentage — the trap every course in this repo documents.
   All eleven sessions are therefore listed ALREADY, hatched; shipping a
   page flips live:true and never changes the denominator, because pctOf()
   averages over the live chapters only.

   `total` is the number of trackable steps on each session page. They are
   provisional until the page is written — set the real number when the
   page ships, in the same commit, or the bar reports a fraction of a
   denominator that does not exist. Each session is a 1 h 45 workshop
   whose page is a run sheet plus the capture widgets (prediction, dataset
   row, artifact upload), NOT a slide deck, so the counts are small by
   design.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="creator", K="creator";
  var CHAPTERS=[
    {mod:'w1',  short:'W1', name:'Week 01 · Fifteen phones, one question',        total:8, live:true, href:'week1.html'},
    {mod:'w2',  short:'W2', name:'Week 02 · Reverse-engineer a winner',           total:5, live:false},
    {mod:'w3',  short:'W3', name:'Week 03 · The intervention goes live',          total:6, live:false},
    {mod:'w4',  short:'W4', name:'Week 04 · The creator draft',                   total:5, live:false},
    {mod:'w5',  short:'W5', name:'Week 05 · The negotiation',                     total:5, live:false},
    {mod:'w6',  short:'W6', name:'Week 06 · Find the lie',                        total:5, live:false},
    {mod:'w7',  short:'W7', name:'Week 07 · Crisis, on the clock',                total:5, live:false},
    {mod:'w8',  short:'W8', name:'Week 08 · Live commerce — watch it, then do it',total:5, live:false},
    /* Week 09 is Specialization Module 1 — no session, and no chapter. */
    {mod:'w10', short:'W10',name:'Week 10 · First reading, and the spine',        total:5, live:false},
    {mod:'w11', short:'W11',name:'Week 11 · The verdict, and the rehearsal',      total:5, live:false},
    {mod:'wp',  short:'PW', name:'Presentation week · The pitch',                 total:3, live:false}
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
    if(!live.length)return 'The term opens in Week 01. Each session unlocks on the morning it runs — there is nothing to read ahead, because the material is what the room produces on the day.';
    return (done===live.length
      ? '✓ You’re up to date — every session published so far is logged.'
      : 'You’ve completed '+done+' of '+live.length+' published sessions. The bar fills as you log the work you actually did in the room.')
      + (up?' '+up+' more unlock as the term runs — the hatched segments.':'');
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
