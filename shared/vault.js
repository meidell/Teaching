/* =====================================================================
   SHARED · password-protected downloads (1 Nov 2026).

   Jan Erik: "make the file password protected and let me be able to
   change a password that gives access to that and other downloadable
   assets in the admin page."

   A file that must not be public (a journal article, a handout) is
   committed ENCRYPTED, as `<name>.enc`. Without the password the bytes
   are useless, so it does not matter that the web root serves them to
   anyone. A page links it with

       <a href="#" data-vault="/GBS/x/readings/paper.pdf.enc"
                   data-file="Paper-2021.pdf">PDF</a>

   and loads this script. A click asks for the downloads password once
   per device, fetches the file, decrypts it in the browser and saves it.

   TWO KEYS, so the password can change without re-encrypting anything:
     · the FILE KEY (32 random bytes) encrypts every .enc file. It never
       changes and is never in this repo: it lives in `_private/vault.key`
       on Jan Erik's machine and in `_site/vaultkey` (instructor-only read).
     · the PASSWORD wraps the file key: `_site/vault = {v,s,i,iv,w,ts}`,
       world-readable, instructor-write. PBKDF2-SHA256 (i rounds, salt s)
       turns the password into a key that AES-GCM-decrypts w into the
       file key. `/admin/` → "Downloads password" rewrites this node, and
       the old password stops working at once.
   What a password change does NOT do: someone who once had the password
   and dug the file key out of their browser can still decrypt the files.
   Revoking that means a new file key and re-encrypting every file
   (`node shared/vault-tool.mjs`).

   File format: "JEMV1" (5 bytes) · iv (12) · AES-256-GCM ciphertext.

       JEMVault.unwrap(node, pw)   → Promise<CryptoKey|null>
       JEMVault.wrap(rawKey, pw)   → Promise<node>        (admin)
       JEMVault.seal(bytes, rawKey)→ Promise<Uint8Array>  (admin)
       JEMVault.open(url, name)    → prompt if needed, decrypt, save
   ===================================================================== */
