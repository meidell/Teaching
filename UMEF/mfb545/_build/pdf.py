#!/usr/bin/env python3
"""MFB 545 — every view of a day page, printed to one PDF (24 Oct 2026).

Jan Erik: "make a pdf (of each view in a session) downloadable from the
course landing page". A journée page shows one section (.screen) at a
time; this prints them ALL, in order — the day's home screen first, then
1.1, 1.2 … — with every step-by-step walkthrough opened, one section per
page, A4 portrait. Output: files/journeeN.pdf and files/journeeN-en.pdf,
which the hub links (index.html → DAYS[].pdf).

Run after editing a day page (and after build_en.py):
    python3 _build/pdf.py            # every live day, both languages
    python3 _build/pdf.py journee3   # one day

How: a temporary copy of the page is written next to it (the pages carry
<base href="/UMEF/mfb545/">, so they must be served from the web root),
with the network scripts that would log or prompt taken out and a print
stylesheet + a small script put in; headless Chrome prints it; the copy is
deleted. Workbook fields print empty and the quiz prints locked: the PDF
is the day's content, not a student's answers.
"""
import os, re, subprocess, sys, threading, http.server, socketserver, functools, time

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
WEB = os.path.abspath(os.path.join(ROOT, '..', '..'))      # the web root
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
DAYS = ['journee1', 'journee2', 'journee3', 'journee4', 'journee5']
PORT = 8791

CSS = r"""<style id="pdfcss">
@media print, screen{
  .topbar,.crumb,.nav-foot,.sec-status,#jc-btn,#jc-panel,#cl-pill,#cl-modal,#ann-bar,#jem-hat,#jem-admin,
  .reset-link,.day-reset,#printDeck,#lect{display:none!important;}
  .wrap{display:block!important;}
  .screen{display:block!important;}
  .screen + .screen{break-before:page;page-break-before:always;}
  .step-row{display:block!important;opacity:1!important;max-height:none!important;}
  details{display:block;} details > *{display:block;}
  body{background:#fff!important;}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
}
@page{size:A4 portrait;margin:12mm 12mm 14mm;}
</style>"""

JS = r"""<script>
window.addEventListener('load',function(){setTimeout(function(){
  /* open every walkthrough: press each step button until it is spent */
  for(var round=0;round<40;round++){
    var any=false;
    document.querySelectorAll('button').forEach(function(b){
      if(b.disabled)return;
      var t=(b.textContent||'');
      if(/^(Commencer|Start|Étape suivante|Next step)/.test(t)){b.click();any=true;}
    });
    if(!any)break;
  }
  document.querySelectorAll('details').forEach(function(d){d.open=true;});
},1200);});
</script>"""

