/* =====================================================================
   /shared/progressfx.js — what you click, and what it does to your progress
   (10 Nov 2026, Jan Erik: "make the connection between progress (cette
   séance, progress cours) and what you click more visual and interactive —
   e.g. in the card 'avant la séance — cochez', when click then progress bar
   moves — do this for all fields that are accounted for — make also a
   discreet mark to all fields that contribute to the progress").

   Loaded by /track.js on every page that has a session bar (#progPct), a
   course bar (#coursePct) or a homework counter (#scoreChip, "4 / 14
   solved"); it needs nothing from the page beyond those ids.
   Three things:

   1. THE READING TICKS COUNT. The "Avant la séance / Before we start —
      cochez" items (.mi[data-read]) were saved but never counted. When the
      page's engine exposes the usual globals totalSteps / doneSteps /
      updateBar (every course engine on this site does), they are wrapped so
      each reading tick is one more step, and a tick redraws the bar at once.
      A page without those globals is left exactly as it was.

   2. THE BAR ANSWERS THE CLICK. Whenever #progPct or #coursePct changes, the
      bar glows and a small "+N %" rises from the thing just clicked or typed
      in (or "−N %" when a tick is removed). Pure observation of the two
      numbers: no engine is touched, so it works on every course.

   3. A DISCREET MARK ON WHAT COUNTS. Notebook fields ([data-work]), classify
      rows (.cl-row), quiz questions (.q) and reading ticks get a thin
      coloured stripe or dot, with a tooltip. Any other widget is marked the
      first time it moves the bar (the page cannot list them in advance).
   ===================================================================== */
