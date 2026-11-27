#!/usr/bin/env python3
"""MIA 506 · journée 1 · les réponses types à TOUTES les questions de la page (code, champs écrits,
calculs, quiz) → _private/j1-reponses-types.html + .pdf. Fichier de l'enseignant, jamais publié.

    python3 _build/j1_reponses_pdf.py          (Chrome headless pour le PDF)

Les nombres ont été recalculés le 27 novembre 2026 avec pandas 3.0.2 et scikit-learn 1.8.0 (les versions de
la page et du serveur) à partir de _private/j1_solution.py. Une forêt aléatoire donne des probabilités qui
varient à la troisième décimale d'une machine à l'autre : 0,533 ici, 0,544 dans le script ; une fraude de
plus ou de moins dans un compte est normal.
"""
import html, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT_HTML = os.path.join(ROOT, "_private", "j1-reponses-types.html")
OUT_PDF = os.path.join(ROOT, "_private", "j1-reponses-types.pdf")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page{size:A4;margin:16mm 15mm}
body{font:10.5pt/1.45 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#1c2430;margin:0}
h1{font-size:19pt;margin:0 0 2pt}
.sub{color:#5b6675;margin:0 0 10pt;font-size:9.5pt}
h2{font-size:13pt;color:#0f4c60;border-top:2pt solid #0f4c60;padding-top:6pt;margin:16pt 0 6pt;break-after:avoid}
h3{font-size:10.5pt;margin:10pt 0 3pt;color:#0f4c60;break-after:avoid}
p{margin:4pt 0}
.q{border-left:3pt solid #7a5cc0;background:#f3effb;padding:5pt 9pt;margin:8pt 0 4pt;break-inside:avoid;font-weight:600}
.a{border-left:3pt solid #1d6b3a;background:#eaf6ee;padding:5pt 9pt;margin:0 0 6pt;break-inside:avoid}
.a p{margin:3pt 0}
.note{border-left:3pt solid #d99a00;background:#fff6e0;padding:5pt 9pt;margin:6pt 0;break-inside:avoid}
pre{background:#f3f5f8;border:0.5pt solid #d0d6de;border-radius:4pt;padding:6pt 8pt;font:8.4pt/1.4 Menlo,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:4pt 0;break-inside:avoid}
pre.out{background:#fff;border-left:3pt solid #1d6b3a}
code{font:9pt Menlo,Consolas,monospace;background:#f3f5f8;padding:0 2pt}
table{border-collapse:collapse;width:100%;margin:5pt 0;font-size:9.3pt;break-inside:avoid}
th,td{border:0.5pt solid #c9d0d9;padding:3pt 5pt;text-align:left;vertical-align:top}
th{background:#eef5f7}
ul,ol{margin:3pt 0;padding-left:16pt}li{margin:1.5pt 0}
.toc{columns:2;font-size:9.5pt;margin:8pt 0 4pt}.toc div{break-inside:avoid}
"""

SUS = ('{"date_heure": "2026-11-20 03:12:00", "type_operation": "envoi", "montant_fcfa": 180000, "solde_avant_fcfa": 185000, '
       '"anciennete_compte_jours": 900, "nb_operations_24h": 6, "nouveau_beneficiaire": 1, "nouvel_appareil": 1}')

BODY = r"""
<h1>Journée 1 · les réponses types à toutes les questions de la page</h1>
<p class="sub">MIA 506 · Déploiement et pilotage des systèmes d’IA en production · fichier de l’enseignant, ne pas distribuer ·
fenêtres de code (étapes 1 à 9 et expérience 3), champs écrits (✍), les six calculs, le quiz. Nombres recalculés le 27 novembre 2026
avec pandas 3.0.2 et scikit-learn 1.8.0 sur <code>jappo_transactions.csv</code> (24 000 opérations, 317 fraudes). La solution complète
du code, étape par étape jusqu’au serveur, est dans <code>j1-solution-pas-a-pas.pdf</code> ; ici le code est donné en bref.</p>

<div class="note"><b>Comment lire ce document.</b> Encadré violet : la question telle qu’elle est posée sur la page. Encadré vert : une réponse
qui obtient le ✓ de la page (code) ou qu’un bon étudiant écrit (champs). Les champs écrits n’ont pas de réponse unique : la réponse type dit ce
qu’une bonne réponse contient. Les nombres d’un étudiant dépendent de ses variables et de son modèle ; les ordres de grandeur, non.</div>

<div class="toc">
<div>1.1 · Étapes 1 à 6 et le champ « trois signes »</div><div>1.2 · Étapes 7 à 9, le défi, « ce qui a le plus amélioré »</div>
<div>1.3 · « Ce qui manque à predire() »</div><div>1.4 · Étapes 10 à 12, « navigateur et serveur »</div>
<div>1.5 · Les quatre expériences et les six calculs</div><div>1.6 · Le rapport d’incident et le projet</div><div>1.7 · Le quiz, huit réponses</div>
</div>

<h2>Section 1.1 · Construire un modèle de fraude en Python</h2>

<div class="q">Étape 1 · Chargez les données et regardez-les (code donné).</div>
<div class="a"><pre class="out">24000 opérations, 10 colonnes</pre><p>Puis les huit premières lignes. Dix colonnes : <code>id_transaction, date_heure, type_operation</code> (envoi, paiement_marchand, retrait, depot), <code>montant_fcfa, solde_avant_fcfa, anciennete_compte_jours, nb_operations_24h, nouveau_beneficiaire, nouvel_appareil, fraude</code>. La deuxième ligne, TX000002, un retrait de 1 500 FCFA à 00 h 17, est une fraude.</p></div>

<div class="q">Étape 2 · Comptez les fraudes : <code>nb_fraudes</code> et <code>taux_fraude</code> en %.</div>
<div class="a"><pre>nb_fraudes = int(df["fraude"].sum())
taux_fraude = 100 * df["fraude"].mean()</pre><pre class="out">317 fraudes, soit 1.3208333333333333 % des opérations</pre>
<p>Erreur fréquente : 0,0132 (la part, pas le pourcentage) ; la page le dit et demande de multiplier par 100. À dire : un programme qui répond toujours « pas de fraude » a raison dans 98,68 % des cas et ne bloque rien ; le « taux de réussite » ne sert à rien ici.</p></div>

<div class="q">Étape 3 · <code>part_appareil_fraude</code> et <code>part_appareil_honnete</code>, en %.</div>
<div class="a"><pre>fraudes = df[df["fraude"] == 1]
honnetes = df[df["fraude"] == 0]
part_appareil_fraude = 100 * fraudes["nouvel_appareil"].mean()
part_appareil_honnete = 100 * honnetes["nouvel_appareil"].mean()</pre><pre class="out">23.0 2.7</pre>
<p>Les autres différences qu’on trouve en explorant (<code>df.groupby("fraude")[...].mean()</code>, <code>pd.crosstab(df["type_operation"], df["fraude"], normalize="columns")</code>) :</p>
<table><tr><th>Signe</th><th>Parmi les fraudes</th><th>Parmi les opérations honnêtes</th></tr>
<tr><td>Nouvel appareil</td><td>23,0 %</td><td>2,7 %</td></tr>
<tr><td>Nouveau bénéficiaire</td><td>39,7 %</td><td>7,8 %</td></tr>
<tr><td>Type « envoi »</td><td>82,6 %</td><td>45,5 %</td></tr>
<tr><td>Type « depot »</td><td>0,3 %</td><td>10,3 %</td></tr>
<tr><td>La nuit (avant 6 h)</td><td>5,0 %</td><td>2,8 %</td></tr>
<tr><td>Part du solde emportée (médiane)</td><td>0,24</td><td>0,16</td></tr>
<tr><td>Montant moyen</td><td>15 677 FCFA</td><td>13 922 FCFA</td></tr>
<tr><td>Ancienneté moyenne du compte</td><td>584 jours</td><td>721 jours</td></tr></table></div>

<div class="q">✍ <code>w1_signes</code> · Trois signes qui distinguent une fraude, avec les nombres.</div>
<div class="a"><p>« 1. Un nouvel appareil : 23,0 % des fraudes contre 2,7 % des opérations honnêtes, huit fois plus. 2. Un nouveau bénéficiaire : 39,7 % contre 7,8 %, cinq fois plus. 3. Le type d’opération : 82,6 % des fraudes sont des envois, contre 45,5 % des opérations honnêtes ; presque aucune fraude n’est un dépôt (0,3 % contre 10,3 %). » Une bonne réponse donne les deux pourcentages de chaque signe, pas un seul. Les signes faibles mais justes : la nuit (5,0 % contre 2,8 %), la part du solde (0,24 contre 0,16), un compte plus récent (584 contre 721 jours).</p></div>

<div class="q">Étape 4 · <code>train</code> (avant le 25 octobre) et <code>test</code> (du 25 au 30).</div>
<div class="a"><pre>COUPURE = pd.Timestamp("2026-10-25")
train = df[df["date_heure"] &lt; COUPURE]
test = df[df["date_heure"] &gt;= COUPURE]</pre><pre class="out">19156 opérations pour entraîner, 4844 pour tester, 57 fraudes dans le test</pre>
<p>260 fraudes dans l’entraînement. Pourquoi par date : en service, le modèle prévoit des jours qu’il n’a pas vus ; un découpage au hasard donnerait un résultat trop flatteur. 57 fraudes seulement en test : une fraude de plus ou de moins déplace le résultat de presque 2 points.</p></div>

<div class="q">Étape 5 · <code>preparer()</code> : au moins cinq variables numériques, sans la colonne <code>fraude</code>, qui marche sur une opération seule.</div>
<div class="a"><pre>def preparer(d):
    d = d.copy()
    d["date_heure"] = pd.to_datetime(d["date_heure"])
    X = pd.DataFrame(index=d.index)
    X["montant_fcfa"] = d["montant_fcfa"]
    X["nouvel_appareil"] = d["nouvel_appareil"]
    X["nouveau_beneficiaire"] = d["nouveau_beneficiaire"]
    X["nb_operations_24h"] = d["nb_operations_24h"]
    X["anciennete_compte_jours"] = d["anciennete_compte_jours"]
    X["nuit"] = (d["date_heure"].dt.hour &lt; 6).astype(int)
    X["part_du_solde"] = (d["montant_fcfa"] / d["solde_avant_fcfa"].clip(lower=1)).clip(upper=5)
    X["est_envoi"] = (d["type_operation"] == "envoi").astype(int)
    X["est_retrait"] = (d["type_operation"] == "retrait").astype(int)
    return X

X_train, y_train = preparer(train), train["fraude"]
X_test, y_test = preparer(test), test["fraude"]</pre><pre class="out">(19156, 9)</pre>
<p>Les trois refus de la page, et pourquoi : la colonne <code>fraude</code> dans X (fuite : parfait au test, inutile en service) ; <code>pd.get_dummies</code> (quatre colonnes sur le fichier, une seule sur une opération : le serveur enverrait au modèle des colonnes inconnues) ; une division par un solde de 0 (infini : <code>.clip(lower=1)</code>).</p></div>

<div class="q">Étape 6 · Choisissez un modèle et entraînez-le.</div>
<div class="a"><pre>from sklearn.ensemble import RandomForestClassifier
modele = RandomForestClassifier(n_estimators=100, min_samples_leaf=5, class_weight="balanced", random_state=0)
modele.fit(X_train, y_train)</pre>
<p>Variante acceptée : <code>Pipeline([("echelle", StandardScaler()), ("lr", LogisticRegression(class_weight="balanced", max_iter=1000))])</code>. La page accepte tout classifieur de scikit-learn qui a <code>predict_proba</code> et qui est entraîné (<code>.fit</code> est la ligne qu’on oublie). <code>class_weight="balanced"</code> : chaque fraude compte 76 fois plus qu’une opération honnête.</p></div>

<h2>Section 1.2 · Tester le modèle, l’améliorer, le tester comme un logiciel</h2>

<div class="q">Étape 7 · Au seuil 0,5 : <code>fraudes_bloquees</code>, <code>fraudes_passees</code>, <code>honnetes_bloques</code>.</div>
<div class="a"><pre>bloque = proba &gt;= SEUIL
fraudes_bloquees = int((bloque &amp; (y_test == 1)).sum())
fraudes_passees = int((~bloque &amp; (y_test == 1)).sum())
honnetes_bloques = int((bloque &amp; (y_test == 0)).sum())</pre>
<table><tr><th>Modèle (les neuf variables)</th><th>Fraudes bloquées</th><th>Fraudes passées</th><th>Clients honnêtes bloqués</th></tr>
<tr><td>Forêt aléatoire, 100 arbres</td><td>11</td><td>46</td><td>45</td></tr>
<tr><td>Régression logistique (Pipeline)</td><td>44</td><td>13</td><td>866</td></tr></table>
<p>Les deux modèles ne mettent pas leurs probabilités à la même échelle : d’où l’étape 8. Aussi juste : <code>fraudes_passees = int((y_test == 1).sum()) - fraudes_bloquees</code>.</p></div>

<div class="q">Étape 8 · Le défi : au plus 100 clients honnêtes bloqués, le plus de fraudes possible sur 57 ; écrire <code>SEUIL_FINAL</code>.</div>
<div class="a"><p>La table que la fenêtre imprime pour la forêt aléatoire (seuil · fraudes bloquées · honnêtes bloqués) : 0,30 · 22 · 154 — 0,40 · 15 · 77 — 0,50 · 11 · 45 — 0,60 · 10 · 28 — 0,70 · 4 ou 5 · 10 — 0,80 · 1 · 3 — 0,90 · 0 · 0. Le seuil le plus bas qui reste sous 100 : <code>SEUIL_FINAL = 0.4</code> → <b>15 fraudes sur 57, 77 clients honnêtes bloqués</b> (78 sur certaines machines).</p>
<table><tr><th>Modèle</th><th>Variables</th><th>Seuil</th><th>Fraudes bloquées / 57</th><th>Honnêtes bloqués</th></tr>
<tr><td>Forêt aléatoire, 100 arbres</td><td>les neuf</td><td>0,4</td><td>15</td><td>77</td></tr>
<tr><td>Forêt aléatoire, 300 arbres</td><td>les neuf</td><td>0,4</td><td>15</td><td>77</td></tr>
<tr><td>Régression logistique</td><td>les neuf</td><td>0,9</td><td>14</td><td>77</td></tr>
<tr><td>Régression logistique</td><td>les huit colonnes brutes + heure, nuit, part du solde, un 0/1 par type (12)</td><td>0,9</td><td>19</td><td>80</td></tr></table>
<p>Un résultat entre 12 et 22 est normal. Un résultat proche de 57 veut dire que la colonne <code>fraude</code> est entrée dans X d’une façon ou d’une autre. Un modèle plus gros n’aide pas : les 42 fraudes restantes ressemblent à des opérations honnêtes dans ces données.</p></div>

<div class="q">✍ <code>w1_pourquoi</code> · Ce qui a le plus amélioré votre résultat (une variable, le modèle ou le seuil), et de combien de fraudes.</div>
<div class="a"><p>« La variable qui a le plus aidé : la part du solde emportée (montant ÷ solde) : avec elle, au même nombre de clients honnêtes bloqués, je passe de 11 à 15 fraudes bloquées. Changer la forêt pour une régression logistique n’a rien apporté : 14 au lieu de 15. Le seuil ne crée rien : il déplace les fraudes bloquées et les clients bloqués ensemble (0,3 : 22 fraudes mais 154 clients, au-dessus de la limite). » Une bonne réponse compare deux essais avec le même nombre de clients bloqués, et dit le nombre de fraudes avant et après.</p></div>

<div class="q">Étape 9 · <code>predire(operation)</code> : <code>{"erreur": …}</code> s’il manque un champ, sinon <code>{"probabilite_fraude", "decision"}</code> ; au moins trois <code>assert</code>.</div>
<div class="a"><pre>def predire(operation):
    manquants = [c for c in VARIABLES_BRUTES if c not in operation]
    if manquants:
        return {"erreur": "champs manquants : " + ", ".join(manquants)}
    p = float(modele.predict_proba(preparer(pd.DataFrame([operation])))[0, 1])
    return {"probabilite_fraude": round(p, 3), "decision": "bloquer" if p &gt;= SEUIL_FINAL else "accepter"}

assert predire(suspecte)["decision"] == "bloquer"
assert predire(ordinaire)["decision"] == "accepter"
assert "erreur" in predire({"type_operation": "envoi"})
assert "date_heure" in predire({"type_operation": "envoi"})["erreur"]
assert 0 &lt;= predire(suspecte)["probabilite_fraude"] &lt;= 1
assert predire(dict(ordinaire, solde_avant_fcfa=0))["decision"] in ("bloquer", "accepter")
assert predire(dict(suspecte, montant_fcfa=10_000_000))["decision"] == "bloquer"</pre>
<pre class="out">{'probabilite_fraude': 0.533, 'decision': 'bloquer'}      (forêt ; régression logistique : 0.991)
{'probabilite_fraude': 0.0, 'decision': 'accepter'}        (forêt ; régression logistique : 0.050)</pre>
<p>La page refuse : une fonction qui plante sur un champ manquant ; un nombre numpy non converti par <code>float()</code> (le serveur ne saura pas l’écrire en JSON) ; une décision qui ne suit pas <code>SEUIL_FINAL</code>.</p></div>

<h2>Section 1.3 · Ce que vous avez construit, et ce qui lui manque</h2>
<div class="q">✍ <code>w1_manque</code> · Trois choses qui manquent pour que le système de paiement puisse appeler <code>predire()</code> à chaque opération, jour et nuit.</div>
<div class="a"><p>« 1. Elle tourne dans mon navigateur : si je ferme la page, elle n’existe plus ; il faut une machine allumée en permanence, à une adresse. 2. Rien ne vérifie ce qu’elle reçoit : un montant en texte la fait planter, un montant en milliers passe sans erreur. 3. Personne ne saura si elle tombe ou si elle se trompe : il n’y a ni alerte ni journal. » Autres réponses justes : elle réentraîne le modèle à chaque démarrage (lent, et le résultat peut changer) ; elle ne garde pas de trace de ses réponses ; elle ne porte pas de numéro de version ; elle ne tient pas plusieurs appels en même temps ; personne d’autre que moi n’a le droit de l’appeler (pas d’authentification). Cette liste est le programme de l’après-midi et des journées 2 à 4.</p></div>

<h2>Section 1.4 · Mettre votre modèle sur un vrai serveur</h2>
<div class="q">Étape 10 · Téléchargez votre service (six fichiers).</div>
<div class="a"><p><code>modele.py</code> (vos étapes 1 à 9), <code>jappo_transactions.csv</code>, <code>app.py</code> (FastAPI : <code>GET /</code> et <code>POST /predire</code>), <code>requirements.txt</code> (fastapi 0.115.6, uvicorn 0.34.0, scikit-learn 1.8.0, pandas 3.0.2), <code>Dockerfile</code> (Python 3.12, installer, copier, lancer uvicorn sur 7860), <code>README.md</code> (sdk: docker, app_port: 7860). Le bouton refuse si une étape du matin n’est pas vérifiée.</p></div>
<div class="q">Étape 11 · Déposez les six fichiers dans un dépôt GitHub, puis créez le service sur Render (depuis le 27 novembre 2026 ; Hugging Face demande un abonnement pour un Space Docker).</div>
<div class="a"><p><b>A</b> github.com/new → nom <code>jappo-fraude</code>, Public, Create repository → « uploading an existing file » → les six fichiers (pas le zip) → Commit changes → adresse <code>https://github.com/VOTRE-NOM/jappo-fraude</code>. <b>B</b> dashboard.render.com → New + → Web Service → Public Git Repository (coller l’adresse) → Name <code>jappo-fraude</code> · Language Python 3 · Branch main · Region Frankfurt · Build Command <code>pip install -r requirements.txt</code> · Start Command <code>uvicorn app:app --host 0.0.0.0 --port $PORT</code> · Instance Type Free → Deploy Web Service. Logs : pip (deux à quatre minutes), uvicorn, puis l’entraînement et les <code>assert</code> ; « Your service is live ». Adresse : <code>https://jappo-fraude-xxxx.onrender.com</code>. Pannes fréquentes : un fichier oublié dans le dépôt ; un <code>assert</code> qui échoue (le test a fait son travail) ; une bibliothèque importée le matin et absente de <code>requirements.txt</code> (matplotlib) ; la commande de démarrage mal tapée. Un service gratuit s’endort après 15 minutes : le premier appel attend une minute.</p></div>
<div class="q">Étape 12 · <code>w1_url</code> l’adresse ; puis ✍ <code>w1_ecart</code> : les deux probabilités (navigateur, serveur), le temps de calcul du serveur, le temps total mesuré par la page, et d’où vient la différence.</div>
<div class="a"><p>« Navigateur : 0,533. Serveur : 0,533 (la même, ou un écart à la troisième décimale : même code, mêmes versions, un autre processeur). Temps de calcul sur le serveur (<code>temps_calcul_ms</code>) : 3 à 10 ms. Temps total mesuré par la page : 80 à 400 ms. La différence est le trajet sur le réseau entre la salle et le centre de données (aller et retour), plus l’attente dans la file du serveur s’il traite déjà une autre opération, plus le temps du navigateur pour préparer et lire la réponse. » Le point à faire : la latence vue par le client est bien plus que le temps de calcul du modèle.</p></div>

<h2>Section 1.5 · Casser le serveur exprès</h2>
<div class="q">Expérience 1 · ✍ <code>w1_charge</code> : le temps médian à 1 et à 50 en parallèle, le nombre de réponses par seconde que le serveur ne dépasse pas, et pourquoi le temps monte alors que le serveur calcule toujours aussi vite.</div>
<div class="a"><p>Mesures de référence sur un serveur local (sans réseau) : 4 ms à 1 en parallèle, 16 ms à 5, 66 ms à 20, environ 300 réponses par seconde quel que soit le parallélisme. Sur Hugging Face, chaque chiffre est plus haut à cause du réseau : attendez-vous à quelques centaines de millisecondes à 1, et à plusieurs secondes de médiane à 50. Réponse type : « À 1 : 210 ms. À 50 : 4 800 ms. Le serveur ne dépasse pas environ 12 réponses par seconde. Le temps monte parce que le serveur traite une opération à la fois : chaque opération attend dans une file que les précédentes soient finies. Le calcul lui-même dure toujours 5 ms ; ce qui s’allonge est l’attente. » Ce qui compte : les réponses par seconde plafonnent (c’est la capacité), la médiane monte à peu près en proportion du parallélisme, et l’explication nomme la file d’attente.</p></div>
<div class="q">Expérience 2 · ✍ <code>w1_entrees</code> : ce que le serveur a répondu aux quatre opérations mal formées, puis les vérifications à ajouter et ce que <code>predire()</code> devrait répondre.</div>
<div class="a"><table><tr><th>Opération envoyée</th><th>Réponse (solution de référence)</th><th>Ce que cela montre</th></tr>
<tr><td>Il manque <code>montant_fcfa</code></td><td>Code 200, <code>{"erreur": "champs manquants : montant_fcfa"}</code></td><td>La vérification de l’étape 9 fonctionne</td></tr>
<tr><td>Le montant est le texte "25 000"</td><td>Code 500, <code>TypeError</code> (ou <code>ValueError</code>) venant de pandas</td><td>Le code a planté : le service doit vérifier le type et répondre clairement</td></tr>
<tr><td>Le montant est 180 au lieu de 180 000</td><td>Code 200, aucune erreur. Forêt : 0,40, « bloquer » devient « accepter » tout juste ; régression logistique : 0,992, toujours « bloquer »</td><td>Le plus dangereux : calcul sur un montant mille fois trop petit, personne n’est prévenu. Seule une règle sur les valeurs plausibles, ou la surveillance, l’attrape</td></tr>
<tr><td>Le type est "virement"</td><td>Code 200, aucune erreur. Forêt : 0,28, « accepter » ; régression logistique : 0,843, « accepter » là où elle disait « bloquer »</td><td>Le modèle le traite en silence comme « ni envoi ni retrait »</td></tr></table>
<p>Vérifications à ajouter : le montant et le solde sont des nombres, positifs, dans une plage plausible (par exemple 100 à 5 000 000 FCFA) ; le type d’opération est l’une des quatre valeurs connues ; les 0/1 valent 0 ou 1 ; la date se lit ; l’ancienneté et le nombre d’opérations sont des entiers positifs. Quand une vérification échoue : rendre <code>{"erreur": "…"}</code> qui nomme le champ et la valeur reçue, et compter l’événement pour qu’une alerte parte si cela se répète. Jamais calculer sur une valeur douteuse.</p></div>
<div class="q">Expérience 3 · Le même modèle sur 100 000 opérations d’un coup, puis une à la fois (code donné).</div>
<div class="a"><pre class="out">D'un coup      : 0.2 à 0.6 s pour 100 000 opérations, soit 0.002 à 0.006 ms par opération
Une à la fois  : 3 à 8 ms par opération
Rapport        : 500 à 3000 fois plus de temps par opération, une à la fois</pre><p>Par lots, le coût fixe d’un appel (préparer les colonnes, appeler le modèle) est payé une fois pour 100 000 lignes. Une à la fois, il est payé à chaque opération. C’est pourquoi le calcul par lots est presque toujours le moins cher, et pourquoi on ne choisit le temps réel que quand la décision ne peut pas attendre.</p></div>
<div class="q">Expérience 4 · Toute la classe sur le serveur de l’enseignant.</div>
<div class="a"><p>Onze étudiants × 20 en parallèle = 220 opérations au même moment sur un serveur qui en traite une à la fois. Attendu : une médiane plusieurs fois plus haute que lors du test seul·e à 20, des erreurs ou des réponses manquantes possibles (délai dépassé), des réponses par seconde par étudiant très faibles. Même capacité totale, partagée entre onze.</p></div>
<div class="q">Les six calculs (Jàppo Pay, fictif : 1 800 000 opérations par jour, 10 % à l’heure de pointe, 20 ms par prédiction, 50 % d’occupation au plus, 0,05 € par heure commencée ; 400 000 clients la nuit à 5 ms).</div>
<div class="a"><table><tr><th>#</th><th>Question</th><th>Réponse</th><th>Calcul</th></tr>
<tr><td>1</td><td>Opérations par seconde à l’heure la plus chargée</td><td><b>50 par seconde</b></td><td>1 800 000 × 10 % = 180 000 par heure ; ÷ 3 600 = 50</td></tr>
<tr><td>2</td><td>Capacité d’une machine à un cœur, à 100 %</td><td><b>50 par seconde</b></td><td>1 ÷ 0,020 s</td></tr>
<tr><td>3</td><td>Nombre de machines (50 % au plus)</td><td><b>2 machines</b></td><td>25 par seconde chacune ; 50 ÷ 25</td></tr>
<tr><td>4</td><td>Coût mensuel du contrôle de fraude</td><td><b>72 €</b></td><td>2 × 24 h × 30 jours × 0,05 €</td></tr>
<tr><td>5</td><td>Durée du calcul de nuit, une machine</td><td><b>33,3 minutes</b></td><td>400 000 × 0,005 s = 2 000 s</td></tr>
<tr><td>6</td><td>Coût mensuel du calcul de nuit</td><td><b>1,50 €</b></td><td>une heure commencée × 30 nuits × 0,05 € ; 48 fois moins que le temps réel</td></tr></table></div>

<h2>Section 1.6 · Le rapport d’incident, les noms, votre projet</h2>
<div class="q">✍ <code>w1_incident</code> · Le rapport d’incident en quatre points : ce qui a cassé, comment vous l’avez vu, ce qu’un client aurait subi, la mesure ou l’alerte qui aurait prévenu quelqu’un et qui la recevrait.</div>
<div class="a"><p>« 1. À 50 opérations en parallèle, le temps de réponse médian est passé de 210 ms à 4 800 ms, et le serveur a plafonné à 12 réponses par seconde ; de plus, un montant envoyé en texte a provoqué une erreur 500. 2. Je l’ai vu dans le tableau du test de charge et dans la réponse du bouton « montant en texte » ; rien ne m’aurait prévenu si je n’avais pas regardé. 3. Un client de Jàppo Pay aurait attendu près de cinq secondes devant la caisse du commerçant, et pour le montant en texte, son paiement aurait été refusé sans explication. 4. Une alerte quand le 95e centile du temps de réponse dépasse 500 ms pendant cinq minutes, ou quand les erreurs 500 dépassent 1 % des appels sur cinq minutes, envoyée à l’ingénieur de garde par téléphone, jour et nuit ; le lendemain matin, un résumé au responsable du produit. » Une bonne réponse a des nombres aux points 1 et 4, et un destinataire nommé par son rôle avec l’heure à laquelle il doit être joignable.</p></div>
<div class="q">✍ <code>w1_projet</code> · Le cas en une phrase, la décision servie, où trouver les données.</div>
<div class="a"><p>Exemples d’une bonne réponse : « Je trie automatiquement les réclamations des clients d’un opérateur télécom pour décider quel service traite chacune ; données : un jeu public de tickets de support en français (lien), complété par des réclamations que je simule. » · « Je prévois la demande d’électricité d’une ville heure par heure pour décider la veille combien de production réserver ; données : les relevés horaires publics d’un gestionnaire de réseau (lien). » · « Je donne un score de risque à une demande de crédit par paiement mobile pour décider d’accorder ou non un prêt de moins de 50 000 FCFA ; données : simulées à partir des opérations de Jàppo Pay et d’un historique de remboursement que je génère. » Il faut : un cas, une décision explicite, une source de données nommée (lien ou simulation). Deux étudiants ne prennent pas le même cas.</p></div>

<h2>Section 1.7 · Le quiz, huit questions</h2>
<div class="a"><table><tr><th>#</th><th>Question (en bref)</th><th>Bonne réponse</th><th>Pourquoi</th></tr>
<tr><td>1</td><td>Pourquoi découper par date, pas au hasard ?</td><td>2e option : en service le modèle prévoit des jours qu’il n’a pas vus ; au hasard, le résultat serait trop flatteur</td><td>Le test doit ressembler à l’usage : prévoir l’avenir à partir du passé</td></tr>
<tr><td>2</td><td>La colonne « fraude » est dans X par erreur</td><td>4e : parfait au test, inutile en service</td><td>Fuite de données : la réponse est parmi les entrées</td></tr>
<tr><td>3</td><td>Le seuil baisse de 0,9 à 0,5</td><td>1re : plus de fraudes bloquées et plus de clients honnêtes bloqués</td><td>Un seuil plus bas bloque davantage, des deux côtés</td></tr>
<tr><td>4</td><td>« Nuit » = avant 8 h sur le serveur, avant 6 h à l’entraînement</td><td>3e : un décalage entre entraînement et service</td><td>Une seule <code>preparer()</code> aux deux endroits l’évite</td></tr>
<tr><td>5</td><td>100 requêtes/s, 40/s par machine, 50 % au plus</td><td>3e : 5 machines</td><td>20 par seconde par machine à 50 % ; 100 ÷ 20</td></tr>
<tr><td>6</td><td>Code 500 sur le montant "25 000"</td><td>1re : vérifier chaque champ et refuser avec un message qui nomme le champ</td><td>Le contrat d’entrée</td></tr>
<tr><td>7</td><td>Médiane qui monte à 50 en parallèle</td><td>4e : chaque opération attend les précédentes</td><td>Le calcul ne ralentit pas ; l’attente dans la file s’ajoute</td></tr>
<tr><td>8</td><td>400 000 limites de crédit chaque nuit</td><td>2e : par lots</td><td>Personne n’attend la réponse à la seconde</td></tr></table>
<p>Lancer le quiz : sur l’appareil de l’enseignant, la section 1.7 affiche « Lancer le quiz pour la classe ». Auto-évaluation, ne compte pas dans la note.</p></div>
"""


def build():
    doc = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>MIA 506 · Journée 1 · Réponses types</title>'
           '<style>' + CSS + '</style></head><body>' + BODY + '</body></html>')
    open(OUT_HTML, "w", encoding="utf-8").write(doc)
    print("written", OUT_HTML)
    if os.path.exists(CHROME):
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer", "--print-to-pdf=" + OUT_PDF,
                        "file://" + OUT_HTML], check=True, capture_output=True)
        print("written", OUT_PDF, os.path.getsize(OUT_PDF), "bytes")
    else:
        print("Chrome not found: open the HTML and print it to PDF", file=sys.stderr)


if __name__ == "__main__":
    build()
