# Notes formateur — Samedi « Digitalisation bancaire » (decks v2, denses)

*Pour Jan Erik. Les decks portent maintenant le contenu à eux seuls (prose lisible à voix haute) ; ces notes donnent le minutage, les points d'insistance et les questions à poser. Aucune note n'est intégrée aux diapositives. Contenu étudiant en français ; cadrage pour toi en anglais.*

Total : **6 h** (9h00–12h00 + 13h00–16h00). **Matin : 39 slides · Après-midi : 29 slides.** Avec deux ateliers de 30 min, un Jeopardy de 25 min et deux pauses de 15 min, compte ~3 min/slide de parole en moyenne — tu as de la marge, surtout l'après-midi.

---

## MATIN — « L'argent bouge » (39 slides)

**Cible examen : 2.3 Paiements & monnaie (10 pts) + 3.2 WealthTech/InsurTech/Lending (10 pts).**

| Slides | Séquence | Minutage | Points d'insistance |
|--------|----------|----------|---------------------|
| 1–3 | Titre · agenda · pari d'ouverture | 9h00 (10') | Caméras ON pour le pari. 3 chiffres à deviner en chat ; tu fermes les paris à la slide 27. *Réponses : espèces CH ~30 % et en baisse · stablecoins ~250 mia $ · seuil SCA 30 €.* |
| 4–6 | Divider 2.3 · pourquoi le paiement · les 4 rails | 9h10 (12') | Le modèle mental de toute la matinée : carte / virement / wallet / crypto. Répète « coût ou délai » comme grille de lecture. |
| 7–8 | Paiement carte : parcours puis frais | 9h22 (10') | Slide 8 = la marge de change cachée. Demande : « sur 2'000 € de vacances, combien part en marge FX invisible ? » (20–40 CHF). |
| 9–11 | SIC · ISO 20022 / QR · TWINT | 9h32 (12') | Slide 11 : le piège pédagogique — TWINT n'est PAS un rail, c'est une surcouche, et il ne traverse pas la frontière. |
| 12–17 | DSP2 : divider, principe, AISP/PISP/SCA, 2 conséquences, Open Banking CH | 9h44 (16') | Cœur d'examen. Triade AISP=voir / PISP=payer / SCA=sécuriser. CH : bLink, OpenWealth (pas de DSP2 obligatoire). |
| — | **ATELIER 1 — Le rail de paiement** | 10h00–10h30 | `atelier-rail-paiement.html`. 4 rôles (+sceptique). Comparer ≥2 rails, exporter la décision. |
| — | **PAUSE** | 10h30–10h45 | 15 min. |
| 18–19 | Divider monnaie · 3 formes de monnaie | 10h45 (6') | Idée-force : ton compte est DÉJÀ numérique. La nouveauté = qui émet / qui garantit. |
| 20–21 | CBDC : principe · dans le monde | 10h51 (10') | e-CNY (avancé), euro numérique (préparation), Helvetia (wholesale CH). Risque de fuite des dépôts. |
| 22–23 | Stablecoin : principe · réserves & dépeg | 11h01 (10') | USDT vs USDC (transparence). Cas Terra/UST 2022 = dépeg. Toujours relier stabilité ↔ réserves. |
| 24–26 | Table CBDC vs stablecoin · menace dépôts · MiCA & GENIUS | 11h11 (12') | La table (émetteur/garantie/régulation/contrôle) EST la réponse d'examen. FINMA = régulation au cas par cas. **Ferme les paris d'ouverture ici.** |
| 27 | Synthèse paiements | 11h23 (4') | Carte mentale du bloc 1. |
| 28 | Transition Atelier (déjà fait) → enchaîne sur bloc 2 | — | — |
| 29–30 | Divider 3.2 · fil rouge 3 métiers | 11h27 (5') | « Pour chaque techno : un avantage ET une limite. » Structure attendue. |
| 31–33 | Robo-advisor : principe · mécanisme · vs humain | 11h32 (compresser) | Si tu cours après le temps : garde 31 et 33, survole 32. Limite honnête : réplique le marché, ne le bat pas. |
| 34–36 | BNPL : principe · modèle éco · double risque | (selon temps) | Le double risque (consommateur + prêteur) est LE point d'examen. CH : Cembra, Swissbilling. |
| 37–38 | InsurTech : panorama · éthique | (selon temps) | Paramétrique → besoin d'oracle (pont vers l'après-midi). Éthique : fin de la mutualisation. |
| 39 | Transition Jeopardy | 11h35 | `jeopardy-digitalisation.html`. |
| — | **JEOPARDY** | 11h35–12h00 | 2–3 équipes, points cumulés. |

**Note de charge :** le bloc 2 (slides 29–39) est dense. Si le matin glisse, c'est lui qu'on compresse — le contenu est entièrement repris au Jeopardy et reste révisable. Ne sacrifie jamais la table CBDC/stablecoin (24) ni le double risque BNPL (36).

---

## APRÈS-MIDI — « Sans intermédiaire & sous contrôle » (29 slides)

**Cible examen : 2.2 DeFi (10 pts) + 4.1 BTC/ETH (10 pts) + 4.2 Régulation/Éthique (10 pts).**

| Slides | Séquence | Minutage | Points d'insistance |
|--------|----------|----------|---------------------|
| 1–3 | Titre · agenda · divider DeFi | 13h00 (5') | Reprise caméras. Ferme les derniers paris si besoin. |
| 4–6 | Rappel blockchain · DeFi vs trad-fi (table) · 4 services | 13h05 (14') | « Décentralisé » en 4 mots : pas d'intermédiaire / code seul / open source / sans permission. |
| 7–8 | Aave : principe · health factor chiffré | 13h19 (12') | Sur-collatéralisation = la réponse à « prêter sans connaître le client ». Slide 8 : HF 2,06 → 1,24 → 1,00. Annonce l'atelier. |
| 9–11 | Uniswap : principe · formule x·y=k · exemple chiffré | 13h31 (14') | Slide 11 : 10 ETH/30'000 USDC, achat 1 ETH → ~3'333 USDC, slippage ~333. Fais-le au tableau. |
| 12 | Oracles | 13h45 (6') | Le oracle problem. « Vous tiendrez l'oracle dans l'atelier. » |
| 13 | DeFi : 4 risques | 13h51 (6') | Code / oracle / liquidation / réglementaire. Déplacement du risque, pas disparition. |
| 14–17 | Divider 4.1 · Bitcoin 3 idées · halving · ETF spot | 13h57 (compresser) | Chiffres-clés : halving 6,25→3,125 (avril 2024), ETF spot (janv. 2024, IBIT/FBTC, >50 mia $). Corrélation ≠ causalité. |
| 18–19 | Ethereum · tokenisation/RWA | (selon temps) | ETH = ordinateur mondial. Tokenisation = là où banques et crypto convergent (SDX, Sygnum, BCG). |
| — | **ATELIER 2 — Le bac à sable oracle** | 14h05–14h35 | `atelier-oracle-liquidation.html`. Marquee. Liquidation ≈ **1'455 $** pour 1 ETH / 1'200 USDC. Bouton « ⚡ Krach soudain » pour l'effet. |
| — | **PAUSE** | 14h35–14h50 | 15 min. |
| 20–21 | Divider 4.2 · pourquoi réguler · KYC/AML | 14h50 (12') | 3 buts : protéger / stabilité / criminalité. KYC = identité, AML = flux (LBA, OBA-FINMA). |
| 22 | Crypto Valley & loi TRD/DLT | 15h02 (6') | Argument suisse : « régulation par qualification, pas par interdiction ». Crypto Valley Zoug. |
| 23–24 | Biais algorithmique : problème · remèdes | 15h08 (14') | Apple Card 2019 ; les proxys recréent la discrimination. SHAP/LIME + AI Act « haut risque ». Donne-lui de l'air — 10 pts. |
| 25–26 | Synthèse régulation · synthèse stratégie d'examen | 15h22 (10') | La slide 26 est du coaching direct : contexte suisse + comparaison + scénario + chiffres. |
| 27 | Clôture | 15h32 | « Trustless. Mais pas sans règles. » Q&A jusqu'à 16h00. |

**Note de charge :** l'après-midi a beaucoup de marge (29 slides + 1 atelier sur 3 h). Profite-en pour ralentir sur Aave (8), Uniswap (11) et le biais (23–24) — les trois morceaux qui rapportent le plus de points et que les étudiants comprennent mal seuls.

---

## Outils interactifs — rappel

| Outil | Fichier | Quand | Mise en place |
|-------|---------|-------|---------------|
| Atelier 1 | `atelier-rail-paiement.html` | 10h00 | Partage d'écran, 4–5 rôles, minuteur 30 min intégré |
| Jeopardy | `jeopardy-digitalisation.html` | 11h35 | 2–3 équipes, renommables, points en direct |
| Atelier 2 | `atelier-oracle-liquidation.html` | 14h05 | Partage d'écran, l'« oracle » tient le curseur |
| Lanceur | `index.html` | — | Relie les trois ; pratique sur Netlify Drop |

Tous les outils sont autonomes (pas d'API, hors-ligne) et exportent les réponses du groupe en `.txt` pour la note de participation.

## Couverture examen
Les deux décks couvrent les **5 blocs d'examen non encore traités** (2.2, 2.3, 3.2, 4.1, 4.2) = **50 points**. Les blocs 1.1–1.3, 2.1, 3.1, 5.1 ont été vus en Sessions 1–7.
