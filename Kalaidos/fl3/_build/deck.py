#!/usr/bin/env python3
"""FL III — the light deck engine shared by the generated decks (slides_s45.py for
séances 4–5, slides_s6.py for séance 6). CSS, keyboard/click/swipe engine, the
"where on the site" band, print = one slide per 16:9 page. Split out of slides_s45.py
on 24 Nov 2026; nothing changed in what it produces.
"""
import re

CSS = r"""
:root{--ink:#10262B;--dim:#3E565C;--teal:#007A87;--deep:#0B4F58;--pale:#E3F1F3;--line:#C5D9DC;--coral:#C8372D;--amber:#FFE9A8;}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;}
body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;background:#fff;color:var(--ink);overflow:hidden;-webkit-font-smoothing:antialiased;}
.deck{position:fixed;inset:0;}
.slide{position:absolute;inset:0;display:none;flex-direction:column;background:#fff;}
.slide.on{display:flex;}
/* the band that says where this slide is on the site */
.loc{flex:0 0 auto;display:flex;align-items:center;gap:18px;background:var(--deep);color:#fff;padding:1.6vh 4vw;font-size:clamp(14px,1.75vw,22px);font-weight:700;line-height:1.25;}
.loc .where{flex:1 1 auto;}
.loc .where small{display:block;font-size:.7em;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#A9DCE2;margin-bottom:2px;}
.loc .where em{font-style:normal;background:var(--amber);color:var(--ink);padding:1px 9px;border-radius:5px;margin-right:6px;white-space:nowrap;}
.loc .strip{flex:0 0 auto;display:flex;gap:6px;}
.loc .strip span{font-size:.72em;padding:5px 10px;border-radius:20px;border:1.5px solid rgba(255,255,255,.4);color:rgba(255,255,255,.7);white-space:nowrap;}
.loc .strip span.cur{background:var(--amber);border-color:var(--amber);color:var(--ink);}
.inner{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;padding:2vh 5vw 5vh;max-width:1500px;width:100%;margin:0 auto;}
.slide h2{font-size:clamp(28px,4vw,52px);font-weight:800;line-height:1.12;letter-spacing:-.4px;margin-bottom:.6em;color:var(--deep);}
.slide p{font-size:clamp(19px,2.5vw,32px);line-height:1.42;color:var(--ink);margin-bottom:.55em;}
.slide p.def{background:var(--pale);border-left:8px solid var(--teal);padding:.55em .8em;}
.slide p.small,.slide .small{font-size:clamp(15px,1.8vw,23px);color:var(--dim);}
.slide b{font-weight:800;} .slide .c{color:var(--coral);font-weight:800;}
ul.pts{list-style:none;}
ul.pts li{position:relative;padding-left:1.5em;margin-bottom:.55em;font-size:clamp(19px,2.4vw,31px);line-height:1.36;}
ul.pts li::before{content:"";position:absolute;left:.1em;top:.42em;width:.55em;height:.55em;background:var(--teal);border-radius:2px;}
ol.steps{list-style:none;counter-reset:st;}
ol.steps li{position:relative;padding-left:2.3em;margin-bottom:.48em;font-size:clamp(18px,2.2vw,28px);line-height:1.34;min-height:1.7em;}
ol.steps li::before{counter-increment:st;content:counter(st);position:absolute;left:0;top:0;width:1.65em;height:1.65em;border-radius:50%;background:var(--teal);color:#fff;font-weight:800;font-size:.9em;display:flex;align-items:center;justify-content:center;}
.two{display:grid;grid-template-columns:1fr 1fr;gap:2.4vw;}
.three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.8vw;}
.box{border:2px solid var(--line);border-top:10px solid var(--teal);border-radius:10px;padding:1em 1.1em;background:#fff;}
.box .tag{font-size:clamp(13px,1.45vw,18px);font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--teal);margin-bottom:.35em;}
.box h3{font-size:clamp(22px,2.9vw,38px);font-weight:800;color:var(--deep);margin-bottom:.3em;line-height:1.12;}
.box p{font-size:clamp(17px,2vw,26px);line-height:1.36;margin-bottom:.35em;}
.three .box p{font-size:clamp(16px,1.8vw,23px);}
table.t{border-collapse:collapse;width:100%;font-size:clamp(17px,2vw,26px);line-height:1.3;}
table.t th{text-align:left;font-size:.68em;letter-spacing:1.5px;text-transform:uppercase;color:var(--teal);padding:.35em .6em;border-bottom:3px solid var(--teal);}
table.t td{padding:.5em .6em;border-bottom:1.5px solid var(--line);vertical-align:top;}
table.t td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:800;}
table.t td.k{font-weight:800;color:var(--deep);white-space:nowrap;}
table.t tr.tot td{border-top:3px solid var(--deep);font-weight:800;}
.formula{background:var(--deep);color:#fff;border-radius:10px;padding:.7em 1em;margin:.3em 0 .6em;font-size:clamp(20px,2.6vw,34px);font-weight:800;line-height:1.35;}
.formula small{display:block;font-size:.58em;font-weight:700;color:#A9DCE2;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:.25em;}
/* special slides */
.title .inner{justify-content:center;}
.title .eyebrow{font-size:clamp(14px,1.7vw,21px);font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--teal);margin-bottom:.8em;}
.title h1{font-size:clamp(36px,5.6vw,76px);font-weight:800;line-height:1.05;letter-spacing:-1px;color:var(--deep);margin-bottom:.45em;}
.title p{color:var(--dim);}
.title .url{display:inline-block;background:var(--amber);padding:.3em .7em;border-radius:8px;font-weight:800;font-size:clamp(17px,2.2vw,28px);color:var(--ink);margin-top:.4em;}
.part{background:var(--deep);} .part .inner{justify-content:center;}
.part .num{font-size:clamp(16px,2vw,25px);font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--amber);margin-bottom:.6em;}
.part h2{color:#fff;font-size:clamp(34px,5.2vw,68px);} .part p{color:#DCEFF2;}
.todo .inner{background:#FFF8E1;}
.todo h2{color:var(--ink);}
.todo .go{display:inline-block;background:var(--deep);color:#fff;font-weight:800;border-radius:10px;padding:.45em .9em;font-size:clamp(20px,2.6vw,34px);margin-bottom:.7em;}
.count{position:fixed;bottom:14px;right:22px;font-size:14px;font-weight:800;color:var(--dim);font-variant-numeric:tabular-nums;z-index:5;}
.pbar{position:fixed;left:0;bottom:0;height:5px;background:var(--teal);width:0;transition:width .3s;z-index:6;}
.help{position:fixed;bottom:14px;left:22px;font-size:12.5px;color:#7A8E93;z-index:5;}
.help kbd{background:var(--pale);padding:1px 6px;font-family:inherit;font-weight:800;color:var(--dim);border-radius:3px;}
.note{position:fixed;left:0;right:0;bottom:0;background:#10262B;border-top:4px solid var(--amber);color:#fff;padding:16px 6vw;font-size:19px;line-height:1.45;display:none;z-index:9;}
.note.on{display:block;} .note b{color:var(--amber);}
a.dl{position:fixed;bottom:40px;right:22px;z-index:7;font-size:13px;font-weight:800;color:#fff;background:var(--teal);padding:7px 12px;text-decoration:none;border-radius:6px;}
@media screen and (max-width:820px){.two,.three{grid-template-columns:1fr;gap:12px;} .loc{flex-wrap:wrap;} .loc .strip{flex-wrap:wrap;} .inner{justify-content:flex-start;overflow:auto;}}
/* print = one slide per 16:9 page (files/seanceN-slides.pdf, _build/slides_pdf.py) */
@page{size:1280px 720px;margin:0;}
@media print{html,body{height:auto;overflow:visible;} .deck{position:static;} .slide{display:flex !important;position:relative;inset:auto;width:1280px;height:720px;break-after:page;page-break-after:always;overflow:hidden;} .count,.pbar,.help,.note,a.dl{display:none !important;} *{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
"""

