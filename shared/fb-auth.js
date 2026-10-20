/* =====================================================================
   SHARED · the instructor's account session, remembered per device.

   Every instructor page (admin2, insights, chat, inbox, site, board) and
   every week page that releases solutions or opens a presence window
   needs the signed-in instructor ACCOUNT — the gate hides the UI, the
   account is what the database trusts. This file is where that account
   is signed in and where its session is kept.

   THE SESSION IS OURS, NOT THE SDK'S (20 Oct 2026). Until then the
   Firebase SDK held the session in IndexedDB and `restore()` imported
   the SDK from the CDN on every load to ask for it, with a five-second
   timeout — on a slow link, a cleared IndexedDB or a browser that
   refused the module import the answer was "null", and the password
   had to be typed again on every refresh. Now the sign-in is one REST
   call, the REFRESH TOKEN it returns is written to localStorage
   (`jem_fb_session`, the instructor "cookie"), and an ID token is
   minted from it on demand through Firebase's token endpoint. No SDK on
   the instructor pages, no timeout, nothing to lose on a reload: the
   session exists until "Sign out" or a change of the account password.
   That is the same thing the SDK stored, in a place we control.

       FBAuth.restore(function(user){ ... })   user or null; no UI, never throws
       user.getIdToken()                       Promise<string>, refreshed when stale
       FBAuth.form(el, cb, ns)                 the inline password form
       FBAuth.signOut(cb)                      forget this device's session

   `window.__fbUser` is set SYNCHRONOUSLY at load when a session is
   stored, so a page's very first read already carries the token —
   `restore()` only confirms it (and mints a fresh token first when the
   hour is up). A device that signed in with the SDK-based version is
   migrated once: the SDK is imported one last time, its refresh token
   copied across, and its own copy signed out.
   ===================================================================== */
