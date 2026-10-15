/* =====================================================================
   SWISS UMEF · MFB 545 Fintech — the day-page engine.

   One file for the six journee pages, so a fix reaches all of them. It is
   UMEF/gen110/seance1's inline engine (navigation, progress, classify,
   the steps walker, the synchronised quiz) lifted out, French only, plus
   what a full day of four 90-minute blocks needs: the day timeline, the
   🎤 explain / 🛠 do badges, numeric checks, countdown timers.

   A page declares, BEFORE loading this file:
     var DAY = {
       mod:'w1', key:'mfb545_w1_progress_v1', title:'Journée 1 · …',
       blocks:[{n:1,t:'09h00–10h30',name:'…',parts:[['ex',20],['do',55],['co',15]]},…],
       sections:[{id:'s1',num:'1.1',name:'…',tag:'…',mode:'ex'|'do'|'quiz',min:20,block:1},…],
       secCheck:function(api){ … api.st, api.cls, api.filled(id), api.mark(id) … }
     };
   then its widgets (which call buildClassify, buildNum, buildSteps,
   buildQuiz, markStep…), then bootDay().

   ⚠ THE PROGRESS DENOMINATOR is  need()-registered steps + .cl-row + .q
   + [data-work], counted once at boot. Every widget registers its steps
   with need() while the page is being built, so the count is stable. Any
   element added later with class `q` or `cl-row` or a `data-work`
   attribute lowers every student's bar — the same trap as every course in
   this repo. Numeric checks use `.nq`, never `.q`, for exactly that reason.
   ===================================================================== */

var MOD=DAY.mod, KEY=DAY.key, SECTIONS=DAY.sections;
var EXTRA=[];                       /* step ids that count, registered by widgets */
function need(id){if(EXTRA.indexOf(id)<0)EXTRA.push(id);}
var progress=load();
var clsDone={};
function load(){try{var p=JSON.parse(localStorage.getItem(KEY))||{};if(!p.done)p.done={};if(!p.steps)p.steps={};return p;}catch(e){return{done:{},steps:{}};}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function fmt(n,d){return Number(n).toLocaleString('fr-CH',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});}

var MODES={ex:['🎤','Exposé'],do:['🛠','Atelier'],quiz:['✅','Quiz'],co:['🔁','Mise en commun']};
function modeChip(s){var m=MODES[s.mode]||MODES.do;return '<span class="mode m-'+s.mode+'">'+m[0]+' '+m[1]+(s.min?' · '+s.min+' min':'')+'</span>';}

