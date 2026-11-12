/* =====================================================================
   GBS · Business Intelligence — "What your team has done": the hand-in
   tracker on a session page (12 Nov 2026).

   Jan Erik: "make also a progress bar for that session and what they have
   filled in and what is left to do — so that they CLEARLY can see how far
   they are". A strip under the top bar, sticky, one segment per item of
   the hand-in (a full segment = done, a part-filled one = started), the
   count "4 of 8 done", ONE line "Next: …" with a link to the place where
   that item is done, and a list that opens with one row per item.
   The items read the page's own fields and the TEAM's shared answers
   (teams.js fills them in on every member's laptop), so every member of a
   team sees the same state whichever laptop typed. Re-read every 2 s.
   Rules kept on purpose, as in the creator progress view: count what is
   done, never "missed"; no comparison with other teams; nothing blocks.

     BiTracker.mount({title, items:[{label, where, href, check}]})
       check() → {done:bool, have:n, need:n, text:'…'}  (have/need optional)
   ===================================================================== */
window.BiTracker=(function(){
  var CFG=null,OPEN=false,K='bi_trk_open_';
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function css(){
    if(document.getElementById('trk-css'))return;
    var s=document.createElement('style');s.id='trk-css';
    s.textContent='#trk{position:sticky;top:46px;z-index:55;background:#fff;border:1.5px solid var(--accent,#C9A227);border-radius:12px;margin:0 0 16px;padding:10px 14px;box-shadow:0 6px 18px rgba(14,27,61,.10);font-size:14px;color:var(--navy,#14213D)}'+
      '#trk .th{display:flex;align-items:center;gap:12px;flex-wrap:wrap}#trk .tt{font-weight:800}#trk .tn{font-weight:800;color:var(--accent-deep,#8A6A12);white-space:nowrap}'+
      '#trk .bar{display:flex;gap:4px;flex:1;min-width:160px}#trk .bar a{flex:1;height:12px;border-radius:4px;background:#E5E9EF;position:relative;overflow:hidden;display:block}'+
      '#trk .bar a i{position:absolute;left:0;top:0;bottom:0;background:var(--accent,#C9A227)}#trk .bar a.d i{background:#1F8A4C}'+
      '#trk .nx{margin-top:7px;line-height:1.45}#trk .nx a{font-weight:800;color:var(--accent-deep,#8A6A12)}#trk button{border:none;background:none;font:inherit;font-size:13px;color:#5B6680;text-decoration:underline;cursor:pointer;padding:0}'+
      '#trk ol{margin:8px 0 0;padding:0;list-style:none}#trk li{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:8px;padding:6px 0;border-top:1px dashed #DDE2EC;align-items:baseline}'+
      '#trk li .k{font-weight:800}#trk li.d .k{color:#1F8A4C}#trk li .w{font-size:12.5px;color:#5B6680}#trk li a{font-size:12.5px;font-weight:700;color:var(--navy,#14213D);white-space:nowrap}'+
      '@media(max-width:600px){#trk{top:0;position:relative}#trk li{grid-template-columns:22px minmax(0,1fr)}#trk li a{grid-column:2}}';
    document.head.appendChild(s);
  }
  function state(){return CFG.items.map(function(it){var r={done:false};try{r=it.check()||r;}catch(e){}return r;});}
  function paint(){
    var box=document.getElementById('trk');if(!box||!CFG)return;
    var S=state(),n=S.filter(function(x){return x.done;}).length,N=S.length,first=-1;
    S.forEach(function(x,i){if(first<0&&!x.done)first=i;});
    var h='<div class="th"><span class="tt">'+esc(CFG.title)+'</span><span class="bar">'+CFG.items.map(function(it,i){var x=S[i],f=x.done?1:(x.need?Math.min(1,(x.have||0)/x.need):0);
      return '<a href="'+it.href+'" class="'+(x.done?'d':'')+'" title="'+esc(it.label)+(x.done?' · done':'')+'"><i style="width:'+Math.round(f*100)+'%"></i></a>';}).join('')+'</span><span class="tn">'+n+' of '+N+' done</span></div>';
    if(first<0)h+='<div class="nx"><b>Everything is done ✓</b> Your team handed in and played the quiz.</div>';
    else{var it=CFG.items[first],x=S[first];h+='<div class="nx"><b>Next:</b> '+esc(it.label)+(x.text?' — '+esc(x.text):'')+' · <a href="'+it.href+'">'+esc(it.where)+' ↓</a></div>';}
    h+='<button type="button" id="trkT">'+(OPEN?'Hide the list':'Show what is done and what is left')+'</button>';
    if(OPEN)h+='<ol>'+CFG.items.map(function(it,i){var x=S[i];return '<li class="'+(x.done?'d':'')+'"><span class="k">'+(x.done?'✓':(i+1))+'</span><span>'+esc(it.label)+(x.text?'<br><span class="w">'+esc(x.text)+'</span>':'')+'</span><a href="'+it.href+'">'+esc(it.where)+'</a></li>';}).join('')+'</ol>';
    box.innerHTML=h;
    document.getElementById('trkT').onclick=function(){OPEN=!OPEN;try{localStorage.setItem(K+CFG.key,OPEN?'1':'0');}catch(e){}paint();};
  }
  function mount(cfg){
    CFG=cfg;css();try{OPEN=localStorage.getItem(K+cfg.key)==='1';}catch(e){}
    var host=document.querySelector(cfg.before||'.sprog');if(!host)return;
    var box=document.createElement('div');box.id='trk';host.parentNode.insertBefore(box,host);
    paint();setInterval(function(){if(!document.hidden)paint();},2000);
    document.addEventListener('input',function(){setTimeout(paint,300);});
  }
  return {mount:mount,paint:paint};
})();
