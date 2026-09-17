/* =====================================================================
   GBS · Creator Economy — THE WALL.  The class's shared dataset.

   A session where fifteen people each measure one cell of a grid is only
   a session if they can all see the grid fill up. Everything else in this
   repo is private-to-the-student (progress, workbook answers) or
   instructor-only (the dashboard), so this course needs one more thing: a
   small node every student can READ and APPEND to.

     <ns>/_wall/<mod>/<pushId> = { n, src, meta, ts }

   ⚠ WHY PUSH IDS AND NOT SIDS. Keying by sid would make the node a list
   of the cohort's sids, and a sid is exactly what makes <ns>/<sid>
   guessable — the reason firebase-database-rules.json keeps
   `_presence` itself unreadable. So a row is keyed by an opaque push id
   and carries a FIRST NAME only. The wall therefore hands out no more
   than the room already knows by looking around it.

   ⚠ A ROW IS A CAPABILITY, NOT A LOGIN. Whoever holds a row's push id can
   overwrite it, which is how a student corrects their own row (the id is
   kept in localStorage). Since the node is world-readable those ids are
   discoverable, so the wall is TAMPERABLE BY DESIGN — acceptable for a
   dataset fifteen people build in front of a projector, and not a place
   for anything that matters. Marks, scores and workbook answers go
   through /shared/progress.js to the student's own node, never here.

   ⚠ IT MUST SURVIVE UNDEPLOYED RULES. A namespace with no rules block is
   shut to everyone, and `_wall` needs its own block inside one. Every
   call therefore resolves to {ok:false, reason} instead of throwing, and
   the page falls back to the student's own row plus a line telling the
   room the instructor will project it. Presence learned this the hard
   way; do not "simplify" the error handling away.
   ===================================================================== */
window.CreatorWall=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="creator", K="creator";

  function keyOf(mod){return K+'_wallrow_'+mod;}
  function myRow(mod){try{return localStorage.getItem(keyOf(mod))||null;}catch(e){return null;}}
  function remember(mod,id){try{localStorage.setItem(keyOf(mod),id);}catch(e){}}

  /* Cache the row locally too, so the page can always show a student their
     own answer even when the node cannot be read at all. */
  function cacheOf(mod){return K+'_wallmine_'+mod;}
  function mine(mod){try{return JSON.parse(localStorage.getItem(cacheOf(mod))||'null');}catch(e){return null;}}
  function cache(mod,row){try{localStorage.setItem(cacheOf(mod),JSON.stringify(row));}catch(e){}}

  /* a source as typed → a comparable domain. "https://www.reddit.com/r/x"
     and "Reddit.com" are the same row on the wall or the tally is noise. */
  function domain(s){
    s=String(s||'').trim().toLowerCase();
    if(!s)return '';
    s=s.replace(/^https?:\/\//,'').replace(/^www\./,'');
    s=s.split(/[\/?#]/)[0];
    return s.replace(/[.,;]+$/,'');
  }
  function domains(list){
    var out=[],seen={};
    (list||[]).forEach(function(raw){
      var d=domain(raw);
      if(d&&!seen[d]){seen[d]=1;out.push(d);}   /* one vote per student per domain */
    });
    return out;
  }

  /* ---- write ----
     First call POSTs and keeps the returned push id; later calls PUT over
     the same row, so a student who fixes a typo does not appear twice. */
  function post(mod,row){
    row.ts=Date.now();
    var id=myRow(mod);
    var url=DB+'/'+NS+'/_wall/'+encodeURIComponent(mod)+(id?('/'+id):'')+'.json';
    return fetch(url,{method:id?'PUT':'POST',body:JSON.stringify(row)})
      .then(function(r){
        if(!r.ok)return {ok:false,reason:r.status===401?'rules':'http-'+r.status};
        return r.json().then(function(j){
          if(!id&&j&&j.name)remember(mod,j.name);
          cache(mod,row);
          return {ok:true};
        });
      })
      .catch(function(){cache(mod,row);return {ok:false,reason:'offline'};});
  }

  /* ---- read ---- */
  function read(mod){
    return fetch(DB+'/'+NS+'/_wall/'+encodeURIComponent(mod)+'.json')
      .then(function(r){
        if(!r.ok)return {ok:false,reason:r.status===401?'rules':'http-'+r.status,rows:[]};
        return r.json().then(function(o){
          var rows=[];
          for(var k in o){if(o[k])rows.push(o[k]);}
          rows.sort(function(a,b){return (a.ts||0)-(b.ts||0);});
          return {ok:true,rows:rows};
        });
      })
      .catch(function(){return {ok:false,reason:'offline',rows:[]};});
  }

  /* ---- tally ----
     How many of the fifteen saw this domain cited at all. Deliberately a
     count of STUDENTS, not of mentions: a source quoted five times in one
     answer is still one observation of one engine on one phrasing. */
  function tally(rows){
    var c={},n=0;
    (rows||[]).forEach(function(r){
      var ds=domains((r.src||'').split(/[\n,;]+/));
      if(!ds.length)return;
      n++;
      ds.forEach(function(d){c[d]=(c[d]||0)+1;});
    });
    var out=[];for(var d in c)out.push({dom:d,n:c[d]});
    out.sort(function(a,b){return b.n-a.n||a.dom.localeCompare(b.dom);});
    return {rows:n,items:out};
  }

  return {post:post,read:read,tally:tally,domain:domain,domains:domains,
          mine:mine,myRowId:myRow};
})();
