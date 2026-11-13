/* =====================================================================
   GBS · Enterprise Security — "Cyber risk in numbers": the PAIR QUIZ on the word cards.
   13 Nov 2026, from Jan Erik's memo "turn the vocabulary section into a pair quiz", plus:
   "so that it allows logged-on users to connect and to ask each other".

   The cards in data.js (DATA.vocab) stay the source of truth; nothing here changes them.
   A pair (two students, one phone) plays against another pair (one phone). The two phones
   connect through the course wall, which every device may read and append to:

     _wall/vqlobby/<push>   { n: pair label, src: 'O:<match>|<order s|x>|<seed>' }   an open match
                                                     src: 'T:<match>'                      it was taken
     _wall/vq_<match>/<push> the match log, replayed in push-id (= time) order:
        'H:<order>|<seed>'  the host pair (n = its label)       — first row
        'J'                 the guest pair joined (n = its label)
        'V:<step>'          the asking phone pressed Reveal
        'S:<step>|1|0'      the asking phone marked the answer right (1) or wrong (0)

   Everything else is DERIVED, identically on both phones, from the seed: the card order
   (by section, or shuffled), which of the three prompts each card gets, and who asks
   (host asks the first card, then the pairs alternate). A wrong answer sends the card to
   the "missed" pile, which is played once more at the end of the round.

   Like every wall, it is tamperable (a row is not a login); this is a practice game and
   no score is recorded anywhere but on the two screens. A student must be signed in
   (escwa_auth) so the pair has a name; the instructor's device may play too.
   ===================================================================== */
