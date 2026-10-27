#!/usr/bin/env python3
"""Publish the Session 3 lab pages — GBS/creator-economy/live/.

Reads each student's w3_* workbook fields from the database, keeps, per team,
the newest draft submitted for the lab (w3_track starts with "B", w3_ready set),
and writes one static page per team plus live/index.html and live/sitemap.xml.
Then commit and push; the pages are live when GitHub has served them.

    python3 GBS/creator-economy/_build/publish_live.py            # asks for the password
    python3 GBS/creator-economy/_build/publish_live.py --dry-run  # prints, writes nothing
    python3 GBS/creator-economy/_build/publish_live.py --from-json drafts.json
    python3 GBS/creator-economy/_build/publish_live.py --indexnow # after the push

⚠ ONLY FIELDS, NEVER HTML. Every value is escaped here; nothing a student
typed reaches the page as markup. A page on this origin can read the whole
site's localStorage — the instructor's session included — so a raw-HTML
path from the database to the web root must never exist.

⚠ page_html() MIRRORS buildDoc() in week3.html (the students' preview).
Change one, change the other.

⚠ A PUBLISHED PAGE IS THE EXPERIMENT. Re-running after Session 3 refuses to
overwrite a page whose content changed unless --force is given; every such
change is a second intervention and goes in the course CLAUDE.md with its date.
"""
import argparse, getpass, html, json, os, re, sys, urllib.request, urllib.error

DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app"
NS = "creator"
API_KEY = "AIzaSyASAyieOa3_FQuGsquY8te8dKsZH0oBkKw"   # public, as in /shared/fb-auth.js
EMAIL = "presence@janerikmeidell.com"                 # the account the rules trust
LAB = "https://janerikmeidell.com/GBS/creator-economy/live/"
HOST = "janerikmeidell.com"
PUBDATE = "2026-10-29"
NSEC = 4
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "live"))
DEFAULT_AUTHOR = "Students of Geneva Business School"


def get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def sign_in(password):
    req = urllib.request.Request(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY,
        data=json.dumps({"email": EMAIL, "password": password, "returnSecureToken": True}).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())["idToken"]


def fetch_drafts():
    token = sign_in(getpass.getpass("Instructor password: "))
    sids = get(f"{DB}/{NS}.json?shallow=true&auth={token}") or {}
    out = []
    for sid in sorted(sids):
        if sid.startswith("_"):
            continue                       # _roster, _wall, _jem …
        work = get(f"{DB}/{NS}/{sid}/work.json?auth={token}") or {}
        rec = {k: (v.get("v") if isinstance(v, dict) else v) for k, v in work.items()
               if k.startswith("w3_") or k == "w1_team"}
        if rec.get("w3_ready"):
            rec["_sid"] = sid
            out.append(rec)
    return out


