/* =====================================================================
   HEG · Applied Statistics — presence, marked in the room.

   Presence is 20% of the grade, pro rata: your mark is the share of the
   sessions actually held that you were present for. So it has to be
   recorded honestly, in the room, at a moment the instructor controls —
   not by opening a web page from a café.

   HOW IT WORKS
     • The instructor opens the window for this session (one button, on
       the week page or in the dashboard). The student's button turns
       from grey to red and becomes clickable.
     • Each student presses it once. That writes their mark.
     • The instructor closes the window. Later clicks are refused.
     • The dashboard shows a column per session, immediately.

     <ns>/_presence/<sessionId>            sessionId = the week's module id
        open      true while the window is accepting marks
        label     'Week 3 · Discrete random variables'
        openedAt  / closedAt   timestamps
        marks/<sid> = ts       one per student who pressed the button

   Marks live under `_presence`, not under the student's own node, because
   the whole point is a summary the instructor reads in one request — and
   because a student must not be able to quietly grant themselves presence
   for a session that never opened. (That is a soft guarantee: the gate is
   the `open` flag, and this repo's database rules are not deployed. It
   makes casual self-marking take deliberate effort, and it makes the
   attempt visible — a mark whose timestamp sits outside the window is
   evidence. It is not authentication.)

   WHY NOT A `presence` KEY UNDER <sid>: the dashboard reads the namespace
   root, so both shapes cost one request — but a per-student key would let
   a mark exist with no session behind it. Sessions are the source of truth
   here: no open session, no column, no mark.

     StatsPresence.mount({el, mod, label})   student button + instructor control
     StatsPresence.summary(root)             {sessions:[…], byStudent:{…}}

   TWO SUBGROUPS, ONE CLASS. The cohort is taught twice a week — Monday
   (g1) and Wednesday (g2) — so a week is TWO sessions and a student may
   only mark themselves in their own. The session id carries the group:

       w3       Monday      the default group keeps the bare module id
       w3-g2    Wednesday

   That is why g1 must stay first in `groups` and keep its id: every mark
   recorded before the split is a bare `wN`, and it stays valid, in the
   Monday register, with no migration. A student's group is read from
   their own node (`<ns>/<sid>/grp`, cached in the auth blob by login.js);
   no group recorded means the first group, which is what puts everyone
   who registered before the split in Monday.

   `_presence_now` is likewise per group — `{g1:{…}, g2:{…}}` — because
   both rooms can have a window open on the same day and a student must
   never see the other room's. The old flat `{mod,label,open,ts}` is still
   read, as the default group's pointer, so nothing breaks mid-term.
   ===================================================================== */
