#!/usr/bin/env python3
"""MIA 506 · journée 2 · le jeu de diapositives pas à pas, en français.

Écrit trois fichiers à partir de la liste SLIDES ci-dessous (la seule source) :
  _private/journee2-slides.html           la source complète, avec les solutions (jamais publiée)
  journee2-slides-enseignant.html         la même, publique mais non liée (le bouton de la page y mène sur un appareil instructeur)
  journee2-slides.html                    sans les diapositives « Solution » (k-sol), liée depuis la page et le hub
Même gabarit et mêmes raccourcis que les diapositives de la journée 1 (← → espace · F · numéro + Entrée).
    python3 _build/j2_slides.py
"""
import html, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

CSS = """
@page{size:1280px 720px;margin:0}
*{box-sizing:border-box}html,body{margin:0;height:100%;background:#0b1820;font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;color:#17222d}
.stage{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.slide{width:1280px;height:720px;background:#fff;position:absolute;transform-origin:center center;display:none;flex-direction:column;padding:44px 64px 40px;overflow:hidden}
.slide.on{display:flex}
.top{display:flex;align-items:center;gap:12px;min-height:30px;margin-bottom:10px}
.step{font-size:15px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#176B87}
.tag{font-size:14px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:4px 14px;border-radius:99px;color:#fff}
.k-do .tag{background:#176B87}.k-hint .tag{background:#B7791F}.k-sol .tag{background:#B42318}.k-res .tag{background:#1D6B3A}.k-keep .tag{background:#17222d}
.k-sol{border-top:10px solid #B42318}.k-hint{border-top:10px solid #B7791F}.k-do{border-top:10px solid #176B87}.k-res{border-top:10px solid #1D6B3A}.k-keep{border-top:10px solid #17222d}.k-info{border-top:10px solid #9AA7B4}
h1{font-size:36px;line-height:1.18;margin:0 0 16px;color:#0f4c60;font-weight:800}
.body{flex:1;font-size:23px;line-height:1.42;min-height:0}
.body p{margin:0 0 12px}.body ul,.body ol{margin:0 0 12px;padding-left:34px}.body li{margin-bottom:9px}
code{font-family:Menlo,Consolas,monospace;font-size:.86em;background:#EEF2F6;padding:1px 6px;border-radius:5px}
pre{font-family:Menlo,Consolas,monospace;margin:0 0 12px;border-radius:10px;padding:14px 18px;white-space:pre-wrap;word-break:break-word}
pre.code{background:#0f1b24;color:#E6EDF3;font-size:17.5px;line-height:1.42}
pre.code.sm{font-size:14.6px;line-height:1.36}
pre.out{background:#EAF6EE;color:#12351f;border-left:6px solid #1D6B3A;font-size:17.5px;line-height:1.4}
table{border-collapse:collapse;width:100%;font-size:19.5px;line-height:1.32;margin:0 0 12px}
table.sm{font-size:17px}
th{background:#0f4c60;color:#fff;text-align:left;padding:7px 12px;font-weight:700}
td{border-bottom:1px solid #D5DCE4;padding:7px 12px;vertical-align:top}
.foot{position:absolute;left:64px;right:64px;bottom:14px;display:flex;justify-content:space-between;font-size:13px;color:#8593A1}
.k-part,.k-title{background:#0f4c60;color:#fff;justify-content:center}
.k-part h1,.k-title h1{color:#fff;font-size:54px;margin-bottom:18px}
.k-title h1{font-size:60px}
.pn{font-size:22px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8FD3E8;margin-bottom:14px}
.ps{font-size:26px;color:#D6EEF5;line-height:1.4}
.k-part .foot,.k-title .foot{color:#8FB9C6}
.bar{position:fixed;left:0;bottom:0;height:5px;background:#3FB6D6;z-index:5}
.help{position:fixed;right:12px;top:10px;color:#6f8794;font-size:12px;z-index:5}
@media print{html,body{height:auto;background:#fff}.stage{position:static;display:block}.slide{display:flex!important;position:relative;transform:none!important;page-break-after:always;break-after:page}.bar,.help{display:none}}
"""

JS = """
var s=[].slice.call(document.querySelectorAll('.slide')),i=0,buf='';
function fit(){var k=Math.min(innerWidth/1280,innerHeight/720);s.forEach(function(x){x.style.transform='scale('+k+')';});}
function go(n){i=Math.max(0,Math.min(s.length-1,n));s.forEach(function(x,j){x.classList.toggle('on',j===i);});document.getElementById('bar').style.width=((i+1)/s.length*100)+'%';try{history.replaceState(null,'','#'+(i+1));}catch(e){}}
addEventListener('resize',fit);
addEventListener('keydown',function(e){
  if(/^[0-9]$/.test(e.key)){buf+=e.key;return;}
  if(e.key==='Enter'&&buf){go(parseInt(buf,10)-1);buf='';return;}
  buf='';
  if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();go(i+1);}
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(i-1);}
  else if(e.key==='Home')go(0);else if(e.key==='End')go(s.length-1);
  else if(e.key==='f'||e.key==='F'){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen();}
});
addEventListener('click',function(e){if(e.clientX>innerWidth/3)go(i+1);else go(i-1);});
fit();go((parseInt(location.hash.slice(1),10)||1)-1);
"""

