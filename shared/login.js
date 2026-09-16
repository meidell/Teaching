/* =====================================================================
   SHARED · student identity that follows you between devices.

   The old model was a name box: progress lived in one browser's
   localStorage, so a student who did Week 1 on a laptop and Week 2 on a
   phone looked like two half-finished students. This gives each student
   a name + a six-digit course code, so any device can pick up where the
   last one left off.

     <body data-course="omba401">
     <script src="/shared/config.js"   defer></script>
     <script src="/shared/login.js"    defer></script>
     <script src="/shared/progress.js" defer></script>

   Storage — deliberately the same shape E1410's join.html already used,
   so that course's existing roster keeps working untouched:

     localStorage <key>_auth   {sid, name, pass}   (+ a 1-year cookie)
     <ns>/_roster/<sid>        {name, pass, ts}
     <ns>/<sid>/…              the student's progress

   On sign-in it PULLS remote progress and merges it into localStorage
   (union of completed sections, max of time spent), then hands identity
   to StatsTrack, which pushes the merged result back. Nothing is lost in
   either direction, and it does not matter which device is "ahead".

   Opt out of the automatic prompt on a page with:
     <script>window.COURSE_LOGIN_AUTO=false;</script>

   SUBGROUPS. A course whose config.js entry carries `groups` is one
   cohort taught twice a week in two rooms. A student registering for the
   first time must pick their group; it is written to

     <ns>/<sid>/grp        authoritative — the instructor can change it
     <ns>/_roster/<sid>.grp  a copy, taken at registration

   and cached in the auth blob. The node is authoritative because the
   roster is create-once in the database rules: nobody, instructor
   included, can rewrite _roster/<sid>, so a student who picks the wrong
   group could never be moved. `mergeDown` re-reads `grp` on every load,
   so a move made in the dashboard reaches the student silently.

   A missing `grp` is the FIRST group in the list, not "unknown" — that is
   what makes the whole cohort that registered before the split land in
   group 1 with no migration.
   ===================================================================== */