(function(){
  var D=window.DATA; if(!D||!D.vocab)return;
  var WALL='https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app/escwa/_wall/';
  var CUR='escwa_vq_cur', PART='escwa_vq_partner';
  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function plain(s){return String(s||'').replace(/\*\*/g,'');}
  function rich(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');}
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}}

  /* ---------- the cards, in section order ---------- */
  var CARDS=[];
  D.vocab.forEach(function(g,gi){g.items.forEach(function(v){CARDS.push({g:gi,gname:String(g.group).replace(/^\d+\s*·\s*/,''),v:v});});});

  /* the term's own words, hidden in a prompt that asks for the term: each part of the term
     ("Patch · unpatched"), each acronym in it (OT, KEV, MFA), and each long distinctive word
     ("exploited", "controller"), with plural and -ed/-ing endings. Common words that only
     happen to be in a term name (attack, money, group…) stay, or "attackers" would vanish. */
  var STOP=/^(attack|attacks|money|group|state|third|party|chain|cyber|stolen|known|which|about|other|their|list|site|data|cost|sponsored|abuse|overlapping|categories|official)$/i;
  function termWords(t){
    var parts=String(t).replace(/\(([^)]*)\)/g,' · $1').split(/\s*·\s*/),w=[];
    parts.forEach(function(p){p=p.replace(/^the\s+/i,'').replace(/^"|"$/g,'').trim();if(p.length>2&&!STOP.test(p))w.push(p);
      p.split(/\s+/).forEach(function(x){x=x.replace(/[^A-Za-z0-9-]/g,'');if(/^[A-Z0-9]{2,}$/.test(x)||(x.length>=6&&!STOP.test(x)))w.push(x);});});
    return w.sort(function(a,b){return b.length-a.length;});
  }
  function redact(text,t){
    var s=plain(text);
    termWords(t).forEach(function(w){
      var q=w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      s=s.replace(new RegExp('\\b'+q+'(s|es|ed|d|ing)?\\b','gi'),'_____');
    });
    return s.replace(/_____(\s+_____)+/g,'_____');
  }

  /* ---------- seeded randomness, so both phones derive the same game ---------- */
  function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function order(kind,seed){
    var idx=CARDS.map(function(c,i){return i;});
    if(kind==='x'){var r=rng(seed);for(var i=idx.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=idx[i];idx[i]=idx[j];idx[j]=t;}}
    return idx;
  }
  function promptType(ci,seed,step){
    var c=CARDS[ci].v; if(!c.eg)return 0;          /* a card with no real case can only be asked by its definition */
    return Math.floor(rng(seed*31+step*7919+ci)()*3);
  }

  /* ---------- the wall ---------- */
  function getj(path){return fetch(WALL+path+'.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}
  function post(path,n,src){return fetch(WALL+path+'.json',{method:'POST',body:JSON.stringify({n:String(n).slice(0,40),src:String(src).slice(0,500),ts:Date.now()})}).then(function(r){return r.ok;}).catch(function(){return false;});}

  /* ---------- who is this phone ---------- */
  function me(){
    try{var a=JSON.parse(ls('escwa_auth')||'null');if(a&&a.name)return String(a.name).split(/\s+/)[0];}catch(e){}
    try{if(ls('jem_instructor')||JSON.parse(ls('jem_fb_session')||'null'))return 'Instructor';}catch(e){}
    return null;
  }
  function pairLabel(){var a=me(),b=(ls(PART)||'').trim().split(/\s+/)[0];return (a+(b?' & '+b:'')).slice(0,40);}

  /* ---------- replay a match log into a state ---------- */
  function replay(log){
    var rows=Object.keys(log||{}).sort().map(function(k){return log[k];}).filter(function(r){return r&&r.src;});
    var h=rows.filter(function(r){return /^H:/.test(r.src);})[0]; if(!h)return null;
    var m=/^H:([sx])\|(\d+)/.exec(h.src); var kind=m[1], seed=+m[2];
    var S={kind:kind,seed:seed,host:h.n,guest:null,queue:order(kind,seed).map(function(ci){return {ci:ci,retry:false};}),
           step:0,shown:false,score:[0,0],missed:0,firstPass:CARDS.length,done:false,last:null};
    rows.forEach(function(r){
      if(r.src==='J'){if(!S.guest)S.guest=r.n;return;}
      var v=/^V:(\d+)$/.exec(r.src); if(v&&+v[1]===S.step){S.shown=true;return;}
      var s=/^S:(\d+)\|([01])$/.exec(r.src);
      if(s&&+s[1]===S.step&&S.shown&&!S.done){
        var cur=S.queue[S.step], answering=S.step%2===0?1:0;      /* host (0) asks even steps, so guest (1) answers them */
        if(s[2]==='1')S.score[answering]++;
        else if(!cur.retry){S.queue.push({ci:cur.ci,retry:true});S.missed++;}
        S.last={ok:s[2]==='1',ci:cur.ci};
        S.step++;S.shown=false;if(S.step>=S.queue.length)S.done=true;
      }
    });
    return S;
  }

  /* ---------- the panel ---------- */
  var box, view='lobby', cur=null, state=null, timer=null, lobbyT=null, busy=false;
  function css(){
    var st=document.createElement('style');st.textContent=
'.vtabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 6px;}'+
'.vtabs button{font:800 14px inherit;font-family:inherit;border-radius:22px;padding:9px 18px;border:2px solid var(--acc);background:var(--card);color:var(--tx);cursor:pointer;}'+
'.vtabs button.on{background:var(--acc);color:#fff;}'+
'.vflow{margin:8px 0 4px 20px;font-size:14.5px;color:var(--tx2);line-height:1.55;}'+
'#vquiz{max-width:640px;}'+
'.vq{background:var(--card);border:1.5px solid var(--ln);border-radius:14px;padding:16px 16px 18px;margin:10px 0;}'+
'.vq h4{font-size:17px;color:var(--tx);margin:0 0 8px;}'+
'.vq p{font-size:15px;color:var(--tx2);line-height:1.55;margin:6px 0;}'+
'.vq label{display:block;font-size:13px;font-weight:800;color:var(--tx);margin:10px 0 4px;}'+
'.vq input[type=text]{width:100%;font:inherit;font-size:16px;padding:10px 12px;border:1.5px solid var(--ln);border-radius:10px;background:var(--card);color:var(--tx);}'+
'.vq .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}'+
'.vq button.b{font:800 15px inherit;font-family:inherit;border:none;border-radius:10px;padding:12px 16px;background:var(--acc);color:#fff;cursor:pointer;flex:1;min-width:140px;}'+
'.vq button.g{font:700 14px inherit;font-family:inherit;border:1.5px solid var(--ln);border-radius:10px;padding:11px 14px;background:var(--card);color:var(--tx);cursor:pointer;}'+
'.vq button.ok{background:#1b7f4b;} .vq button.no{background:#b3261e;}'+
'.vq .seg{display:flex;border:1.5px solid var(--ln);border-radius:10px;overflow:hidden;}'+
'.vq .seg button{flex:1;font:700 14px inherit;font-family:inherit;border:none;padding:10px;background:var(--card);color:var(--tx);cursor:pointer;}'+
'.vq .seg button.on{background:var(--acc);color:#fff;}'+
'.vq .open{display:flex;align-items:center;gap:10px;border-top:1px solid var(--ln);padding:10px 0;}'+
'.vq .open span{flex:1;font-size:15px;color:var(--tx);font-weight:700;}'+
'.vq .code{font-size:30px;font-weight:800;letter-spacing:4px;color:var(--tx);}'+
'.vscore{display:flex;gap:8px;margin-bottom:8px;}'+
'.vscore div{flex:1;background:var(--wash);border-radius:10px;padding:8px 10px;font-size:13px;color:var(--tx2);}'+
'.vscore div.me{outline:2px solid var(--acc);}'+
'.vscore b{display:block;font-size:24px;color:var(--tx);font-variant-numeric:tabular-nums;}'+
'.vrole{font-size:12px;letter-spacing:1.4px;text-transform:uppercase;font-weight:800;color:var(--acc);}'+
'.vprompt{font-size:19px;line-height:1.5;color:var(--tx);margin:8px 0 10px;}'+
'.vask{font-size:14px;font-weight:800;color:var(--tx);background:var(--wash);border-radius:8px;padding:8px 10px;}'+
'.vans{border-left:4px solid var(--acc);background:var(--wash);border-radius:8px;padding:10px 12px;margin-top:10px;}'+
'.vans h5{font-size:18px;color:var(--tx);margin:0 0 4px;}'+
'.vans p{font-size:14px;margin:4px 0;}'+
'.vmeta{font-size:12.5px;color:var(--mute);margin-top:8px;}'+
'.vlast{font-size:13.5px;margin:0 0 8px;color:var(--tx2);}';
    document.head.appendChild(st);
  }

  function stop(){clearInterval(timer);timer=null;clearInterval(lobbyT);lobbyT=null;}

  /* the lobby: name your pair, open a match or join one */
  function drawLobby(){
    stop();view='lobby';
    var who=me();
    if(!who){box.innerHTML='<div class="vq"><h4>Sign in first</h4><p>The quiz needs your name so the other pair knows who they are playing against. Press the sign-in button at the bottom right of the page, then come back to this tab.</p><div class="row"><button class="g" id="vqRetry">I have signed in</button></div></div>';
      $('vqRetry').onclick=drawLobby;return;}
    var kind=ls('escwa_vq_order')||'s';
    box.innerHTML=
'<div class="vq"><h4>1. Name your pair</h4><p>You play in pairs: two students, one phone. Sit facing the other pair; they use their own phone.</p>'+
 '<label for="vqMe">Your first name</label><input type="text" id="vqMe" value="'+esc(who)+'" disabled>'+
 '<label for="vqPart">Your partner\'s first name</label><input type="text" id="vqPart" maxlength="18" placeholder="For example: Sara" value="'+esc(ls(PART)||'')+'"></div>'+
'<div class="vq"><h4>2. Start a match, or join one</h4>'+
 '<p>One pair starts the match and chooses the order of the cards. The other pair finds it in the list below and presses Play.</p>'+
 '<div class="seg" id="vqOrd"><button data-o="s" class="'+(kind==='s'?'on':'')+'">Cards by section</button><button data-o="x" class="'+(kind==='x'?'on':'')+'">Shuffle all</button></div>'+
 '<div class="row"><button class="b" id="vqNew">Start a match</button></div>'+
 '<label>Matches waiting for a second pair</label><div id="vqOpen"><p>Looking…</p></div></div>';
    $('vqPart').oninput=function(){ls(PART,this.value.trim());};
    Array.prototype.forEach.call(document.querySelectorAll('#vqOrd button'),function(b){b.onclick=function(){ls('escwa_vq_order',b.dataset.o);Array.prototype.forEach.call(document.querySelectorAll('#vqOrd button'),function(x){x.classList.toggle('on',x===b);});};});
    $('vqNew').onclick=function(){
      if(busy)return;busy=true;
      var id=Math.random().toString(36).slice(2,8).toUpperCase(), seed=Math.floor(Math.random()*1e9), o=ls('escwa_vq_order')||'s', lab=pairLabel();
      post('vq_'+id,lab,'H:'+o+'|'+seed).then(function(ok){
        busy=false;
        if(!ok){alert('The match could not be saved. Check the internet connection and try again.');return;}
        post('vqlobby',lab,'O:'+id+'|'+o+'|'+seed);
        cur={id:id,role:0};ls(CUR,JSON.stringify(cur));drawMatch();
      });
    };
    var lobby=function(){if(document.hidden)return;getj('vqlobby').then(function(o){
      var el=$('vqOpen');if(!el)return;
      var rows=Object.keys(o||{}).sort().map(function(k){return o[k];}),taken={},open=[],now=Date.now();
      rows.forEach(function(r){var t=/^T:(\w+)/.exec(r.src||'');if(t)taken[t[1]]=1;});
      rows.forEach(function(r){var m=/^O:(\w+)\|/.exec(r.src||'');if(m&&!taken[m[1]]&&now-(r.ts||0)<3*3600e3&&!(cur&&cur.id===m[1]))open.push({id:m[1],n:r.n});});
      open.reverse();
      el.innerHTML=open.length?open.map(function(x){return '<div class="open"><span>'+esc(x.n)+'</span><button class="b" style="flex:0 0 auto;min-width:0" data-id="'+x.id+'">Play against them</button></div>';}).join(''):'<p>No pair is waiting yet. Start a match, or wait for another pair to start one.</p>';
      Array.prototype.forEach.call(el.querySelectorAll('button[data-id]'),function(b){b.onclick=function(){
        if(busy)return;busy=true;var id=b.dataset.id,lab=pairLabel();
        post('vq_'+id,lab,'J').then(function(ok){busy=false;if(!ok){alert('Could not join. Try again.');return;}
          post('vqlobby',lab,'T:'+id);cur={id:id,role:1};ls(CUR,JSON.stringify(cur));drawMatch();});
      };});
    });};
    lobby();lobbyT=setInterval(lobby,4000);
  }

  var LBL=['The definition. Name the term.','The real case. Name the term.','The term. Give the real case, or its year.'];
  function drawMatch(){
    stop();view='match';
    var sig=null;
    /* repaint only when the log changed: a repaint replaces the buttons, and a tap that lands during one is lost */
    var load=function(){if(document.hidden&&state)return;getj('vq_'+cur.id).then(function(log){var s=JSON.stringify(log||null);if(s===sig&&state)return;sig=s;state=replay(log);paint();});};
    load();timer=setInterval(load,2000);
    box.innerHTML='<div class="vq"><p>Connecting…</p></div>';
  }
  function act(src){
    if(busy)return;busy=true;
    post('vq_'+cur.id,pairLabel(),src).then(function(){return getj('vq_'+cur.id);}).then(function(log){busy=false;if(log){state=replay(log);paint();}});
  }
  function leave(){if(cur&&cur.role===0&&state&&!state.guest)post('vqlobby',pairLabel(),'T:'+cur.id);ls(CUR,null);cur=null;state=null;drawLobby();}

  function paint(){
    if(view!=='match')return;
    var S=state;
    if(!S){box.innerHTML='<div class="vq"><h4>This match cannot be found</h4><p>It may have been started on another day.</p><div class="row"><button class="g" id="vqLeave">Back to the list</button></div></div>';$('vqLeave').onclick=leave;return;}
    var mine=cur.role, names=[S.host,S.guest||'…'];
    var score='<div class="vscore"><div class="'+(mine===0?'me':'')+'">'+esc(names[0])+(mine===0?' (you)':'')+'<b>'+S.score[0]+'</b></div><div class="'+(mine===1?'me':'')+'">'+esc(names[1])+(mine===1?' (you)':'')+'<b>'+S.score[1]+'</b></div></div>';
    var foot='<div class="row"><button class="g" id="vqLeave">Leave the match</button></div>';
    if(!S.guest){
      box.innerHTML='<div class="vq"><h4>Waiting for a second pair</h4><p>Your match is in the list on the other pairs\' phones under the name <b>'+esc(S.host)+'</b>. Ask the pair facing you to open Quiz mode and press "Play against them" next to your names.</p><p class="vmeta">Cards: '+(S.kind==='x'?'shuffled':'by section')+' · '+CARDS.length+' cards in this round.</p>'+foot+'</div>';
      $('vqLeave').onclick=leave;return;
    }
    if(S.done){
      var w=S.score[0]===S.score[1]?'It is a draw.':esc(names[S.score[0]>S.score[1]?0:1])+' won the round.';
      box.innerHTML='<div class="vq">'+score+'<h4>The round is over. '+w+'</h4><p>For round two, play against another pair: press "Leave the match", then start a new match or join one from the list.</p>'+foot+'</div>';
      $('vqLeave').onclick=leave;return;
    }
    var q=S.queue[S.step], c=CARDS[q.ci], v=c.v, pt=promptType(q.ci,S.seed,S.step);
    var asker=S.step%2===0?0:1, iAsk=asker===mine;
    var prompt=pt===0?redact(v.what,v.t):pt===1?redact(v.eg,v.t):plain(v.t)+(v.also?' (also called: '+plain(v.also)+')':'');
    var n=S.step+1, total=S.queue.length;
    var answer='<div class="vans"><h5>'+esc(plain(v.t))+'</h5>'+(v.also?'<p><i>Also called: '+esc(v.also)+'</i></p>':'')+'<p>'+rich(v.what)+'</p>'+(v.eg?'<p><b>Real case:</b> '+rich(v.eg)+'</p>':'')+(v.where?'<p class="vmeta">In the game: '+esc(v.where)+'</p>':'')+'</div>';
    var last=S.last?'<p class="vlast">Last card: '+esc(plain(CARDS[S.last.ci].v.t))+' — '+(S.last.ok?'right ✓':'missed ✗, it comes back at the end of the round')+'</p>':'';
    var h=score+last+'<div class="vrole">Card '+n+' of '+total+(q.retry?' · from the missed pile':'')+' · '+esc(c.gname)+'</div>';
    if(iAsk){
      h+='<p class="vask">You ask. Read the prompt below aloud to '+esc(names[1-mine])+'. They answer aloud.</p>'+
         '<div class="vmeta">'+LBL[pt]+'</div><div class="vprompt">'+esc(prompt)+'</div>'+
         (S.shown?'':'<p class="vmeta">The answer, for your eyes only until you press Reveal:</p>')+answer+
         '<div class="row">'+(S.shown?'<button class="b ok" id="vqOk">They got it right</button><button class="b no" id="vqNo">They missed it</button>':'<button class="b" id="vqRev">Reveal the answer on both phones</button>')+'</div>';
    }else{
      h+='<p class="vask">'+esc(names[1-mine])+(/&/.test(names[1-mine])?' ask':' asks')+' you. Talk with your partner, then answer aloud.</p>'+
         '<div class="vmeta">'+LBL[pt]+'</div><div class="vprompt">'+esc(prompt)+'</div>'+
         (S.shown?answer+'<p class="vmeta">Waiting for '+esc(names[1-mine])+' to mark your answer right or wrong.</p>':'<p class="vmeta">The answer appears here when they press Reveal.</p>');
    }
    box.innerHTML='<div class="vq">'+h+foot+'</div>';
    $('vqLeave').onclick=function(){if(confirm('Leave this match? The other pair will be left waiting.'))leave();};
    if($('vqRev'))$('vqRev').onclick=function(){act('V:'+S.step);};
    if($('vqOk'))$('vqOk').onclick=function(){act('S:'+S.step+'|1');};
    if($('vqNo'))$('vqNo').onclick=function(){act('S:'+S.step+'|0');};
  }

  /* ---------- mount: two tabs over the word section ---------- */
  function mount(){
    var voc=$('vocab'); if(!voc)return;
    css();
    var tabs=document.createElement('div');tabs.className='vtabs';
    tabs.innerHTML='<button type="button" id="vtRead" class="on">Read the cards</button><button type="button" id="vtQuiz">Quiz mode · pairs</button>';
    voc.parentNode.insertBefore(tabs,voc);
    box=document.createElement('div');box.id='vquiz';box.hidden=true;voc.parentNode.insertBefore(box,voc.nextSibling);
    function show(q){$('vtRead').classList.toggle('on',!q);$('vtQuiz').classList.toggle('on',q);voc.hidden=q;box.hidden=!q;ls('escwa_vq_tab',q?'q':'r');
      if(q){try{cur=JSON.parse(ls(CUR)||'null');}catch(e){cur=null;} if(cur)drawMatch();else drawLobby();}else stop();}
    $('vtRead').onclick=function(){show(false);};
    $('vtQuiz').onclick=function(){show(true);};
    if(ls('escwa_vq_tab')==='q')show(true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
