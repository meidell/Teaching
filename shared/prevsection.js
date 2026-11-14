/* =====================================================================
   "← Previous section" on the long scrolling session pages (14 Nov 2026).
   Jan Erik: "I need a 'back' button on sections for all courses to go to
   previous section."

   The screen-based courses (one section at a time: HEG, mba401/406,
   omba401, ombafr455, e1410, umef407, gen110, mfb545, flc, fl3) already
   have "← Back / ← Retour" on every section, so this script does NOTHING
   on a page that has `.screen` elements. ESM macro was fixed in its own
   pages. This covers the pages that are one long scroll of sections:
     · GBS run sheets and green-ai  — <div class="step" id="sN">
     · the SUMAS capstones (omba500, wind, capstone-ba)
                                    — <section class="sec" data-step="sN">
     · UMEF séminaire IA            — <h2><span class="step">N …</span></h2>
   Each section after the first gets, at its end, a small button that
   scrolls to the start of the section before (below any sticky top bar).
   Loaded by /track.js only when such sections exist. Writes nothing.
   ===================================================================== */
(function(){
  if(document.querySelector('.screen'))return;
  var fr=/^fr/i.test(document.documentElement.lang||'');
  var LBL=fr?'← Section précédente':'← Previous section';

  var css=document.createElement('style');
  css.textContent='.jem-prevsec{display:block;margin:14px 0 2px;font:inherit;font-size:13px;font-weight:700;'+
    'background:transparent;color:inherit;opacity:.75;border:1.5px solid currentColor;border-radius:20px;'+
    'padding:6px 14px;cursor:pointer;}.jem-prevsec:hover{opacity:1;}'+
    '.jem-prevsec small{font-weight:500;opacity:.8;margin-left:6px;}'+
    '@media print{.jem-prevsec{display:none!important;}}';
  document.head.appendChild(css);

  function title(el){
    var h=el.matches&&el.matches('h2')?el:el.querySelector('h2,h3');
    var t=h?(h.textContent||'').replace(/\s+/g,' ').trim():'';
    return t.length>60?t.slice(0,57)+'…':t;
  }
  function topOffset(){
    var off=12;
    Array.prototype.forEach.call(document.querySelectorAll('.topbar,.tbar,header,nav'),function(b){
      var cs=getComputedStyle(b);if((cs.position==='sticky'||cs.position==='fixed')&&b.getBoundingClientRect().top<=1)off=Math.max(off,b.offsetHeight+12);
    });
    return off;
  }
  function go(target){
    var y=target.getBoundingClientRect().top+window.pageYOffset-topOffset();
    window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
  }
  function button(prev){
    var b=document.createElement('button');b.type='button';b.className='jem-prevsec';
    var t=title(prev);
    b.innerHTML=LBL+(t?'<small></small>':'');
    if(t)b.querySelector('small').textContent=t;
    b.addEventListener('click',function(){go(prev);});
    return b;
  }

  /* 1 · sections that are containers */
  var boxes=Array.prototype.slice.call(document.querySelectorAll('.step[id], section.sec[data-step]'))
    .filter(function(el){return !el.parentNode.closest||!el.parentNode.closest('.step[id], section.sec[data-step]');});
  if(boxes.length>=2){
    boxes.forEach(function(el,i){if(i>0)el.appendChild(button(boxes[i-1]));});
    return;
  }
  /* 2 · sections marked only by their heading (séminaire IA) */
  var heads=Array.prototype.slice.call(document.querySelectorAll('h2')).filter(function(h){return h.querySelector('span.step');});
  if(heads.length>=2){
    heads.forEach(function(h,i){
      if(i===0)return;
      var b=button(heads[i-1]);
      var next=heads[i+1];
      if(next)next.parentNode.insertBefore(b,next);
      else{ /* last section: after its last sibling block */
        var p=h.parentNode,last=h;while(last.nextElementSibling&&!/^(SCRIPT|FOOTER)$/.test(last.nextElementSibling.tagName))last=last.nextElementSibling;
        p.insertBefore(b,last.nextSibling);
      }
    });
  }
})();