function renderList(){
  var list=document.getElementById('sectionList');if(!list)return;list.innerHTML='';
  var blk=0;
  SECTIONS.forEach(function(s){
    if(s.block!==blk){
      blk=s.block;var b=DAY.blocks[blk-1];
      var h=document.createElement('div');h.className='part-head';
      h.innerHTML='<span class="pt">Bloc '+b.n+' · '+b.t+'</span><span class="pd">'+b.name+'</span>';
      list.appendChild(h);
    }
    var done=!!progress.done[s.id];
    var c=document.createElement('div');c.className='section-card'+(done?' done':'')+(s.mode==='ex'?' is-ex':'');
    c.innerHTML='<div class="num">'+s.num+'</div><div class="info"><div class="name">'+s.name+'</div><div class="tag">'+s.tag+'</div>'+modeChip(s)+'</div><div class="status">'+(done?'✓':'▸')+'</div>';
    c.onclick=function(){show(s.id);};list.appendChild(c);
  });
}
/* the day at a glance: four blocks, each split into who talks and who works */
function renderTimeline(){
  var el=document.getElementById('dayTl');if(!el)return;
  var tot={ex:0,do:0,co:0,quiz:0};
  el.innerHTML=DAY.blocks.map(function(b){
    var sum=b.parts.reduce(function(a,p){return a+p[1];},0);
    b.parts.forEach(function(p){tot[p[0]]=(tot[p[0]]||0)+p[1];});
    return '<div class="tl-row"><div class="tl-h"><b>Bloc '+b.n+'</b> · '+b.t+'<span>'+b.name+'</span></div><div class="tl-bar">'+
      b.parts.map(function(p){var m=MODES[p[0]];return '<div class="tl-seg s-'+p[0]+'" style="flex:'+p[1]+'" title="'+m[1]+' · '+p[1]+' min">'+m[0]+' '+p[1]+'′</div>';}).join('')+
      '</div></div>';
  }).join('')+
  '<div class="tl-sum">Sur la journée : <b>🎤 '+tot.ex+' min</b> d’exposé · <b>🛠 '+(tot.do+tot.quiz)+' min</b> d’atelier et de quiz où vous travaillez · <b>🔁 '+tot.co+' min</b> de mise en commun. '+
  'Chaque exposé est écrit sur cette page : s’il n’a pas lieu, lisez la section seul·e — elle est faite pour ça.</div>';
}
function totalSteps(){return EXTRA.length+document.querySelectorAll('.cl-row').length+document.querySelectorAll('.q').length+document.querySelectorAll('[data-work]').length;}
function doneSteps(){
  var n=0,s=progress.steps||{};
  EXTRA.forEach(function(k){if(s[k])n++;});
  document.querySelectorAll('.cl-row').forEach(function(r){if(r.dataset.done)n++;});
  document.querySelectorAll('.q').forEach(function(r){if(r.dataset.done)n++;});
  document.querySelectorAll('[data-work]').forEach(function(f){if(filled(f.getAttribute('data-work')))n++;});   /* filled() may be stricter on a page (journée 1's radar template) */
  return n;
}
function markStep(id,on){
  if(!id)return;if(!progress.steps)progress.steps={};
  if(on===false){if(!progress.steps[id])return;delete progress.steps[id];}
  else{if(progress.steps[id])return;progress.steps[id]=true;}
  save();updateBar();secCheck();
}
function updateBar(){
  var t=totalSteps()||1,d=Math.min(doneSteps(),t),p=Math.round(d/t*100);
  var pf=document.getElementById('progFill'),pp=document.getElementById('progPct');
  if(pf)pf.style.width=p+'%';if(pp)pp.textContent=p+'%';
}
var onShow={};
function show(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  var t=document.getElementById(id);if(t)t.classList.add('active');
  if(id==='home')renderList();
  if(onShow[id])try{onShow[id]();}catch(e){}
  window.scrollTo({top:0,behavior:'instant' in window?'instant':'auto'});
}
function markSection(id){
  if(!id||progress.done[id])return;
  progress.done[id]=true;save();updateBar();renderList();
  if(window.StatsTrack)StatsTrack.complete(id);
  if(window.CourseProgress)CourseProgress.render({bar:document.getElementById('courseBar'),pct:document.getElementById('coursePct'),compact:true});
}
/* ⚠ a section marked before /shared/progress.js has loaded never reaches the
   database (CLAUDE.md, HEG/statistics). Push every locally-done section once
   StatsTrack exists; complete() is idempotent. */
function syncDoneSections(){if(!window.StatsTrack)return;for(var k in progress.done){if(progress.done[k])StatsTrack.complete(k);}}
function filled(id){var el=document.querySelector('[data-work="'+id+'"]');return !!(el&&(el.value||'').trim());}
function allFilled(ids){return ids.every(filled);}
function secCheck(){
  if(typeof DAY.secCheck!=='function')return;
  DAY.secCheck({st:progress.steps||{},cls:clsDone,filled:filled,all:allFilled,mark:markSection});
  /* per-section status lines: <div class="sec-status" data-sec="s4" data-need="…"> */
  document.querySelectorAll('.sec-status').forEach(function(el){
    var s=el.getAttribute('data-sec');
    el.textContent=progress.done[s]?'✓ Section terminée.':(el.getAttribute('data-need')||'');
    el.classList.toggle('ok',!!progress.done[s]);
  });
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-next],[data-prev],[data-home]');if(!b)return;
  if(b.hasAttribute('data-home'))return show('home');
  if(b.hasAttribute('data-prev'))return show(b.getAttribute('data-prev'));
  var n=b.getAttribute('data-next');if(n)show(n);
});