def slugify(s):
    import unicodedata
    s = unicodedata.normalize("NFKD", str(s or "").lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    if len(s) > 60:   # cut at a hyphen so no word is chopped — as slugify() in week3.html
        s = s[:61]
        s = s[:s.rindex("-")] if s.rfind("-") > 20 else s[:60]
    return s.rstrip("-")


def team_of(rec):
    t = (rec.get("w1_team") or "").split(" · ")[0].replace("Team ", "").strip()
    return t if t in "ABCDE" and len(t) == 1 else "?"


def parse_sources(s):
    out = []
    for line in (s or "").split("\n"):
        line = line.strip()
        if not line:
            continue
        m = re.search(r"https?://[^\s<>\"]+", line)
        if m:
            url = re.sub(r"[).,;]+$", "", m.group(0))
            label = re.sub(r"[\s—–:-]+$", "", line.replace(m.group(0), "")).strip()
        else:
            url, label = "", line
        out.append({"label": label, "url": url})
    return out


def parse_table(s):
    return [[c.strip() for c in l.strip().split("|")] for l in (s or "").split("\n") if l.strip()]


def e(s):
    # the same four characters as esc() in week3.html, so the two builds are byte-identical
    return html.escape(str(s or ""), quote=False).replace('"', "&quot;")


def paras(t):
    ps = [p.strip() for p in re.split(r"\n\s*\n", t or "") if p.strip()]
    return "\n".join("<p>" + e(p).replace("\n", " ") + "</p>" for p in ps)


STYLE = ('body{margin:0;background:#fff;color:#1d2433;font:17px/1.6 Georgia,"Times New Roman",serif;}main{max-width:720px;margin:0 auto;padding:28px 18px 60px;}'
         'h1{font:800 30px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;color:#101F44;margin:6px 0 10px;}h2{font:800 21px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:#101F44;margin:28px 0 8px;}'
         '.crumb,.meta,.disc{font:13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#5b6475;}.crumb a{color:#5b6475;}'
         '.answer{background:#f3f5f9;border-left:4px solid #101F44;padding:12px 16px;margin:16px 0;}'
         'table{border-collapse:collapse;width:100%;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;margin:12px 0;}th,td{border-bottom:1px solid #dde2ea;padding:7px 8px;text-align:left;vertical-align:top;}th{color:#101F44;}'
         'ol{padding-left:22px;}li{margin:4px 0;font-size:15px;}a{color:#1f4fa8;}.disc{border-top:1px solid #dde2ea;margin-top:36px;padding-top:12px;}')


def page_html(d):
    url = LAB + (d["slug"] or "page") + ".html"
    src = parse_sources(d["sources"])
    tab = parse_table(d["table"])
    author = d["author"] or DEFAULT_AUTHOR
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": d["title"], "description": d["answer"],
          "datePublished": PUBDATE, "dateModified": PUBDATE, "inLanguage": "en",
          "author": {"@type": "Organization", "name": author}, "mainEntityOfPage": url,
          "citation": [s["url"] for s in src if s["url"]]}
    ldj = json.dumps(ld, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    h = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
         f'<title>{e(d["title"])}</title>\n<meta name="description" content="{e(d["answer"])}">\n<link rel="canonical" href="{e(url)}">\n'
         f'<script type="application/ld+json">{ldj}</script>\n<style>{STYLE}</style>\n'
         '</head>\n<body>\n<main>\n<p class="crumb"><a href="./">Answers written by Geneva Business School students</a></p>\n'
         f'<h1>{e(d["title"])}</h1>\n<p class="meta">By {e(author)} · Published 29 October 2026 · Facts checked 29 October 2026</p>\n'
         f'<p class="answer"><strong>Short answer:</strong> {e(d["answer"]).replace(chr(10), " ")}</p>\n')
    for s in d["secs"]:
        if s["h"]:
            h += f'<h2>{e(s["h"])}</h2>\n'
        if s["t"]:
            h += paras(s["t"]) + "\n"
    if len(tab) > 1:
        h += ("<table>\n<thead><tr>" + "".join(f"<th>{e(c)}</th>" for c in tab[0]) + "</tr></thead>\n<tbody>\n"
              + "\n".join("<tr>" + "".join(f"<td>{e(c)}</td>" for c in r) + "</tr>" for r in tab[1:]) + "\n</tbody>\n</table>\n")
    if d["method"]:
        h += "<h2>How we know</h2>\n" + paras(d["method"]) + "\n"
    if src:
        h += "<h2>Sources</h2>\n<ol>\n" + "\n".join(
            "<li>" + e(s["label"] or s["url"]) + (f' — <a href="{e(s["url"])}">{e(s["url"])}</a>' if s["url"] else "") + "</li>"
            for s in src) + "\n</ol>\n"
    h += ('<p class="disc">Written by Bachelor students of Geneva Business School in the course <i>The Creator Economy &amp; Search Everywhere Optimization</i> (Fall 2026), as part of a class experiment on how AI answer engines choose their sources. Every figure on this page comes from the sources listed above, as they read on 29 October 2026.</p>\n'
          '</main>\n<script src="/track.js" defer></script>\n</body>\n</html>\n')
    return h


def draft_of(rec):
    g = lambda k: (rec.get(k) or "").strip()
    secs = [{"h": g(f"w3_h{i}"), "t": g(f"w3_t{i}")} for i in range(1, NSEC + 1)]
    return {"title": g("w3_title"), "answer": g("w3_answer"), "table": g("w3_table"), "method": g("w3_method"),
            "sources": g("w3_sources"), "author": g("w3_author"),
            "slug": slugify(g("w3_slug") or g("w3_title")), "secs": [s for s in secs if s["h"] or s["t"]]}


