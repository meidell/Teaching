/* =====================================================================
   E1410 · remembering what a student actually chose.

   Before this, three different things happened to a student's answers:

     workbook fields   saved locally AND to the database, restored on load
     quiz              the PICK went to the database (mod/<m>/quiz/q<i>),
                       but locally only a boolean "answered" — so a reload
                       showed a blank quiz and every unlocked explanation
                       was gone
     "try it" classify saved nowhere at all. A wrong pick disabled one
                       button and the attempt was discarded — which threw
                       away the most precise misconception signal on the page

   This adds the missing half for the last two, without touching anything
   that counts.

   ---------------------------------------------------------------------
   WHY THIS CANNOT MOVE ANYONE'S PROGRESS
   ---------------------------------------------------------------------
   Picks are stored in progress.picks — a NEW key inside the same
   localStorage blob the page already writes. progress.steps is untouched,
   so doneSteps() is unchanged; no DOM is added, so totalSteps()
   (1 + .cl-row + .q + [data-work]) is unchanged; SECTIONS is untouched.
   A student who answered before this shipped simply has no picks: nothing
   replays, their bar is identical, and their next answer starts recording.

   FIRST ATTEMPT WINS. A replayed answer never re-sends to the database.
   Previously a reload let a student answer again and overwrite their own
   record, so the dashboards showed the latest attempt; the first one is
   the honest number for teaching statistics.
   ===================================================================== */
window.E1410Ans = (function () {
  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";

  function bag(p){ if(!p.picks) p.picks={}; return p.picks; }

  /* single-choice (quiz): the option index */
  function get(p,id){ return bag(p)[id]; }
  function set(p,save,id,v){ bag(p)[id]=v; try{ save(); }catch(e){} }

  /* multi-attempt (classify): every value tried, in order. The wrong ones
     are the point — replaying them restores the disabled buttons, and
     counting them is what tells the instructor which item misleads. */
  function push(p,save,id,v){
    var b=bag(p);
    if(!b[id] || typeof b[id].push!=='function') b[id]=[];
    b[id].push(v);
    try{ save(); }catch(e){}
    return b[id];
  }

  /* One summary per classifier group, written to the student's own module
     node: <ns>/<sid>/mod/<mod>/cls/<group>. Module-scoped on purpose — it
     is not assignment work, so it must not land in work/, which is the
     graded workbook. doneCount() only ever reads mod/<m>/done, so adding a
     sibling key cannot affect any percentage in either dashboard.

     byItem carries the scenario text of the items that were got wrong, so
     the instructor view can show what actually misled people rather than
     an index. Only wrong items are included, so it stays small. */
  function cls(mod,group,payload){
    var a=window.E1410_AUTH;
    if(!a||!a.sid||!mod||!group) return;
    payload.ts=Date.now();
    try{
      fetch(DB+'/e1410/'+a.sid+'/mod/'+encodeURIComponent(mod)+'/cls/'+encodeURIComponent(group)+'.json',
        {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){});
    }catch(e){}
  }

  return { get:get, set:set, push:push, cls:cls };
})();
