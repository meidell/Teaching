/* =====================================================================
   SWISS UMEF · MIA 506 Déploiement et pilotage des systèmes d’IA en production — the course-progress ("mama") bar.
   A renamed port of UMEF/gen110/courseprogress.js (itself from
   SUMAS/mba406 and UMEF/ideas-e1410), French only; same two modes:
     • full    — bar + per-day cards + caption, on index.html
     • compact — segmented bar only, in the top banner of every day page
   Overall % = mean of chapter fractions over the LIVE chapters that count.
   Reads local progress instantly (mia506_done_<mod>, written by
   /shared/progress.js), then refines from Firebase mia506/<sid>/mod
   when the student is signed in through /shared/login.js (mia506_auth).

   Six journées of 6 h 30 (four blocks of 90 min). All six are listed so
   the bar has the shape of the course from day one; a journée not yet
   written is live:false — hatched, excluded from the percentage — and
   flips to live:true the day its page ships. `total` = SECTIONS.length of
   that page. The final exam (Sat 6 Feb 2027) is not a chapter.
   Module ids are w1…w6 — the dashboard's presence picker builds `w`+n —
   though the pages are journee1.html … journee6.html.
   ⚠ Adding a REQUIRED chapter mid-course lowers every student's displayed
   percentage; a tool page (the Jeopardy, a simulator) must be opt:true or
   stay out of CHAPTERS altogether.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="mia506", K="mia506";
  var T=window.T||function(fr,en){return fr;};
  var CHAPTERS=[
    {mod:'w1', short:'J1', name:'Journée 1 · Construire un modèle, le mettre sur un serveur, le casser', total:7, live:true,  href:'journee1.html'},
    {mod:'w2', short:'J2', name:'Journée 2 · Empaqueter et servir un modèle', total:9, live:false, href:'journee2.html'},
    {mod:'w3', short:'J3', name:'Journée 3 · Pipelines de données et automatisation (CI/CD)', total:9, live:false, href:'journee3.html'},
    {mod:'w4', short:'J4', name:'Journée 4 · Surveiller et piloter un modèle en production', total:9, live:false, href:'journee4.html'},
    {mod:'w5', short:'J5', name:'Journée 5 · Les grands modèles de langage en production', total:9, live:false, href:'journee5.html'},
    {mod:'w6', short:'J6', name:'Journée 6 · Gouvernance, risques, conformité · présentations des projets', total:6, live:false, href:'journee6.html'}
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
    var done=live.filter(function(c){return data[c.mod].done>=c.total;}).length;
    var up=counted().filter(function(c){return !c.live;}).length;
    if(T('fr','en')==='en'){
      return (done===live.length
        ? '✓ You’re up to date — everything published so far is done.'
        : 'You’ve completed '+done+' of '+live.length+' published day'+(live.length>1?'s':'')+'. The bar fills as you do each day’s work.')
        + (up?' '+up+' more day'+(up>1?'s':'')+' to come — the hatched segments.':'');
    }
    return (done===live.length
      ? '✓ Vous êtes à jour — tout ce qui est publié est terminé.'
      : 'Vous avez terminé '+done+' journée'+(done>1?'s':'')+' sur '+live.length+' publiée'+(live.length>1?'s':'')+'. La barre se remplit à mesure que vous faites le travail de chaque journée.')
      + (up?' '+up+' journée'+(up>1?'s':'')+' encore à venir — les segments hachurés.':'');
  }
  function buildList(data,el){
    el.innerHTML='';
    CHAPTERS.forEach(function(c){
      var d=data[c.mod].done,st,cls;
      if(!c.live){st=T('À venir','Upcoming');cls='up';}
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
          var seg=document.createElement('div');seg.className='cseg'+(!c.live?' locked':'');
          seg.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':T('à venir','upcoming'));
          seg.innerHTML='<div class="cf" style="width:'+(frac*100)+'%"></div>';
          opts.bar.appendChild(seg);
        }else{
          var col=document.createElement('div');col.className='segcol';
          col.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':T('à venir','upcoming'));
          col.innerHTML='<div class="seg'+(!c.live?' locked':'')+(frac>=1?' done':'')+'"><div class="fill" style="width:'+(frac*100)+'%"></div></div><span class="code"></span>';
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
