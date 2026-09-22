/* =====================================================================
   E1410 · bilingual EN / VI toggle. Load SYNCHRONOUSLY in <head> so the
   language is set before first paint (no flash). Wrap text as
   <span class="en">English</span><span class="vi">Tiếng Việt</span> and
   add this CSS to the page:
     html[data-lang="vi"] .en{display:none!important;}
     html[data-lang="en"] .vi{display:none!important;}
   Put a switch anywhere:  <button data-setlang="en">EN</button>
                           <button data-setlang="vi">VI</button>
   ===================================================================== */
(function(){
  var K='e1410_lang',l;
  try{l=localStorage.getItem(K);}catch(e){}
  if(l!=='en'&&l!=='vi')l=((navigator.language||'').toLowerCase().indexOf('vi')===0)?'vi':'en';
  document.documentElement.setAttribute('data-lang',l);
  document.documentElement.setAttribute('lang',l==='vi'?'vi':'en');
  function wire(){
    var btns=document.querySelectorAll('[data-setlang]');
    btns.forEach(function(b){
      b.classList.toggle('on',b.getAttribute('data-setlang')===document.documentElement.getAttribute('data-lang'));
      b.addEventListener('click',function(){
        var nl=this.getAttribute('data-setlang');
        try{localStorage.setItem(K,nl);}catch(e){}
        document.documentElement.setAttribute('data-lang',nl);
        document.documentElement.setAttribute('lang',nl==='vi'?'vi':'en');
        document.querySelectorAll('[data-setlang]').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-setlang')===nl);});
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
