#!/usr/bin/env python3
"""MFB 545 — generate the English pages from the French ones.

The FRENCH page is the source (index.html, journee1.html, …). Its English
twin <name>-en.html is GENERATED: never edit it, it is overwritten.

  _build/i18n/<name>.json   a JSON list of ["texte français", "English text"]
                            pairs: exact substrings of the French page.

Run after editing a French page or a table:   python3 _build/build_en.py [name …]

What it does, in order:
  1. replaces every French string by its English one, longest first, and
     REPORTS any pair whose French text no longer occurs (the page changed:
     update the table);
  2. sets <html lang="en">; rewrites internal links (index.html,
     journeeN.html, jeopardy.html — in attributes and in JS strings) to
     their -en twins; flips the language-switch link to point back to FR;
  3. checks every inline <script> with `node --check` and refuses to write
     a page whose JavaScript does not parse;
  4. lists lines that still look French (accents, common French words)
     outside comments, so nothing is left untranslated by accident.
Rules for the English side: apostrophes are ’ (U+2019), never ' — most
strings live inside single-quoted JavaScript; no raw " inside attributes.
"""
import json, os, re, subprocess, sys, tempfile
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
PAGES=['index','journee1','journee2','journee3','jeopardy','rendu']
INTERNAL=r'(index|journee\d+|jeopardy|rendu)'
ALLOW=['Léman','PayLéman','Côte d','Rochat','Hypothekarbank','Zürich','Mamadou','Coumba','Khady','Ndeye','Ibrahima','Aminata','Mariama','Astou','Babacar','Cheikh','Abdou','Lamine','Moussa','Fatou','Ousmane','Awa','Diop','Pia-Maria','Rutschmann','Schnyder','Grosse Marktgasse','Rue du Lac','Société','Fintech et droit','Bonneau','Verdier','RB Édition','Teranga','Biel','Rorschach','Orange Money','Plenitude','MoMo','Wave']
FR_WORDS=re.compile(r"(?<![\w-])(les|des|du|une|est|pour|avec|dans|vous|votre|vos|sur|aux|qui|ou|pas|journée|séance|cours|étape|réponse|Suite|Retour|Menu de la)(?![\w-])",re.I)
ACC=re.compile(r'[éèêàçùûôîœëÉÈÊÀÇ]')

def strip_comments(s):
    s=re.sub(r'<!--.*?-->','',s,flags=re.S)
    s=re.sub(r'<style>.*?</style>','',s,flags=re.S)
    s=re.sub(r'/\*.*?\*/','',s,flags=re.S)
    s=re.sub(r'(?m)^\s*//.*$','',s)
    return s

def check_js(html,name):
    errs=[]
    for i,m in enumerate(re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',html,re.S)):
        with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False) as f:
            f.write(m.group(1));fn=f.name
        r=subprocess.run(['node','--check',fn],capture_output=True,text=True);os.unlink(fn)
        if r.returncode: errs.append('script #%d: %s'%(i,(r.stderr.strip().splitlines() or ['?'])[-1]))
    return errs

def build(name):
    src=open(os.path.join(ROOT,name+'.html'),encoding='utf-8').read()
    tp=os.path.join(HERE,'i18n',name+'.json')
    pairs=json.load(open(tp,encoding='utf-8')) if os.path.exists(tp) else []
    s=src; missing=[]
    for fr,en in sorted(pairs,key=lambda p:-len(p[0])):
        if fr in s: s=s.replace(fr,en)
        elif fr not in src: missing.append(fr)
    s=s.replace('<html lang="fr">','<html lang="en">',1)
    s=re.sub(r'([\'"])'+INTERNAL+r'\.html',lambda m:m.group(1)+m.group(2)+'-en.html',s)
    def flip(m):
        a=m.group(0)
        a=re.sub(r'href="'+INTERNAL+r'-en\.html',lambda k:'href="'+k.group(1)+'.html',a)
        a=a.replace('data-lang-switch="en"','data-lang-switch="fr"')
        a=a.replace('title="This page in English"','title="Cette page en français"').replace('title="This course in English"','title="Ce cours en français"')
        a=re.sub(r'>EN</a>$','>FR</a>',a).replace('>English version</a>','>Version française</a>')
        return a
    s=re.sub(r'<a [^>]*data-lang-switch="en"[^>]*>[^<]*</a>',flip,s)
    errs=check_js(s,name)
    left=[]
    for ln,line in enumerate(strip_comments(s).splitlines(),1):
        t=line
        for w in ALLOW: t=t.replace(w,'')
        t=re.sub(r'https?://\S+','',t)
        if ACC.search(t) or FR_WORDS.search(re.sub(r'<[^>]+>',' ',t)): left.append(line.strip()[:160])
    print('%-9s %4d pairs · %d stale · %d lines look French · JS %s'%(name,len(pairs),len(missing),len(left),'OK' if not errs else 'BROKEN'))
    for m in missing[:30]: print('   stale  :',m[:120])
    for l in left[:60]: print('   french?:',l)
    for e in errs: print('   JS     :',e)
    if errs: print('   → NOT written (JavaScript does not parse)'); return False
    open(os.path.join(ROOT,name+'-en.html'),'w',encoding='utf-8').write(s)
    return True

if __name__=='__main__':
    ok=all([build(p) for p in (sys.argv[1:] or PAGES)])
    sys.exit(0 if ok else 1)
