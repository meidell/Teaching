/* Lightweight, cookieless-ish pageview logger -> teaching-70f1c Realtime DB.
   Logs: path, time, referrer, language, timezone, a random visitor id (localStorage),
   and COARSE geo (country/city only — raw IP is never stored). Best-effort, fails silently. */
(function(){
  try{
    var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
    var vid; try{ vid=localStorage.getItem('site-vid'); if(!vid){ vid='v'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); localStorage.setItem('site-vid',vid); } }catch(e){ vid='anon'; }
    var now=new Date(), day=now.toISOString().slice(0,10);
    var rec={ p:(location.pathname+location.search).slice(0,300), t:now.getTime(),
              ref:(document.referrer||'').slice(0,300), lang:(navigator.language||''), tz:'', vid:vid };
    try{ rec.tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''; }catch(e){}
    var done=false;
    function put(){ var id=String(rec.t)+'_'+Math.random().toString(36).slice(2,8);
      try{ fetch(DB+'/analytics/'+day+'/'+id+'.json',{method:'PUT',body:JSON.stringify(rec),keepalive:true}); }catch(e){} }
    function fin(g){ if(done) return; done=true; if(g){ rec.country=g.country||''; rec.cc=g.country_code||''; rec.city=g.city||''; } put(); }
    var to=setTimeout(function(){ fin(null); },2500);
    try{
      fetch('https://ipwho.is/?fields=success,country,country_code,city',{cache:'no-store'})
        .then(function(r){ return r.json(); })
        .then(function(g){ clearTimeout(to); fin(g && g.success!==false ? g : null); })
        .catch(function(){ clearTimeout(to); fin(null); });
    }catch(e){ clearTimeout(to); fin(null); }
  }catch(e){}
})();

/* The school logo, top left, opens the school's landing page (22 Oct 2026,
   Jan Erik: "when you click on a logo (top, left), it should open that
   school's landing page"). Lives here because track.js is the one script
   every course page loads. Only schools with a landing page are linked
   (Kalaidos since 25 Oct 2026); HEG has none, so its logos stay plain. A logo already inside a link is
   left alone, and the landing page itself is not linked to itself. */
