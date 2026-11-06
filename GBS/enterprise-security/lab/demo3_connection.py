#!/usr/bin/env python3
"""
DEMO 3 · What "a connection" actually is — the thing EDR watches for.

Enterprise Security, Cyber Warfare & Asset Protection — classroom lab.
This talks between two terminals ON THE SAME MACHINE (127.0.0.1, the
loopback address that never leaves your laptop). It is a plain text relay:
one side listens, the other connects, lines of text pass between them.

    # terminal 1 — the machine that waits for a call:
    python3 demo3_connection.py listen

    # terminal 2 — the machine that calls out:
    python3 demo3_connection.py connect

Why this matters, and the line we deliberately do NOT cross:

A command-and-control "beacon" — the thing malware opens after it lands —
is, mechanically, exactly this socket: a program that calls out and then
does what comes back down the line. The ONLY difference between this
harmless chat and a weapon is whether you wire the far end to a shell.
We do not, on purpose: that is the line between a demonstration and an
attack tool, and naming it is half the lesson.

The defensive point: the malicious part is not clever. It is one outbound
connection. That is why the defences are about the *connection itself* —
egress firewall rules (which machines may call out, and to where), and
EDR that flags a process like a document viewer suddenly opening a socket.
You stop the beacon by watching for the call, because the call is simple.
"""

import socket, sys, threading

HOST, PORT = "127.0.0.1", 65432    # loopback only — this never leaves the laptop

def pump(src, dst, tag):
    """Copy text from one socket to the screen, line by line."""
    f = src.makefile("r")
    for line in f:
        print(f"{tag} {line.rstrip()}")

def listen():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen(1)
    print(f"  [listener] waiting on {HOST}:{PORT} ...  (this is the 'victim' waiting)")
    conn, addr = s.accept()
    print(f"  [listener] a connection arrived from {addr[0]}:{addr[1]}")
    print("  Type a line and press return. Ctrl-C to stop.\n")
    threading.Thread(target=pump, args=(conn, None, "  them >"), daemon=True).start()
    try:
        for line in sys.stdin:
            conn.sendall(line.encode())
    except KeyboardInterrupt:
        pass
    conn.close()

def connect():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print(f"  [caller] calling out to {HOST}:{PORT} ...  (this is the 'beacon' dialling home)")
    s.connect((HOST, PORT))
    print("  [caller] connected. Type a line and press return. Ctrl-C to stop.\n")
    threading.Thread(target=pump, args=(s, None, "  them >"), daemon=True).start()
    try:
        for line in sys.stdin:
            s.sendall(line.encode())
    except KeyboardInterrupt:
        pass
    s.close()

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "listen":
        listen()
    elif mode == "connect":
        connect()
    else:
        print(__doc__)
