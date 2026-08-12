/* =====================================================================
   E1410 · two reusable exercise widgets for the session pages.

     E1410Ex.recall({...})  — the 60-second retrieval opener: two questions
                              about the PREVIOUS session, on the home screen,
                              before any new material.
     E1410Ex.spot({...})    — "diagnose the artefact": a plausible-looking
                              piece of work with planted faults. Click them.

   ---------------------------------------------------------------------
   WHY THESE TOUCH NOTHING THAT COUNTS
   ---------------------------------------------------------------------
   Each session page computes its own progress bar as

       totalSteps() = 1 + .cl-row + .q + [data-work]

   and reports section completion to the database as SECTIONS.length. So
   anything added to a live page that uses `.q`, `.cl-row`, `data-work`,
   markSection() or StatsTrack.complete() silently lowers every enrolled
   student's displayed progress — the same trap courseprogress.js documents
   for the five primers.

   These widgets therefore:
     • use their own class names (.rc-*, .sp-*), never .q or .cl-row
     • never call markSection / markStep / StatsTrack.complete / setScore
     • keep their own state in localStorage under e1410_ex_*
     • write ONE summary line to <sid>/work/<id> so the instructor can see
       who did them — the same shape /shared/progress.js writes, which the
       dashboard already renders under "other written answers"

   Net effect: additive. Nobody's percentage moves, and nothing is gated.
   ===================================================================== */
