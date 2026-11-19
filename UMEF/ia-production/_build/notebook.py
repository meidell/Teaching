"""MIA 506 · journée 1 · writes files/j1_modele.ipynb (French).

    python3 _build/notebook.py            write the notebook
    python3 _build/notebook.py --run PY   also execute a copy with the local
                                          CSV and kernel PY, print the outputs
                                          (the numbers checked on journee1.html)

Students open it in Colab from GitHub:
https://colab.research.google.com/github/meidell/Teaching/blob/main/UMEF/ia-production/files/j1_modele.ipynb
(works once pushed). The CSV is read from the live site.
"""
import json, os, sys, subprocess, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "files", "j1_modele.ipynb")
URL = "https://janerikmeidell.com/UMEF/ia-production/files/jappo_transactions.csv"

cells = []
def md(s): cells.append({"cell_type": "markdown", "metadata": {}, "source": s.strip("\n")})
def code(s): cells.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": s.strip("\n")})

md("""
# Journée 1 · Du modèle au fichier que l’on met en production

**MIA 506 · Déploiement et pilotage des systèmes d’IA en production · Swiss UMEF**

Ce notebook entraîne un modèle qui repère les **transactions frauduleuses** d’un opérateur de paiement mobile, puis il en fait **un fichier** que l’on peut recharger ailleurs et interroger avec une fonction. Ce fichier est celui que vous mettrez en ligne à la journée 2 : chaque étape d’aujourd’hui prépare ce passage.

**Les données.** Jàppo Pay est un opérateur de paiement mobile **fictif**. Les montants sont en francs CFA (1 € = 655,957 FCFA). Le fichier contient 24 000 opérations simulées du 1er au 30 octobre 2026 : envois entre particuliers, paiements chez des commerçants, retraits et dépôts d’espèces chez des agents. La colonne `fraude` vaut 1 quand l’opération a été faite par un fraudeur qui a pris le contrôle du compte (par exemple après avoir fait dupliquer la carte SIM de la victime).

**Comment travailler.** Exécutez les cellules dans l’ordre, une par une (Maj + Entrée). Quand une cellule affiche un nombre marqué ➜, recopiez-le dans la page de la journée 1, section 1.9. Rien à installer : Colab a déjà toutes les bibliothèques.
""")

md("## Étape 1 · Charger les données")
code(f"""
import pandas as pd

URL = "{URL}"
df = pd.read_csv(URL, parse_dates=["date_heure"])
print(df.shape[0], "opérations,", df.shape[1], "colonnes")
print("➜ Taux de fraude sur le mois :", round(100 * df["fraude"].mean(), 2), "%")
df.head()
""")

md("""
## Étape 2 · Découper dans le temps, pas au hasard

En production, le modèle prédit **l’avenir** à partir du **passé**. On l’entraîne donc sur les opérations du 1er au 24 octobre et on le teste sur celles du 25 au 30 octobre, qu’il n’a jamais vues. Un découpage au hasard mélangerait des jours du futur dans l’entraînement et donnerait un score trop optimiste.
""")
code("""
COUPURE = pd.Timestamp("2026-10-25")
train = df[df["date_heure"] < COUPURE]
test  = df[df["date_heure"] >= COUPURE]
print("Entraînement :", len(train), "opérations,", int(train["fraude"].sum()), "fraudes")
print("➜ Test       :", len(test),  "opérations,", int(test["fraude"].sum()),  "fraudes")
""")

md("""
## Étape 3 · Préparer les variables avec UNE fonction

Le modèle n’utilise pas les colonnes brutes telles quelles. On calcule trois variables : l’**heure** de l’opération, si elle a lieu **la nuit** (avant 6 h), et la **part du solde** que l’opération emporte (montant ÷ solde avant l’opération).

Ce calcul est écrit **une seule fois**, dans la fonction `preparer()`. Le service de la journée 2 appellera exactement la même fonction. Si le service recalculait ces variables autrement (une autre définition de « la nuit », par exemple), le modèle recevrait en production des valeurs différentes de celles qu’il a apprises — c’est le **décalage entre entraînement et service**, l’une des pannes les plus fréquentes.
""")
code("""
import numpy as np

NUMERIQUES = ["montant_fcfa", "solde_avant_fcfa", "anciennete_compte_jours", "nb_operations_24h",
              "nouveau_beneficiaire", "nouvel_appareil", "heure", "nuit", "part_du_solde"]
CATEGORIELLES = ["type_operation"]
VARIABLES = NUMERIQUES + CATEGORIELLES

def preparer(d):
    d = d.copy()
    d["date_heure"] = pd.to_datetime(d["date_heure"])
    d["heure"] = d["date_heure"].dt.hour
    d["nuit"] = (d["heure"] < 6).astype(int)
    d["part_du_solde"] = (d["montant_fcfa"] / d["solde_avant_fcfa"].clip(lower=1)).clip(upper=5)
    return d[VARIABLES]

X_train, y_train = preparer(train), train["fraude"]
X_test,  y_test  = preparer(test),  test["fraude"]
X_train.head()
""")