def strip(html):
    # scripts that would log a pageview, prompt a sign-in, open a chat, write anything
    for src in ['/track.js', '/shared/login.js', '/shared/chat.js', '/shared/announce.js',
                '/shared/boardlink.js', '/shared/progress.js', 'presence.js']:
        html = re.sub(r'<script[^>]*src="%s"[^>]*></script>\s*' % re.escape(src), '', html)
    html = html.replace('<head>', '<head><script>window.COURSE_LOGIN_AUTO=false;</script>', 1)
    i = html.rfind('</body>')
    return html[:i] + CSS + JS + html[i:]

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=WEB)
    socketserver.TCPServer.allow_reuse_address = True
    s = socketserver.TCPServer(('127.0.0.1', PORT), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s

def main(names):
    srv = serve()
    os.makedirs(os.path.join(ROOT, 'files'), exist_ok=True)
    try:
        for n in names:
            for suf in ['', '-en']:
                page = n + suf
                src = os.path.join(ROOT, page + '.html')
                if not os.path.exists(src): print('skip', page); continue
                tmp = os.path.join(ROOT, '_pdf_' + page + '.html')
                open(tmp, 'w', encoding='utf-8').write(strip(open(src, encoding='utf-8').read()))
                out = os.path.join(ROOT, 'files', page + '.pdf')
                try:
                    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                                    '--virtual-time-budget=6000', '--run-all-compositor-stages-before-draw',
                                    '--print-to-pdf=' + out,
                                    'http://127.0.0.1:%d/UMEF/mfb545/_pdf_%s.html' % (PORT, page)],
                                   check=True, capture_output=True, timeout=120)
                finally:
                    os.unlink(tmp)
                print('%-14s → files/%s.pdf  %d KB' % (page, page, os.path.getsize(out) // 1024))
    finally:
        srv.shutdown()


# ---- the whole course as ONE PDF (31 Oct 2026, Jan Erik: "a pdf with the full
# content of the fintech class … downloadable from that course landing site").
# Cover (UMEF logo, title, contents) + the hub page (syllabus, grading, project
# brief) + every live day, merged with pypdf, with an outline per chapter.
# files/mfb545-cours-complet.pdf and files/mfb545-course-complete.pdf.
COVER = {
 '': dict(lang='fr', title='Fintech', sub='Paiements, crédit digital, blockchain, réglementation — et un projet : créer sa fintech',
          school='Swiss UMEF · Master en Finance et Banque · MFB 545 · 2026–2027', who='Prof. Jan Erik Meidell, PhD',
          toc='Table des matières', hub='Le cours : programme, évaluation, projet « Créer sa fintech »', day='Journée',
          made='Le contenu complet des pages du cours, tel qu’il est en ligne sur janerikmeidell.com/UMEF/mfb545/ — généré le',
          exam='Examen final écrit : vendredi 5 février 2027, 09h45', out='mfb545-cours-complet'),
 '-en': dict(lang='en', title='Fintech', sub='Payments, digital credit, blockchain, regulation — and a project: build your fintech',
          school='Swiss UMEF · Master in Finance and Banking · MFB 545 · 2026–2027', who='Prof. Jan Erik Meidell, PhD',
          toc='Contents', hub='The course: programme, grading, the “Build your fintech” project', day='Day',
          made='The complete content of the course pages, as online at janerikmeidell.com/UMEF/mfb545/ — generated on',
          exam='Final written exam: Friday 5 February 2027, 09:45', out='mfb545-course-complete'),
}
def day_titles(suf):
    import json
    cp = open(os.path.join(ROOT, 'courseprogress.js'), encoding='utf-8').read()
    out = []
    for n in DAYS:
        m = re.search(r"mod:'w%s'.*?name:T\('([^']*)','([^']*)'\)" % n[-1], cp)
        out.append(m.group(2 if suf else 1) if m else n)
    return out

def cover_html(suf, titles, pages):
    c = COVER[suf]; import datetime
    date = datetime.date.today().strftime('%d.%m.%Y')
    rows = ''.join('<tr><td>%s</td><td>%s</td></tr>' % (t, p) for t, p in zip(titles, pages))
    return '''<!doctype html><html lang="%(lang)s"><head><meta charset="utf-8"><style>
@page{size:A4 portrait;margin:0;} body{margin:0;font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;color:#15232B;}
.cv{height:297mm;box-sizing:border-box;padding:28mm 24mm;background:linear-gradient(180deg,#176B87 0,#176B87 62mm,#fff 62mm);break-after:page;}
.cv img{height:22mm;background:#fff;padding:6px 10px;border-radius:8px;}
.cv .t{margin-top:58mm;font-size:54px;font-weight:800;letter-spacing:-.5px;color:#15232B;}
.cv .s{font-size:19px;color:#3B4A55;margin-top:10px;line-height:1.4;max-width:140mm;}
.cv .m{margin-top:26mm;font-size:14px;color:#3B4A55;line-height:1.7;}
.cv .m b{color:#176B87;}
.tc{height:297mm;box-sizing:border-box;padding:26mm 24mm;}
.tc h2{font-size:26px;color:#176B87;margin:0 0 16px;}
.tc table{width:100%%;border-collapse:collapse;font-size:15px;}
.tc td{padding:9px 6px;border-bottom:1px solid #E1E6EA;vertical-align:top;} .tc td:last-child{text-align:right;color:#6B7A86;width:14mm;}
.tc p{font-size:12.5px;color:#6B7A86;margin-top:22px;line-height:1.6;}
</style></head><body>
<div class="cv"><img src="../swiss_umef_logo.jpg" alt="Swiss UMEF"><div class="t">%(title)s</div><div class="s">%(sub)s</div>
<div class="m"><b>%(school)s</b><br>%(who)s<br>%(exam)s</div></div>
<div class="tc"><h2>%(toc)s</h2><table>%(rows)s</table><p>%(made)s %(date)s.</p></div>
</body></html>''' % dict(c, rows=rows, date=date)

def full():
    from pypdf import PdfWriter, PdfReader
    srv = serve()
    try:
        for suf in ['', '-en']:
            c = COVER[suf]; files = os.path.join(ROOT, 'files')
            # the hub page
            tmp = os.path.join(ROOT, '_pdf_hub%s.html' % suf)
            open(tmp, 'w', encoding='utf-8').write(strip(open(os.path.join(ROOT, 'index%s.html' % suf), encoding='utf-8').read()))
            hub = os.path.join(files, '_hub%s.pdf' % suf)
            subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=6000',
                            '--run-all-compositor-stages-before-draw', '--print-to-pdf=' + hub,
                            'http://127.0.0.1:%d/UMEF/mfb545/_pdf_hub%s.html' % (PORT, suf)], check=True, capture_output=True, timeout=120)
            os.unlink(tmp)
            parts = [(c['hub'], hub)] + [('%s %d · %s' % (c['day'], i + 1, t.split(' · ', 1)[-1]), os.path.join(files, '%s%s.pdf' % (d, suf)))
                                         for i, (d, t) in enumerate(zip(DAYS, day_titles(suf)))]
            # page numbers for the contents (cover = 2 pages)
            starts, n = [], 3
            for _, f in parts:
                starts.append(n); n += len(PdfReader(f).pages)
            tmpc = os.path.join(ROOT, '_pdf_cover%s.html' % suf)
            open(tmpc, 'w', encoding='utf-8').write(cover_html(suf, [t for t, _ in parts], starts))
            cov = os.path.join(files, '_cover%s.pdf' % suf)
            subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + cov,
                            'http://127.0.0.1:%d/UMEF/mfb545/_pdf_cover%s.html' % (PORT, suf)], check=True, capture_output=True, timeout=120)
            os.unlink(tmpc)
            w = PdfWriter()
            for pg in PdfReader(cov).pages: w.add_page(pg)
            w.add_outline_item(c['toc'], 1)
            for (t, f), st in zip(parts, starts):
                for pg in PdfReader(f).pages: w.add_page(pg)
                w.add_outline_item(t, st - 1)
            w.add_metadata({'/Title': 'MFB 545 · %s · Swiss UMEF' % c['title'], '/Author': c['who'], '/Language': c['lang']})
            out = os.path.join(files, c['out'] + '.pdf')
            with open(out, 'wb') as fh: w.write(fh)
            os.unlink(hub); os.unlink(cov)
            print('%-26s %d pages  %d KB' % (c['out'] + '.pdf', len(w.pages), os.path.getsize(out) // 1024))
    finally:
        srv.shutdown()

if __name__ == '__main__':
    a = sys.argv[1:]
    if a == ['full']: full()
    else:
        main(a or DAYS)
        if not a: full()