TAGS = {"do": "À vous", "hint": "Indice", "sol": "Solution", "res": "Résultat", "keep": "À retenir", "info": ""}


def S(kind, step, title, body):
    """One ordinary slide. body = HTML."""
    return {"k": kind, "step": step, "title": title, "body": body}


def PART(pn, title, ps):
    return {"k": "part", "pn": pn, "title": title, "ps": ps}


def E(s):
    return html.escape(s, quote=False)


def code(s, sm=False):
    return '<pre class="code' + (' sm' if sm else '') + '">' + E(s) + '</pre>'


def out(s):
    return '<pre class="out">' + E(s) + '</pre>'


SLIDES = [
    {"k": "title", "title": "Enregistrer le modèle dans un fichier, le servir sans le réentraîner, et chiffrer ce que cela coûte",
     "ps": "MIA 506 · Déploiement et pilotage des systèmes d’IA en production<br>Journée 2 · vendredi 27 novembre 2026"},
    S("info", "", "Le programme de la journée",
      '<table><tr><th>Bloc</th><th>Horaire</th><th>Ce que vous faites</th></tr>'
      '<tr><td>1</td><td>09h00–10h30</td><td>Vous enregistrez votre modèle de vendredi dans un fichier qui porte un numéro de version, vous le rechargez, vous tenez le registre de deux versions.</td></tr>'
      '<tr><td>2</td><td>10h45–12h15</td><td>Vous remplacez votre serveur par un service qui charge ce fichier, et vous mesurez les secondes pendant lesquelles il ne répond pas.</td></tr>'
      '<tr><td>3</td><td>13h30–15h00</td><td>Vous chiffrez trois façons de servir le même modèle avec les prix publiés, et vous écrivez la note de chiffrage.</td></tr>'
      '<tr><td>4</td><td>15h15–16h45</td><td>Vous faites la même chose pour votre projet ; trois systèmes qui ont échoué ; le quiz.</td></tr></table>'),
    S("do", "", "Pour commencer",
      '<ol><li>Ouvrez <b>janerikmeidell.com/UMEF/ia-production</b>, puis « Journée 2 ». Connectez-vous avec le même nom que vendredi.</li>'
      '<li>Deux comptes gratuits pour cet après-midi, si vous ne les avez pas : <b>GitHub</b> (github.com/signup) et <b>Render</b> (dashboard.render.com/register, « Sign up with GitHub », sans carte bancaire).</li>'
      '<li>Hugging Face demande depuis novembre un abonnement payant pour un Space Docker : le serveur d’aujourd’hui tourne sur Render. Si votre Space de vendredi existe encore, ouvrez son adresse dans un onglet : il doit répondre <code>"service": "jappo-fraude"</code>.</li></ol>'),
    S("info", "", "Ce qui ne va pas dans le serveur de vendredi",
      '<p>Il <b>réentraîne</b> votre modèle à chaque démarrage : il lit 24 000 opérations, entraîne, puis seulement répond.</p>'
      '<ul><li>Le démarrage est lent : c’était <code>duree_demarrage_s</code> dans <code>GET /</code>.</li>'
      '<li>Deux démarrages peuvent donner deux modèles différents, sans que personne le sache.</li>'
      '<li>Personne ne peut dire <b>quel</b> modèle répond : il n’a pas de nom.</li></ul>'
      '<p>La règle : on entraîne <b>une fois</b>, on enregistre le modèle dans un fichier qui porte une <b>version</b>, le service charge ce fichier. Ce fichier est un <b>artefact</b>.</p>'),
    PART("Bloc 1 · 09h00–10h30", "Enregistrer votre modèle dans un fichier qui porte une version", "Section 2.1 · étapes 1 à 5"),
    S("do", "Étape 1", "Chargez les données et découpez-les (code donné)",
      '<ol><li>Section 2.1, étape 1. Ne changez rien.</li><li><b>▶ Exécuter</b>. Le premier clic télécharge Python (environ 35 Mo), comme vendredi.</li></ol>'
      + out("19156 opérations pour entraîner, 4844 pour tester, 57 fraudes dans le test\nVersions : python 3.14.2 · scikit-learn 1.8.0 · pandas 3.0.2 · joblib 1.5.3")),
    S("do", "Étape 2", "Votre fonction preparer(), et rien d’autre",
      '<p>La fenêtre contient votre code de vendredi si vous l’avez écrit sur cet ordinateur, sinon la solution de référence.</p>'
      '<ul><li>Elle doit contenir <b>seulement</b> la fonction <code>preparer(d)</code> et ses <code>import</code>.</li>'
      '<li>Pas de ligne <code>X_train = preparer(train)</code> : le serveur n’aura pas les données.</li>'
      '<li>Exécutez. La page vérifie la fonction sur le fichier et sur une opération seule.</li></ul>'),
    S("do", "Étape 3", "Entraînez votre modèle et chronométrez",
      code('X_train, y_train = preparer(train), train["fraude"]\nX_test, y_test = preparer(test), test["fraude"]\n\nt0 = time.perf_counter()\n# ---- votre modèle de la journée 1 ----\nmodele = RandomForestClassifier(n_estimators=100, min_samples_leaf=5, class_weight="balanced", random_state=0)\nmodele.fit(X_train, y_train)\n# -------------------------------------\nDUREE_ENTRAINEMENT = time.perf_counter() - t0\nSEUIL_FINAL = 0.4')
      + '<p><code>DUREE_ENTRAINEMENT</code> est ce que votre serveur a payé à chaque démarrage vendredi.</p>'),
    S("res", "Étape 3", "Ce que vous devez voir",
      out("Entraîné en 3.4 s · RandomForestClassifier · seuil 0.4") + '<p>Dans le navigateur, la forêt prend trois à huit secondes ; la régression logistique, moins d’une.</p>'),
    S("do", "Étape 4", "Enregistrez l’artefact, rechargez-le, vérifiez, calculez l’empreinte",
      '<p>Un artefact = le modèle <b>et</b> ce qu’il faut pour le servir et le tracer : seuil, variables dans l’ordre, version, date, versions des bibliothèques. Remplacez les six <code>...</code> :</p>'
      '<ul><li>écrire le dictionnaire dans <code>FICHIER</code> ;</li><li>sa taille en ko, son SHA-256 ;</li><li>le relire, chronométré ;</li>'
      '<li>les probabilités du modèle rechargé sur <code>X_test</code>, et le plus grand écart avec le modèle en mémoire.</li></ul>'),
    S("hint", "Étape 4", "Indice : cinq fonctions",
      code('joblib.dump(artefact, FICHIER)                 # écrit\ncharge = joblib.load(FICHIER)                  # relit\nos.path.getsize(FICHIER) / 1000                # la taille en ko\nhashlib.sha256(open(FICHIER, "rb").read()).hexdigest()   # l\'empreinte\nfloat(np.abs(p_memoire - p_fichier).max())     # le plus grand écart')),
    S("sol", "Étape 4", "Solution",
      code('joblib.dump(artefact, FICHIER)\nTAILLE_KO = os.path.getsize(FICHIER) / 1000\nEMPREINTE = hashlib.sha256(open(FICHIER, "rb").read()).hexdigest()\n\nt0 = time.perf_counter()\ncharge = joblib.load(FICHIER)\nDUREE_CHARGEMENT = time.perf_counter() - t0\n\np_memoire = modele.predict_proba(X_test)[:, 1]\np_fichier = charge["modele"].predict_proba(X_test)[:, 1]\nECART_MAX = float(np.abs(p_memoire - p_fichier).max())', True)
      + out("Fichier modele-1.0.0.joblib : 3933 ko · empreinte d56d4d94c80c9366 …\nEntraîner : 3.4 s · charger : 0.012 s · écart maximal : 0.0")),
    S("keep", "Étape 4", "Ce qu’il faut retenir",
      '<ul><li>Charger un fichier prend quelques millisecondes ; entraîner prend des secondes. Le serveur de vendredi payait cela à chaque démarrage.</li>'
      '<li>La forêt pèse 4 Mo (cent arbres) ; la régression logistique, 2 ko.</li>'
      '<li>L’écart entre le modèle rechargé et le modèle en mémoire est exactement 0 : le fichier <b>est</b> le modèle.</li>'
      '<li>L’empreinte change dès qu’un octet change : deux fichiers de même empreinte sont le même modèle.</li></ul>'),
    S("do", "Étape 5", "Une seconde version, le registre, la promotion",
      '<ul><li>Un second modèle qui diffère par au moins une chose : ici la régression logistique, seuil 0,9.</li>'
      '<li><code>enregistrer()</code> écrit <code>modele-1.1.0.joblib</code> et rend l’entrée du registre : version, fichier, empreinte, date, seuil, fraudes bloquées, clients honnêtes bloqués, stade.</li>'
      '<li><code>promouvoir(version)</code> met <code>"production"</code> sur une version, <code>"archive"</code> sur les autres, et écrit <code>registre.json</code>.</li>'
      '<li>Remplacez les <code>...</code>, choisissez la version à promouvoir, exécutez.</li></ul>'),
    S("sol", "Étape 5", "Solution",
      code('    joblib.dump(art, fichier)\n    ...\n            "empreinte": hashlib.sha256(open(fichier, "rb").read()).hexdigest(),\n\ndef promouvoir(version):\n    for e in REGISTRE:\n        e["stade"] = "production" if e["version"] == version else "archive"\n    with open("registre.json", "w") as f:\n        json.dump(REGISTRE, f, indent=1)\n\npromouvoir("1.1.0")', True)
      + out("version                 modele  seuil  fraudes_bloquees  honnetes_bloques      stade\n  1.0.0 RandomForestClassifier    0.4                15                77    archive\n  1.1.0     LogisticRegression    0.9                14                77 production")),
    S("do", "Étape 5", "Écrivez quelle version vous mettez en production, et pourquoi",
      '<p>Dans le champ sous la fenêtre : ce qui change entre 1.0.0 et 1.1.0, les deux comptes de chacune sur la semaine de test, la taille de chaque fichier, et votre choix avec la raison.</p>'
      '<p>Les deux choix se défendent. Ce qui compte : la raison est écrite avec les nombres.</p>'
      '<p>Exemple : « 1.1.0 : une fraude de moins sur 57 (pas une différence sûre), un fichier deux mille fois plus petit, une réponse deux fois plus rapide, des poids que je peux expliquer. »</p>'),
    S("keep", "Étape 5", "Ce qu’il faut retenir",
      '<ul><li>Un <b>registre</b> dit quelles versions existent, ce que chacune vaut, et laquelle répond aux clients.</li>'
      '<li><b>Une seule</b> version en production, sinon la question « quel modèle répond ? » n’a plus de réponse.</li>'
      '<li>La page recalcule chaque compte et chaque empreinte à partir des fichiers : un registre écrit à la main est refusé.</li>'
      '<li>L’outil qui fait cela en entreprise s’appelle MLflow (Model Registry). Vous l’avez fait à la main pour en voir chaque pièce.</li></ul>'),
    PART("Bloc 2 · 10h45–12h15", "Remplacer votre serveur par un service qui charge le fichier", "Section 2.2 · étapes 6 à 9 · puis la mise en commun 2.3"),
    S("do", "Étape 6", "Écrivez predire_v2(), qui charge l’artefact de production",
      '<p>Cette fenêtre + votre étape 2 = le <code>modele.py</code> du nouveau serveur. Elle ne doit utiliser que ce que le serveur aura : les fichiers, <code>preparer()</code>, les bibliothèques.</p>'
      '<ul><li>Pas <code>modele</code>, pas <code>X_test</code>, pas <code>SEUIL_FINAL</code> : ces variables n’existent pas sur le serveur.</li>'
      '<li>Le seuil et les variables se lisent <b>dans l’artefact</b>.</li>'
      '<li>Si les colonnes préparées ne sont pas celles de l’artefact : une erreur, jamais une probabilité.</li>'
      '<li>La réponse porte la <b>version</b> qui a répondu.</li></ul>'),
    S("sol", "Étape 6", "Solution",
      code('    entree = [e for e in registre if e["stade"] == "production"][0]\n    return joblib.load(entree["fichier"])\n\nART = charger_production()\n\ndef predire_v2(operation):\n    manquants = [c for c in VARIABLES_BRUTES if c not in operation]\n    if manquants:\n        return {"erreur": "champs manquants : " + ", ".join(manquants), "version": ART["version"]}\n    X = preparer(pd.DataFrame([operation]))\n    if list(X.columns) != ART["variables"]:\n        return {"erreur": "variables inattendues : " + ", ".join(map(str, X.columns)), "version": ART["version"]}\n    p = float(ART["modele"].predict_proba(X)[0, 1])\n    return {"probabilite_fraude": round(p, 3),\n            "decision": "bloquer" if p >= ART["seuil"] else "accepter",\n            "version": ART["version"]}', True)
      + out("{'probabilite_fraude': 0.991, 'decision': 'bloquer', 'version': '1.1.0'}\n{'probabilite_fraude': 0.034, 'decision': 'accepter', 'version': '1.1.0'}\nTous les tests passent · version servie : 1.1.0")),
    S("do", "Étape 7", "La page exécute votre modele.py dans un espace vide",
      '<ol><li>Cliquez sur <b>Assembler et tester modele.py</b> : la page colle votre étape 2 et votre étape 6, affiche le fichier et l’exécute dans un espace <b>vide</b> : aucune variable du matin, seulement vos fichiers. C’est la situation du serveur.</li>'
      '<li>Rouge : le message nomme la variable du matin utilisée par erreur. Corrigez l’étape 2 ou 6, pas la fenêtre 7.</li>'
      '<li>Vert : <b>Télécharger service_v2.zip</b> : huit fichiers.</li></ol>'),
    S("info", "Étape 7", "Les huit fichiers de service_v2.zip",
      '<table class="sm"><tr><th>Fichier</th><th>Ce qu’il contient</th><th>Qui l’a écrit</th></tr>'
      '<tr><td><code>modele.py</code></td><td><code>preparer()</code> + le chargement de la production + <code>predire_v2()</code></td><td>Vous</td></tr>'
      '<tr><td><code>registre.json</code></td><td>Vos deux versions, une en production</td><td>Vous</td></tr>'
      '<tr><td><code>modele-1.0.0.joblib</code>, <code>modele-1.1.0.joblib</code></td><td>Les deux artefacts</td><td>Vous</td></tr>'
      '<tr><td><code>app.py</code> version 2</td><td>Importe <code>modele</code> (rien n’est entraîné) ; <code>GET /</code> dit la version servie, l’empreinte, la durée du démarrage</td><td>Donné</td></tr>'
      '<tr><td><code>requirements.txt</code></td><td>Les mêmes versions que la page, <b>plus</b> numpy 2.4.6 et joblib 1.5.3 : les versions qui ont écrit l’artefact</td><td>Donné</td></tr>'
      '<tr><td><code>Dockerfile</code>, <code>README.md</code></td><td>Inchangés</td><td>Donné</td></tr></table>'
      '<p>Plus de CSV : le serveur n’entraîne plus. Les données restent chez le data scientist.</p>'),
    S("do", "Étape 8", "Avant : l’état du serveur de la journée 1, s’il existe encore",
      '<ol><li>Collez l’adresse de votre Space de vendredi, <b>Lire l’état actuel (version 1)</b> : le champ « avant » note le modèle, « entraîne au démarrage », et la durée du démarrage.</li>'
      '<li>Plus de serveur de vendredi ? Cliquez sur « Je n’ai plus de serveur de la journée 1 » : le champ le note ; vous comparerez avec les logs de vendredi.</li>'
      '<li>Cette durée est ce que vous allez faire disparaître. Une mesure sans « avant » ne prouve rien.</li></ol>'),
    S("info", "Étape 9", "Le nouvel hébergeur : Render, depuis un dépôt GitHub",
      '<ul><li>Hugging Face demande depuis novembre 2026 un abonnement payant pour créer un Space Docker.</li>'
      '<li><b>Render</b> fait tourner gratuitement un petit service Python (512 Mo) à une adresse publique, sans carte bancaire.</li>'
      '<li>Il lit le code dans un <b>dépôt GitHub</b>, l’installe d’après <code>requirements.txt</code>, et le relance à chaque changement du dépôt.</li>'
      '<li>Un service gratuit s’endort après 15 minutes sans appel et met environ une minute à se réveiller.</li>'
      '<li>Votre Space de vendredi existe encore ? L’encadré de l’étape 9 dit comment le mettre à jour à la place.</li></ul>'),
    S("do", "Étape 9 · A", "Le dépôt GitHub",
      '<ol><li>Dézippez <code>service_v2.zip</code>.</li>'
      '<li><b>github.com/new</b> : nom <code>jappo-fraude</code>, <b>Public</b>, « Create repository ».</li>'
      '<li>Sur la page vide du dépôt : le lien « <b>uploading an existing file</b> », glissez les huit fichiers (pas le zip), « Commit changes ».</li>'
      '<li>Notez l’adresse : <code>https://github.com/VOTRE-NOM/jappo-fraude</code>.</li></ol>'),
    S("do", "Étape 9 · B et C", "Le service Render, et la mesure avant de cliquer sur Deploy",
      '<ol><li><b>dashboard.render.com</b> → New + → Web Service → « Public Git Repository » : collez l’adresse du dépôt, Connect.</li>'
      '<li>Name <code>jappo-fraude</code> · Language Python 3 · Branch main · Build Command <code>pip install -r requirements.txt</code> · Start Command <code>uvicorn app:app --host 0.0.0.0 --port $PORT</code> · Instance Type <b>Free</b>.</li>'
      '<li>Copiez l’adresse affichée (<code>https://jappo-fraude-xxxx.onrender.com</code>) dans la page, <b>Commencer la mesure</b>, <b>puis</b> « Deploy Web Service ».</li>'
      '<li>Suivez les Logs : pip installe (deux à quatre minutes), uvicorn démarre, <code>modele.py</code> charge l’artefact. La mesure s’arrête seule après trois réponses.</li></ol>'),
    S("res", "Étape 9", "Ce que vous devez voir",
      out('{"service":"jappo-fraude","version_service":"2","version_modele":"1.1.0",\n "empreinte":"…","duree_demarrage_s":0.7,"entrainement_au_demarrage":false,\n "versions":{"python":"3.13.…","scikit-learn":"1.8.0","pandas":"3.0.2","numpy":"2.4.6","joblib":"1.5.3"}}')
      + '<p>Deux à quatre minutes de points rouges entre Deploy et la première réponse. Puis un démarrage de moins d’une seconde au lieu de plusieurs.</p>'
      '<p>Le déploiement échoue ? Les Logs nomment la cause : un fichier oublié, une bibliothèque absente de <code>requirements.txt</code>, une commande de démarrage mal tapée.</p>'),
    S("do", "Étape 9 · D et E", "Changez de version sans toucher au code, puis mesurez le réveil",
      '<ol><li>Sur GitHub, ouvrez <code>registre.json</code>, le crayon : échangez <code>"production"</code> et <code>"archive"</code> entre les deux versions, « Commit changes ».</li>'
      '<li>Au moment du commit : <b>Commencer la mesure</b>. Render relance le service seul : le service a-t-il cessé de répondre ? Quand l’autre version a-t-elle pris le relais ?</li>'
      '<li>C’est une <b>promotion</b> dans le registre : le code n’a pas changé, le modèle servi, si.</li>'
      '<li>Après la pause de midi : « Lire le nouveau serveur ». Le temps de la première réponse est le <b>démarrage à froid</b> d’un service endormi.</li></ol>'),
    S("do", "Étape 9", "Écrivez ce que vous avez mesuré",
      '<p>Dans le champ « l’interruption », quatre points :</p>'
      '<ol><li>la durée du démarrage vendredi et aujourd’hui, en secondes ;</li><li>les secondes entre Deploy et la première réponse ; au changement de version, une interruption ou non, et combien de secondes ;</li>'
      '<li>ce qu’un client de Jàppo Pay aurait vécu pendant ces secondes, et pendant le réveil ;</li><li>comment vous feriez pour qu’un client ne s’aperçoive jamais d’une mise à jour ni d’un réveil : votre idée, avant qu’on la nomme.</li></ol>'),
    PART("Mise en commun · 15 min", "Ce que vous avez fait ce matin porte un nom", "Section 2.3"),
    S("keep", "2.3", "Six noms",
      '<table class="sm"><tr><th>Vous avez…</th><th>Le nom</th></tr>'
      '<tr><td>enregistré le modèle avec seuil, variables, version, date, versions des bibliothèques</td><td>un <b>artefact</b></td></tr>'
      '<tr><td>nommé les fichiers 1.0.0 et 1.1.0</td><td>le <b>versionnage sémantique</b> : majeure.mineure.correctif</td></tr>'
      '<tr><td>calculé le SHA-256</td><td>l’<b>empreinte</b></td></tr>'
      '<tr><td>tenu registre.json et promouvoir()</td><td>le <b>registre de modèles</b> et la <b>promotion</b> (MLflow Model Registry)</td></tr>'
      '<tr><td>épinglé joblib et numpy</td><td>la <b>reproductibilité</b> de l’environnement</td></tr>'
      '<tr><td>mesuré les secondes sans réponse, le relais d’une version à l’autre, le réveil</td><td>l’<b>interruption de service</b> et le <b>démarrage à froid</b> ; les remèdes : déploiement <b>bleu-vert</b> (ce que fait Render), <b>progressif</b> ; journée 3 : <i>canary</i></td></tr></table>'),
    S("keep", "2.3", "Le versionnage sémantique, en trois lignes",
      '<ul><li><b>Majeure</b> (2.0.0) : les entrées changent ; le système qui appelle doit s’adapter.</li>'
      '<li><b>Mineure</b> (1.1.0) : un nouveau modèle, les mêmes entrées.</li>'
      '<li><b>Correctif</b> (1.0.1) : une erreur réparée, rien d’autre.</li></ul>'
      '<p>La pire option : remplacer le fichier sans changer la version. Deux modèles différents porteraient le même nom.</p>'),
    S("keep", "2.3", "Une limite de ce matin",
      '<p>Votre registre est un fichier à côté du modèle, et c’est vous qui l’avez écrit.</p>'
      '<p>En entreprise, le registre est un service à part, avec des <b>droits</b> : un data scientist enregistre une version, une autre personne la promeut, le serveur de production ne lit que les versions promues.</p>'
      '<p>Votre fichier montre les pièces ; il ne montre pas les droits.</p>'),
    S("do", "2.3", "À vous · 5 min",
      '<p>Écrivez trois choses que vous avez faites à la main ce matin et qu’un outil de registre devrait faire à votre place, avec pour chacune ce qui se passe si une personne oublie de la faire.</p>'
      '<p>Exemple : « Calculer et vérifier l’empreinte : si on l’oublie, un fichier modifié peut être servi sans que personne le voie. »</p>'),
    PART("Bloc 3 · 13h30–15h00", "Chiffrer trois façons de servir le même modèle", "Section 2.4 · les grilles publiées · sept calculs · la note de chiffrage"),
    S("info", "2.4", "Les prix, consultés le 27 novembre 2026 (hors taxes, 1 $ = 0,91 €)",
      '<table class="sm"><tr><th>Option</th><th>Offre</th><th>Prix</th></tr>'
      '<tr><td><b>A · machine louée en permanence</b></td><td>Hugging Face Spaces « CPU Upgrade », 8 processeurs, 32 Go</td><td>0,03 $ par heure, à la minute</td></tr>'
      '<tr><td rowspan="3"><b>B · payé à l’appel</b> (serverless)</td><td rowspan="3">Google Cloud Run, à la requête, région de niveau 1</td><td>0,000024 $ par processeur-seconde</td></tr>'
      '<tr><td>0,0000025 $ par gibioctet-seconde</td></tr><tr><td>0,40 $ par million d’appels</td></tr>'
      '<tr><td><b>C · calcul de nuit par lots</b></td><td>La même machine A, allumée pour le calcul puis éteinte</td><td>0,03 $ par heure, à la minute</td></tr></table>'
      '<p>Sources sur la page : huggingface.co/docs/hub/spaces-gpus · cloud.google.com/run/pricing. Les prix changent : vérifiez avant de les réutiliser.</p>'),
    S("do", "2.4", "Jàppo Pay, les mêmes chiffres que vendredi",
      '<ul><li>1 800 000 opérations par jour = <b>54 000 000 par mois</b> ; 50 par seconde à la pointe.</li>'
      '<li>20 millisecondes de processeur par prédiction ; 0,5 gibioctet de mémoire pendant un appel.</li>'
      '<li>Aucune machine à plus de 50 % d’occupation à la pointe.</li>'
      '<li>La limite de crédit : 400 000 clients, 5 ms chacun, une fois par nuit.</li></ul>'
      '<p>Faites les sept calculs à la main sur la page, puis vérifiez chacun.</p>'),
    S("sol", "2.4", "Les sept réponses",
      '<table class="sm"><tr><th>#</th><th>Calcul</th><th>Réponse</th></tr>'
      '<tr><td>1</td><td>A : 0,03 × 24 × 30</td><td><b>21,60 $</b> par mois (19,66 €) ; une machine tient quatre fois la pointe</td></tr>'
      '<tr><td>2</td><td>B, processeur : 54 M × 0,020 s × 0,000024</td><td><b>25,92 $</b></td></tr>'
      '<tr><td>3</td><td>B, appels : 54 × 0,40</td><td><b>21,60 $</b></td></tr>'
      '<tr><td>4</td><td>B, total : + mémoire 540 000 GiB-s × 0,0000025 = 1,35</td><td><b>48,87 $</b> (44,47 €)</td></tr>'
      '<tr><td>5</td><td>B ÷ A</td><td><b>2,26</b></td></tr>'
      '<tr><td>6</td><td>Équilibre : 21,60 ÷ 0,000000905</td><td><b>23,9 millions</b> d’appels par mois (800 000 par jour)</td></tr>'
      '<tr><td>7</td><td>C : 34 min × 0,03 $/h × 30 nuits</td><td><b>0,51 $</b> (0,46 €)</td></tr></table>'),
    S("keep", "2.4", "Ce qu’il faut retenir",
      '<ul><li>Le paiement à l’appel gagne quand le trafic est faible ou irrégulier ; la machine louée gagne au-dessus d’un volume : ici 24 millions d’appels par mois.</li>'
      '<li>Dans l’option B, le simple comptage des appels (0,40 $ le million) coûte autant que toute la machine A.</li>'
      '<li>Le même modèle, par lots la nuit, coûte 42 fois moins qu’en temps réel : personne n’attend.</li>'
      '<li>Le calculateur de la page : changez le volume et les millisecondes, regardez quelle option gagne.</li></ul>'),
    S("do", "2.4", "La note de chiffrage · 25 min · seul·e",
      '<p>Une page pour le directeur financier, qui ne connaît ni Python ni les serveurs. Dans l’ordre :</p>'
      '<ol><li>ce que le service fait et pour combien d’opérations par mois ;</li><li>les trois options, une phrase et un coût mensuel en euros chacune ;</li>'
      '<li>votre recommandation et sa raison ;</li><li>deux risques que le prix ne montre pas.</li></ol>'
      '<p>Chaque nombre a son unité et sa source. Quinze lignes au plus. Elle entre dans votre rapport.</p>'),
    PART("Bloc 4 · 15h15–16h45", "Votre projet : l’artefact, le registre, le service, le canevas", "Section 2.5 · étapes 10 à 12 · puis 2.6 et le quiz"),
    S("do", "Étape 10", "Vos données dans la page",
      '<ol><li>Section 2.5, étape 10 : choisissez votre fichier CSV (moins de 20 Mo). Il est copié dans le disque de la page ; il ne quitte pas votre ordinateur.</li>'
      '<li>Notez le nom affiché : c’est <code>FICHIER_DONNEES</code> de l’étape 11.</li>'
      '<li>Pas de données prêtes ? Faites le bloc avec Jàppo Pay, et refaites-le chez vous avant la journée 3.</li></ol>'),
    S("do", "Étape 11", "Préparez, entraînez, enregistrez l’artefact 1.0.0 et le registre",
      '<p>Même recette que ce matin, sur vos données : <code>preparer()</code>, votre découpage, votre modèle, l’artefact, un registre à une entrée en production.</p>'
      '<p>Si votre modèle ne rend pas une probabilité : remplacez <code>seuil</code> par la règle de décision de votre cas, et dites-le dans le canevas.</p>'),
    S("do", "Étape 12", "Le fichier de votre serveur, dans un espace vide",
      '<ul><li><code>CHAMPS</code> : les champs bruts qu’une entrée de votre système contient.</li>'
      '<li>Votre <code>preparer()</code>, copiée.</li><li><code>charger_production()</code>, <code>predire_v2()</code> avec la version.</li>'
      '<li><code>MON_OPERATION</code> : une entrée d’exemple ; la page l’utilise pour tester.</li>'
      '<li>Vert → <b>service_projet.zip</b> → un <b>second</b> dépôt GitHub, un second service Render (mêmes commandes, Free) → collez son adresse.</li></ul>'),
    S("do", "2.5", "Le canevas de déploiement · 10 min",
      '<p>Une ligne chacun :</p><ol><li>la décision servie et qui la reçoit ;</li><li>le mode d’inférence et pourquoi ;</li><li>le volume par jour et la latence acceptable ;</li>'
      '<li>la version en production et sa mesure sur vos données de test ;</li><li>l’option d’hébergement (A, B, C) et son coût mensuel estimé ;</li><li>ce qui manque encore.</li></ol>'
      '<p>Vous le complétez aux journées 3 et 4 ; il finit dans votre rapport.</p>'),
    PART("Mise en commun · 25 min", "Trois systèmes qui ont échoué en production", "Section 2.6 · votre choix est enregistré, la classe compare"),
    S("do", "2.6", "Trois histoires vraies",
      '<ul><li><b>Thaïlande, 2018–2019</b> : un modèle qui lit des photos de rétine, excellent en laboratoire, refuse en clinique un grand nombre d’images prises dans de mauvaises conditions ; les infirmières le contournent (Beede et al., CHI 2020).</li>'
      '<li><b>Zillow Offers, 2021</b> : des maisons achetées au prix prévu par le modèle ; le marché change plus vite que lui ; arrêt le 2 novembre 2021, 304 M$ de dépréciation, un quart des postes.</li>'
      '<li><b>Amazon, 2018</b> : un tri de CV appris sur dix ans de candidatures surtout masculines note moins bien les CV de femmes ; abandonné avant usage (Reuters, 10 octobre 2018).</li></ul>'
      '<p>Pour chacun, sur la page : la pièce qui manquait le plus. Il n’y a pas une seule bonne réponse.</p>'),
    S("sol", "2.6", "Ce qu’on fait ressortir",
      '<ul><li><b>Thaïlande</b> : des données de test prises sur le terrain (la qualité réelle des images) ET un parcours conçu avec les infirmières. Journée 3 : le contrat de données.</li>'
      '<li><b>Zillow</b> : une surveillance de la dérive (prix réels contre prix prévus, chaque semaine) ET une limite humaine sur le montant engagé. Journée 4.</li>'
      '<li><b>Amazon</b> : un test par groupe avant la mise en service ET des données qui ressemblent aux recrutements voulus, pas aux recrutements passés. Journée 6.</li></ul>'),
    S("info", "2.6", "Avant la journée 3 · vendredi 4 décembre",
      '<ul><li>Laissez vos deux dépôts GitHub et vos deux services Render en place : Jàppo Pay version 2, et votre projet.</li>'
      '<li>Données de projet pas prêtes ? Refaites les étapes 10 à 12 chez vous.</li>'
      '<li>Relisez votre note de chiffrage : elle entre dans le rapport.</li></ul>'
      '<p>Journée 3 : le contrat de données de votre projet, des tests qui rejettent des données corrompues, lancés à chaque commit par GitHub Actions avant que Render ne redéploie.</p>'),
    S("do", "2.7", "Le quiz · 10 min",
      '<p>Huit questions sur ce que vous avez fait aujourd’hui. Auto-évaluation : il ne compte pas dans la note.</p>'
      '<p>L’enseignant le lance ; votre page se déverrouille seule. Répondez seul·e, sans assistant d’IA.</p>'),
    S("sol", "2.7", "Les réponses du quiz",
      '<ol><li>Personne ne sait quel modèle répond ; deux démarrages peuvent différer.</li><li>Le fichier du modèle entraîné, figé, avec ce qu’il faut pour le servir et le tracer.</li>'
      '<li>Identiques octet par octet.</li><li>1.1.0 : une mineure.</li><li>La question « quel modèle répond ? » n’a plus de réponse.</li>'
      '<li>Un artefact relu avec une autre version peut ne pas se charger, ou répondre autrement.</li><li>Le déploiement bleu-vert.</li>'
      '<li>Le paiement à l’appel : 0,91 $ contre 21,60 $.</li></ol>'),
]