(function(){
  "use strict";
  if(window.JEMVault)return;
  var DB="https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";
  var PWKEY="jem_vault_pw", MAGIC="JEMV1", ROUNDS=310000;
  var FR=/^fr/i.test(document.documentElement.lang||"");
  var T=FR?{
    h:"Document protégé",p:"Saisissez le mot de passe des documents donné en cours.",
    ph:"mot de passe",ok:"Ouvrir",no:"Annuler",bad:"Mot de passe incorrect.",
    net:"Le document n'a pas pu être chargé. Réessayez.",busy:"Déchiffrement…",
    none:"Les documents protégés ne sont pas encore ouverts. Demandez à l'enseignant."
  }:{
    h:"Protected document",p:"Type the downloads password given in class.",
    ph:"password",ok:"Open",no:"Cancel",bad:"That password is not right.",
    net:"The document could not be loaded. Try again.",busy:"Decrypting…",
    none:"Protected documents are not set up yet. Ask your instructor."
  };
  var enc=new TextEncoder(), S=crypto.subtle;
  function b64(u){var s="";u=new Uint8Array(u);for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s);}
  function unb64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}

  async function kek(pw,salt,rounds){
    var base=await S.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveKey"]);
    return S.deriveKey({name:"PBKDF2",hash:"SHA-256",salt:salt,iterations:rounds},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
  }
  async function unwrap(node,pw){
    if(!node||!node.w||!pw)return null;
    try{
      var k=await kek(pw,unb64(node.s),node.i);
      var raw=await S.decrypt({name:"AES-GCM",iv:unb64(node.iv)},k,unb64(node.w));
      return S.importKey("raw",raw,"AES-GCM",false,["decrypt","encrypt"]);
    }catch(e){return null;}
  }
  async function wrap(raw,pw){
    var salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12));
    var k=await kek(pw,salt,ROUNDS);
    var w=await S.encrypt({name:"AES-GCM",iv:iv},k,raw);
    return {v:1,s:b64(salt),i:ROUNDS,iv:b64(iv),w:b64(w),ts:Date.now()};
  }
  async function seal(bytes,raw){
    var key=await S.importKey("raw",raw,"AES-GCM",false,["encrypt"]);
    var iv=crypto.getRandomValues(new Uint8Array(12));
    var ct=new Uint8Array(await S.encrypt({name:"AES-GCM",iv:iv},key,bytes));
    var out=new Uint8Array(5+12+ct.length);
    out.set(enc.encode(MAGIC),0);out.set(iv,5);out.set(ct,17);
    return out;
  }
  async function unseal(buf,key){
    var u=new Uint8Array(buf);
    if(new TextDecoder().decode(u.slice(0,5))!==MAGIC)throw new Error("format");
    return S.decrypt({name:"AES-GCM",iv:u.slice(5,17)},key,u.slice(17));
  }
  function lsGet(){try{return localStorage.getItem(PWKEY)||"";}catch(e){return "";}}
  function lsSet(v){try{v?localStorage.setItem(PWKEY,v):localStorage.removeItem(PWKEY);}catch(e){}}
  var NODE=null;
  async function node(){
    if(NODE)return NODE;
    var r=await fetch(DB+"/_site/vault.json",{cache:"no-cache"});
    if(!r.ok)return null;
    NODE=await r.json();return NODE;
  }

  /* ---- the prompt ---- */
  function ask(msg){
    return new Promise(function(done){
      var bg=document.createElement("div");
      bg.style.cssText="position:fixed;inset:0;z-index:2147483000;background:rgba(10,20,35,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit;";
      bg.innerHTML='<form style="background:var(--surface,#fff);color:var(--ink,#1a2230);max-width:360px;width:100%;border-radius:10px;padding:22px 22px 18px;box-shadow:0 12px 40px rgba(0,0,0,.3);">'+
        '<div style="font-weight:800;font-size:17px;margin-bottom:6px;">🔒 '+T.h+'</div>'+
        '<div style="font-size:14px;line-height:1.5;margin-bottom:12px;opacity:.85;">'+T.p+'</div>'+
        '<input type="password" autocomplete="off" placeholder="'+T.ph+'" style="width:100%;box-sizing:border-box;padding:10px 12px;font-size:16px;border:1px solid #c8ced6;border-radius:6px;">'+
        '<div class="vm" style="min-height:20px;font-size:13px;color:#b42318;margin:8px 0 4px;">'+(msg||"")+'</div>'+
        '<div style="display:flex;gap:8px;justify-content:flex-end;">'+
        '<button type="button" data-x style="padding:8px 14px;border:1px solid #c8ced6;background:transparent;color:inherit;border-radius:6px;cursor:pointer;font:inherit;">'+T.no+'</button>'+
        '<button type="submit" style="padding:8px 16px;border:0;background:var(--navy,#0a2540);color:#fff;border-radius:6px;font-weight:700;cursor:pointer;font:inherit;">'+T.ok+'</button></div></form>';
      document.body.appendChild(bg);
      var f=bg.querySelector("form"), inp=bg.querySelector("input");
      setTimeout(function(){inp.focus();},30);
      function end(v){bg.remove();done(v);}
      bg.querySelector("[data-x]").onclick=function(){end(null);};
      bg.addEventListener("click",function(e){if(e.target===bg)end(null);});
      f.onsubmit=function(e){e.preventDefault();end(inp.value);};
    });
  }
  function toast(t){
    var d=document.createElement("div");
    d.style.cssText="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483001;background:#1a2230;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;max-width:90vw;";
    d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove();},4000);return d;
  }

  async function key(){
    var n=await node();
    if(!n||!n.w){toast(T.none);return null;}
    var k=await unwrap(n,lsGet());
    var msg="";
    while(!k){
      var pw=await ask(msg);
      if(pw==null)return null;
      k=await unwrap(n,pw);
      if(k)lsSet(pw);else msg=T.bad;
    }
    return k;
  }
  async function open(url,name){
    var k=await key(); if(!k)return;
    var t=toast(T.busy);
    try{
      var r=await fetch(url,{cache:"no-cache"});
      if(!r.ok)throw new Error(r.status);
      var plain=await unseal(await r.arrayBuffer(),k);
      var file=name||url.split("/").pop().replace(/\.enc$/,"");
      var type=/\.pdf$/i.test(file)?"application/pdf":"application/octet-stream";
      var u=URL.createObjectURL(new Blob([plain],{type:type}));
      var a=document.createElement("a");a.href=u;a.download=file;document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(u);},60000);
      t.remove();
    }catch(e){t.remove();toast(T.net);}
  }
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("[data-vault]");
    if(!a)return;
    e.preventDefault();e.stopPropagation();
    open(a.getAttribute("data-vault"),a.getAttribute("data-file"));
  },true);

  window.JEMVault={unwrap:unwrap,wrap:wrap,seal:seal,open:open,b64:b64,unb64:unb64};
})();