JS = r"""
(function(){
  var slides=[].slice.call(document.querySelectorAll('.slide'));
  var i=0, N=slides.length, notesOn=false;
  var count=document.getElementById('count'), pbar=document.getElementById('pbar'), noteEl=document.getElementById('note');
  function show(n){
    i=Math.max(0,Math.min(N-1,n));
    slides.forEach(function(s,k){s.classList.toggle('on',k===i);});
    count.textContent=(i+1)+' / '+N;
    pbar.style.width=((i+1)/N*100)+'%';
    if(notesOn)drawNote();
    if(location.hash!=='#'+(i+1))history.replaceState(null,'','#'+(i+1));
  }
  function drawNote(){
    var t=slides[i].getAttribute('data-note')||'';
    noteEl.innerHTML='<b>Diapositive '+(i+1)+' · à dire :</b> '+t;
    noteEl.classList.toggle('on',notesOn);
  }
  function next(){show(i+1);} function prev(){show(i-1);}
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();next();}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev();}
    else if(e.key==='Home'){show(0);} else if(e.key==='End'){show(N-1);}
    else if(e.key==='f'||e.key==='F'){ if(!document.fullscreenElement)document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen(); else document.exitFullscreen&&document.exitFullscreen(); }
    else if(e.key==='s'||e.key==='S'){ notesOn=!notesOn; drawNote(); }
  });
  document.getElementById('deck').addEventListener('click',function(e){
    if(e.target.closest('a'))return;
    if(e.clientX < window.innerWidth*0.33) prev(); else next();
  });
  var x0=null;
  document.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
  document.addEventListener('touchend',function(e){ if(x0==null)return; var dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>45){dx<0?next():prev();} x0=null;},{passive:true});
  var start=parseInt((location.hash||'').replace('#',''),10);
  show(isFinite(start)&&start>=1?start-1:0);
})();
"""


