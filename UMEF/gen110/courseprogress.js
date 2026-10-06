/* =====================================================================
   SWISS UMEF · GEN 110 Intelligence artificielle — the course-progress
   ("mama") bar. A renamed port of SUMAS/mba406/courseprogress.js (itself
   from UMEF/ideas-e1410), captions in French; same two modes:
     • full    — bar + per-week cards + caption, on index.html
     • compact — segmented bar only, in the top banner of every week page
   Overall % = mean of chapter fractions over the LIVE chapters that count.
   Reads local progress instantly (gen110_done_<mod>, written by
   /shared/progress.js), then refines from Firebase gen110/<sid>/mod
   when the student is signed in through /shared/login.js (gen110_auth).

   The ten séances of the UMEF syllabus are all listed so the bar has the
   shape of the whole semester from day one; a séance that is not yet
   written is live:false — drawn hatched, excluded from the percentage —
   and flips to live:true the day its page ships. The final exam (3 Feb
   2027) is not a chapter: there is nothing to do for it on the site.
   Module ids are w1…w10 — the dashboard's presence picker builds `w`+n —
   even though the pages are seance1.html … seance10.html.
   ⚠ Adding a REQUIRED chapter mid-semester lowers every student's
   displayed percentage; any tool page added later must be opt:true —
   listed, never counted.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="gen110", K="gen110";
  /* GEN 110: ten séances of 3 h 15 (Tuesdays 13h30–16h45, two blocks of
     90 min). One page per séance; `total` on a séance page is
     SECTIONS.length (8 for séance 1). */
  /* Copy in both languages: T() (lang.js) picks the page's. The English
     page of a séance is seanceN-en.html — same module id, same progress. */
  var T=window.T||function(fr,en){return fr;};
  var CHAPTERS=[
    {mod:'w1', short:'S1', name:T('Séance 1 · L’IA, on commence par s’en servir','Session 1 · AI: we start by using it'),                        total:8, live:true, href:T('seance1.html','seance1-en.html')},
    {mod:'w2', short:'S2', name:T('Séance 2 · Bien demander I — le texte','Session 2 · Asking well I — text'),                                   total:8, live:false},
    {mod:'w3', short:'S3', name:T('Séance 3 · Bien demander II — son, image, vidéo','Session 3 · Asking well II — sound, image, video'),         total:8, live:false},
    {mod:'w4', short:'S4', name:T('Séance 4 · Excel et Word avec l’IA — finance','Session 4 · Excel and Word with AI — finance'),                total:8, live:false},
    {mod:'w5', short:'S5', name:T('Séance 5 · L’IA au travail — marketing, finance, RH','Session 5 · AI at work — marketing, finance, HR'),      total:8, live:false},
    {mod:'w6', short:'S6', name:T('Séance 6 · Programmer sans être programmeur','Session 6 · Programming without being a programmer'),           total:8, live:false},
    {mod:'w7', short:'S7', name:T('Séance 7 · Protection des données et IA','Session 7 · Data protection and AI'),                              total:8, live:false},
    {mod:'w8', short:'S8', name:T('Séance 8 · Agents et assistants','Session 8 · Agents and assistants'),                                       total:8, live:false},
    {mod:'w9', short:'S9', name:T('Séance 9 · Employable — les compétences IA, et l’avenir','Session 9 · Employable — AI skills, and the future'), total:8, live:false},
    {mod:'w10',short:'S10',name:T('Séance 10 · Présentations et préparation de l’examen','Session 10 · Presentations and exam preparation'),      total:4, live:false}
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
        : 'You’ve completed '+done+' of '+live.length+' published session'+(live.length>1?'s':'')+'. The bar fills as you do each session’s work.')
        + (up?' '+up+' more session'+(up>1?'s':'')+' to come — the hatched segments.':'');
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
