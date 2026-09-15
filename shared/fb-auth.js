/* =====================================================================
   HEG / SUMAS · remembering an instructor sign-in.

   Every instructor page (admin, admin2, insights, chat) signs in with a
   Google popup and stashes the user on `window.__fbUser`, which its own
   authQ() turns into `?auth=<token>`. What none of them did was ask
   Firebase, on the next page load, whether that session still exists —
   so a reload always started logged out and the 🔑 button had to be
   pressed again, every single time.

   Firebase already persists the session itself (IndexedDB, the web
   default). This just picks it up. No cookie of our own, no password
   stored anywhere: the SDK holds a refresh token and mints a fresh ID
   token on demand.

       FBAuth.restore(function(user){ ... })   silent; user or null
       FBAuth.mark()                           call after a real sign-in

   The SDK is a CDN import (the one exception in this repo — see
   CLAUDE.md §6), so we only pay for it on a device that has signed in
   before: `mark()` sets the flag that makes `restore()` bother at all.
   ===================================================================== */
window.FBAuth = (function () {
  "use strict";
  var FLAG = 'jem_fb_seen';
  var CFG = {apiKey:"AIzaSyASAyieOa3_FQuGsquY8te8dKsZH0oBkKw",
             authDomain:"teaching-70f1c.firebaseapp.com",
             databaseURL:"https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app",
             projectId:"teaching-70f1c",storageBucket:"teaching-70f1c.firebasestorage.app",
             messagingSenderId:"1026356553251",
             appId:"1:1026356553251:web:d23a4c30af7e6983463396"};
  var sdk=null, authObj=null;

  function seen(){try{return localStorage.getItem(FLAG)==='1';}catch(e){return false;}}
  function mark(){try{localStorage.setItem(FLAG,'1');}catch(e){}}
  function forget(){try{localStorage.removeItem(FLAG);}catch(e){}}

  /* a named app, so a page that also calls initializeApp() for its own
     popup does not collide with this one */
  function load(){
    if(sdk)return sdk;
    sdk=Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
    ]).then(function(m){
      authObj=m[1].getAuth(m[0].initializeApp(CFG,'jemrestore'));
      return m[1];
    });
    return sdk;
  }

  /* Calls back exactly once, with the signed-in user or null. Never
     throws and never shows UI — a page can call it unconditionally. */
  function restore(cb){
    if(!seen()){setTimeout(function(){cb(null);},0);return;}
    var done=false;
    function finish(u){if(done)return;done=true;try{cb(u||null);}catch(e){}}
    load().then(function(au){
      au.onAuthStateChanged(authObj,function(u){
        if(u){window.__fbUser=u;}
        finish(u);
      },function(){finish(null);});
    }).catch(function(){finish(null);});
    /* if the SDK never resolves, do not leave the page waiting on it */
    setTimeout(function(){finish(null);},5000);
  }

  function signOut(cb){
    forget();
    load().then(function(au){return au.signOut(authObj);})
      .then(function(){window.__fbUser=null;if(cb)cb();},function(){if(cb)cb();});
  }


  /* ---------- signing in without a popup ------------------------------
     Safari blocks the Google popup, and signInWithRedirect is unreliable
     there too: Safari's storage rules break it whenever the auth domain
     differs from the site's. Email+password is neither — it is a plain
     API call — so it is what the instructor pages use.
     -------------------------------------------------------------------- */
  var EMAIL = 'presence@janerikmeidell.com';   /* must match the rules */

  function signInPassword(email,pw){
    return load().then(function(au){
      return au.signInWithEmailAndPassword(authObj,email,pw);
    }).then(function(res){ window.__fbUser=res.user; mark(); return res.user; });
  }

  function explain(e){
    var m=String((e&&(e.code||e.message))||e||'');
    if(/operation-not-allowed|password-login-disabled/i.test(m))
      return 'Email sign-in is switched off for this project. Firebase Console → Authentication → Sign-in method → Email/Password → Enable.';
    if(/user-not-found/i.test(m))
      return 'No such account. Create it in Firebase Console → Authentication → Users → Add user.';
    if(/wrong-password|invalid-credential|invalid-login/i.test(m)) return 'Wrong password.';
    if(/too-many-requests/i.test(m)) return 'Too many attempts — Firebase has paused sign-in here for a few minutes.';
    if(/network/i.test(m)) return 'No network. Nothing changed.';
    return 'Sign-in failed: '+m;
  }

  function css(){
    if(document.getElementById('fba-css'))return;
    var st=document.createElement('style'); st.id='fba-css';
    st.textContent='.fba{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font:600 13px system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;}'+
      '.fba b{margin-right:2px;}'+
      '.fba input{border:1px solid rgba(0,0,0,.2);border-radius:9px;padding:8px 11px;font:inherit;min-width:0;flex:1 1 170px;max-width:250px;background:#fff;color:#111;}'+
      '.fba button{border:none;border-radius:9px;padding:8px 16px;font:800 13px inherit;cursor:pointer;background:#CC0000;color:#fff;}'+
      '.fba button[disabled]{opacity:.55;cursor:default;}'+
      '.fba .fba-msg{flex:1 1 100%;font-weight:600;opacity:.85;}';
    document.head.appendChild(st);
  }

  /* Renders the two fields into `el` and calls cb(user) once signed in.
     No popup, so nothing for a pop-up blocker to eat. */
  function form(el,cb){
    if(!el)return;
    /* A dashboard that re-reads on a timer will call this again on every
       failed read. Rebuilding would wipe a half-typed password, which is
       exactly what made signing in feel impossible. */
    if(el.querySelector&&el.querySelector('.fba')){
      var old=el.querySelector('input[type=password]'); if(old)old.focus();
      return;
    }
    css();
    el.innerHTML='<div class="fba"><b>Instructor sign-in</b>'+
      '<input type="email" autocomplete="username" value="'+EMAIL+'">'+
      '<input type="password" autocomplete="current-password" placeholder="password">'+
      '<button>Sign in</button><span class="fba-msg"></span></div>';
    var em=el.querySelector('input[type=email]'), pw=el.querySelector('input[type=password]'),
        go=el.querySelector('button'), msg=el.querySelector('.fba-msg');
    function submit(){
      var p=pw.value||'';
      if(!p){msg.textContent='Type the password first.';pw.focus();return;}
      go.disabled=true;go.textContent='Signing in…';msg.textContent='';
      signInPassword((em.value||'').trim(),p).then(function(u){
        el.innerHTML='';
        try{cb(u);}catch(e){}
      },function(e){
        go.disabled=false;go.textContent='Sign in';msg.textContent=explain(e);
      });
    }
    go.addEventListener('click',submit);
    pw.addEventListener('keydown',function(ev){if(ev.key==='Enter')submit();});
    setTimeout(function(){pw.focus();},50);
  }

  return {restore:restore, mark:mark, forget:forget, signOut:signOut, seen:seen,
          form:form, signInPassword:signInPassword, email:function(){return EMAIL;}};
})();
