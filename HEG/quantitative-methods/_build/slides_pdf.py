#!/usr/bin/env python3
"""Quantitative Methods I — a week's lecture deck printed to files/weekN-slides.pdf.

Jan Erik, 25 Nov 2026: "add the automated slides so that they can be downloaded".
Every weekN.html builds its deck into #printDeck at load, and quant.css's
@media print lays it out one slide per A4-landscape page (the site, the
topbar and the live deck are hidden); the speaker notes are not printed.
Headless Chrome prints that. Run after editing a week's SLIDES:
    python3 _build/slides_pdf.py 11        # one week
    python3 _build/slides_pdf.py 10 11     # several
The pages carry <base href="/HEG/quantitative-methods/">, so they are served
from the web root on a throw-away local server. Needs Google Chrome in
/Applications. ?print=1 keeps the student sign-in box off the pages (the week
page reads it); the print CSS hides the site, the live deck and the chat.
The ⬇ Slides PDF button in a week's topbar links the file;
a week whose PDF was never printed shows a 404, so print before shipping.
"""
import os, sys, subprocess, threading, http.server, socketserver, functools

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
WEB = os.path.abspath(os.path.join(ROOT, '..', '..'))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PORT = 8793

weeks = sys.argv[1:] or ['11']
os.makedirs(os.path.join(ROOT, 'files'), exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=WEB))
threading.Thread(target=srv.serve_forever, daemon=True).start()
try:
    for w in weeks:
        name = 'week%s' % w
        out = os.path.join(ROOT, 'files', name + '-slides.pdf')
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                        '--virtual-time-budget=6000', '--print-to-pdf=' + out,
                        'http://127.0.0.1:%d/HEG/quantitative-methods/%s.html?print=1' % (PORT, name)],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(name, '→ files/' + name + '-slides.pdf', os.path.getsize(out) // 1024, 'KB')
finally:
    srv.shutdown()
