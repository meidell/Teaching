#!/usr/bin/env python3
"""MFB 545 — Journée 3, bloc 1: the guided credit-scoring notebook.

Writes files/scoring.ipynb (French) and files/scoring-en.ipynb (English) from
the cells below; each cell is written once, with L(fr, en) where the two
editions differ. Students open them in Google Colab straight from GitHub:
  https://colab.research.google.com/github/meidell/Teaching/blob/main/UMEF/mfb545/files/scoring.ipynb

The data is the public UCI "Statlog (German Credit Data)" set, read from the
UCI archive at run time — nothing is mirrored here. The model and the split
are the ones journee3.html embeds (first 700 rows train, last 300 test, an
unpenalised logistic regression on seven variables), so the AUC, the
coefficients and the threshold table in the notebook are exactly the numbers
the page's simulator and checks use: AUC test 0.784, best threshold 22 % at
a 15 % margin and 50 % LGD. Change the model here and the page must move too.

Run:  python3 _build/notebook.py
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(os.path.dirname(HERE), 'files')

def cells(lang):
    L = lambda fr, en: fr if lang == 'fr' else en
    md = lambda s: {'cell_type': 'markdown', 'metadata': {}, 'source': s.strip('\n')}
    code = lambda s: {'cell_type': 'code', 'metadata': {}, 'execution_count': None, 'outputs': [], 'source': s.strip('\n')}
    return [
md(L("""
# MFB 545 · Journée 3 · Scoring de crédit en direct

**Ce que vous allez faire, en 30 minutes :** charger un vrai jeu de données de crédit à la consommation (1 000 prêts, dont 300 en défaut), construire un score avec une régression logistique, mesurer sa qualité (AUC, Gini), puis choisir un **seuil d’acceptation** et voir ce qu’il fait au résultat du portefeuille.

**Mode d’emploi.** Exécutez chaque cellule de code dans l’ordre : cliquez dessus puis sur ▶ (ou `Maj + Entrée`). Aucune programmation n’est demandée : lisez les résultats et répondez aux questions **sur le site du cours** (section 3.2).

*Données : Hofmann, H. (1994), « Statlog (German Credit Data) », UCI Machine Learning Repository. Montants en Deutsche Mark de l’époque.*
""", """
# MFB 545 · Day 3 · Live credit scoring

**What you will do, in 30 minutes:** load a real consumer-credit dataset (1,000 loans, 300 of them in default), build a score with a logistic regression, measure its quality (AUC, Gini), then choose an **acceptance threshold** and see what it does to the portfolio’s result.

**How to use it.** Run each code cell in order: click it, then ▶ (or `Shift + Enter`). No programming is asked of you: read the results and answer the questions **on the course site** (section 3.2).

*Data: Hofmann, H. (1994), “Statlog (German Credit Data)”, UCI Machine Learning Repository. Amounts in Deutsche Mark of the time.*
""")),
md(L("## 1 · Charger les données", "## 1 · Load the data")),
code(L("""
import pandas as pd, numpy as np
url = "https://archive.ics.uci.edu/ml/machine-learning-databases/statlog/german/german.data"
colonnes = ["compte_courant","duree_mois","historique","objet","montant","epargne","emploi","taux_mensualite",
            "statut_sexe","garants","residence","patrimoine","age","autres_credits","logement","nb_credits",
            "metier","personnes_a_charge","telephone","travailleur_etranger","classe"]
df = pd.read_csv(url, sep=" ", header=None, names=colonnes)
df["defaut"] = (df["classe"] == 2).astype(int)        # 1 = le prêt a mal tourné
print(len(df), "prêts ·", df["defaut"].sum(), "défauts · taux de défaut", round(df["defaut"].mean()*100, 1), "%")
df.head()
""", """
import pandas as pd, numpy as np
url = "https://archive.ics.uci.edu/ml/machine-learning-databases/statlog/german/german.data"
columns = ["checking","duration_months","history","purpose","amount","savings","employment","instalment_rate",
           "status_sex","guarantors","residence","property","age","other_credits","housing","n_credits",
           "job","dependants","telephone","foreign_worker","class"]
df = pd.read_csv(url, sep=" ", header=None, names=columns)
df["default"] = (df["class"] == 2).astype(int)        # 1 = the loan went bad
print(len(df), "loans ·", df["default"].sum(), "defaults · default rate", round(df["default"].mean()*100, 1), "%")
df.head()
""")),
md(L("""
## 2 · Une variable, à la main

