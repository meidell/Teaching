/* =====================================================================
   /shared/pagewatch.js — "Who did this page", for the instructor only.

   12 Nov 2026, Jan Erik: "create better tools for the instructor and/or
   admin to see what is happening on that actual page (clicking to get a
   view of who participated — and the buttons only being available for the
   instructor/admin)".

   Loaded by /track.js on a course page whose <body> carries data-course
   and data-module, and ONLY on a device holding the instructor session
   (`jem_fb_session`) in instructor view (`jem_view` is not "student").
   A student's device never loads this file, so no student ever sees it.

   What it draws:
   - a button bottom-left, "Who did this page";
   - a small grey count on each counted step of the page ("9 of 27 did
     this"), click it → the panel, filtered to that step;
   - a right-hand panel: per step, how many students and who; per student
     the steps done, the team, the last change; click a student → every
     answer they saved on this page (workbook fields of this module).

   Reads <ns> whole with the instructor's ID token, the same read admin2
   does (one GET, re-read every 30 s while the panel is open). Writes
   nothing. Keys starting with "_" (the hidden student `_jem`, _roster,
   _wall …) are skipped.
   ===================================================================== */
(function(){
  'use strict';
  if(window.__pagewatch)return; window.__pagewatch=1;
  var DB='https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
  var body=document.body, COURSE=body.getAttribute('data-course'), MOD=body.getAttribute('data-module');
  if(!COURSE||!MOD)return;
  try{ if(localStorage.getItem('jem_view')==='student')return; var s=JSON.parse(localStorage.getItem('jem_fb_session')||'null'); if(!s||!s.rt)return; }catch(e){return;}

  var NS=null, DATA=null, READ_AT=0, FILTER=null, OPEN=false, SEL=null, TIMER=null;

  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function when(ts){ if(!ts)return '—'; var d=new Date(ts), now=new Date();
    var t=d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    return d.toDateString()===now.toDateString()?'today '+t:d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' '+t; }

  function loadScript(src){return new Promise(function(ok){var x=document.createElement('script');x.src=src;x.onload=ok;x.onerror=ok;document.head.appendChild(x);});}
  function token(){
    var p=window.FBAuth?Promise.resolve():loadScript('/shared/fb-auth.js');
    return p.then(function(){ return window.FBAuth&&FBAuth.token?FBAuth.token():Promise.reject(new Error('no-auth')); });
  }
  function nsOf(){
    if(NS)return Promise.resolve(NS);
    return fetch('/courses.json',{cache:'no-cache'}).then(function(r){return r.json();}).then(function(j){
      var c=(j.courses||[]).filter(function(x){return x.id===COURSE;})[0]; NS=(c&&c.ns)||COURSE; return NS;});
  }
  function read(){
    return Promise.all([nsOf(),token()]).then(function(a){
      return fetch(DB+'/'+a[0]+'.json?auth='+encodeURIComponent(a[1]));
    }).then(function(r){ if(!r.ok)throw new Error('http-'+r.status); return r.json(); })
      .then(function(j){ DATA=j||{}; READ_AT=Date.now(); return DATA; });
  }

  /* the page's counted steps, in page order: every element whose id is a
     section id that some student completed, plus the page's own .step ids */
  function steps(){
    var ids={}, out=[];
    Array.prototype.forEach.call(document.querySelectorAll('.step[id]'),function(e){ids[e.id]=1;});
    eachStudent(function(sid,st){ var d=(st.mod&&st.mod[MOD]&&st.mod[MOD].done)||{}; for(var k in d)ids[k]=1; });
    for(var k in ids)out.push(k);
    function pos(id){var e=document.getElementById(id); if(!e)return 1e9; return e.getBoundingClientRect().top+window.scrollY;}
    out.sort(function(a,b){return pos(a)-pos(b)||a.localeCompare(b);});
    return out;
  }
  function stepLabel(id){
    var e=document.getElementById(id); if(!e)return id;
    var h=e.querySelector('h2,h3,.sh,.title,.t'); var t=(h?h.textContent:'').replace(/\s+/g,' ').trim();
    return t?t.slice(0,70):id;
  }
  function eachStudent(fn){ if(!DATA)return; Object.keys(DATA).forEach(function(k){ if(k.charAt(0)==='_'||!DATA[k]||typeof DATA[k]!=='object')return; fn(k,DATA[k]); }); }
  function nameOf(sid,st){ return (st&&st.name)||(DATA._roster&&DATA._roster[sid]&&DATA._roster[sid].name)||sid; }
  function fieldsOf(st){
    var w=st.work||{}, out=[];
    for(var k in w){ var f=w[k]; if(!f)continue;
      if(f.mod===MOD||k.indexOf(MOD+'_')===0)out.push({k:k,label:f.label||k,v:f.v,ts:f.ts}); }
    out.sort(function(a,b){ var ea=document.querySelector('[data-work="'+a.k+'"]'), eb=document.querySelector('[data-work="'+b.k+'"]');
      if(ea&&eb)return ea.compareDocumentPosition(eb)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1; return a.k.localeCompare(b.k); });
    return out;
  }
  function teamOf(st){ var w=st.work||{}; var f=w[MOD+'_team']||w[MOD+'_teamsel']; return f&&f.v?String(f.v):''; }

  function rows(){
    var S=steps(), list=[];
    eachStudent(function(sid,st){
      var m=(st.mod&&st.mod[MOD])||null, done=(m&&m.done)||{}, f=fieldsOf(st);
      var last=Math.max(m&&m.updatedAt||0, f.reduce(function(a,x){return Math.max(a,x.ts||0);},0));
      list.push({sid:sid,name:nameOf(sid,st),team:teamOf(st),done:done,n:S.filter(function(id){return done[id];}).length,
        fields:f,last:last,opened:!!m||f.length>0,secs:m&&m.secs||0});
    });
    list.sort(function(a,b){return b.n-a.n||b.fields.length-a.fields.length||a.name.localeCompare(b.name);});
    return {steps:S,list:list};
  }

  /* ---------- UI ---------- */
  function css(){
    if(document.getElementById('pw-css'))return;
    var s=document.createElement('style'); s.id='pw-css';
    s.textContent=
      '#pw-btn{position:fixed;left:14px;bottom:14px;z-index:330;background:#0f1923;color:#fff;border:0;border-radius:30px;padding:9px 14px;font:700 12.5px/1 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);cursor:pointer}'+
      'body.boardmode #pw-btn{top:14px;bottom:auto;left:auto;right:14px}'+
      '#pw-btn b{background:#f2b544;color:#0f1923;border-radius:20px;padding:2px 7px;margin-left:6px}'+
      '#pw{position:fixed;top:0;right:0;bottom:0;width:min(560px,100vw);z-index:340;background:#fff;color:#14213d;box-shadow:-10px 0 30px rgba(0,0,0,.25);display:none;flex-direction:column;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif}'+
      '#pw.on{display:flex}#pw header{padding:14px 16px;border-bottom:1px solid #e3e7ee;display:flex;gap:8px;align-items:center}'+
      '#pw header h3{margin:0;font-size:16px;flex:1}#pw header button,#pw .pw-b{border:1px solid #cfd6e2;background:#f6f8fb;border-radius:8px;padding:5px 9px;font:inherit;cursor:pointer;color:#14213d}'+
      '#pw .pw-in{overflow:auto;padding:12px 16px 40px;flex:1}#pw .pw-note{color:#6b7689;font-size:12.5px}'+
      '#pw table{width:100%;border-collapse:collapse;margin:8px 0 14px}#pw td,#pw th{padding:6px 6px;border-bottom:1px solid #edf0f5;text-align:left;vertical-align:top}#pw th{font-size:12px;color:#6b7689;font-weight:600}'+
      '#pw tr.click{cursor:pointer}#pw tr.click:hover{background:#f6f8fb}#pw tr.sel{background:#fff6dc}'+
      '#pw .bar{height:8px;background:#edf0f5;border-radius:5px;overflow:hidden;min-width:70px}#pw .bar i{display:block;height:100%;background:#2f6fd0}'+
      '#pw .dots span{display:inline-block;width:9px;height:9px;border-radius:50%;background:#dfe4ec;margin-right:2px}#pw .dots span.d{background:#1f9d55}'+
      '#pw .ans{background:#f6f8fb;border-radius:8px;padding:8px 10px;margin:6px 0}#pw .ans .l{font-size:12px;color:#6b7689}#pw .ans .v{white-space:pre-wrap;word-break:break-word}'+
      '#pw h4{margin:16px 0 4px;font-size:14px}#pw .chip{display:inline-block;background:#edf0f5;border-radius:12px;padding:1px 8px;margin:2px 3px 2px 0;font-size:12.5px}'+
      '.pw-count{display:inline-block;float:right;margin:0 0 6px 8px;background:#0f1923;color:#fff;border-radius:14px;padding:3px 9px;font:700 11.5px/1.3 -apple-system,BlinkMacSystemFont,Arial,sans-serif;cursor:pointer;position:relative;z-index:5}';
    document.head.appendChild(s);
  }
  function btn(){
    css();
    var b=document.createElement('button'); b.id='pw-btn'; b.type='button'; b.title='Instructor only: who did this page';
    b.innerHTML='Who did this page<b id="pw-n">…</b>';
    b.onclick=function(){ FILTER=null; SEL=null; open(); };
    document.body.appendChild(b);
    var p=document.createElement('div'); p.id='pw';
    p.innerHTML='<header><h3>Who did this page</h3><button type="button" id="pw-re">↻ Read again</button><button type="button" id="pw-x">Close</button></header><div class="pw-in" id="pw-in">Reading…</div>';
    document.body.appendChild(p);
    document.getElementById('pw-x').onclick=close;
    document.getElementById('pw-re').onclick=function(){ refresh(true); };
    p.addEventListener('click',function(e){
      var r=e.target.closest('[data-sid]'); if(r){ SEL=r.getAttribute('data-sid'); paint(); var a=document.getElementById('pw-ans'); if(a)a.scrollIntoView({block:'start'}); return; }
      var f=e.target.closest('[data-filter]'); if(f){ var v=f.getAttribute('data-filter'); FILTER=v||null; SEL=null; paint(); document.getElementById('pw-in').scrollTop=0; }
    });
  }
  function open(){ OPEN=true; document.getElementById('pw').classList.add('on'); paint(); refresh(false);
    if(!TIMER)TIMER=setInterval(function(){ if(OPEN&&!document.hidden)refresh(false); },30000); }
  function close(){ OPEN=false; document.getElementById('pw').classList.remove('on'); }

  function refresh(force){
    if(!force&&DATA&&Date.now()-READ_AT<15000){ paint(); return Promise.resolve(); }
    return read().then(function(){ paint(); badges(); }).catch(function(e){
      var box=document.getElementById('pw-in');
      if(box)box.innerHTML='<p>The class could not be read ('+esc(e.message)+'). Sign in on <a href="/admin/">the admin console</a> on this device, then press ↻.</p>';
      var n=document.getElementById('pw-n'); if(n)n.textContent='!';
    });
  }

  function paint(){
    var n=document.getElementById('pw-n');
    if(!DATA){ return; }
    var R=rows(), S=R.steps, all=R.list, opened=all.filter(function(x){return x.opened;});
    if(n)n.textContent=opened.length+' / '+all.length;
    if(!OPEN)return;
    var h='<p class="pw-note">'+esc(COURSE)+' · module '+esc(MOD)+' · read '+when(READ_AT)+' · re-read every 30 s while open. Only this device sees this panel.</p>';
    h+='<p><b>'+opened.length+'</b> of '+all.length+' students in the course opened this page or saved an answer on it; <b>'+all.filter(function(x){return S.length&&x.n===S.length;}).length+'</b> did every step.</p>';
    /* steps */
    h+='<h4>Each step: how many did it</h4><table><tr><th>Step</th><th>Done</th><th></th></tr>';
    S.forEach(function(id,i){
      var who=all.filter(function(x){return x.done[id];}), p=all.length?who.length/all.length:0;
      h+='<tr class="click'+(FILTER===id?' sel':'')+'" data-filter="'+(FILTER===id?'':id)+'"><td>'+(i+1)+'. '+esc(stepLabel(id))+'</td><td><b>'+who.length+'</b></td><td style="width:90px"><div class="bar"><i style="width:'+Math.round(p*100)+'%"></i></div></td></tr>';
    });
    h+='</table>';
    if(FILTER){
      var did=all.filter(function(x){return x.done[FILTER];}), not=opened.filter(function(x){return !x.done[FILTER];});
      h+='<div class="ans"><b>'+esc(stepLabel(FILTER))+'</b><br><span class="l">Did it ('+did.length+'):</span> '+(did.map(function(x){return '<span class="chip" data-sid="'+esc(x.sid)+'">'+esc(x.name)+'</span>';}).join('')||'nobody')+
         '<br><span class="l">Opened the page but not this step ('+not.length+'):</span> '+(not.map(function(x){return '<span class="chip" data-sid="'+esc(x.sid)+'">'+esc(x.name)+'</span>';}).join('')||'nobody')+
         '<br><button class="pw-b" type="button" data-filter="">Show all students</button></div>';
    }
    /* students */
    h+='<h4>Each student · click a name to read their answers</h4><table><tr><th>Name</th><th>Steps</th><th>Answers</th><th>Last change</th></tr>';
    all.forEach(function(x){
      if(FILTER&&!x.opened)return;
      h+='<tr class="click'+(SEL===x.sid?' sel':'')+'" data-sid="'+esc(x.sid)+'"><td><b>'+esc(x.name)+'</b>'+(x.team?'<br><span class="pw-note">'+esc(x.team.slice(0,60))+'</span>':'')+'</td>'+
         '<td><span class="dots">'+S.map(function(id){return '<span'+(x.done[id]?' class="d"':'')+' title="'+esc(stepLabel(id))+'"></span>';}).join('')+'</span> '+x.n+'/'+S.length+'</td>'+
         '<td>'+x.fields.length+'</td><td class="pw-note">'+(x.opened?when(x.last):'not opened')+'</td></tr>';
    });
    h+='</table>';
    if(SEL){
      var x=all.filter(function(y){return y.sid===SEL;})[0];
      if(x){
        h+='<div id="pw-ans"><h4>'+esc(x.name)+' · '+x.n+' of '+S.length+' steps · '+x.fields.length+' answers</h4>';
        h+='<p class="pw-note">Steps done: '+(S.filter(function(id){return x.done[id];}).map(function(id){return esc(stepLabel(id));}).join(' · ')||'none')+'</p>';
        h+=x.fields.length?x.fields.map(function(f){return '<div class="ans"><div class="l">'+esc(f.label)+' · '+when(f.ts)+'</div><div class="v">'+esc(f.v)+'</div></div>';}).join(''):'<p>No answer saved on this page.</p>';
        h+='<p><a href="/shared/admin2.html?course='+encodeURIComponent(COURSE)+'&student='+encodeURIComponent(x.sid)+'" target="_blank">Open in the dashboard</a> · <a href="/shared/chat.html?course='+encodeURIComponent(COURSE)+'&t=dm-'+encodeURIComponent(x.sid)+'" target="_blank">Message '+esc(x.name.split(' ')[0])+'</a></p></div>';
      }
    }
    document.getElementById('pw-in').innerHTML=h;
  }

  /* a count on each step of the page itself */
  function badges(){
    if(!DATA)return;
    var R=rows();
    R.steps.forEach(function(id){
      var e=document.getElementById(id); if(!e)return;
      var b=e.querySelector(':scope > .pw-count');
      if(!b){ b=document.createElement('span'); b.className='pw-count'; b.title='Instructor only: who did this step';
        b.onclick=function(ev){ ev.stopPropagation(); FILTER=id; SEL=null; open(); }; e.insertBefore(b,e.firstChild); }
      b.textContent=R.list.filter(function(x){return x.done[id];}).length+' of '+R.list.length+' did this';
    });
  }

  window.PageWatch={ refresh:function(){return refresh(true);}, data:function(){return DATA;}, open:open };
  function boot(){ btn(); refresh(true); setInterval(function(){ if(!OPEN&&!document.hidden)refresh(true); },120000); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
})();