window.FBAuth = (function () {
  "use strict";
  var KEY = 'jem_fb_session';          /* {rt, it, exp, email, uid, ts} */
  var LEGACY_FLAG = 'jem_fb_seen';     /* set by the SDK-based version; read once, for migration */
  var API_KEY = "AIzaSyASAyieOa3_FQuGsquY8te8dKsZH0oBkKw";   /* public: the same key every page sends */
  var EMAIL = 'presence@janerikmeidell.com';                /* must match the rules */
  var SIGNIN  = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+API_KEY;
  var REFRESH = 'https://securetoken.googleapis.com/v1/token?key='+API_KEY;
  var MARGIN = 120*1000;               /* mint a new token when under two minutes remain */
  var CFG = {apiKey:API_KEY, authDomain:"teaching-70f1c.firebaseapp.com",
             databaseURL:"https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app",
             projectId:"teaching-70f1c",storageBucket:"teaching-70f1c.firebasestorage.app",
             messagingSenderId:"1026356553251",
             appId:"1:1026356553251:web:d23a4c30af7e6983463396"};

  var S=null, inflight=null;

  function read(){ try{ var v=JSON.parse(localStorage.getItem(KEY)||'null'); return (v&&v.rt)?v:null; }catch(e){ return null; } }
  function save(s){ S=s; try{ if(s)localStorage.setItem(KEY,JSON.stringify(s)); else localStorage.removeItem(KEY); }catch(e){} }
  function drop(){ save(null); window.__fbUser=null; }
  function legacySeen(){ try{ return localStorage.getItem(LEGACY_FLAG)==='1'; }catch(e){ return false; } }
  function forgetLegacy(){ try{ localStorage.removeItem(LEGACY_FLAG); }catch(e){} }

  function apiError(j){ return (j&&j.error&&(j.error.message||j.error.status))||''; }
  /* these mean the session itself is gone (password changed, account
     disabled or deleted); anything else — a network blip, a 5xx — is
     not a reason to throw the session away */
  var DEAD = /TOKEN_EXPIRED|USER_DISABLED|USER_NOT_FOUND|INVALID_REFRESH_TOKEN|MISSING_REFRESH_TOKEN|INVALID_GRANT_TYPE/;

  function post(url,headers,body){
    return fetch(url,{method:'POST',headers:headers,body:body})
      .then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j}; },function(){ return {ok:r.ok,j:null}; }); });
  }

  /* one refresh at a time: twenty parallel reads share the same call */
  function refresh(){
    if(inflight)return inflight;
    if(!S)return Promise.reject(new Error('signed-out'));
    var rt=S.rt;
    inflight=post(REFRESH,{'Content-Type':'application/x-www-form-urlencoded'},
                  'grant_type=refresh_token&refresh_token='+encodeURIComponent(rt))
      .then(function(x){
        if(!x.ok||!x.j||!x.j.id_token){
          var m=apiError(x.j);
          if(DEAD.test(m))drop();
          throw new Error(m||'refresh-failed');
        }
        if(!S)throw new Error('signed-out');          /* signed out while this was in flight */
        var now=Date.now();
        save({rt:x.j.refresh_token||rt, it:x.j.id_token,
              exp:now+(parseInt(x.j.expires_in,10)||3600)*1000,
              email:S.email, uid:x.j.user_id||S.uid, ts:S.ts||now});
        return S.it;
      });
    inflight.then(function(){inflight=null;},function(){inflight=null;});
    return inflight;
  }

  function fresh(){ return !!(S&&S.it&&S.exp-Date.now()>MARGIN); }

  /* the object every page keeps on window.__fbUser — the two members
     they use are .email and .getIdToken() */
  function user(){
    if(!S)return null;
    return {email:S.email, uid:S.uid,
      getIdToken:function(force){
        if(!S)return Promise.reject(new Error('signed-out'));
        if(!force&&fresh())return Promise.resolve(S.it);
        return refresh().catch(function(e){
          /* could not reach the token endpoint, but the one we hold is
             still valid for a while: use it rather than fail the read */
          if(S&&S.it&&S.exp>Date.now())return S.it;
          throw e;
        });
      }};
  }

  /* Calls back exactly once, with the signed-in user or null. Never
     throws and never shows UI — a page can call it unconditionally. */
  function restore(cb){
    var done=false;
    function finish(u){ if(done)return; done=true; try{cb(u||null);}catch(e){} }
    if(S){
      window.__fbUser=user();
      if(fresh()){ setTimeout(function(){finish(window.__fbUser);},0); return; }
      /* the hour is up: mint a token first, so the page's first read
         carries it; the answer is null only if the session is really dead */
      refresh().then(function(){finish(S?user():null);},function(){finish(S?user():null);});
      return;
    }
    if(!legacySeen()){ setTimeout(function(){finish(null);},0); return; }
    migrate(finish);
  }

  /* ---------- one-time migration from the SDK's IndexedDB session -----
     The SDK's User carries its refresh token in the open (`refreshToken`),
     so a device that signed in before 20 Oct 2026 is carried across
     without typing the password again. The SDK's own copy is then signed
     out — client-side only, which revokes nothing — so the session lives
     in exactly one place. Five seconds, then give up: the flag is cleared
     either way, so the CDN import happens at most once per device.
     -------------------------------------------------------------------- */
  function migrate(finish){
    var timer=setTimeout(function(){ forgetLegacy(); finish(null); },5000);
    Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
    ]).then(function(m){
      var au=m[1], a=au.getAuth(m[0].initializeApp(CFG,'jemrestore'));
      var seenState=false;
      au.onAuthStateChanged(a,function(u){
        if(seenState)return; seenState=true; clearTimeout(timer);
        forgetLegacy();
        if(!u||!u.refreshToken){ finish(null); return; }
        save({rt:u.refreshToken, it:'', exp:0, email:u.email||EMAIL, uid:u.uid, ts:Date.now()});
        au.signOut(a).catch(function(){});
        refresh().then(function(){ window.__fbUser=user(); finish(window.__fbUser); },
                       function(){ finish(S?(window.__fbUser=user()):null); });
      },function(){ clearTimeout(timer); forgetLegacy(); finish(null); });
    }).catch(function(){ clearTimeout(timer); forgetLegacy(); finish(null); });
  }

  function signOut(cb){
    drop();
    var legacy=legacySeen(); forgetLegacy();
    if(!legacy){ if(cb)setTimeout(cb,0); return; }
    /* a pre-migration device may still hold the SDK's copy: clear it too */
    Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
    ]).then(function(m){ return m[1].signOut(m[1].getAuth(m[0].initializeApp(CFG,'jemrestore'))); })
      .then(function(){ if(cb)cb(); },function(){ if(cb)cb(); });
  }

  /* ---------- signing in: one REST call, no popup -----------------------
     Safari blocks the Google popup, and signInWithRedirect is unreliable
     there too. Email+password is a plain API call — and the response
     carries the refresh token that becomes this device's session.
     -------------------------------------------------------------------- */
  function signInPassword(email,pw){
    return post(SIGNIN,{'Content-Type':'application/json'},
                JSON.stringify({email:email,password:pw,returnSecureToken:true}))
      .then(function(x){
        if(!x.ok||!x.j||!x.j.idToken)throw new Error(apiError(x.j)||'sign-in-failed');
        var now=Date.now();
        save({rt:x.j.refreshToken, it:x.j.idToken,
              exp:now+(parseInt(x.j.expiresIn,10)||3600)*1000,
              email:x.j.email||email, uid:x.j.localId, ts:now});
        forgetLegacy();
        window.__fbUser=user();
        return window.__fbUser;
      });
  }

  function explain(e){
    var m=String((e&&(e.code||e.message))||e||'');
    if(/OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED|operation-not-allowed/i.test(m))
      return 'Email sign-in is switched off for this project. Firebase Console → Authentication → Sign-in method → Email/Password → Enable.';
    if(/EMAIL_NOT_FOUND|user-not-found/i.test(m))
      return 'No such account. Create it in Firebase Console → Authentication → Users → Add user.';
    if(/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|wrong-password|invalid-credential/i.test(m)) return 'Wrong password.';
    if(/TOO_MANY_ATTEMPTS|too-many-requests/i.test(m)) return 'Too many attempts — Firebase has paused sign-in here for a few minutes.';
    if(/USER_DISABLED/i.test(m)) return 'This account is disabled in Firebase Console → Authentication → Users.';
    if(/network|Failed to fetch|Load failed|NetworkError/i.test(m)) return 'No network. Nothing changed.';
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
      '.fba .fba-msg{flex:1 1 100%;font-weight:600;opacity:.85;}'+
      '.fba .fba-why{flex:1 1 100%;font-weight:600;line-height:1.5;}'+
      '.fba .fba-why code{font:700 12px ui-monospace,Menlo,monospace;background:rgba(0,0,0,.07);padding:1px 5px;border-radius:5px;}'+
      '.fba .fba-ghost{background:transparent;color:inherit;border:1px solid rgba(0,0,0,.25);}';
    document.head.appendChild(st);
  }

  /* ---------- signed in, and STILL refused --------------------------
     A namespace that has no block in the deployed rules is shut to
     everyone — the root is .read:false, so no account opens it and no
     password ever will. The page could not tell that apart from a bad
     password: it re-rendered an empty password form with no message,
     every time, which reads exactly like "my password stopped working".
     It is not the password. Say so, and say what to do.
     ------------------------------------------------------------------ */
  function blocked(el,cb,ns){
    css();
    var who=(window.__fbUser&&window.__fbUser.email)||'an instructor account';
    el.innerHTML='<div class="fba"><div class="fba-why">'+
      'Signed in as <b>'+esc(who)+'</b> — and the database still refuses to read'+
      (ns?' <code>'+esc(ns)+'</code>':' this cohort')+'.<br>'+
      '<b>This is not your password.</b> Almost always it means '+
      (ns?'<code>'+esc(ns)+'</code>':'that namespace')+' has no block in the '+
      '<i>deployed</i> rules — the root is <code>.read:false</code>, so every '+
      'account is refused, signed in or not. Publish <code>firebase-database-rules.json</code>: '+
      'Firebase Console → Realtime Database → Rules → paste → Publish.'+
      '</div><button>Try again</button>'+
      '<button class="fba-ghost">Sign out</button>'+
      '<span class="fba-msg"></span></div>';
    var bs=el.querySelectorAll('button');
    bs[0].addEventListener('click',function(){try{cb(window.__fbUser);}catch(e){}});
    bs[1].addEventListener('click',function(){signOut(function(){location.reload();});});
  }

  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  /* Renders the two fields into `el` and calls cb(user) once signed in.
     No popup, so nothing for a pop-up blocker to eat.
     `ns` is only for the message when we are already signed in. */
  function form(el,cb,ns){
    if(!el)return;
    /* Already identified? Then the read failed for a reason a password
       cannot fix, and offering the password box again is a lie. */
    if(window.__fbUser){ blocked(el,cb,ns); return; }
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

  /* the session is read, and the user set, before any page script runs */
  S=read();
  if(S)window.__fbUser=user();

  return {restore:restore, signOut:signOut, form:form, blocked:blocked,
          signInPassword:signInPassword, email:function(){return EMAIL;},
          user:function(){return window.__fbUser||null;},
          token:function(){ return window.__fbUser?window.__fbUser.getIdToken():Promise.reject(new Error('signed-out')); },
          seen:function(){return !!S;},
          /* kept for callers of the old API; the session is stored by signInPassword itself */
          mark:function(){}, forget:forgetLegacy};
})();