(function(){
  'use strict';
  if(window.__progressfx)return;window.__progressfx=true;
  var pctEl=document.getElementById('progPct'),coursePct=document.getElementById('coursePct'),scoreEl=document.getElementById('scoreChip');
  if(!pctEl&&!coursePct&&!scoreEl)return;
  function lab(el){var t=el&&el.parentNode&&el.parentNode.querySelector('.tbl');return t?t.textContent.trim():'';}
  var FR=/^fr/i.test(document.documentElement.lang||'')||/s[ée]ance|journ[ée]e|cours$/i.test(lab(pctEl)+lab(coursePct));
  var L=FR?{s:'cette séance',c:'cours',tip:'Compte dans votre progression',legend:'compte dans la progression'}
          :{s:'this session',c:'course',tip:'Counts toward your progress',legend:'counts toward progress'};
  /* the chip names the bar the way the page does ("Cette journée", "This week") */
  if(lab(pctEl))L.s=lab(pctEl).toLowerCase();
  if(lab(coursePct))L.c=lab(coursePct).toLowerCase();

  /* ---------- styles ---------- */
  var css=
  '.pfx-chip{position:fixed;z-index:99999;pointer-events:none;font:800 13px/1 system-ui,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;'+
    'padding:6px 10px;border-radius:999px;background:var(--accent,#176B87);color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.18);'+
    'transform:translate(-50%,0);animation:pfx-rise 1.25s ease-out forwards;white-space:nowrap;}'+
  '.pfx-chip.down{background:#6b7280;}'+
  '.pfx-chip.course{background:var(--navy,#0f3d5e);}'+
  '@keyframes pfx-rise{0%{opacity:0;transform:translate(-50%,6px) scale(.9);}15%{opacity:1;transform:translate(-50%,0) scale(1.05);}70%{opacity:1;}100%{opacity:0;transform:translate(-50%,-34px) scale(1);}}'+
  '.pfx-glow{animation:pfx-glow 1.1s ease-out;}'+
  '@keyframes pfx-glow{0%{box-shadow:0 0 0 0 rgba(23,107,135,.0);}25%{box-shadow:0 0 0 5px rgba(23,107,135,.28);}100%{box-shadow:0 0 0 0 rgba(23,107,135,0);}}'+
  '.pfx-bump{display:inline-block;animation:pfx-bump .6s ease-out;}'+
  '@keyframes pfx-bump{0%{transform:scale(1);}35%{transform:scale(1.35);}100%{transform:scale(1);}}'+
  /* the discreet marks */
  'textarea.pfx-c,input.pfx-c{box-shadow:inset 3px 0 0 var(--accent,#176B87) !important;}'+
  '.pfx-d{position:relative;}'+
  '.pfx-d::after{content:"";position:absolute;top:7px;right:7px;width:7px;height:7px;border-radius:50%;background:var(--accent,#176B87);opacity:.55;pointer-events:none;}'+
  '.mi.pfx-d,.cl-row.pfx-d{padding-right:18px;}.mi.pfx-d::after,.cl-row.pfx-d::after{right:3px;}'+
  '.pfx-d.pfx-ok::after,.pfx-d.on::after,.pfx-d.solved::after,.pfx-d[data-done]::after{opacity:1;box-shadow:0 0 0 2px rgba(255,255,255,.9);}'+
  '.pfx-legend{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;color:var(--grey,#6b7280);margin-left:8px;letter-spacing:.3px;text-transform:none;}'+
  ''+
  '.pfx-legend i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--accent,#176B87);opacity:.8;}'+
  '@media (prefers-reduced-motion: reduce){.pfx-chip,.pfx-glow,.pfx-bump{animation:none !important;}.pfx-chip{display:none;}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* ---------- 1 · the reading ticks count ---------- */
  var reads=Array.prototype.slice.call(document.querySelectorAll('.mi[data-read]'));
  /* Some pages (HEG Quantitative Methods) draw the ticks but never wired a
     click to them. When a click leaves a tick unchanged, toggle it here and
     keep it per page, so the tick works everywhere. */
  var FK='pfx_reads_'+location.pathname,fs={};try{fs=JSON.parse(localStorage.getItem(FK))||{};}catch(e){}
  reads.forEach(function(m){if(fs[m.dataset.read])m.classList.add('on');});
  var wasOn=null;
  document.addEventListener('click',function(e){
    var mi=e.target.closest&&e.target.closest('.mi[data-read]');wasOn=mi?mi.classList.contains('on'):null;
  },true);
  document.addEventListener('click',function(e){
    var mi=e.target.closest&&e.target.closest('.mi[data-read]');if(!mi||wasOn===null)return;
    if(mi.classList.contains('on')!==wasOn)return;          /* the page handled it */
    if(e.target.closest('a')&&wasOn)return;                  /* opening a link never un-ticks */
    var on=!wasOn;mi.classList.toggle('on',on);fs[mi.dataset.read]=on;
    try{localStorage.setItem(FK,JSON.stringify(fs));}catch(err){}
  });
  var counting=false,T0=null;
  if(reads.length&&typeof window.totalSteps==='function'&&typeof window.doneSteps==='function'&&typeof window.updateBar==='function'&&pctEl){
    try{
      T0=window.totalSteps;var D0=window.doneSteps;
      window.totalSteps=function(){return T0.apply(this,arguments)+reads.length;};
      window.doneSteps=function(){return D0.apply(this,arguments)+reads.filter(function(m){return m.classList.contains('on');}).length;};
      counting=true;
      /* the page's own click handler toggles .on first (it is on the item);
         this one runs after it, on the document, and redraws the bar */
      document.addEventListener('click',function(e){
        var mi=e.target.closest&&e.target.closest('.mi[data-read]');if(!mi)return;
        setTimeout(function(){try{window.updateBar();}catch(err){}},0);
      });
      window.updateBar();
    }catch(e){counting=false;}
  }

  /* ---------- 3 · the discreet marks ---------- */
  /* mark only what this page's engine counts: read it from totalSteps itself */
  var src='';try{src=String(T0||window.totalSteps||'');}catch(e){}
  var has=function(sel){return src?src.indexOf(sel)>=0:false;};
  var MW=has('[data-work]'),MC=has('.cl-row'),MQ=has("'.q'")||has('".q"');
  function mark(){
    if(MW)document.querySelectorAll('textarea[data-work],input[data-work]').forEach(function(f){
      if(f.type==='hidden'||f.classList.contains('pfx-c'))return;
      f.classList.add('pfx-c');if(!f.title)f.title=L.tip;
    });
    var sels=[];if(scoreEl)sels.push('.prob');if(MC)sels.push('.cl-row');if(MQ)sels.push('.q');if(counting)sels.push('.mi[data-read]');
    if(sels.length)document.querySelectorAll(sels.join(',')).forEach(function(r){
      if(r.classList.contains('pfx-d'))return;
      r.classList.add('pfx-d');if(!r.title)r.title=L.tip;
    });
  }
  mark();
  /* widgets that build their rows after load (quizzes, classify groups) */
  setTimeout(mark,800);setTimeout(mark,2500);
  try{new MutationObserver(function(){clearTimeout(mark._t);mark._t=setTimeout(mark,120);}).observe(document.body,{childList:true,subtree:true});}catch(e){}
  /* the legend: once, at the head of the reading checklist, and as the
     tooltip of the session bar (the top strip has no room for words) */
  (function(){
    if(!MW&&!MC&&!MQ&&!counting)return;
    var bar=pctEl&&pctEl.parentNode;if(bar&&!bar.title)bar.title=FR?'Le point ● marque ce qui compte dans cette barre':'The dot ● marks what counts toward this bar';
    var mi=counting&&reads[0],box=mi&&mi.parentNode,head=box&&box.firstElementChild;
    if(!head||head===mi||head.querySelector('.pfx-legend'))return;
    var s=document.createElement('span');s.className='pfx-legend';s.title=L.tip;s.innerHTML='<i></i>'+L.legend;
    head.appendChild(s);
  })();

  /* ---------- 2 · the bar answers the click ---------- */
  var last={x:null,y:null,el:null,t:0};
  function remember(e){
    var t=e.target;if(!t||!t.getBoundingClientRect)return;
    var r=t.getBoundingClientRect(),x=e.clientX,y=e.clientY;
    if(x==null||(!x&&!y)){x=r.left+Math.min(r.width,160)/2;y=r.top+8;}
    last={x:x,y:y,el:t,t:Date.now()};
  }
  document.addEventListener('pointerdown',remember,true);
  document.addEventListener('input',remember,true);
  document.addEventListener('change',remember,true);
  function num(el){var m=String(el.textContent||'').match(/-?\d+/);return m?parseInt(m[0],10):null;}
  function chip(text,cls,x,y){
    var c=document.createElement('div');c.className='pfx-chip'+(cls?' '+cls:'');c.textContent=text;
    var vw=window.innerWidth||800,vh=window.innerHeight||600;
    c.style.left=Math.max(60,Math.min(vw-60,x))+'px';c.style.top=Math.max(70,Math.min(vh-40,y-28))+'px';
    document.body.appendChild(c);setTimeout(function(){c.remove();},1300);
  }
  function glow(pEl){
    var bar=pEl&&pEl.parentNode&&(pEl.parentNode.querySelector('.tk,.cbar,.tf')||pEl.parentNode);
    [bar,pEl].forEach(function(n,i){if(!n)return;var k=i?'pfx-bump':'pfx-glow';n.classList.remove(k);void n.offsetWidth;n.classList.add(k);});
  }
  function learn(){
    /* the widget just used moved the bar: give it the mark too */
    var el=last.el;if(!el||Date.now()-last.t>2000||!el.closest)return;
    var w=el.closest('.cl-row,.q,.mi,label,.ck,.trow,.turn,.lab,.wb,.card');
    if(w&&!w.classList.contains('card')&&!w.classList.contains('pfx-d')){w.classList.add('pfx-d','pfx-ok');if(!w.title)w.title=L.tip;}
  }
  function watch(el,label,cls){
    if(!el)return;
    var prev=num(el);
    try{new MutationObserver(function(){
      var v=num(el);if(v==null||prev==null||v===prev){prev=v;return;}
      var d=v-prev;prev=v;
      var fresh=Date.now()-last.t<2500&&last.x!=null;
      glow(el);
      if(fresh){chip((d>0?'+':'−')+Math.abs(d)+' % · '+label,(d<0?'down ':'')+(cls||''),last.x,last.y);if(d>0)learn();}
    }).observe(el,{childList:true,characterData:true,subtree:true});}catch(e){}
  }
  /* homework pages: "4 / 14 solved" — the counter glows and the chip
     repeats it, so a solved problem visibly moves something */
  if(scoreEl){
    var sp=num(scoreEl);
    try{new MutationObserver(function(){
      var v=num(scoreEl);if(v==null||v===sp){sp=v;return;}
      var up=sp!=null&&v>sp;sp=v;
      scoreEl.classList.remove('pfx-bump');void scoreEl.offsetWidth;scoreEl.classList.add('pfx-bump');
      if(up&&Date.now()-last.t<2500&&last.x!=null)chip('✓ '+scoreEl.textContent.trim(),'',last.x,last.y);
    }).observe(scoreEl,{childList:true,characterData:true,subtree:true});}catch(e){}
  }
  watch(pctEl,L.s,'');
  watch(coursePct,L.c,'course');
})();
