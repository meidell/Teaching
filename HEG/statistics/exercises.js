/* =====================================================================
   HEG · Applied Statistics — the in-class exercise engine.

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

       StatsEx.mount({el, mod, exercises:EXERCISES, progress, save, markStep, markSection, secId})
       StatsEx.slides(EXERCISES, {week:1})   →  slide objects for the deck
       StatsEx.wireSlide(slideEl)            →  called by the deck renderer

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
window.StatsEx = (function () {
  "use strict";
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS = "statistics";

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem('stats_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  function isInstructor(){try{return !!(window.AdminGate&&AdminGate.isUnlocked());}catch(e){return false;}}

  /* ---------- release state ---------------------------------------- */
  var released = {};          /* {mod:{exId:ts}} — what the cohort may see */
  var listeners = [];         /* redraw hooks, called when it changes */
  function relKey(mod){return 'stats_release_'+mod;}
  function loadReleaseLocal(mod){
    try{released[mod]=JSON.parse(localStorage.getItem(relKey(mod))||'{}');}catch(e){released[mod]={};}
  }
  function saveReleaseLocal(mod){
    try{localStorage.setItem(relKey(mod),JSON.stringify(released[mod]||{}));}catch(e){}
  }
  function isReleased(mod,id){
    if(isInstructor())return true;                     /* you always see it */
    return !!(released[mod]&&released[mod][id]);
  }
  function notify(){listeners.forEach(function(f){try{f();}catch(e){}});}

  /* instructor → cohort. Fire-and-forget; the local flag flips regardless,
     so a reveal still works with no network in the room. */
  function release(mod,id){
    if(!isInstructor())return false;
    if(!released[mod])released[mod]={};
    released[mod][id]=Date.now();
    saveReleaseLocal(mod);
    try{fetch(DB+'/'+NS+'/_release/'+encodeURIComponent(mod)+'/'+encodeURIComponent(id)+'.json',
      {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(Date.now())}).catch(function(){});}catch(e){}
    notify();
    return true;
  }
  function releaseAll(mod,ids){
    if(!isInstructor())return false;
    if(!released[mod])released[mod]={};
    var now=Date.now(),body={};
    ids.forEach(function(id){released[mod][id]=now;body[id]=now;});
    saveReleaseLocal(mod);
    try{fetch(DB+'/'+NS+'/_release/'+encodeURIComponent(mod)+'.json',
      {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(function(){});}catch(e){}
    notify();
    return true;
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
    var KEY='stats_ex_'+mod;
    var state={}; try{state=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){}
    function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}

    /* instructor strip — reveal from the site as well as from the deck,
       because in a computer room the deck is not always the front screen */
    if(inst){
      var strip=document.createElement('div');strip.className='ex-inst';
      strip.innerHTML='<span class="ei-t">👁 Instructor view</span>'+
        '<span class="ei-d">Solutions below are visible to you only. Reveal releases them to the class — on their devices, within ~8 seconds.</span>'+
        '<button class="btn small" id="exRelAll">Release all '+EX.length+'</button>';
      root.appendChild(strip);
      strip.querySelector('#exRelAll').addEventListener('click',function(){
        if(confirm('Release all '+EX.length+' solutions to the class?'))releaseAll(mod,EX.map(function(x){return x.id;}));
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
      if(sol)sol.hidden=false;
      release(box.dataset.mod,box.dataset.ex);
      btn.textContent='✓ Revealed — the class can now open it';
      btn.disabled=true;
    });
  }

  return {mount:mount, slides:slides, wireSlide:wireSlide, releaseBlocked:releaseBlocked,
          isInstructor:isInstructor, release:release, releaseAll:releaseAll,
          isReleased:isReleased, onChange:function(f){listeners.push(f);}};
})();
