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
   every course page loads. Only schools with a landing page are linked;
   HEG has none, so its logos stay plain. A logo already inside a link is
   left alone, and the landing page itself is not linked to itself. */
(function(){
  try{
    var LAND={GBS:1,SUMAS:1,UMEF:1};
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
