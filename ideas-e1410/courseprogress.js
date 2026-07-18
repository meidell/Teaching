/* =====================================================================
   E1410 · shared course-progress ("mama") bar.
   ONE aggregate bar chopped into chapter segments (the gaps are the
   dividers). Used two ways:
     • full   — with per-chapter cards + caption, on index.html
     • compact — bar only, in the top banner of session/reading pages
   Overall % = mean of chapter fractions (equal-width segments, so it
   equals filled length ÷ total length). Reads local progress instantly,
   then refines from Firebase (cross-device). Completion items are
   written by progress.js under localStorage e1410_done_<mod> and
   e1410/<sid>/mod/<mod>. To extend (forum, homework, more sessions):
   add a row to CHAPTERS and have that page record completion under its
   mod id — nothing else changes.
   ===================================================================== */
window.CourseProgress=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var CHAPTERS=[
    {mod:'s1',short:'S1',name:'Session 1 · Foundations',total:7,live:true},
    {mod:'s2',short:'S2',name:'Session 2 · Planning',total:7,live:false},
    {mod:'s3',short:'S3',name:'Session 3 · Resources',total:7,live:false},
    {mod:'s4',short:'S4',name:'Session 4 · Risk',total:7,live:false},
    {mod:'s5',short:'S5',name:'Session 5 · Agile & teams',total:7,live:false},
    {mod:'s6',short:'S6',name:'Session 6 · Monitoring & cases',total:7,live:false},
    {mod:'s7',short:'S7',name:'Session 7 · Case workshop',total:7,live:false},
    {mod:'s8',short:'S8',name:'Session 8 · Review',total:7,live:false},
    {mod:'r1',short:'R1',name:'Reading · AI Superpowers',total:2,live:true},
    {mod:'r2',short:'R2',name:'Reading · AI & PM study',total:2,live:true},
    {mod:'r3',short:'R3',name:'Reading · PM2030',total:2,live:true},
    {mod:'r4',short:'R4',name:'Reading · SME adoption',total:2,live:true},
    {mod:'forum',short:'Forum',name:'Discussion forum',total:1,live:false},
    {mod:'exam',short:'Exam',name:'Final assessment',total:1,live:false}
  ];
  function localDone(mod){try{var o=JSON.parse(localStorage.getItem('e1410_done_'+mod)||'{}');var n=0;for(var k in o){if(o[k])n++;}return n;}catch(e){return 0;}}
  function pctOf(data){var s=0;CHAPTERS.forEach(function(c){s+=c.total?Math.min(1,data[c.mod].done/c.total):0;});return Math.round(s/CHAPTERS.length*100);}
  function caption(data){
    var live=CHAPTERS.filter(function(c){return c.live;});
    var done=live.filter(function(c){return data[c.mod].done>=c.total;}).length;
    return done===live.length
      ? '✓ You’re up to date — everything available is done. Sessions 2–8, the forum and the final assessment unlock through August.'
      : 'You’ve completed '+done+' of '+live.length+' available chapters. The bar fills as you finish each session, reading and quiz — and grows as new chapters unlock.';
  }
  function buildList(data,el){
    el.innerHTML='';
    CHAPTERS.forEach(function(c){
      var d=data[c.mod].done,st,cls;
      if(!c.live){st='Upcoming';cls='up';}
      else if(d>=c.total){st='Done ✓';cls='done';}
      else if(d>0){st=d+'/'+c.total;cls='prog';}
      else{st='Not started';cls='prog';}
      var ci=document.createElement('div');ci.className='ci';
      ci.innerHTML='<span></span><span class="st '+cls+'"></span>';
      ci.children[0].textContent=c.name;ci.children[1].textContent=st;
      el.appendChild(ci);
    });
  }
  function paint(data,opts){
    if(opts.bar){
      opts.bar.innerHTML='';
      CHAPTERS.forEach(function(c){
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
    if(opts.pct)opts.pct.textContent=pctOf(data)+'%';
    if(opts.cap)opts.cap.textContent=caption(data);
    if(opts.list)buildList(data,opts.list);
    if(opts.reveal)opts.reveal.style.display='block';
  }
  function render(opts){
    var data={};CHAPTERS.forEach(function(c){data[c.mod]={done:Math.min(c.total,localDone(c.mod))};});
    paint(data,opts);
    var a=window.E1410_AUTH;
    if(a&&a.sid){
      fetch(DB+'/e1410/'+a.sid+'/mod.json').then(function(r){return r.json();}).then(function(m){
        if(!m)return;
        CHAPTERS.forEach(function(c){var node=m[c.mod];if(node&&node.done){var n=0;for(var k in node.done){if(node.done[k])n++;}n=Math.min(c.total,n);if(n>data[c.mod].done)data[c.mod].done=n;}});
        paint(data,opts);
      }).catch(function(){});
    }
  }
  return {CHAPTERS:CHAPTERS,render:render,pct:pctOf};
})();