def render(slides, title):
    n = len(slides)
    parts = []
    for i, sl in enumerate(slides):
        foot = '<div class="foot"><span>MIA 506 · Journée 2</span><span>' + str(i + 1) + ' / ' + str(n) + '</span></div>'
        if sl["k"] == "title":
            parts.append('<section class="slide k-title"><h1>' + sl["title"] + '</h1><div class="ps">' + sl["ps"] + '</div>' + foot + '</section>')
        elif sl["k"] == "part":
            parts.append('<section class="slide k-part"><div class="pn">' + sl["pn"] + '</div><h1>' + sl["title"] + '</h1><div class="ps">' + sl["ps"] + '</div>' + foot + '</section>')
        else:
            tag = TAGS[sl["k"]]
            parts.append('<section class="slide k-' + sl["k"] + '"><div class="top"><span class="step">' + sl["step"] + '</span>' +
                         ('<span class="tag">' + tag + '</span>' if tag else '') + '</div><h1>' + sl["title"] + '</h1><div class="body">' + sl["body"] + '</div>' + foot + '</section>')
    return ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">\n'
            '<title>' + title + '</title><style>' + CSS + '</style></head><body><div class="stage" id="stage">\n' + "\n".join(parts) +
            '\n</div><div class="bar" id="bar"></div><div class="help">← → ou espace · F plein écran · tapez un numéro puis Entrée</div>\n<script>' + JS + '</script></body></html>')


def build():
    full = render(SLIDES, "MIA 506 · Journée 2 · pas à pas (enseignant)")
    student = render([s for s in SLIDES if s["k"] != "sol"], "MIA 506 · Journée 2 · pas à pas")
    open(os.path.join(ROOT, "_private", "journee2-slides.html"), "w", encoding="utf-8").write(full)
    open(os.path.join(ROOT, "journee2-slides-enseignant.html"), "w", encoding="utf-8").write(full)
    open(os.path.join(ROOT, "journee2-slides.html"), "w", encoding="utf-8").write(student)
    print("slides:", len(SLIDES), "with solutions;", len([s for s in SLIDES if s["k"] != "sol"]), "for students")


if __name__ == "__main__":
    build()