window.CourseLogin = (function () {
  "use strict";

  var CFG = window.CourseConfig;
  if (!CFG) { console.warn("login.js: /shared/config.js must load first"); return null; }
  var C = CFG.current();
  if (!C) return null;

  var DB = CFG.DB, NS = C.ns, K = C.key, T = C.theme;

  var STR = {
    en: {
      pill:"Sign in to save your progress",
      synced:" · synced",
      h:"Your course account",
      lead:"Sign in so your progress follows you between your laptop and your phone, and so your professor can see it.",
      tabNew:"First time", tabBack:"I have a code",
      nameL:"Full name", nameP:"First and last name",
      codeL:"Your six-digit code", codeP:"••••••",
      go:"Continue", back:"Sign in",
      later:"not now",
      madeH:"You're all set",
      madeP:"This is your course code. Write it down — you only need it to sign in on another device.",
      dupe:"That name is already registered. If it's you, use “I have a code”. A different student with the same name? Add your middle name.",
      nofind:"No account under that name. Check the spelling — use exactly the name you registered with — or start under “First time”.",
      bad:"That code doesn't match. Lost it? Your instructor can look it up.",
      needName:"Please enter your first and last name.",
      grpL:"Which group are you in?",
      grpN:"Group",
      grpHelp:"Pick the session you actually attend — your presence is recorded in that room. Tell your instructor if you need to change it later.",
      needGrp:"Please choose your group.",
      needBoth:"Enter your name and your six-digit code.",
      net:"Network problem — try again in a moment.",
      merged:"Signed in. Bringing your progress across…"
    },
    fr: {
      pill:"Connectez-vous pour enregistrer votre progression",
      synced:" · synchronisé",
      h:"Votre compte de cours",
      lead:"Connectez-vous pour que votre progression vous suive entre votre ordinateur et votre téléphone, et que votre professeur puisse la voir.",
      tabNew:"Première fois", tabBack:"J'ai un code",
      nameL:"Nom complet", nameP:"Prénom et nom",
      codeL:"Votre code à six chiffres", codeP:"••••••",
      go:"Continuer", back:"Se connecter",
      later:"plus tard",
      madeH:"C'est fait",
      madeP:"Voici votre code de cours. Notez-le — il ne sert qu'à vous connecter sur un autre appareil.",
      dupe:"Ce nom est déjà enregistré. Si c'est vous, utilisez « J'ai un code ». Un autre étudiant du même nom ? Ajoutez votre deuxième prénom.",
      nofind:"Aucun compte à ce nom. Vérifiez l'orthographe — utilisez exactement le nom d'inscription — ou passez par « Première fois ».",
      bad:"Ce code ne correspond pas. Perdu ? Votre professeur peut le retrouver.",
      needName:"Veuillez entrer votre prénom et votre nom.",
      grpL:"Dans quel groupe êtes-vous ?",
      grpN:"Groupe",
      grpHelp:"Choisissez la séance à laquelle vous assistez — votre présence est enregistrée dans cette salle. Prévenez votre enseignant si elle doit changer.",
      needGrp:"Veuillez choisir votre groupe.",
      needBoth:"Entrez votre nom et votre code à six chiffres.",
      net:"Problème de réseau — réessayez dans un instant.",
      merged:"Connecté. Récupération de votre progression…"
    }
  };
  function L(){ var l=document.documentElement.getAttribute('data-lang');
                return STR[(l==='fr'||l==='en')?l:(C.lang==='fr'?'fr':'en')]; }

  /* ---- subgroups ------------------------------------------------------
     GROUPS is [] for every course that has none, and every branch below
     short-circuits on that, so this file behaves exactly as it did for
     omba401, e1410 and the rest. */
  var GROUPS = (C.groups && C.groups.length) ? C.groups : [];
  function hasGroups(){ return GROUPS.length > 1; }
  function defGroup(){ return GROUPS.length ? GROUPS[0].id : ''; }
  function groupOf(id){
    for(var i=0;i<GROUPS.length;i++) if(GROUPS[i].id===id) return GROUPS[i];
    return GROUPS.length?GROUPS[0]:null;                 /* unknown = the default */
  }
  function groupLabel(id){ var g=groupOf(id); return g?(g.label||g.id):''; }

  function san(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function setCookie(k,v){try{document.cookie=k+'='+encodeURIComponent(v)+';path=/;max-age=31536000;samesite=lax';}catch(e){}}
  function getCookie(k){try{var m=document.cookie.match('(?:^|; )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}

  function get(path){return fetch(DB+'/'+NS+'/'+path+'.json').then(function(r){return r.json();});}
  function put(path,val){return fetch(DB+'/'+NS+'/'+path+'.json',{method:'PUT',body:JSON.stringify(val)});}

  function auth(){
    var a=null;
    try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}
    if(!a){var c=getCookie(K+'_auth'); if(c){try{a=JSON.parse(c);}catch(e){}}}
    return (a&&a.sid)?a:null;
  }
  function saveAuth(a){
    if(hasGroups()&&!a.grp)a.grp=defGroup();
    var j=JSON.stringify(a);
    try{localStorage.setItem(K+'_auth',j);localStorage.setItem(K+'_name',a.name);localStorage.setItem(K+'_sid',a.sid);}catch(e){}
    setCookie(K+'_auth',j);setCookie(K+'_name',a.name);setCookie(K+'_sid',a.sid);
  }
  /* The group recorded on the server wins over the one cached here, so an
     instructor moving a student between rooms takes effect on their next
     load without them doing anything. */
  function setGroup(g){
    var a=auth(); if(!a||!g||a.grp===g)return;
    a.grp=g; saveAuth(a);
    try{ document.dispatchEvent(new CustomEvent('course-group',{detail:{grp:g}})); }catch(e){}
  }
  function logout(){
    try{localStorage.removeItem(K+'_auth');}catch(e){}
    setCookie(K+'_auth','');
    location.reload();
  }

  /* ---- pull the other devices' work down and merge it in ----
     Union for completed sections, max for time spent, remote fills gaps for
     scores and workbook text. Local is never overwritten by an older remote
     value, so whichever device is ahead wins per field. Returns whether
     anything actually changed. */
  function mergeDown(sid){
    return get(sid).then(function(node){
      if(!node)return false;
      var changed=false;
      if(hasGroups()&&node.grp)setGroup(node.grp);
      var mods=node.mod||{};
      Object.keys(mods).forEach(function(mod){
        var m=mods[mod]||{};
        var kd=K+'_done_'+mod, local={};
        try{local=JSON.parse(localStorage.getItem(kd)||'{}')||{};}catch(e){}
        var touched=false;
        Object.keys(m.done||{}).forEach(function(id){
          if(m.done[id]&&!local[id]){local[id]=true;touched=true;}
        });
        if(touched){try{localStorage.setItem(kd,JSON.stringify(local));}catch(e){}changed=true;}

        var ks=K+'_secs_'+mod;
        var ls=parseInt(localStorage.getItem(ks)||'0',10)||0;
        if((m.secs||0)>ls){try{localStorage.setItem(ks,String(m.secs));}catch(e){}changed=true;}

        var kc=K+'_score_'+mod;
        if(m.score&&!localStorage.getItem(kc)){try{localStorage.setItem(kc,m.score);}catch(e){}changed=true;}

        var km=K+'_meta_'+mod;
        if(!localStorage.getItem(km)&&(m.title||m.total)){
          try{localStorage.setItem(km,JSON.stringify({title:m.title,total:m.total}));}catch(e){}
        }
      });
      var work=node.work||{};
      Object.keys(work).forEach(function(id){
        var kw=K+'_work_'+id, it=work[id]||{};
        if(it.v!=null&&localStorage.getItem(kw)==null){
          try{localStorage.setItem(kw,it.v);}catch(e){}changed=true;
        }
      });
      return changed;
    }).catch(function(){return false;});
  }

  /* Hand identity to the progress engine, which pushes the merged local
     state back up. Reload once if the merge actually brought work across,
     so the page redraws with it. */
  function adopt(a,wasMerged){
    if(window.StatsTrack&&window.StatsTrack.setIdentity)window.StatsTrack.setIdentity(a.name,a.sid);
    renderPill();
    if(wasMerged){
      var flag=K+'_merged_once';
      var already=false; try{already=sessionStorage.getItem(flag)==='1';}catch(e){}
      if(!already){ try{sessionStorage.setItem(flag,'1');}catch(e){} location.reload(); }
    }
  }

  /* ---- UI ---- */
  function css(){
    if(document.getElementById('cl-css'))return;
    var s=document.createElement('style'); s.id='cl-css';
    s.textContent=
    '#cl-pill{position:fixed;right:14px;bottom:14px;z-index:300;background:var(--card,rgba(255,255,255,.95));border:1.5px solid '+T.main+';'+
    'color:var(--ink,'+T.deep+');font:700 12px/1.2 "Helvetica Neue",Helvetica,Arial,sans-serif;border-radius:30px;padding:9px 14px;'+
    'cursor:pointer;box-shadow:0 10px 26px -12px rgba(0,0,0,.4);max-width:250px;}'+
    '#cl-pill.unset{animation:clp 2s infinite;}'+
    '@keyframes clp{0%,100%{box-shadow:0 0 0 0 '+T.main+'73;}50%{box-shadow:0 0 0 7px '+T.main+'00;}}'+
    '#cl-modal{position:fixed;inset:0;z-index:401;background:rgba(20,25,20,.6);display:none;align-items:center;justify-content:center;padding:18px;}'+
    '#cl-modal.on{display:flex;}'+
    '#cl-box{background:var(--card,#fff);border-radius:20px;padding:26px 24px;max-width:380px;width:100%;text-align:center;'+
    'color:var(--ink,'+T.ink+');font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;box-shadow:0 18px 50px -20px rgba(0,0,0,.5);}'+
    '#cl-box h3{font-family:Georgia,serif;font-size:20px;margin:0 0 8px;color:var(--navy,'+T.deep+');}'+
    '#cl-box .lead{font-size:13px;color:var(--grey,'+T.grey+');margin-bottom:16px;line-height:1.5;}'+
    '.cl-tabs{display:flex;gap:6px;margin-bottom:14px;}'+
    '.cl-tab{flex:1;background:var(--wash,'+T.surface+');border:1px solid '+T.main+'33;color:'+T.grey+';border-radius:30px;'+
    'padding:8px;font:700 12px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}'+
    '.cl-tab.on{background:'+T.main+';color:#fff;border-color:'+T.main+';}'+
    '#cl-box label{display:block;text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;'+
    'font-weight:700;color:'+T.grey+';margin:0 0 4px;}'+
    '#cl-box input{width:100%;background:var(--wash,'+T.surface+');border:1px solid '+T.main+'40;border-radius:10px;'+
    'color:var(--ink,'+T.ink+');font:15px "Helvetica Neue",Arial,sans-serif;padding:11px 13px;margin-bottom:12px;}'+
    '#cl-box input:focus{outline:none;border-color:'+T.main+';}'+
    '#cl-code{text-align:center;letter-spacing:10px;font-size:20px;}'+
    '.cl-grps{display:flex;gap:8px;margin:0 0 6px;}'+
    '.cl-grp{flex:1;background:var(--wash,'+T.surface+');border:1.5px solid '+T.main+'33;border-radius:12px;padding:11px 8px;'+
    'cursor:pointer;text-align:center;color:var(--ink,'+T.ink+');font:700 14px "Helvetica Neue",Arial,sans-serif;}'+
    '.cl-grp .n{display:block;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:'+T.grey+';font-weight:800;margin-bottom:2px;}'+
    '.cl-grp.on{background:'+T.main+';border-color:'+T.main+';color:#fff;}'+
    '.cl-grp.on .n{color:#fff;opacity:.85;}'+
    '.cl-ghelp{font-size:11.5px;color:'+T.grey+';line-height:1.45;text-align:left;margin:0 0 12px;}'+
    '#cl-go{width:100%;background:'+T.main+';color:#fff;border:none;border-radius:30px;padding:12px;'+
    'font:bold 13px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}'+
    '#cl-later{display:block;margin:12px auto 0;color:'+T.grey+';font-size:12px;cursor:pointer;background:none;border:none;}'+
    '#cl-err{color:#B3402A;font-size:12.5px;margin-top:10px;min-height:16px;line-height:1.45;}'+
    '.cl-pass{background:'+T.deep+';border-radius:16px;color:#fff;padding:22px 18px;margin-top:6px;}'+
    '.cl-pass .t{font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:800;opacity:.85;}'+
    '.cl-pass .v{font-size:38px;font-weight:800;letter-spacing:9px;margin:8px 0 6px;padding-left:9px;}'+
    '.cl-pass p{font-size:12.5px;opacity:.92;margin:0;}';
    document.head.appendChild(s);
  }

  function renderPill(){
    if(document.getElementById('topWho'))return;   /* page has its own chip */
    css();
    var a=auth(), t=L();
    var p=document.getElementById('cl-pill');
    if(!p){p=document.createElement('div');p.id='cl-pill';document.body.appendChild(p);p.addEventListener('click',open);}
    if(a){p.className='';
          p.textContent='👤 '+a.name+(hasGroups()?' · '+groupLabel(a.grp):'')+t.synced;}
    else{p.className='unset';p.textContent=t.pill;}
  }

  var mode='new';
  function open(){
    css();
    var t=L();
    var m=document.getElementById('cl-modal');
    if(!m){
      m=document.createElement('div');m.id='cl-modal';
      m.innerHTML='<div id="cl-box">'+
        '<h3 id="cl-h"></h3><div class="lead" id="cl-lead"></div>'+
        '<div class="cl-tabs"><button class="cl-tab on" id="cl-tnew"></button><button class="cl-tab" id="cl-tback"></button></div>'+
        '<div id="cl-form">'+
          '<label for="cl-name" id="cl-nameL"></label><input id="cl-name" autocomplete="name">'+
          '<div id="cl-grpwrap"><label id="cl-grpL"></label><div class="cl-grps" id="cl-grps"></div>'+
            '<div class="cl-ghelp" id="cl-ghelp"></div></div>'+
          '<div id="cl-codewrap"><label for="cl-code" id="cl-codeL"></label><input id="cl-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6"></div>'+
          '<button id="cl-go"></button><div id="cl-err"></div>'+
          '<button id="cl-later"></button>'+
        '</div>'+
        '<div id="cl-done" style="display:none"></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click',function(e){if(e.target===m)m.classList.remove('on');});
      document.getElementById('cl-tnew').addEventListener('click',function(){setMode('new');});
      document.getElementById('cl-tback').addEventListener('click',function(){setMode('back');});
      document.getElementById('cl-go').addEventListener('click',submit);
      document.getElementById('cl-later').addEventListener('click',function(){m.classList.remove('on');});
      document.getElementById('cl-name').addEventListener('keydown',function(e){if(e.key==='Enter')submit();});
      document.getElementById('cl-code').addEventListener('keydown',function(e){if(e.key==='Enter')submit();});
    }
    document.getElementById('cl-h').textContent=t.h;
    document.getElementById('cl-lead').textContent=t.lead;
    document.getElementById('cl-tnew').textContent=t.tabNew;
    document.getElementById('cl-tback').textContent=t.tabBack;
    document.getElementById('cl-nameL').textContent=t.nameL;
    document.getElementById('cl-codeL').textContent=t.codeL;
    document.getElementById('cl-name').placeholder=t.nameP;
    document.getElementById('cl-code').placeholder=t.codeP;
    document.getElementById('cl-later').textContent=t.later;
    if(hasGroups()){
      document.getElementById('cl-grpL').textContent=t.grpL;
      document.getElementById('cl-ghelp').textContent=t.grpHelp;
      var box=document.getElementById('cl-grps');
      if(!box.childNodes.length){
        box.innerHTML=GROUPS.map(function(g){
          return '<button type="button" class="cl-grp" data-grp="'+esc(g.id)+'">'+
                 '<span class="n">'+esc(g.n?(t.grpN+' '+g.n):'')+'</span>'+esc(g.label||g.id)+'</button>';
        }).join('');
        Array.prototype.forEach.call(box.querySelectorAll('[data-grp]'),function(b){
          b.addEventListener('click',function(){ pickGroup(b.getAttribute('data-grp')); });
        });
      }
      paintGroup();
    }
    setMode(mode);
    m.classList.add('on');
    setTimeout(function(){document.getElementById('cl-name').focus();},50);
  }

  function setMode(x){
    mode=x; var t=L();
    document.getElementById('cl-tnew').classList.toggle('on',x==='new');
    document.getElementById('cl-tback').classList.toggle('on',x==='back');
    document.getElementById('cl-codewrap').style.display=(x==='back')?'block':'none';
    /* Only a NEW student chooses. Coming back with a code, the group is
       whatever the register says — asking again would let a student move
       themselves out of the room they are marked absent in. */
    document.getElementById('cl-grpwrap').style.display=(hasGroups()&&x==='new')?'block':'none';
    document.getElementById('cl-go').textContent=(x==='back')?t.back:t.go;
    document.getElementById('cl-err').textContent='';
  }
  function err(m){document.getElementById('cl-err').textContent=m;}

  /* Nothing is pre-selected: a default here would quietly put half the
     Wednesday room in the Monday register. */
  var pickedGrp=null;
  function pickGroup(g){ pickedGrp=g; paintGroup(); err(''); }
  function paintGroup(){
    var box=document.getElementById('cl-grps'); if(!box)return;
    Array.prototype.forEach.call(box.querySelectorAll('[data-grp]'),function(b){
      b.classList.toggle('on',b.getAttribute('data-grp')===pickedGrp);
    });
  }

  function submit(){
    var t=L();
    var name=(document.getElementById('cl-name').value||'').trim();
    var sid=san(name);
    if(mode==='back'){
      var code=(document.getElementById('cl-code').value||'').trim();
      if(!name||!code){err(t.needBoth);return;}
      err('…');
      get('_roster/'+sid).then(function(rec){
        if(!rec||!rec.pass){err(t.nofind);return;}
        if(String(rec.pass)!==code){err(t.bad);return;}
        var a={sid:sid,name:rec.name||name,pass:code};
        if(hasGroups())a.grp=rec.grp||defGroup();   /* mergeDown may correct it from the node */
        saveAuth(a);
        err(t.merged);
        mergeDown(sid).then(function(ch){
          document.getElementById('cl-modal').classList.remove('on');
          adopt(a,ch);
        });
      }).catch(function(){err(t.net);});
      return;
    }
    if(!name||name.indexOf(' ')<0||sid.length<3){err(t.needName);return;}
    if(hasGroups()&&!pickedGrp){err(t.needGrp);return;}
    err('…');
    get('_roster/'+sid).then(function(existing){
      if(existing&&existing.pass){ setMode('back'); err(t.dupe); return; }
      var pass=String(Math.floor(100000+Math.random()*900000)), ts=Date.now();
      var grp=hasGroups()?pickedGrp:null;
      var rec={name:name,pass:pass,ts:ts};
      if(grp)rec.grp=grp;
      var writes=[
        put('_roster/'+sid,rec),
        put(sid+'/name',name), put(sid+'/sid',sid),
        put(sid+'/createdAt',ts), put(sid+'/updatedAt',ts)
      ];
      /* The node, not the roster, is where the group is read from: the
         roster is create-once in the rules, so this copy can never be
         corrected, and the node can. */
      if(grp)writes.push(put(sid+'/grp',grp));
      return Promise.all(writes).then(function(){
        var a={sid:sid,name:name,pass:pass};
        if(grp)a.grp=grp;
        saveAuth(a);
        showCode(a);
        if(window.StatsTrack&&window.StatsTrack.setIdentity)window.StatsTrack.setIdentity(name,sid);
        renderPill();
      });
    }).catch(function(){err(t.net);});
  }

  function showCode(a){
    var t=L();
    document.getElementById('cl-form').style.display='none';
    var d=document.getElementById('cl-done');
    d.style.display='block';
    d.innerHTML='<div class="cl-pass"><div class="t">'+esc(t.madeH)+'</div><div class="v">'+esc(a.pass)+'</div>'+
                '<p>'+esc(t.madeP)+'</p>'+
                (hasGroups()&&a.grp?'<p style="margin-top:9px;opacity:.9">'+esc(t.grpL)+' <b>'+esc(groupLabel(a.grp))+'</b></p>':'')+
                '</div>'+
                '<button id="cl-close" style="margin-top:14px;width:100%;background:'+T.main+';color:#fff;border:none;'+
                'border-radius:30px;padding:12px;font:bold 13px \'Helvetica Neue\',Arial,sans-serif;cursor:pointer">OK</button>';
    document.getElementById('cl-close').addEventListener('click',function(){
      document.getElementById('cl-modal').classList.remove('on');
    });
  }

  /* ---- boot ---- */
  function boot(){
    var a=auth();
    if(a){
      renderPill();
      mergeDown(a.sid).then(function(ch){ adopt(a,ch); });
    }else{
      renderPill();
      if(window.COURSE_LOGIN_AUTO!==false&&window.COURSE_ACCESS!==false&&window.E1410_ACCESS!==false){
        setTimeout(function(){ if(!auth())open(); },1500);
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  return { open:open, logout:logout, current:auth, sync:mergeDown,
           groups:function(){return GROUPS.slice();},
           group:function(){var a=auth();return hasGroups()?((a&&a.grp)||defGroup()):'';},
           groupLabel:groupLabel };
})();
