/* =====================================================================
   E1410 · Advanced Project Management in AI (IDEAS) — student progress.
   Identity comes from the one-time registration on join.html
   (localStorage/cookie 'e1410_auth' = {sid,name,pass}); gated pages
   redirect there before this script runs, so a student is always
   signed in. No name popup — syncing is automatic and silent.

   Logs to the teaching-70f1c Realtime DB under e1410/<sid>/... :
   who, when (first seen + last active), time spent, per-section
   completion, scores and workbook answers. Read by admin.html
   (PIN-gated). Best-effort, fails silently.

   Usage on any session page:
     <script src="progress.js" defer></script>
     StatsTrack.init({module:'s1', title:'Session 1 · …', total:7});
     StatsTrack.complete('s3');
     StatsTrack.setScore(6, 8);
   ===================================================================== */
(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="e1410";
  var S={mod:null,title:'',total:0,name:'',sid:'',secs:0,done:{},started:false};

  function put(path,val){try{fetch(DB+'/'+path+'.json',{method:'PUT',keepalive:true,body:JSON.stringify(val)});}catch(e){}}
  function now(){return Date.now();}
  function base(){return NS+'/'+S.sid;}
  function mbase(){return base()+'/mod/'+S.mod;}
  function lk(k){return 'e1410_'+k+'_'+S.mod;}

  function getCookie(k){try{var m=document.cookie.match('(?:^|; )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}
  function auth(){
    if(window.E1410_AUTH&&window.E1410_AUTH.sid)return window.E1410_AUTH;
    var a=null;
    try{a=JSON.parse(localStorage.getItem('e1410_auth')||'null');}catch(e){}
    if(!a){var c=getCookie('e1410_auth');if(c){try{a=JSON.parse(c);}catch(e){}}}
    return (a&&a.sid)?a:null;
  }

  function loadLocal(){
    var a=auth();
    if(a){S.sid=a.sid;S.name=a.name||a.sid;}
    try{
      S.secs=parseInt(localStorage.getItem(lk('secs'))||'0',10)||0;
      S.done=JSON.parse(localStorage.getItem(lk('done'))||'{}')||{};
    }catch(e){}
  }
  function saveSecs(){try{localStorage.setItem(lk('secs'),String(S.secs));}catch(e){}}
  function saveDone(){try{localStorage.setItem(lk('done'),JSON.stringify(S.done));}catch(e){}}

  function identify(){
    if(!S.sid)return;
    put(base()+'/name',S.name);
    put(base()+'/sid',S.sid);
    put(base()+'/updatedAt',now());
    put(mbase()+'/title',S.title);
    put(mbase()+'/total',S.total);
    put(mbase()+'/updatedAt',now());
    if(!S.started){S.started=true;put(mbase()+'/firstSeen',now());}
  }
  function pushAll(){
    if(!S.sid)return;
    identify();
    Object.keys(S.done).forEach(function(k){if(S.done[k])put(mbase()+'/done/'+k,true);});
    put(mbase()+'/secs',S.secs);
  }

  function startTimer(){
    setInterval(function(){ if(document.visibilityState!=='hidden'){S.secs++; if(S.secs%5===0)saveSecs();} },1000);
    setInterval(function(){flush();},15000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush();});
    window.addEventListener('pagehide',flush);
  }
  function flush(){saveSecs();if(S.sid){put(mbase()+'/secs',S.secs);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}}

  /* ---- workbook: fillable exercise fields (data-work) ----
     Any <input>/<textarea> with data-work="fieldId" auto-saves to localStorage
     (so the student can resume) and to Firebase under <sid>/work/<fieldId>
     (so the instructor can read the answers in admin.html). data-worklabel gives
     a short human label for the dashboard. Reused across all 8 sessions. */
  function wireWorkbook(){
    var els=document.querySelectorAll('[data-work]');
    els.forEach(function(el){
      var id=el.getAttribute('data-work'); if(!id)return;
      var label=el.getAttribute('data-worklabel')||id;
      try{var sv=localStorage.getItem('e1410_work_'+id); if(sv!=null)el.value=sv;}catch(e){}
      var t;
      el.addEventListener('input',function(){
        try{localStorage.setItem('e1410_work_'+id,el.value);}catch(e){}
        var st=document.getElementById('wbSave');
        if(st)st.textContent='Saving…';
        clearTimeout(t);
        t=setTimeout(function(){
          if(S.sid){ put(base()+'/work/'+id,{v:el.value,label:label,mod:S.mod,ts:now()}); put(base()+'/updatedAt',now()); }
          if(st)st.textContent='Saved ✓';
        },700);
      });
    });
  }

  window.StatsTrack={
    init:function(o){
      if(window.E1410_ACCESS===false)return; /* course access not granted — don't track */
      S.mod=o.module;S.title=o.title||o.module;S.total=o.total||0;
      loadLocal();wireWorkbook();
      var w=document.getElementById('topWho'); if(w&&S.name){w.textContent='👤 '+S.name;w.classList.add('on');}
      if(S.sid)identify();
      startTimer();
    },
    complete:function(id){
      if(!id||S.done[id])return;S.done[id]=true;saveDone();
      if(S.sid){put(mbase()+'/done/'+id,true);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}
    },
    setScore:function(done,total){
      if(S.sid){put(mbase()+'/score',done+'/'+total);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}
      try{localStorage.setItem(lk('score'),done+'/'+total);}catch(e){}
    },
    name:function(){return S.name;}
  };
})();
