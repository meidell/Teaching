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
