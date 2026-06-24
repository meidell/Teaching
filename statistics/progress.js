/* =====================================================================
   Statistics course — student progress + monitoring.
   Named-student sync to the teaching-70f1c Realtime DB, under
   statistics/<sid>/...  Logs: who, when (first seen + last active),
   time spent (active seconds), per-section completion, and scores.
   Read by statistics/admin.html (auth-gated). Best-effort, fails silently.

   Usage on any module page:
     <script src="progress.js" defer></script>
     ...then once your DOM is ready:
     StatsTrack.init({module:'m0', title:'Module 0 · Before the Formulas', total:6});
     StatsTrack.complete('s3');        // mark a section done
     StatsTrack.setScore(12, 18);      // for homework / exam pages
   ===================================================================== */
(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="statistics";
  var S={mod:null,title:'',total:0,name:'',sid:'',secs:0,done:{},started:false};

  function san(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
  function put(path,val){try{fetch(DB+'/'+path+'.json',{method:'PUT',keepalive:true,body:JSON.stringify(val)});}catch(e){}}
  function now(){return Date.now();}
  function base(){return NS+'/'+S.sid;}
  function mbase(){return base()+'/mod/'+S.mod;}
  function lk(k){return 'stats_'+k+'_'+S.mod;}

  function setCookie(k,v){try{document.cookie=k+'='+encodeURIComponent(v)+';path=/;max-age=31536000;samesite=lax';}catch(e){}}
  function getCookie(k){try{var m=document.cookie.match('(?:^|; )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}

  function loadLocal(){
    try{
      S.name=localStorage.getItem('stats_name')||'';
      S.sid =localStorage.getItem('stats_sid')||'';
      // fall back to the long-lived cookie (survives a cleared localStorage / returning student)
      if(!S.name){var cn=getCookie('stats_name'),cs=getCookie('stats_sid');
        if(cn){S.name=cn;S.sid=cs||san(cn);try{localStorage.setItem('stats_name',S.name);localStorage.setItem('stats_sid',S.sid);}catch(e){}}}
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

  /* ---- active-time tracking ---- */
  function startTimer(){
    setInterval(function(){
      if(document.visibilityState!=='hidden'){S.secs++; if(S.secs%5===0)saveSecs();}
    },1000);
    setInterval(function(){flush();},15000);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush();});
    window.addEventListener('pagehide',flush);
  }
  function flush(){saveSecs();if(S.sid){put(mbase()+'/secs',S.secs);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}}

  /* ---- identity UI (self-styled, theme-agnostic) ---- */
  function injectCSS(){
    if(document.getElementById('st-css'))return;
    var c=document.createElement('style');c.id='st-css';
    c.textContent=
    '#st-pill{position:fixed;right:14px;bottom:14px;z-index:300;background:rgba(10,26,58,0.92);border:1px solid rgba(240,179,61,0.55);'+
    'color:#f0b33d;font:600 12px/1.2 Calibri,Helvetica,Arial,sans-serif;border-radius:30px;padding:9px 14px;cursor:pointer;'+
    'box-shadow:0 8px 24px rgba(0,0,0,.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);max-width:240px;}'+
    '#st-pill.unset{animation:stpulse 2s infinite;color:#ffd24a;}'+
    '@keyframes stpulse{0%,100%{box-shadow:0 0 0 0 rgba(240,179,61,.5);}50%{box-shadow:0 0 0 7px rgba(240,179,61,0);}}'+
    '#st-modal{position:fixed;inset:0;z-index:301;background:rgba(5,12,30,.78);display:none;align-items:center;justify-content:center;padding:18px;}'+
    '#st-modal.on{display:flex;}'+
    '#st-box{background:#152a5e;border:1px solid rgba(240,179,61,.55);border-radius:16px;padding:26px 24px;max-width:360px;width:100%;text-align:center;color:#eef2fb;font-family:Calibri,Helvetica,Arial,sans-serif;}'+
    '#st-box h3{font-family:Georgia,serif;font-size:20px;margin-bottom:8px;color:#fff;}'+
    '#st-box p{font-size:13px;color:#b0bcd6;margin-bottom:14px;line-height:1.5;}'+
    '#st-box input{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(240,179,61,.4);border-radius:8px;color:#fff;font:15px Calibri,Arial,sans-serif;padding:11px 13px;margin-bottom:12px;}'+
    '#st-box input:focus{outline:none;border-color:#f0b33d;}'+
    '#st-box button{background:#f0b33d;color:#0a1a3a;border:none;border-radius:30px;padding:11px 22px;font:bold 13px Calibri,Arial,sans-serif;cursor:pointer;}'+
    '#st-box .skip{display:block;margin-top:12px;color:#8593b5;font-size:12px;cursor:pointer;background:none;border:none;}';
    document.head.appendChild(c);
  }
  function renderPill(){
    var p=document.getElementById('st-pill');
    if(!p){p=document.createElement('div');p.id='st-pill';document.body.appendChild(p);p.addEventListener('click',openModal);}
    if(S.name){p.className='';p.textContent='👤 '+S.name+' · synced';}
    else{p.className='unset';p.textContent='① Enter your name to save progress';}
  }
  function openModal(){
    injectCSS();
    var m=document.getElementById('st-modal');
    if(!m){
      m=document.createElement('div');m.id='st-modal';
      m.innerHTML='<div id="st-box"><h3>Save your progress</h3><p>Enter your name so your tutor can see your progress (who, when, time spent, what you completed). It saves on this device and syncs automatically.</p><input id="st-name" placeholder="First and last name" autocomplete="name"><br><button id="st-save">Save &amp; continue</button><button class="skip" id="st-skip">continue without saving</button></div>';
      document.body.appendChild(m);
      m.addEventListener('click',function(e){if(e.target===m)m.classList.remove('on');});
      document.getElementById('st-save').addEventListener('click',saveName);
      document.getElementById('st-skip').addEventListener('click',function(){m.classList.remove('on');});
      document.getElementById('st-name').addEventListener('keydown',function(e){if(e.key==='Enter')saveName();});
    }
    var inp=document.getElementById('st-name');inp.value=S.name||'';m.classList.add('on');setTimeout(function(){inp.focus();},50);
  }
  function saveName(){
    var v=(document.getElementById('st-name').value||'').trim();
    if(!v){document.getElementById('st-name').focus();return;}
    S.name=v;S.sid=san(v);
    try{localStorage.setItem('stats_name',v);localStorage.setItem('stats_sid',S.sid);}catch(e){}
    setCookie('stats_name',v);setCookie('stats_sid',S.sid);   // remembered for a year across visits
    document.getElementById('st-modal').classList.remove('on');
    renderPill();pushAll();
  }

  /* ---- public API ---- */
  window.StatsTrack={
    init:function(o){
      S.mod=o.module;S.title=o.title||o.module;S.total=o.total||0;
      loadLocal();injectCSS();renderPill();
      if(S.sid)identify();
      startTimer();
      if(!S.name){ /* gentle nudge after a moment */ setTimeout(function(){ if(!S.name)openModal(); },1500); }
    },
    complete:function(id){
      if(!id||S.done[id])return;S.done[id]=true;saveDone();
      if(S.sid){put(mbase()+'/done/'+id,true);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}
    },
    setScore:function(done,total){
      if(S.sid){put(mbase()+'/score',done+'/'+total);put(mbase()+'/updatedAt',now());put(base()+'/updatedAt',now());}
      try{localStorage.setItem(lk('score'),done+'/'+total);}catch(e){}
    },
    askName:openModal,
    name:function(){return S.name;}
  };
})();
