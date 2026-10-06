/* =====================================================================
   SWISS UMEF · GEN 110 — the language switch.

   The course exists twice: French (index.html, seance1.html …) and
   English (index-en.html, seance1-en.html …). Same course id, same
   module ids, same data-work fields, same Firebase namespace — a student
   can switch language at any point and keep every bit of progress.

   What this file does, loaded FIRST on every gen110 page:
     • GEN110_LANG   'fr' | 'en', from <html lang>
     • T(fr, en)     pick the string for this page — used by the runtime
                     files (exercises.js, presence.js, courseprogress.js)
                     whose copy is otherwise hard-coded
     • window.COURSE_LANG  so /shared/config.js hands login.js,
                     progress.js and chat.js the page's language
     • the preference (gen110_lang) is remembered when the student uses
       a language link, and the hub honours it: index.html sends an
       'en' reader to index-en.html and vice versa — only the hub, so a
       pasted deep link is always shown as pasted.
   ===================================================================== */
(function(){
  var L=(document.documentElement.getAttribute('lang')||'fr').slice(0,2);
  if(L!=='en')L='fr';
  window.GEN110_LANG=L;
  window.COURSE_LANG=L;
  window.T=function(fr,en){return L==='en'?en:fr;};
  window.GEN110_OTHER=function(href){ /* seance1.html ↔ seance1-en.html */
    return L==='en'?href.replace(/-en\.html$/,'.html'):href.replace(/\.html$/,'-en.html');
  };
  /* a language link carries data-lang-switch; clicking it records the choice */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-lang-switch]');
    if(!a)return;
    try{localStorage.setItem('gen110_lang',a.getAttribute('data-lang-switch'));}catch(err){}
  });
  /* the hub redirects to the remembered language; nothing else does */
  var path=location.pathname;
  if(/\/(index(-en)?\.html)?$/.test(path)){
    var want=null;try{want=localStorage.getItem('gen110_lang');}catch(err){}
    if(want&&want!==L&&(want==='fr'||want==='en')){
      location.replace(want==='en'?'index-en.html':'index.html');
    }
  }
})();
