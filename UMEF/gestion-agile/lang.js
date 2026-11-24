/* =====================================================================
   SWISS UMEF · MPM 503 Gestion de projet agile et méthodes hybrides — the language switch.

   MPM 503 is FRENCH ONLY (no -en pages). The file is kept from
   UMEF/mfb545 because journee.js, presence.js, exercises.js and
   courseprogress.js call T(fr, en); every page has lang="fr", so T()
   returns the French string.

   Loaded FIRST on every page:
     • MPM503_LANG   'fr' | 'en', from <html lang>
     • T(fr, en)     picks the string for this page — used by the runtime
                     files (journee.js, presence.js, exercises.js,
                     courseprogress.js) whose copy is hard-coded
     • window.COURSE_LANG  so /shared/config.js hands login.js,
                     progress.js and chat.js the page's language
     • a [data-lang-switch] link records the choice (mpm503_lang); ONLY
       the hub redirects to the remembered language, so a pasted deep
       link always opens as pasted.
   ===================================================================== */
(function(){
  var L=(document.documentElement.getAttribute('lang')||'fr').slice(0,2);
  if(L!=='en')L='fr';
  window.MPM503_LANG=L;
  window.COURSE_LANG=L;
  window.T=function(fr,en){return L==='en'&&en!=null?en:fr;};
  /* journee1.html ↔ journee1-en.html */
  window.MPM503_HREF=function(href){return L==='en'?href.replace(/\.html/,'-en.html'):href;};
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-lang-switch]');
    if(!a)return;
    try{localStorage.setItem('mpm503_lang',a.getAttribute('data-lang-switch'));}catch(err){}
  });
  if(/\/(index(-en)?\.html)?$/.test(location.pathname)){
    var want=null;try{want=localStorage.getItem('mpm503_lang');}catch(err){}
    if(want&&want!==L&&(want==='fr'||want==='en'))location.replace(want==='en'?'index-en.html':'index.html');
  }
})();
