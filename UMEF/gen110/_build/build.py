#!/usr/bin/env python3
"""GEN 110 — the bilingual page generator.

Each page is written ONCE, in _build/<name>.tpl.html, with every piece of
copy carried in both languages inline:  ⟦texte français⫽English text⟧
The generator writes <name>.html (French) and <name>-en.html (English).
A marker may hold HTML or JavaScript string contents; it may not nest.
Three things are also swapped per edition: <html lang>, the sibling page
links (seanceN.html ↔ seanceN-en.html, index.html ↔ index-en.html) which
are written in the template as ⟦seance1.html⫽seance1-en.html⟧ like any
other copy, and nothing else — the engine, the ids, the step keys and the
data-work ids are identical, so a student may switch language mid-course.

Run it after editing any template:   python3 _build/build.py
It refuses to write if a marker is malformed or a ⟦ is left unmatched.
"""
import re, sys, os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
PAGES=['index','seance1']
MARK=re.compile(r'⟦(.*?)⫽(.*?)⟧',re.S)
def build(name):
    tpl=open(os.path.join(HERE,name+'.tpl.html'),encoding='utf-8').read()
    # sanity: no nested / unmatched markers
    stripped=MARK.sub('',tpl)
    for ch in '⟦⫽⟧':
        if ch in stripped:
            i=stripped.index(ch); sys.exit('%s.tpl.html: stray %s near: %r'%(name,ch,stripped[max(0,i-80):i+40]))
    out={}
    for lang,idx in (('fr',0),('en',1)):
        s=MARK.sub(lambda m:m.group(1+idx),tpl)
        s=s.replace('<html lang="fr">','<html lang="%s">'%lang,1)
        fn=name+('.html' if lang=='fr' else '-en.html')
        open(os.path.join(ROOT,fn),'w',encoding='utf-8').write(s)
        out[fn]=len(s.encode('utf-8'))
    n=len(MARK.findall(tpl))
    print('%-12s %4d markers → %s'%(name,n,'  '.join('%s %d B'%kv for kv in out.items())))
if __name__=='__main__':
    for p in (sys.argv[1:] or PAGES): build(p)
