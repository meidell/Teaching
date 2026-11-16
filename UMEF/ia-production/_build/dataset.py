"""MIA 506 · the lab dataset used from journée 1 to journée 4.

Simulated mobile-money transactions of a FICTIONAL Senegalese operator
("Jàppo Pay"), 1–30 October 2026, one row per transaction, with a fraud
label. Deterministic (seed 506): re-running writes the same file, so the
numbers checked on journee1.html stay true.

    python3 _build/dataset.py   ->  files/jappo_transactions.csv

Fraud pattern (account takeover after a SIM swap): a new device, a new
beneficiary, a large share of the balance, at night, sends and cash-outs.
"""
import csv, math, os, random
from datetime import datetime, timedelta

random.seed(506)
N = 24000
START = datetime(2026, 10, 1)
TYPES = [("envoi", 0.46), ("paiement_marchand", 0.30), ("retrait", 0.14), ("depot", 0.10)]
HOUR_W = [1, .6, .4, .3, .3, .5, 1.5, 3, 5, 6, 6.5, 7, 7.5, 7, 6.5, 6.5, 7, 7.5, 8, 7.5, 6, 4.5, 3, 2]

def pick(pairs):
    r, a = random.random(), 0
    for v, w in pairs:
        a += w
        if r < a:
            return v
    return pairs[-1][0]

def lognorm(mu, s):
    return math.exp(random.gauss(mu, s))

rows = []
for i in range(N):
    day = random.randrange(30)
    hour = random.choices(range(24), weights=HOUR_W)[0]
    ts = START + timedelta(days=day, hours=hour, minutes=random.randrange(60), seconds=random.randrange(60))
    t = pick(TYPES)
    solde = round(lognorm(math.log(60000), 1.0), -1)
    base = {"envoi": 9.6, "paiement_marchand": 8.6, "retrait": 10.0, "depot": 9.9}[t]
    montant = max(100, round(lognorm(base, 0.8), -2))
    if t != "depot":
        montant = min(montant, max(100, round(solde * random.uniform(.05, 1.0), -2)))
    anc = int(min(3000, lognorm(math.log(500), 0.9)))
    nb24 = min(30, int(lognorm(math.log(2.5), 0.6)))
    nben = 1 if (t == "envoi" and random.random() < 0.18) else 0
    napp = 1 if random.random() < 0.03 else 0
    part = montant / solde if solde > 0 else 0
    nuit = 1 if hour < 6 else 0
    z = (-5.5 + 2.6 * napp + 1.6 * nben + 1.9 * (part > 0.8) + 1.1 * nuit
         + 0.06 * nb24 + {"envoi": .9, "retrait": .7, "paiement_marchand": -1.2, "depot": -2.5}[t]
         - 0.0004 * anc)
    p = 1 / (1 + math.exp(-z))
    fraude = 1 if random.random() < p else 0
    rows.append([ts, t, int(montant), int(solde), anc, nb24, nben, napp, fraude])

rows.sort(key=lambda r: r[0])
out = os.path.join(os.path.dirname(__file__), "..", "files", "jappo_transactions.csv")
with open(out, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id_transaction", "date_heure", "type_operation", "montant_fcfa", "solde_avant_fcfa",
                "anciennete_compte_jours", "nb_operations_24h", "nouveau_beneficiaire", "nouvel_appareil", "fraude"])
    for k, r in enumerate(rows):
        w.writerow(["TX%06d" % (k + 1), r[0].strftime("%Y-%m-%d %H:%M:%S")] + r[1:])
print(out, len(rows), "rows,", sum(r[-1] for r in rows), "frauds")