/* ---- shared classify builder (secId may be null → secCheck decides) ---- */
function buildClassify(rowsId,capId,LEVELS,VARS,doneMsg,secId){
  var box=document.getElementById(rowsId),cap=document.getElementById(capId),done=0;if(!box)return;
  function capText(n,full){if(cap)cap.textContent=n+' sur '+VARS.length+' classé'+(n>1?'s':'')+(full?' — '+doneMsg:'');}
  capText(0,false);
  var replaying=false;
  VARS.forEach(function(v,i){
    var row=document.createElement('div');row.className='cl-row';
    var label=(v.n?'<b>'+v.n+'</b> — ':'')+v.s;
    row.innerHTML='<div class="st">'+label+'</div><div class="cl-btns">'+LEVELS.map(function(l){return '<button data-v="'+l[0]+'">'+l[1]+'</button>';}).join('')+'</div><div class="cl-why" id="'+rowsId+'w'+i+'"></div>';
    var pid=rowsId+'-'+i;
    function attempt(val,btn){
      if(row.dataset.done)return;
      if(val===v.a){
        row.dataset.done='1';
        row.querySelectorAll('button').forEach(function(x){x.disabled=true;if(x===btn)x.classList.add('ok');});
        var w=document.getElementById(rowsId+'w'+i);w.innerHTML='<b>Exact.</b> '+v.w;w.classList.add('show');
        done++;capText(done,done===VARS.length);
        if(!replaying){if(window.StatsAns)StatsAns.push(progress,save,pid,val);updateBar();}
        if(done===VARS.length){if(!replaying)report();clsDone[rowsId]=true;if(secId)markSection(secId);secCheck();}
      }else{
        btn.classList.add('no');btn.disabled=true;
        if(!replaying&&window.StatsAns)StatsAns.push(progress,save,pid,val);
      }
    }
    row.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){attempt(b.dataset.v,b);});});
    box.appendChild(row);
    var hist=window.StatsAns?StatsAns.get(progress,pid):null;
    if(hist&&hist.length){replaying=true;hist.forEach(function(val){var btn=null;row.querySelectorAll('button').forEach(function(x){if(x.getAttribute('data-v')===val)btn=x;});if(btn)attempt(val,btn);});replaying=false;}
  });
  function report(){
    if(!window.StatsAns)return;
    var byItem={},wrong=0;
    VARS.forEach(function(v,i){var h=StatsAns.get(progress,rowsId+'-'+i)||[];var n=0;h.forEach(function(x){if(x!==v.a)n++;});if(n){wrong+=n;byItem[i]={n:n,s:String(v.s||'').replace(/<[^>]*>/g,'').slice(0,120)};}});
    StatsAns.cls(MOD,rowsId,{n:VARS.length,wrong:wrong,byItem:byItem,cap:capId});
  }
}

/* ---- a walked procedure, one step per press; replayed on reload ---- */
function buildSteps(boxId,btnId,steps,stepKey,onDone){
  var box=document.getElementById(boxId),btn=document.getElementById(btnId);if(!box||!btn)return;
  need(stepKey);
  steps.forEach(function(s){var d=document.createElement('div');d.className='step-row';d.innerHTML=s;box.appendChild(d);});
  var rows=box.querySelectorAll('.step-row'),i=0;
  function showN(n){
    for(var j=0;j<n&&j<rows.length;j++)rows[j].classList.add('on');
    i=Math.min(n,rows.length);
    if(i>=rows.length){btn.textContent='✓ Les '+rows.length+' étapes sont affichées';btn.disabled=true;markStep(stepKey);if(onDone)onDone();}
    else btn.textContent=(i===0?'Commencer →':'Étape suivante ('+(i+1)+' sur '+rows.length+') →');
  }
  btn.addEventListener('click',function(){showN(i+1);});
  showN(progress.steps&&progress.steps[stepKey]?rows.length:0);
}

