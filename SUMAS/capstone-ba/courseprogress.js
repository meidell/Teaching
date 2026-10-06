/* =====================================================================
   SUMAS · Bachelor Capstone — the course-progress bar.
   A port of SUMAS/mba406/courseprogress.js (itself from mba401 / E1410);
   same two modes:
     • full    — bar + per-chapter list + caption, on index.html
     • compact — segmented bar only, in the top bar of every week page
   Overall % = mean of chapter fractions over the LIVE chapters.

   What differs here: all ten weeks are written from day one, so `live`
   is not a constant — a chapter is live once its week has STARTED
   (schedule.js, Monday of the week). The bar therefore grows with the
   calendar: in Week 1 the denominator is Week 1 and its forums; by
   Week 10 it is everything. Forums are chapters too (the graded
   participation), total = post (+ replies); optional forums are opt:true
   — listed, never counted.

   ⚠ `total` on a week page = .sec[data-step] + #recall + #quiz +
   [data-work], exactly as capstone.js counts it. _build/count.py
   recounts these from the pages; run it after editing any week.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="capstone-ba", K="capstone-ba";
  var S=window.CAPSTONE_SCHEDULE;
  var WEEK_TOTALS={w1:0,w2:0,w3:0,w4:0,w5:0,w6:0,w7:0,w8:0,w9:0,w10:0}; /* filled by _build/count.py */
  WEEK_TOTALS={w1:10,w2:12,w3:13,w4:13,w5:13,w6:11,w7:10,w8:10,w9:12,w10:7};
  var CHAPTERS=[];
  (S?S.WEEKS:[]).forEach(function(w){
    var live=Date.now()>=w.monday.getTime();
    CHAPTERS.push({mod:'w'+w.n, short:'W'+w.n, name:'Week '+w.n+' · '+w.title, total:WEEK_TOTALS['w'+w.n]||1, live:live, href:'week'+w.n+'.html', wk:w.n});
    S.forumsOf(w.n).forEach(function(f){
      CHAPTERS.push({mod:f.id, short:'F', name:'  ↳ '+f.title, total:f.re?2:1, live:live, href:'forum.html?f='+f.id, opt:!!f.opt, forum:true, wk:w.n});
    });
  });

  function localDone(mod){try{var o=JSON.parse(localStorage.getItem(K+'_done_'+mod)||'{}');var n=0;for(var k in o){if(o[k])n++;}return n;}catch(e){return 0;}}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  function dataFromMods(modObj){var data={};CHAPTERS.forEach(function(c){var n=0,node=modObj&&modObj[c.mod];if(node&&node.done){for(var k in node.done){if(node.done[k])n++;}}data[c.mod]={done:Math.min(c.total,n)};});return data;}
  function counted(){return CHAPTERS.filter(function(c){return !c.opt;});}
  function pctOf(data){var u=counted().filter(function(c){return c.live;}),s=0;if(!u.length)return 0;u.forEach(function(c){s+=c.total?Math.min(1,data[c.mod].done/c.total):0;});return Math.round(s/u.length*100);}
  function caption(data){
    var live=counted().filter(function(c){return c.live;});
    var done=live.filter(function(c){return data[c.mod].done>=c.total;}).length;
    var up=counted().filter(function(c){return !c.live;}).length;
    return (done===live.length&&live.length
      ? '✓ You’re up to date — everything open so far is done.'
      : 'You’ve completed '+done+' of '+live.length+' open items. The bar fills as you work through each week and post in its forums.')
      + (up?' '+up+' more open as the weeks arrive — the hatched segments.':'');
  }
  function buildList(data,el){
    el.innerHTML='';
    CHAPTERS.forEach(function(c){
      var d=data[c.mod].done,st,cls;
      if(!c.live){st='Opens '+(S?S.fmtDay(S.week(c.wk).monday):'later');cls='up';}
      else if(d>=c.total){st='Done ✓';cls='done';}
      else if(d>0){st=d+'/'+c.total;cls='prog';}
      else if(c.opt){st='Optional';cls='up';}
      else{st='Not started';cls='prog';}
      var ci=document.createElement('div');ci.className='ci'+(c.opt?' opt':'')+(c.forum?' fo':'');
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
      counted().filter(function(c){return !c.forum||!opts.compact;}).forEach(function(c){
        var frac=c.total?Math.min(1,data[c.mod].done/c.total):0;
        if(opts.compact){
          var seg=document.createElement('div');seg.className='cseg'+(!c.live?' locked':'');
          seg.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':'upcoming');
          seg.innerHTML='<div class="cf" style="width:'+(frac*100)+'%"></div>';
          opts.bar.appendChild(seg);
        }else{
          var col=document.createElement('div');col.className='segcol'+(c.forum?' fo':'');
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
