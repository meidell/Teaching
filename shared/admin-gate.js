/* =====================================================================
   SHARED · instructor gate.
   One password for every dashboard on the site, entered once per device.

     <script src="/shared/admin-gate.js"></script>
     AdminGate.mount({
       brand: 'OMBA401 · INSTRUCTOR',
       logo:  '/SUMAS/omba401/sumas-logo.png',
       theme: CourseConfig.get('omba401').theme,
       onUnlock: start
     });

   ONE PASSWORD, NO HASH HERE (23 Oct 2026). The password typed at any
   gate IS the instructor account's password, checked by Firebase
   (fb-auth.js) — there is no second "gate password" any more, and no
   hash of it in this file: this repo is public, and a hash of the
   account password could be cracked offline into full access to every
   cohort. The device keeps the account session (`jem_fb_session`), so
   the next visit opens straight through. Changing the password (on
   /shared/site.html) signs every OTHER device out.

   The unlock is site-wide on purpose: unlocking one course dashboard
   unlocks them all on that device. AdminGate.lock() forgets it again.

   ONE LOGIN (23 Oct 2026, Jan Erik: "a single and thus a separate login
   as instructor for all courses … let me be admin only … let that user
   have access to all courses as 'student'"). The gate now also accepts
   the INSTRUCTOR ACCOUNT's password (presence@janerikmeidell.com, the
   account the database trusts and the Insights app's instructor door
   uses): typing it here signs the account in through /shared/fb-auth.js,
   and a device holding that account's session (`jem_fb_session`) counts
   as unlocked everywhere — so one login opens the dashboards, chat,
   presence and releases, on the site and in the app. The old gate
   password (a SHA-256 in this file) was retired the same day.

   TWO HATS. On a COURSE page (anything outside /shared/) the instructor
   can switch to the STUDENT VIEW (`jem_view = 'student'`, the switch is
   the name pill drawn by login.js). There isUnlocked() answers false, so
   every page shows exactly what a student sees, and login.js signs the
   device in as the hidden student `_jem` (see login.js). The instructor
   pages under /shared/ ignore the hat.

   NOTE — this is a soft gate. It hides the instructor UI; it is not
   authentication, and it cannot protect the database (the rules do
   that). Never put anything here that must genuinely stay secret.
   ===================================================================== */