/* ---- numeric checks: [{id,q,a,tol(rel, default 0.005),unit,w}] ----
   Each item is a counted step (id). Thousands separators, apostrophes and
   decimal commas all parse. A wrong answer says so and lets the student retry. */
function num(s){s=String(s||'').trim().replace(/[\s'’ ]/g,'');if(/,\d{1,2}$/.test(s)&&s.indexOf('.')<0)s=s.replace(',','.');else s=s.replace(/,/g,'');return parseFloat(s);}
function buildNum(boxId,ITEMS){
  var box=document.getElementById(boxId);if(!box)return;
  ITEMS.forEach(function(it){
    need(it.id);
    var d=document.createElement('div');d.className='nq';
    d.innerHTML='<div class="tq">'+it.q+'</div><div class="trow"><input class="numin" inputmode="decimal" placeholder="…"><span class="u">'+(it.unit||'')+'</span><button class="btn small">Vérifier</button></div><div class="tfb"></div>';
    var inp=d.querySelector('input'),fb=d.querySelector('.tfb'),bt=d.querySelector('button');
    function good(quiet){d.classList.add('ok');inp.disabled=true;bt.disabled=true;fb.className='tfb show ok';fb.innerHTML='<b>✓ Juste.</b> '+(it.w||'');if(!quiet)markStep(it.id);}
    bt.addEventListener('click',function(){
      var v=num(inp.value);if(isNaN(v)){fb.className='tfb show no';fb.textContent='Entrez un nombre.';return;}
      var tol=it.tol==null?0.005:it.tol, ok=Math.abs(v-it.a)<=Math.max(Math.abs(it.a)*tol,1e-9);
      if(window.StatsAns)StatsAns.set(progress,save,'n_'+it.id,v);
      if(ok)good(false);else{fb.className='tfb show no';fb.innerHTML='<b>Pas encore.</b> '+(it.hint||'Reprenez le calcul pas à pas.');}
    });
    inp.addEventListener('keydown',function(e){if(e.key==='Enter')bt.click();});
    box.appendChild(d);
    if(progress.steps[it.id]){var sv=window.StatsAns?StatsAns.get(progress,'n_'+it.id):null;inp.value=sv!=null?String(sv).replace('.',','):'';good(true);}
  });
}

/* ---- picks: one-click choice rows that are recorded, not marked right/wrong.
   [{id,s,opts:[[val,label,feedback]]}] — each row is a counted step. ---- */
function buildPick(boxId,capId,ROWS,doneMsg){
  var box=document.getElementById(boxId),cap=document.getElementById(capId),n=0;if(!box)return;
  function paint(){if(cap)cap.textContent=n+' sur '+ROWS.length+(n===ROWS.length&&doneMsg?' — '+doneMsg:'');}
  ROWS.forEach(function(r){
    need(r.id);
    var row=document.createElement('div');row.className='sr';
    row.innerHTML='<div class="st">'+r.s+'</div><div class="sv">'+r.opts.map(function(o){return '<button data-v="'+o[0]+'">'+o[1]+'</button>';}).join('')+'</div><div class="sw"></div>';
    function pick(val,quiet){
      var o=null;r.opts.forEach(function(x){if(x[0]===val)o=x;});if(!o)return;
      row.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.v===val);});
      var w=row.querySelector('.sw');if(o[2]){w.innerHTML=o[2];w.classList.add('show');}row.classList.add('done');
      if(!row.dataset.done){row.dataset.done='1';n++;}
      if(!quiet){if(window.StatsAns)StatsAns.set(progress,save,r.id,val);markStep(r.id);}
      paint();
    }
    row.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){pick(b.dataset.v,false);});});
    box.appendChild(row);
    var sv=window.StatsAns?StatsAns.get(progress,r.id):null;if(sv)pick(sv,true);
  });
  paint();
}