md("""
## Étape 4 · Un pipeline : la préparation et le modèle dans le même objet

Le modèle est une **régression logistique** : elle donne pour chaque opération une probabilité de fraude entre 0 et 1. Avant elle, deux transformations : les variables numériques sont mises à la même échelle (`StandardScaler`), et le type d’opération devient quatre colonnes de 0 et de 1 (`OneHotEncoder`).

On met les trois dans **un seul objet**, un `Pipeline`. C’est cet objet entier que l’on sauvegardera : sans lui, il faudrait reproduire la mise à l’échelle à la main dans le service, avec les moyennes exactes de l’entraînement. `class_weight="balanced"` dit au modèle de compter davantage les rares fraudes, sans quoi il apprendrait que « jamais de fraude » est presque toujours juste.
""")
code("""
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

modele = Pipeline([
    ("preparation", ColumnTransformer([
        ("num", StandardScaler(), NUMERIQUES),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORIELLES),
    ])),
    ("classifieur", LogisticRegression(class_weight="balanced", max_iter=2000)),
])
modele.fit(X_train, y_train)
print("Modèle entraîné.")
""")

md("""
## Étape 5 · Évaluer sur la semaine de test

Le modèle bloque une opération quand sa probabilité de fraude dépasse le **seuil** (0,5 ici). Deux mesures comptent :

- le **rappel** : sur 100 vraies fraudes, combien le modèle en bloque ;
- la **précision** : sur 100 opérations bloquées, combien sont vraiment des fraudes. Les autres sont des clients honnêtes bloqués à tort.

L’**AUC** résume la qualité du classement sur tous les seuils à la fois : 0,5 = au hasard, 1 = parfait.
""")
code("""
from sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score

SEUIL = 0.5
proba = modele.predict_proba(X_test)[:, 1]
bloque = (proba >= SEUIL).astype(int)
vn, fp, fn, vp = confusion_matrix(y_test, bloque).ravel()
print("Fraudes bloquées (vrais positifs)      :", vp)
print("Fraudes passées (faux négatifs)        :", fn)
print("Clients honnêtes bloqués (faux positifs):", fp)
print("➜ Rappel    :", round(recall_score(y_test, bloque), 2))
print("➜ Précision :", round(precision_score(y_test, bloque), 2))
print("➜ AUC       :", round(roc_auc_score(y_test, proba), 3))
""")

md("""
## Étape 5 bis · Le seuil est une décision d’entreprise

Au seuil de 0,5, le modèle bloque une grande partie des opérations honnêtes : chaque client bloqué à tort appelle le service client ou part chez un concurrent. Le tableau montre, pour quatre seuils, combien d’opérations seraient bloquées sur la semaine de test, et ce que l’on gagne et perd. Le seuil se choisit avec le métier (le coût d’une fraude passée contre le coût d’un client bloqué), pas par défaut.
""")
code("""
lignes = []
for s in [0.5, 0.7, 0.9, 0.95]:
    b = (proba >= s).astype(int)
    lignes.append({"seuil": s, "operations_bloquees": int(b.sum()),
                   "fraudes_bloquees": int(((b == 1) & (y_test == 1)).sum()),
                   "honnetes_bloques": int(((b == 1) & (y_test == 0)).sum()),
                   "rappel": round(recall_score(y_test, b), 2),
                   "precision": round(precision_score(y_test, b), 2)})
pd.DataFrame(lignes)
""")

