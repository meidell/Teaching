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
DAYS = ['journee1', 'journee2', 'journee3', 'journee4']
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

if __name__ == '__main__':
    main(sys.argv[1:] or DAYS)
