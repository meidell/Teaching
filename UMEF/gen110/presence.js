/* =====================================================================
   SWISS UMEF · GEN 110 Intelligence artificielle — presence, marked in the
   room.

   GEN 110: the syllabus's attendance rule (§8) is that attendance is part of
   the 10% participation mark — under 80% presence the 10% is lost, under
   50% the student may not sit the exams, two latenesses count as one
   absence. ONE class, ONE group, and one session per séance: w1…w10 (the
   module ids keep the dashboard's `w` prefix; the pages are seance1.html …
   seance10.html) — see SESSIONS below. The copy is French; the logic is
   SUMAS/mba406/presence.js unchanged. The group machinery is kept but inert. Attendance has to be
   recorded honestly, in the room, at a moment the instructor controls —
   not by opening a web page from a café.

   A renamed port of SUMAS/mba406/presence.js (namespace, session list and
   copy changed; nothing else). A fix in one should be considered for the
   other; neither is /shared/.

   HOW IT WORKS
     • The instructor opens the window for this session (from the
       dashboard). The student's button turns from grey to red and becomes
       clickable.
     • Each student presses it once. That writes their mark.
     • The instructor closes the window. Later clicks are refused.
     • The dashboard shows a column per session, immediately.

     <ns>/_presence/<sessionId>            sessionId = the week's module id
        open      true while the window is accepting marks
        label     'Week 2 · Time value of money'
        openedAt  / closedAt   timestamps
        marks/<sid> = ts       one per student who pressed the button

   Marks live under `_presence`, not under the student's own node, because
   the whole point is a summary the instructor reads in one request — and
   because a student must not be able to quietly grant themselves presence
   for a session that never opened. The deployed rules refuse a mark on a
   session that is not open; the gate here is the `open` flag.

     StatsPresence.mount({el, mod, label})   student button on a week page
     StatsPresence.hub(el)                   the card on the course hub
     StatsPresence.summary(root)             {sessions:[…], byStudent:{…}}

   The subgroup machinery (sesId, _presence_now per group) is inherited from
   HEG/statistics and inert here: with one group every session keeps the
   bare module id and `_presence_now` is read as the default group's pointer.
   ===================================================================== */
