/* =====================================================================
   SUMAS · Bachelor Capstone — the week-page engine.

   One small script every week page loads at the END of <body>. It does
   what the Moodle page could not: remember what the student has done,
   put the deadlines from schedule.js on every forum card, run the
   self-check and classify widgets, and report to /shared/progress.js.

   The page declares, the engine reads:
     <body data-course="capstone-ba" data-module="w3" data-week="3">
     <section class="sec" data-step="s1">         a section that counts
     <div class="fcard" data-forum="f3a">          a forum activity card
     <div class="pcard" data-phase="p1">           a phase of the team report (report.html)
     <div id="recall"></div>  + CAP.recall(...)    two questions on last week
     <div id="quiz"></div>    + CAP.quiz(...)      the self-check
     <textarea data-work="w3_rate">                a workbook field
     <span data-session="day|group|cls">           the week's Thursday session, from schedule.js

   ⚠ THE PROGRESS DENOMINATOR is  .sec[data-step] + (#recall ? 1) +
   (#quiz ? 1) + [data-work]. courseprogress.js carries the same number
   as a constant per week (`total`); the build script recounts it. Adding
   an element with any of those hooks to a live page lowers every
   student's displayed progress — the same trap documented for every
   other course in this repo.

   ⚠ A step marked before progress.js has defined StatsTrack never
   reaches the database (see CLAUDE.md, HEG/statistics). So every step is
   written to a local mirror first, and syncDone() replays the mirror
   into StatsTrack.complete() — which is idempotent — once init has run.
   ===================================================================== */
