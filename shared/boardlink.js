/* =====================================================================
   SHARED · "📺 On the screen" buttons, for the instructor only.

   Any element on a course page that carries
       data-board="Title|field_a+field_b;Other title|field_c"
   gets a small button that opens /shared/board.html with those panels:
   the room's answers to that step, anonymous, for the TV. The attribute
   value is board.html's `p` parameter verbatim — see its header for the
   format. Load after config.js:
       <script src="/shared/boardlink.js" defer></script>

   The button is drawn only on the instructor's device: the
   `jem_instructor` marker that /shared/admin-gate.js writes once the
   gate has been given (localStorage, or its cookie). A student never
   sees it, and if one found the URL, board.html itself refuses without
   an unlocked gate and a signed-in instructor account.
   ===================================================================== */
(function(){
  "use strict";
  function isInstructor(){
    try{ if(localStorage.getItem('jem_instructor'))return true; }catch(e){}
    return /(?:^|; )jem_instructor=1/.test(document.cookie||'');
  }
  function boot(){
    if(!isInstructor())return;
    var els=document.querySelectorAll('[data-board]'); if(!els.length)return;
    var cid=(document.body&&document.body.getAttribute('data-course'))||'';
    if(!document.getElementById('bl-css')){
      var s=document.createElement('style');s.id='bl-css';
      s.textContent='.bl-btn{display:inline-flex;align-items:center;gap:6px;margin:2px 0 10px;font:800 12px/1 "Avenir Next",Arial,sans-serif;'+
        'color:#fff;background:#0E1A33;border:none;border-radius:20px;padding:7px 13px;cursor:pointer;text-decoration:none;}'+
        '.bl-btn:hover{background:#F39229;color:#0E1A33;}';
      document.head.appendChild(s);
    }
    Array.prototype.forEach.call(els,function(el){
      if(el.querySelector(':scope > .bl-btn'))return;
      var a=document.createElement('a');a.className='bl-btn';a.target='_blank';a.rel='noopener';
      a.href='/shared/board.html?course='+encodeURIComponent(cid)+'&p='+encodeURIComponent(el.getAttribute('data-board'));
      a.textContent='📺 On the screen';a.title='Instructor only: the room’s answers, anonymous, for the TV';
      /* right under the step's heading, where the instructor is looking */
      var h=el.querySelector('h2,h3');
      if(h&&h.parentNode===el)h.insertAdjacentElement('afterend',a);else el.insertBefore(a,el.firstChild);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
