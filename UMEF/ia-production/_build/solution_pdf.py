#!/usr/bin/env python3
"""MIA 506 · journée 1 · génère _private/j1-solution-pas-a-pas.html et .pdf à partir de _private/j1_solution.py.

Le script est la seule source : « # ===== ÉTAPE n · titre ===== » ouvre une étape ; « #> » = texte à
dire ; « #= » = résultat attendu ; « #$ » = commande shell ; le reste est du code Python.
    python3 _build/solution_pdf.py          (Chrome headless pour le PDF)
"""
import html, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "_private", "j1_solution.py")
OUT_HTML = os.path.join(ROOT, "_private", "j1-solution-pas-a-pas.html")
OUT_PDF = os.path.join(ROOT, "_private", "j1-solution-pas-a-pas.pdf")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page{size:A4;margin:16mm 15mm}
body{font:10.5pt/1.45 -apple-system,"Helvetica Neue",Arial,sans-serif;color:#1c2430;margin:0}
h1{font-size:19pt;margin:0 0 2pt}
.sub{color:#5b6675;margin:0 0 10pt;font-size:9.5pt}
h2{font-size:13pt;color:#0f4c60;border-top:2pt solid #0f4c60;padding-top:6pt;margin:16pt 0 6pt;break-after:avoid}
h3{font-size:10pt;margin:8pt 0 2pt;color:#0f4c60;text-transform:uppercase;letter-spacing:.06em;break-after:avoid}
p{margin:4pt 0}
.say{border-left:3pt solid #0f4c60;background:#eef5f7;padding:6pt 10pt;margin:6pt 0;break-inside:avoid}
.say p{margin:3pt 0}
pre{background:#f3f5f8;border:0.5pt solid #d0d6de;border-radius:4pt;padding:7pt 9pt;font:8.6pt/1.4 Menlo,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:5pt 0;break-inside:avoid}
ul{margin:3pt 0;padding-left:16pt}
pre.out{background:#fff;border-left:3pt solid #1d6b3a}
pre.sh{background:#1c2430;color:#e8edf3;border-color:#1c2430}
code{font:9pt Menlo,Consolas,monospace;background:#f3f5f8;padding:0 2pt}
ol{margin:3pt 0;padding-left:18pt}li{margin:2pt 0}
.step h2{break-after:avoid}
.toc{columns:2;font-size:9.5pt;margin:8pt 0 4pt}
.toc div{break-inside:avoid}
"""

def esc(s):
    return html.escape(s, quote=False)

def parse(src):
    steps, cur = [], None
    for line in src.splitlines():
        m = re.match(r"# ===== (.*?) =====\s*$", line)
        if m:
            cur = {"title": m.group(1), "parts": []}
            steps.append(cur)
            continue
        if cur is None:
            continue
        if line.startswith("#> "):
            kind, text = "say", line[3:]
        elif line.startswith("#>"):
            kind, text = "say", line[2:]
        elif line.startswith("#= "):
            kind, text = "out", line[3:]
        elif line.startswith("#="):
            kind, text = "out", line[2:]
        elif line.startswith("#$ "):
            kind, text = "sh", line[3:]
        else:
            kind, text = "code", line
        if cur["parts"] and cur["parts"][-1][0] == kind:
            cur["parts"][-1][1].append(text)
        else:
            cur["parts"].append([kind, [text]])
    return steps

def say_html(lines):
    # paragraphs: a line starting with "· " or "N. " starts an item; others continue the previous paragraph
    paras, items = [], None
    for raw in lines:
        t = raw.strip()
        if not t:
            continue
        if re.match(r"^(\d+\.|·)\s", t):
            tag = "ul" if t.startswith("·") else "ol"
            if items is None or items[0] != tag:
                items = [tag]
                paras.append(items)
            items.append(re.sub(r"^(\d+\.|·)\s", "", t))
        elif items is not None and raw.startswith("  "):
            items[-1] += " " + t
        else:
            items = None
            if paras and isinstance(paras[-1], str) and not re.match(r"^(Ce que nous faisons|Pourquoi|Attention|Les trois pièges|À montrer|Si le Space|Le même service|Trois leviers)", t):
                paras[-1] += " " + t
            else:
                paras.append(t)
    out = []
    for p in paras:
        if isinstance(p, list):
            tag = p[0]
            out.append("<" + tag + ">" + "".join("<li>" + esc(x) + "</li>" for x in p[1:]) + "</" + tag + ">")
        else:
            p = esc(p)
            p = re.sub(r"^(Ce que nous faisons|Pourquoi[^:]*|Attention|Les trois pièges[^:]*|À montrer[^:]*|Si le Space[^:]*|Le même service[^:]*)\s*:", r"<b>\1 :</b>", p)
            out.append("<p>" + p + "</p>")
    return '<div class="say">' + "".join(out) + "</div>"

def build():
    src = open(SRC, encoding="utf-8").read()
    steps = parse(src)
    body = ['<h1>Journée 1 · la solution pas à pas, du premier print jusqu’au serveur sur Hugging Face</h1>',
            '<p class="sub">MIA 506 · Déploiement et pilotage des systèmes d’IA en production · fichier de l’enseignant, ne pas distribuer · '
            'le code est celui de <code>_private/j1_solution.py</code>, qui est aussi le <code>modele.py</code> du serveur ; chaque résultat a été calculé '
            'le 27 novembre 2026 sur <code>jappo_transactions.csv</code> avec pandas 3.0.2 et scikit-learn 1.8.0, les versions de la page et du serveur ; '
            'le service a été démarré sur un ordinateur avec ces six fichiers et a répondu comme indiqué à l’étape 11.</p>',
            '<p>Pour chaque étape : le texte à dire (encadré bleu), le code tel qu’il s’écrit dans la fenêtre de la page, puis le résultat attendu (bordure verte). '
            'Les étapes 1 à 9 sont les fenêtres de code de la matinée ; les étapes 10 et 11 sont l’après-midi, jusqu’au serveur qui répond.</p>',
            '<div class="toc">' + "".join('<div>' + esc(s["title"]) + '</div>' for s in steps) + '</div>']
    for s in steps:
        body.append('<div class="step"><h2>' + esc(s["title"]) + '</h2>')
        for kind, lines in s["parts"]:
            while lines and not lines[-1].strip():
                lines.pop()
            while lines and not lines[0].strip():
                lines.pop(0)
            if not lines:
                continue
            if kind == "say":
                body.append(say_html(lines))
            elif kind == "code":
                body.append('<h3>Le code</h3><pre>' + esc("\n".join(lines)) + '</pre>')
            elif kind == "out":
                body.append('<h3>Résultat attendu</h3><pre class="out">' + esc("\n".join(lines)) + '</pre>')
            elif kind == "sh":
                body.append('<h3>Dans un terminal</h3><pre class="sh">' + esc("\n".join(lines)) + '</pre>')
        body.append('</div>')
    doc = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>MIA 506 · Journée 1 · Solution pas à pas</title>'
           '<style>' + CSS + '</style></head><body>' + "\n".join(body) + '</body></html>')
    open(OUT_HTML, "w", encoding="utf-8").write(doc)
    print("written", OUT_HTML, len(steps), "steps")
    if os.path.exists(CHROME):
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer", "--print-to-pdf=" + OUT_PDF,
                        "file://" + OUT_HTML], check=True, capture_output=True)
        print("written", OUT_PDF, os.path.getsize(OUT_PDF), "bytes")
    else:
        print("Chrome not found: open the HTML and print it to PDF", file=sys.stderr)

if __name__ == "__main__":
    build()
