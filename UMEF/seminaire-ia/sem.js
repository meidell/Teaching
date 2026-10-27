/* =====================================================================
   Séminaire · Programmer avec une IA (Swiss UMEF, 27 Oct 2026)
   Shared helpers for the four pages of this folder.

   DATABASE: <db>/umefsem/ — its own rules block in
   firebase-database-rules.json (⚠ must be PUBLISHED before the session):
     apps/<team>   {html, title, team, ts}  the published app, overwritable,
                                            never deletable by a student
     idx/<team>    {title, ts}              what the gallery lists (small)
     votes/<team>/<voter>  true             create-once, one per device
     data/<team>/<coll>/<item>              the students' own apps write here
                                            (REST, no SDK, no key)

   ⚠ STUDENT HTML RUNS IN <iframe sandbox="allow-scripts …"> WITHOUT
   allow-same-origin, always. It is code nobody reviewed, served on
   janerikmeidell.com: with same-origin it could read jem_fb_session (the
   instructor token) out of localStorage. Opaque origin = no access. The
   prelude below then shims localStorage (which throws in an opaque
   origin) and reports errors and refused fetches to the parent page.
   ===================================================================== */
(function(){
  var DB = 'https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
  var NS = 'umefsem';
  var SITE = 'https://janerikmeidell.com/UMEF/seminaire-ia/';
  /* -en.html pages carry <html lang="en">; every string below follows it. */
  var EN = (document.documentElement.lang || '').slice(0, 2) === 'en';
  var LOC = EN ? 'en-GB' : 'fr-CH';

  function slug(s){
    return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30);
  }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function url(path, q){ return DB + '/' + NS + '/' + path + '.json' + (q ? '?' + q : ''); }
  function get(path, q){
    return fetch(url(path, q), {cache:'no-store'}).then(function(r){
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
      return r.json();
    });
  }
  function put(path, val){
    return fetch(url(path), {method:'PUT', body: JSON.stringify(val)}).then(function(r){
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
      return r.json();
    });
  }
  function post(path, val){
    return fetch(url(path), {method:'POST', body: JSON.stringify(val)}).then(function(r){
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
      return r.json();
    });
  }
  function ls(k, v){
    try {
      if (arguments.length < 2) return localStorage.getItem('umefsem_' + k);
      if (v === null) localStorage.removeItem('umefsem_' + k); else localStorage.setItem('umefsem_' + k, v);
    } catch(e) { return null; }
  }
  function voter(){
    var v = ls('voter');
    if (!v) { v = 'v' + Math.random().toString(36).slice(2, 12); ls('voter', v); }
    return v;
  }
  function ago(ts){
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return EN ? 'just now' : 'à l’instant';
    if (s < 3600) return EN ? Math.round(s / 60) + ' min ago' : 'il y a ' + Math.round(s / 60) + ' min';
    if (s < 86400) return EN ? Math.round(s / 3600) + ' h ago' : 'il y a ' + Math.round(s / 3600) + ' h';
    return new Date(ts).toLocaleDateString(LOC);
  }

  /* The AI often answers with ```html … ``` around the code, or with a
     sentence before it. Keep the largest fenced block if there is one. */
  function clean(text){
    var t = String(text || '');
    var re = /```[a-zA-Z]*\s*\n([\s\S]*?)```/g, m, best = '';
    while ((m = re.exec(t))) if (m[1].length > best.length) best = m[1];
    if (best) return best.trim();
    var i = t.search(/<!doctype html|<html/i);
    return (i > 0 ? t.slice(i) : t).trim();
  }
  function titleOf(html){
    var m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html || '');
    return m ? m[1].replace(/\s+/g, ' ').trim().slice(0, 80) : '';
  }

  /* Runs inside the sandboxed iframe, before the student's own code. */
  function prelude(report){
    var js = '(function(){' +
      'function mem(){var m={};return{getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}},key:function(i){return Object.keys(m)[i]||null},get length(){return Object.keys(m).length}}}' +
      '["localStorage","sessionStorage"].forEach(function(n){try{window[n].getItem("x")}catch(e){try{Object.defineProperty(window,n,{value:mem(),configurable:true})}catch(_){}}});' +
      (report ?
      'function send(l,m){try{parent.postMessage({semlog:1,level:l,msg:String(m).slice(0,1500)},"*")}catch(_){}}' +
      'window.addEventListener("error",function(e){send("error",(e.message||"' + (EN ? 'Error' : 'Erreur') + '")+(e.lineno?" (' + (EN ? 'line' : 'ligne') + ' "+e.lineno+")":""))});' +
      'window.addEventListener("unhandledrejection",function(e){send("error","' + (EN ? 'Rejected promise: ' : 'Promesse rejetée : ') + '"+(e.reason&&e.reason.message||e.reason))});' +
      'var ce=console.error;console.error=function(){send("error",[].slice.call(arguments).join(" "));return ce.apply(console,arguments)};' +
      'var cl=console.log;console.log=function(){send("log",[].slice.call(arguments).map(function(a){try{return typeof a==="object"?JSON.stringify(a):a}catch(_){return a}}).join(" "));return cl.apply(console,arguments)};' +
      'var f=window.fetch;window.fetch=function(u,o){var m=(o&&o.method||"GET").toUpperCase();return f.apply(this,arguments).then(function(r){if(!r.ok)send("error","' + (EN ? 'The database refused ' : 'La base a refusé ') + '"+m+" "+String(u).replace(/^https:\\/\\/[^/]+/,"")+" → HTTP "+r.status+(r.status===401?"' + (EN ? ' (writing is not allowed at this place)' : ' (écriture non autorisée à cet endroit)') + '":""));else send("net",m+" "+String(u).replace(/^https:\\/\\/[^/]+/,"")+" → "+r.status);return r},function(e){send("error","' + (EN ? 'Network: ' : 'Réseau : ') + '"+m+" "+u+"' + (EN ? ' failed (' : ' a échoué (') + '"+e.message+")");throw e})};'
      : '') +
      '})();';
    return '<script>' + js + '<\/script>';
  }
  function withPrelude(html, report){
    var p = prelude(report), h = String(html || '');
    var m = /<head[^>]*>/i.exec(h) || /<html[^>]*>/i.exec(h);
    if (m) return h.slice(0, m.index + m[0].length) + p + h.slice(m.index + m[0].length);
    return p + h;
  }
  var SANDBOX = 'allow-scripts allow-forms allow-modals allow-popups';

  /* The idea cards: listed on index.html, and they prefill atelier.html. */
  var IDEAS_FR = [
    {t:'Livre d’or de la classe', who:'les étudiants et les visiteurs de la journée', f:['laisser un message signé d’un prénom','voir tous les messages, le plus récent en haut','mettre un ❤ sur un message, avec le compteur visible']},
    {t:'Boîte à idées du campus', who:'les étudiants de Swiss UMEF', f:['proposer une idée en une phrase, avec une catégorie','voter pour une idée (un vote par idée)','trier les idées par nombre de votes']},
    {t:'Petites annonces', who:'les étudiants qui vendent ou donnent des objets', f:['publier une annonce : objet, prix (ou « gratuit »), contact','filtrer par catégorie (livres, meubles, électronique, autre)','marquer une annonce comme « vendu »']},
    {t:'Covoiturage UMEF', who:'les étudiants qui viennent au Château d’Aïre', f:['proposer un trajet : départ, jour, heure, nombre de places','réserver une place (le nombre de places diminue)','voir les trajets du jour en premier']},
    {t:'Sondage en direct', who:'un enseignant et sa classe', f:['créer une question avec 2 à 5 réponses','voter depuis son téléphone','voir les résultats en barres, mis à jour en direct']},
    {t:'Quiz entre amis', who:'un groupe d’amis', f:['ajouter une question à choix multiple avec la bonne réponse','jouer : 5 questions tirées au hasard','enregistrer son score et afficher le classement']},
    {t:'Réservation de salle d’étude', who:'les étudiants qui révisent en groupe', f:['voir les créneaux d’une heure de 8h à 18h pour aujourd’hui et demain','réserver un créneau libre avec son prénom','annuler sa réservation']},
    {t:'Dépenses de colocation', who:'trois ou quatre colocataires', f:['ajouter une dépense : qui a payé, combien, pour quoi','voir le total payé par chacun','calculer qui doit combien à qui']}
  ];
  var IDEAS_EN = [
    {t:'Class guestbook', who:'students and visitors on the day', f:['leave a message signed with a first name','see all messages, newest at the top','give a message a ❤, with the count shown']},
    {t:'Campus ideas box', who:'Swiss UMEF students', f:['suggest an idea in one sentence, with a category','vote for an idea (one vote per idea)','sort ideas by number of votes']},
    {t:'Classifieds', who:'students selling or giving away things', f:['post an ad: item, price (or “free”), contact','filter by category (books, furniture, electronics, other)','mark an ad as “sold”']},
    {t:'UMEF car-pooling', who:'students travelling to the Château d’Aïre', f:['offer a ride: from, day, time, number of seats','book a seat (the seat count goes down)','show today’s rides first']},
    {t:'Live poll', who:'a teacher and the class', f:['create a question with 2 to 5 answers','vote from a phone','see the results as bars, updated live']},
    {t:'Quiz with friends', who:'a group of friends', f:['add a multiple-choice question with the right answer','play: 5 random questions','save the score and show the leaderboard']},
    {t:'Study-room booking', who:'students revising in groups', f:['see one-hour slots from 8:00 to 18:00 for today and tomorrow','book a free slot with a first name','cancel a booking']},
    {t:'Flat-share expenses', who:'three or four flatmates', f:['add an expense: who paid, how much, for what','see the total paid by each person','work out who owes how much to whom']}
  ];
  var IDEAS = EN ? IDEAS_EN : IDEAS_FR;

  window.Sem = { DB:DB, NS:NS, SITE:SITE, slug:slug, esc:esc, url:url, get:get, put:put, post:post,
    EN:EN, LOC:LOC, ls:ls, voter:voter, ago:ago, clean:clean, titleOf:titleOf, withPrelude:withPrelude, SANDBOX:SANDBOX, IDEAS:IDEAS,
    dataBase:function(team){ return DB + '/' + NS + '/data/' + team; } };
})();
