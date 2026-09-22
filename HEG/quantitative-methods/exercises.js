/* =====================================================================
   HEG · Quantitative Methods I — the in-class exercise engine.

   A 3-hour session is two parts. Part 1 (~1 h) is the lesson: the
   instructor presents the deck, the class follows the same numbered
   sections on the site. Part 2 (~2 h) is exercises worked together:
   the SAME exercise appears on the slide and as a form on the site, and
   the solution is released by the instructor, exercise by exercise.

   ONE array is the source of truth for all three surfaces, so they
   cannot drift:

       var EXERCISES=[{ id:'e1', mins:8, pts:4,
         title:'…',  brief:'<p>HTML</p>',  data:'12 14 15…',
         asks:[{label:'mean', ans:17, tol:0.05, unit:'CHF'}],   // numeric
         // …or: choice:['a','b','c'], correct:1
         hint:'…', sol:'<p>worked solution</p>' }];

       QMEx.mount({el, mod, exercises:EXERCISES, progress, save, markStep, markSection, secId})
       QMEx.slides(EXERCISES, {week:1})   →  slide objects for the deck
       QMEx.wireSlide(slideEl)            →  called by the deck renderer

   ---------------------------------------------------------------------
   WHO SEES THE SOLUTION
   ---------------------------------------------------------------------
   The instructor's device is the one where the shared instructor gate is
   unlocked (AdminGate.isUnlocked() — localStorage jem_admin_pw, the same
   unlock as the dashboards). On that device, and only there:
     • every solution is in the speaker notes from the start;
     • the slide's "Show solution" button works, and clicking it also
       writes the release flag;
     • the site shows solutions immediately, marked as instructor-only.
   On a student device the solution text is never rendered into the deck
   at all, and the site's Solution button stays locked until the release
   flag appears. Released exercises stay released — afterwards the whole
   set is open for revision.

     <ns>/_release/<mod>/<exId> = ts        instructor → cohort

   This is a soft gate on a soft flag, exactly like the rest of the
   instructor UI in this repo: it stops a student reading ahead in class,
   it is not security. Nothing secret goes in an exercise solution.

   ---------------------------------------------------------------------
   WHAT IT WRITES
   ---------------------------------------------------------------------
     <ns>/<sid>/mod/<mod>/ex/<id> = {a:<answer>, c:1|0, ts}
   Module-scoped, like the classify results — NOT work/, which is the
   graded project workbook. The dashboard reads it as classwork.
   ===================================================================== */
