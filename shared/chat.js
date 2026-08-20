/* =====================================================================
   SHARED · course chat (student side).

   A message panel on a course page: the student talks to the instructor
   privately, and — if the instructor has opened them — to the whole
   cohort or to a group they were put in. The instructor's end is
   /shared/chat.html.

     <body data-course="e1410">
     <script src="/shared/config.js" defer></script>
     <script src="/shared/chat.js"   defer></script>

   Opting a course in is exactly that: the two script tags. Everything
   else — namespace, storage prefix, colours, language — comes from
   /shared/config.js, so the same file serves every course.

   ---------------------------------------------------------------------
   Where the messages live
   ---------------------------------------------------------------------
     <ns>/_chat/<tid>/meta            { kind, title, ro, members, ts }
     <ns>/_chat/<tid>/msgs/<pushId>   { by:'i'|'s', sid, name, txt, ts }
     <ns>/<sid>/chats/<tid>           { t, k, ts }   ← the student's index

   Thread ids are readable on purpose, and the prefix says who is in it:

     all            the whole cohort
     dm-<sid>       the instructor and that one student
     g-<slug>       a group the instructor assembled
     p-<a>--<b>     two students (the two sids, sorted, so either can derive it)
     sg-<id>        a group the students made themselves

   A student cannot list the cohort, so messaging a classmate is impossible
   until the instructor publishes `_chat/_people` — a names-only directory,
   toggled from chat.html. Without it the panel offers the instructor and
   nothing else, which is the safe default.

   A student never needs the index to find their own two threads — `all`
   and `dm-<their sid>` are implicit. The index exists only so a student
   discovers the *groups* they were added to, because `_chat` itself is
   deliberately not listable (see below).

   ---------------------------------------------------------------------
   What the database rules do and do not guarantee
   ---------------------------------------------------------------------
   `_chat` is not readable as a node, only `_chat/<tid>` is — so nobody
   can download the cohort's conversations in one request; you have to
   know the thread id, which for a DM means knowing the student's name.
   That is the same boundary the workbook already sits behind, no worse.

   Two things the rules DO enforce, and they matter:
     · a message cannot be edited or deleted once written (create-once),
     · `by:'i'` — an instructor message — requires the instructor's
       signed-in token, so a student cannot forge one.

   What they cannot enforce: a student could post to a group thread they
   were never added to, or under another student's name. This is an
   unauthenticated course site; treat chat as a convenience, not as a
   confidential channel, and never send anything here you would not put
   on the page itself.
   ===================================================================== */
