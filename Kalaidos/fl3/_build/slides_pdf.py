#!/usr/bin/env python3
"""FL III — every deck (seanceN-slides.html) printed to files/seanceN-slides.pdf.

Jan Erik, 10 Nov 2026: "add the function to download the slides". The deck's
own @media print gives one slide per 1280×720 page; headless Chrome prints it.
The speaker notes (data-note) are not printed. Run after editing a deck:
    python3 _build/slides_pdf.py            # every deck
    python3 _build/slides_pdf.py seance1    # one deck
The decks carry <base href="/Kalaidos/fl3/">, so they are served from the web root.
"""
import os, sys, glob, subprocess, threading, http.server, socketserver, functools

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
WEB = os.path.abspath(os.path.join(ROOT, '..', '..'))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PORT = 8792

decks = sorted(glob.glob(os.path.join(ROOT, 'seance*-slides.html')))
if len(sys.argv) > 1:
    decks = [d for d in decks if os.path.basename(d).split('-')[0] in sys.argv[1:]]
os.makedirs(os.path.join(ROOT, 'files'), exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=WEB))
threading.Thread(target=srv.serve_forever, daemon=True).start()
try:
    for d in decks:
        name = os.path.basename(d)[:-5]
        out = os.path.join(ROOT, 'files', name + '.pdf')
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                        '--virtual-time-budget=4000', '--print-to-pdf=' + out,
                        'http://127.0.0.1:%d/Kalaidos/fl3/%s.html' % (PORT, name)],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(name, '→ files/' + name + '.pdf', os.path.getsize(out) // 1024, 'KB')
finally:
    srv.shutdown()
