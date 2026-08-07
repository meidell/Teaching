/* =====================================================================
   SHARED · course lifecycle.
   Reads `status` from /courses.json and does two jobs.

   1. On a course page — if that course is archived, put a banner at the
      top saying so and linking to whatever replaced it. Old links keep
      working (students bookmark them, LMS pages link to them), they just
      stop being mistaken for the current material.

        <body data-course="ombafr455-2025">
        <script src="/shared/status.js" defer></script>

      A page can also name the course explicitly, for folders that are
      not a data-course namespace:

        <script>window.COURSE_STATUS_ID='sustainable-finance';</script>

   2. On the root catalogue — CourseStatus.decorate() marks archived
      cards and, in development, warns in the console when courses.json
      and the hand-written grid have drifted apart. There is no build
      step to catch that for us.
   ===================================================================== */
window.CourseStatus = (function () {
  "use strict";

  var STR = {
    en: { archived:"Archived course",
          moved:"This is the {term} edition and is no longer maintained. The current version is ",
          plain:"This course has finished and is kept here for reference." },
    fr: { archived:"Cours archivé",
          moved:"Ceci est l'édition {term} et n'est plus mise à jour. La version actuelle est ",
          plain:"Ce cours est terminé et reste disponible pour référence." }
  };

  function css(){
    if(document.getElementById('cs-css'))return;
    var s=document.createElement('style'); s.id='cs-css';
    s.textContent=
    '#cs-bar{display:flex;align-items:center;gap:12px;background:#5B4A1F;color:#fff;padding:11px 18px;'+
    'font:14px/1.45 "Helvetica Neue",Helvetica,Arial,sans-serif;position:relative;z-index:81;}'+
    '#cs-bar .cs-ico{font-size:16px;flex:none;}'+
    '#cs-bar b{color:#F0C64A;}'+
    '#cs-bar a{color:#fff;text-decoration:underline;}'+
    '.cs-archived{position:relative;opacity:.72;}'+
    '.cs-badge{display:inline-block;background:rgba(240,198,74,.16);border:1px solid rgba(240,198,74,.5);'+
    'color:#F0C64A;border-radius:12px;padding:2px 9px;font-size:10px;letter-spacing:1px;'+
    'text-transform:uppercase;font-weight:700;margin-left:8px;vertical-align:middle;}';
    document.head.appendChild(s);
  }

  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}

  function banner(course, reg){
    css();
    var lang=(document.documentElement.getAttribute('data-lang')==='fr'||course.lang==='fr')?'fr':'en';
    var t=STR[lang];
    var repl=course.supersededBy&&reg.courses.filter(function(c){return c.id===course.supersededBy;})[0];
    var msg=repl
      ? t.moved.replace('{term}',course.term||'previous')+'<a href="/'+encodeURI(repl.dir)+'/index.html">'+
        esc(repl.code||repl.title[lang]||repl.title.en)+'</a>.'
      : t.plain;
    var bar=document.createElement('div'); bar.id='cs-bar';
    bar.innerHTML='<span class="cs-ico">🗄️</span><span><b>'+esc(t.archived)+'.</b> '+msg+'</span>';
    document.body.insertBefore(bar,document.body.firstChild);
  }

  function currentId(){
    if(window.COURSE_STATUS_ID)return window.COURSE_STATUS_ID;
    var b=document.body,h=document.documentElement;
    return (b&&b.getAttribute('data-course'))||(h&&h.getAttribute('data-course'))||'';
  }

  function registry(){
    return (window.CourseConfig&&window.CourseConfig.load)
      ? window.CourseConfig.load()
      : fetch('/courses.json').then(function(r){return r.json();});
  }

  function go(){
    var id=currentId(); if(!id)return;
    registry().then(function(reg){
      var c=reg.courses.filter(function(x){return x.id===id;})[0];
      if(c&&c.status==='archived')banner(c,reg);
    }).catch(function(){});
  }

  /* root catalogue: badge the archived cards, flag drift in the console */
  function decorate(){
    registry().then(function(reg){
      css();
      var byDir={};
      reg.courses.forEach(function(c){ byDir[c.home]=c; });
      var seen={};
      Array.prototype.forEach.call(document.querySelectorAll('a.course-card'),function(a){
        var href=decodeURI(a.getAttribute('href')||'');
        var c=byDir[href]; if(!c)return;
        seen[c.id]=true;
        if(c.status==='archived'){
          a.classList.add('cs-archived');
          var h=a.querySelector('h3');
          if(h&&!h.querySelector('.cs-badge')){
            var b=document.createElement('span'); b.className='cs-badge'; b.textContent='Archived';
            h.appendChild(b);
          }
        }
      });
      var missing=reg.courses.filter(function(c){return c.listed&&!seen[c.id];});
      if(missing.length&&/localhost|127\.0\.0\.1/.test(location.hostname)){
        console.warn('courses.json lists these as `listed` but the grid has no card for them:',
                     missing.map(function(c){return c.id+' -> '+c.home;}));
      }
    }).catch(function(){});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();

  return { decorate:decorate, banner:banner };
})();
