/* =====================================================================
   SWISS UMEF · MFB 545 Fintech — the project TEAMS (23 Oct 2026).

   Jan Erik: "make it possible to select team members on the site, then
   show the teams and their members on the course landing page — and also
   allow them to share a group chat (messages)".

   Three teams (the syllabus: nine students, three teams of three; up to
   four seats each, so nobody is left out). A student joins, moves or
   leaves; any member renames the team. Stored in

     mfb545/_teams/<t1|t2|t3>/name                  the team's name (≤ 40)
     mfb545/_teams/<t>/members/<sid> = {n, ts}      who is in it

   — world-readable, names only, the same shape as capstone-ba's `_teams`
   (its rules block, cut down to name + members, in
   firebase-database-rules.json; ⚠ it must be DEPLOYED, or every join is
   refused, which the board says).

   THE TEAM CHAT is a student-group thread of the shared message panel
   (/shared/chat.js): `sg-team-<t>`. Joining writes the thread into the
   student's own index (<sid>/chats/sg-team-<t>, the door chat.js reads)
   and creates the thread's meta if nobody has yet; leaving or moving
   marks the old one `off`. Like every `sg-` thread it is between the
   students: the instructor's inbox does not list it (CLAUDE.md, Messages).

   The instructor's hidden student (`_jem`, student view) never joins.

     MfbTeams.mount(el)            the board (join · move · leave · rename)
     MfbTeams.mine()               {id, label, members:[names]} or null
     MfbTeams.onChange(fn)         after every refresh
   ===================================================================== */