/* ---- the synchronised quiz: locked until the instructor launches it
   (_release/<mod>/quiz). Same account rule as every release in this repo:
   the gate shows the button, the signed-in account lets the PUT through. ---- */
var QUIZ_ID='quiz';
function quizOpen(){if(!window.StatsEx)return true;return StatsEx.isInstructor()||StatsEx.isReleased(MOD,QUIZ_ID);}
function paintQuizLock(){
  var box=document.getElementById('quizLock'),qb=document.getElementById('quizBox');if(!box||!qb)return;
  var inst=window.StatsEx&&StatsEx.isInstructor(),open=quizOpen();
  qb.classList.toggle('locked',!open);
  if(inst){
    var rel=isRemoteReleased();
    box.style.display='';
    box.innerHTML='<b>👁 Vue enseignant.</b> Le quiz est ouvert pour vous. '+(rel?'<b>Il est lancé pour la classe.</b>':'La classe attend qu’il soit lancé.')+
      '<div class="qlb"><button class="btn small" id="quizRelBtn"'+(rel?' disabled':'')+'>'+(rel?'✓ Quiz lancé pour la classe':'Lancer le quiz pour la classe')+'</button><span id="quizRelMsg" style="font-size:13px;"></span></div>';
    var b=box.querySelector('#quizRelBtn');
    if(b&&!rel)b.addEventListener('click',function(){
      b.disabled=true;var was=b.textContent;b.textContent='Lancement…';
      StatsEx.release(MOD,QUIZ_ID).then(function(ok){
        var m=box.querySelector('#quizRelMsg');
        if(ok){b.textContent='✓ Quiz lancé pour la classe';m.innerHTML='✅ Lancé — les pages des étudiants se déverrouillent en ~8 s.';remoteRel=true;return;}
        b.disabled=false;b.textContent=was;m.innerHTML='⚠ <b>Pas lancé.</b> '+(StatsEx.releaseError()||'L’écriture a échoué.');
      });
    });
    return;
  }
  if(open){box.style.display='none';return;}
  box.style.display='';
  box.innerHTML=(window.StatsEx&&StatsEx.releaseBlocked())
    ?'<b>⚠ Cet appareil n’atteint pas le serveur</b> : le quiz ne se déverrouillera pas tout seul. Signalez-le.'
    :'<b>🔒 Le quiz démarre ensemble.</b> Il est lancé en classe ; cette page se déverrouille toute seule, en quelques secondes, sans recharger.';
}
/* ⚠ On the instructor's device StatsEx.isReleased() is ALWAYS true ("you
   always see it"), so it cannot say whether the CLASS has the quiz — gen110
   asked it and its launch button was greyed out as "✓ lancé" before anything
   was launched. Here the instructor's device reads _release/<mod> itself
   (world-readable) and repaints when it changes. */