md("""
## Étape 6 · Sauvegarder le modèle et ce qu’il faut pour le relancer

Un modèle seul ne suffit pas pour la production. On écrit **trois fichiers** :

1. `modele_fraude.joblib` — le pipeline entraîné (préparation + modèle) ;
2. `metadata.json` — la **fiche** du modèle : sa version, les variables attendues et leur ordre, le seuil, les données d’entraînement, les scores du test ;
3. `requirements.txt` — les versions exactes des bibliothèques. Un fichier joblib créé avec scikit-learn 1.6 peut refuser de se charger, ou se comporter autrement, avec une autre version.

⚠ Un fichier joblib (ou pickle) **exécute du code** quand on le charge. Ne chargez jamais un fichier de modèle venu d’une source que vous ne contrôlez pas.
""")
code("""
import joblib, json, sys, sklearn, os
from datetime import date

joblib.dump(modele, "modele_fraude.joblib")
fiche = {
    "nom": "jappo-fraude",
    "version": "1.0.0",
    "date_entrainement": str(date.today()),
    "donnees": {"source": URL, "periode_entrainement": "2026-10-01 au 2026-10-24",
                "periode_test": "2026-10-25 au 2026-10-30", "operations_entrainement": int(len(train))},
    "variables_brutes": ["date_heure", "type_operation", "montant_fcfa", "solde_avant_fcfa",
                         "anciennete_compte_jours", "nb_operations_24h", "nouveau_beneficiaire", "nouvel_appareil"],
    "seuil": SEUIL,
    "test": {"rappel": round(float(recall_score(y_test, bloque)), 3),
             "precision": round(float(precision_score(y_test, bloque)), 3),
             "auc": round(float(roc_auc_score(y_test, proba)), 3)},
    "versions": {"python": sys.version.split()[0], "scikit-learn": sklearn.__version__,
                 "pandas": pd.__version__, "joblib": joblib.__version__},
}
with open("metadata.json", "w") as f:
    json.dump(fiche, f, indent=2, ensure_ascii=False)
with open("requirements.txt", "w") as f:
    f.write(f"scikit-learn=={sklearn.__version__}\\npandas=={pd.__version__}\\njoblib=={joblib.__version__}\\n")
print("Taille du modèle :", round(os.path.getsize("modele_fraude.joblib") / 1024, 1), "Ko")
print(open("requirements.txt").read())
""")

md("""
## Étape 7 · Recharger le fichier et servir une prédiction avec une fonction

On efface le modèle de la mémoire, on recharge le fichier, et on écrit la fonction `predire()`. Elle reçoit **une opération telle que le système de paiement l’envoie** (un dictionnaire de champs bruts) et rend une décision. À la journée 2, cette fonction deviendra le cœur d’un service web : le système de paiement l’appellera pour chaque opération.
""")
code("""
del modele
modele_charge = joblib.load("modele_fraude.joblib")
fiche = json.load(open("metadata.json"))

def predire(operation: dict) -> dict:
    manquants = [c for c in fiche["variables_brutes"] if c not in operation]
    if manquants:
        return {"erreur": "champs manquants : " + ", ".join(manquants)}
    p = float(modele_charge.predict_proba(preparer(pd.DataFrame([operation])))[0, 1])
    return {"probabilite_fraude": round(p, 3),
            "decision": "bloquer" if p >= fiche["seuil"] else "accepter",
            "version_modele": fiche["version"]}

# Une opération suspecte : 03h12, nouvel appareil, nouveau bénéficiaire, presque tout le solde
suspecte = {"date_heure": "2026-11-20 03:12:00", "type_operation": "envoi", "montant_fcfa": 180000,
            "solde_avant_fcfa": 185000, "anciennete_compte_jours": 900, "nb_operations_24h": 6,
            "nouveau_beneficiaire": 1, "nouvel_appareil": 1}
# Une opération ordinaire : un paiement chez un commerçant en fin de matinée
ordinaire = {"date_heure": "2026-11-20 11:40:00", "type_operation": "paiement_marchand", "montant_fcfa": 3500,
             "solde_avant_fcfa": 42000, "anciennete_compte_jours": 650, "nb_operations_24h": 2,
             "nouveau_beneficiaire": 0, "nouvel_appareil": 0}
print("➜ Suspecte  :", predire(suspecte))
print("➜ Ordinaire :", predire(ordinaire))
print("Champ oublié :", predire({"type_operation": "envoi"}))
""")

