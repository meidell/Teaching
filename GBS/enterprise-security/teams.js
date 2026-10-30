/* =====================================================================
   GBS · Enterprise Security — THE TEAMS (30 Oct 2026), a port of
   GBS/business-intelligence/teams.js with the namespace changed and five
   teams A–E (the letters every session page already uses). Students join
   a team themselves, any member renames it, anybody may add or remove
   anybody (the newest row per name wins). Built on the wall (wall.js,
   EscWall), so it needs NO rules change — `_wall/$mod` already allows it:
     _wall/teams/<row>   = {n:'Full Name', src:'J:B', ts}   a student's team ('J:' = none)
     _wall/tn_<T>/<row>  = {n:'First', src:'N:<name>', ts}  team-name proposals, newest wins
   Shared team fields (EscTeams.field / state / share) work as in BI.
   Mounted on the hub (#teamsBox), on Session 3 step 5, and by the
   Jeopardy pages (jeopardy.html reads the labels, jeopardy-team.html
   lets a student join). Tamperable by design, like every wall.
   ===================================================================== */
window.EscTeams=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app",NS="escwa";
  var IDS=['A','B','C','D','E'],K='escwa',MAXNAME=30,MAXV=500,POLL=8000;
  var pending=0,st={members:{},names:{},ok:true,loaded:false},hooks=[],el=null,opts={},started=false;
  var wallRaw=null,shared={},binds=[],applying=false;
  /* the board's styles travel with it, so the hub (which does not load bi.css) draws it too */
  (function css(){if(document.getElementById('tm-css'))return;var s=document.createElement('style');s.id='tm-css';s.textContent='.teams .tm-x{border:none;background:none;color:#9B2335;font:800 13px inherit;cursor:pointer;padding:0 4px;margin-left:4px;line-height:1;}.teams .tm-x:hover{color:#fff;background:#9B2335;border-radius:4px;}.teams .tm-add{width:100%;margin-top:6px;font:inherit;font-size:12px;padding:5px 6px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--navy);}.teams .tm-m li{display:flex;justify-content:space-between;align-items:center;gap:4px;}.teams .tm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:9px;}.teams .tm{background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:11px 12px;display:flex;flex-direction:column;gap:7px;}.teams .tm.mine{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-pale,rgba(0,0,0,.05));}.teams .tm-h{display:flex;flex-direction:column;gap:1px;}.teams .tm-id{font-size:10.5px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:var(--grey);}.teams .tm-n{font-weight:800;color:var(--navy);font-size:15px;line-height:1.25;word-break:break-word;}.teams .tm-n i{font-weight:400;color:var(--grey);font-size:13px;}.teams .tm-m{list-style:none;margin:0;padding:0;font-size:13px;color:var(--ink);line-height:1.6;flex:1;}.teams .tm-m li.me{font-weight:800;} .teams .tm-m li.none{color:var(--grey);font-style:italic;}.teams .tm-r{display:flex;gap:6px;}.teams .tm-in{flex:1;min-width:0;font:inherit;font-size:13px;border:1.5px solid var(--line);border-radius:8px;padding:6px 8px;}.teams .tm-b{font:inherit;font-size:12.5px;font-weight:800;border:none;border-radius:8px;padding:7px 10px;background:var(--navy);color:#fff;cursor:pointer;}.teams .tm-b.join{background:var(--accent);}.teams .tm-l{font:inherit;font-size:12px;background:none;border:none;color:var(--grey);text-decoration:underline;cursor:pointer;align-self:flex-start;padding:0;}.teams .tm-f{font-size:12px;color:var(--grey);margin-top:8px;} .teams .tm-err{color:#9B2335;font-weight:700;}.tm-shared{display:inline-block;margin-left:8px;font-size:10.5px;font-weight:800;letter-spacing:.4px;color:var(--accent-deep);background:var(--accent-pale,rgba(0,0,0,.05));border-radius:20px;padding:1px 8px;vertical-align:1px;}';document.head.appendChild(s);})();
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function auth(){try{var a=JSON.parse(localStorage.getItem(K+'_auth')||'null');return (a&&a.name)?a:null;}catch(e){return null;}}
  function myName(){var a=auth();return a?String(a.name).trim().slice(0,40):'';}
  function first(){return (myName().split(' ')[0]||'someone').slice(0,40);}
  function myTeam(){try{return localStorage.getItem(K+'_team')||'';}catch(e){return '';}}
  function setMyTeam(t){try{if(t)localStorage.setItem(K+'_team',t);else localStorage.removeItem(K+'_team');}catch(e){}}
  /* the newest remote row this device has already looked at, per team and key. A remote value is
     applied only when that newest row CHANGES — never just because it differs from the field — so a
     local edit is not reverted by an older row, whatever the members' clocks say. */
  function seenKey(k){return K+'_ttseen_'+myTeam()+'_'+k;}
  function seen(k){try{return localStorage.getItem(seenKey(k))||'';}catch(e){return '';}}
  function setSeen(k,sig){try{localStorage.setItem(seenKey(k),sig);}catch(e){}}
  function sig(r){return (r.ts||0)+'|'+(r.by||'')+'|'+r.v.length;}
  function rowsOf(node){var out=[];if(node)for(var r in node){if(node[r])out.push(node[r]);}return out;}
  function newest(node){var b=null;rowsOf(node).forEach(function(r){if(!b||(r.ts||0)>=(b.ts||0))b=r;});return b;}

  function load(){
    return fetch(DB+'/'+NS+'/_wall.json').then(function(r){
      if(!r.ok)return {ok:false};return r.json().then(function(o){return {ok:true,o:o||{}};});
    }).catch(function(){return {ok:false};}).then(function(res){
      st.ok=res.ok;
      if(res.ok){
        var o=res.o,latest={},mem={},nm={};
        rowsOf(o.teams).forEach(function(r){var m=/^J:([A-E]?)$/.exec(r.src||'');if(m&&r.n&&(!latest[r.n]||(r.ts||0)>latest[r.n].ts))latest[r.n]={t:m[1],ts:r.ts||0};});
        IDS.forEach(function(id){mem[id]=[];var b=null;rowsOf(o['tn_'+id]).forEach(function(r){var m=/^N:(.*)$/.exec(r.src||'');if(m&&m[1].trim()&&(!b||(r.ts||0)>=b.ts))b={v:m[1].trim(),ts:r.ts||0};});if(b)nm[id]=b.v;});
        Object.keys(latest).sort().forEach(function(n){if(latest[n].t)mem[latest[n].t].push(n);});
        wallRaw=o;
        if(!pending){
          st.members=mem;st.names=nm;
          /* the server is the truth for this device's team, once it has answered */
          var me=myName();if(me){var t='';IDS.forEach(function(id){if(mem[id].indexOf(me)>=0)t=id;});if(t!==myTeam())setMyTeam(t);}
        }
      }
      st.loaded=true;
      readShared();render();notify();applyAll();
      hooks.forEach(function(f){try{f();}catch(e){}});
    });
  }
  function readShared(){
    shared={};var t=myTeam();if(!t||!wallRaw)return;
    var pre='tt_'+t+'_';
    for(var mod in wallRaw){if(mod.indexOf(pre)===0){var b=newest(wallRaw[mod]);if(b)shared[mod.slice(pre.length)]={v:String(b.src==null?'':b.src),ts:b.ts||0,by:b.n||''};}}
  }
  function notify(){
    if(!opts.onChange)return;
    var t=myTeam(),me=myName();
    opts.onChange(t,t?(st.members[t]||[]).filter(function(n){return n!==me;}):[]);
  }
  /* ---------- everybody may add or remove anybody (29 Oct 2026) ----------
     Jan Erik: "let all students the possibility to add or remove team
     members. easier". A change for SOMEONE ELSE is a new row in
     _wall/teams with their name (the newest row per name wins, and the
     moved student's own device adopts it on its next read — "the server is
     the truth"). Names to add come from the board itself and from the
     class directory _chat/_people (names only, world-readable). */
  var people=[];
  function loadPeople(){
    return fetch(DB+'/'+NS+'/_chat/_people.json').then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}).then(function(o){
      var set={};people.forEach(function(n){set[n]=1;});
      if(o)for(var k in o){if(k.charAt(0)==='_')continue;var n=o[k]&&o[k].n;if(n)set[String(n).trim().slice(0,40)]=1;}
      people=Object.keys(set).sort(function(a,b){return a.localeCompare(b);});render();
    });
  }
  function everyone(){var set={};people.forEach(function(n){set[n]=1;});IDS.forEach(function(id){(st.members[id]||[]).forEach(function(n){set[n]=1;});});var me=myName();if(me)set[me]=1;return Object.keys(set).sort(function(a,b){return a.localeCompare(b);});}
  function canEdit(){if(myName())return true;try{return !!localStorage.getItem('jem_fb_session');}catch(e){return false;}}
  function setFor(name,id){
    if(!name)return;
    if(name===myName()){join(id);return;}
    if(!canEdit()){alert('Sign in first (the button at the bottom right).');return;}
    IDS.forEach(function(x){st.members[x]=(st.members[x]||[]).filter(function(n){return n!==name;});});
    if(id){st.members[id].push(name);st.members[id].sort();}
    render();notify();
    pending++;
    fetch(DB+'/'+NS+'/_wall/teams.json',{method:'POST',body:JSON.stringify({n:String(name).slice(0,40),src:'J:'+(id||''),ts:Date.now()})})
      .then(function(r){pending--;if(!r.ok)fail({reason:r.status===401?'rules':'http'});load();})
      .catch(function(){pending--;fail({reason:'offline'});});
  }

  function label(id){return id?('Team '+id+(st.names[id]?' · '+st.names[id]:'')):'';}

  /* ---------- shared team answers ---------- */
  function share(key,v){
    var t=myTeam();if(!t||!myName())return;
    v=String(v==null?'':v).slice(0,MAXV);
    var now=Date.now();shared[key]={v:v,ts:now,by:first()};setSeen(key,'local|'+now);
    EscWall.post('tt_'+t+'_'+key,{n:first(),src:v}).then(function(r){if(!r.ok)fail(r);});
  }
  function applyAll(){
    if(!myTeam())return;
    binds.forEach(function(b){
      var r=shared[b.key];
      if(r){
        if(sig(r)===seen(b.key))return;             /* nothing new since this device last looked */
        if(b.busy&&b.busy())return;                 /* never under someone typing */
        setSeen(b.key,sig(r));
        if(b.get&&b.get()===r.v)return;
        applying=true;try{b.set(r.v,r.by);}catch(e){}applying=false;
      }else if(st.ok&&b.get){
        /* the team has nothing yet and this device has an answer from before teams were shared: offer it */
        var mine=b.get();if(mine&&!seen(b.key))share(b.key,mine);
      }
    });
  }
  function field(id,key){
    var e=document.getElementById(id);if(!e)return;
    if(e.tagName==='TEXTAREA'||e.type==='text')e.setAttribute('maxlength',MAXV);
    /* say so on the field: what you type here, your team-mates see */
    var lb=document.querySelector('label[for="'+id+'"]');
    if(lb&&!lb.querySelector('.tm-shared')){var sp=document.createElement('span');sp.className='tm-shared';sp.textContent='👥 team answer';sp.title='Shared with your team: what one member writes appears on every member’s page.';lb.appendChild(sp);}
    var tm=null;
    function flush(){if(tm===null)return;clearTimeout(tm);tm=null;share(key,e.value);}
    e.addEventListener('input',function(){if(applying)return;clearTimeout(tm);tm=setTimeout(flush,900);});
    e.addEventListener('blur',flush);
    binds.push({key:key,get:function(){return e.value;},busy:function(){return document.activeElement===e||tm!==null;},
      set:function(v){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}});
    if(started)applyAll();
  }
  function state(key,apply,busy){binds.push({key:key,set:apply,busy:busy});if(started)applyAll();}

  /* ---------- the board ---------- */
  function join(id,quiet){
    var me=myName();if(!me){if(!quiet)alert('Sign in first (the button at the bottom right), so your team-mates see your name.');return;}
    setMyTeam(id);
    IDS.forEach(function(x){st.members[x]=(st.members[x]||[]).filter(function(n){return n!==me;});});
    if(id){st.members[id].push(me);st.members[id].sort();}
    readShared();render();notify();applyAll();
    pending++;
    EscWall.post('teams',{n:me,src:'J:'+(id||'')}).then(function(r){pending--;if(!r.ok)fail(r);load();});
  }
  function rename(id,v){
    v=String(v||'').replace(/\s+/g,' ').trim().slice(0,MAXNAME);
    if(!v){alert('Type a name first.');return;}
    st.names[id]=v;render();hooks.forEach(function(f){try{f();}catch(e){}});
    pending++;
    EscWall.post('tn_'+id,{n:first(),src:'N:'+v}).then(function(r){pending--;if(!r.ok)fail(r);load();});
  }
  function fail(r){
    var m=el&&el.querySelector('.tm-err');
    if(m)m.textContent=r.reason==='rules'?'⚠ The server refused the change (rules). Tell the instructor.':'⚠ Not saved — check the connection and try again.';
  }
  function render(){
    if(!el)return;
    var t=myTeam(),me=myName(),ae=document.activeElement;
    if(ae&&ae.classList&&(ae.classList.contains('tm-in')||ae.classList.contains('tm-add'))&&el.contains(ae))return;   /* never repaint under someone typing a name or picking one */
    var all=everyone();el._all=all;
    el.innerHTML='<div class="tm-grid">'+IDS.map(function(id){
      var mine=id===t,ms=st.members[id]||[];
      return '<div class="tm'+(mine?' mine':'')+'">'+
        '<div class="tm-h"><span class="tm-id">Team '+id+'</span><span class="tm-n">'+(st.names[id]?esc(st.names[id]):'<i>no name yet</i>')+'</span></div>'+
        '<ul class="tm-m">'+(ms.length?ms.map(function(n){var i=all.indexOf(n);return '<li'+(n===me?' class="me"':'')+'><span>'+esc(n)+'</span>'+(opts.readOnly?'':'<button class="tm-x" data-a="rm" data-t="'+id+'" data-i="'+i+'" title="Remove '+esc(n)+' from Team '+id+'">×</button>')+'</li>';}).join(''):'<li class="none">nobody yet</li>')+'</ul>'+
        (opts.readOnly?'':'<select class="tm-add" data-t="'+id+'"><option value="">+ Add a member…</option>'+all.map(function(n,i){return ms.indexOf(n)>=0?'':'<option value="'+i+'">'+esc(n)+'</option>';}).join('')+'</select>')+
        (opts.readOnly?'':(mine
          ?'<div class="tm-r"><input class="tm-in" data-t="'+id+'" maxlength="'+MAXNAME+'" placeholder="Rename the team" value="'+esc(st.names[id]||'')+'"><button class="tm-b" data-a="name" data-t="'+id+'">Save</button></div>'+
           '<button class="tm-l" data-a="leave">Leave this team</button>'
          :'<button class="tm-b join" data-a="join" data-t="'+id+'">'+(t?'Move to Team '+id:'Join Team '+id)+'</button>'))+
      '</div>';}).join('')+'</div>'+
      '<div class="tm-f">'+(!me&&!opts.readOnly?'Sign in first (bottom right): your name is what your team-mates see. ':'')+
        (st.loaded?(st.ok?'Updates every few seconds.':'⚠ The team board cannot be read right now; your choice is kept on this device.'):'Loading the teams…')+
      ' <span class="tm-err"></span></div>';
  }
  function bind(){
    el.addEventListener('click',function(e){
      var b=e.target.closest('button[data-a]');if(!b)return;
      var a=b.getAttribute('data-a'),id=b.getAttribute('data-t');
      if(a==='join')join(id);
      else if(a==='leave'){if(confirm('Leave Team '+myTeam()+'?'))join('');}
      else if(a==='rm'){var n=(el._all||[])[+b.getAttribute('data-i')];if(n&&confirm('Remove '+n+' from Team '+id+'?'))setFor(n,'');}
      else if(a==='name'){var i=el.querySelector('.tm-in[data-t="'+id+'"]');rename(id,i&&i.value);if(i)i.blur();}
    });
    el.addEventListener('change',function(e){
      if(!e.target.classList.contains('tm-add'))return;
      var n=(el._all||[])[+e.target.value],id=e.target.getAttribute('data-t');e.target.blur();
      if(!n){return;}
      var from='';IDS.forEach(function(x){if((st.members[x]||[]).indexOf(n)>=0)from=x;});
      if(confirm('Put '+n+' in Team '+id+(from?' (moving them out of Team '+from+')':'')+'?'))setFor(n,id);else render();
    });
    el.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.classList.contains('tm-in')){e.preventDefault();var id=e.target.getAttribute('data-t');rename(id,e.target.value);e.target.blur();}});
  }
  function mount(node,o){
    el=node||null;opts=o||{};
    IDS.forEach(function(id){st.members[id]=[];});
    if(el){render();bind();}
    notify();
    if(el)loadPeople();
    if(!started){started=true;load();setInterval(function(){if(!document.hidden)load();},POLL);}
  }
  return {mount:mount,join:join,label:label,onLoad:function(f){hooks.push(f);},refresh:load,myTeam:myTeam,
          field:field,state:state,share:share,shared:function(k){return shared[k]||null;},members:function(id){return (st.members[id]||[]).slice();}};
})();
