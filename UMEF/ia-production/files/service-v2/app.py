"""MIA 506 · journée 2 · le service de détection de fraude, version 2.

Différence avec la journée 1 : ce service N'ENTRAÎNE PLUS le modèle au démarrage.
Il lit registre.json, prend la version marquée "production", charge ce fichier
(un artefact .joblib enregistré avec son numéro de version) et répond.
Votre fichier modele.py définit preparer() et predire_v2() ; il charge l'artefact
quand le service l'importe.

    GET  /          qui je suis : version du modèle en production, empreinte, versions des bibliothèques,
                    heure de démarrage, durée du démarrage, nombre d'appels
    POST /predire   une opération en JSON  ->  la réponse de votre predire_v2(), avec la version qui a répondu

Le service traite UNE requête à la fois, comme à la journée 1.
"""
import datetime, json, platform, time, traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

t0 = time.time()
import modele                      # charge l'artefact de production ; n'entraîne rien
DUREE_DEMARRAGE = round(time.time() - t0, 2)
DEMARRE_LE = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

import joblib, numpy, pandas, sklearn

app = FastAPI(title="jappo-fraude-v2")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
COMPTE = {"appels": 0, "erreurs": 0}


def production():
    """L'entrée du registre marquée production (lue à chaque appel de GET /, pour montrer ce qui est servi)."""
    with open("registre.json", encoding="utf-8") as f:
        for e in json.load(f):
            if e.get("stade") == "production":
                return e
    return {}


@app.get("/")
def info():
    prod = production()
    return {
        "service": "jappo-fraude",
        "version_service": "2",
        "version_modele": prod.get("version"),
        "fichier_modele": prod.get("fichier"),
        "empreinte": prod.get("empreinte"),
        "entraine_le": prod.get("entraine_le"),
        "demarre_le": DEMARRE_LE,
        "duree_demarrage_s": DUREE_DEMARRAGE,
        "entrainement_au_demarrage": False,
        "versions": {"python": platform.python_version(), "scikit-learn": sklearn.__version__,
                     "pandas": pandas.__version__, "numpy": numpy.__version__, "joblib": joblib.__version__},
        "appels": COMPTE["appels"],
        "erreurs": COMPTE["erreurs"],
    }


@app.post("/predire")
async def predire(request: Request):
    COMPTE["appels"] += 1
    debut = time.perf_counter()
    try:
        operation = await request.json()
        reponse = dict(modele.predire_v2(operation))
    except Exception as e:             # votre fonction a planté : le service répond 500 au lieu de s'arrêter
        COMPTE["erreurs"] += 1
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"erreur_serveur": type(e).__name__ + " : " + str(e)[:300]})
    reponse["temps_calcul_ms"] = round((time.perf_counter() - debut) * 1000, 2)
    return reponse
