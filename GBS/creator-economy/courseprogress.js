/* =====================================================================
   GBS · The Creator Economy & Search Everywhere Optimization —
   the course-progress ("mama") bar.  Ported from
   HEG/quantitative-methods/courseprogress.js; two modes:
     • full    — bar + per-session cards + caption, on index.html
     • compact — segmented bar only, in the top banner of a session page
   Overall % = mean of chapter fractions over the LIVE chapters that count.
   Reads local progress instantly (creator_done_<mod>, written by
   /shared/progress.js), then refines from Firebase creator/<sid>/mod when
   the student is signed in through /shared/login.js (creator_auth).

   ⚠ THE MODULE IDS ARE THE SCHOOL'S WEEK NUMBERS, NOT 1…11.
   The GBS academic calendar runs Week 01…Week 11 with Week 09 given over
   to Specialization Module 1, so this course teaches w1…w8, w10, w11 and
   then presentation week. There is deliberately NO w9 chapter — the hub
   still draws a card for that week so the grid does not lie about the
   term, but nothing is tracked against it. Numbering the sessions 1…11
   instead would mean every conversation with a student needed translating
   between "session 9" and "week 10"; this way the site, the timetable and
   the room all say the same number.

   ⚠ Adding a REQUIRED chapter mid-term lowers every enrolled student's
   displayed percentage — the trap every course in this repo documents.
   All eleven sessions are therefore listed ALREADY, hatched; shipping a
   page flips live:true and never changes the denominator, because pctOf()
   averages over the live chapters only.

   `total` is the number of trackable steps on each session page. They are
   provisional until the page is written — set the real number when the
   page ships, in the same commit, or the bar reports a fraction of a
   denominator that does not exist. Each session is a 1 h 45 workshop
   whose page is a run sheet plus the capture widgets (prediction, dataset
   row, artifact upload), NOT a slide deck, so the counts are small by
   design.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="creator", K="creator";
  var CHAPTERS=[
    {mod:'w1',  short:'W1', name:'Week 01 · One question, fifteen phones, and the pipeline',        total:8, live:true, href:'week1.html'},
    {mod:'w2',  short:'W2', name:'Week 02 · Reverse-engineer a winner',           total:7, live:true, href:'week2.html'},
    {mod:'w3',  short:'W3', name:'Week 03 · Get your page quoted by AI',          total:7, live:true, href:'week3.html'},
    {mod:'w4',  short:'W4', name:'Week 04 · Choosing content creators on a budget',                 total:7, live:true, href:'week4.html'},
    {mod:'w5',  short:'W5', name:'Week 05 · Negotiating a content creator contract', total:6, live:true, href:'week5.html'},
    {mod:'w6',  short:'W6', name:'Week 06 · Find the lie',                        total:5, live:false},
    {mod:'w7',  short:'W7', name:'Week 07 · Crisis, on the clock',                total:5, live:false},
    {mod:'w8',  short:'W8', name:'Week 08 · Live commerce — watch it, then do it',total:5, live:false},
    /* Week 09 is Specialization Module 1 — no session, and no chapter. */
    {mod:'w10', short:'W10',name:'Week 10 · First reading, and the spine',        total:5, live:false},
    {mod:'w11', short:'W11',name:'Week 11 · The verdict, and the rehearsal',      total:5, live:false},
    {mod:'wp',  short:'PW', name:'Presentation week · The pitch',                 total:3, live:false}
  ];
  /* ---- the student's own view (12 Nov 2026) ----------------------------
     Jan Erik: "make more obvious their progress … without making them block
     or angry (the ones who do not care)". Rules, so a later edit keeps them:
     what is DONE is counted, never what is missing; no percentage of the
     whole course (it reads like a grade); no comparison with anyone; no red;
     every open step is "still open", never "missed"; ONE suggestion of what
     to do next; nothing blocks, nothing pops up, and the strip on a session
     page closes with × for the visit. A student with nothing logged sees
     nothing (the 17 Oct rule below). STEPS = each live page's step ids and
     headings, in page order — add the new page's list when it ships. */
  var STEPS={"w1": [["s1", "Prediction"], ["s2", "The query round"], ["s3", "The wall"], ["s4", "The pipeline: how a page becomes a citation"], ["s5", "Teams and roles"], ["s6", "Three candidate mechanisms"], ["s7", "Gallery walk"], ["s8", "Close"]], "w2": [["s1", "Open the seal"], ["s2", "Six checks: what makes a page quotable"], ["s3", "Your team's audit"], ["s4", "Compare, then three reasons"], ["s5", "Try to break the reasons"], ["s6", "What survived: \"what makes a source quotable\", version 1"], ["s7", "Close"]], "w3": [["s1", "How a new page gets quoted"], ["s2", "Pick one question"], ["s3", "First measurement, before the page exists"], ["s4", "Build the page with an AI assistant"], ["s5", "Put the page online with Netlify"], ["s6", "Tell Google and Bing the page exists"], ["s7", "Write the experiment plan"]], "w4": [["s1", "The weekly check"], ["s2", "How a sponsored post turns into a sale"], ["s3", "The brief and the pool"], ["s4", "The teams take turns choosing content creators from the shared pool"], ["s5", "Predict your CPA, in writing"], ["s6", "The benchmarks arrive"], ["s7", "Sign the pick list"]], "w5": [["s1", "The weekly check: Week 2"], ["s2", "What a content creator contract settles"], ["s3", "Get your role from the instructor, then read your confidential instructions"], ["s4", "Prepare on your own: write your preparation memo"], ["s5", "Negotiate with your partner, then record the outcome"], ["s6", "Compare the class's deals, read the other side's instructions, and answer four questions"]]};
  function localIds(mod){try{var o=JSON.parse(localStorage.getItem(K+'_done_'+mod)||'{}'),r={};for(var k in o){if(o[k])r[k]=1;}return r;}catch(e){return {};}}
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function sessNo(c){return c.mod==='wp'?'Presentation':'Session '+parseInt(c.mod.slice(1),10);}
  function topic(c){return c.name.replace(/^[^·]*·\s*/,'');}
  function css(){
    if(document.getElementById('cp-you'))return;
    var st=document.createElement('style');st.id='cp-you';
    st.textContent='.cp-pick{display:block;text-decoration:none;color:var(--navy,#14213D);background:var(--accent-pale,#FFF4E3);border:1.5px solid var(--accent,#D58517);border-radius:12px;padding:12px 14px;margin:6px 0 12px;font-size:14px;line-height:1.45}'+
      '.cp-pick b{color:var(--accent-deep,#9A5A00)} .cp-pick .go{font-weight:800;white-space:nowrap}'+
      '.cp-rows{margin-top:6px}.cp-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;padding:8px 0;border-bottom:1px dashed var(--line,#DDE2EC);font-size:13px}'+
      '.cp-row a.n{color:inherit;text-decoration:none;font-weight:700}.cp-row .s{font-size:12px;color:var(--grey,#6B7689);white-space:nowrap;text-align:right}.cp-row .s.ok{color:var(--ok,#1F8A4C);font-weight:800}'+
      '.cp-dots{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:5px}.cp-dots a{width:15px;height:15px;border-radius:50%;border:2px solid var(--accent,#D58517);background:#fff;display:inline-block}.cp-dots a.d{background:var(--accent,#D58517)}'+
      '@media(max-width:560px){.cp-row{grid-template-columns:1fr}.cp-row .s{text-align:left;white-space:normal}.mama .mh{flex-wrap:wrap}}'+
      '.cp-up{font-size:12px;color:var(--grey,#6B7689);margin-top:10px}'+
      '.cp-strip{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#fff;border:1.5px solid var(--accent,#D58517);border-radius:12px;padding:10px 14px;margin:0 0 16px;font-size:14px;color:var(--navy,#14213D)}'+
      '.cp-strip .cp-dots{grid-column:auto;flex:0 0 auto}.cp-strip .t{flex:1;min-width:200px}.cp-strip button{border:none;background:none;font-size:18px;color:var(--grey,#6B7689);cursor:pointer;padding:0 4px}'+
      '.cp-strip a.go{font-weight:800;color:var(--accent-deep,#9A5A00)}';
    document.head.appendChild(st);
  }
  function dots(c,ids){return '<span class="cp-dots">'+(STEPS[c.mod]||[]).map(function(x,i){return '<a href="'+c.href+'#'+x[0]+'" class="'+(ids[x[0]]?'d':'')+'" title="Step '+(i+1)+' · '+esc(x[1])+(ids[x[0]]?' · done':' · still open')+'"></a>';}).join('')+'</span>';}
  function firstOpen(c,ids){var L=STEPS[c.mod]||[];for(var i=0;i<L.length;i++)if(!ids[L[i][0]])return {i:i,id:L[i][0],t:L[i][1]};return null;}
  /* the one suggestion: the newest published session if it is not finished, else the newest unfinished one already started */
  function suggestion(data){
    var live=counted().filter(function(c){return c.live&&STEPS[c.mod];});if(!live.length)return null;
    var last=live[live.length-1];
    var f=firstOpen(last,data[last.mod].ids);if(f)return {c:last,f:f};
    for(var i=live.length-2;i>=0;i--){var c=live[i];if(data[c.mod].done>0){var g=firstOpen(c,data[c.mod].ids);if(g)return {c:c,f:g};}}
    return null;
  }
  function paintYou(data,opts){
    css();
    var live=counted().filter(function(c){return c.live&&STEPS[c.mod];});
    var steps=0,full=0;live.forEach(function(c){var n=Object.keys(data[c.mod].ids).length;steps+=Math.min(n,c.total);if(n>=c.total)full++;});
    if(opts.pct)opts.pct.textContent=steps+(steps===1?' step':' steps')+' done';
    if(opts.cap)opts.cap.textContent=(full?full+(full===1?' session':' sessions')+' complete. ':'')+'Your instructor reads your participation (25 %) and your session work (25 %) from what you save on the session pages. Every step stays open until the end of the course.';
    if(opts.pick){
      var sg=suggestion(data);
      opts.pick.innerHTML=sg?'<a class="cp-pick" href="'+sg.c.href+'#'+sg.f.id+'"><b>Pick up here:</b> '+sessNo(sg.c)+', Step '+(sg.f.i+1)+' · '+esc(sg.f.t)+' <span class="go">→ open it</span></a>'
        :'<div class="cp-pick"><b>You are up to date.</b> Every step of every published session is done.</div>';
    }
    if(opts.list){
      var h='<div class="cp-rows">';
      live.slice().reverse().forEach(function(c){
        var ids=data[c.mod].ids,n=Math.min(c.total,Object.keys(ids).length);
        h+='<div class="cp-row"><a class="n" href="'+c.href+'">'+sessNo(c)+' · '+esc(topic(c))+'</a><span class="s'+(n>=c.total?' ok':'')+'">'+(n>=c.total?'Complete ✓':n?n+' of '+c.total+' steps · the rest is still open':'Not opened yet · still open')+'</span>'+dots(c,ids)+'</div>';
      });
      var up=counted().filter(function(c){return !c.live;});
      h+='</div>'+(up.length?'<div class="cp-up">Coming next: '+up.map(function(c){return sessNo(c);}).join(' · ')+'. Each page is published before its session.</div>':'');
      opts.list.innerHTML=h;opts.list.className='';
    }
  }
  /* on a session page: one strip above the banner — where you are on THIS page */
  function paintStrip(data){
    var mod=document.body&&document.body.getAttribute('data-module');var c=CHAPTERS.filter(function(x){return x.mod===mod&&STEPS[x.mod];})[0];if(!c)return;
    try{if(sessionStorage.getItem(K+'_strip_x_'+mod))return;}catch(e){}
    var host=document.querySelector('.banner');if(!host)return;
    css();
    var ids=data[mod].ids,n=Math.min(c.total,Object.keys(ids).length);
    var el=document.getElementById('cp-strip');
    if(!n){if(el)el.remove();return;}
    if(!el){el=document.createElement('div');el.id='cp-strip';el.className='cp-strip';host.parentNode.insertBefore(el,host);
      el.addEventListener('click',function(e){if(e.target.closest('button')){try{sessionStorage.setItem(K+'_strip_x_'+mod,'1');}catch(x){}el.remove();}});}
    var f=firstOpen(c,ids);
    el.innerHTML=dots(c,ids).replace(new RegExp(c.href.replace('.','\\.')+'#','g'),'#')+'<span class="t">'+(f?'You have done '+n+' of '+c.total+' steps on this page. <a class="go" href="#'+f.id+'">Continue with Step '+(f.i+1)+': '+esc(f.t)+' ↓</a>':'<b>You have done every step on this page ✓</b>')+'</span><button type="button" title="Hide for this visit">×</button>';
  }
  function localDone(mod){try{var o=JSON.parse(localStorage.getItem(K+'_done_'+mod)||'{}');var n=0;for(var k in o){if(o[k])n++;}return n;}catch(e){return 0;}}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  /* build the chapter data straight from a student's Firebase mod object —
     used by the instructor dashboard to draw each student's course bar */
  function dataFromMods(modObj){var data={};CHAPTERS.forEach(function(c){var n=0,node=modObj&&modObj[c.mod];if(node&&node.done){for(var k in node.done){if(node.done[k])n++;}}data[c.mod]={done:Math.min(c.total,n)};});return data;}
  function counted(){return CHAPTERS.filter(function(c){return !c.opt;});}
  function pctOf(data){var u=counted().filter(function(c){return c.live;}),s=0;if(!u.length)return 0;u.forEach(function(c){s+=c.total?Math.min(1,data[c.mod].done/c.total):0;});return Math.round(s/u.length*100);}
  function caption(data){
    var live=counted().filter(function(c){return c.live;});
    var done=live.filter(function(c){return data[c.mod].done>=c.total;}).length;
    var up=counted().filter(function(c){return !c.live;}).length;
    if(!live.length)return 'The term opens in Week 01. Each session page is published as soon as it is written, ahead of its date.';
    return (done===live.length
      ? '✓ You’re up to date — every session published so far is logged.'
      : 'You’ve completed '+done+' of '+live.length+' published sessions. The bar fills as you log the work you actually did in the room.')
      + (up?' '+up+' more to come as they are written — the hatched segments.':'');
  }
  function buildList(data,el){
    el.innerHTML='';
    CHAPTERS.forEach(function(c){
      var d=data[c.mod].done,st,cls;
      if(!c.live){st='Upcoming';cls='up';}
      else if(d>=c.total){st='Done ✓';cls='done';}
      else if(d>0){st=d+'/'+c.total;cls='prog';}
      else if(c.opt){st='Optional';cls='up';}
      else{st='Not started';cls='prog';}
      var ci=document.createElement('div');ci.className='ci'+(c.opt?' opt':'');
      ci.innerHTML='<span></span><span class="st '+cls+'"></span>';
      if(c.href&&c.live){
        var a=document.createElement('a');a.href=c.href;a.textContent=c.name;
        a.style.cssText='color:inherit;text-decoration:none;border-bottom:1px dotted currentColor;';
        ci.children[0].appendChild(a);
      } else ci.children[0].textContent=c.name;
      ci.children[1].textContent=st;
      el.appendChild(ci);
    });
  }
  function paint(data,opts){
    if(opts.bar){
      opts.bar.innerHTML='';
      counted().forEach(function(c){
        var frac=c.total?Math.min(1,data[c.mod].done/c.total):0;
        if(opts.compact){
          var seg=document.createElement('div');seg.className='cseg'+(!c.live?' locked':'');
          seg.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':'upcoming');
          seg.innerHTML='<div class="cf" style="width:'+(frac*100)+'%"></div>';
          opts.bar.appendChild(seg);
        }else{
          var col=document.createElement('div');col.className='segcol';
          col.title=c.name+' — '+(c.live?Math.round(frac*100)+'%':'upcoming');
          col.innerHTML='<div class="seg'+(!c.live?' locked':'')+(frac>=1?' done':'')+'"><div class="fill" style="width:'+(frac*100)+'%"></div></div><span class="code"></span>';
          col.querySelector('.code').textContent=c.short;
          opts.bar.appendChild(col);
        }
      });
    }
    if(opts.you)paintYou(data,opts);
    else{
      if(opts.pct)opts.pct.textContent=pctOf(data)+'%';
      if(opts.cap)opts.cap.textContent=caption(data);
      if(opts.list)buildList(data,opts.list);
    }
    if(opts.compact){paintStrip(data);LAST=data;}
    /* the bar is shown only once SOMETHING has been logged: an empty bar
       on a first visit says "you have done nothing" to a student who has
       not been asked to yet. Until then the hub's next-session card is
       the top of the page. (17 Oct 2026) */
    if(opts.reveal){var any=counted().some(function(c){return data[c.mod]&&data[c.mod].done>0;});opts.reveal.style.display=any?'block':'none';}
  }
  function render(opts){
    var data={};CHAPTERS.forEach(function(c){data[c.mod]={done:Math.min(c.total,localDone(c.mod)),ids:localIds(c.mod)};});
    paint(data,opts);
    var a=auth();
    if(a){
      fetch(DB+'/'+NS+'/'+a.sid+'/mod.json').then(function(r){return r.json();}).then(function(m){
        if(!m)return;
        CHAPTERS.forEach(function(c){var node=m[c.mod];if(node&&node.done){for(var k in node.done){if(node.done[k])data[c.mod].ids[k]=1;}var n=Math.min(c.total,Object.keys(data[c.mod].ids).length);if(n>data[c.mod].done)data[c.mod].done=n;}});
        paint(data,opts);
      }).catch(function(){});
    }
  }
  var LAST=null;
  /* a step pressed on this page updates the strip within a few seconds (local progress only) */
  setInterval(function(){if(!LAST||document.hidden)return;var mod=document.body&&document.body.getAttribute('data-module');if(!LAST[mod])return;var ids=localIds(mod),ch=false;for(var k in ids)if(!LAST[mod].ids[k]){LAST[mod].ids[k]=1;ch=true;}if(ch)paintStrip(LAST);},3000);
  return {CHAPTERS:CHAPTERS,render:render,pct:pctOf,paint:paint,dataFromMods:dataFromMods,auth:auth};
})();
