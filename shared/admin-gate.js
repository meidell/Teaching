/* =====================================================================
   SHARED · instructor gate.
   One password for every dashboard on the site, entered once per device.

     <script src="/shared/admin-gate.js"></script>
     AdminGate.mount({
       brand: 'OMBA401 · INSTRUCTOR',
       logo:  '/omba401/sumas-logo.png',
       theme: CourseConfig.get('omba401').theme,
       onUnlock: start
     });

   Only the SHA-256 of the password lives here, and the device remembers
   the password itself (localStorage) — so the next visit, on this
   browser, opens straight through with no prompt. Changing PASS_HASH
   below automatically invalidates every remembered device, because the
   stored value no longer hashes to a match.

   The unlock is site-wide on purpose: unlocking one course dashboard
   unlocks them all on that device. AdminGate.lock() forgets it again.

   NOTE — this is a soft gate. It hides the instructor UI; it is not
   authentication, and it cannot protect the database (the rules do
   that). Never put anything here that must genuinely stay secret.
   ===================================================================== */
window.AdminGate = (function () {
  "use strict";

  /* SHA-256 of the instructor password. To change the password: hash the
     new one (`printf 'newpass' | shasum -a 256`) and paste it here. */
  var PASS_HASH = "41c8fa7d060badc5618a28326dc00cf07e1ce22a79a94a1fed94f271d3127447";
  var STORE_KEY = "jem_admin_pw";      /* shared by every gate on the site */
  var LEGACY_KEYS = ["omba401_admin_ok","ombafr455_admin_ok","umef407_admin_ok",
                     "e1410_admin_ok","stats_admin_ok"];

  /* compact synchronous SHA-256 (same implementation the root page uses) */
  function sha256(ascii){ function rr(v,a){return (v>>>a)|(v<<(32-a));} var mp=Math.pow,mw=mp(2,32),result='';var words=[],abl=ascii.length*8;var hash=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],pc=k.length,comp={};for(var c=2;pc<64;c++){if(!comp[c]){for(var i=0;i<313;i+=c){comp[i]=c;}hash[pc]=(mp(c,.5)*mw)|0;k[pc++]=(mp(c,1/3)*mw)|0;}}ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';for(var i=0;i<ascii.length;i++){var j=ascii.charCodeAt(i);if(j>>8)return '';words[i>>2]|=j<<((3-i)%4)*8;}words[words.length]=((abl/mw)|0);words[words.length]=(abl);for(var j=0;j<words.length;){var w=words.slice(j,j+=16),oh=hash;hash=hash.slice(0,8);for(var i=0;i<64;i++){var w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];var t1=hash[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);var t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0;}for(var i=0;i<8;i++){hash[i]=(hash[i]+oh[i])|0;}}for(var i=0;i<8;i++){for(var j=3;j+1;j--){var b=(hash[i]>>(j*8))&255;result+=((b<16)?0:'')+b.toString(16);}}return result; }
  function h(s){ return sha256(unescape(encodeURIComponent(s))); }

  function matches(pw){ return !!pw && h(String(pw).trim()) === PASS_HASH; }

  function remembered(){
    var v=null; try{ v=localStorage.getItem(STORE_KEY); }catch(e){}
    return matches(v) ? v : null;
  }
  function remember(pw){ try{ localStorage.setItem(STORE_KEY, pw); }catch(e){} }
  function lock(){
    try{ localStorage.removeItem(STORE_KEY); }catch(e){}
    try{ LEGACY_KEYS.forEach(function(k){ sessionStorage.removeItem(k); localStorage.removeItem(k); }); }catch(e){}
  }

  function css(T){
    if(document.getElementById('ag-css'))return;
    var s=document.createElement('style'); s.id='ag-css';
    s.textContent=
    '#ag-gate{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:'+T.surface+';}'+
    '#ag-gate.ag-hidden{display:none;}'+
    '#ag-box{background:#fff;border:1px solid '+T.main+'33;border-radius:20px;padding:34px 30px;max-width:380px;width:100%;text-align:center;box-shadow:0 18px 50px -20px rgba(0,0,0,.35);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;}'+
    '#ag-box img{height:42px;width:auto;margin:0 auto 16px;display:block;}'+
    '#ag-brand{font-size:10px;letter-spacing:2px;color:'+T.main+';font-weight:bold;margin-bottom:12px;}'+
    '#ag-lock{font-size:30px;margin-bottom:10px;}'+
    '#ag-box h1{font-family:Georgia,serif;font-size:22px;margin:0 0 8px;color:'+T.ink+';}'+
    '#ag-box p{color:'+T.grey+';font-size:13px;margin:0 0 16px;}'+
    '#ag-pw{width:100%;text-align:center;letter-spacing:10px;font:22px "Helvetica Neue",Arial,sans-serif;color:'+T.ink+';'+
    'background:'+T.surface+';border:1px solid '+T.main+'40;border-radius:10px;padding:12px;margin-bottom:12px;}'+
    '#ag-pw:focus{outline:none;border-color:'+T.main+';}'+
    '#ag-go{width:100%;background:'+T.main+';color:#fff;border:none;border-radius:30px;padding:12px;font:bold 14px "Helvetica Neue",Arial,sans-serif;cursor:pointer;}'+
    '#ag-go:hover{background:'+T.deep+';}'+
    '#ag-err{color:#B3402A;font-size:13px;margin-top:10px;min-height:18px;}';
    document.head.appendChild(s);
  }

  /* Renders the lock screen and calls onUnlock() once the device is trusted.
     If the password was already given on this device, onUnlock fires
     immediately and no gate is ever shown. */
  function mount(o){
    o=o||{};
    var T=o.theme||{surface:"#F4F6FA",main:"#1e5aa8",deep:"#152a5e",ink:"#0a1a3a",grey:"#5A6B87"};
    var done=false;
    function open(){ if(done)return; done=true; try{o.onUnlock&&o.onUnlock();}catch(e){console.error(e);} }

    if(remembered()){ open(); return { unlocked:true }; }

    css(T);
    var g=document.createElement('div'); g.id='ag-gate';
    g.innerHTML='<div id="ag-box">'+
      (o.logo?'<img src="'+o.logo+'" alt="">':'')+
      '<div id="ag-brand"></div><div id="ag-lock">🔒</div>'+
      '<h1></h1><p></p>'+
      '<input id="ag-pw" type="password" inputmode="numeric" autocomplete="current-password" placeholder="••••">'+
      '<button id="ag-go">Unlock</button><div id="ag-err"></div></div>';
    document.body.appendChild(g);
    g.querySelector('#ag-brand').textContent=o.brand||'INSTRUCTOR';
    g.querySelector('h1').textContent=o.title||'Dashboard access';
    g.querySelector('p').textContent=o.blurb||'Enter the instructor password. This device will remember it.';

    var pw=g.querySelector('#ag-pw'), err=g.querySelector('#ag-err');
    function submit(){
      var v=(pw.value||'').trim();
      if(matches(v)){ remember(v); err.textContent=''; g.classList.add('ag-hidden'); open(); }
      else { err.textContent='Incorrect password.'; pw.value=''; pw.focus(); }
    }
    g.querySelector('#ag-go').addEventListener('click',submit);
    pw.addEventListener('keydown',function(e){ if(e.key==='Enter')submit(); });
    setTimeout(function(){pw.focus();},60);
    return { unlocked:false };
  }

  return { mount:mount, lock:lock, check:matches, isUnlocked:function(){return !!remembered();} };
})();