Les codes de la colonne `compte_courant` : **A11** solde négatif · **A12** de 0 à 200 DM · **A13** 200 DM ou plus · **A14** pas de compte courant dans la banque. Regardez le taux de défaut par catégorie avant tout modèle : c’est ce qu’un analyste crédit faisait à la main avant les scores.
""", """
## 2 · One variable, by hand

The codes in `checking`: **A11** negative balance · **A12** 0 to 200 DM · **A13** 200 DM or more · **A14** no current account at the bank. Look at the default rate per category before any model: this is what a credit analyst did by hand before scores existed.
""")),
code(L("""
df.groupby("compte_courant")["defaut"].agg(prets="count", taux_de_defaut="mean").round(3)
""", """
df.groupby("checking")["default"].agg(loans="count", default_rate="mean").round(3)
""")),
md(L("""
## 3 · Les variables du score

Sept informations, celles d’une demande de crédit ordinaire : l’état du compte courant (trois indicateurs 0/1, la référence étant « 200 DM ou plus »), la durée en mois, le montant en milliers, une épargne faible (moins de 100 DM), l’âge, et un historique de crédit défavorable.

**Le découpage.** On apprend sur les **700 premiers** prêts et on mesure sur les **300 derniers**, que le modèle n’a jamais vus. (D’habitude on tire ce découpage au hasard ; ici il est fixe pour que toute la classe — et le simulateur du site — obtienne exactement les mêmes chiffres.)
""", """
## 3 · The score’s variables

Seven pieces of information, those of an ordinary credit application: the state of the current account (three 0/1 indicators, the reference being “200 DM or more”), the duration in months, the amount in thousands, low savings (under 100 DM), age, and a poor credit history.

**The split.** The model learns on the **first 700** loans and is measured on the **last 300**, which it has never seen. (Usually the split is random; here it is fixed so that the whole class — and the site’s simulator — gets exactly the same numbers.)
""")),
code(L("""
X = pd.DataFrame({
    "compte_negatif":   (df.compte_courant == "A11").astype(int),
    "compte_0_200":     (df.compte_courant == "A12").astype(int),
    "pas_de_compte":    (df.compte_courant == "A14").astype(int),
    "duree_mois":       df.duree_mois,
    "montant_milliers": df.montant / 1000,
    "epargne_faible":   (df.epargne == "A61").astype(int),
    "age":              df.age,
    "historique_mauvais": df.historique.isin(["A30","A31"]).astype(int),
})
y = df.defaut
X_app, y_app, X_test, y_test = X.iloc[:700], y.iloc[:700], X.iloc[700:], y.iloc[700:]
X.head()
""", """
X = pd.DataFrame({
    "checking_negative": (df.checking == "A11").astype(int),
    "checking_0_200":    (df.checking == "A12").astype(int),
    "no_checking":       (df.checking == "A14").astype(int),
    "duration_months":   df.duration_months,
    "amount_thousands":  df.amount / 1000,
    "low_savings":       (df.savings == "A61").astype(int),
    "age":               df.age,
    "poor_history":      df.history.isin(["A30","A31"]).astype(int),
})
y = df["default"]
X_train, y_train, X_test, y_test = X.iloc[:700], y.iloc[:700], X.iloc[700:], y.iloc[700:]
X.head()
""")),
md(L("""
## 4 · La régression logistique

Le modèle calcule un **logit** = constante + Σ coefficient × variable, puis la probabilité de défaut **PD = 1 / (1 + e^(−logit))**. Un coefficient positif augmente le risque ; e^(coefficient) est le facteur par lequel la variable multiplie la *cote* de défaut (les « odds »).
""", """
## 4 · The logistic regression

The model computes a **logit** = constant + Σ coefficient × variable, then the probability of default **PD = 1 / (1 + e^(−logit))**. A positive coefficient raises the risk; e^(coefficient) is the factor by which the variable multiplies the *odds* of default.
""")),
code(L("""
from sklearn.linear_model import LogisticRegression
modele = LogisticRegression(penalty=None, max_iter=5000).fit(X_app, y_app)
coef = pd.DataFrame({"coefficient": modele.coef_[0], "facteur_sur_la_cote": np.exp(modele.coef_[0])}, index=X.columns)
print("constante :", round(modele.intercept_[0], 4))
coef.round(4)
""", """
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(penalty=None, max_iter=5000).fit(X_train, y_train)
coef = pd.DataFrame({"coefficient": model.coef_[0], "factor_on_the_odds": np.exp(model.coef_[0])}, index=X.columns)
print("constant:", round(model.intercept_[0], 4))
coef.round(4)
""")),
md(L("""
## 5 · Le score est-il bon ? AUC et Gini