window.AdminGate = (function () {
  "use strict";

  var STORE_KEY = "jem_admin_pw";      /* the retired gate password's store: cleared on load */
  var LEGACY_KEYS = ["omba401_admin_ok","ombafr455_admin_ok","umef407_admin_ok",
                     "e1410_admin_ok","stats_admin_ok"];

  function matches(pw){ return false; }   /* AdminGate.check(): no gate password any more */
  try{ localStorage.removeItem(STORE_KEY); }catch(e){}
  /* the instructor account's session, stored by fb-auth.js; read here without loading it */
  function hasSession(){ try{ var v=JSON.parse(localStorage.getItem('jem_fb_session')||'null'); return !!(v&&v.rt); }catch(e){ return false; } }
  function trusted(){ return hasSession(); }
  function view(){ try{ return localStorage.getItem('jem_view')||'instructor'; }catch(e){ return 'instructor'; } }
  function onShared(){ return (location.pathname||'').indexOf('/shared/')===0; }
  function isUnlocked(){ return trusted() && !(view()==='student' && !onShared()); }
  /* load fb-auth.js on a page that did not, so the gate can sign the account in */
  function withFB(cb){
    if(window.FBAuth)return cb(window.FBAuth);
    var sc=document.createElement('script'); sc.src='/shared/fb-auth.js';
    sc.onload=function(){ cb(window.FBAuth||null); }; sc.onerror=function(){ cb(null); };
    document.head.appendChild(sc);
  }

  /* The instructor's own identity, for the COURSE pages. login.js and
     progress.js do not load this file, so an unlocked device also carries
     `jem_instructor` (localStorage + a 1-year cookie): there, the student
     sign-in prompt never opens and the pill reads the instructor's name.
     It unlocks nothing — it only stops a page asking who you are. */
  var ME_KEY = "jem_instructor", ME_NAME = "Jan Erik Meidell";
  function mark(on){
    try{
      if(on){ localStorage.setItem(ME_KEY, JSON.stringify({name:ME_NAME, ts:Date.now()}));
              document.cookie = ME_KEY+"=1; path=/; max-age=31536000; SameSite=Lax"; }
      else  { localStorage.removeItem(ME_KEY);
              document.cookie = ME_KEY+"=; path=/; max-age=0; SameSite=Lax"; }
    }catch(e){}
  }
  function lock(){
    mark(false);
    try{ localStorage.removeItem('jem_fb_session'); localStorage.removeItem('jem_view'); }catch(e){}
    try{ localStorage.removeItem(STORE_KEY); }catch(e){}
    try{ LEGACY_KEYS.forEach(function(k){ sessionStorage.removeItem(k); localStorage.removeItem(k); }); }catch(e){}
  }

  function css(T){
    if(document.getElementById('ag-css'))return;
    var s=document.createElement('style'); s.id='ag-css';
    s.textContent=
    '#ag-gate{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:'+T.surface+';}'+
    '#ag-gate.ag-hidden{display:none;}'+
    '#ag-box{background:#fff;border:1px solid '+T.main+'33;border-radius:20px;padding:34px 30px;max-width:380px;width:100%;text-align:center;box-shadow:0 18px 50px -20px rgba(0,0,0,.35);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;}'+
    '#ag-box img{height:42px;width:auto;margin:0 auto 16px;display:block;}'+
    '#ag-brand{font-size:10px;letter-spacing:2px;color:'+T.main+';font-weight:bold;margin-bottom:12px;}'+
    '#ag-lock{font-size:30px;margin-bottom:10px;}'+
    '#ag-box h1{font-family:Georgia,serif;font-size:22px;margin:0 0 8px;color:'+T.ink+';}'+
    '#ag-box p{color:'+T.grey+';font-size:13px;margin:0 0 16px;}'+
    '#ag-pw{width:100%;text-align:center;letter-spacing:10px;font:22px "Helvetica Neue",Arial,sans-serif;color:'+T.ink+';'+
    'background:'+T.surface+';border:1px solid '+T.main+'40;border-radius:10px;padding:12px;margin-bottom:12px;}'+
    '#ag-pw:focus{outline:none;border-color:'+T.main+';}'+
    '#ag-go{width:100%;background:'+T.main+';color:#fff;border:none;border-radius:30px;padding:12px;font:bold 14px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}'+
    '#ag-go:hover{background:'+T.deep+';}'+
    '#ag-err{color:#B3402A;font-size:13px;margin-top:10px;min-height:18px;}';
    document.head.appendChild(s);
  }

  /* Renders the lock screen and calls onUnlock() once the device is trusted.
     If the password was already given on this device, onUnlock fires
     immediately and no gate is ever shown. */
  function mount(o){
    o=o||{};
    var T=o.theme||{surface:"#F4F6FA",main:"#1e5aa8",deep:"#152a5e",ink:"#0a1a3a",grey:"#5A6B87"};
    var done=false;
    function open(){ if(done)return; done=true; try{o.onUnlock&&o.onUnlock();}catch(e){console.error(e);} }

    if(trusted()){ open(); return { unlocked:true }; }

    css(T);
    var g=document.createElement('div'); g.id='ag-gate';
    g.innerHTML='<div id="ag-box">'+
      (o.logo?'<img src="'+o.logo+'" alt="">':'')+
      '<div id="ag-brand"></div><div id="ag-lock">🔒</div>'+
      '<h1></h1><p></p>'+
      '<input type="text" autocomplete="username" value="presence@janerikmeidell.com" style="display:none" aria-hidden="true" tabindex="-1">'+
      '<input id="ag-pw" type="password" autocomplete="current-password" placeholder="••••">'+
      '<button id="ag-go">Unlock</button><div id="ag-err"></div></div>';
    document.body.appendChild(g);
    g.querySelector('#ag-brand').textContent=o.brand||'INSTRUCTOR';
    g.querySelector('h1').textContent=o.title||'Dashboard access';
    g.querySelector('p').textContent=o.blurb||'Enter the instructor account password. This device will remember it.';

    var pw=g.querySelector('#ag-pw'), err=g.querySelector('#ag-err');
    function submit(){
      var v=(pw.value||'').trim();
      if(!v)return;
      err.textContent='…';
      withFB(function(FB){
        if(!FB){ err.textContent='Incorrect password.'; pw.value=''; pw.focus(); return; }
        FB.signInPassword(FB.email(), v).then(function(){
          mark(true); err.textContent=''; g.classList.add('ag-hidden'); open();
        },function(e){ err.textContent=FB.explain?FB.explain(e):'Incorrect password.'; pw.value=''; pw.focus(); });
      });
    }
    g.querySelector('#ag-go').addEventListener('click',submit);
    pw.addEventListener('keydown',function(e){ if(e.key==='Enter')submit(); });
    setTimeout(function(){pw.focus();},60);
    return { unlocked:false };
  }

  /* keep the marker in step with the session on every page that loads
     this file — signing out (or a password change elsewhere) clears it */
  mark(trusted());

  return { mount:mount, lock:lock, check:matches, isUnlocked:isUnlocked, trusted:trusted,
           view:view, setView:function(v){ try{ if(v==='student')localStorage.setItem('jem_view','student'); else localStorage.removeItem('jem_view'); }catch(e){} } };
})();
