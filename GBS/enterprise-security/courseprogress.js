/* =====================================================================
   GBS · Enterprise Security, Cyber Warfare & Asset Protection — the
   course-progress ("mama") bar. A port of GBS/creator-economy/
   courseprogress.js with the namespace and the chapters changed; two modes:
     • full    — bar + per-session cards + caption, on index.html
     • compact — segmented bar only, in the top bar of a session page
   Overall % = mean of chapter fractions over the LIVE chapters that count.

   ⚠ MODULE IDS ARE SESSION NUMBERS, and two are missing on purpose:
   Session 07 is the midterm and Session 14 the final exam. Neither has a
   page, so neither is a chapter — an exam in the bar would be a segment
   nobody can fill. w7 and w14 must never be reused for teaching pages.

   ⚠ Adding a REQUIRED chapter mid-term lowers every enrolled student's
   displayed percentage. All twelve teaching sessions are therefore listed
   ALREADY, hatched; shipping a page flips live:true and sets its real
   `total` (the number of .step blocks) in the same commit.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="escwa", K="escwa";
  var CHAPTERS=[
    {mod:'w1',  short:'S1', name:'Session 01 · Who was the target?',                    total:7, live:true, href:'week1.html'},
    {mod:'w2',  short:'S2', name:'Session 02 · Below the threshold',                    total:6, live:false},
    {mod:'w3',  short:'S3', name:'Session 03 · Will cyber war take place?',             total:6, live:false},
    {mod:'w4',  short:'S4', name:'Session 04 · Cables, satellites and the sky',         total:6, live:false},
    {mod:'w5',  short:'S5', name:'Session 05 · The update you trusted',                 total:6, live:false},
    {mod:'w6',  short:'S6', name:'Session 06 · Putting a number on it',                 total:6, live:false},
    /* Session 07 is the midterm — no page, no chapter. */
    {mod:'w8',  short:'S8', name:'Session 08 · Hybrid threats, resilient firms',        total:6, live:false},
    {mod:'w9',  short:'S9', name:'Session 09 · The tabletop: 72 hours',                 total:6, live:false},
    {mod:'w10', short:'S10',name:'Session 10 · Who answers for it?',                    total:6, live:false},
    {mod:'w11', short:'S11',name:'Session 11 · Gates, guards and governments',          total:6, live:false},
    {mod:'w12', short:'S12',name:'Session 12 · Four companies, four bad days',          total:6, live:false},
    {mod:'w13', short:'S13',name:'Session 13 · What comes next — and revision',         total:5, live:false}
    /* Session 14 is the final exam — no page, no chapter. */
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
    if(!live.length)return 'The term opens on Friday 16 October. Each session unlocks on the morning it runs — there is nothing to read ahead, because the material is what the room produces on the day.';
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
