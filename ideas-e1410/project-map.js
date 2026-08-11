/* =====================================================================
   E1410 · THE PROJECT MAP — one definition of the running project.

   Two pages render the same student answers for two different audiences:
     • compile.html    — the draft skeleton, in the final assignment's order
     • board-pack.html — the board-ready export (exec summary, canvas, pack)

   Both used to need their own copy of the field list. They don't now: this
   file is the single client-side source, and courses.json carries the same
   structure for the instructor dashboard. ADDING A WORKBOOK FIELD = add it
   to SECTIONS here AND to courses.json → project.sections. Nothing else.

   Field ids are the data-work ids on the session pages. /shared/progress.js
   saves each to localStorage e1410_work_<id> and, when the student is
   signed in, to e1410/<sid>/work/<id> = {v,label,mod,ts}.

   `short:true`  — the field is a one-line <input> on the session page, so
                   the quality check must not demand a paragraph of it.
   `weight`      — how much the field counts toward board-readiness. 2 = the
                   board cannot take a decision without it. Default 1.
   ===================================================================== */
window.E1410_PROJECT = (function(){

  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";

  /* ---------------------------------------------------------------- */
  /* The eight sections of the final assignment                        */
  /* ---------------------------------------------------------------- */
  var SECTIONS = [
    {n:1, sec:'Context & the business problem', from:'Session 1', items:[
      {id:'proj_name',       label:'Project', short:true, weight:2},
      {id:'s1_problem',      label:'The business problem (no AI jargon)', weight:2},
      {id:'s1_stakeholders', label:'Key stakeholders'}
    ]},
    {n:2, sec:'Why AI, and the data reality', from:'Session 1', items:[
      {id:'s1_why_ai', label:'Why AI, not traditional software', weight:2},
      {id:'s1_data',   label:'The data it needs — and its reality', weight:2}
    ]},
    {n:3, sec:'The plan', from:'Session 2', items:[
      {id:'s2_wbs',     label:'Work Breakdown Structure', weight:2},
      {id:'s2_func',    label:'Functional requirement'},
      {id:'s2_nonfunc', label:'Non-functional requirement'},
      {id:'s2_data',    label:'Data requirement'},
      {id:'s2_method',  label:'Methodology — and why it fits', weight:2},
      {id:'s2_change',  label:'An evolving requirement & how you control it'}
    ]},
    {n:4, sec:'Resources & budget', from:'Session 3', items:[
      {id:'s3_team',        label:'Team composition', weight:2},
      {id:'s3_gap',         label:'Capability gap & how it is closed'},
      {id:'s3_infra',       label:'Infrastructure choice', short:true},
      {id:'s3_infra_why',   label:'Why that infrastructure', short:true},
      {id:'s3_cost_driver', label:'Dominant cost driver & rough size', weight:2},
      {id:'s3_estimation',  label:'Estimation approach'},
      {id:'s3_contingency', label:'Contingency & phased funding', weight:2}
    ]},
    {n:5, sec:'Risk', from:'Sessions 2 & 4', items:[
      {id:'s1_risk',       label:'Top risk to the project'},
      {id:'s2_sched_risk', label:'Scheduling risk & where you buffer it'},
      {id:'s4_risks',      label:'Top three risks (by category)', weight:2},
      {id:'s4_top',        label:'Highest-priority risk', weight:2},
      {id:'s4_top_pi',     label:'Probability × impact rating', short:true},
      {id:'s4_mitigation', label:'Mitigation strategy & first action', weight:2}
    ]},
    {n:6, sec:'Delivery, adoption & monitoring', from:'Sessions 5–6', items:[
      {id:'s5_sprint_len',  label:'Sprint length', short:true},
      {id:'s5_sprint_out',  label:'What a sprint delivers'},
      {id:'s5_hybrid',      label:'Hybrid approach — where each style applies'},
      {id:'s5_mvm',         label:'Minimum viable model', weight:2},
      {id:'s5_backlog',     label:'Backlog items with success criteria'},
      {id:'s5_metric',      label:'Key metric translated for stakeholders'},
      {id:'s5_tradeoff',    label:'The precision/recall trade-off & who decides', weight:2},
      {id:'s5_expectation', label:'Expectation to reset & how'},
      {id:'s5_conflict',    label:'Likely conflict & resolution approach'},
      {id:'s6_kpis',        label:'Monitoring KPIs (model / operational / business)', weight:2},
      {id:'s6_drift',       label:'Biggest drift threat & detection method', weight:2},
      {id:'s6_threshold',   label:'Alert threshold', short:true},
      {id:'s6_action',      label:'Action when the threshold trips'},
      {id:'s6_retrain',     label:'Retraining trigger, cadence & validation gate'},
      {id:'s6_validation',  label:'Validation strategy'},
      {id:'s6_abtest',      label:'A/B test design & deciding metric'},
      {id:'s6_repro',       label:'Reproducibility & documentation requirements'},
      {id:'s6_owner',       label:'Post-launch ownership & operating budget', weight:2}
    ]},
    {n:7, sec:'Responsible AI & governance', from:'Sessions 4 & 7', items:[
      {id:'s4_bias',       label:'Bias exposure, detection & mitigation stage', weight:2},
      {id:'s4_compliance', label:'Regulatory & compliance constraints', weight:2},
      {id:'s4_xai',        label:'Explainability requirement & approach'},
      {id:'s4_governance', label:'Risk ownership & governance checkpoints', weight:2},
      {id:'s7_ethics',     label:'Fairness & explainability (case workshop)'}
    ]},
    {n:8, sec:'Success criteria & reflection', from:'Sessions 1, 6, 7 & 8', items:[
      {id:'s1_metric_tech', label:'Technical success metric', short:true, weight:2},
      {id:'s1_metric_biz',  label:'Business success metric', short:true, weight:2},
      {id:'s6_case',        label:'Closest case study & what to copy'},
      {id:'s7_learned',     label:'What the case workshop changed'},
      {id:'s8_thesis',      label:'The central argument', weight:2},
      {id:'s8_critical',    label:'Counter-argument & response', weight:2},
      {id:'s8_reflection',  label:'Course reflection'}
    ]}
  ];

  /* ---------------------------------------------------------------- */
  /* The executive summary — what a board reads if it reads one page.  */
  /* Ordered as a decision paper, not as a course assignment: the ask  */
  /* first, the evidence under it, the risk stated before the upside.  */
  /* ---------------------------------------------------------------- */
  var EXEC = [
    {h:'The problem',            ids:['s1_problem'],                     lead:true},
    {h:'Why this needs AI',      ids:['s1_why_ai']},
    {h:'What we would build',    ids:['s5_mvm','s2_method']},
    {h:'The data behind it',     ids:['s1_data']},
    {h:'What success looks like',ids:['s1_metric_biz','s1_metric_tech']},
    {h:'What it costs',          ids:['s3_cost_driver','s3_contingency','s6_owner']},
    {h:'The principal risk',     ids:['s4_top','s4_mitigation']},
    {h:'Governance & compliance',ids:['s4_governance','s4_compliance']},
    {h:'The counter-argument',   ids:['s8_critical']}
  ];

  /* ---------------------------------------------------------------- */
  /* The one-page canvas. 12 boxes, four columns × three bands:        */
  /* WHY (problem) → WHAT (solution) → HOW (delivery). Each box is one */
  /* field, deliberately — a canvas that needs scrolling isn't one.    */
  /* ---------------------------------------------------------------- */
  var CANVAS = [
    {band:'Why',      h:'Business problem',   id:'s1_problem'},
    {band:'Why',      h:'Stakeholders',       id:'s1_stakeholders'},
    {band:'Why',      h:'Why AI',             id:'s1_why_ai'},
    {band:'Why',      h:'Business metric',    id:'s1_metric_biz'},
    {band:'What',     h:'Data reality',       id:'s1_data'},
    {band:'What',     h:'Minimum viable model', id:'s5_mvm'},
    {band:'What',     h:'Technical metric',   id:'s1_metric_tech'},
    {band:'What',     h:'Infrastructure',     id:'s3_infra'},
    {band:'How',      h:'Team',               id:'s3_team'},
    {band:'How',      h:'Method & cadence',   id:'s2_method'},
    {band:'How',      h:'Dominant cost',      id:'s3_cost_driver'},
    {band:'How',      h:'Top risk',           id:'s4_top'}
  ];

  /* ---------------------------------------------------------------- */
  /* Quality thresholds. These are deliberately gentle: the point is   */
  /* to catch a field answered with "TBD" or three words, not to grade */
  /* prose. Anything stricter would be a rubric, and the rubric is the */
  /* instructor's job, not a regex's.                                  */
  /* ---------------------------------------------------------------- */
  var THIN_WORDS  = 8;   /* a long field under this reads as a placeholder */
  var SHORT_WORDS = 1;   /* one-line inputs only have to say something     */
  var STUB = /^(tbd|todo|n\/?a|none|-+|\?+|xxx+)\.?$/i;

  function words(s){ s=String(s||'').trim(); return s?s.split(/\s+/).length:0; }

  function itemState(it,v){
    v = String(v==null?'':v).trim();
    if(!v) return 'empty';
    if(STUB.test(v)) return 'thin';
    return words(v) < (it.short?SHORT_WORDS:THIN_WORDS) ? 'thin' : 'ok';
  }

  function allItems(){
    var out=[];
    SECTIONS.forEach(function(s){ s.items.forEach(function(it){ out.push(it); }); });
    return out;
  }

  function itemById(id){
    var found=null;
    allItems().forEach(function(it){ if(it.id===id) found=it; });
    return found;
  }

  /* Board-readiness. Weighted fill rate, with thin answers counting half —
     a field with "TBD" in it is not the same as a blank, but it is not an
     answer either. Bands are stated to the student, not hidden. */
  function readiness(vals){
    var got=0, max=0, empty=[], thin=[];
    allItems().forEach(function(it){
      var w = it.weight||1; max += w;
      var st = itemState(it, vals[it.id]);
      if(st==='ok') got += w;
      else if(st==='thin'){ got += w*0.5; thin.push(it); }
      else empty.push(it);
    });
    var pct = max ? Math.round(got/max*100) : 0;
    var band = pct>=90 ? 'Board-ready' : pct>=65 ? 'Presentable' : pct>=30 ? 'Working draft' : 'Skeleton';
    return {pct:pct, band:band, empty:empty, thin:thin,
            filled:allItems().length-empty.length, total:allItems().length};
  }

  /* ---------------------------------------------------------------- */
  /* Loading. localStorage first so the page is never blank, then the  */
  /* database fills anything this device is missing (cross-device).    */
  /* Remote never overwrites a non-empty local value — the same rule   */
  /* /shared/login.js uses when it merges.                             */
  /* ---------------------------------------------------------------- */
  function readLocal(){
    var vals={};
    allItems().forEach(function(it){
      try{ vals[it.id] = localStorage.getItem('e1410_work_'+it.id) || ''; }catch(e){ vals[it.id]=''; }
    });
    return vals;
  }

  function load(auth, onUpdate){
    var vals = readLocal();
    onUpdate(vals, 'local');
    if(!auth || !auth.sid) return vals;
    fetch(DB+'/e1410/'+auth.sid+'/work.json')
      .then(function(r){ return r.json(); })
      .then(function(w){
        if(!w) return;
        var changed=false;
        allItems().forEach(function(it){
          var node=w[it.id];
          if(node && node.v!=null && String(node.v).trim() && !String(vals[it.id]||'').trim()){
            vals[it.id]=String(node.v); changed=true;
          }
        });
        if(changed) onUpdate(vals,'remote');
      })
      .catch(function(){});
    return vals;
  }

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  return {
    DB:DB, SECTIONS:SECTIONS, EXEC:EXEC, CANVAS:CANVAS,
    allItems:allItems, itemById:itemById, itemState:itemState,
    readiness:readiness, readLocal:readLocal, load:load, esc:esc, words:words
  };
})();
