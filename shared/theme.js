/* =====================================================================
   SHARED · light / dark, one switch per device.

     <head>
       <link rel="stylesheet" href="/shared/themes/heg.css">
       <script src="/shared/theme.js"></script>      <!-- NOT deferred -->

   IT MUST RUN IN <head>, SYNCHRONOUSLY. The attribute it sets is what the
   dark palette hangs off, so if it runs after first paint every page
   flashes white before turning dark — which is worse than having no dark
   mode at all. That is also why the file is tiny and has no dependency on
   config.js: it is on the critical path of every page that opts in.

   HOW THE PALETTE IS SELECTED

     <html data-theme="dark">     the dark palette
     <html data-theme="light">    the light one
     no attribute                 light (the pre-theme behaviour)

   The stored preference is 'dark' | 'light' | 'auto', and **'auto' is
   resolved here, not in CSS** — this file reads `prefers-color-scheme`
   and writes the resulting attribute. One palette block in the stylesheet
   instead of two identical ones (`[data-theme=dark]` plus a media query),
   which is what keeps the two from drifting apart. The cost is that with
   JavaScript off every page is light: exactly what it is today, so
   nothing regresses.

   REDRAWING. A canvas or an inline SVG does not follow a CSS variable, so
   pages that draw their own charts must repaint. On every change this
   fires

       document → CustomEvent('course-theme', {detail:{theme:'dark'}})

   and `Theme.color('--navy')` reads a token's current value. A page that
   draws should keep its colours in one object, rebuild it from those
   tokens and redraw on the event — see the `paintTheme()` pattern in
   HEG/statistics/week1.html.

   PRINTING is always light, forced in the stylesheet, because the lecture
   deck is printed to PDF and a black A4 is unusable. Do not "fix" that by
   hiding the print block.
   ===================================================================== */
