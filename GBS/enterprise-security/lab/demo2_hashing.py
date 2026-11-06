#!/usr/bin/env python3
"""
DEMO 2 · Why a stolen password file is not game over — if it was stored right.

Enterprise Security, Cyber Warfare & Asset Protection — classroom lab.
Runs entirely on your own machine. No network, no targets.

    python3 demo2_hashing.py

A breach gives the attacker the *hashes*, not the passwords. How fast they
turn hashes back into passwords depends only on how the defender stored them.
This measures that speed on this very laptop:

  - fast hash  (one SHA-256)      : how most leaked databases were stored
  - slow hash  (PBKDF2, 200k)     : how they SHOULD have been stored

Same laptop, same attacker. The only thing that changes is the defender's
choice, and it changes the answer by a factor of hundreds of thousands.
"""

import hashlib, os, time

SALT = os.urandom(16)

def bench(label, fn, sample):
    """Time `sample` guesses, return guesses-per-second. We use a big sample
    for the fast hash and a small one for the slow hash so both finish
    quickly; the rate is per-second either way, so they compare fairly."""
    t0 = time.perf_counter()
    for i in range(sample):
        fn(f"guess{i}")
    dt = time.perf_counter() - t0
    rate = sample / dt
    print(f"  {label:<26} {rate:>14,.0f} guesses / second")
    return rate

def main():
    print()
    print("  Attacker has the hash file. How fast can they guess through it?")
    print("  (timing on THIS machine; please wait a moment)")
    print("  " + "-" * 56)

    fast = bench("fast hash  (SHA-256)",
                 lambda pw: hashlib.sha256((pw).encode()).digest(), 200_000)

    slow = bench("slow hash  (PBKDF2 200k)",
                 lambda pw: hashlib.pbkdf2_hmac("sha256", pw.encode(), SALT, 200_000), 200)

    print("  " + "-" * 56)
    factor = fast / slow if slow else 0
    print(f"  The slow hash is about {factor:,.0f}x harder to guess through.")
    print()
    print("  Put in human terms: a list the attacker clears in one hour against")
    print(f"  the fast hash takes them roughly {factor/24:,.0f} days against the slow one.")
    print("  Same stolen file. The defender's storage choice is the whole game.\n")

if __name__ == "__main__":
    main()