window.MfbTeams=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app", NS="mfb545", K="mfb545";
  var IDS=['t1','t2','t3'], CAP=4, MAXNAME=40, POLL=10000;
  var T=window.T||function(fr){return fr;};
  var data={}, ok=true, loaded=false, el=null, hooks=[], busy=0, started=false;

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function me(){var a=null;try{a=JSON.parse(localStorage.getItem(K+'_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  function hiddenMe(){var a=me();return !!(a&&String(a.sid).charAt(0)==='_');}
  function num(id){return id.slice(1);}
  function label(id){var n=(data[id]&&data[id].name)||'';return T('Équipe ','Team ')+num(id)+(n?' · '+n:'');}
  function members(id){var m=(data[id]&&data[id].members)||{};return Object.keys(m).map(function(s){return {sid:s,n:(m[s]&&m[s].n)||s,ts:(m[s]&&m[s].ts)||0};}).filter(function(x){return x.sid.charAt(0)!=='_';}).sort(function(a,b){return a.ts-b.ts;});}
  function myTeam(){var a=me();if(!a)return '';for(var i=0;i<IDS.length;i++){var m=(data[IDS[i]]&&data[IDS[i]].members)||{};if(m[a.sid])return IDS[i];}return '';}
  function req(path,method,body){
    return fetch(DB+'/'+NS+'/'+path+'.json',{method:method,body:body==null?undefined:JSON.stringify(body)}).then(function(r){
      if(!r.ok)throw new Error(r.status===401?'rules':'http-'+r.status);return r;});
  }
  function load(){
    return fetch(DB+'/'+NS+'/_teams.json').then(function(r){if(!r.ok)throw new Error('read');return r.json();})
      .then(function(o){if(!busy)data=o||{};ok=true;},function(){ok=false;})
      .then(function(){loaded=true;render();hooks.forEach(function(f){try{f(mine());}catch(e){}});});
  }
  function mine(){var t=myTeam();return t?{id:t,label:label(t),name:(data[t]&&data[t].name)||'',members:members(t).map(function(x){return x.n;})}:null;}

  /* ---- the team chat: an sg- thread in the shared message panel ---- */
  function chatId(t){return 'sg-team-'+t;}
  function chatOn(t){
    var a=me(),now=Date.now();if(!a)return Promise.resolve();
    var title=label(t);
    /* meta is create-once for sg- threads: the first member to join creates it, the others are refused, which is fine */
    fetch(DB+'/'+NS+'/_chat/'+chatId(t)+'/meta.json',{method:'PUT',body:JSON.stringify({kind:'group',title:T('Équipe ','Team ')+num(t),by:'s',ts:now})}).catch(function(){});
    return req(a.sid+'/chats/'+chatId(t),'PUT',{t:title,k:'group',ts:now}).catch(function(){});
  }
  function chatOff(t){
    var a=me();if(!a||!t)return Promise.resolve();
    return req(a.sid+'/chats/'+chatId(t),'PUT',{t:label(t),k:'group',off:true,ts:Date.now()}).catch(function(){});
  }
  function chatRefresh(){try{if(window.CourseChat&&CourseChat.rediscover)CourseChat.rediscover();}catch(e){}}

  /* ---- actions ---- */
  function fail(e){
    var m=el&&el.querySelector('.tm-err');
    if(m)m.textContent=(e&&e.message==='rules')
      ?T('⚠ Le serveur a refusé (les règles des équipes ne sont pas encore publiées). Prévenez l’enseignant.','⚠ The server refused (the team rules are not published yet). Tell the instructor.')
      :T('⚠ Pas enregistré — vérifiez la connexion et réessayez.','⚠ Not saved — check the connection and try again.');
  }
  function join(t){
    var a=me();
    if(!a){alert(T('Connectez-vous d’abord (le bouton en bas à droite) : c’est votre nom que l’équipe voit.','Sign in first (the button at the bottom right): your name is what the team sees.'));return;}
    if(hiddenMe())return;
    var old=myTeam();
    if(old===t)return;
    if(members(t).length>=CAP){alert(T('Cette équipe est complète.','This team is full.'));return;}
    busy++;
    if(old){delete data[old].members[a.sid];}
    data[t]=data[t]||{};data[t].members=data[t].members||{};data[t].members[a.sid]={n:a.name,ts:Date.now()};
    render();
    (old?req('_teams/'+old+'/members/'+a.sid,'DELETE'):Promise.resolve())
      .then(function(){return req('_teams/'+t+'/members/'+a.sid,'PUT',{n:String(a.name).slice(0,60),ts:Date.now()});})
      .then(function(){return old?chatOff(old):null;})
      .then(function(){return chatOn(t);})
      .then(function(){busy--;chatRefresh();load();},function(e){busy--;fail(e);load();});
  }
  function leave(){
    var a=me(),t=myTeam();if(!a||!t)return;
    if(!confirm(T('Quitter l’'+label(t).toLowerCase()+' ?','Leave '+label(t)+'?')))return;
    busy++;delete data[t].members[a.sid];render();
    req('_teams/'+t+'/members/'+a.sid,'DELETE').then(function(){return chatOff(t);})
      .then(function(){busy--;chatRefresh();load();},function(e){busy--;fail(e);load();});
  }
  function rename(t,v){
    v=String(v||'').replace(/\s+/g,' ').trim().slice(0,MAXNAME);
    if(!v){alert(T('Écrivez un nom d’abord.','Type a name first.'));return;}
    busy++;data[t]=data[t]||{};data[t].name=v;render();
    req('_teams/'+t+'/name','PUT',v).then(function(){
      var a=me();return a?req(a.sid+'/chats/'+chatId(t),'PUT',{t:label(t),k:'group',ts:Date.now()}).catch(function(){}):null;
    }).then(function(){busy--;chatRefresh();load();},function(e){busy--;fail(e);load();});
  }

  /* ---- the board ---- */
  function css(){
    if(document.getElementById('mt-css'))return;
    var s=document.createElement('style');s.id='mt-css';
    s.textContent='.mteams .tm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;}'+
      '.mteams .tm{background:var(--card,#fff);border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:7px;}'+
      '.mteams .tm.mine{border-color:var(--accent);box-shadow:0 0 0 3px rgba(23,107,135,.12);}'+
      '.mteams .tm-id{font-size:10.5px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:var(--grey);}'+
      '.mteams .tm-n{font-weight:800;color:var(--navy,var(--ink));font-size:15.5px;line-height:1.25;word-break:break-word;}'+
      '.mteams .tm-n i{font-weight:400;color:var(--grey);font-size:13px;}'+
      '.mteams .tm-m{list-style:none;margin:0;padding:0;font-size:13.5px;color:var(--ink);line-height:1.65;flex:1;}'+
      '.mteams .tm-m li::before{content:"👤 ";} .mteams .tm-m li.me{font-weight:800;} .mteams .tm-m li.none{color:var(--grey);font-style:italic;} .mteams .tm-m li.none::before{content:"";}'+
      '.mteams .tm-seats{font-size:11.5px;color:var(--grey);}'+
      '.mteams .tm-r{display:flex;gap:6px;} .mteams .tm-in{flex:1;min-width:0;font:inherit;font-size:13px;border:1.5px solid var(--line);border-radius:8px;padding:6px 8px;background:var(--card,#fff);color:var(--ink);}'+
      '.mteams .tm-b{font:inherit;font-size:12.5px;font-weight:800;border:none;border-radius:20px;padding:8px 12px;background:var(--accent);color:#fff;cursor:pointer;}'+
      '.mteams .tm-b.ghost{background:transparent;color:var(--accent-deep,var(--accent));border:1.5px solid var(--accent);}'+
      '.mteams .tm-b:disabled{opacity:.45;cursor:default;}'+
      '.mteams .tm-l{font:inherit;font-size:12px;background:none;border:none;color:var(--grey);text-decoration:underline;cursor:pointer;align-self:flex-start;padding:0;}'+
      '.mteams .tm-f{font-size:12.5px;color:var(--grey);margin-top:9px;line-height:1.5;} .mteams .tm-err{color:#9B2335;font-weight:700;}';
    document.head.appendChild(s);
  }
  function render(){
    if(!el)return;
    var ae=document.activeElement;if(ae&&ae.classList&&ae.classList.contains('tm-in')&&el.contains(ae))return;
    var a=me(),t=myTeam(),inst=!!(window.AdminGate&&AdminGate.isUnlocked&&AdminGate.isUnlocked());
    el.innerHTML='<div class="tm-grid">'+IDS.map(function(id){
      var ms=members(id),mine=id===t,full=ms.length>=CAP,nm=data[id]&&data[id].name;
      return '<div class="tm'+(mine?' mine':'')+'">'+
        '<div class="tm-id">'+T('Équipe ','Team ')+num(id)+'</div>'+
        '<div class="tm-n">'+(nm?esc(nm):'<i>'+T('pas encore de nom','no name yet')+'</i>')+'</div>'+
        '<ul class="tm-m">'+(ms.length?ms.map(function(x){return '<li'+(a&&x.sid===a.sid?' class="me"':'')+'>'+esc(x.n)+'</li>';}).join(''):'<li class="none">'+T('personne encore','nobody yet')+'</li>')+'</ul>'+
        '<div class="tm-seats">'+ms.length+' / 3'+(ms.length>3?' (+1)':'')+'</div>'+
        (inst||!a||hiddenMe()?'':(mine
          ?'<div class="tm-r"><input class="tm-in" data-t="'+id+'" maxlength="'+MAXNAME+'" placeholder="'+T('Nommer l’équipe','Name the team')+'" value="'+esc(nm||'')+'"><button class="tm-b" data-a="name" data-t="'+id+'">OK</button></div>'+
           '<button class="tm-b ghost" data-a="chat">💬 '+T('Messages de l’équipe','Team messages')+'</button>'+
           '<button class="tm-l" data-a="leave">'+T('Quitter cette équipe','Leave this team')+'</button>'
          :'<button class="tm-b" data-a="join" data-t="'+id+'"'+(full?' disabled':'')+'>'+(full?T('Complète','Full'):(t?T('Passer dans cette équipe','Move to this team'):T('Rejoindre','Join')))+'</button>'))+
      '</div>';}).join('')+'</div>'+
      '<div class="tm-f">'+
        (inst?T('Vue enseignant : les équipes telles que la classe les voit. Leurs messages d’équipe sont entre étudiants et n’apparaissent pas dans votre boîte.','Instructor view: the teams as the class sees them. Their team messages are between students and do not appear in your inbox.')
         :(!a?T('<b>Connectez-vous</b> (le bouton en bas à droite) pour rejoindre une équipe.','<b>Sign in</b> (the button at the bottom right) to join a team.')
         :T('Trois équipes de trois. Rejoignez la vôtre, donnez-lui un nom ; chaque équipe a son fil de messages (💬 en bas à droite), entre vous seulement.','Three teams of three. Join yours and give it a name; each team has its own message thread (💬 bottom right), just between you.')))+
        (loaded&&!ok?' '+T('⚠ Les équipes ne peuvent pas être lues pour l’instant.','⚠ The teams cannot be read right now.'):'')+
      ' <span class="tm-err"></span></div>';
  }
  function bind(){
    el.addEventListener('click',function(e){
      var b=e.target.closest('button[data-a]');if(!b)return;
      var x=b.getAttribute('data-a'),id=b.getAttribute('data-t');
      if(x==='join')join(id);
      else if(x==='leave')leave();
      else if(x==='name'){var i=el.querySelector('.tm-in[data-t="'+id+'"]');rename(id,i&&i.value);if(i)i.blur();}
      else if(x==='chat'){try{if(window.CourseChat){CourseChat.rediscover();setTimeout(function(){CourseChat.open();},600);}}catch(err){}}
    });
    el.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.classList.contains('tm-in')){e.preventDefault();rename(e.target.getAttribute('data-t'),e.target.value);e.target.blur();}});
  }
  function start(){if(started)return;started=true;load();setInterval(function(){if(!document.hidden)load();},POLL);}
  function mount(node){el=node;if(el){css();el.classList.add('mteams');render();bind();}start();}
  return {mount:mount,mine:mine,onChange:function(f){hooks.push(f);start();},refresh:load,label:label};
})();