L’**AUC** est la probabilité qu’un mauvais payeur tiré au hasard reçoive une PD plus élevée qu’un bon payeur tiré au hasard : 0,5 = pile ou face, 1 = parfait. Le **Gini** = 2 × AUC − 1 est la mesure que les banques publient. **Notez l’AUC sur l’échantillon de test : le site vous la demande.**
""", """
## 5 · Is the score any good? AUC and Gini

The **AUC** is the probability that a randomly drawn bad payer gets a higher PD than a randomly drawn good payer: 0.5 = a coin toss, 1 = perfect. The **Gini** = 2 × AUC − 1 is the measure banks report. **Write down the AUC on the test sample: the site asks for it.**
""")),
code(L("""
from sklearn.metrics import roc_auc_score
pd_test = modele.predict_proba(X_test)[:, 1]
auc_test = roc_auc_score(y_test, pd_test)
auc_app  = roc_auc_score(y_app, modele.predict_proba(X_app)[:, 1])
print("AUC apprentissage :", round(auc_app, 3), "· AUC test :", round(auc_test, 3), "· Gini test :", round(2*auc_test - 1, 3))
""", """
from sklearn.metrics import roc_auc_score
pd_test = model.predict_proba(X_test)[:, 1]
auc_test  = roc_auc_score(y_test, pd_test)
auc_train = roc_auc_score(y_train, model.predict_proba(X_train)[:, 1])
print("AUC train:", round(auc_train, 3), "· AUC test:", round(auc_test, 3), "· Gini test:", round(2*auc_test - 1, 3))
""")),
md(L("""
## 6 · Le seuil contre la rentabilité

On accepte un demandeur si sa PD est **inférieure au seuil**. Hypothèses du simulateur du site : un prêt remboursé rapporte **15 %** de son montant (intérêts nets du coût de financement, sur la durée du prêt) ; un prêt en défaut fait perdre **50 %** de son montant (la perte en cas de défaut, LGD). Changez `marge` et `lgd` et réexécutez : le meilleur seuil bouge.
""", """
## 6 · Threshold versus profitability

An applicant is accepted if their PD is **below the threshold**. The site simulator’s assumptions: a repaid loan earns **15 %** of its amount (interest net of funding cost, over the life of the loan); a defaulted loan loses **50 %** of its amount (the loss given default, LGD). Change `margin` and `lgd` and run again: the best threshold moves.
""")),
code(L("""
marge, lgd = 0.15, 0.50
montants, defauts = df.montant.iloc[700:].values, y_test.values
lignes = []
for seuil in np.arange(0.05, 0.75, 0.05).round(2).tolist() + [1.01]:
    acc = pd_test < seuil
    gain = np.where(defauts[acc] == 0, marge * montants[acc], -lgd * montants[acc]).sum()
    lignes.append({"seuil": seuil, "acceptes": int(acc.sum()), "defauts": int(defauts[acc].sum()),
                   "taux_de_defaut_%": round(100 * defauts[acc].mean(), 1) if acc.any() else 0, "resultat_DM": round(gain)})
table = pd.DataFrame(lignes); table
""", """
margin, lgd = 0.15, 0.50
amounts, defaults = df.amount.iloc[700:].values, y_test.values
rows = []
for threshold in np.arange(0.05, 0.75, 0.05).round(2).tolist() + [1.01]:
    acc = pd_test < threshold
    gain = np.where(defaults[acc] == 0, margin * amounts[acc], -lgd * amounts[acc]).sum()
    rows.append({"threshold": threshold, "accepted": int(acc.sum()), "defaults": int(defaults[acc].sum()),
                 "default_rate_%": round(100 * defaults[acc].mean(), 1) if acc.any() else 0, "result_DM": round(gain)})