window.StatsPresence = (function () {
  "use strict";
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS = "statistics";

  /* Kept here as well as in /shared/config.js and /courses.json because this
     file is loaded BEFORE config.js on the hub — CourseConfig is preferred
     when it happens to be there. Three copies is two too many; if you add a
     group, change all three. */
  var GROUPS=[{id:'g1',label:'Monday',short:'Mon',n:1},
              {id:'g2',label:'Wednesday',short:'Wed',n:2}];
  function groups(){
    try{
      var c=window.CourseConfig&&CourseConfig.get&&CourseConfig.get('statistics');
      if(c&&c.groups&&c.groups.length)return c.groups;
    }catch(e){}
    return GROUPS;
  }
  function defGrp(){return groups()[0].id;}
  function grpOf(id){var G=groups();for(var i=0;i<G.length;i++)if(G[i].id===id)return G[i];return G[0];}
  function grpLabel(id){var g=grpOf(id);return g?(g.label||g.id):'';}

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem('stats_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  /* the group this device is in — unknown is the default group, never "none" */
  function myGrp(){var a=auth();return (a&&a.grp)||defGrp();}
  /* module id + group → session id. The default group keeps the bare id. */
  function sesId(mod,grp){
    grp=grp||myGrp();
    return (grp&&grp!==defGrp())?(mod+'-'+grp):mod;
  }
  function node(mod){return DB+'/'+NS+'/_presence/'+encodeURIComponent(mod);}

  /* ---- WHAT COUNTS AS A SESSION HELD -------------------------------------
     Not "a window was opened once". Opening and closing a window takes two
     clicks and is done by accident — a mis-picked week, a test, a double
     press — and the moment a node had `openedAt` on it, every student who
     had not marked themselves was shown ABSENT from a session that never
     happened, and the week page told them they had missed it. That is the
     opposite of what a register is for. (It happened for real: a two-second
     window on `w2-g2`, 16 Sep 2026, painted week 2 red for the whole
     Wednesday group.)

     So: a session counts once SOMEBODY WAS MARKED AT IT. A real session
     always has marks — including one the instructor fills in by hand from
     the dashboard afterwards. A stray window has none, counts as nothing
     for everyone, and needs no cleanup.

     A window that is open RIGHT NOW is in progress, not held: nobody is
     absent from a session they are sitting in and about to mark. */
  function anyMarks(s){ for(var k in ((s&&s.marks)||{}))return true; return false; }
  function isHeld(s){ return !!(s && !s.open && anyMarks(s)); }

  function css(){
    if(document.getElementById('pres-css'))return;
    var s=document.createElement('style');s.id='pres-css';
    s.textContent=
    '.pres{background:var(--white);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:16px 0;box-shadow:var(--shadow);}'+
    '.pres h4{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--navy);margin-bottom:4px;font-weight:800;}'+
    '.pres .pd{font-size:13px;color:var(--grey);line-height:1.5;margin-bottom:12px;}'+
    '.pres-btn{display:inline-flex;align-items:center;gap:9px;border:none;border-radius:30px;padding:13px 26px;'+
      'font:800 15px inherit;cursor:pointer;transition:.2s;background:#E5E9EF;color:#98A2AD;}'+
    '.pres-btn:disabled{cursor:not-allowed;}'+
    '.pres-btn.live{background:var(--accent);color:#fff;box-shadow:0 8px 22px -8px rgba(204,0,0,.7);cursor:pointer;}'+
    '.pres-btn.live:hover{background:var(--accent-deep);}'+
    '.pres-btn.marked{background:var(--ok);color:#fff;cursor:default;}'+
    '.pres-state{font-size:13px;color:var(--grey);margin-top:10px;line-height:1.5;}'+
    '.pres-state b{color:var(--ink);}'+
    '.pres-tally{font-size:13px;color:var(--ink-soft);margin-top:10px;}'+
    '.pres-tally b{color:var(--navy);font-size:16px;}'+
      'font:700 13px inherit;margin:0 8px 8px 0;max-width:100%;}'+
      'padding:9px 11px;margin:0 0 10px;font-size:12.5px;line-height:1.5;}'+
      'font:600 13px inherit;min-width:0;flex:1 1 180px;max-width:260px;}'+
      'border-left:3px solid var(--ok,#2F855A);border-radius:6px;padding:7px 10px;line-height:1.5;}'+
    '.pres-mini{font-size:12px;color:var(--grey);}'+
    '.pres-mine{font-size:12.5px;color:var(--grey);line-height:1.55;margin-top:14px;padding-top:12px;border-top:1px solid var(--line);}'+
    '.pres-mine .pm-h{color:var(--ink);font-size:13.5px;}'+
    '.pres-mine .pm-h b{color:var(--accent-deep);}'+
    '.pres-mine .pm-pct{font-weight:800;border-radius:20px;padding:1px 9px;font-size:12px;margin-left:6px;}'+
    '.pres-mine .pm-pct.ok{background:rgba(47,133,90,.14);color:#2F855A;}'+
    '.pres-mine .pm-pct.mid{background:rgba(201,151,28,.16);color:#8A6A12;}'+
    '.pres-mine .pm-pct.low{background:rgba(204,0,0,.12);color:var(--accent);}'+
    '.pres-mine .pm-bar{display:grid;grid-template-columns:repeat(15,1fr);gap:3px;margin:10px 0 3px;}'+
    '.pres-mine .pm-seg{height:15px;border-radius:3px;background:#EEF1F5;}'+
    '.pres-mine .pm-seg.y{background:#2F855A;}'+
    '.pres-mine .pm-seg.n{background:var(--accent);}'+
    '.pres-mine .pm-seg.u{background:repeating-linear-gradient(45deg,#eef1f5,#eef1f5 4px,#e4e8ee 4px,#e4e8ee 8px);}'+
    '.pres-mine .pm-x{display:grid;grid-template-columns:repeat(15,1fr);gap:3px;font-size:9px;'+
      'color:var(--grey);text-align:center;letter-spacing:-.02em;}'+
    '.pres-mine .pm-lgd{display:flex;gap:14px;flex-wrap:wrap;margin:9px 0 6px;font-size:11px;color:var(--grey);}'+
    '.pres-mine .pm-lgd i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px;}'+
    '.pres-mine .pm-lgd i.y{background:#2F855A;}'+
    '.pres-mine .pm-lgd i.n{background:var(--accent);}'+
    '.pres-mine .pm-lgd i.u{background:repeating-linear-gradient(45deg,#eef1f5,#eef1f5 3px,#e4e8ee 3px,#e4e8ee 6px);}'+
    '.pres-mine .pm-f{font-size:11.5px;}'+
    '.pres-grp{display:inline-block;margin-left:8px;background:var(--navy,#002C46);color:#fff;border-radius:20px;'+
      'padding:2px 9px;font-size:10px;letter-spacing:1px;font-weight:800;vertical-align:1px;}'+
    '.pres-mini b{color:var(--accent-deep);}';
    document.head.appendChild(s);
  }


  /* ---------- which window is open, for students ----------------------
     Students cannot list `_presence` — the rules put `.read: true` on
     `_presence/$session` and NOT on the parent, so nobody can pull the
     cohort's sid list in one request. That leaves them unable to DISCOVER
     which session is accepting marks, so the instructor writes a one-line
     public pointer as well:

        statistics/_presence_now = { mod, label, open, ts }

     It carries no sids, so it is safe to make world-readable, and it costs
     a student one small poll instead of fifteen. Both nodes are written
     together; if the pointer write fails the console says so loudly,
     because a half-open window is worse than a closed one.
     -------------------------------------------------------------------- */
  function nowUrl(){return DB+'/'+NS+'/_presence_now';}
  /* sid → display name. _chat/_people is world-readable and carries names and
     nothing else (no codes), which is exactly what a register needs. */
  var PEOPLE=null;
  function loadPeople(cb){
    if(PEOPLE){cb(PEOPLE);return;}
    fetch(DB+'/'+NS+'/_chat/_people.json').then(function(r){return r.ok?r.json():null;})
      .then(function(j){PEOPLE=(j&&!j.error)?j:{};cb(PEOPLE);},function(){PEOPLE={};cb(PEOPLE);});
  }
  function nameOf(sid){
    var p=PEOPLE&&PEOPLE[sid];
    return (p&&p.n)||sid.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
  }
  /* One read, both shapes. `_presence_now` is now {g1:{…}, g2:{…}} — one
     pointer per room — but a flat {mod,label,open,ts} left over from before
     the split is still honoured, as the default group's pointer. Reading the
     parent rather than `_presence_now/<grp>` costs the same one request and
     survives either shape. */
  function readNow(grp){
    grp=grp||myGrp();
    return fetch(nowUrl()+'.json').then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status);
      return r.json();
    }).then(function(j){
      if(j&&j.error)throw new Error(j.error);
      if(!j)return null;
      if(j[grp])return j[grp];
      if(j.mod&&grp===defGrp())return j;      /* pre-split pointer */
      return null;
    });
  }
  /* w1…w15 — the fifteen taught sessions. Week 16 is the exam and is not
     marked here. Names come from CourseProgress so one list serves the
     dropdown, the student's running total and the dashboard alike. */
  function allWeeks(){
    var out=[];
    try{
      (window.CourseProgress&&CourseProgress.CHAPTERS||[]).forEach(function(c){
        var m=/^w(\d+)$/.exec(c.mod||'');
        if(m&&+m[1]<=15)out.push({mod:c.mod,n:+m[1],name:c.name||c.mod});
      });
    }catch(e){}
    out.sort(function(a,b){return a.n-b.n;});
    return out;
  }

  /* ---------- student + instructor widget on a week page ---------- */
  function mount(o){
    var el=o.el, mod=o.mod, label=o.label||mod;
    if(!el)return;
    css();
    var a=auth(), state=null, timer=null, fails=0, blocked=false;
    /* This week is taught twice. The button watches — and writes to — the
       session of the group this student belongs to, and nothing else. */
    var grp=myGrp(), ses=sesId(mod,grp);

    el.className='pres';
    el.innerHTML='<h4>Presence · this session'+(a?' <span class="pres-grp">'+esc(grpLabel(grp))+' group</span>':'')+'</h4>'+
      '<div class="pd" id="presWhy">Presence is <b>20% of your grade</b>, pro rata — the share of the sessions actually held that you attended. Your instructor opens this button in the room; press it once while it is red. '+
      (a?'You are in the <b>'+esc(grpLabel(grp))+'</b> group, so only that session\u2019s window turns it red.'
        :'The class is taught twice, Monday and Wednesday — sign in and this will say which group you are in.')+'</div>'+
      '<button class="pres-btn" id="presBtn" disabled>Presence not open</button>'+
      '<div class="pres-state" id="presState"></div>'+
      '';

    var btn=el.querySelector('#presBtn'), st=el.querySelector('#presState');

    function marked(){return !!(a&&state&&state.marks&&state.marks[a.sid]);}
    function count(){var n=0,m=(state&&state.marks)||{};for(var k in m)n++;return n;}

    function paint(){
      var open=!!(state&&state.open);
      btn.classList.remove('live','marked');
      if(marked()){
        btn.className='pres-btn marked';btn.disabled=true;
        btn.innerHTML='✓ You are marked present';
        st.innerHTML='Recorded at <b>'+new Date(state.marks[a.sid]).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})+'</b>. Nothing more to do.';
      }else if(!a){
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML='🔒 Sign in first';
        st.innerHTML='Presence is attached to your name, so you have to be signed in. Use the button at the bottom-right of the page, then come back.';
      }else if(open){
        btn.className='pres-btn live';btn.disabled=false;btn.innerHTML='✋ I am here — mark me present';
        st.innerHTML='The window is <b>open</b>. Press the button.';
      }else if(blocked){
        /* The button can never turn red if we cannot read the session, so say
           so rather than looking like a closed window. This is what a student
           sees if the database rules block reads for this course. */
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML='⚠ Cannot reach the register';
        st.innerHTML='This device cannot read the presence window from the server, so the button will not turn red. '+
          '<b>Tell your instructor now</b> — they can mark you from the dashboard, and it needs fixing for everyone.';
      }else{
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML='Presence not open';
        /* Only say "you missed it" about a session that actually happened.
           A closed window nobody was marked at was opened by mistake, and
           telling thirty people they were absent from it is a message they
           will act on. */
        st.innerHTML=isHeld(state)
          ? 'The window for this session is <b>closed</b>. If you were in the room and missed it, tell your instructor — they can mark you from the dashboard.'
          : 'Your instructor opens this in the room. It turns red when you can press it. '+
            'A window open for the other group leaves it grey — that is correct.';
      }
    }

    function mark(){
      if(!a||!state||!state.open)return;
      var t=Date.now();
      state.marks=state.marks||{};state.marks[a.sid]=t;
      paint();
      fetch(node(ses)+'/marks/'+encodeURIComponent(a.sid)+'.json',
        {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)})
        .catch(function(){ st.innerHTML='Could not reach the server — tell your instructor, they can mark you by hand.'; });
    }
    btn.addEventListener('click',mark);

    function pull(){
      if(document.hidden)return;
      fetch(node(ses)+'.json').then(function(r){
        if(!r.ok)throw new Error('HTTP '+r.status);
        return r.json();
      }).then(function(j){
        if(j&&j.error)throw new Error(j.error);
        fails=0;blocked=false;state=j||{};paint();
      }).catch(function(){
        /* two consecutive failures, not one — a flaky lecture-hall wifi should
           not put a scary message in front of thirty people */
        if(++fails>=2&&!blocked){blocked=true;paint();}
      });
    }
    pull();
    /* 6s while open matters; the tab being hidden pauses it */
    timer=setInterval(pull,6000);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)pull();});
    return {refresh:pull};
  }

  /* ---------- the hub: one card on the course landing page -------------
     For a student: the button, driven by `_presence_now` so it works
     whatever week is open and wherever they are on the site.
     For the instructor: a week picker and Open/Close, so the whole ritual
     — say "go", click, say "stop", click — happens on the page already on
     the projector. Both halves write the same two nodes the week pages do.
     -------------------------------------------------------------------- */
  function hub(el){
    if(!el)return;
    css();
    var a=auth();
    var now=null, sess=null, selSess=null, blocked=false, fails=0, instMsg='';
    var scanning=false, lastScan=0;
    var weeks=allWeeks();
    var grp=myGrp();

    el.className='pres';
    el.innerHTML=
      '<h4>Presence · this session'+(a?' <span class="pres-grp">'+esc(grpLabel(grp))+' group</span>':'')+'</h4>'+
      '<div class="pd">Presence is <b>20% of your grade</b>, pro rata — the share of the sessions actually held that you attended. Your instructor opens the window in the room; press the button once while it is red.'+
      (a?' You are in the <b>'+esc(grpLabel(grp))+'</b> group — only that room\u2019s window opens this button. If that is the wrong day, tell your instructor: they can move you.'
         :' The class is taught twice, Monday and Wednesday; sign in and this card will say which group you are in.')+'</div>'+
      '<button class="pres-btn" id="hubBtn" disabled>Presence not open</button>'+
      '<div class="pres-state" id="hubState"></div>'+
      '<div id="hubMine"></div>'+
      '';
    var btn=el.querySelector('#hubBtn'), st=el.querySelector('#hubState');

    function openMod(){return (now&&now.open&&now.mod)?now.mod:null;}
    function marked(){return !!(a&&sess&&sess.marks&&sess.marks[a.sid]);}
    function lbl(){return (now&&now.label)?now.label:'this session';}

    function paint(){
      var m=openMod();
      if(marked()){
        btn.className='pres-btn marked';btn.disabled=true;
        btn.innerHTML='✓ You are marked present';
        st.innerHTML='Recorded at <b>'+new Date(sess.marks[a.sid]).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})+
          '</b> for <b>'+esc(lbl())+'</b>. Nothing more to do.';
      }else if(!a){
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML='🔒 Sign in first';
        st.innerHTML='Presence is attached to your name, so you have to be signed in. Use the button at the bottom-right of the page, then come back.';
      }else if(m){
        btn.className='pres-btn live';btn.disabled=false;
        btn.innerHTML='✋ I am here — mark me present';
        st.innerHTML='The window is <b>open</b> for <b>'+esc(lbl())+'</b>. Press the button.';
      }else if(blocked){
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML='Presence not open';
        st.innerHTML='This device cannot reach the register just now. If the button has not turned red a minute after your instructor opens the window, say so in the room — they can mark you by hand.';
      }else{
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML='Presence not open';
        st.innerHTML=(now&&now.mod&&isHeld(sess))
          ? 'The last window (<b>'+esc(lbl())+'</b>) is <b>closed</b>. If you were in the room and missed it, tell your instructor — they can mark you from the register.'
          : 'Your instructor opens this in the room. It turns red when you can press it.';
      }
    }

    function mark(){
      var m=openMod(); if(!a||!m)return;
      var t=Date.now();
      sess=sess||{};sess.marks=sess.marks||{};sess.marks[a.sid]=t;
      paint();
      fetch(node(sesId(m,grp))+'/marks/'+encodeURIComponent(a.sid)+'.json',
        {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)})
        .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);})
        .catch(function(){st.innerHTML='Could not reach the server — tell your instructor, they can mark you by hand.';});
    }
    btn.addEventListener('click',mark);

    function pull(){
      if(document.hidden)return Promise.resolve();
      return readNow(grp).then(function(j){
        fails=0;blocked=false;scanning=false;now=j;
        var m=(j&&j.mod)?j.mod:null;
        if(!m){sess=null;return;}
        return fetch(node(sesId(m,grp))+'.json').then(function(r){return r.ok?r.json():null;})
          .then(function(k){sess=(k&&!k.error)?k:null;});
      }).then(function(){paint();})
      .catch(function(){return scan();});
    }

    /* ---- the fallback, for when `_presence_now` cannot be read ----------
       That happens exactly once: when this course's rules block has not been
       deployed yet, so the pointer is refused while the session nodes are
       not. Ask each published session of THIS GROUP in turn and take the
       first that reports itself open — fifteen small requests instead of
       one, so it is throttled to once every 20 s however often pull() runs.
       Presence is then slower, never broken.

       ⚠ This function was referenced and never defined: every failed pull
       threw a ReferenceError out of the catch, which is the opposite of a
       fallback. */
    function scan(){
      var t=Date.now();
      if(scanning||(t-lastScan)<20000){paint();return Promise.resolve();}
      scanning=true;lastScan=t;
      var list=weeks.length?weeks:allWeeks();
      return Promise.all(list.map(function(w){
        return fetch(node(sesId(w.mod,grp))+'.json').then(function(r){return r.ok?r.json():null;})
          .then(function(j){return (j&&!j.error)?{w:w,j:j}:null;},function(){return null;});
      })).then(function(rows){
        scanning=false;
        var hit=null,any=false;
        rows.forEach(function(x){
          if(!x)return; any=true;
          if(x.j.open&&!hit)hit=x;
        });
        if(!any){ if(++fails>=2)blocked=true; now=null;sess=null;paint();return; }
        fails=0;blocked=false;
        now=hit?{mod:hit.w.mod,label:hit.j.label||hit.w.name,open:true,ts:hit.j.openedAt||t}:null;
        sess=hit?hit.j:null;
        paint();
      },function(){scanning=false;if(++fails>=2)blocked=true;paint();});
    }

    paint();
    mine(el.querySelector('#hubMine'));
    pull();
    setInterval(pull,7000);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)pull();});
    return {refresh:pull};
  }

  /* ---------- a student's own running total, for the hub ----------
     Reads one session at a time rather than the whole _presence node. That
     is not an optimisation, it is the security property: the rules put
     `.read: true` on _presence/$session and NOT on _presence, so nobody can
     pull the cohort's sid list in a single request — and a sid is what makes
     <ns>/<sid> guessable. Session ids come from CourseProgress.CHAPTERS, so
     this asks only about weeks the course actually has, and only about the
     ones already published. */
  function weekMods(){
    var out=[];
    try{
      (window.CourseProgress&&CourseProgress.CHAPTERS||[]).forEach(function(c){
        if(c.live && /^w\d+$/.test(c.mod)) out.push(c.mod);
      });
    }catch(e){}
    return out;
  }
  function mine(el){
    var a=auth(); if(!el||!a)return;
    var weeks=allWeeks(); if(!weeks.length)return;   /* w1…w15 — the exam is not a session */
    /* A week the OTHER group sat is not a session this student missed, so
       every id here carries their group. */
    var grp=myGrp();
    Promise.all(weeks.map(function(w){
      return fetch(node(sesId(w.mod,grp))+'.json').then(function(r){
        return r.ok?r.json():null;
      }).catch(function(){return null;});
    })).then(function(list){
      var held=0,here=0,segs='',labs='',missed=[];
      list.forEach(function(x,i){
        var w=weeks[i];
        var run=isHeld(x&&!x.error?x:null);   /* no marks = it never happened */
        var on=run&&!!(x.marks&&x.marks[a.sid]);
        var cls,tip;
        if(!run){ cls='u'; tip=esc(w.name)+' — not held yet'; }
        else if(on){ held++;here++; cls='y'; tip=esc(w.name)+' — you were marked present'; }
        else { held++; cls='n'; missed.push(w.name); tip=esc(w.name)+' — no mark for you'; }
        segs+='<span class="pm-seg '+cls+'" title="'+tip+'"></span>';
        labs+='<span>'+w.n+'</span>';
      });
      var pct=held?Math.round(here/held*100):0;
      /* The whole term at a glance: what is behind you, what is still to come.
         A student who has missed one of two sessions is at 50% and panicking;
         seeing thirteen grey weeks ahead is the honest context for that. */
      el.innerHTML='<div class="pres-mine">'+
        '<div class="pm-h">Your presence · <b>'+here+' of '+held+'</b> '+esc(grpLabel(grp))+' session'+(held===1?'':'s')+
          ' held so far'+(held?'<span class="pm-pct '+(pct>=80?'ok':pct>=50?'mid':'low')+'">'+pct+'%</span>':'')+'</div>'+
        '<div class="pm-bar">'+segs+'</div>'+
        '<div class="pm-x">'+labs+'</div>'+
        '<div class="pm-lgd"><span><i class="y"></i>Present</span><span><i class="n"></i>Missed</span>'+
          '<span><i class="u"></i>Still to come</span></div>'+
        '<div class="pm-f">'+(!held
          ? 'No '+esc(grpLabel(grp))+' session has been held yet — the bar fills as the term goes on.'
          : (missed.length
            ? 'Not marked for: <b>'+missed.map(esc).join(' · ')+'</b>. If you were in the room, tell your instructor — they can correct the register.'
            : 'Nothing missed so far.'))+
          ' Presence is 20% of the grade, pro rata — counted only on the sessions actually held.</div></div>';
    });
  }


  /* ---------- the dashboard summary ----------
     Given the namespace root the dashboard already fetched, returns the
     sessions in week order and each student's marks. No extra request — and
     it is the INSTRUCTOR's fetch, made with a signed-in token, which is the
     only way the whole _presence node is readable at all. */
  function summary(root,grp){
    var p=(root&&root._presence)||{};
    var ids=Object.keys(p).filter(function(k){var s=p[k];return s&&(s.open||anyMarks(s));});
    function order(id){var m=/^w(\d+)/.exec(id);return m?parseInt(m[1],10):999;}
    ids.sort(function(a,b){return order(a)-order(b)||a.localeCompare(b);});
    var sessions=ids.map(function(id){
      var s=p[id]||{},n=0;
      for(var k in (s.marks||{}))n++;
      var m=/^(w\d+)(?:-(g\d+))?$/.exec(id);
      return {id:id,mod:m?m[1]:id,grp:(m&&m[2])||defGrp(),
              label:s.label||id,open:!!s.open,openedAt:s.openedAt||0,closedAt:s.closedAt||0,marks:s.marks||{},count:n};
    });
    if(grp)sessions=sessions.filter(function(x){return x.grp===grp;});
    return {sessions:sessions, held:sessions.length};
  }

  return {mount:mount, hub:hub, mine:mine, summary:summary,
          groups:groups, group:myGrp, groupLabel:grpLabel, sessionId:sesId};
})();
