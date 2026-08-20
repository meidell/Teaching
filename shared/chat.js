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

   Thread ids are readable on purpose: `all` (whole cohort), `dm-<sid>`
   (instructor ↔ that one student), `g-<slug>` (a group).

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
      empty:"No messages yet. Say hello — this thread is between you and your instructor, not the rest of the class.",
      emptyG:"No messages in this group yet.",
      ro:"Announcements only — you cannot reply here.",
      needName:"Sign in with your name first, so I know who is writing.",
      signin:"Sign in",
      failed:"Message not sent. Check your connection and try again.",
      you:"You", instr:"Instructor",
      today:"Today", yesterday:"Yesterday",
      close:"Close", members:function(n){return n+" people";}
    },
    fr: {
      launch:"Messages", title:"Messages",
      dm:"Votre professeur", all:"Tout le monde",
      ph:"Écrivez un message…", send:"Envoyer",
      empty:"Aucun message. Dites bonjour — cette conversation est entre vous et votre professeur, pas le reste de la classe.",
      emptyG:"Aucun message dans ce groupe.",
      ro:"Annonces uniquement — vous ne pouvez pas répondre ici.",
      needName:"Connectez-vous d'abord, pour que je sache qui écrit.",
      signin:"Se connecter",
      failed:"Message non envoyé. Vérifiez votre connexion et réessayez.",
      you:"Vous", instr:"Professeur",
      today:"Aujourd'hui", yesterday:"Hier",
      close:"Fermer", members:function(n){return n+" personnes";}
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
    '#jc-head b{font-size:14.5px;flex:1;}'+
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
    '#jc-list{flex:1;overflow-y:auto;padding:14px 13px 6px;background:'+T.surface+';}'+
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
      '<div id="jc-head"><b>'+esc(t.title)+'</b><button id="jc-x" type="button" aria-label="'+esc(t.close)+'">×</button></div>'+
      '<div id="jc-tabs"></div>'+
      '<div id="jc-list"></div>'+
      '<div id="jc-foot"><div id="jc-row">'+
        '<textarea id="jc-in" rows="1" placeholder="'+esc(t.ph)+'"></textarea>'+
        '<button id="jc-send" type="button">'+esc(t.send)+'</button>'+
      '</div><div id="jc-note"></div></div>';
    document.body.appendChild(p);

    document.getElementById('jc-x').addEventListener('click',close);
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
    return (meta&&meta.title)||tid.replace(/^g-/,'');
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
        out.push({tid:tid,title:it.t||tid.replace(/^g-/,''),kind:it.k||'group',ro:!!it.ro});
      });
      return out;
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
      return '<button class="jc-tab'+(th.tid===CUR?' on':'')+(unread(th.tid)&&th.tid!==CUR?' unread':'')+
             '" data-t="'+esc(th.tid)+'" type="button">'+esc(th.title)+'</button>';
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
      el.innerHTML='<div id="jc-empty">'+esc(th.kind==='dm'?t.empty:t.emptyG)+'</div>';
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
           '<div class="jc-t">'+esc(clock(m.ts||0))+'</div>'+
         '</div>';
    });
    el.innerHTML=h;
    if(!keepScroll||atBottom) el.scrollTop=el.scrollHeight;
  }

  function renderFoot(){
    var t=L(), th=THREADS.filter(function(x){return x.tid===CUR;})[0]||{};
    var row=document.getElementById('jc-row'), note=document.getElementById('jc-note');
    if(!row)return;
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

  function select(tid){
    CUR=tid;
    renderTabs(); renderFoot(); renderMsgs(false);
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
    return Promise.all(jobs).then(function(){
      if(OPEN)renderMsgs(true);
      renderTabs(); badge();
    });
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
    renderTabs(); renderFoot(); renderMsgs(false);
    refresh(true); beat();
    setTimeout(function(){var i=document.getElementById('jc-in');if(i&&i.offsetParent)i.focus();},80);
  }
  function close(){
    OPEN=false;
    document.getElementById('jc-panel').classList.remove('on');
    document.getElementById('jc-btn').style.display='';
    place(); beat();
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
    });
    document.addEventListener('visibilitychange',function(){ if(!document.hidden)refresh(); });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  return {
    open:open, close:close, refresh:refresh,
    threads:function(){return THREADS.slice();},
    me:function(){return ME;}
  };
})();