window.StatsPresence = (function () {
  "use strict";
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS = "gen110";
  /* copy in both languages — T() from lang.js picks the page's */
  var T=window.T||function(fr,en){return fr;};
  var LOC=T('fr-CH','en-GB');

  /* Kept here as well as in /shared/config.js and /courses.json because this
     file is loaded BEFORE config.js on the hub — CourseConfig is preferred
     when it happens to be there. Three copies is two too many; if you add a
     group, change all three. */
  var GROUPS=[{id:'g1',label:'Class',short:'Class',n:1}];   /* one class */
  function groups(){
    try{
      var c=window.CourseConfig&&CourseConfig.get&&CourseConfig.get('gen110');
      if(c&&c.groups&&c.groups.length)return c.groups;
    }catch(e){}
    return GROUPS;
  }
  function defGrp(){return groups()[0].id;}
  function grpOf(id){var G=groups();for(var i=0;i<G.length;i++)if(G[i].id===id)return G[i];return G[0];}
  function grpLabel(id){var g=grpOf(id);return g?(g.label||g.id):'';}
  /* one group → no group talk anywhere on the page */
  function multi(){return groups().length>1;}

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem('gen110_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
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
     window on `w2-g2`, 16 Sep 2026, painted week 1B red for the whole
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
      'font:800 15px inherit;cursor:pointer;transition:.2s;background:var(--wash,#EDE4D3);color:#98A2AD;}'+
    '.pres-btn:disabled{cursor:not-allowed;}'+
    '.pres-btn.live{background:var(--accent);color:#fff;box-shadow:0 8px 22px -8px rgba(74,139,58,.7);cursor:pointer;}'+
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
    '.pres-mine .pm-pct.ok{background:rgba(47,133,90,.14);color:var(--ok,#2F855A);}'+
    '.pres-mine .pm-pct.mid{background:rgba(201,151,28,.16);color:#8A6A12;}'+
    '.pres-mine .pm-pct.low{background:rgba(74,139,58,.12);color:var(--accent);}'+
    '.pres-mine .pm-bar{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;margin:10px 0 3px;}'+
    '.pres-mine .pm-seg{height:15px;border-radius:3px;background:var(--wash,#F1EADB);}'+
    '.pres-mine .pm-seg.y{background:var(--ok,#2F855A);}'+
    '.pres-mine .pm-seg.n{background:var(--accent);}'+
    '.pres-mine .pm-seg.u{background:repeating-linear-gradient(45deg,var(--wash,#F1EADB),var(--wash,#F1EADB) 4px,var(--line,#EAE0CC) 4px,var(--line,#EAE0CC) 8px);}'+
    '.pres-mine .pm-x{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;font-size:9px;'+
      'color:var(--grey);text-align:center;letter-spacing:-.02em;}'+
    '.pres-mine .pm-lgd{display:flex;gap:14px;flex-wrap:wrap;margin:9px 0 6px;font-size:11px;color:var(--grey);}'+
    '.pres-mine .pm-lgd i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px;}'+
    '.pres-mine .pm-lgd i.y{background:var(--ok,#2F855A);}'+
    '.pres-mine .pm-lgd i.n{background:var(--accent);}'+
    '.pres-mine .pm-lgd i.u{background:repeating-linear-gradient(45deg,var(--wash,#F1EADB),var(--wash,#F1EADB) 3px,var(--line,#EAE0CC) 3px,var(--line,#EAE0CC) 6px);}'+
    '.pres-mine .pm-f{font-size:11.5px;}'+
    '.pres-grp{display:inline-block;margin-left:8px;background:var(--navy,#2C5530);color:#fff;border-radius:20px;'+
      'padding:2px 9px;font-size:10px;letter-spacing:1px;font-weight:800;vertical-align:1px;}'+
    '.pres-mini b{color:var(--accent-deep);}'+
    /* the component owns both themes: this card is drawn onto the hub, which
       has no stylesheet of its own to hang a dark rule off */
    ':root[data-theme="dark"] .pres-grp{background:transparent;border:1px solid var(--navy);color:var(--navy);}'+
    ':root[data-theme="dark"] .pres-btn:disabled{background:var(--wash);color:var(--grey);}'+
    ':root[data-theme="dark"] .pres-mine .pm-pct.mid{background:rgba(232,192,90,.16);color:#E8C05A;}';
    document.head.appendChild(s);
  }


  /* ---------- which window is open, for students ----------------------
     Students cannot list `_presence` — the rules put `.read: true` on
     `_presence/$session` and NOT on the parent, so nobody can pull the
     cohort's sid list in one request. That leaves them unable to DISCOVER
     which session is accepting marks, so the instructor writes a one-line
     public pointer as well:

        gen110/_presence_now = { mod, label, open, ts }

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
  /* w1…w15 — the fifteen taught sessions. Week 10 is the exam and is not
     marked here. Names come from CourseProgress so one list serves the
     dropdown, the student's running total and the dashboard alike. */
  /* The register's sessions: one per SUMAS teaching week, one page each
     (MBA406 has no A/B parts). The final exam (Week 10) is not a session. */
  var SESSIONS=[
    {mod:'w1', n:1, name:T('Séance 1 · Qu’est-ce que l’IA ?','Session 1 · What is AI?'),                 pages:['w1']},
    {mod:'w2', n:2, name:T('Séance 2 · Comment une machine apprend','Session 2 · How a machine learns'),          pages:['w2']},
    {mod:'w3', n:3, name:T('Séance 3 · Classer, se tromper, être biaisé','Session 3 · Classifying, erring, being biased'),     pages:['w3']},
    {mod:'w4', n:4, name:T('Séance 4 · Réseaux de neurones','Session 4 · Neural networks'),                  pages:['w4']},
    {mod:'w5', n:5, name:T('Séance 5 · IA générative I — le langage','Session 5 · Generative AI I — language'),         pages:['w5']},
    {mod:'w6', n:6, name:T('Séance 6 · IA générative II — images, agents','Session 6 · Generative AI II — images, agents'),    pages:['w6']},
    {mod:'w7', n:7, name:T('Séance 7 · L’IA dans les métiers','Session 7 · AI in the professions'),                pages:['w7']},
    {mod:'w8', n:8, name:T('Séance 8 · Éthique, droit et société','Session 8 · Ethics, law and society'),            pages:['w8']},
    {mod:'w9', n:9, name:T('Séance 9 · Mettre l’IA en œuvre','Session 9 · Putting AI to work'),                 pages:['w9']},
    {mod:'w10',n:10,name:T('Séance 10 · Présentations et révision','Session 10 · Presentations and revision'),           pages:['w10']}
  ];
  function allWeeks(){ return SESSIONS.slice(); }

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
    el.innerHTML='<h4>'+T('Présence · cette séance','Attendance · this session')+(a&&multi()?' <span class="pres-grp">'+esc(grpLabel(grp))+'</span>':'')+'</h4>'+
      '<div class="pd" id="presWhy">'+T('La présence fait partie de la <b>note de participation</b> (10 % de la note) : en dessous de <b>80 % de présence</b>, ces 10 % sont perdus ; en dessous de <b>50 %</b>, vous ne pouvez pas vous présenter à l’examen. Deux retards comptent pour une absence. Votre enseignant ouvre ce bouton dans la salle ; appuyez une fois pendant qu’il est rouge.',
        'Attendance is part of the <b>participation mark</b> (10% of the grade): below <b>80% attendance</b> those 10% are lost; below <b>50%</b> you cannot sit the exam. Two latenesses count as one absence. Your teacher opens this button in the room; press it once while it is red.')+
      (a&&multi()?T(' Vous êtes dans le groupe <b>','You are in group <b>')+esc(grpLabel(grp))+T('</b> : seule la fenêtre de cette séance le rend rouge.','</b>: only that group’s window turns it red.'):'')+'</div>'+
      '<button class="pres-btn" id="presBtn" disabled>'+T('Présence non ouverte','Attendance not open')+'</button>'+
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
        btn.innerHTML=T('✓ Vous êtes marqué·e présent·e','✓ You are marked present');
        st.innerHTML=T('Enregistré à <b>','Recorded at <b>')+new Date(state.marks[a.sid]).toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit'})+T('</b>. Rien d’autre à faire.','</b>. Nothing else to do.');
      }else if(!a){
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML=T('🔒 Connectez-vous d’abord','🔒 Sign in first');
        st.innerHTML=T('La présence est rattachée à votre nom : il faut être connecté·e. Utilisez le bouton en bas à droite de la page, puis revenez ici.','Attendance is tied to your name: you need to be signed in. Use the button at the bottom right of the page, then come back here.');
      }else if(open){
        btn.className='pres-btn live';btn.disabled=false;btn.innerHTML=T('✋ Je suis là — marquer ma présence','✋ I’m here — mark my attendance');
        st.innerHTML=T('La fenêtre est <b>ouverte</b>. Appuyez sur le bouton.','The window is <b>open</b>. Press the button.');
      }else if(blocked){
        /* The button can never turn red if we cannot read the session, so say
           so rather than looking like a closed window. This is what a student
           sees if the database rules block reads for this course. */
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML=T('⚠ Registre inaccessible','⚠ Register unreachable');
        st.innerHTML=T('Cet appareil ne parvient pas à lire la fenêtre de présence sur le serveur ; le bouton ne deviendra pas rouge. <b>Dites-le tout de suite à votre enseignant</b> — il peut vous marquer depuis le tableau de bord, et le problème concerne tout le monde.',
          'This device cannot read the attendance window on the server, so the button will not turn red. <b>Tell your teacher right away</b> — they can mark you from the dashboard, and the problem affects everyone.');
      }else{
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML=T('Présence non ouverte','Attendance not open');
        /* Only say "you missed it" about a session that actually happened.
           A closed window nobody was marked at was opened by mistake, and
           telling thirty people they were absent from it is a message they
           will act on. */
        st.innerHTML=isHeld(state)
          ? T('La fenêtre de cette séance est <b>fermée</b>. Si vous étiez dans la salle et l’avez manquée, dites-le à votre enseignant — il peut vous marquer depuis le tableau de bord.','This session’s window is <b>closed</b>. If you were in the room and missed it, tell your teacher — they can mark you from the dashboard.')
          : T('Votre enseignant l’ouvre dans la salle. Le bouton devient rouge quand vous pouvez appuyer.','Your teacher opens it in the room. The button turns red when you can press it.');
      }
    }

    function mark(){
      if(!a||!state||!state.open)return;
      var t=Date.now();
      state.marks=state.marks||{};state.marks[a.sid]=t;
      paint();
      fetch(node(ses)+'/marks/'+encodeURIComponent(a.sid)+'.json',
        {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)})
        .catch(function(){ st.innerHTML=T('Serveur injoignable — dites-le à votre enseignant, il peut vous marquer à la main.','Server unreachable — tell your teacher, they can mark you by hand.'); });
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
      '<h4>'+T('Présence · cette séance','Attendance · this session')+(a&&multi()?' <span class="pres-grp">'+esc(grpLabel(grp))+'</span>':'')+'</h4>'+
      '<div class="pd">'+T('La présence fait partie de la <b>note de participation</b> (10 % de la note) : en dessous de <b>80 % de présence</b>, ces 10 % sont perdus ; en dessous de <b>50 %</b>, vous ne pouvez pas vous présenter à l’examen. Deux retards comptent pour une absence. Votre enseignant ouvre la fenêtre dans la salle ; appuyez une fois pendant qu’il est rouge.',
        'Attendance is part of the <b>participation mark</b> (10% of the grade): below <b>80% attendance</b> those 10% are lost; below <b>50%</b> you cannot sit the exam. Two latenesses count as one absence. Your teacher opens the window in the room; press once while the button is red.')+
      (a&&multi()?T(' Vous êtes dans le groupe <b>','You are in group <b>')+esc(grpLabel(grp))+T('</b> — seule la fenêtre de cette salle ouvre ce bouton.','</b> — only that room’s window opens this button.'):'')+'</div>'+
      '<button class="pres-btn" id="hubBtn" disabled>'+T('Présence non ouverte','Attendance not open')+'</button>'+
      '<div class="pres-state" id="hubState"></div>'+
      '<div id="hubMine"></div>'+
      '';
    var btn=el.querySelector('#hubBtn'), st=el.querySelector('#hubState');

    function openMod(){return (now&&now.open&&now.mod)?now.mod:null;}
    function marked(){return !!(a&&sess&&sess.marks&&sess.marks[a.sid]);}
    function lbl(){return (now&&now.label)?now.label:T('cette séance','this session');}

    function paint(){
      var m=openMod();
      if(marked()){
        btn.className='pres-btn marked';btn.disabled=true;
        btn.innerHTML=T('✓ Vous êtes marqué·e présent·e','✓ You are marked present');
        st.innerHTML=T('Enregistré à <b>','Recorded at <b>')+new Date(sess.marks[a.sid]).toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit'})+
          T('</b> pour <b>','</b> for <b>')+esc(lbl())+T('</b>. Rien d’autre à faire.','</b>. Nothing else to do.');
      }else if(!a){
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML=T('🔒 Connectez-vous d’abord','🔒 Sign in first');
        st.innerHTML=T('La présence est rattachée à votre nom : il faut être connecté·e. Utilisez le bouton en bas à droite de la page, puis revenez ici.','Attendance is tied to your name: you need to be signed in. Use the button at the bottom right of the page, then come back here.');
      }else if(m){
        btn.className='pres-btn live';btn.disabled=false;
        btn.innerHTML=T('✋ Je suis là — marquer ma présence','✋ I’m here — mark my attendance');
        st.innerHTML=T('La fenêtre est <b>ouverte</b> pour <b>','The window is <b>open</b> for <b>')+esc(lbl())+T('</b>. Appuyez sur le bouton.','</b>. Press the button.');
      }else if(blocked){
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML=T('Présence non ouverte','Attendance not open');
        st.innerHTML=T('Cet appareil n’atteint pas le registre pour l’instant. Si le bouton n’est pas devenu rouge une minute après l’ouverture de la fenêtre, dites-le dans la salle — votre enseignant peut vous marquer à la main.','This device cannot reach the register right now. If the button has not turned red a minute after the window opened, say so in the room — your teacher can mark you by hand.');
      }else{
        btn.className='pres-btn';btn.disabled=true;btn.innerHTML=T('Présence non ouverte','Attendance not open');
        st.innerHTML=(now&&now.mod&&isHeld(sess))
          ? T('La dernière fenêtre (<b>','The last window (<b>')+esc(lbl())+T('</b>) est <b>fermée</b>. Si vous étiez dans la salle et l’avez manquée, dites-le à votre enseignant — il peut corriger le registre.','</b>) is <b>closed</b>. If you were in the room and missed it, tell your teacher — they can correct the register.')
          : T('Votre enseignant l’ouvre dans la salle. Le bouton devient rouge quand vous pouvez appuyer.','Your teacher opens it in the room. The button turns red when you can press it.');
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
        .catch(function(){st.innerHTML=T('Serveur injoignable — dites-le à votre enseignant, il peut vous marquer à la main.','Server unreachable — tell your teacher, they can mark you by hand.');});
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
    var live={};
    try{(window.CourseProgress&&CourseProgress.CHAPTERS||[]).forEach(function(c){if(c.live)live[c.mod]=1;});}catch(e){}
    return SESSIONS.filter(function(s){return s.pages.some(function(p){return live[p];});}).map(function(s){return s.mod;});
  }

  function mine(el){
    var a=auth(); if(!el||!a)return;
    var weeks=allWeeks(); if(!weeks.length)return;   /* w1…w9 — the exam is not a session */
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
        if(!run){ cls='u'; tip=esc(w.name)+T(' — pas encore tenue',' — not held yet'); }
        else if(on){ held++;here++; cls='y'; tip=esc(w.name)+T(' — présent·e',' — present'); }
        else { held++; cls='n'; missed.push(w.name); tip=esc(w.name)+T(' — aucune marque pour vous',' — no mark for you'); }
        segs+='<span class="pm-seg '+cls+'" title="'+tip+'"></span>';
        labs+='<span>'+w.n+'</span>';
      });
      var pct=held?Math.round(here/held*100):0;
      /* The whole term at a glance: what is behind you, what is still to come.
         A student who has missed one of two sessions is at 50% and panicking;
         seeing thirteen grey weeks ahead is the honest context for that. */
      var EN=T('fr','en')==='en';
      el.innerHTML='<div class="pres-mine">'+
        '<div class="pm-h">'+(EN
          ? 'Your attendance · <b>'+here+' of '+held+'</b> session'+(held===1?'':'s')+' held so far'
          : 'Votre présence · <b>'+here+' sur '+held+'</b> séance'+(held===1?'':'s')+' tenue'+(held===1?'':'s')+' jusqu’ici')+
          (held?'<span class="pm-pct '+(pct>=80?'ok':pct>=50?'mid':'low')+'">'+pct+'%</span>':'')+'</div>'+
        '<div class="pm-bar">'+segs+'</div>'+
        '<div class="pm-x">'+labs+'</div>'+
        '<div class="pm-lgd"><span><i class="y"></i>'+T('Présent·e','Present')+'</span><span><i class="n"></i>'+T('Manquée','Missed')+'</span>'+
          '<span><i class="u"></i>'+T('À venir','Upcoming')+'</span></div>'+
        '<div class="pm-f">'+(!held
          ? T('Aucune séance n’a encore été tenue — la barre se remplit au fil du semestre.','No session has been held yet — the bar fills as the semester goes on.')
          : (missed.length
            ? T('Aucune marque pour : <b>','No mark for: <b>')+missed.map(esc).join(' · ')+T('</b>. Si vous étiez dans la salle, dites-le à votre enseignant — il peut corriger le registre.','</b>. If you were in the room, tell your teacher — they can correct the register.')
            : T('Rien de manqué jusqu’ici.','Nothing missed so far.')))+
          T(' Rappel : moins de 80 % de présence et la note de participation (10 %) est perdue ; moins de 50 % et l’examen est fermé.',' Reminder: below 80% attendance the participation mark (10%) is lost; below 50% the exam is closed.')+'</div></div>';
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