table = pd.DataFrame(rows); table
""")),
code(L("""
import matplotlib.pyplot as plt
seuils = np.arange(0.01, 0.80, 0.01)
res = [np.where(defauts[pd_test < s] == 0, marge*montants[pd_test < s], -lgd*montants[pd_test < s]).sum() for s in seuils]
plt.figure(figsize=(8, 4)); plt.plot(seuils*100, res); plt.axhline(0, color="grey", lw=.8)
plt.axvline(100*marge/(marge+lgd), ls="--", color="red", label="seuil théorique = marge / (marge + LGD)")
plt.xlabel("Seuil d’acceptation : PD maximale (%)"); plt.ylabel("Résultat du portefeuille (DM)"); plt.legend(); plt.show()
print("Meilleur seuil :", round(seuils[int(np.argmax(res))]*100), "% · résultat", round(max(res)), "DM")
""", """
import matplotlib.pyplot as plt
thresholds = np.arange(0.01, 0.80, 0.01)
res = [np.where(defaults[pd_test < t] == 0, margin*amounts[pd_test < t], -lgd*amounts[pd_test < t]).sum() for t in thresholds]
plt.figure(figsize=(8, 4)); plt.plot(thresholds*100, res); plt.axhline(0, color="grey", lw=.8)
plt.axvline(100*margin/(margin+lgd), ls="--", color="red", label="theoretical threshold = margin / (margin + LGD)")
plt.xlabel("Acceptance threshold: maximum PD (%)"); plt.ylabel("Portfolio result (DM)"); plt.legend(); plt.show()
print("Best threshold:", round(thresholds[int(np.argmax(res))]*100), "% · result", round(max(res)), "DM")
""")),
md(L("""
## 7 · Ce que le jeu de données contient aussi

Il contient le **sexe et l’état civil** (`statut_sexe` : A91 homme divorcé/séparé · A92 femme divorcée/séparée/mariée · A93 homme célibataire · A94 homme marié/veuf) et la **nationalité étrangère** (`travailleur_etranger` : A201 oui · A202 non). Le modèle ci-dessus ne les utilise pas. Regardez les taux de défaut par groupe, puis répondez sur le site : *les utiliseriez-vous si elles amélioraient l’AUC ?* Dans l’UE et en Suisse, la réponse est non (non-discrimination, protection des données ; et l’AI Act classe le scoring de crédit des personnes comme un système d’IA **à haut risque**). Mais une variable autorisée peut en reproduire une interdite : c’est le problème des **variables proxy**.
""", """
## 7 · What else the dataset contains

It contains **sex and marital status** (`status_sex`: A91 male divorced/separated · A92 female divorced/separated/married · A93 male single · A94 male married/widowed) and **foreign nationality** (`foreign_worker`: A201 yes · A202 no). The model above does not use them. Look at the default rates per group, then answer on the site: *would you use them if they improved the AUC?* In the EU and Switzerland the answer is no (non-discrimination, data protection; and the AI Act classes credit scoring of individuals as a **high-risk** AI system). But a permitted variable can reproduce a forbidden one: that is the **proxy variable** problem.
""")),
code(L("""
for col in ["statut_sexe", "travailleur_etranger"]:
    print(df.groupby(col)["defaut"].agg(prets="count", taux_de_defaut="mean").round(3), "\\n")
""", """
for col in ["status_sex", "foreign_worker"]:
    print(df.groupby(col)["default"].agg(loans="count", default_rate="mean").round(3), "\\n")
""")),
md(L("""
## À reporter sur le site (section 3.2)

1. L’**AUC sur le test** (cellule 5).
2. La variable dont le **facteur sur la cote** est le plus élevé, et ce qu’il veut dire en une phrase (cellule 4).
3. Le **meilleur seuil** et le résultat correspondant (cellule 6) — puis refaites-le dans le simulateur de la page, avec vos propres hypothèses.
""", """
## To copy back to the site (section 3.2)

1. The **test AUC** (cell 5).
2. The variable with the highest **factor on the odds**, and what it means in one sentence (cell 4).
3. The **best threshold** and its result (cell 6) — then redo it in the page’s simulator, with your own assumptions.
""")),
    ]

for lang, name in (('fr', 'scoring.ipynb'), ('en', 'scoring-en.ipynb')):
    nb = {'nbformat': 4, 'nbformat_minor': 5, 'metadata': {'kernelspec': {'name': 'python3', 'display_name': 'Python 3'},
          'language_info': {'name': 'python'}, 'colab': {'provenance': []}}, 'cells': cells(lang)}
    for c in nb['cells']:
        src = c['source'].split('\n'); c['source'] = [l + '\n' for l in src[:-1]] + [src[-1]]
    os.makedirs(OUT, exist_ok=True)
    json.dump(nb, open(os.path.join(OUT, name), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote', os.path.join('files', name), len(nb['cells']), 'cells')
