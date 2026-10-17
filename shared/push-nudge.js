/* =====================================================================
   PUSH NUDGE · the one strip on a course hub or a school landing page
   that points at /shared/notifications.html — "get a notification on your
   phone when there is an announcement or a reply".

   One line on a page is the whole opt-in:
       <script src="/shared/push-nudge.js" defer></script>
   It draws itself after the page's `.hero` (or into a `[data-push-nudge]`
   placeholder if the page has one, or at the top of `.wrap`/`main`), in
   the page's language (`<html lang>`), and links to the set-up page with
   `?course=<id>` from `body[data-course]` when there is one.

   It stays SILENT when there is nothing to offer or nothing to do:
     · `_site/push` is missing or switched off (the sender is not deployed —
       never advertise a feature that does not work yet);
     · this device already subscribed for this course (JEMPush.remembered,
       written by the set-up page) — "unless they already installed it";
     · the browser has an active push subscription at all (a device that
       set up another course is not nagged on the next one);
     · the device is the instructor's (`jem_instructor`);
     · the student dismissed it (✕), per device.
   ⚠ On an iPhone, Safari and the Home Screen app have separate storage,
   so a student who set it up inside the Home Screen app still sees the
   strip in Safari until they press ✕. Expected; the ✕ is why it exists.
   ===================================================================== */
(function(){
  "use strict";
  if(!window.JEMPush){ var s=document.createElement('script'); s.src='/shared/push.js'; s.onload=boot; document.head.appendChild(s); } else boot();

  function boot(){
    try{ if(localStorage.getItem('jem_instructor')||localStorage.getItem('jem_push_nudge_off')) return; }catch(e){}
    if(/jem_instructor=1/.test(document.cookie)) return;
    var course=(document.body&&document.body.getAttribute('data-course'))||'';
    var ns=null;
    try{ var cc=window.CourseConfig&&window.CourseConfig.get&&CourseConfig.get(course); ns=cc&&cc.ns; }catch(e){}
    var rem=JEMPush.remembered();
    if(ns&&rem[ns]) return;
    if(!course && Object.keys(rem).length) return;
    JEMPush.cfg().then(function(c){
      if(!c||!c.on||!c.url||!c.key) return;
      return JEMPush.current().then(function(sub){ if(sub) return; draw(course); });
    }).catch(function(){});
  }

  function draw(course){
    var fr=/^fr/i.test(document.documentElement.lang||'');
    var ios=JEMPush.platform().ios;
    var T=fr?{
      t:'Recevez une notification sur votre téléphone',
      d:ios?'quand une annonce est publiée ou que l’enseignant vous répond. Deux minutes, depuis Safari.':'quand une annonce est publiée ou que l’enseignant vous répond. Deux minutes.',
      go:'Activer →', x:'Plus tard'
    }:{
      t:'Get a notification on your phone',
      d:ios?'when an announcement is posted or the instructor replies to you. Two minutes, from Safari.':'when an announcement is posted or the instructor replies to you. Two minutes.',
      go:'Set it up →', x:'Not now'
    };
    var css=document.createElement('style');
    css.textContent='.jem-nudge{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--accent-pale,#FDF3E6);border:1px solid rgba(213,133,23,.35);border-radius:14px;padding:11px 14px;margin:14px 0 18px;font-family:inherit;}'+
      '.jem-nudge .i{font-size:20px;flex:none;}.jem-nudge .b{flex:1;min-width:200px;font-size:13px;line-height:1.45;color:var(--ink-soft,#3D4457);}'+
      '.jem-nudge .b b{color:var(--navy,#101F44);display:block;font-size:13.5px;}'+
      '.jem-nudge a.go{font-size:12.5px;font-weight:800;color:#fff;background:var(--navy-surface,var(--navy,#101F44));border-radius:30px;padding:8px 14px;text-decoration:none;white-space:nowrap;}'+
      '.jem-nudge button.x{background:none;border:none;font:inherit;font-size:12px;color:var(--grey,#7A7A7A);cursor:pointer;padding:4px 6px;}';
    document.head.appendChild(css);
    var el=document.createElement('div'); el.className='jem-nudge'; el.setAttribute('role','note');
    var pl=(document.documentElement.lang||'').slice(0,2).toLowerCase();
    var href='/shared/notifications.html'+(course?'?course='+encodeURIComponent(course):'')+(/^(fr|en)$/.test(pl)?(course?'&':'?')+'lang='+pl:'');
    el.innerHTML='<span class="i">🔔</span><div class="b"><b></b><span></span></div><a class="go" href="'+href+'"></a><button class="x" type="button"></button>';
    el.querySelector('b').textContent=T.t; el.querySelector('.b span').textContent=T.d;
    el.querySelector('a.go').textContent=T.go; el.querySelector('button.x').textContent=T.x;
    el.querySelector('button.x').addEventListener('click',function(){ try{localStorage.setItem('jem_push_nudge_off','1');}catch(e){} el.remove(); });
    var host=document.querySelector('[data-push-nudge]');
    if(host){ host.appendChild(el); return; }
    var hero=document.querySelector('.hero');
    if(hero&&hero.parentNode){ hero.parentNode.insertBefore(el, hero.nextSibling); return; }
    var wrap=document.querySelector('.wrap, main, .container, body');
    wrap.insertBefore(el, wrap.firstChild);
  }
})();
