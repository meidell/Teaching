/* =====================================================================
   ESM · Trading — the course-progress ("mama") bar.
   A renamed port of UMEF/gen110/courseprogress.js (itself from
   SUMAS/mba406 and UMEF/ideas-e1410), French only; same two modes:
     • full    — bar + per-day cards + caption, on index.html
     • compact — segmented bar only, in the top banner of every day page
   Overall % = mean of chapter fractions over the LIVE chapters that count.
   Reads local progress instantly (trading_done_<mod>, written by
   /shared/progress.js), then refines from Firebase trading/<sid>/mod
   when the student is signed in through /shared/login.js (trading_auth).

   Sixteen séances of 3 h (w1…w16, seanceN.html) and six ateliers of a day
   (a1…a6, atelierN.html). `total` = SECTIONS.length of that page — 0 until
   the page ships (a 0 total counts as 0 %, never divides); `live` flips as
   each page ships. The test de connaissances (séance 16) is not a chapter.
   ⚠ Adding a REQUIRED chapter mid-course lowers every student's displayed
   percentage; a tool page (the Jeopardy, a simulator) must be opt:true or
   stay out of CHAPTERS altogether.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="trading", K="trading";
  var T=window.T||function(fr,en){return fr;};
  var CHAPTERS=[
    {mod:'w1', short:'S1', name:'Séance 1 · Formation des prix, contrepartie et coûts', total:7, live:true, href:'seance1.html'},
    {mod:'w2', short:'S2', name:'Séance 2 · Gestion du risque et money management', total:7, live:true, href:'seance2.html'},
    {mod:'w3', short:'S3', name:'Séance 3 · Plateforme, ordres, levier et marge', total:0, live:false, href:'seance3.html'},
    {mod:'w4', short:'S4', name:'Séance 4 · Fondamentaux et indicateurs macroéconomiques', total:0, live:false, href:'seance4.html'},
    {mod:'w5', short:'S5', name:'Séance 5 · Classes d’actifs et instruments I', total:0, live:false, href:'seance5.html'},
    {mod:'w6', short:'S6', name:'Séance 6 · Classes d’actifs et instruments II', total:0, live:false, href:'seance6.html'},
    {mod:'w7', short:'S7', name:'Séance 7 · Matières premières', total:0, live:false, href:'seance7.html'},
    {mod:'w8', short:'S8', name:'Séance 8 · Le marché des cryptomonnaies', total:0, live:false, href:'seance8.html'},
    {mod:'w9', short:'S9', name:'Séance 9 · Analyse technique I : décrire le prix', total:0, live:false, href:'seance9.html'},
    {mod:'w10', short:'S10', name:'Séance 10 · Analyse technique II : des indicateurs aux règles testables', total:0, live:false, href:'seance10.html'},
    {mod:'w11', short:'S11', name:'Séance 11 · Stratégies I : tendance, breakout et retour à la moyenne', total:0, live:false, href:'seance11.html'},
    {mod:'w12', short:'S12', name:'Séance 12 · Stratégies II : scalping et intraday', total:0, live:false, href:'seance12.html'},
    {mod:'w13', short:'S13', name:'Séance 13 · Stratégies III : spreads et pair trading', total:0, live:false, href:'seance13.html'},
    {mod:'w14', short:'S14', name:'Séance 14 · Finance comportementale et discipline', total:0, live:false, href:'seance14.html'},
    {mod:'w15', short:'S15', name:'Séance 15 · Backtesting et évaluation d’une stratégie', total:0, live:false, href:'seance15.html'},
    {mod:'w16', short:'S16', name:'Séance 16 · Atelier intégratif : le plan de trading · test de connaissances', total:0, live:false, href:'seance16.html'},
    {mod:'a1', short:'A1', name:'Atelier 1 · Exécution et scalping', total:0, live:false, href:'atelier1.html'},
    {mod:'a2', short:'A2', name:'Atelier 2 · Journée événement macro', total:0, live:false, href:'atelier2.html'},
    {mod:'a3', short:'A3', name:'Atelier 3 · Swing : tendance et retour à la moyenne', total:0, live:false, href:'atelier3.html'},
    {mod:'a4', short:'A4', name:'Atelier 4 · Spreads et pair trading', total:0, live:false, href:'atelier4.html'},
    {mod:'a5', short:'A5', name:'Atelier 5 · Revue du journal de trading', total:0, live:false, href:'atelier5.html'},
    {mod:'a6', short:'A6', name:'Atelier 6 · Soutenance du plan de trading', total:0, live:false, href:'atelier6.html'}
  ];


  function localDone(mod){try{var o=JSON.parse(localStorage.getItem(K+'_done_'+mod)||'{}');var n=0;for(var k in o){if(o[k])n++;}return n;}catch(e){return 0;}}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  /* build the chapter data straight from a student's Firebase mod object —
     used by the instructor dashboard to draw each student's course bar */
  function dataFromMods(modObj){var data={};CHAPTERS.forEach(function(c){var n=0,node=modObj&&modObj[c.mod];if(node&&node.done){for(var k in node.done){if(node.done[k])n++;}}data[c.mod]={done:Math.min(c.total,n)};});return data;}
  function counted(){return CHAPTERS.filter(function(c){return !c.opt;});}
  function pctOf(data){var u=counted().filter(function(c){return c.live;}),s=0;if(!u.length)return 0;u.forEach(function(c){s+=c.total?Math.min(1,data[c.mod].done/c.total):0;});return Math.round(s/u.length*100);}
  function caption(data){
    var live=counted().filter(function(c){return c.live;});
    var done=live.filter(function(c){return c.total&&data[c.mod].done>=c.total;}).length;
    var up=counted().filter(function(c){return !c.live;}).length;
    if(T('fr','en')==='en'){
      return (done===live.length
        ? '✓ You’re up to date — everything published so far is done.'
        : 'You’ve completed '+done+' of '+live.length+' published day'+(live.length>1?'s':'')+'. The bar fills as you do each day’s work.')
        + (up?' '+up+' more day'+(up>1?'s':'')+' to come — the hatched segments.':'');
    }
    return (done===live.length
      ? '✓ Vous êtes à jour — tout ce qui est publié est terminé.'
      : 'Vous avez terminé '+done+' séance'+(done>1?'s':'')+' sur '+live.length+' publiée'+(live.length>1?'s':'')+'. La barre se remplit à mesure que vous faites le travail de chaque séance.')
      + (up?' '+up+' séance'+(up>1?'s':'')+' encore à venir — les segments hachurés.':'');
  }
  function buildList(data,el){
    el.innerHTML='';
    CHAPTERS.forEach(function(c){
      var d=data[c.mod].done,st,cls;
      if(!c.live||!c.total){st=T('À venir','Upcoming');cls='up';}   /* total 0 = page not shipped */
      else if(d>=c.total){st=T('Terminé ✓','Done ✓');cls='done';}
      else if(d>0){st=d+'/'+c.total;cls='prog';}
      else if(c.opt){st=T('Facultatif','Optional');cls='up';}
      else{st=T('Pas commencé','Not started');cls='prog';}
      var ci=document.createElement('div');ci.className='ci'+(c.opt?' opt':'');
      ci.innerHTML='<span></span><span class="st '+cls+'"></span>';
      if(c.href&&c.live){
        var a=document.createElement('a');a.href=c.href;a.textContent=c.name;
        a.style.cssText='color:inherit;text-decoration:none;border-bottom:1px dotted currentColor;';
        ci.children[0].appendChild(a);
      } else ci.children[0].textContent=c.name;
      ci.children[1].textContent=st;
      el.appendChild(ci);
    });
  }
  function paint(data,opts){
    if(opts.bar){
      opts.bar.innerHTML='';
      counted().forEach(function(c){
        var frac=c.total?Math.min(1,data[c.mod].done/c.total):0;
        if(opts.compact){
          var seg=document.createElement('div');seg.className='cseg'+((!c.live||!c.total)?' locked':'');
          seg.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':T('à venir','upcoming'));
          seg.innerHTML='<div class="cf" style="width:'+(frac*100)+'%"></div>';
          opts.bar.appendChild(seg);
        }else{
          var col=document.createElement('div');col.className='segcol';
          col.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':T('à venir','upcoming'));
          col.innerHTML='<div class="seg'+((!c.live||!c.total)?' locked':'')+(frac>=1?' done':'')+'"><div class="fill" style="width:'+(frac*100)+'%"></div></div><span class="code"></span>';
          col.querySelector('.code').textContent=c.short;
          opts.bar.appendChild(col);
        }
      });
    }
    if(opts.pct)opts.pct.textContent=pctOf(data)+'%';
    if(opts.cap)opts.cap.textContent=caption(data);
    if(opts.list)buildList(data,opts.list);
    if(opts.reveal)opts.reveal.style.display='block';
  }
  function render(opts){
    var data={};CHAPTERS.forEach(function(c){data[c.mod]={done:Math.min(c.total,localDone(c.mod))};});
    paint(data,opts);
    var a=auth();
    if(a){
      fetch(DB+'/'+NS+'/'+a.sid+'/mod.json').then(function(r){return r.json();}).then(function(m){
        if(!m)return;
        CHAPTERS.forEach(function(c){var node=m[c.mod];if(node&&node.done){var n=0;for(var k in node.done){if(node.done[k])n++;}n=Math.min(c.total,n);if(n>data[c.mod].done)data[c.mod].done=n;}});
        paint(data,opts);
      }).catch(function(){});
    }
  }
  return {CHAPTERS:CHAPTERS,render:render,pct:pctOf,paint:paint,dataFromMods:dataFromMods,auth:auth};
})();
