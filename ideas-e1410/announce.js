/* =====================================================================
   E1410 · cohort announcement banner (student side, read-only).
   Fetches e1410/_announce from the teaching-70f1c Realtime DB and,
   if one is live, shows a dismissible banner at the top of the page.
   Posted/cleared by the instructor from admin.html. Best-effort.
   ===================================================================== */
(function(){
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var NS="e1410";
  var DISMISS_KEY="e1410_ann_dismissed";

  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}

  function injectCSS(){
    if(document.getElementById('ann-css'))return;
    var c=document.createElement('style');c.id='ann-css';
    c.textContent=
    '#ann-bar{display:flex;align-items:center;gap:12px;background:#AB0E00;color:#fff;'+
    'padding:11px 18px;font:14px/1.45 "Plus Jakarta Sans","Helvetica Neue",Arial,sans-serif;position:relative;z-index:80;}'+
    '#ann-bar .ann-ico{font-size:16px;flex:none;}'+
    '#ann-bar .ann-txt{flex:1;}'+
    '#ann-bar a{color:#fff;text-decoration:underline;}'+
    '#ann-bar .ann-x{background:none;border:none;color:rgba(255,255,255,.75);font-size:20px;line-height:1;'+
    'cursor:pointer;flex:none;padding:0 4px;}#ann-bar .ann-x:hover{color:#fff;}';
    document.head.appendChild(c);
  }

  function render(a){
    if(!a||!a.on||!a.text)return;
    var dismissed=0; try{dismissed=parseInt(localStorage.getItem(DISMISS_KEY)||'0',10)||0;}catch(e){}
    if(a.ts && dismissed>=a.ts) return;
    injectCSS();
    var bar=document.createElement('div');bar.id='ann-bar';
    bar.innerHTML='<span class="ann-ico">📣</span><span class="ann-txt">'+esc(a.text)+'</span>'+
                  '<button class="ann-x" aria-label="Dismiss">×</button>';
    document.body.insertBefore(bar,document.body.firstChild);
    bar.querySelector('.ann-x').addEventListener('click',function(){
      bar.remove();
      try{localStorage.setItem(DISMISS_KEY,String(a.ts||Date.now()));}catch(e){}
    });
  }

  function go(){
    try{
      fetch(DB+'/'+NS+'/_announce.json').then(function(r){return r.json();}).then(render).catch(function(){});
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