(function(){
  try{
    var LAND={GBS:1,SUMAS:1,UMEF:1,Kalaidos:1};
    var seg=(location.pathname.split('/')[1]||'');
    if(!LAND[seg])return;
    var home='/'+seg+'/';
    if(location.pathname===home||location.pathname===home+'index.html')return;
    function go(){
      var sel=['.topbar picture','.topbar img.brand','.topbar img.logo','nav.nav picture','nav.nav > img','header picture','header img.logo','header img.brand','img.brand','img.logo'];
      var el=null;
      for(var i=0;i<sel.length&&!el;i++){
        var c=document.querySelector(sel[i]);
        if(c&&c.getBoundingClientRect().top<140)el=c;
      }
      /* hubs that put the logo at the top of the hero rather than in a bar */
      if(!el){var imgs=document.querySelectorAll('img[src*="logo"]');for(var j=0;j<imgs.length&&!el;j++){if(imgs[j].getBoundingClientRect().top<220)el=imgs[j];}}
      if(!el)return;
      if(el.tagName==='IMG'&&el.parentNode&&el.parentNode.tagName==='PICTURE')el=el.parentNode;
      if(el.closest&&el.closest('a'))return;
      var a=document.createElement('a');
      a.href=home;a.title=seg+' · all courses';a.setAttribute('aria-label',seg+' · all courses');
      a.style.cssText='display:inline-flex;align-items:center;line-height:0;';
      el.parentNode.insertBefore(a,el);a.appendChild(el);
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
  }catch(e){}
})();

/* "Open in the app" (23 Oct 2026, Jan Erik: "I'd like this qr code to open
   the app on the phone, for their account"). The classroom QR codes carry
   ?app=1. On an iPhone with the Insights app installed, iOS opens such a
   link straight in the app (the universal link claimed by
   /.well-known/apple-app-site-association, which claims ONLY links with
   app=1, so the rest of the site keeps opening in the browser). On Android
   the app's link verification is not published (no assetlinks.json: it
   would hand EVERY site link to the app), so the page offers the app
   instead: an intent link that opens the app if it is installed and stays
   here if not. Inside the app (react-native-webview defines
   window.ReactNativeWebView) nothing is shown. Either way the account is
   the same: the app shows the same page, and the student signs in with
   the same name and password, so progress and answers follow. The marker
   is taken out of the address bar so a copied link does not carry it. */
(function(){
  try{
    var q=new URLSearchParams(location.search);
    if(q.get('app')!=='1')return;
    q.delete('app');
    var clean=location.pathname+(q.toString()?'?'+q.toString():'')+location.hash;
    try{history.replaceState(null,'',clean);}catch(e){}
    if(window.ReactNativeWebView)return;
    if(!/Android/i.test(navigator.userAgent||''))return;
    var here=location.origin+clean;
    var fr=(document.documentElement.lang||'').slice(0,2)==='fr';
    var intent='intent://open?url='+encodeURIComponent(here)+'#Intent;scheme=jemcourses;package=ch.lexigo.courses;S.browser_fallback_url='+encodeURIComponent(here)+';end';
    function show(){
      var d=document.createElement('div');
      d.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;background:#0F2A3A;color:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;display:flex;gap:10px;align-items:center;';
      d.innerHTML='<div style="flex:1">'+(fr?'<b>Vous avez l’app Insights ?</b> Ouvrez ce cours dedans — même compte, même progression.':'<b>Have the Insights app?</b> Open this course in it — same account, same progress.')+'</div>'+
        '<a href="'+intent+'" style="background:#F39229;color:#0F2A3A;font-weight:800;border-radius:20px;padding:8px 12px;text-decoration:none;white-space:nowrap;">'+(fr?'Ouvrir l’app':'Open the app')+'</a>'+
        '<button type="button" aria-label="'+(fr?'Fermer':'Close')+'" style="background:none;border:none;color:#fff;font-size:20px;line-height:1;cursor:pointer;">×</button>';
      d.querySelector('button').addEventListener('click',function(){d.remove();});
      document.body.appendChild(d);
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show);else show();
  }catch(e){}
})();

/* ⚙ Admin — the instructor's one door, on every page (23 Oct 2026, Jan
   Erik: "only one central login (for me)"). The course pages no longer
   carry an "instructor" link; a device signed in to the instructor
   account (`jem_fb_session`, written by /shared/fb-auth.js) gets this
   button instead, and nobody else ever sees it. It joins the 👁/🎓 bar
   login.js draws on course pages, or sits in the same place on its own.
   Not on /admin/ or /shared/ (already there), not inside the app. */
(function(){
  try{
    var s=JSON.parse(localStorage.getItem('jem_fb_session')||'null');
    if(!s||!s.rt)return;
    var p=location.pathname||'';
    if(p.indexOf('/admin/')===0||p.indexOf('/shared/')===0)return;
    var tries=0;
    function place(){
      if(window.CourseLogin&&CourseLogin.inApp&&CourseLogin.inApp())return;
      var old=document.getElementById('jem-admin'); if(old)old.remove();
      var a=document.createElement('a'); a.id='jem-admin'; a.href='/admin/'; a.textContent='⚙ Admin';
      a.title='The admin console: every course, messages, presence, rosters';
      var bar=document.getElementById('jem-hat');
      if(bar){
        a.style.cssText='border-right:1px solid rgba(255,255,255,.18);border-radius:30px 0 0 30px;padding:7px 11px;font:inherit;color:#fff;text-decoration:none;display:flex;align-items:center;';
        bar.insertBefore(a,bar.firstChild);
      }else{
        a.style.cssText='position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:320;background:rgba(15,25,35,.82);color:#fff;'+
          'border-radius:30px;padding:8px 13px;font:700 11.5px/1 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.25);';
        document.body.appendChild(a);
        /* login.js may draw its bar a moment later: move in when it does */
        if(++tries<6)setTimeout(place,1000);
      }
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(place,400);});
    else setTimeout(place,400);
  }catch(e){}
})();