window.CourseChat = (function () {
  "use strict";

  var CFG = window.CourseConfig;
  if (!CFG) { console.warn("chat.js: /shared/config.js must load first"); return null; }
  var C = CFG.current();
  if (!C) return null;

  var DB = CFG.DB, NS = C.ns, K = C.key, T = C.theme;

  var STR = {
    en: {
      launch:"Messages", title:"Messages",
      dm:"Your instructor", all:"Everyone",
      ph:"Write a message…", send:"Send",
      newT:"New conversation", newBtn:"＋ New",
      pickProf:"Your instructor", pickProfSub:"Ask a question about the course",
      yourClass:"Your class",
      searchPh:"Find a classmate…",
      tickHint:"Tick one classmate to message them, or several to start a group.",
      msgOne:function(n){return "Message "+n;},
      mkGroup:function(n){return "Create a group · "+n+" people";},
      noMatch:"No classmate by that name.",
      noList:"No classmates are listed yet. Everyone appears here the first time they open their messages — or ask your instructor to add the whole class at once.",
      gNamePh:"Name the group — e.g. Case-study team B",
      gNeedName:"Give the group a name.",
      back:"Cancel",
      peerOnly:"Between the two of you — your instructor is not in this thread.",
      groupOnly:function(n){return "A group you and your classmates made"+(n?" · "+n+" people":"")+" — your instructor is not in it.";},
      empty:"No messages yet. Say hello — this thread is between you and your instructor, not the rest of the class.",
      emptyG:"No messages in this group yet.",
      emptyP:"No messages yet. Say hello.",
      ro:"Announcements only — you cannot reply here.",
      needName:"Sign in with your name first, so I know who is writing.",
      signin:"Sign in",
      failed:"Message not sent. Check your connection and try again.",
      you:"You", instr:"Instructor",
      today:"Today", yesterday:"Yesterday",
      close:"Close", members:function(n){return n+" people";},
      here:"in this chat", online:"online", seenAgo:function(a){return "last seen "+a;},
      tipSent:"Sent", tipDeliv:"Delivered", tipRead:"Read"
    },
    fr: {
      launch:"Messages", title:"Messages",
      dm:"Votre professeur", all:"Tout le monde",
      ph:"Écrivez un message…", send:"Envoyer",
      newT:"Nouvelle conversation", newBtn:"＋ Nouveau",
      pickProf:"Votre professeur", pickProfSub:"Poser une question sur le cours",
      yourClass:"Votre classe",
      searchPh:"Chercher un camarade…",
      tickHint:"Cochez un camarade pour lui écrire, ou plusieurs pour créer un groupe.",
      msgOne:function(n){return "Écrire à "+n;},
      mkGroup:function(n){return "Créer un groupe · "+n+" personnes";},
      noMatch:"Aucun camarade de ce nom.",
      noList:"Aucun camarade pour l'instant. Chacun apparaît ici dès qu'il ouvre sa messagerie — ou demandez à votre professeur d'ajouter toute la classe.",
      gNamePh:"Nom du groupe — ex. Équipe étude de cas B",
      gNeedName:"Donnez un nom au groupe.",
      back:"Annuler",
      peerOnly:"Entre vous deux — votre professeur n'est pas dans cette conversation.",
      groupOnly:function(n){return "Un groupe créé entre étudiants"+(n?" · "+n+" personnes":"")+" — votre professeur n'en fait pas partie.";},
      empty:"Aucun message. Dites bonjour — cette conversation est entre vous et votre professeur, pas le reste de la classe.",
      emptyG:"Aucun message dans ce groupe.",
      emptyP:"Aucun message. Dites bonjour.",
      ro:"Annonces uniquement — vous ne pouvez pas répondre ici.",
      needName:"Connectez-vous d'abord, pour que je sache qui écrit.",
      signin:"Se connecter",
      failed:"Message non envoyé. Vérifiez votre connexion et réessayez.",
      you:"Vous", instr:"Professeur",
      today:"Aujourd'hui", yesterday:"Hier",
      close:"Fermer", members:function(n){return n+" personnes";},
      here:"dans cette conversation", online:"en ligne", seenAgo:function(a){return "vu "+a;},
      tipSent:"Envoyé", tipDeliv:"Remis", tipRead:"Lu"
    }
  };
  function L(){ var l=document.documentElement.getAttribute('data-lang');
                return STR[(l==='fr'||l==='en')?l:(C.lang==='fr'?'fr':'en')]; }

  /* ---------------------------------------------------------------- */
  /* plumbing                                                          */
  /* ---------------------------------------------------------------- */
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function body(t){
    return esc(t).replace(/\n/g,'<br>')
                 .replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
  }
  function san(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);}
  function getCookie(k){try{var m=document.cookie.match('(?:^|; )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}

  function get(path){ return fetch(DB+'/'+NS+'/'+path+'.json').then(function(r){return r.json();}).catch(function(){return null;}); }
  function post(path,val){ return fetch(DB+'/'+NS+'/'+path+'.json',{method:'POST',body:JSON.stringify(val)}).then(function(r){if(!r.ok)throw new Error('refused');return r.json();}); }
  function put(path,val){ return fetch(DB+'/'+NS+'/'+path+'.json',{method:'PUT',body:JSON.stringify(val)}).catch(function(){}); }

  /* identity, resolved exactly the way progress.js resolves it, so the
     chat and the progress bar can never disagree about who is here */
  function who(){
    if(window.COURSE_AUTH&&window.COURSE_AUTH.sid)return window.COURSE_AUTH;
    if(window.E1410_AUTH&&window.E1410_AUTH.sid)return window.E1410_AUTH;
    var a=null;
    try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}
    if(!a){var c=getCookie(K+'_auth');if(c){try{a=JSON.parse(c);}catch(e){}}}
    if(a&&a.sid)return a;
    var n='',s='';
    try{n=localStorage.getItem(K+'_name')||'';s=localStorage.getItem(K+'_sid')||'';}catch(e){}
    if(!n){n=getCookie(K+'_name');s=getCookie(K+'_sid');}
    return n?{sid:s||san(n),name:n}:null;
  }

  function readKey(tid){return K+'_chat_read_'+tid;}
  function lastRead(tid){var v=0;try{v=parseInt(localStorage.getItem(readKey(tid))||'0',10)||0;}catch(e){}return v;}
  function markRead(tid,ts){try{localStorage.setItem(readKey(tid),String(ts||Date.now()));}catch(e){}}

  function dayLabel(ts){
    var t=L(), d=new Date(ts), n=new Date();
    var same=function(a,b){return a.toDateString()===b.toDateString();};
    if(same(d,n))return t.today;
    var y=new Date(n.getTime()-864e5);
    if(same(d,y))return t.yesterday;
    return d.toLocaleDateString(undefined,{day:'numeric',month:'short'});
  }
  function clock(ts){return new Date(ts).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});}

  /* ---------------------------------------------------------------- */
  /* state                                                             */
  /* ---------------------------------------------------------------- */
  var ME=null;                 /* {sid,name} */
  var THREADS=[];              /* [{tid,title,kind,ro,members}] */
  var CUR='';                  /* open thread id */
  var MSGS={};                 /* tid -> [msg] */
  var LAST={};                 /* tid -> ts of newest message seen */
  var OPEN=false, TIMER=null, SENDING=false;
  var PRES={}, RCPT={}, HEART=null;      /* other party's presence · their receipts */

  /* Who is on the other end. Only 1:1 threads have one, which is why ticks and
     the online dot appear there and nowhere else — "read by" on a group is a
     different feature and a misleading one if you fake it with a single tick. */
  function otherOf(tid){
    if(!ME)return null;
    if(tid.indexOf('dm-')===0)return 'i';                       /* the instructor */
    if(tid.indexOf('p-')===0){
      var two=tid.slice(2).split('--');
      return two[0]===ME.sid?two[1]:two[0];
    }
    return null;                                                /* group or cohort */
  }

  /* A heartbeat while the panel is open, and only while it is open — the point
     of the dot is "they are looking at this now", so it must go stale quickly.
     45s of silence reads as away. */
  var FRESH=45000;
  function beat2(){
    if(!ME||!OPEN)return;
    put('_chat/_presence/'+ME.sid,{t:Date.now(),at:CUR||''});
  }
  function startHeart(){ clearInterval(HEART); beat2(); HEART=setInterval(beat2,20000); }
  function stopHeart(){ clearInterval(HEART); HEART=null; }

  /* ---------------------------------------------------------------- */
  /* chrome                                                            */
  /* ---------------------------------------------------------------- */
  function css(){
    if(document.getElementById('jc-css'))return;
    var s=document.createElement('style'); s.id='jc-css';
    s.textContent=
    '#jc-btn{position:fixed;right:14px;bottom:14px;z-index:310;display:flex;align-items:center;gap:8px;'+
      'background:'+T.main+';color:#fff;border:none;border-radius:30px;padding:11px 17px;cursor:pointer;'+
      'font:800 13px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;box-shadow:0 12px 30px -12px rgba(0,0,0,.5);}'+
    '#jc-btn:hover{background:'+T.deep+';}'+
    '#jc-btn .jc-dot{background:'+T.glow+';color:'+T.deep+';border-radius:20px;min-width:18px;height:18px;'+
      'display:none;align-items:center;justify-content:center;font-size:11px;font-weight:800;padding:0 5px;}'+
    '#jc-btn.has .jc-dot{display:flex;}'+
    '#jc-panel{position:fixed;right:14px;bottom:14px;z-index:311;display:none;flex-direction:column;'+
      'width:min(372px,calc(100vw - 28px));height:min(560px,calc(100vh - 96px));background:#fff;border-radius:18px;'+
      'overflow:hidden;box-shadow:0 26px 70px -26px rgba(0,0,0,.55);border:1px solid '+T.main+'22;'+
      'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:'+T.ink+';}'+
    '#jc-panel.on{display:flex;}'+
    '#jc-head{background:'+T.deep+';color:#fff;padding:13px 14px;display:flex;align-items:center;gap:10px;flex:none;}'+
    '#jc-head b{font-size:14.5px;}'+
    '#jc-pres{flex:1;font-size:11px;opacity:.85;display:flex;align-items:center;gap:5px;min-width:0;}'+
    '#jc-pres i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.35);flex:none;font-style:normal;}'+
    '#jc-pres i.on{background:#4ade80;}'+
    '#jc-pres i.here{background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.3);}'+
    '#jc-pres span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'+
    '.jc-tick{font-size:11px;margin-left:5px;letter-spacing:-2px;opacity:.75;}'+
    '.jc-m.me .jc-t{display:flex;justify-content:flex-end;align-items:center;gap:0;}'+
    '.jc-tick.read{color:#7dd3fc;opacity:1;}'+
    '.jc-tab i.on{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;margin-right:5px;}'+
    '#jc-x{background:none;border:none;color:rgba(255,255,255,.8);font-size:22px;line-height:1;cursor:pointer;padding:0 2px;}'+
    '#jc-x:hover{color:#fff;}'+
    '#jc-tabs{display:none;gap:6px;padding:9px 12px;background:'+T.pale+';overflow-x:auto;flex:none;'+
      'border-bottom:1px solid '+T.main+'1f;}'+
    '#jc-tabs.on{display:flex;}'+
    '.jc-tab{position:relative;flex:none;background:#fff;border:1px solid '+T.main+'33;color:'+T.grey+';'+
      'border-radius:20px;padding:6px 12px;font:700 12px "Helvetica Neue",Arial,sans-serif;cursor:pointer;white-space:nowrap;}'+
    '.jc-tab.on{background:'+T.main+';border-color:'+T.main+';color:#fff;}'+
    '.jc-tab.unread::after{content:"";position:absolute;top:-2px;right:-2px;width:9px;height:9px;border-radius:50%;'+
      'background:'+T.glow+';border:1.5px solid #fff;}'+
    '#jc-plus{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);color:#fff;'+
      'font:800 11.5px "Helvetica Neue",Arial,sans-serif;border-radius:20px;padding:5px 11px;'+
      'cursor:pointer;flex:none;white-space:nowrap;}#jc-plus:hover{background:rgba(255,255,255,.3);}'+
    '#jc-body{position:relative;flex:1;display:flex;flex-direction:column;min-height:0;}'+
    '#jc-list{flex:1;overflow-y:auto;padding:14px 13px 6px;background:'+T.surface+';}'+
    '#jc-new{position:absolute;inset:0;background:#fff;z-index:5;display:none;flex-direction:column;overflow-y:auto;padding:14px 13px 16px;}'+
    '#jc-new.on{display:flex;}'+
    '#jc-new h4{font-size:13px;color:'+T.deep+';margin:0 0 10px;}'+
    '.jc-opt{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:'+T.surface+';'+
      'border:1px solid '+T.main+'26;border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer;font-family:inherit;}'+
    '.jc-opt:hover{border-color:'+T.main+';}'+
    '.jc-opt .ic{font-size:17px;flex:none;}'+
    '.jc-opt .tx{flex:1;display:flex;flex-direction:column;gap:1px;min-width:0;}'+
    '.jc-opt .t1{display:block;font-size:13.5px;font-weight:800;color:'+T.ink+';}'+
    '.jc-opt .t2{display:block;font-size:11.5px;color:'+T.grey+';line-height:1.35;}'+
    '#jc-search{width:100%;background:'+T.surface+';border:1px solid '+T.main+'33;border-radius:10px;'+
      'padding:8px 11px;font:13px "Helvetica Neue",Arial,sans-serif;margin-bottom:8px;color:'+T.ink+';}'+
    '#jc-search:focus{outline:none;border-color:'+T.main+';}'+
    '.jc-mate{display:flex;gap:10px;align-items:center;padding:9px 11px;border-radius:10px;cursor:pointer;'+
      'font-size:13.5px;color:'+T.ink+';border:1px solid transparent;}'+
    '.jc-mate:hover{background:'+T.pale+';}'+
    '.jc-mate.sel{background:'+T.pale+';border-color:'+T.main+'55;font-weight:700;}'+
    '.jc-mate input{margin:0;width:16px;height:16px;flex:none;accent-color:'+T.main+';}'+
    '.jc-mate .nm{flex:1;}'+
    '.jc-mate i.live{width:8px;height:8px;border-radius:50%;background:#22c55e;flex:none;}'+
    '.jc-sec{font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:'+T.grey+';'+
      'margin:14px 0 8px;}'+
    '#jc-mates{flex:1;min-height:40px;}'+
    '.jc-sticky{position:sticky;bottom:0;background:#fff;padding-top:10px;margin-top:6px;'+
      'box-shadow:0 -10px 14px -8px rgba(0,0,0,.12);}'+
    '.jc-sticky .tip{font-size:12px;color:'+T.grey+';line-height:1.45;margin-bottom:8px;}'+
    '#jc-gname{width:100%;background:'+T.surface+';border:1px solid '+T.main+'33;border-radius:10px;'+
      'padding:9px 11px;font:13.5px "Helvetica Neue",Arial,sans-serif;margin-bottom:10px;color:'+T.ink+';}'+
    '#jc-new .act{display:flex;gap:8px;margin-top:10px;}'+
    '#jc-new .act button{flex:1;border:none;border-radius:20px;padding:10px;cursor:pointer;'+
      'font:800 12.5px "Helvetica Neue",Arial,sans-serif;}'+
    '#jc-new .go{background:'+T.main+';color:#fff;}#jc-new .go:hover{background:'+T.deep+';}'+
    '#jc-new .no{background:'+T.surface+';color:'+T.grey+';border:1px solid '+T.main+'26!important;}'+
    '#jc-new .warn{font-size:12px;color:'+T.grey+';line-height:1.5;background:'+T.pale+';border-radius:10px;padding:9px 11px;margin-bottom:10px;}'+
    '#jc-new .err{color:#B3402A;font-size:12.5px;min-height:15px;margin-top:6px;}'+
    '#jc-hint{font-size:11px;color:'+T.grey+';padding:0 3px 5px;line-height:1.4;}'+
    '.jc-day{text-align:center;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;font-weight:800;'+
      'color:'+T.grey+';margin:8px 0 10px;}'+
    '.jc-m{margin-bottom:11px;max-width:86%;}'+
    '.jc-m .jc-w{font-size:10.5px;font-weight:800;color:'+T.grey+';margin:0 3px 3px;letter-spacing:.02em;}'+
    '.jc-m .jc-b{background:#fff;border:1px solid '+T.main+'1f;border-radius:14px 14px 14px 4px;padding:9px 12px;'+
      'font-size:13.5px;line-height:1.5;word-wrap:break-word;overflow-wrap:anywhere;}'+
    '.jc-m .jc-b a{color:'+T.main+';}'+
    '.jc-m .jc-t{font-size:10px;color:'+T.grey+';margin:3px 4px 0;}'+
    '.jc-m.me{margin-left:auto;}'+
    '.jc-m.me .jc-w,.jc-m.me .jc-t{text-align:right;}'+
    '.jc-m.me .jc-b{background:'+T.main+';border-color:'+T.main+';color:#fff;border-radius:14px 14px 4px 14px;}'+
    '.jc-m.me .jc-b a{color:#fff;text-decoration:underline;}'+
    '.jc-m.staff .jc-w{color:'+T.main+';}'+
    '.jc-m.staff .jc-b{background:'+T.pale+';border-color:'+T.main+'3d;}'+
    '#jc-empty{color:'+T.grey+';font-size:13px;line-height:1.55;text-align:center;padding:26px 18px;}'+
    '#jc-foot{flex:none;border-top:1px solid '+T.main+'1f;padding:10px 11px;background:#fff;}'+
    '#jc-row{display:flex;gap:8px;align-items:flex-end;}'+
    '#jc-in{flex:1;resize:none;max-height:110px;min-height:38px;background:'+T.surface+';border:1px solid '+T.main+'33;'+
      'border-radius:12px;padding:9px 11px;font:13.5px/1.45 "Helvetica Neue",Arial,sans-serif;color:'+T.ink+';}'+
    '#jc-in:focus{outline:none;border-color:'+T.main+';}'+
    '#jc-send{flex:none;background:'+T.main+';color:#fff;border:none;border-radius:12px;padding:0 14px;height:38px;'+
      'font:800 12.5px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}'+
    '#jc-send:hover{background:'+T.deep+';}'+
    '#jc-send:disabled{opacity:.5;cursor:default;}'+
    '#jc-note{font-size:11.5px;color:'+T.grey+';padding:4px 3px 0;line-height:1.45;min-height:2px;}'+
    '#jc-note.bad{color:#B3402A;}'+
    '@media(max-width:480px){#jc-panel{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0;}}';
    document.head.appendChild(s);
  }

  /* the sign-in pill from login.js owns the bottom-right corner; step
     over it rather than sitting on top of it */
  function place(){
    var b=document.getElementById('jc-btn'); if(!b)return;
    b.style.bottom=document.getElementById('cl-pill')?'62px':'14px';
  }

  function build(){
    css();
    var t=L();

    var b=document.createElement('button');
    b.id='jc-btn'; b.type='button';
    b.innerHTML='<span>💬</span><span>'+esc(t.launch)+'</span><span class="jc-dot"></span>';
    b.addEventListener('click',open);
    document.body.appendChild(b);

    var p=document.createElement('div');
    p.id='jc-panel';
    p.innerHTML=
      '<div id="jc-head"><b id="jc-title">'+esc(t.title)+'</b><span id="jc-pres"></span>'+
        '<button id="jc-plus" type="button" title="'+esc(t.newT)+'">'+esc(t.newBtn)+'</button>'+
        '<button id="jc-x" type="button" aria-label="'+esc(t.close)+'">×</button></div>'+
      '<div id="jc-tabs"></div>'+
      '<div id="jc-body"><div id="jc-list"></div><div id="jc-new"></div></div>'+
      '<div id="jc-foot"><div id="jc-hint"></div><div id="jc-row">'+
        '<textarea id="jc-in" rows="1" placeholder="'+esc(t.ph)+'"></textarea>'+
        '<button id="jc-send" type="button">'+esc(t.send)+'</button>'+
      '</div><div id="jc-note"></div></div>';
    document.body.appendChild(p);

    document.getElementById('jc-x').addEventListener('click',close);
    document.getElementById('jc-plus').addEventListener('click',function(){
      if(document.getElementById('jc-new').classList.contains('on'))closeNew();else openNew();
    });
    document.getElementById('jc-send').addEventListener('click',send);
    var ta=document.getElementById('jc-in');
    ta.addEventListener('input',function(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,110)+'px';});
    ta.addEventListener('keydown',function(e){
      if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
    });

    place(); setTimeout(place,1800);
  }

  /* ---------------------------------------------------------------- */
  /* threads                                                           */
  /* ---------------------------------------------------------------- */
  function label(tid,meta){
    var t=L();
    if(tid==='all')return (meta&&meta.title)||t.all;
    if(tid==='dm-'+(ME&&ME.sid))return t.dm;
    return (meta&&meta.title)||tid.replace(/^s?g-/,'');
  }
  /* both students derive the same id from the two sids, sorted — so neither
     has to be told what the thread is called */
  function peerId(a,b){ return 'p-'+[a,b].sort().join('--'); }
  function kindOf(tid){
    return tid==='all'?'all'
         : tid.indexOf('dm-')===0?'dm'
         : tid.indexOf('p-')===0?'peer'
         : tid.indexOf('sg-')===0?'group'
         : 'group';
  }

  /* The student's own two threads are implicit; groups come from the
     index the instructor writes into the student's own node, because
     `_chat` is deliberately not listable. */
  function discover(){
    if(!ME)return Promise.resolve([]);
    var dm='dm-'+ME.sid;
    return Promise.all([ get(ME.sid+'/chats'), get('_chat/all/meta') ]).then(function(r){
      var idx=r[0]||{}, allMeta=r[1];
      var out=[{tid:dm,title:label(dm),kind:'dm',ro:false}];
      if(allMeta&&!allMeta.off)out.push({tid:'all',title:label('all',allMeta),kind:'all',ro:!!allMeta.ro,members:allMeta.members});
      Object.keys(idx).forEach(function(tid){
        if(tid===dm||tid==='all')return;
        var it=idx[tid]||{};
        if(it.off)return;                       /* archived by the instructor */
        out.push({tid:tid,title:it.t||tid.replace(/^s?g-/,''),kind:it.k||kindOf(tid),ro:!!it.ro});
      });
      return out;
    });
  }

  /* The class directory. Students cannot list `_roster` — it holds the
     six-digit sign-in codes — so messaging a classmate needs a separate,
     names-only list. Every student adds their own name to it when they open
     the panel, so the list fills itself and nobody has to switch it on. The
     rules let a client write one entry with one string field and nothing
     else, so the worst it can carry is a name. */
  var PEOPLE=null;
  function joinDirectory(){
    if(!ME||!ME.sid)return;
    var seen=false;
    try{seen=localStorage.getItem(K+'_in_directory')==='1';}catch(e){}
    if(seen)return;
    put('_chat/_people/'+ME.sid,{n:ME.name||ME.sid});
    try{localStorage.setItem(K+'_in_directory','1');}catch(e){}
  }
  function loadPresence(){
    return get('_chat/_presence').then(function(o){ PRES=o||{}; return PRES; });
  }
  function loadPeople(force){
    if(PEOPLE&&!force)return Promise.resolve(PEOPLE);
    return get('_chat/_people').then(function(o){
      PEOPLE=[];
      Object.keys(o||{}).forEach(function(sid){
        if(!ME||sid===ME.sid)return;            /* you are not your own classmate */
        PEOPLE.push({sid:sid,name:(o[sid]&&o[sid].n)||sid});
      });
      PEOPLE.sort(function(a,b){return a.name.localeCompare(b.name);});
      return PEOPLE;
    });
  }

  function msgsOf(tid,limit){
    return fetch(DB+'/'+NS+'/_chat/'+encodeURIComponent(tid)+'/msgs.json?orderBy=%22%24key%22&limitToLast='+(limit||80))
      .then(function(r){return r.json();})
      .then(function(o){
        if(!o)return [];
        return Object.keys(o).map(function(k){var m=o[k]||{};m._id=k;return m;})
                 .filter(function(m){return m.txt;})
                 .sort(function(a,b){return (a.ts||0)-(b.ts||0);});
      })
      .catch(function(){return null;});
  }

  /* ---------------------------------------------------------------- */
  /* rendering                                                         */
  /* ---------------------------------------------------------------- */
  function unread(tid){
    var last=LAST[tid]||0;
    return last>lastRead(tid);
  }
  function badge(){
    var b=document.getElementById('jc-btn'); if(!b)return;
    var n=0;
    THREADS.forEach(function(th){ if(unread(th.tid))n++; });
    b.classList.toggle('has',n>0);
    b.querySelector('.jc-dot').textContent=n||'';
  }

  function renderTabs(){
    var w=document.getElementById('jc-tabs'); if(!w)return;
    w.classList.toggle('on',THREADS.length>1);
    if(THREADS.length<2){w.innerHTML='';return;}
    w.innerHTML=THREADS.map(function(th){
      var o=otherOf(th.tid), p=o?PRES[o]:null;
      var live=p&&p.t&&(Date.now()-p.t)<FRESH;
      return '<button class="jc-tab'+(th.tid===CUR?' on':'')+(unread(th.tid)&&th.tid!==CUR?' unread':'')+
             '" data-t="'+esc(th.tid)+'" type="button">'+(live?'<i class="on"></i>':'')+esc(th.title)+'</button>';
    }).join('');
    Array.prototype.forEach.call(w.querySelectorAll('.jc-tab'),function(b){
      b.addEventListener('click',function(){ select(b.getAttribute('data-t')); });
    });
  }

  function renderMsgs(keepScroll){
    var el=document.getElementById('jc-list'); if(!el)return;
    var t=L(), th=THREADS.filter(function(x){return x.tid===CUR;})[0]||{};
    var list=MSGS[CUR];

    if(list===undefined){ el.innerHTML='<div id="jc-empty">…</div>'; return; }
    if(!list.length){
      el.innerHTML='<div id="jc-empty">'+esc(th.kind==='dm'?t.empty:th.kind==='peer'?t.emptyP:t.emptyG)+'</div>';
      return;
    }

    var atBottom = el.scrollHeight-el.scrollTop-el.clientHeight < 60;
    var day='', h='';
    list.forEach(function(m){
      var d=dayLabel(m.ts||0);
      if(d!==day){ day=d; h+='<div class="jc-day">'+esc(d)+'</div>'; }
      var mine = m.by==='s' && ME && m.sid===ME.sid;
      var cls  = mine?'me':(m.by==='i'?'staff':'');
      var name = mine?t.you:(m.by==='i'?(m.name||t.instr):(m.name||'—'));
      /* in a private thread the two names are already obvious */
      var showName = !(th.kind==='dm' && mine);
      h+='<div class="jc-m '+cls+'">'+
           (showName?'<div class="jc-w">'+esc(name)+'</div>':'')+
           '<div class="jc-b">'+body(m.txt)+'</div>'+
           '<div class="jc-t">'+esc(clock(m.ts||0))+tick(m,mine)+'</div>'+
         '</div>';
    });
    el.innerHTML=h;
    if(!keepScroll||atBottom) el.scrollTop=el.scrollHeight;
  }

  /* ✓ sent · ✓✓ delivered · ✓✓ blue read. Only on 1:1 threads, and only on
     messages I sent — the receipt is the other person's, not mine. */
  function tick(m,mine){
    if(!mine)return '';
    if(!otherOf(CUR))return '';
    var t=L(), r=RCPT[CUR]||{}, ts=m.ts||0;
    if(r.r&&ts<=r.r)  return '<span class="jc-tick read" title="'+esc(t.tipRead)+'">✓✓</span>';
    if(r.d&&ts<=r.d)  return '<span class="jc-tick" title="'+esc(t.tipDeliv)+'">✓✓</span>';
    return '<span class="jc-tick" title="'+esc(t.tipSent)+'">✓</span>';
  }

  function renderFoot(){
    var t=L(), th=THREADS.filter(function(x){return x.tid===CUR;})[0]||{};
    var row=document.getElementById('jc-row'), note=document.getElementById('jc-note');
    if(!row)return;
    /* Say it where it is read, not in a policy page nobody opens: a thread with
       a classmate is not private from the instructor, and the panel says so. */
    /* Say who is in the thread, which is checkable, rather than making a
       promise about privacy that an unauthenticated course site cannot keep.
       Threads the instructor IS in need no line — that is obvious from the
       name of the thread. */
    var hint=document.getElementById('jc-hint');
    if(hint){
      hint.textContent = th.kind==='peer' ? t.peerOnly
        : (th.tid&&th.tid.indexOf('sg-')===0) ? t.groupOnly(th.members?Object.keys(th.members).length:0)
        : '';
    }
    note.className='';
    if(!ME){
      row.style.display='none';
      note.innerHTML=esc(t.needName)+(window.CourseLogin?' <a href="#" id="jc-si">'+esc(t.signin)+'</a>':'');
      var a=document.getElementById('jc-si');
      if(a)a.addEventListener('click',function(e){e.preventDefault();window.CourseLogin.open();});
      return;
    }
    if(th.ro){ row.style.display='none'; note.textContent=t.ro; return; }
    row.style.display='flex'; note.textContent='';
  }

  /* ---------------------------------------------------------------- */
  /* starting a conversation                                           */
  /* ---------------------------------------------------------------- */
  /* ONE screen: the class, always visible, with a checkbox each. Tick one and
     the button says "Message Bo Tran"; tick several and it asks for a group
     name. The earlier version buried this two taps down and — worse — hid the
     entrance entirely when the directory happened to be empty, which is exactly
     when a student is first looking for it. */
  var SEL={};

  function openNew(){
    SEL={};
    document.getElementById('jc-new').classList.add('on');
    document.getElementById('jc-foot').style.display='none';
    renderNew();
    Promise.all([loadPeople(true),loadPresence()]).then(function(){ renderNew(); });
  }
  function closeNew(){
    document.getElementById('jc-new').classList.remove('on');
    document.getElementById('jc-foot').style.display='';
    renderFoot();
  }

  function selCount(){ return Object.keys(SEL).filter(function(k){return SEL[k];}).length; }
  function selList(){ return Object.keys(SEL).filter(function(k){return SEL[k];}); }
  function nameFor(sid){
    var p=(PEOPLE||[]).filter(function(x){return x.sid===sid;})[0];
    return p?p.name:sid;
  }

  function mateRows(){
    var q=((document.getElementById('jc-search')||{}).value||'').trim().toLowerCase();
    var list=(PEOPLE||[]).filter(function(p){return !q||p.name.toLowerCase().indexOf(q)>=0;});
    if(!list.length)return '<div class="warn">'+esc(q?L().noMatch:L().noList)+'</div>';
    return list.map(function(p){
      var o=PRES[p.sid], live=o&&o.t&&(Date.now()-o.t)<FRESH;
      return '<label class="jc-mate'+(SEL[p.sid]?' sel':'')+'">'+
        '<input type="checkbox" value="'+esc(p.sid)+'"'+(SEL[p.sid]?' checked':'')+'>'+
        '<span class="nm">'+esc(p.name)+'</span>'+
        (live?'<i class="live" title="online"></i>':'')+
      '</label>';
    }).join('');
  }

  function renderNew(){
    var t=L(), el=document.getElementById('jc-new');
    if(!el)return;
    var n=selCount(), total=(PEOPLE||[]).length;

    el.innerHTML=
      '<h4>'+esc(t.newT)+'</h4>'+
      '<button class="jc-opt" data-go="prof"><span class="ic">🎓</span><span class="tx">'+
        '<span class="t1">'+esc(t.pickProf)+'</span><span class="t2">'+esc(t.pickProfSub)+'</span></span></button>'+
      '<div class="jc-sec">'+esc(t.yourClass)+(total?' · '+total:'')+'</div>'+
      '<input id="jc-search" placeholder="'+esc(t.searchPh)+'">'+
      '<div id="jc-mates">'+mateRows()+'</div>'+
      '<div class="jc-sticky">'+
        (n>1?'<input id="jc-gname" placeholder="'+esc(t.gNamePh)+'">':'')+
        '<div class="err" id="jc-gerr"></div>'+
        (n===0?'<div class="tip">'+esc(t.tickHint)+'</div>':'')+
        '<div class="act">'+
          '<button class="no" data-go="back">'+esc(t.back)+'</button>'+
          (n===1?'<button class="go" data-go="one">'+esc(t.msgOne(nameFor(selList()[0])))+'</button>':'')+
          (n>1 ?'<button class="go" data-go="make">'+esc(t.mkGroup(n+1))+'</button>':'')+
        '</div>'+
      '</div>';

    Array.prototype.forEach.call(el.querySelectorAll('[data-go]'),function(b){
      b.addEventListener('click',function(){
        var g=b.getAttribute('data-go');
        if(g==='back'){closeNew();return;}
        if(g==='prof'){closeNew();select('dm-'+ME.sid);return;}
        if(g==='one'){var sid=selList()[0];startPeer(sid,nameFor(sid));return;}
        if(g==='make'){makeGroup();return;}
      });
    });
    var sr=document.getElementById('jc-search');
    if(sr){
      sr.addEventListener('input',function(){
        document.getElementById('jc-mates').innerHTML=mateRows();
        wireMates();
      });
    }
    wireMates();
  }

  function wireMates(){
    Array.prototype.forEach.call(document.querySelectorAll('#jc-mates input[type=checkbox]'),function(cb){
      cb.addEventListener('change',function(){
        SEL[cb.value]=cb.checked;
        var q=(document.getElementById('jc-search')||{}).value||'';
        renderNew();
        var sr=document.getElementById('jc-search');
        if(sr&&q){sr.value=q;document.getElementById('jc-mates').innerHTML=mateRows();wireMates();}
      });
    });
  }

  /* Both sides need the thread in their own index, because neither can list
     `_chat` — so opening a conversation writes into the classmate's node too.
     That is the same door the rules already leave open for progress writes. */
  function startPeer(sid,name){
    var tid=peerId(ME.sid,sid), now=Date.now();
    put(ME.sid+'/chats/'+tid,{t:name,k:'peer',ts:now});
    put(sid+'/chats/'+tid,{t:ME.name||ME.sid,k:'peer',ts:now});
    if(!THREADS.some(function(x){return x.tid===tid;}))
      THREADS.push({tid:tid,title:name,kind:'peer',ro:false});
    closeNew();
    select(tid);
  }

  function makeGroup(){
    var t=L();
    var title=(document.getElementById('jc-gname').value||'').trim();
    var err=document.getElementById('jc-gerr');
    if(!title){err.textContent=t.gNeedName;return;}
    var picked=selList();
    var slug=san(title)||String(Date.now()).slice(-6);
    var tid='sg-'+slug+'-'+Math.random().toString(36).slice(2,6);
    var mem={}; mem[ME.sid]=true; picked.forEach(function(x){mem[x]=true;});
    var now=Date.now();
    /* meta is create-once for an sg- thread, so this is the one chance to set it */
    fetch(DB+'/'+NS+'/_chat/'+encodeURIComponent(tid)+'/meta.json',
      {method:'PUT',headers:{'Content-Type':'application/json'},
       body:JSON.stringify({kind:'group',title:title,members:mem,by:'s',ts:now})}).catch(function(){});
    Object.keys(mem).forEach(function(x){ put(x+'/chats/'+tid,{t:title,k:'group',ts:now}); });
    THREADS.push({tid:tid,title:title,kind:'group',ro:false,members:mem});
    closeNew();
    select(tid);
  }

  function select(tid){
    CUR=tid;
    renderTabs(); renderFoot(); renderMsgs(false); renderPresence();
    beat2();                       /* tell them which thread I am looking at */
    refresh(true);
  }

  /* ---------------------------------------------------------------- */
  /* polling                                                           */
  /* ---------------------------------------------------------------- */
  /* Open thread: the last 80 messages. Everything else: just the newest
     one, which is all a badge needs. */
  function refresh(force){
    if(document.hidden&&!force)return Promise.resolve();
    var jobs=THREADS.map(function(th){
      var full=(th.tid===CUR&&OPEN);
      return msgsOf(th.tid,full?80:1).then(function(list){
        if(list===null)return;
        var newest=list.length?(list[list.length-1].ts||0):0;
        if(newest>(LAST[th.tid]||0))LAST[th.tid]=newest;
        if(full){
          MSGS[th.tid]=list;
          if(list.length)markRead(th.tid,newest);
        }
      });
    });
    /* One read covers everybody's presence — the tab dots, the class list and
       the header line all draw from it. Fetching per thread was one request per
       conversation every six seconds, which is a lot of requests to answer the
       question "is Bo around". Receipts are still per-thread: only the open one
       matters. */
    jobs.push(loadPresence());
    var other=OPEN?otherOf(CUR):null;
    if(other){
      jobs.push(get('_chat/'+encodeURIComponent(CUR)+'/rcpt/'+other).then(function(o){ RCPT[CUR]=o||null; }));
    }
    return Promise.all(jobs).then(function(){
      sendReceipt();
      if(OPEN)renderMsgs(true);
      renderTabs(); badge(); renderPresence();
    });
  }

  /* Delivered = my client has fetched it. Read = it was on screen, which means
     the panel was open on this thread. Two different facts, so two fields. */
  function sendReceipt(){
    if(!ME||!CUR)return;
    if(!otherOf(CUR))return;                       /* 1:1 only */
    var list=MSGS[CUR]||[];
    var newest=0;
    list.forEach(function(m){ if(m.by!=='s'||m.sid!==ME.sid){ if((m.ts||0)>newest)newest=m.ts||0; } });
    if(!newest&&LAST[CUR])newest=LAST[CUR];
    if(!newest)return;
    var key=K+'_rcpt_'+CUR, prev=null;
    try{prev=JSON.parse(localStorage.getItem(key)||'null');}catch(e){}
    var mine={d:newest, r:(OPEN&&document.getElementById('jc-panel').classList.contains('on'))?newest:((prev&&prev.r)||0)};
    if(prev&&prev.d>=mine.d&&prev.r>=mine.r)return;              /* nothing new to say */
    mine.d=Math.max(mine.d,(prev&&prev.d)||0);
    mine.r=Math.max(mine.r,(prev&&prev.r)||0);
    try{localStorage.setItem(key,JSON.stringify(mine));}catch(e){}
    put('_chat/'+encodeURIComponent(CUR)+'/rcpt/'+ME.sid,mine);
  }

  function renderPresence(){
    var el=document.getElementById('jc-pres'); if(!el)return;
    var t=L(), th=THREADS.filter(function(x){return x.tid===CUR;})[0]||{};
    var ttl=document.getElementById('jc-title');
    if(ttl)ttl.textContent=th.title||t.title;
    var other=otherOf(CUR), p=other?PRES[other]:null;
    if(!other||!p||!p.t){ el.innerHTML=''; return; }
    var age=Date.now()-p.t;
    if(age<FRESH){
      var here=p.at===CUR;
      el.innerHTML='<i class="'+(here?'here':'on')+'"></i><span>'+esc(here?t.here:t.online)+'</span>';
    }else{
      el.innerHTML='<i></i><span>'+esc(t.seenAgo(ago(p.t)))+'</span>';
    }
  }
  function ago(ts){
    var s=Math.round((Date.now()-ts)/1000);
    if(s<90)return 'just now';
    var m=Math.round(s/60); if(m<60)return m+'m ago';
    var h=Math.round(m/60); if(h<24)return h+'h ago';
    return Math.round(h/24)+'d ago';
  }

  function beat(){
    clearInterval(TIMER);
    TIMER=setInterval(refresh, OPEN?6000:30000);
  }

  /* ---------------------------------------------------------------- */
  /* sending                                                           */
  /* ---------------------------------------------------------------- */
  function send(){
    if(SENDING||!ME||!CUR)return;
    var th=THREADS.filter(function(x){return x.tid===CUR;})[0];
    if(th&&th.ro)return;                       /* announcements-only: read, don't write */
    var t=L(), ta=document.getElementById('jc-in');
    var txt=(ta.value||'').trim();
    if(!txt)return;
    if(txt.length>2000)txt=txt.slice(0,2000);
    var msg={by:'s',sid:ME.sid,name:ME.name||ME.sid,txt:txt,ts:Date.now()};

    SENDING=true;
    document.getElementById('jc-send').disabled=true;
    /* show it immediately; the poll will replace it with the stored copy */
    MSGS[CUR]=(MSGS[CUR]||[]).concat([msg]);
    ta.value=''; ta.style.height='auto';
    renderMsgs(false);

    post('_chat/'+encodeURIComponent(CUR)+'/msgs',msg).then(function(){
      LAST[CUR]=msg.ts; markRead(CUR,msg.ts);
      /* so the instructor's thread list can show a DM that has no meta */
      if(CUR==='dm-'+ME.sid) put(ME.sid+'/chats/'+CUR,{t:ME.name||ME.sid,k:'dm',ts:msg.ts});
      document.getElementById('jc-note').className='';
      document.getElementById('jc-note').textContent='';
    }).catch(function(){
      MSGS[CUR]=(MSGS[CUR]||[]).filter(function(m){return m!==msg;});
      renderMsgs(false);
      ta.value=txt;
      var n=document.getElementById('jc-note'); n.className='bad'; n.textContent=t.failed;
    }).then(function(){
      SENDING=false;
      document.getElementById('jc-send').disabled=false;
      ta.focus();
    });
  }

  /* ---------------------------------------------------------------- */
  /* open / close                                                      */
  /* ---------------------------------------------------------------- */
  function open(tid){
    OPEN=true;
    document.getElementById('jc-panel').classList.add('on');
    document.getElementById('jc-btn').style.display='none';
    if(typeof tid==='string'&&THREADS.some(function(x){return x.tid===tid;}))CUR=tid;
    if(!CUR&&THREADS.length)CUR=THREADS[0].tid;
    renderTabs(); renderFoot(); renderMsgs(false); renderPresence();
    refresh(true); beat(); startHeart();
    setTimeout(function(){var i=document.getElementById('jc-in');if(i&&i.offsetParent)i.focus();},80);
  }
  function close(){
    var sheet=document.getElementById('jc-new');
    if(sheet&&sheet.classList.contains('on'))closeNew();
    OPEN=false;
    document.getElementById('jc-panel').classList.remove('on');
    document.getElementById('jc-btn').style.display='';
    place(); beat(); stopHeart();
  }

  /* ---------------------------------------------------------------- */
  /* boot                                                              */
  /* ---------------------------------------------------------------- */
  function boot(){
    ME=who();
    build();
    discover().then(function(list){
      THREADS=list;
      if(!THREADS.length){ document.getElementById('jc-btn').style.display='none'; return; }
      CUR=THREADS[0].tid;
      renderTabs();
      refresh(true); beat();
      joinDirectory();
      loadPeople().catch(function(){});
    });
    document.addEventListener('visibilitychange',function(){ if(!document.hidden)refresh(); });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  return {
    open:open, close:close, refresh:refresh, newConversation:openNew,
    threads:function(){return THREADS.slice();},
    me:function(){return ME;}
  };
})();
