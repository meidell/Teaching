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
   ===================================================================== */
window.StatsPresence = (function () {
  "use strict";
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS = "statistics";

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem('stats_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  function isInstructor(){try{return !!(window.AdminGate&&AdminGate.isUnlocked());}catch(e){return false;}}
  function node(mod){return DB+'/'+NS+'/_presence/'+encodeURIComponent(mod);}

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
    '.pres-inst{background:var(--navy);color:#fff;border-radius:14px;padding:14px 16px;margin-top:14px;}'+
    '.pres-inst .pi-t{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;}'+
    '.pres-inst .pi-d{font-size:12.5px;color:rgba(255,255,255,.85);margin:4px 0 10px;line-height:1.45;}'+
    '.pres-inst .btn{background:#fff;color:var(--navy);border:none;border-radius:30px;padding:9px 18px;font:800 13px inherit;cursor:pointer;margin-right:8px;}'+
    '.pres-inst .btn:hover{background:#FFB3AD;}'+
    '.pres-inst .btn.on{background:var(--accent);color:#fff;}'+
    '.pres-inst .names{font-size:12px;color:rgba(255,255,255,.8);margin-top:10px;line-height:1.7;max-height:120px;overflow-y:auto;}'+
    '.pres-mini{font-size:12px;color:var(--grey);}'+
    '.pres-mini b{color:var(--accent-deep);}';
    document.head.appendChild(s);
  }

  /* ---------- student + instructor widget on a week page ---------- */
  function mount(o){
    var el=o.el, mod=o.mod, label=o.label||mod;
    if(!el)return;
    css();
    var inst=isInstructor(), a=auth(), state=null, timer=null, fails=0, blocked=false;

    el.className='pres';
    el.innerHTML='<h4>Presence · this session</h4>'+
      '<div class="pd" id="presWhy">Presence is <b>20% of your grade</b>, pro rata — the share of the sessions actually held that you attended. Your instructor opens this button in the room; press it once while it is red.</div>'+
      '<button class="pres-btn" id="presBtn" disabled>Presence not open</button>'+
      '<div class="pres-state" id="presState"></div>'+
      (inst?'<div class="pres-inst" id="presInst"></div>':'');

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
        st.innerHTML=(state&&state.closedAt)
          ? 'The window for this session is <b>closed</b>. If you were in the room and missed it, tell your instructor — they can mark you from the dashboard.'
          : 'Your instructor opens this in the room. It turns red when you can press it.';
      }
      if(inst)paintInst();
    }

    function paintInst(){
      var box=el.querySelector('#presInst'); if(!box)return;
      var open=!!(state&&state.open), n=count();
      if(blocked){
        box.innerHTML='<div class="pi-t">👁 Instructor · presence control</div>'+
          '<div class="pi-d">⚠ <b>This device cannot READ the presence node.</b> Opening the window will still write, but no student button will turn red and you will see no tally, because the database rules for the <code>statistics</code> namespace deny anonymous reads. '+
          'Fix: Firebase Console → Realtime Database → Rules, and allow read on <code>statistics/_presence</code> (the repo\'s <code>firebase-database-rules.json</code> has the block ready to paste). Until then, mark the register by hand in the dashboard.</div>'+
          '<button class="btn" id="presToggle">'+(open?'■ Close the window':'▶ Open anyway')+'</button>';
        box.querySelector('#presToggle').addEventListener('click',function(){ toggle(!open); });
        return;
      }
      var names=[];
      var m=(state&&state.marks)||{};
      for(var k in m)names.push(k);
      names.sort();
      box.innerHTML='<div class="pi-t">👁 Instructor · presence control</div>'+
        '<div class="pi-d">'+(open
          ? 'The window is <b>OPEN</b> — every student\'s button is red right now. Close it when the room has marked itself.'
          : 'The window is closed. Opening it turns the button red on every student device within a few seconds.')+'</div>'+
        '<button class="btn'+(open?' on':'')+'" id="presToggle">'+(open?'■ Close the window':'▶ Open presence for this session')+'</button>'+
        '<a class="btn" href="/shared/admin.html?course=statistics#presence" target="_blank" style="text-decoration:none;display:inline-block;">Summary →</a>'+
        '<div class="names"><b>'+n+'</b> marked'+(names.length?': '+names.map(esc).join(', '):' — nobody yet')+'</div>';
      box.querySelector('#presToggle').addEventListener('click',function(){ toggle(!open); });
    }

    function toggle(on){
      if(!isInstructor())return;
      var payload={open:!!on,label:label};
      payload[on?'openedAt':'closedAt']=Date.now();
      fetch(node(mod)+'.json',{method:'PATCH',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)}).then(function(){pull();}).catch(function(){});
      state=state||{};state.open=!!on;paint();
    }

    function mark(){
      if(!a||!state||!state.open)return;
      var t=Date.now();
      state.marks=state.marks||{};state.marks[a.sid]=t;
      paint();
      fetch(node(mod)+'/marks/'+encodeURIComponent(a.sid)+'.json',
        {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)})
        .catch(function(){ st.innerHTML='Could not reach the server — tell your instructor, they can mark you by hand.'; });
    }
    btn.addEventListener('click',mark);

    function pull(){
      if(document.hidden)return;
      fetch(node(mod)+'.json').then(function(r){
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
    var mods=weekMods(); if(!mods.length)return;
    Promise.all(mods.map(function(m){
      return fetch(node(m)+'.json').then(function(r){
        return r.ok?r.json():null;
      }).catch(function(){return null;});
    })).then(function(list){
      var held=0,here=0;
      list.forEach(function(s){
        if(!s||s.error||(!s.openedAt&&!s.closedAt))return;   /* never opened = never held */
        held++; if(s.marks&&s.marks[a.sid])here++;
      });
      if(!held)return;
      el.innerHTML='<span class="pres-mini">Presence so far: <b>'+here+' of '+held+'</b> session'+(held>1?'s':'')+
        ' held ('+Math.round(here/held*100)+'%). Worth 20% of the grade, pro rata.</span>';
    });
  }

  /* ---------- the dashboard summary ----------
     Given the namespace root the dashboard already fetched, returns the
     sessions in week order and each student's marks. No extra request — and
     it is the INSTRUCTOR's fetch, made with a signed-in token, which is the
     only way the whole _presence node is readable at all. */
  function summary(root){
    var p=(root&&root._presence)||{};
    var ids=Object.keys(p).filter(function(k){var s=p[k];return s&&(s.openedAt||s.closedAt||s.open);});
    function order(id){var m=/^w(\d+)/.exec(id);return m?parseInt(m[1],10):999;}
    ids.sort(function(a,b){return order(a)-order(b)||a.localeCompare(b);});
    var sessions=ids.map(function(id){
      var s=p[id]||{},n=0;
      for(var k in (s.marks||{}))n++;
      return {id:id,label:s.label||id,open:!!s.open,openedAt:s.openedAt||0,closedAt:s.closedAt||0,marks:s.marks||{},count:n};
    });
    return {sessions:sessions, held:sessions.length};
  }

  return {mount:mount, mine:mine, summary:summary, isInstructor:isInstructor};
})();
