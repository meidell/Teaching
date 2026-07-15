/* =====================================================================
   UMEF407 · Gestion de projet — student progress + monitoring.
   Named-student sync to the teaching-70f1c Realtime DB, under
   umef407/<sid>/...  Logs who, when (first seen + last active),
   time spent, per-section completion and scores. Read by
   umef407/admin.html (PIN-gated). Best-effort, fails silently.
   Bilingual identity UI (reads <html data-lang>).

   Usage on any module page:
     <script src="progress.js" defer></script>
     StatsTrack.init({module:'m1', title:'Module 1 · …', total:5});
     StatsTrack.complete('s3');
     StatsTrack.setScore(6, 8);
   ===================================================================== */
(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="umef407";
  var S={mod:null,title:'',total:0,name:'',sid:'',secs:0,done:{},started:false};

  function lang(){var l=document.documentElement.getAttribute('data-lang');return l==='fr'?'fr':'en';}
  function T(en,fr){return lang()==='fr'?fr:en;}

  function san(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
  function put(path,val){try{fetch(DB+'/'+path+'.json',{method:'PUT',keepalive:true,body:JSON.stringify(val)});}catch(e){}}
  function now(){return Date.now();}
  function base(){return NS+'/'+S.sid;}
  function mbase(){return base()+'/mod/'+S.mod;}
  function lk(k){return 'umef407_'+k+'_'+S.mod;}

  function setCookie(k,v){try{document.cookie=k+'='+encodeURIComponent(v)+';path=/;max-age=31536000;samesite=lax';}catch(e){}}
  function getCookie(k){try{var m=document.cookie.match('(?:^|; )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}

  function loadLocal(){
    try{
      S.name=localStorage.getItem('umef407_name')||'';
      S.sid =localStorage.getItem('umef407_sid')||'';
      if(!S.name){var cn=getCookie('umef407_name'),cs=getCookie('umef407_sid');
        if(cn){S.name=cn;S.sid=cs||san(cn);try{localStorage.setItem('umef407_name',S.name);localStorage.setItem('umef407_sid',S.sid);}catch(e){}}}
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

  /* ---- identity UI (UMEF teal/crimson) ---- */
  function injectCSS(){
    if(document.getElementById('st-css'))return;
    var c=document.createElement('style');c.id='st-css';
    c.textContent=
    '#st-pill{position:fixed;right:14px;bottom:14px;z-index:300;background:rgba(255,255,255,0.96);border:1.5px solid #176B87;'+
    'color:#0f4c60;font:700 12px/1.2 "Helvetica Neue",Helvetica,Arial,sans-serif;border-radius:30px;padding:9px 14px;cursor:pointer;'+
    'box-shadow:0 10px 26px -12px rgba(23,107,135,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);max-width:240px;}'+
    '#st-pill.unset{animation:stpulse 2s infinite;border-color:#9B2335;color:#9B2335;}'+
    '@keyframes stpulse{0%,100%{box-shadow:0 0 0 0 rgba(155,35,53,.4);}50%{box-shadow:0 0 0 7px rgba(155,35,53,0);}}'+
    '#st-modal{position:fixed;inset:0;z-index:301;background:rgba(20,26,32,.55);display:none;align-items:center;justify-content:center;padding:18px;}'+
    '#st-modal.on{display:flex;}'+
    '#st-box{background:#fff;border:1px solid rgba(23,107,135,.25);border-radius:16px;padding:26px 24px;max-width:360px;width:100%;text-align:center;color:#232A31;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;box-shadow:0 18px 50px -20px rgba(23,107,135,0.5);}'+
    '#st-box h3{font-family:Georgia,serif;font-size:20px;margin-bottom:8px;color:#176B87;}'+
    '#st-box p{font-size:13px;color:#4a5560;margin-bottom:14px;line-height:1.5;}'+
    '#st-box input{width:100%;background:#F4F6F8;border:1px solid rgba(23,107,135,.3);border-radius:10px;color:#232A31;font:15px "Helvetica Neue",Arial,sans-serif;padding:11px 13px;margin-bottom:12px;}'+
    '#st-box input:focus{outline:none;border-color:#176B87;}'+
    '#st-box button{background:#176B87;color:#fff;border:none;border-radius:30px;padding:11px 22px;font:bold 13px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}'+
    '#st-box .skip{display:block;margin:12px auto 0;color:#6B7280;font-size:12px;cursor:pointer;background:none;border:none;}';
    document.head.appendChild(c);
  }
  function renderPill(){
    var p=document.getElementById('st-pill');
    if(!p){p=document.createElement('div');p.id='st-pill';document.body.appendChild(p);p.addEventListener('click',openModal);}
    if(S.name){p.className='';p.textContent='👤 '+S.name+' · '+T('synced','synchronisé');}
    else{p.className='unset';p.textContent=T('① Enter your name to save progress','① Entrez votre nom pour enregistrer');}
  }
  function openModal(){
    injectCSS();
    var m=document.getElementById('st-modal');
    if(!m){
      m=document.createElement('div');m.id='st-modal';
      m.innerHTML='<div id="st-box"><h3>'+T('Save your progress','Enregistrer votre progression')+'</h3><p>'+
        T('Enter your name so your professor can see your progress (who, when, time spent, what you completed). It saves on this device and syncs automatically.',
          'Entrez votre nom pour que votre professeur puisse suivre votre progression (qui, quand, temps passé, ce que vous avez terminé). Sauvegardé sur cet appareil, synchronisé automatiquement.')+
        '</p><input id="st-name" placeholder="'+T('First and last name','Prénom et nom')+'" autocomplete="name"><br><button id="st-save">'+
        T('Save &amp; continue','Enregistrer et continuer')+'</button><button class="skip" id="st-skip">'+
        T('continue without saving','continuer sans enregistrer')+'</button></div>';
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
    try{localStorage.setItem('umef407_name',v);localStorage.setItem('umef407_sid',S.sid);}catch(e){}
    setCookie('umef407_name',v);setCookie('umef407_sid',S.sid);
    document.getElementById('st-modal').classList.remove('on');
    renderPill();pushAll();
  }

  window.StatsTrack={
    init:function(o){
      S.mod=o.module;S.title=o.title||o.module;S.total=o.total||0;
      loadLocal();injectCSS();renderPill();
      if(S.sid)identify();
      startTimer();
      if(!S.name){ setTimeout(function(){ if(!S.name)openModal(); },1500); }
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