var remoteRel=false,relWatch=false;
function isRemoteReleased(){
  if(!relWatch&&window.StatsEx&&StatsEx.isInstructor()){
    relWatch=true;
    var DBU=(window.CourseConfig&&CourseConfig.DB)||'https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
    var poll=function(){fetch(DBU+'/mfb545/_release/'+encodeURIComponent(MOD)+'.json').then(function(r){return r.ok?r.json():null;})
      .then(function(o){var v=!!(o&&(o[QUIZ_ID]||o._all));if(v!==remoteRel){remoteRel=v;paintQuizLock();}}).catch(function(){});};
    poll();setInterval(poll,15000);
  }
  return remoteRel;
}
function buildQuiz(QUIZ,secId,msgs){
  var box=document.getElementById('quizBox'),chip=document.getElementById('scoreChip'),
      res=document.getElementById('quizResult'),scoreEl=document.getElementById('quizScore'),msgEl=document.getElementById('quizMsg');
  if(!box)return;
  window.COURSE_QUIZ=QUIZ;
  var answered=0,correct=0;chip.textContent='0 / '+QUIZ.length+' répondues';
  var replaying=false,replayQ=[];
  QUIZ.forEach(function(item,i){
    var q=document.createElement('div');q.className='q';
    q.innerHTML='<div class="qt"><span class="qn">'+(i+1)+'.</span>'+item.q+'</div>'+item.opts.map(function(o,j){return '<button class="opt" data-j="'+j+'">'+o+'</button>';}).join('')+'<div class="why" id="qw'+i+'"></div>';
    function apply(j){
      if(q.dataset.done)return;q.dataset.done='1';
      var ok=j===item.a;
      q.querySelectorAll('.opt').forEach(function(x){x.disabled=true;var xj=parseInt(x.dataset.j,10);if(xj===item.a)x.classList.add('correct');else if(xj===j)x.classList.add('wrong');});
      var w=document.getElementById('qw'+i);w.innerHTML=(ok?'<b>Exact.</b> ':'<b>Pas tout à fait.</b> ')+item.w;w.classList.add('show');
      answered++;if(ok)correct++;
      if(!replaying){if(window.StatsAns)StatsAns.set(progress,save,'q'+i,j);if(window.StatsTrack&&StatsTrack.quizAnswer)StatsTrack.quizAnswer(i,j,ok);updateBar();}
      chip.textContent=answered+' / '+QUIZ.length+' répondues';
      if(answered===QUIZ.length)finish();
    }
    q.querySelectorAll('.opt').forEach(function(b){b.addEventListener('click',function(){if(!quizOpen())return;apply(parseInt(b.dataset.j,10));});});
    box.appendChild(q);
    var saved=window.StatsAns?StatsAns.get(progress,'q'+i):null;if(saved!=null)replayQ.push(function(){apply(saved);});
  });
  replaying=true;replayQ.forEach(function(fn){fn();});replaying=false;
  function finish(){
    scoreEl.textContent=correct+' / '+QUIZ.length;
    msgEl.textContent=correct>=7?msgs[0]:correct>=5?msgs[1]:msgs[2];
    res.classList.add('show');markSection(secId);
    if(!replaying&&window.StatsTrack)StatsTrack.setScore(correct,QUIZ.length);
  }
  /* watch() first: it reads the release flags already on this device */
  if(window.StatsEx){StatsEx.watch(MOD);StatsEx.onChange(paintQuizLock);}
  paintQuizLock();
}

/* ---- countdown timers: <div class="timer" data-min="3" data-label="…"> ----
   For the room: pitches, restitutions, a timed task. Never counted. */
function initTimers(){
  document.querySelectorAll('.timer[data-min]').forEach(function(el){
    var total=Math.round(parseFloat(el.getAttribute('data-min'))*60),left=total,iv=null;
    el.innerHTML='<span class="tl">⏱ '+esc(el.getAttribute('data-label')||'Minuteur')+'</span><span class="td">'+mmss(left)+'</span>'+
      '<button class="btn small" data-a="go">Démarrer</button><button class="btn small ghost" data-a="rs">↺</button>';
    var d=el.querySelector('.td'),go=el.querySelector('[data-a=go]');
    function tick(){left--;d.textContent=mmss(Math.max(0,left));if(left<=30)el.classList.add('warn');if(left<=0){clearInterval(iv);iv=null;el.classList.add('end');go.textContent='Terminé';}}
    go.addEventListener('click',function(){
      if(left<=0)return;
      if(iv){clearInterval(iv);iv=null;go.textContent='Reprendre';}
      else{iv=setInterval(tick,1000);go.textContent='Pause';}
    });
    el.querySelector('[data-a=rs]').addEventListener('click',function(){clearInterval(iv);iv=null;left=total;d.textContent=mmss(left);el.classList.remove('warn','end');go.textContent='Démarrer';});
  });
}
function mmss(s){var m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r;}