window.QMEx = (function () {
  "use strict";
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS = "qm1";

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem('qm1_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  /* The gate is per DEVICE (localStorage jem_admin_pw), not per account —
     so once it is unlocked every page shows the instructor view whoever is
     signed in. That makes it impossible to check what students actually
     see, which is exactly the check you want to make before a session.
     PREVIEW lets the instructor drop to the student view without forgetting
     the password. sessionStorage, so a fresh tab is the instructor again. */
  var PREVIEW_KEY='qm1_view_as_student';
  function previewing(){try{return sessionStorage.getItem(PREVIEW_KEY)==='1';}catch(e){return false;}}
  function setPreview(on){
    try{on?sessionStorage.setItem(PREVIEW_KEY,'1'):sessionStorage.removeItem(PREVIEW_KEY);}catch(e){}
    notify();
  }
  function gateUnlocked(){try{return !!(window.AdminGate&&AdminGate.isUnlocked());}catch(e){return false;}}
  function isInstructor(){return gateUnlocked()&&!previewing();}

  /* ---------- release state ---------------------------------------- */
  var released = {};          /* {mod:{exId:ts}} — what the cohort may see */
  var listeners = [];         /* redraw hooks, called when it changes */
  /* Namespaced per course: a student with this course and Applied
     Statistics open in the same browser must not share a release
     cache — the module ids (w1, w1-hw…) are identical in both. */
  function relKey(mod){return 'qm1_release_'+mod;}
  function loadReleaseLocal(mod){
    try{released[mod]=JSON.parse(localStorage.getItem(relKey(mod))||'{}');}catch(e){released[mod]={};}
  }
  function saveReleaseLocal(mod){
    try{localStorage.setItem(relKey(mod),JSON.stringify(released[mod]||{}));}catch(e){}
  }
  /* `_all` is a whole-module release: one switch in the dashboard opens
     every solution in that module at once. It is what the homework pages
     use (a homework set is released as a set, not problem by problem) and
     it works for exercises too, so the instructor can open the lot when
     the room has finished rather than clicking eight times. */
  var ALL='_all';
  function isReleased(mod,id){
    if(isInstructor())return true;                     /* you always see it */
    var r=released[mod];
    return !!(r&&(r[ALL]||r[id]));
  }
  function notify(){listeners.forEach(function(f){try{f();}catch(e){}});}

  /* instructor → cohort. Fire-and-forget; the local flag flips regardless,
     so a reveal still works with no network in the room. */
  /* ⚠ THE WRITE NEEDS AN ACCOUNT, NOT THE GATE — the same lesson presence
     learned the hard way. The deployed rules make `_release` writable only
     by a signed-in instructor token, and this page has no Firebase SDK and
     no signed-in account, so these PUTs come back 401. They used to be
     `.catch(function(){})`: the button said "✓ Revealed", the local copy
     unlocked for the instructor, and NOT ONE STUDENT EVER SAW IT. That is
     a failure you discover in front of thirty people.

     So the write is now reported. On failure the caller is told, and the
     honest instruction is to use the dashboard's Solutions tab, which is
     signed in and can write. Local state is only updated once the server
     has actually accepted it. */
  var relErr=null;
  function releaseError(){return relErr;}

  /* The gate decides what this device SHOWS; the account is what the database
     TRUSTS. `_release` is instructor-token-only, so the write needs a signed-in
     account — ported from HEG/statistics/exercises.js, which learned it first.
     FBAuth picks the session up silently from IndexedDB, so the password is
     typed once per laptop on any instructor page, not once per class. The token
     is minted per write: a session is three hours, a token lasts one. */
  function token(){
    if(!window.FBAuth||!FBAuth.restore)return Promise.resolve(null);
    return new Promise(function(res){
      var settled=false;
      setTimeout(function(){if(!settled){settled=true;res(null);}},6000);
      try{
        FBAuth.restore(function(u){
          if(settled)return; settled=true;
          if(!u||!u.getIdToken){res(null);return;}
          u.getIdToken().then(function(t){res(t||null);},function(){res(null);});
        });
      }catch(e){if(!settled){settled=true;res(null);}}
    });
  }
  var SIGNIN_MSG='This device is not signed in, so it cannot release to the class. '+
    'Open the dashboard (/shared/admin2.html?course=qm1), sign in with the instructor '+
    'account once, then come back — or release the whole session from its Solutions tab.';

  /* ⚠ ONE PUT PER EXERCISE, not one PATCH at the module node. The rules grant
     .write at _release/$mod/$ex and nowhere above it, so a PUT at that exact
     path is the write the rule was written for. */
  function pushRelease(mod,patch){
    var ids=Object.keys(patch);
    return token().then(function(t){
      if(!t){relErr=SIGNIN_MSG;notify();return false;}
      var q='.json?auth='+encodeURIComponent(t);
      return Promise.all(ids.map(function(id){
        return fetch(DB+'/'+NS+'/_release/'+encodeURIComponent(mod)+'/'+encodeURIComponent(id)+q,
          {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch[id])})
          .then(function(r){
            if(!r.ok)throw new Error('HTTP '+r.status);
            return r.json().catch(function(){return null;});
          }).then(function(j){
            if(j&&j.error)throw new Error(j.error);
            return id;
          });
      })).then(function(){
        /* only now is it true */
        if(!released[mod])released[mod]={};
        for(var k in patch)released[mod][k]=patch[k];
        saveReleaseLocal(mod);relErr=null;notify();
        return true;
      });
    }).catch(function(e){
      var m=String((e&&e.message)||e);
      relErr=(m.indexOf('401')>=0||m.indexOf('403')>=0)
        ? 'The database refused the release ('+m+'). The signed-in account is not an '+
          'instructor account, or the rules for qm1/_release are not deployed.'
        : 'Could not reach the database ('+m+'). Nothing was released.';
      notify();
      return false;
    });
  }
  function release(mod,id){
    if(!isInstructor())return Promise.resolve(false);
    var p={};p[id]=Date.now();
    return pushRelease(mod,p);
  }
  function releaseAll(mod,ids){
    if(!isInstructor())return Promise.resolve(false);
    var now=Date.now(),body={};
    ids.forEach(function(id){body[id]=now;});
    return pushRelease(mod,body);
  }
  /* students: poll while the tab is visible. 8s is fast enough that the
     room unlocks together, cheap enough to leave running for two hours. */
  var polling=false, relFails=0, relBlocked=false;
  function releaseBlocked(){return relBlocked;}
  function startPolling(mod){
    if(polling||isInstructor())return; polling=true;
    function tick(){
      if(document.hidden)return;
      fetch(DB+'/'+NS+'/_release/'+encodeURIComponent(mod)+'.json')
        .then(function(r){ if(!r.ok)throw new Error('HTTP '+r.status); return r.json(); })
        .then(function(o){
          if(o&&o.error)throw new Error(o.error);
          relFails=0; if(relBlocked){relBlocked=false;notify();}
          if(!o)return;
          var changed=false;
          if(!released[mod])released[mod]={};
          for(var k in o){if(o[k]&&!released[mod][k]){released[mod][k]=o[k];changed=true;}}
          if(changed){saveReleaseLocal(mod);notify();}
        }).catch(function(){
          /* If we cannot read the release node the solution button would stay
             locked for ever with no explanation. Say so instead. */
          if(++relFails>=2&&!relBlocked){relBlocked=true;notify();}
        });
    }
    tick(); setInterval(tick,8000);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)tick();});
  }

  /* ---------- answer recording ------------------------------------- */
  function record(mod,id,answer,ok){
    var a=auth(); if(!a)return;
    try{fetch(DB+'/'+NS+'/'+a.sid+'/mod/'+encodeURIComponent(mod)+'/ex/'+encodeURIComponent(id)+'.json',
      {method:'PUT',headers:{'Content-Type':'application/json'},
       body:JSON.stringify({a:answer,c:ok?1:0,ts:Date.now()})}).catch(function(){});}catch(e){}
  }

  /* ---------- the site form ---------------------------------------- */
  /* opts: {el, mod, exercises, progress, save, markStep, markSection, secId, week} */
  function mount(opts){
    var EX=opts.exercises, mod=opts.mod, root=opts.el;
    if(!root||!EX||!EX.length)return;
    loadReleaseLocal(mod); startPolling(mod);
    var inst=isInstructor();
    var KEY='qm1_ex_'+mod;
    var state={}; try{state=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){}
    function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}

    /* instructor strip — reveal from the site as well as from the deck,
       because in a computer room the deck is not always the front screen */
    if(inst){
      var strip=document.createElement('div');strip.className='ex-inst';
      strip.innerHTML='<span class="ei-t">👁 Instructor view</span>'+
        '<span class="ei-d">Solutions below are visible <b>to you only</b> — a student device shows none of this. '+
          'Releasing writes to the class register and needs the dashboard\'s signed-in account.</span>'+
        '<button class="btn small" id="exRelAll">Release all '+EX.length+'</button>'+
        '<button class="btn small ghost" id="exPrev">View as student</button>'+
        '<span class="ei-msg" id="exRelMsg"></span>';
      root.appendChild(strip);
      var msg=strip.querySelector('#exRelMsg');
      strip.querySelector('#exRelAll').addEventListener('click',function(){
        if(!confirm('Release all '+EX.length+' solutions to the class?'))return;
        var b=this;b.disabled=true;b.textContent='Releasing…';
        releaseAll(mod,EX.map(function(x){return x.id;})).then(function(ok){
          b.disabled=false;b.textContent='Release all '+EX.length;
          msg.className='ei-msg '+(ok?'ok':'bad');
          msg.innerHTML=ok?'✓ Released to the class.':('⚠ '+releaseError());
        });
      });
      /* drop to the student view without forgetting the password — the only
         way to check what the class actually sees before a session */
      strip.querySelector('#exPrev').addEventListener('click',function(){
        setPreview(true);location.reload();
      });
    }else if(gateUnlocked()&&previewing()){
      /* previewing: say so loudly, or you will forget and think the gate broke */
      var pv=document.createElement('div');pv.className='ex-inst prev';
      pv.innerHTML='<span class="ei-t">🎓 Student view</span>'+
        '<span class="ei-d">You are an instructor previewing what the class sees. Solutions are hidden exactly as they are for them.</span>'+
        '<button class="btn small" id="exPrevOff">Back to instructor view</button>';
      root.appendChild(pv);
      pv.querySelector('#exPrevOff').addEventListener('click',function(){
        setPreview(false);location.reload();
      });
    }

    var cards={};
    EX.forEach(function(x,i){
      var n=i+1;
      var c=document.createElement('div');c.className='exq';c.id='ex-'+x.id;
      var meta='<span class="exn">Exercise '+n+'</span>'+
        (x.mins?'<span class="exm">'+x.mins+' min</span>':'')+
        (x.pts?'<span class="exm">'+x.pts+' pt'+(x.pts>1?'s':'')+'</span>':'');
      var body='<div class="exh">'+meta+'<h4>'+x.title+'</h4></div>'+
               '<div class="exb">'+x.brief+'</div>'+
               (x.data?'<div class="exdata">'+x.data+'</div>':'');
      if(x.asks){
        body+='<div class="fields">'+x.asks.map(function(f,j){
          return '<div class="field"><label>'+esc(f.label)+'</label><div class="inwrap">'+
                 '<input type="text" inputmode="decimal" data-f="'+j+'">'+
                 (f.unit?'<span class="unit">'+esc(f.unit)+'</span>':'')+
                 '<span class="mark" data-m="'+j+'"></span></div></div>';}).join('')+'</div>';
      }else if(x.choice){
        body+='<div class="opts">'+x.choice.map(function(o,j){
          return '<button class="opt" data-o="'+j+'">'+o+'</button>';}).join('')+'</div>';
      }else if(x.open){
        body+='<textarea class="exopen" rows="3" placeholder="'+esc(x.open)+'"></textarea>';
      }
      body+='<div class="exbtns">'+
            (x.asks||x.choice?'<button class="btn small" data-act="check">Check</button>':'')+
            (x.hint?'<button class="btn ghost small" data-act="hint">Hint</button>':'')+
            '<button class="btn dim small" data-act="sol"></button>'+
            (inst?'<button class="btn small ei-rel" data-act="release">Reveal to class</button>':'')+
            '</div><div class="exfb" data-fb></div>';
      c.innerHTML=body;
      root.appendChild(c);
      cards[x.id]=c;
      wireCard(c,x,n);
    });

    function solBtnLabel(x){
      if(inst)return '📘 Solution (yours)';
      return isReleased(mod,x.id)?'📘 Show solution':'🔒 Solution';
    }
    function refresh(){
      EX.forEach(function(x){
        var c=cards[x.id],b=c.querySelector('[data-act="sol"]');
        b.textContent=solBtnLabel(x);
        b.classList.toggle('locked',!inst&&!isReleased(mod,x.id));
        var rb=c.querySelector('.ei-rel');
        if(rb){var done=!!(released[mod]&&released[mod][x.id]);rb.textContent=done?'✓ Released':'Reveal to class';rb.classList.toggle('ghost',done);}
      });
    }
    listeners.push(refresh);

    function wireCard(c,x,n){
      var fb=c.querySelector('[data-fb]'), chosen=null;
      var st=state[x.id]||(state[x.id]={});
      /* replay a previous attempt */
      if(x.asks&&st.v){x.asks.forEach(function(f,j){var el=c.querySelector('input[data-f="'+j+'"]');if(el&&st.v[j]!=null)el.value=st.v[j];});}
      if(x.choice&&st.pick!=null){chosen=st.pick;var b=c.querySelector('.opt[data-o="'+st.pick+'"]');if(b)b.classList.add('sel');}
      if(x.open&&st.txt){var ta=c.querySelector('.exopen');if(ta)ta.value=st.txt;}
      if(st.ok){c.classList.add('solved');}

      c.querySelectorAll('.opt').forEach(function(b){b.addEventListener('click',function(){
        c.querySelectorAll('.opt').forEach(function(x2){x2.classList.remove('sel');});
        b.classList.add('sel');chosen=parseInt(b.dataset.o,10);st.pick=chosen;persist();});});
      var ta=c.querySelector('.exopen');
      if(ta)ta.addEventListener('input',function(){st.txt=ta.value;persist();
        if(opts.markStep)opts.markStep('ex-'+x.id,!!ta.value.trim());
        if(ta.value.trim()&&!st.ok){st.ok=true;persist();done();}});

      function show(cls,html){fb.className='exfb show '+cls;fb.innerHTML=html;}
      function done(){
        c.classList.add('solved');
        if(opts.markStep)opts.markStep('ex-'+x.id);
        if(opts.markSection&&opts.secId){
          var all=EX.every(function(y){return (state[y.id]||{}).ok;});
          if(all)opts.markSection(opts.secId);
        }
      }
      c.querySelectorAll('[data-act]').forEach(function(btn){btn.addEventListener('click',function(){
        var act=btn.dataset.act;
        if(act==='release'){release(mod,x.id);return;}
        if(act==='hint'){show('hint','💡 <b>Hint.</b> '+x.hint);return;}
        if(act==='sol'){
          if(!inst&&!isReleased(mod,x.id)){
            show('hint', releaseBlocked()
              ? '⚠ <b>This device cannot reach the solutions server</b>, so this button will not unlock on its own. Tell your instructor — they can read the solution out, and it needs fixing for everyone.'
              : '🔒 <b>Not yet.</b> We do this one together — the solution opens when your instructor reveals it in class. Try it, take the hint, and check your answer meanwhile.');
            return;
          }
          show('sol',(inst?'<span class="ei-tag">instructor view</span>':'')+'📘 <b>Solution.</b> '+x.sol);
          return;
        }
        /* check */
        if(x.asks){
          var allok=true,vals=[];
          x.asks.forEach(function(f,j){
            var inp=c.querySelector('input[data-f="'+j+'"]'),mk=c.querySelector('[data-m="'+j+'"]');
            var raw=(inp.value||'').replace(',','.'),v=parseFloat(raw);
            vals[j]=inp.value;
            var ok=!isNaN(v)&&Math.abs(v-f.ans)<=(f.tol==null?0.01:f.tol);
            inp.classList.toggle('ok',ok);inp.classList.toggle('no',!ok);
            mk.textContent=ok?'✓':'✗';mk.style.color=ok?'var(--ok)':'var(--no)';
            if(!ok)allok=false;
          });
          st.v=vals;persist();
          if(allok){show('good','✅ <b>Correct.</b>');if(!st.ok){st.ok=true;persist();done();}record(mod,x.id,vals.join(' | '),true);}
          else {show('bad','❌ Not yet. Re-check the arithmetic, or take the hint.');record(mod,x.id,vals.join(' | '),false);}
        }else if(x.choice){
          if(chosen==null){show('hint','Pick an option first.');return;}
          c.querySelectorAll('.opt').forEach(function(b,j){b.classList.remove('ok','no');
            if(j===x.correct)b.classList.add('ok'); else if(j===chosen)b.classList.add('no');});
          var ok=chosen===x.correct;persist();
          if(ok){show('good','✅ <b>Correct.</b>');if(!st.ok){st.ok=true;persist();done();}}
          else show('bad','❌ Not that one. Take the hint and try again.');
          record(mod,x.id,chosen,ok);
        }
      });});
    }
    refresh();
    return {refresh:refresh};
  }

  /* ---------- the deck ---------------------------------------------- */
  /* One slide per exercise, generated from the same array. On a student
     device the solution is not written into the DOM at all. */
  function slides(EX,o){
    o=o||{};
    var inst=isInstructor();
    return EX.map(function(x,i){
      var n=i+1;
      var body='<div class="ex-slide" data-ex="'+esc(x.id)+'" data-mod="'+esc(o.mod||'')+'">'+
        '<div class="exs-q">'+x.brief+(x.data?'<div class="exdata">'+x.data+'</div>':'')+'</div>'+
        (x.asks?'<div class="exs-ask">'+x.asks.map(function(f){return '<span>'+esc(f.label)+(f.unit?' ('+esc(f.unit)+')':'')+'</span>';}).join('')+'</div>':'')+
        (x.choice?'<div class="exs-opts">'+x.choice.map(function(c,j){return '<span>'+String.fromCharCode(65+j)+'. '+c+'</span>';}).join('')+'</div>':'')+
        '<div class="exs-sol" hidden>'+(inst?('📘 '+x.sol):'')+'</div>'+
        (inst?'<button class="exs-btn">Show solution — and release to the class</button>'
             :'<div class="exs-wait">Work it on the site → <b>Exercise '+n+'</b>. Your instructor reveals the solution when the room is ready.</div>')+
        '</div>';
      return {
        k:'Part 2 · Exercise '+n+(x.mins?' · '+x.mins+' min':''),
        t:x.title, cls:'wide', ex:x.id, b:body,
        n:(inst?'SOLUTION (yours, before you reveal): '+String(x.sol).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()
               :'Solutions are shown on the instructor device only.')+
          (x.hint?' — HINT if they stall: '+String(x.hint).replace(/<[^>]*>/g,' ').trim():'')
      };
    });
  }
  /* called by the deck's render() after a slide is in the DOM */
  function wireSlide(el){
    if(!el)return;
    var box=el.querySelector('.ex-slide'); if(!box)return;
    var btn=box.querySelector('.exs-btn'); if(!btn)return;
    btn.addEventListener('click',function(){
      var sol=box.querySelector('.exs-sol');
      if(sol)sol.hidden=false;          /* your own copy, whatever happens */
      btn.disabled=true;btn.textContent='Releasing…';
      release(box.dataset.mod,box.dataset.ex).then(function(ok){
        /* ⚠ report the truth. A button that says "revealed" while the write
           was refused is worse than no button — see pushRelease(). */
        btn.textContent=ok?'✓ Revealed — the class can now open it'
                          :'⚠ Not released — use the dashboard → Solutions';
        if(!ok)btn.disabled=false;
      });
    });
  }

  return {mount:mount, slides:slides, wireSlide:wireSlide, releaseBlocked:releaseBlocked,
          previewing:previewing, setPreview:setPreview, gateUnlocked:gateUnlocked,
          releaseError:releaseError,
          isInstructor:isInstructor, release:release, releaseAll:releaseAll,
          isReleased:isReleased, onChange:function(f){listeners.push(f);},
          /* watch(mod) is startPolling for a page that has no exercise
             forms to mount — the homework page, which needs the release
             flag and nothing else. */
          watch:function(mod){loadReleaseLocal(mod);startPolling(mod);},
          ALL:ALL};
})();
