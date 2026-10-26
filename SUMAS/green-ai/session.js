/* =====================================================================
   SUMAS · CrS Green AI — the session-page engine (26 Oct 2026).
   A session page is a run sheet: one .step[id] per block. A block is done
   when its [data-done] button is pressed — after the fields named in
   data-need (comma-separated ids) are filled. The progress denominator is
   the number of .step blocks, and courseprogress.js must carry the same
   `total` for the module (S1 = 8, S2 = 8, S3 = 7).
   Captured answers are ordinary [data-work] fields: /shared/progress.js
   saves them locally and to green-ai/<sid>/work/<id>.
   ===================================================================== */
window.GreenSession=(function(){
  'use strict';
  var K='green-ai',MOD='',STEPS=[];
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(K+'_'+k);if(v===null)localStorage.removeItem(K+'_'+k);else localStorage.setItem(K+'_'+k,v);}catch(e){return null;}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function setWork(id,v){var el=document.getElementById(id);if(!el)return;el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));}
  function doneMap(){try{return JSON.parse(localStorage.getItem(K+'_done_'+MOD)||'{}');}catch(e){return {};}}
  function isDone(id){return !!doneMap()[id];}
  function markDone(id){
    if(window.StatsTrack&&StatsTrack.complete)StatsTrack.complete(id);
    else{var o=doneMap();o[id]=true;try{localStorage.setItem(K+'_done_'+MOD,JSON.stringify(o));}catch(e){}}
    paint();
  }
  function paint(){
    var n=0;STEPS.forEach(function(s){var el=document.getElementById(s);if(isDone(s)){n++;if(el)el.classList.add('done');}});
    var p=STEPS.length?Math.round(n/STEPS.length*100):0;
    var a=document.getElementById('spLbl'),b=document.getElementById('spPct'),c=document.getElementById('spFill');
    if(a)a.textContent=n+' / '+STEPS.length;if(b)b.textContent=p+'%';if(c)c.style.width=p+'%';
    document.querySelectorAll('[data-done]').forEach(function(btn){var st=btn.closest('.step');if(st&&isDone(st.id)){btn.textContent='Done ✓';}});
    if(window.CourseProgress)CourseProgress.render({bar:document.getElementById('cbar'),compact:true});
  }
  function filled(id){var el=document.getElementById(id);return el&&String(el.value||'').trim().length>0;}
  function init(o){
    MOD=o.mod;STEPS=[].slice.call(document.querySelectorAll('.step[id]')).map(function(s){return s.id;});
    document.querySelectorAll('[data-done]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var st=btn.closest('.step');if(!st)return;
        var need=(btn.getAttribute('data-need')||'').split(',').filter(Boolean);
        var miss=need.filter(function(id){return !filled(id);});
        if(miss.length){alert(btn.getAttribute('data-msg')||'Fill in the boxes in this block first.');return;}
        markDone(st.id);
      });
    });
    paint();
    window.addEventListener('DOMContentLoaded',function(){
      if(window.StatsTrack&&StatsTrack.init){StatsTrack.init({module:MOD,title:o.title,total:STEPS.length});STEPS.forEach(function(s){if(isDone(s))StatsTrack.complete(s);});}
      paint();
    });
    function chip(){var a=null;try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}
      var w=document.getElementById('tbWho');if(a&&a.sid&&w){w.textContent='👤 '+a.name;w.classList.add('on');}}
    chip();window.addEventListener('statstrack:named',chip);
  }
  return {init:init,markDone:markDone,isDone:isDone,ls:ls,esc:esc,setWork:setWork};
})();