def fit(css):
    """Type scales with the screen's HEIGHT too, so a 16:9 projector (and the PDF) never overflows."""
    import re
    return re.sub(r'clamp\((\d+)px,([\d.]+)vw,(\d+)px\)',
                  lambda m: 'clamp(%spx,min(%svw,%.2fvh),%spx)' % (m.group(1), m.group(2), float(m.group(2)) * 1.5, m.group(3)), css)


def esc(s):
    return s.replace('&', '&amp;').replace('"', '&quot;')


class Deck:
    def __init__(self, n, strip, gen='slides_s45.py'):
        self.n, self.strip, self.out, self.gen = n, strip, [], gen

    def loc(self, sec, card):
        """sec = '4.1'; card = the heading of the card on the séance page."""
        strip = ''.join('<span%s>%s</span>' % (' class="cur"' if k == sec else '', lab) for k, lab in self.strip)
        where = '<small>Le même texte sur le site · page de la séance %d</small><em>Section %s</em> %s' % (
            self.n, sec, ('carte « %s »' % card) if card else '')
        return '<div class="loc"><div class="where">%s</div><div class="strip">%s</div></div>' % (where, strip)

    def slide(self, sec, card, title, body, note='', cls=''):
        head = self.loc(sec, card) if sec else ''
        self.out.append('<section class="slide %s" data-note="%s">%s<div class="inner"><h2>%s</h2>%s</div></section>' % (cls, esc(note), head, title, body))

    def raw(self, cls, inner, note=''):
        self.out.append('<section class="slide %s" data-note="%s"><div class="inner">%s</div></section>' % (cls, esc(note), inner))

    def html(self, title, desc):
        slides = '\n\n'.join(self.out).replace('<section class="slide ', '<section class="slide on ', 1)
        return """<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<base href="/Kalaidos/fl3/">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>%s</title>
<meta name="description" content="%s">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0B4F58">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📒</text></svg>">
<!-- GENERATED by _build/%s — edit the generator, not this file. -->
<style>%s</style>
</head>
<body>
<a class="dl" href="files/seance%d-slides.pdf" download="FL3-seance%d-diapositives.pdf" title="Télécharger les diapositives en PDF (une diapositive par page)">⬇ Télécharger en PDF</a>
<div class="deck" id="deck">

%s

</div>
<div class="count" id="count"></div>
<div class="pbar" id="pbar"></div>
<div class="help"><kbd>←</kbd> <kbd>→</kbd> changer de diapositive · <kbd>F</kbd> plein écran · <kbd>S</kbd> notes de l’enseignant</div>
<div class="note" id="note"></div>
<script>%s</script>
</body>
</html>
""" % (title, desc, self.gen, fit(CSS), self.n, self.n, slides, JS)