def index_html(pages):
    items = "\n".join(f'<li><a href="{e(p["slug"])}.html">{e(p["title"])}</a></li>' for p in pages)
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>Answers written by Geneva Business School students</title>\n'
            '<meta name="description" content="Pages written by Bachelor students of Geneva Business School, each answering one buying question with sourced figures, as part of a course experiment on AI answer engines.">\n'
            f'<link rel="canonical" href="{LAB}">\n<style>{STYLE}</style>\n</head>\n<body>\n<main>\n'
            '<h1>Answers written by Geneva Business School students</h1>\n'
            '<p>Each page below answers one question, with every figure sourced. They were written on 29 October 2026 by Bachelor students in <i>The Creator Economy &amp; Search Everywhere Optimization</i>, as part of a class experiment on how AI answer engines choose their sources.</p>\n'
            + (f"<ul>\n{items}\n</ul>\n" if pages else "<p>The pages are published on 29 October 2026.</p>\n")
            + '</main>\n<script src="/track.js" defer></script>\n</body>\n</html>\n')


def sitemap_xml(pages):
    urls = [LAB] + [LAB + p["slug"] + ".html" for p in pages]
    body = "\n".join(f"  <url><loc>{html.escape(u)}</loc><lastmod>{PUBDATE}</lastmod></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n'


def indexnow(urls):
    keys = [f for f in os.listdir(OUT) if re.fullmatch(r"[0-9a-f]{32}\.txt", f)]
    if not keys:
        sys.exit("No IndexNow key file in live/ — nothing sent.")
    key = keys[0][:-4]
    body = json.dumps({"host": HOST, "key": key, "keyLocation": LAB + key + ".txt", "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print("IndexNow:", r.status, f"({len(urls)} URLs)")
    except urllib.error.HTTPError as err:
        print("IndexNow refused:", err.code, err.read()[:300])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true", help="overwrite a published page whose content changed")
    ap.add_argument("--from-json", help="a list of records instead of the database (testing)")
    ap.add_argument("--indexnow", action="store_true", help="ping IndexNow with every page already in live/ (after the push)")
    a = ap.parse_args()

    if a.indexnow:
        pages = sorted(f for f in os.listdir(OUT) if f.endswith(".html") and f != "index.html")
        indexnow([LAB] + [LAB + p for p in pages])
        return

    recs = json.load(open(a.from_json)) if a.from_json else fetch_drafts()
    best = {}
    for r in recs:
        if not (r.get("w3_track") or "").startswith("B"):
            continue
        t = team_of(r)
        if t not in best or (r.get("w3_ready") or "") > (best[t].get("w3_ready") or ""):
            best[t] = r

    pages, taken = [], set()
    for t in sorted(best):
        d = draft_of(best[t])
        if not d["title"] or not d["answer"]:
            print(f"Team {t}: no title or short answer — skipped")
            continue
        base, n = d["slug"] or f"team-{t.lower()}", 2
        while d["slug"] in taken or not d["slug"]:
            d["slug"] = f"{base}-{n}"; n += 1
        taken.add(d["slug"])
        d["team"] = t
        pages.append(d)

    os.makedirs(OUT, exist_ok=True)
    for d in pages:
        path = os.path.join(OUT, d["slug"] + ".html")
        new = page_html(d)
        old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        state = "new" if old is None else "unchanged" if old == new else "CHANGED"
        print(f"Team {d['team']}: {LAB}{d['slug']}.html  [{state}]  {len(d['secs'])} sections, {len(parse_sources(d['sources']))} sources")
        if a.dry_run or state == "unchanged":
            continue
        if state == "CHANGED" and not a.force:
            print("   refused: the published page would change — a second intervention. Re-run with --force and log it.")
            continue
        open(path, "w", encoding="utf-8").write(new)

    if not a.dry_run:
        # the index and sitemap list every page in live/, including ones published earlier
        on_disk = []
        for f in sorted(os.listdir(OUT)):
            if f.endswith(".html") and f != "index.html":
                m = re.search(r"<title>(.*?)</title>", open(os.path.join(OUT, f), encoding="utf-8").read(), re.S)
                on_disk.append({"slug": f[:-5], "title": html.unescape(m.group(1)) if m else f[:-5]})
        open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(index_html(on_disk))
        open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8").write(sitemap_xml(on_disk))
        print(f"live/index.html and live/sitemap.xml: {len(on_disk)} pages. Review the pages, then commit and push; then run --indexnow.")


if __name__ == "__main__":
    main()