window.Theme = (function () {
  "use strict";
  var KEY = 'jem_theme';          /* site-wide on purpose: one choice per person, not per course */
  var root = document.documentElement;

  function stored(){
    try{ var v=localStorage.getItem(KEY); return (v==='dark'||v==='light'||v==='auto')?v:'auto'; }
    catch(e){ return 'auto'; }
  }
  function systemDark(){
    try{ return !!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches); }
    catch(e){ return false; }
  }
  function resolve(pref){ return pref==='auto' ? (systemDark()?'dark':'light') : pref; }
  function apply(pref){
    var t=resolve(pref);
    root.setAttribute('data-theme',t);
    return t;
  }

  /* ---- before paint ---- */
  var PREF=stored(), NOW=apply(PREF);

  /* Following the system while it is on 'auto' — a laptop that dims itself
     at sunset should take the page with it, without a reload. */
  try{
    var mq=window.matchMedia('(prefers-color-scheme: dark)');
    var onSys=function(){ if(PREF==='auto')set('auto'); };
    if(mq.addEventListener)mq.addEventListener('change',onSys);
    else if(mq.addListener)mq.addListener(onSys);
  }catch(e){}

  function set(pref){
    PREF=pref;
    try{ localStorage.setItem(KEY,pref); }catch(e){}
    var was=NOW; NOW=apply(pref);
    paintBtn();
    if(NOW!==was){
      try{ document.dispatchEvent(new CustomEvent('course-theme',{detail:{theme:NOW,pref:PREF}})); }catch(e){}
    }
  }
  /* Two states, not three. A cycle through Auto is a thing a student has to
     understand; a switch is not. Choosing explicitly just pins it. */
  function toggle(){ set(NOW==='dark'?'light':'dark'); }

  function color(name){
    try{ return getComputedStyle(root).getPropertyValue(name).trim(); }catch(e){ return ''; }
  }

  /* ---- the button ---- */
  function css(){
    if(document.getElementById('thm-css'))return;
    var s=document.createElement('style'); s.id='thm-css';
    s.textContent=
      '.thm-btn{background:transparent;border:1px solid currentColor;border-radius:30px;'+
      'padding:5px 11px;font:700 12px/1 inherit;color:inherit;cursor:pointer;opacity:.75;'+
      'display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}'+
      '.thm-btn:hover{opacity:1;}'+
      '.thm-btn .thm-l{letter-spacing:.4px;}'+
      '@media (max-width:640px){.thm-btn .thm-l{display:none;}.thm-btn{padding:5px 9px;}}'+
      '.thm-float{position:fixed;top:10px;right:10px;z-index:250;background:var(--card,#fff);color:var(--ink,#111);}'+
      '@media print{.thm-btn{display:none!important;}}';
    document.head.appendChild(s);
  }
  var BTN=null;
  function paintBtn(){
    if(!BTN)return;
    var dark=NOW==='dark';
    BTN.innerHTML=(dark?'☀':'☾')+'<span class="thm-l">'+(dark?'Light':'Dark')+'</span>';
    BTN.title=(dark?'Switch to the light theme':'Switch to the dark theme')+
              (PREF==='auto'?' (currently following your system)':'');
    BTN.setAttribute('aria-label',BTN.title);
  }
  /* Into the chrome the page already has, so it does not float over content:
     the week pages' .topbar-inner, the hub's .navright, a tool's .topbar.

     ONLY IF THAT BAR IS A FLEX ROW. The tools' .topbar is a plain block —
     appending to it put the button on a line of its own under the logo,
     which is worse than floating. So a non-flex host is refused and the
     button pins itself to the corner instead. */
  function flexish(el){
    if(!el)return false;
    try{ var d=getComputedStyle(el).display; return d==='flex'||d==='inline-flex'||d==='grid'; }
    catch(e){ return false; }
  }
  function mount(){
    if(document.getElementById('thmBtn'))return;
    css();
    var host=null, cands=['.topbar-inner','.navright','.topbar','nav','header'];
    for(var i=0;i<cands.length&&!host;i++){
      var el=document.querySelector(cands[i]);
      if(flexish(el))host=el;
    }
    BTN=document.createElement('button');
    BTN.id='thmBtn'; BTN.type='button'; BTN.className='thm-btn';
    BTN.addEventListener('click',toggle);
    if(host){ BTN.style.marginLeft='auto'; host.appendChild(BTN); }
    else { BTN.classList.add('thm-float'); document.body.appendChild(BTN); }
    paintBtn();
  }
  /* ---- printing ----
     The stylesheet already forces the light palette on paper, but a chart
     drawn into an SVG or a canvas keeps whatever colours it was drawn with:
     printing from the dark theme would put pale-blue-on-white bars on the
     page. So the attribute itself flips for the duration of the print, which
     makes every `course-theme` listener repaint in light, and flips back
     afterwards. Browsers that never fire these events still get the CSS
     override — this only fixes what CSS cannot reach. */
  var PRINTING=false;
  function beforePrint(){
    if(PRINTING||NOW!=='dark')return;
    PRINTING=true; root.setAttribute('data-theme','light');
    try{ document.dispatchEvent(new CustomEvent('course-theme',{detail:{theme:'light',pref:PREF,printing:true}})); }catch(e){}
  }
  function afterPrint(){
    if(!PRINTING)return;
    PRINTING=false; root.setAttribute('data-theme',NOW);
    try{ document.dispatchEvent(new CustomEvent('course-theme',{detail:{theme:NOW,pref:PREF,printing:false}})); }catch(e){}
  }
  try{
    window.addEventListener('beforeprint',beforePrint);
    window.addEventListener('afterprint',afterPrint);
    var pmq=window.matchMedia&&window.matchMedia('print');
    if(pmq&&pmq.addEventListener)pmq.addEventListener('change',function(e){e.matches?beforePrint():afterPrint();});
  }catch(e){}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();

  return { get:function(){return NOW;}, pref:function(){return PREF;},
           set:set, toggle:toggle, color:color, mount:mount };
})();
