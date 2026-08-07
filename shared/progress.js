/* =====================================================================
   SHARED · student progress + monitoring.
   One engine for every course. The page says which course it is; this
   reads that and does the rest:

     <body data-course="omba401" data-module="w3">
     <script src="/shared/config.js"   defer></script>
     <script src="/shared/progress.js" defer></script>
     ...
     StatsTrack.init({module:'w3', title:'Week 3 · …', total:6});
     StatsTrack.complete('s3');       // mark a section done
     StatsTrack.setScore(6, 8);       // quiz / homework pages
     StatsTrack.quizAnswer(i,p,ok);   // per-question checkpoint results

   Writes to <ns>/<sid>/... in the teaching-70f1c Realtime DB: who, when
   (first seen + last active), active seconds, per-section completion,
   scores, quiz answers and workbook text. Read by /shared/admin.html.
   Best-effort — every network call fails silently, and localStorage is
   always the source of truth.

   This is the union of the five copies it replaces (omba401, ombafr455,
   ideas-e1410, umef407, statistics). Nothing was dropped; the per-course
   differences are now config, not code.
   ===================================================================== */
(function () {
  "use strict";

  var CFG = window.CourseConfig;
  if (!CFG) { console.warn("progress.js: /shared/config.js must load first"); return; }

  var C = CFG.current();
  if (!C) { console.warn("progress.js: unknown or missing data-course"); return; }

  var DB = CFG.DB, NS = C.ns, K = C.key, T = C.theme;

  /* pages with a live FR/EN toggle set data-lang on <html>; honour it at
     render time and fall back to the course's configured language */
  function L(){ var l=document.documentElement.getAttribute('data-lang');
                return CFG.strings(l==='fr'||l==='en' ? l : C.lang); }

  var S = { mod:null, title:'', total:0, name:'', sid:'', secs:0, done:{}, started:false };

  function san(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
  function put(path,val){try{fetch(DB+'/'+path+'.json',{method:'PUT',keepalive:true,body:JSON.stringify(val)});}catch(e){}}
  /* PATCH merges, and slash-paths as keys let one request write a whole module */
  function patch(path,obj){try{fetch(DB+'/'+path+'.json',{method:'PATCH',keepalive:true,body:JSON.stringify(obj)});}catch(e){}}
  function now(){return Date.now();}
  function base(){return NS+'/'+S.sid;}
  function mbase(){return base()+'/mod/'+S.mod;}
  function lk(k){return K+'_'+k+'_'+S.mod;}
  function mk(k,mod){return K+'_'+k+'_'+mod;}

  /* cookies are best-effort only (blocked inside some LMS iframes);
     localStorage is the source of truth */
  function setCookie(k,v){try{document.cookie=k+'='+encodeURIComponent(v)+';path=/;max-age=31536000;samesite=lax';}catch(e){}}
  function getCookie(k){try{var m=document.cookie.match('(?:^|; )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}

  /* identity, in priority order: an in-page auth object, the shared roster
     login (<key>_auth, written by login.js / join.html), then the older
     name-only pair, then the cookie mirror of it */
  function readAuth(){
    if(window.COURSE_AUTH&&window.COURSE_AUTH.sid)return window.COURSE_AUTH;
    if(window.E1410_AUTH&&window.E1410_AUTH.sid)return window.E1410_AUTH;   /* legacy */
    var a=null;
    try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}
    if(!a){var c=getCookie(K+'_auth');if(c){try{a=JSON.parse(c);}catch(e){}}}
    return (a&&a.sid)?a:null;
  }

  function loadLocal(){
    try{
      var a=readAuth();
      if(a){ S.sid=a.sid; S.name=a.name||a.sid; }
      else{
        S.name=localStorage.getItem(K+'_name')||'';
        S.sid =localStorage.getItem(K+'_sid')||'';
        if(!S.name){var cn=getCookie(K+'_name'),cs=getCookie(K+'_sid');
          if(cn){S.name=cn;S.sid=cs||san(cn);try{localStorage.setItem(K+'_name',S.name);localStorage.setItem(K+'_sid',S.sid);}catch(e){}}}
      }
      S.secs=parseInt(localStorage.getItem(lk('secs'))||'0',10)||0;
      S.done=JSON.parse(localStorage.getItem(lk('done'))||'{}')||{};
    }catch(e){}
  }
  function saveSecs(){if(!S.mod)return;try{localStorage.setItem(lk('secs'),String(S.secs));}catch(e){}}
  function saveDone(){if(!S.mod)return;try{localStorage.setItem(lk('done'),JSON.stringify(S.done));}catch(e){}}
  /* remembered so a student who identifies later can be given a labelled
     module rather than a bare id */
  function saveMeta(){if(!S.mod)return;try{localStorage.setItem(lk('meta'),JSON.stringify({title:S.title,total:S.total}));}catch(e){}}

  function identify(){
    if(!S.sid)return;
    put(base()+'/name',S.name);
    put(base()+'/sid',S.sid);
    put(base()+'/updatedAt',now());
    if(!S.mod)return;                 /* pages that only offer the name box (dashboard) */
    put(mbase()+'/title',S.title);
    put(mbase()+'/total',S.total);
    put(mbase()+'/updatedAt',now());
    if(!S.started){S.started=true;put(mbase()+'/firstSeen',now());}
  }

  /* ---- backfill ----
     Sections, scores and time are always written to localStorage, named or not.
     So when a student finally identifies themselves — even weeks later, even on
     a different page — everything they have already done on this device is
     pushed, one PATCH per module. This is what makes "I skipped the name box on
     the first two homeworks" recoverable instead of lost. */
  function backfillAll(){
    if(!S.sid)return;
    saveSecs();saveMeta();
    var mods={},i,k,m,re=new RegExp('^'+K+'_(?:done|secs|score|meta)_(.+)$');
    try{
      for(i=0;i<localStorage.length;i++){
        k=localStorage.key(i);
        m=k&&k.match(re);
        if(m)mods[m[1]]=true;
      }
    }catch(e){}
    Object.keys(mods).forEach(function(mod){
      var obj={},meta={},done={},secs,score;
      try{meta=JSON.parse(localStorage.getItem(mk('meta',mod))||'{}')||{};}catch(e){}
      try{done=JSON.parse(localStorage.getItem(mk('done',mod))||'{}')||{};}catch(e){}
      secs =parseInt(localStorage.getItem(mk('secs',mod))||'0',10)||0;
      score=localStorage.getItem(mk('score',mod));
      if(meta.title)obj.title=meta.title;
      if(meta.total)obj.total=meta.total;
      if(secs)obj.secs=secs;
      if(score)obj.score=score;
      Object.keys(done).forEach(function(id){if(done[id])obj['done/'+id]=true;});
      obj.updatedAt=now();
      patch(base()+'/mod/'+mod,obj);
    });
    put(base()+'/name',S.name);
    put(base()+'/sid',S.sid);
    put(base()+'/updatedAt',now());
  }

  /* ---- active-time tracking ---- */
  function startTimer(){
    setInterval(function(){
      if(document.visibilityState!=='hidden'){S.secs++; if(S.secs%5===0)saveSecs();}
    },1000);
    setInterval(function(){flush();},15000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush();});
    window.addEventListener('pagehide',flush);
  }
  function flush(){saveSecs();if(S.sid&&S.mod){put(mbase()+'/secs',S.secs);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}}

  /* ---- identity UI, themed from config ---- */
  function injectCSS(){
    if(document.getElementById('st-css'))return;
    var c=document.createElement('style');c.id='st-css';
    c.textContent=
    '#st-pill{position:fixed;right:14px;bottom:14px;z-index:300;background:rgba(255,255,255,0.95);border:1.5px solid '+T.main+';'+
    'color:'+T.deep+';font:700 12px/1.2 "Helvetica Neue",Helvetica,Arial,sans-serif;border-radius:30px;padding:9px 14px;cursor:pointer;'+
    'box-shadow:0 10px 26px -12px rgba(0,0,0,.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);max-width:240px;}'+
    '#st-pill.unset{animation:stpulse 2s infinite;}'+
    '@keyframes stpulse{0%,100%{box-shadow:0 0 0 0 '+T.main+'73;}50%{box-shadow:0 0 0 7px '+T.main+'00;}}'+
    '#st-modal{position:fixed;inset:0;z-index:301;background:rgba(20,25,20,.55);display:none;align-items:center;justify-content:center;padding:18px;}'+
    '#st-modal.on{display:flex;}'+
    '#st-box{background:#fff;border:1px solid '+T.main+'40;border-radius:20px;padding:26px 24px;max-width:360px;width:100%;text-align:center;color:'+T.ink+';font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;box-shadow:0 18px 50px -20px rgba(0,0,0,0.5);}'+
    '#st-box h3{font-family:Georgia,serif;font-size:20px;margin-bottom:8px;color:'+T.deep+';}'+
    '#st-box p{font-size:13px;color:'+T.grey+';margin-bottom:14px;line-height:1.5;}'+
    '#st-box p.st-back{background:'+T.pale+';border-radius:10px;padding:10px 12px;font-size:12.5px;color:'+T.deep+';text-align:left;}'+
    '#st-box input{width:100%;background:'+T.surface+';border:1px solid '+T.main+'4d;border-radius:10px;color:'+T.ink+';font:15px "Helvetica Neue",Arial,sans-serif;padding:11px 13px;margin-bottom:12px;}'+
    '#st-box input:focus{outline:none;border-color:'+T.main+';}'+
    '#st-box button{background:'+T.main+';color:#fff;border:none;border-radius:30px;padding:11px 22px;font:bold 13px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}'+
    '#st-box .skip{display:block;margin:12px auto 0;color:'+T.grey+';font-size:12px;cursor:pointer;background:none;border:none;}';
    document.head.appendChild(c);
  }
  function renderPill(){
    /* pages with their own identity chip in the header use that instead */
    var w=document.getElementById('topWho');
    if(w){ if(S.name){w.textContent='👤 '+S.name;w.classList.add('on');} return; }
    var t=L();
    var p=document.getElementById('st-pill');
    if(!p){p=document.createElement('div');p.id='st-pill';document.body.appendChild(p);p.addEventListener('click',openModal);}
    if(S.name){p.className='';p.textContent='👤 '+S.name+t.pillSynced;}
    else{p.className='unset';p.textContent=t.pillUnset;}
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  function openModal(){
    /* a course on the shared roster gets a real login, not a name box */
    if(C.login){ if(window.CourseLogin) window.CourseLogin.open(); return; }
    injectCSS();
    var t=L();
    var m=document.getElementById('st-modal');
    if(!m){
      m=document.createElement('div');m.id='st-modal';
      m.innerHTML='<div id="st-box"><h3 id="st-h"></h3><p id="st-p"></p>'+
        '<p class="st-back"><b id="st-bt"></b> <span id="st-bb"></span></p>'+
        '<input id="st-name" autocomplete="name"><br>'+
        '<button id="st-save"></button>'+
        '<button class="skip" id="st-skip"></button></div>';
      document.body.appendChild(m);
      m.addEventListener('click',function(e){if(e.target===m)m.classList.remove('on');});
      document.getElementById('st-save').addEventListener('click',saveName);
      document.getElementById('st-skip').addEventListener('click',function(){m.classList.remove('on');});
      document.getElementById('st-name').addEventListener('keydown',function(e){if(e.key==='Enter')saveName();});
    }
    document.getElementById('st-h').textContent=t.title;
    document.getElementById('st-p').textContent=t.blurb;
    document.getElementById('st-bt').textContent=t.backTitle;
    document.getElementById('st-bb').textContent=t.backBody;
    document.getElementById('st-save').textContent=t.save;
    document.getElementById('st-skip').textContent=t.skip;
    var inp=document.getElementById('st-name');
    inp.placeholder=t.namePh; inp.value=S.name||'';
    m.classList.add('on');setTimeout(function(){inp.focus();},50);
  }
  function saveName(){
    var v=(document.getElementById('st-name').value||'').trim();
    if(!v){document.getElementById('st-name').focus();return;}
    setIdentity(v,san(v));
    var m=document.getElementById('st-modal'); if(m)m.classList.remove('on');
  }

  /* the one door identity comes through — the name modal today, the shared
     roster login (login.js) on courses that use it */
  function setIdentity(name,sid){
    S.name=name;S.sid=sid||san(name);
    try{localStorage.setItem(K+'_name',S.name);localStorage.setItem(K+'_sid',S.sid);}catch(e){}
    setCookie(K+'_name',S.name);setCookie(K+'_sid',S.sid);
    renderPill();
    identify();          /* this page, with firstSeen */
    backfillAll();       /* and everything already done on this device */
    try{window.dispatchEvent(new CustomEvent('statstrack:named',{detail:{name:S.name,sid:S.sid}}));}catch(e){}
  }

  /* ---- workbook: fillable exercise fields ----
     Any <input>/<textarea> with data-work="fieldId" auto-saves to localStorage
     (so the student can resume) and, debounced, to <sid>/work/<fieldId> so the
     instructor can read the answers in the dashboard. data-worklabel gives a
     short human label for that dashboard. An element with id="wbSave" is used
     as a save indicator if the page provides one. */
  function wireWorkbook(){
    var els=document.querySelectorAll('[data-work]');
    Array.prototype.forEach.call(els,function(el){
      var id=el.getAttribute('data-work'); if(!id)return;
      var label=el.getAttribute('data-worklabel')||id;
      try{var sv=localStorage.getItem(K+'_work_'+id); if(sv!=null)el.value=sv;}catch(e){}
      var t;
      el.addEventListener('input',function(){
        try{localStorage.setItem(K+'_work_'+id,el.value);}catch(e){}
        var st=document.getElementById('wbSave');
        if(st)st.textContent=L().saving;
        clearTimeout(t);
        t=setTimeout(function(){
          if(S.sid){ put(base()+'/work/'+id,{v:el.value,label:label,mod:S.mod,ts:now()}); put(base()+'/updatedAt',now()); }
          if(st)st.textContent=L().saved;
        },700);
      });
    });
  }

  /* ---- checkpoint quiz: per-question results ----
     A page's quiz widget exposes its question array as window.COURSE_QUIZ and
     calls quizAnswer() on every click. Two writes:
       <ns>/_quizmeta/<mod>              — question text + options (once per student)
       <ns>/<sid>/mod/<mod>/quiz/q<i>    — {p:pickedIndex, c:1|0, ts}
     The dashboard aggregates these across the cohort into the per-question
     "hardest questions" table you open the next session with. */
  function theQuiz(){ return window.COURSE_QUIZ || window.E1410_QUIZ; }
  function quizStamp(Q){return S.mod+'|'+Q.length+'|'+String(Q[0]&&Q[0].q||'').length;}
  function pushQuizMeta(){
    var Q=theQuiz();
    if(!S.sid||!S.mod||!Q||!Q.length)return;
    var stamp=quizStamp(Q); /* re-writes itself if the questions are ever edited */
    try{if(localStorage.getItem(K+'_qmeta_'+S.mod)===stamp)return;}catch(e){}
    put(NS+'/_quizmeta/'+S.mod,{title:S.title,ts:now(),qs:Q.map(function(it){
      return {q:it.q,opts:it.opts||[],a:(it.a==null?-1:it.a)};
    })});
    try{localStorage.setItem(K+'_qmeta_'+S.mod,stamp);}catch(e){}
  }

  /* ---- public API ---- */
  window.StatsTrack={
    init:function(o){
      /* a course access gate said no — don't track anything */
      if(window.COURSE_ACCESS===false||window.E1410_ACCESS===false)return;
      o=o||{};
      S.mod=o.module||(document.body&&document.body.getAttribute('data-module'))||null;
      S.title=o.title||S.mod;S.total=o.total||0;
      loadLocal();saveMeta();injectCSS();renderPill();wireWorkbook();
      if(S.sid){identify();backfillAll();pushQuizMeta();}
      startTimer();
      /* name-box courses nudge after a moment; roster courses are handled
         by login.js, which the page loads if it wants a prompt */
      if(!S.name&&!C.login){ setTimeout(function(){ if(!S.name)openModal(); },1500); }
    },
    quizAnswer:function(i,picked,ok){
      if(S.sid&&S.mod){
        put(mbase()+'/quiz/q'+i,{p:picked,c:ok?1:0,ts:now()});
        put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());
      }
      try{localStorage.setItem(lk('q'+i),(ok?1:0)+':'+picked);}catch(e){}
    },
    complete:function(id){
      if(!id||S.done[id])return;S.done[id]=true;saveDone();
      if(S.sid){put(mbase()+'/done/'+id,true);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}
    },
    setScore:function(done,total){
      try{localStorage.setItem(lk('score'),done+'/'+total);}catch(e){}
      if(S.sid){put(mbase()+'/score',done+'/'+total);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}
      /* submitting is the moment it matters — ask now rather than lose the score */
      else openModal();
    },
    /* for pages that show progress rather than make it: no module, no timer,
       just the identity pill and a working name box */
    attach:function(){
      loadLocal();injectCSS();renderPill();wireWorkbook();
      if(S.sid)identify();
    },
    askName:openModal,
    setIdentity:setIdentity,
    identified:function(){return !!S.sid;},
    name:function(){return S.name;},
    sid:function(){return S.sid;},
    course:function(){return C;}
  };
})();
