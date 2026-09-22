/* =====================================================================
   E1410 · course access gate (shared password).
   Students reach the course via a QR / link that carries the access
   token, e.g.  .../ideas-e1410/index.html?auth=ideas1410x7k2
   This script (loaded SYNCHRONOUSLY in <head>, before any other gate)
   verifies that token. If valid it is remembered on the device
   (localStorage + 1-year cookie) so the token is never needed again
   here. If missing/wrong, the page is greyed out with an "Incorrect
   password" lock screen offering a manual entry box.

   Only after this passes does the per-student registration (join.html)
   run. Sets window.E1410_ACCESS = true/false for the page's own gate.

   To rotate the code: change ACCESS_TOKEN below and regenerate the QR
   (qr-e1410.png points at index.html?auth=<ACCESS_TOKEN>).
   NOTE: this is a soft gate (the token is visible in client code and
   the DB namespace is world-readable) — it keeps the course off the
   open web, it is not bank-grade security.
   ===================================================================== */
(function(){
  "use strict";
  var ACCESS_TOKEN='ideas1410x7k2';   /* <-- the course access code */
  var KEY='e1410_access';

  function getCookie(k){try{var m=document.cookie.match('(?:^|; )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}
  function setCookie(k,v){try{document.cookie=k+'='+encodeURIComponent(v)+';path=/;max-age=31536000;samesite=lax';}catch(e){}}
  function stored(){var v='';try{v=localStorage.getItem(KEY)||'';}catch(e){}if(!v)v=getCookie(KEY);return v;}
  function store(v){try{localStorage.setItem(KEY,v);}catch(e){}setCookie(KEY,v);}

  var m=(location.search||'').match(/[?&]auth=([^&#]+)/);
  var provided=m?decodeURIComponent(m[1]):'';
  var ok=false;
  if(provided&&provided===ACCESS_TOKEN){
    store(provided);ok=true;
    var s=location.search.replace(/([?&])auth=[^&#]*/,'').replace(/^&/,'?');if(s==='?')s='';
    try{history.replaceState(null,'',location.pathname+s+location.hash);}catch(e){}
  }else if(stored()===ACCESS_TOKEN){ok=true;}

  window.E1410_ACCESS=ok;
  if(ok)return;

  /* ---- locked: grey out + message ---- */
  var wrongTried=(provided!=='');
  var css=document.createElement('style');
  css.textContent=
    'html.e1410-locked{background:#0f172a;}'+
    'html.e1410-locked body{visibility:hidden!important;}'+
    '#e1410-lock{position:fixed;inset:0;z-index:99999;display:none;visibility:visible!important;align-items:center;justify-content:center;padding:22px;'+
    'background:#0f172a;font-family:"Plus Jakarta Sans","Helvetica Neue",Arial,sans-serif;}'+
    'html.e1410-locked #e1410-lock{display:flex;}'+
    '#e1410-lock .box{background:#fff;border-radius:18px;padding:30px 26px;max-width:360px;width:100%;text-align:center;box-shadow:0 24px 60px -20px rgba(0,0,0,.6);}'+
    '#e1410-lock .lk{font-size:32px;}'+
    '#e1410-lock h2{font-size:19px;font-weight:800;color:#0f172a;margin:8px 0 4px;letter-spacing:-.3px;}'+
    '#e1410-lock p{font-size:13px;color:#64748b;margin-bottom:16px;line-height:1.5;}'+
    '#e1410-lock .err{color:#AB0E00;font-weight:700;margin-bottom:12px;}'+
    '#e1410-lock input{width:100%;text-align:center;letter-spacing:2px;font:15px "Plus Jakarta Sans",Arial,sans-serif;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:12px;}'+
    '#e1410-lock input:focus{outline:none;border-color:#AB0E00;box-shadow:0 0 0 3px rgba(171,14,0,.12);}'+
    '#e1410-lock button{width:100%;background:#AB0E00;color:#fff;border:none;border-radius:30px;padding:12px;font:800 14px "Plus Jakarta Sans",Arial,sans-serif;cursor:pointer;}'+
    '#e1410-lock button:hover{background:#7C0A00;}';
  (document.head||document.documentElement).appendChild(css);
  document.documentElement.classList.add('e1410-locked');

  function build(){
    if(document.getElementById('e1410-lock'))return;
    var d=document.createElement('div');d.id='e1410-lock';
    d.innerHTML='<div class="box"><div class="lk">🔒</div>'+
      '<h2>E1410 · Access required</h2>'+
      '<p>This course is private. Open it from the class QR code or link — or enter the course access password below.</p>'+
      (wrongTried?'<div class="err">Incorrect password.</div>':'')+
      '<input id="e1410-lock-in" type="text" inputmode="text" autocomplete="off" placeholder="access password" aria-label="access password">'+
      '<button id="e1410-lock-go">Unlock</button></div>';
    document.body.appendChild(d);
    var inp=document.getElementById('e1410-lock-in'),btn=document.getElementById('e1410-lock-go');
    function tryit(){
      var v=(inp.value||'').trim();
      if(v===ACCESS_TOKEN){store(v);location.reload();return;}
      var e=d.querySelector('.err');
      if(!e){e=document.createElement('div');e.className='err';d.querySelector('p').insertAdjacentElement('afterend',e);}
      e.textContent='Incorrect password.';inp.value='';inp.focus();
    }
    btn.addEventListener('click',tryit);
    inp.addEventListener('keydown',function(e){if(e.key==='Enter')tryit();});
    setTimeout(function(){inp.focus();},60);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