md("""
## Étape 8 · Mesurer le temps de réponse

Un système de paiement attend la réponse avant de valider l’opération : chaque milliseconde compte. On appelle `predire()` 200 fois et on mesure la durée moyenne d’un appel.
""")
code("""
import time
t0 = time.perf_counter()
for _ in range(200):
    predire(suspecte)
ms = (time.perf_counter() - t0) / 200 * 1000
print("➜ Temps moyen d’une prédiction :", round(ms, 1), "ms")
""")

md("""
## Étape 9 · Télécharger le paquet pour la journée 2

Les trois fichiers partent dans un seul fichier `paquet_j1.zip`. Gardez-le : vous le mettrez en ligne à la journée 2. (Hors de Colab, le fichier zip est simplement écrit dans le dossier courant.)
""")
code("""
import zipfile
with zipfile.ZipFile("paquet_j1.zip", "w") as z:
    for f in ["modele_fraude.joblib", "metadata.json", "requirements.txt"]:
        z.write(f)
try:
    from google.colab import files
    files.download("paquet_j1.zip")
except ImportError:
    print("paquet_j1.zip écrit dans", os.getcwd())
""")

md("""
## Pour aller plus loin · le même modèle au format ONNX

ONNX est un format de fichier ouvert pour les modèles. Un modèle ONNX se lance **sans Python** : depuis un programme en C++, en Java, en JavaScript ou sur un téléphone, avec le moteur `onnxruntime`. C’est utile pour un déploiement **embarqué** (sur l’appareil, sans réseau). La cellule ci-dessous installe deux bibliothèques, convertit le pipeline et vérifie que les deux fichiers donnent la même probabilité.
""")
code("""
!pip -q install skl2onnx onnxruntime
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType, StringTensorType
import onnxruntime as ort

types = [(c, FloatTensorType([None, 1])) for c in NUMERIQUES] + [("type_operation", StringTensorType([None, 1]))]
onx = to_onnx(modele_charge, initial_types=types, target_opset=17, options={id(modele_charge.steps[-1][1]): {"zipmap": False}})
open("modele_fraude.onnx", "wb").write(onx.SerializeToString())

x = preparer(pd.DataFrame([suspecte]))
entree = {c: x[[c]].to_numpy().astype(np.float32) for c in NUMERIQUES}
entree["type_operation"] = x[["type_operation"]].to_numpy().astype(str)
sess = ort.InferenceSession("modele_fraude.onnx")
p_onnx = sess.run(None, entree)[1][0, 1]
print("Probabilité joblib :", predire(suspecte)["probabilite_fraude"], "· probabilité ONNX :", round(float(p_onnx), 3))
print("Taille ONNX :", round(os.path.getsize("modele_fraude.onnx") / 1024, 1), "Ko")
""")

nb = {"cells": cells, "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
      "language_info": {"name": "python"}, "colab": {"provenance": []}}, "nbformat": 4, "nbformat_minor": 5}
for c in nb["cells"]:
    src = c["source"]
    lines = src.split("\n")
    c["source"] = [l + "\n" for l in lines[:-1]] + [lines[-1]]
json.dump(nb, open(OUT, "w"), ensure_ascii=False, indent=1)
print("wrote", os.path.normpath(OUT))

if "--run" in sys.argv:
    py = sys.argv[sys.argv.index("--run") + 1]
    local = os.path.normpath(os.path.join(HERE, "..", "files", "jappo_transactions.csv"))
    src = []
    for c in nb["cells"]:
        if c["cell_type"] != "code":
            continue
        s = "".join(c["source"]).replace(URL, local)
        s = "\n".join(l for l in s.split("\n") if not l.startswith("!pip"))
        lines = s.rstrip().split("\n")
        if lines[-1].endswith(".head()") or lines[-1].startswith("pd.DataFrame("):
            lines[-1] = "print(" + lines[-1] + ")"
        src.append("\n".join(lines))
    d = tempfile.mkdtemp()
    p = os.path.join(d, "run.py")
    open(p, "w").write("\n\n".join(src))
    subprocess.run([py, p], cwd=d, check=True)