/* ---- set a data-work field from a widget, so progress.js saves it ---- */
function setWork(id,text){
  var el=document.querySelector('[data-work="'+id+'"]');if(!el)return;
  el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
}

/* ---- glossary chips: <span class="gloss" data-k="…">mot</span> ---- */
var GLOSSARY=window.GLOSSARY||{};
(function gloss(){
  var tip=document.createElement('div');tip.id='glossTip';document.body.appendChild(tip);
  document.addEventListener('click',function(e){
    if(e.target.classList&&e.target.classList.contains('x')){tip.style.display='none';return;}
    var g=e.target.closest&&e.target.closest('.gloss');
    if(g){var d=GLOSSARY[g.dataset.k];if(!d)return;
      tip.innerHTML='<span class="x">×</span><b>'+d[0]+'</b>'+d[1];
      var tw=Math.min(300,window.innerWidth-24);tip.style.width=tw+'px';tip.style.display='block';
      var r=g.getBoundingClientRect();var left=r.left;if(left+tw>window.innerWidth-12)left=window.innerWidth-tw-12;if(left<12)left=12;
      tip.style.left=left+'px';tip.style.top=(r.bottom+8)+'px';e.stopPropagation();
    }else if(!(e.target.closest&&e.target.closest('#glossTip'))){tip.style.display='none';}
  });
})();

function bootDay(){
  /* before-you-start ticks */
  var RK=KEY.replace('_progress_v1','_reads'),rs={};try{rs=JSON.parse(localStorage.getItem(RK))||{};}catch(e){}
  document.querySelectorAll('.mi[data-read]').forEach(function(mi){
    var k=mi.dataset.read;if(rs[k])mi.classList.add('on');
    mi.addEventListener('click',function(e){
      if(e.target.closest('a')){rs[k]=true;mi.classList.add('on');try{localStorage.setItem(RK,JSON.stringify(rs));}catch(err){}return;}
      rs[k]=!rs[k];mi.classList.toggle('on',!!rs[k]);try{localStorage.setItem(RK,JSON.stringify(rs));}catch(err){}
    });
  });
  var a=window.StatsAns?StatsAns.auth():null;
  if(a&&a.name){var w=document.getElementById('topWho');if(w){w.textContent='👤 '+a.name;w.classList.add('on');}}
  var rl=document.getElementById('resetLink');
  if(rl)rl.addEventListener('click',function(e){
    e.preventDefault();
    if(!confirm('Réinitialiser votre progression et vos réponses de cette journée sur cet appareil ?'))return;
    try{
      var pre='mfb545_'+MOD+'_';
      Object.keys(localStorage).forEach(function(k){if(k.indexOf(pre)===0||k.indexOf('mfb545_work_'+MOD+'_')===0)localStorage.removeItem(k);});
      localStorage.removeItem(KEY);localStorage.removeItem('mfb545_done_'+MOD);
    }catch(err){}
    document.querySelectorAll('[data-work]').forEach(function(el){el.value='';});
    progress={done:{},steps:{}};save();location.reload();
  });
  initTimers();renderTimeline();renderList();updateBar();secCheck();
  window.addEventListener('DOMContentLoaded',function(){
    if(window.StatsTrack){StatsTrack.init({module:MOD,title:DAY.title,total:SECTIONS.length});syncDoneSections();}
    if(window.StatsPresence)StatsPresence.mount({el:document.getElementById('presSlot'),mod:MOD,label:DAY.title});
    document.querySelectorAll('[data-work]').forEach(function(f){
      var c=function(){updateBar();secCheck();};
      f.addEventListener('input',c);setTimeout(c,900);
    });
  });
}
