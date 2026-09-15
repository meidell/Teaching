/* =====================================================================
   HEG · Quantitative Methods I — remembering what a student actually chose.
   Port of ideas-e1410/answers.js (read that file's header for the full
   reasoning). Picks live in progress.picks, a key INSIDE the same
   localStorage blob the week page already writes, so nothing that counts
   (progress.steps, totalSteps) moves. First attempt wins: a replayed
   answer never re-sends to the database.

     QMAns.get(p,id)          the pick for a single-choice item
     QMAns.set(p,save,id,v)   record it
     QMAns.push(p,save,id,v)  a classify attempt (wrong ones included)
     QMAns.cls(mod,group,pl)  one summary per classify group →
                                 qm1/<sid>/mod/<mod>/cls/<group>
   ===================================================================== */
window.QMAns=(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  function bag(p){if(!p.picks)p.picks={};return p.picks;}
  function get(p,id){return bag(p)[id];}
  function set(p,save,id,v){bag(p)[id]=v;try{save();}catch(e){}}
  function push(p,save,id,v){var b=bag(p);if(!b[id]||typeof b[id].push!=='function')b[id]=[];b[id].push(v);try{save();}catch(e){}return b[id];}
  function auth(){var a=null;try{a=JSON.parse(localStorage.getItem('qm1_auth')||'null');}catch(e){}return (a&&a.sid)?a:null;}
  function cls(mod,group,payload){
    var a=auth();if(!a||!mod||!group)return;
    payload.ts=Date.now();
    try{fetch(DB+'/qm1/'+a.sid+'/mod/'+encodeURIComponent(mod)+'/cls/'+encodeURIComponent(group)+'.json',
      {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){});}catch(e){}
  }
  return {get:get,set:set,push:push,cls:cls,auth:auth};
})();
