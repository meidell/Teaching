---
title: Jappo Fraude
emoji: 🛡
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

Service de détection de fraude, version 2 · MIA 506, journée 2 · données fictives.

Le service charge au démarrage le modèle marqué « production » dans `registre.json`
(un fichier `.joblib` qui porte un numéro de version) ; il n'entraîne plus rien.

- `GET /` : la version du modèle servie, son empreinte, les versions des bibliothèques, la durée du démarrage
- `POST /predire` : une opération en JSON, la réponse de `predire_v2()` avec la version qui a répondu