window.CAP = (function () {
  'use strict';
  var K = 'capstone-ba';                       /* localStorage prefix = keyPrefix */
  var S = window.CAPSTONE_SCHEDULE || null;
  var MOD = document.body.getAttribute('data-module') || '';
  var WK  = parseInt(document.body.getAttribute('data-week'), 10) || 0;
  var MIRROR = K + '_capdone_' + MOD;
  var done = {};
  try { done = JSON.parse(localStorage.getItem(MIRROR) || '{}'); } catch (e) {}

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmt(n,d){ if(n==null||isNaN(n))return '—'; d=d==null?1:d; return Number(n).toLocaleString('en-GB',{maximumFractionDigits:d,minimumFractionDigits:d}); }

  /* ---- steps and the page bar ---- */
  function stepIds(){
    var ids=[];
    document.querySelectorAll('.sec[data-step]').forEach(function(s){ids.push(s.getAttribute('data-step'));});
    if($('recall'))ids.push('recall');
    if($('quiz'))ids.push('quiz');
    document.querySelectorAll('[data-work]').forEach(function(f){ids.push('wb-'+f.getAttribute('data-work'));});
    return ids;
  }
  function total(){ return stepIds().length; }
  function count(){ var n=0; stepIds().forEach(function(id){ if(done[id])n++; }); return n; }
  function paintBar(){
    var t=total(), n=count(), pct=t?Math.round(n/t*100):0;
    var b=$('pageBar'), p=$('pagePct');
    if(b)b.style.width=pct+'%'; if(p)p.textContent=pct+'%';
    document.querySelectorAll('.sec[data-step]').forEach(function(s){ s.classList.toggle('done',!!done[s.getAttribute('data-step')]); });
  }
  function step(id, on){
    if(on===false){ delete done[id]; }
    else { if(done[id])return; done[id]=true; if(window.StatsTrack)StatsTrack.complete(id); }
    try{localStorage.setItem(MIRROR,JSON.stringify(done));}catch(e){}
    paintBar();
  }
  function syncDone(){ if(!window.StatsTrack)return; Object.keys(done).forEach(function(id){ if(done[id])StatsTrack.complete(id); }); }

  /* every counted section gets a "Done with this section" switch at its foot */
  function wireSections(){
    document.querySelectorAll('.sec[data-step]').forEach(function(s){
      var id=s.getAttribute('data-step');
      if(s.querySelector('.secdone'))return;
      var d=document.createElement('div'); d.className='secdone';
      d.innerHTML='<button type="button">'+(done[id]?'✓ Done':'Mark this section done')+'</button><span>'+(done[id]?'Counted toward this week.':'Read it, used it, understood it? Tick it — it feeds your course bar.')+'</span>';
      var b=d.querySelector('button'); if(done[id])b.classList.add('on');
      b.addEventListener('click',function(){
        if(done[id]){ step(id,false); b.classList.remove('on'); b.textContent='Mark this section done'; }
        else { step(id); b.classList.add('on'); b.textContent='✓ Done'; }
      });
      s.appendChild(d);
    });
  }

  /* ---- workbook fields: a filled field is a step ---- */
  function wireWork(){
    document.querySelectorAll('[data-work]').forEach(function(f){
      var id='wb-'+f.getAttribute('data-work');
      function chk(){ var v=(f.value||'').trim(); if(v.length>=20)step(id); }
      var t; f.addEventListener('input',function(){ clearTimeout(t); t=setTimeout(chk,600); });
      setTimeout(chk,300);  /* progress.js restores saved text on init */
    });
  }

  /* ---- dates on forum and phase cards ---- */
  function dueChip(d, txt, label){
    var now=Date.now(), cls='due', t=label||'due';
    if(now>d.getTime())cls='closed';
    else if(d.getTime()-now<48*3600000)cls='soon';
    return '<span class="chip '+cls+'">'+t+' '+esc(txt)+'</span>';
  }
  function wireForums(){
    if(!S)return;
    document.querySelectorAll('[data-forum]').forEach(function(c){
      var f=S.forum(c.getAttribute('data-forum')); if(!f)return;
      if(f.opt)c.classList.add('opt');
      var chips='';
      if(f.opt)chips+='<span class="chip opt">optional · not graded</span>';
      chips+=dueChip(f.due,f.dueText,f.opt?'open until':'post by');
      chips+='<span class="chip">'+f.post.min+'–'+f.post.max+' words</span>';
      if(f.re)chips+=dueChip(f.reDue,f.reDueText,f.re.n+' repl'+(f.re.n>1?'ies':'y')+' by')+'<span class="chip">'+f.re.min+'+ words each</span>';
      var head='<div class="fh"><span class="ft">'+esc(f.title)+'</span></div><div class="chips">'+chips+'</div>';
      c.insertAdjacentHTML('afterbegin',head);
      if(!c.querySelector('.go'))c.insertAdjacentHTML('beforeend','<a class="go" href="forum.html?f='+f.id+'">Open the forum →</a>');
    });
    document.querySelectorAll('[data-phase]').forEach(function(c){
      var p=S.phase(c.getAttribute('data-phase')); if(!p)return;
      c.insertAdjacentHTML('afterbegin','<div class="due">Team report · on this site · due '+esc(p.dueText)+' CET · '+esc(p.words)+'</div>');
      if(!c.querySelector('.acts'))c.insertAdjacentHTML('beforeend','<p class="acts"><a href="report.html#'+p.id+'">Write it on the team report page →</a> <span>· one of you hands it in from there · figures that will not paste go as a PDF on <a href="handin.html?p='+p.id+'">the hand-in page</a></span></p>');
    });
    document.querySelectorAll('[data-week-dates]').forEach(function(e){ var w=S.week(WK); if(w)e.textContent=w.dates; });
    document.querySelectorAll('[data-canvas]').forEach(function(e){ if(S.CANVAS){ e.href=S.CANVAS; e.target='_blank'; e.rel='noopener'; e.textContent=e.textContent==='link'?'Google Doc':e.textContent; } else { e.removeAttribute('href'); e.textContent=(e.textContent==='link'?'link follows':e.textContent); } });
    document.querySelectorAll('[data-session]').forEach(function(e){ var w=S.week(WK); if(!w||!w.session)return; var k=e.getAttribute('data-session'); e.textContent=k==='day'?w.session.day:(k==='group'?w.session.group:(k==='cls'?w.session.cls:w.session.text)); });
    document.querySelectorAll('[data-due]').forEach(function(e){
      var id=e.getAttribute('data-due'), f=S.forum(id), p=S.phase(id);
      e.textContent=f?f.dueText:(p?p.dueText:'');
    });
    if(S.week(WK)&&Date.now()<S.week(WK).monday.getTime()){
      var lb=$('lockbar'); if(lb){ lb.style.display='block'; lb.textContent='This week opens on '+S.fmtDay(S.week(WK).monday)+'. You can read ahead; the forums open then.'; }
    }
  }

  /* ---- the quiz engine (self-check and the retrieval opener) --------
     Q = [{q, opts:[...], a:index, why}]. First attempt wins: a pick is
     stored and replayed; a replayed pick never re-sends to the DB. */
  var LET='ABCDEF';
  function quizEngine(box, Q, o){
    o=o||{}; var key=K+'_pick_'+MOD+'_'+(o.key||'quiz');
    var picks={}; try{picks=JSON.parse(localStorage.getItem(key)||'{}');}catch(e){}
    if(o.score!==false)window.COURSE_QUIZ=Q;   /* progress.js pushes the question text for the dashboard */
    box.innerHTML='';
    Q.forEach(function(it,i){
      var d=document.createElement('div'); d.className='q';
      d.innerHTML='<div class="qt"><span class="n">'+(i+1)+'</span>'+esc(it.q)+'</div><div class="opts">'+
        it.opts.map(function(t,j){return '<button type="button" class="opt" data-j="'+j+'"><span class="k">'+LET[j]+'</span><span>'+esc(t)+'</span></button>';}).join('')+
        '</div><div class="why"></div>';
      box.appendChild(d);
      function settle(j,replay){
        var ok=j===it.a; d.classList.add('done');
        d.querySelectorAll('.opt').forEach(function(b){ var jj=+b.getAttribute('data-j'); b.disabled=true; if(jj===it.a)b.classList.add('ok'); if(jj===j&&!ok)b.classList.add('bad'); });
        d.querySelector('.why').innerHTML=(ok?'<b style="color:var(--accent-deep)">Correct.</b> ':'<b style="color:var(--terra)">Not quite — '+LET[it.a]+'.</b> ')+esc(it.why||'');
        if(!replay){ picks[i]=j; try{localStorage.setItem(key,JSON.stringify(picks));}catch(e){}
          if(o.score!==false&&window.StatsTrack)StatsTrack.quizAnswer(i,j,ok); }
        finish();
      }
      d.querySelectorAll('.opt').forEach(function(b){ b.addEventListener('click',function(){ settle(+b.getAttribute('data-j'),false); }); });
      if(picks[i]!=null)settle(picks[i],true);
    });
    var sc=document.createElement('div'); sc.className='qscore'; box.appendChild(sc);
    function finish(){
      var n=Object.keys(picks).length, right=0; Q.forEach(function(it,i){ if(picks[i]===it.a)right++; });
      if(n<Q.length){ sc.innerHTML=n+' of '+Q.length+' answered.'; return; }
      sc.innerHTML='<b>'+right+' / '+Q.length+'</b> — '+(o.msg?o.msg(right,Q.length):(right===Q.length?'all of it. On to the forum.':right>=Q.length*0.7?'solid. Re-read the one or two you missed before you post.':'worth a second pass through the section above before the forum.'));
      if(o.score!==false&&window.StatsTrack&&!o._sent){ o._sent=true; StatsTrack.setScore(right,Q.length); }
      step(o.step||'quiz');
    }
    finish();
  }
  function quiz(id,Q,o){ var b=$(id||'quiz'); if(b)quizEngine(b,Q,o||{}); }
  function recall(Q){ var b=$('recall'); if(b)quizEngine(b,Q,{key:'recall',score:false,step:'recall',msg:function(r,n){return r===n?'last week is still there. Good.':'glance back at last week\'s checkpoint before you go on.';}}); }

  /* ---- classify: items into groups, with a reason per item ----------
     cfg = {groups:['Trend','Uncertainty'], items:[{t, g:index, why}], step}
     ⚠ uses .cl-row deliberately NOT counted by the denominator here —
     completion is reported as ONE step, cfg.step. */
  function classify(id,cfg){
    var box=$(id); if(!box)return; var key=K+'_cls_'+MOD+'_'+id;
    var picks={}; try{picks=JSON.parse(localStorage.getItem(key)||'{}');}catch(e){}
    box.innerHTML='<div class="cl">'+cfg.items.map(function(it,i){
      return '<div class="cl-row" data-i="'+i+'"><span class="ct">'+esc(it.t)+'</span><span class="cb">'+
        cfg.groups.map(function(g,j){return '<button type="button" data-j="'+j+'">'+esc(g)+'</button>';}).join('')+'</span><span class="why" style="display:none"></span></div>';
    }).join('')+'</div>';
    function settle(row,i,j,replay){
      var it=cfg.items[i], ok=j===it.g;
      row.classList.add(ok?'ok':'bad');
      row.querySelectorAll('button').forEach(function(b){ b.disabled=true; if(+b.getAttribute('data-j')===j)b.classList.add('pick'); });
      var w=row.querySelector('.why'); w.style.display='block';
      w.innerHTML=(ok?'<b>Yes.</b> ':'<b>It\'s '+esc(cfg.groups[it.g])+'.</b> ')+esc(it.why||'');
      if(!replay){ picks[i]=j; try{localStorage.setItem(key,JSON.stringify(picks));}catch(e){} }
      if(Object.keys(picks).length>=cfg.items.length&&cfg.step)step(cfg.step);
    }
    box.querySelectorAll('.cl-row').forEach(function(row){
      var i=+row.getAttribute('data-i');
      row.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){ settle(row,i,+b.getAttribute('data-j'),false); }); });
      if(picks[i]!=null)settle(row,i,picks[i],true);
    });
  }

  /* ---- Wright's Law fitter — used by Weeks 3 and 7 -------------------
     Fits ln(cost) = a + (−b)·ln(Q) by ordinary least squares on the
     log-log pairs; learning rate = 1 − 2^(−b). Then projects 2030/35/40
     from the LAST data point under three learning rates, given an
     assumed cumulative capacity path. Every number here was recomputed
     in Python before shipping (see the recap in the commit). */
  function ols(x,y){ var n=x.length,sx=0,sy=0,sxx=0,sxy=0; for(var i=0;i<n;i++){sx+=x[i];sy+=y[i];sxx+=x[i]*x[i];sxy+=x[i]*y[i];}
    var b=(n*sxy-sx*sy)/(n*sxx-sx*sx), a=(sy-b*sx)/n; var ssr=0,sst=0,my=sy/n; for(i=0;i<n;i++){var f=a+b*x[i];ssr+=(y[i]-f)*(y[i]-f);sst+=(y[i]-my)*(y[i]-my);} return {a:a,b:b,r2:sst?1-ssr/sst:1}; }
  function wright(id,cfg){
    var box=$(id); if(!box)return;
    var rows=(cfg.data||[]).map(function(r){return r.slice();});
    var fut=cfg.future||[[2030,160],[2035,330],[2040,600]];
    function render(){
      var h='<div class="wt">'+esc(cfg.title||'Wright\'s Law fitter')+'</div>'+
        '<p class="note" style="margin:0 0 8px">Edit any cell. Year · LCOE ($/MWh) · cumulative global installed capacity (GW). The defaults are rounded from IRENA\'s <i>Renewable Power Generation Costs</i> and GWEC\'s <i>Global Offshore Wind Report</i> — <b>verify them against the sources before you post them.</b></p>'+
        '<div class="tw"><table><tr><th>Year</th><th>LCOE $/MWh</th><th>Cumulative GW</th><th></th></tr>'+
        rows.map(function(r,i){return '<tr><td><input type="number" data-r="'+i+'" data-c="0" value="'+r[0]+'"></td><td><input type="number" step="0.1" data-r="'+i+'" data-c="1" value="'+r[1]+'"></td><td><input type="number" step="0.1" data-r="'+i+'" data-c="2" value="'+r[2]+'"></td><td><button type="button" class="b sm ghost" data-del="'+i+'">×</button></td></tr>';}).join('')+
        '</table></div><div class="row" style="margin-top:8px"><button type="button" class="b sm ghost" data-add="1">+ add a row</button><span></span></div>'+
        '<label>Assumed cumulative global capacity (GW) in 2030 · 2035 · 2040</label><div class="row">'+fut.map(function(f,i){return '<input type="number" data-f="'+i+'" value="'+f[1]+'" title="'+f[0]+'">';}).join('')+'</div>'+
        '<div class="out" id="'+id+'-out"></div><div id="'+id+'-chart" style="margin-top:10px"></div>';
      box.innerHTML=h;
      box.querySelectorAll('input[data-r]').forEach(function(inp){ inp.addEventListener('input',function(){ rows[+inp.getAttribute('data-r')][+inp.getAttribute('data-c')]=parseFloat(inp.value); compute(); }); });
      box.querySelectorAll('input[data-f]').forEach(function(inp){ inp.addEventListener('input',function(){ fut[+inp.getAttribute('data-f')][1]=parseFloat(inp.value); compute(); }); });
      box.querySelectorAll('[data-del]').forEach(function(b){ b.addEventListener('click',function(){ rows.splice(+b.getAttribute('data-del'),1); render(); }); });
      box.querySelector('[data-add]').addEventListener('click',function(){ var l=rows[rows.length-1]||[2024,80,80]; rows.push([l[0]+1,l[1],l[2]*1.2]); render(); });
      compute();
    }
    function compute(){
      var ok=rows.filter(function(r){return r[1]>0&&r[2]>0;}); var out=$(id+'-out'); if(ok.length<3){ out.innerHTML='Need at least three rows with positive values.'; return; }
      var x=ok.map(function(r){return Math.log(r[2]);}), y=ok.map(function(r){return Math.log(r[1]);});
      var f=ols(x,y), b=-f.b, lr=1-Math.pow(2,-b);
      var last=ok[ok.length-1], Q0=last[2], C0=last[1];
      var rates=[{n:'Conservative',lr:0.10},{n:'Central',lr:0.15},{n:'Aggressive',lr:0.20}];
      function proj(lrate,Q){ var bb=-Math.log2(1-lrate); return C0*Math.pow(Q/Q0,-bb); }
      var tbl='<div class="tw"><table><tr><th>Scenario</th><th>Learning rate</th>'+fut.map(function(ff){return '<th class="c">'+ff[0]+' · '+ff[1]+' GW</th>';}).join('')+'</tr>'+
        rates.map(function(r){return '<tr><td><b>'+r.n+'</b></td><td>'+Math.round(r.lr*100)+'%</td>'+fut.map(function(ff){return '<td class="c">$'+fmt(proj(r.lr,ff[1]),0)+'</td>';}).join('')+'</tr>';}).join('')+
        '<tr><td><b>Your fitted rate</b></td><td>'+fmt(lr*100,1)+'%</td>'+fut.map(function(ff){return '<td class="c">$'+fmt(proj(lr,ff[1]),0)+'</td>';}).join('')+'</tr></table></div>';
      out.innerHTML='<span class="big">'+fmt(lr*100,1)+'%</span> &nbsp;learning rate from your data &nbsp;·&nbsp; b = '+fmt(b,3)+' &nbsp;·&nbsp; R² = '+fmt(f.r2,3)+
        '<p class="note">Published offshore-wind learning rates sit at roughly 9–18% depending on window and geography. Projections start from your last row ($'+fmt(C0,0)+' at '+fmt(Q0,0)+' GW): Cost(Q) = Cost(Q₀) × (Q/Q₀)<sup>−b</sup>, b = −log₂(1 − LR). '+
        (lr<0.05?'<b>A rate under 5% means your data barely learns — check the capacity column.</b> ':'')+(lr>0.3?'<b>Over 30% is faster than any technology has sustained — check the cost column.</b> ':'')+'</p>'+tbl;
      chart(ok,f,lr,fut,proj);
    }
    function chart(ok,f,lr,fut,proj){
      var W=640,H=300,L=56,R=16,T=16,B=40;
      var xs=ok.map(function(r){return Math.log(r[2]);}).concat(fut.map(function(ff){return Math.log(ff[1]);}));
      var ys=ok.map(function(r){return Math.log(r[1]);}).concat([Math.log(proj(0.20,fut[2][1])),Math.log(proj(0.10,fut[2][1]))]);
      var x0=Math.min.apply(null,xs)-0.2,x1=Math.max.apply(null,xs)+0.2,y0=Math.min.apply(null,ys)-0.15,y1=Math.max.apply(null,ys)+0.15;
      function X(v){return L+(v-x0)/(x1-x0)*(W-L-R);} function Y(v){return T+(y1-v)/(y1-y0)*(H-T-B);}
      var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Log-log plot of LCOE against cumulative capacity with the fitted line and three projections">';
      [10,20,50,100,200,500,1000].forEach(function(g){ var lg=Math.log(g); if(lg>x0&&lg<x1)s+='<line x1="'+X(lg)+'" y1="'+T+'" x2="'+X(lg)+'" y2="'+(H-B)+'" stroke="#E5D9C3"/><text x="'+X(lg)+'" y="'+(H-B+16)+'" font-size="11" text-anchor="middle" fill="#6B7A6C">'+g+'</text>'; });
      [20,30,50,80,120,200,300].forEach(function(g){ var lg=Math.log(g); if(lg>y0&&lg<y1)s+='<line x1="'+L+'" y1="'+Y(lg)+'" x2="'+(W-R)+'" y2="'+Y(lg)+'" stroke="#E5D9C3"/><text x="'+(L-6)+'" y="'+(Y(lg)+4)+'" font-size="11" text-anchor="end" fill="#6B7A6C">$'+g+'</text>'; });
      s+='<text x="'+(W/2)+'" y="'+(H-4)+'" font-size="11" text-anchor="middle" fill="#3D4F3E">cumulative installed capacity, GW (log)</text>';
      var xa=Math.log(ok[0][2]), xb=Math.log(ok[ok.length-1][2]);
      s+='<line x1="'+X(xa)+'" y1="'+Y(f.a+f.b*xa)+'" x2="'+X(xb)+'" y2="'+Y(f.a+f.b*xb)+'" stroke="#2C5530" stroke-width="2.5"/>';
      var cols={0.10:'#B3402A',0.15:'#C9A227',0.20:'#4A8B3A'}; var Q0=ok[ok.length-1][2], C0=ok[ok.length-1][1];
      [0.10,0.15,0.20].forEach(function(r){ var p='M'+X(Math.log(Q0))+','+Y(Math.log(C0)); fut.forEach(function(ff){p+=' L'+X(Math.log(ff[1]))+','+Y(Math.log(proj(r,ff[1])));}); s+='<path d="'+p+'" fill="none" stroke="'+cols[r]+'" stroke-width="2" stroke-dasharray="6 4"/>'; s+='<text x="'+(X(Math.log(fut[2][1]))-4)+'" y="'+(Y(Math.log(proj(r,fut[2][1])))-5)+'" font-size="11" text-anchor="end" fill="'+cols[r]+'">'+Math.round(r*100)+'% · $'+fmt(proj(r,fut[2][1]),0)+'</text>'; });
      ok.forEach(function(r){ s+='<circle cx="'+X(Math.log(r[2]))+'" cy="'+Y(Math.log(r[1]))+'" r="4.5" fill="#fff" stroke="#2C5530" stroke-width="2"><title>'+r[0]+': $'+r[1]+' at '+r[2]+' GW</title></circle>'; });
      s+='</svg>';
      $(id+'-chart').innerHTML=s+'<p class="note">Dots = your data (observed). Solid = the fitted line. Dashed = projections at 10 / 15 / 20% from your last point. If the dots curve away from the solid line, Wright\'s Law is not the right shape for this series.</p>';
    }
    render();
  }

  /* ---- boot ---- */
  function init(){
    wireSections(); wireWork(); wireForums(); paintBar();
    if(window.StatsTrack){
      StatsTrack.init({module:MOD,title:document.body.getAttribute('data-title')||document.title,total:total()});
      syncDone();
    }
    window.addEventListener('statstrack:named',syncDone);
    if(window.CourseProgress&&$('courseBar'))CourseProgress.render({bar:$('courseBar'),pct:$('coursePct'),compact:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();

  return {step:step, quiz:quiz, recall:recall, classify:classify, wright:wright, fmt:fmt, esc:esc, done:function(id){return !!done[id];}, total:total, S:S};
})();
