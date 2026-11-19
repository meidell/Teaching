"""MIA 506 · journée 1 · le service de détection de fraude.

Ce fichier est le même pour tout le monde. Il importe VOTRE fichier modele.py
(le code que vous avez écrit ce matin), puis il attend les appels :

    GET  /          qui je suis : versions, heure de démarrage, nombre d'appels
    POST /predire   une opération en JSON  ->  la réponse de votre fonction predire()

Le service traite UNE requête à la fois, comme une machine à un seul cœur.
"""
import datetime, platform, time, traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

t0 = time.time()
import modele                      # exécute votre code : lit les données, entraîne le modèle
DUREE_DEMARRAGE = round(time.time() - t0, 1)
DEMARRE_LE = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

import pandas, sklearn

app = FastAPI(title="jappo-fraude")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
COMPTE = {"appels": 0, "erreurs": 0}


@app.get("/")
def info():
    return {
        "service": "jappo-fraude",
        "demarre_le": DEMARRE_LE,
        "duree_demarrage_s": DUREE_DEMARRAGE,
        "modele": type(getattr(modele, "modele", None)).__name__,
        "seuil": getattr(modele, "SEUIL_FINAL", None),
        "versions": {"python": platform.python_version(), "scikit-learn": sklearn.__version__, "pandas": pandas.__version__},
        "appels": COMPTE["appels"],
        "erreurs": COMPTE["erreurs"],
    }


@app.post("/predire")
async def predire(request: Request):
    COMPTE["appels"] += 1
    debut = time.perf_counter()
    try:
        operation = await request.json()
        reponse = dict(modele.predire(operation))
    except Exception as e:             # votre fonction a planté : le service répond 500 au lieu de s'arrêter
        COMPTE["erreurs"] += 1
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"erreur_serveur": type(e).__name__ + " : " + str(e)[:300]})
    reponse["temps_calcul_ms"] = round((time.perf_counter() - debut) * 1000, 2)
    return reponse