window.E1410Ex = (function () {
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function lget(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}}
  function lset(k,v){try{localStorage.setItem(k,v);}catch(e){}}

  /* ------------------------------------------------------------------
     Styles live here, not in session.css, because sessions 1 and 2 still
     carry their own inline <style> and never load session.css. Injecting
     once keeps the widget identical on all eight pages without retrofitting
     two bespoke stylesheets — the same approach /shared/progress.js takes.
     ------------------------------------------------------------------ */
  var CSS = [
/* 680px centred matches .objectives / .materials on the home screen — the
   opener must not be wider than the cards it sits between. */
".rc{background:#fff;border:1px solid #E2E8F0;border-left:4px solid #AB0E00;border-radius:0 16px 16px 0;padding:20px 22px;margin:26px auto 0;max-width:680px;box-shadow:0 18px 50px -24px rgba(171,14,0,.35);}",
".rc-kick{font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:#AB0E00;}",
".rc-head h4{font-size:18px;margin:5px 0 4px;color:#0F172A;font-weight:800;letter-spacing:-.3px;}",
".rc-sub{font-size:13px;color:#64748B;margin-bottom:14px;max-width:66ch;line-height:1.55;}",
".rc-q{padding-top:12px;border-top:1px solid #E2E8F0;margin-top:12px;}",
".rc-q:first-of-type{border-top:none;padding-top:0;margin-top:0;}",
".rc-qt{font-size:14.5px;font-weight:700;color:#0F172A;margin-bottom:8px;line-height:1.45;}",
".rc-opts{display:flex;flex-direction:column;gap:6px;}",
".rc-opt{display:block;width:100%;text-align:left;font:600 13.5px/1.45 'Plus Jakarta Sans',Arial,sans-serif;color:#334155;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:10px;padding:9px 13px;cursor:pointer;transition:.12s;}",
".rc-opt:hover:not(:disabled){border-color:#AB0E00;color:#0F172A;}",
".rc-opt:disabled{cursor:default;}",
".rc-opt.ok{background:#DCFCE7;border-color:rgba(21,128,61,.45);color:#14532D;font-weight:800;}",
".rc-opt.no{background:#FBEAE8;border-color:rgba(171,14,0,.4);color:#7C0A00;font-weight:800;}",
".rc-opt.dim{opacity:.5;}",
".rc-why{font-size:13px;color:#78350F;background:#FEF3C7;border-radius:9px;padding:9px 12px;margin-top:8px;line-height:1.5;}",
".rc-why.good{color:#14532D;background:#DCFCE7;}",
".rc-foot{font-size:12.5px;color:#64748B;margin-top:14px;padding-top:12px;border-top:1px solid #E2E8F0;font-style:italic;}",
".rc-done{display:flex;align-items:center;gap:10px;font-size:13.5px;color:#334155;padding:13px 18px;}",
".rc-done b{color:#0F172A;}",
".rc-tick{color:#15803D;font-weight:800;font-size:16px;}",
".rc-again{margin-left:auto;background:none;border:1.5px solid #E2E8F0;border-radius:20px;padding:5px 13px;font:700 12px 'Plus Jakarta Sans',Arial,sans-serif;color:#7C0A00;cursor:pointer;}",
".rc-again:hover{border-color:#AB0E00;background:#FBEAE8;}",

".sp{background:#fff;border:1px solid #E2E8F0;border-radius:18px;padding:24px;margin-bottom:18px;box-shadow:0 18px 50px -24px rgba(171,14,0,.35);}",
".sp-kick{font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:#AB0E00;}",
".sp-head h3{font-size:19px;margin:6px 0 5px;color:#0F172A;font-weight:800;letter-spacing:-.3px;}",
".sp-sub{font-size:13.5px;color:#334155;margin-bottom:16px;max-width:70ch;line-height:1.6;}",
".sp-doc{border:1.5px solid #E2E8F0;border-radius:12px;padding:12px 0;background:#F8FAFC;overflow:hidden;}",
".sp-doct{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:#64748B;padding:0 14px 8px;}",
".sp-line{display:flex;align-items:baseline;gap:8px;width:100%;text-align:left;background:none;border:none;border-left:3px solid transparent;font:600 13.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#334155;padding:5px 14px;cursor:pointer;transition:.1s;}",
".sp-line:hover:not(:disabled){background:rgba(171,14,0,.05);}",
".sp-line.head{font-weight:800;color:#0F172A;}",
".sp-line.picked{background:rgba(171,14,0,.09);border-left-color:#AB0E00;color:#7C0A00;}",
".sp-line.isfault{background:#FEE2E2;border-left-color:#B91C1C;color:#7F1D1D;}",
".sp-line.isfalse{background:#DCFCE7;border-left-color:#15803D;color:#14532D;}",
".sp-line:disabled{cursor:default;}",
".sp-t{flex:1;}",
".sp-flag{flex:none;font:800 9.5px 'Plus Jakarta Sans',Arial,sans-serif;letter-spacing:.6px;text-transform:uppercase;background:#B91C1C;color:#fff;border-radius:4px;padding:2px 6px;}",
".sp-flag.ok{background:#15803D;}",
".sp-why{font-size:13px;color:#334155;line-height:1.55;padding:8px 16px 12px 34px;background:#F1F5F9;}",
".sp-why b{color:#0F172A;}",
".sp-why.fine{color:#14532D;background:#F0FDF4;}",
".sp-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;}",
".sp-count{font-size:13px;color:#64748B;}",
".sp-count b{color:#0F172A;}",
".sp-check,.sp-again{margin-left:auto;background:#AB0E00;color:#fff;border:none;border-radius:30px;padding:9px 18px;font:800 13px 'Plus Jakarta Sans',Arial,sans-serif;cursor:pointer;}",
".sp-check:hover{background:#7C0A00;}",
".sp-again{background:transparent;color:#7C0A00;border:1.5px solid #AB0E00;}",
".sp-again:hover{background:#FBEAE8;}",
".sp-after{font-size:13.5px;color:#334155;background:#FBEAE8;border:1px solid rgba(171,14,0,.2);border-radius:12px;padding:13px 16px;margin-top:14px;line-height:1.55;}",
".sp-after b{color:#7C0A00;}",
".sp-after a{color:#7C0A00;font-weight:800;}",
"@media(max-width:560px){.sp{padding:16px 14px;}.sp-line{font-size:11.5px;}.sp-why{padding-left:20px;}}"
  ].join('\n');

  function injectCSS(){
    if(document.getElementById('e1410-ex-css'))return;
    var st=document.createElement('style');
    st.id='e1410-ex-css';
    st.textContent=CSS;
    document.head.appendChild(st);
  }

  /* one summary line per exercise, so the instructor can see engagement
     without any of it counting toward a grade or a progress bar */
  function record(id,label,value){
    lset('e1410_work_'+id,value);
    var a=window.E1410_AUTH;
    if(!a||!a.sid)return;
    try{
      fetch(DB+'/e1410/'+a.sid+'/work/'+id+'.json',{method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({v:value,label:label,mod:'exercise',ts:Date.now()})}).catch(function(){});
    }catch(e){}
  }

  /* =================================================================
     RETRIEVAL OPENER
     Two questions from last session. Not marked, not counted — the
     point is the act of retrieving, which is what makes it stick.
     ================================================================= */
  function recall(cfg){
    var host=document.getElementById(cfg.slot||'recallSlot');
    if(!host||!cfg.items||!cfg.items.length)return;
    injectCSS();
    var KEY='e1410_ex_recall_'+cfg.id;
    var state={};
    try{state=JSON.parse(lget(KEY)||'{}');}catch(e){state={};}

    function done(){return cfg.items.every(function(_,i){return state['q'+i]!=null;});}

    function paint(){
      if(done() && !state.open){
        var right=cfg.items.filter(function(it,i){return state['q'+i]===it.a;}).length;
        host.innerHTML='<div class="rc rc-done"><span class="rc-tick">✓</span>'+
          '<span>Warm-up done — <b>'+right+' of '+cfg.items.length+'</b> from '+esc(cfg.prev)+'.</span>'+
          '<button class="rc-again" type="button">Show it again</button></div>';
        host.querySelector('.rc-again').addEventListener('click',function(){
          state.open=1;lset(KEY,JSON.stringify(state));paint();
        });
        return;
      }
      var h='<div class="rc"><div class="rc-head"><span class="rc-kick">Before we start · 60 seconds</span>'+
        '<h4>Two from '+esc(cfg.prev)+'</h4>'+
        '<p class="rc-sub">Not marked, not counted, and worth more than re-reading the slides. Answer from memory — being wrong here is the point.</p></div>';
      cfg.items.forEach(function(it,i){
        var picked=state['q'+i];
        h+='<div class="rc-q" data-i="'+i+'"><div class="rc-qt">'+esc(it.q)+'</div><div class="rc-opts">';
        it.opts.forEach(function(o,j){
          var cls='';
          if(picked!=null){
            if(j===it.a)cls=' ok';
            else if(j===picked)cls=' no';
            else cls=' dim';
          }
          h+='<button type="button" class="rc-opt'+cls+'" data-i="'+i+'" data-j="'+j+'"'+
             (picked!=null?' disabled':'')+'>'+esc(o)+'</button>';
        });
        h+='</div>';
        if(picked!=null)h+='<div class="rc-why'+(picked===it.a?' good':'')+'">'+
          (picked===it.a?'✓ ':'✗ ')+esc(it.why)+'</div>';
        h+='</div>';
      });
      if(done())h+='<div class="rc-foot">That is the retrieval done. Now the new material.</div>';
      h+='</div>';
      host.innerHTML=h;

      Array.prototype.forEach.call(host.querySelectorAll('.rc-opt'),function(b){
        b.addEventListener('click',function(){
          var i=+b.getAttribute('data-i'), j=+b.getAttribute('data-j');
          if(state['q'+i]!=null)return;
          state['q'+i]=j;state.open=1;lset(KEY,JSON.stringify(state));
          if(done()){
            var right=cfg.items.filter(function(it,k){return state['q'+k]===it.a;}).length;
            record('rec_'+cfg.id,'Warm-up recall · '+cfg.prev,
                   right+' of '+cfg.items.length+' correct from memory');
            state.open=0;lset(KEY,JSON.stringify(state));
          }
          paint();
        });
      });
    }
    paint();
  }

  /* =================================================================
     DIAGNOSE THE ARTEFACT
     A plausible piece of work with planted faults. The student clicks
     the lines they think are wrong; every line explains itself once
     revealed — including the correct ones, which is where most of the
     learning is.
     ================================================================= */
  function spot(cfg){
    var host=document.getElementById(cfg.slot||'spotSlot');
    if(!host||!cfg.lines)return;
    injectCSS();
    var KEY='e1410_ex_spot_'+cfg.id;
    var picked={},revealed=false;
    try{
      var st=JSON.parse(lget(KEY)||'{}');
      picked=st.picked||{};revealed=!!st.revealed;
    }catch(e){}

    var faults=cfg.lines.filter(function(l){return l.fault;}).length;

    function save(){lset(KEY,JSON.stringify({picked:picked,revealed:revealed}));}
    function nPicked(){var n=0;for(var k in picked){if(picked[k])n++;}return n;}

    function paint(){
      var found=0,wrong=0;
      cfg.lines.forEach(function(l,i){
        if(picked[i]){ if(l.fault)found++; else wrong++; }
      });

      var h='<div class="sp"><div class="sp-head">'+
        '<span class="sp-kick">Diagnose · '+faults+' faults planted</span>'+
        '<h3>'+esc(cfg.title)+'</h3><p class="sp-sub">'+cfg.lede+'</p></div>'+
        '<div class="sp-doc'+(revealed?' revealed':'')+'"><div class="sp-doct">'+esc(cfg.docTitle||'')+'</div>';

      cfg.lines.forEach(function(l,i){
        var cls='sp-line';
        if(l.head)cls+=' head';
        if(picked[i])cls+=' picked';
        if(revealed){
          if(l.fault)cls+=' isfault';
          if(picked[i]&&!l.fault)cls+=' isfalse';
        }
        h+='<button type="button" class="'+cls+'" data-i="'+i+'"'+(revealed?' disabled':'')+
           ' style="padding-left:'+(14+(l.indent||0)*18)+'px">'+
           '<span class="sp-t">'+esc(l.t)+'</span>'+
           (revealed&&l.fault?'<span class="sp-flag">fault</span>':'')+
           (revealed&&picked[i]&&!l.fault?'<span class="sp-flag ok">fine</span>':'')+
           '</button>';
        if(revealed&&(l.fault||picked[i]))
          h+='<div class="sp-why'+(l.fault?'':' fine')+'">'+l.why+'</div>';
      });
      h+='</div>';

      if(!revealed){
        h+='<div class="sp-bar"><span class="sp-count"><b>'+nPicked()+'</b> selected · '+
           faults+' to find</span><button type="button" class="sp-check">Check my answers</button></div>';
      }else{
        var verdict = found===faults&&!wrong ? 'All '+faults+'. Clean sweep.'
                    : found===faults ? 'Found all '+faults+' — and flagged '+wrong+' line'+(wrong>1?'s':'')+' that were actually fine.'
                    : 'Found '+found+' of '+faults+(wrong?', and flagged '+wrong+' that were fine.':'.');
        h+='<div class="sp-bar done"><span class="sp-count"><b>'+verdict+'</b></span>'+
           '<button type="button" class="sp-again">Try again</button></div>';
        if(cfg.after)h+='<div class="sp-after">'+cfg.after+'</div>';
      }
      h+='</div>';
      host.innerHTML=h;

      Array.prototype.forEach.call(host.querySelectorAll('.sp-line'),function(b){
        b.addEventListener('click',function(){
          var i=+b.getAttribute('data-i');
          picked[i]=!picked[i];save();paint();
        });
      });
      var chk=host.querySelector('.sp-check');
      if(chk)chk.addEventListener('click',function(){
        revealed=true;save();
        var f=0,w=0;
        cfg.lines.forEach(function(l,i){ if(picked[i]){ if(l.fault)f++; else w++; } });
        record('spot_'+cfg.id, cfg.recordLabel||('Diagnose · '+cfg.title),
               'Found '+f+' of '+faults+' planted faults'+(w?', '+w+' false positive'+(w>1?'s':''):'')+'.');
        paint();
        /* optional hook — the primer pages use it to tick a TASKS item.
           Session pages pass nothing, so their progress is untouched. */
        if(typeof cfg.onCheck==='function')cfg.onCheck(f,faults,w);
      });
      var again=host.querySelector('.sp-again');
      if(again){
        again.addEventListener('click',function(){ picked={};revealed=false;save();paint(); });
        /* already checked on a previous visit — the hook still has to fire,
           or a returning student's task would silently un-tick */
        if(typeof cfg.onCheck==='function'&&!cfg._fired){
          cfg._fired=true;cfg.onCheck(found,faults,wrong);
        }
      }
    }
    paint();
  }

  return { recall:recall, spot:spot };
})();
