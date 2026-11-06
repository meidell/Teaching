#!/usr/bin/env python3
"""
DEMO 1 · Why weak passwords fall, and the three things that stop it.

Enterprise Security, Cyber Warfare & Asset Protection — classroom lab.
Run on your own machine only. Nothing here touches a network: the
"attacker" and the "victim" are the same program, so what you are
watching is a simulation of guessing, not a tool pointed at anyone.

    python3 demo1_passwords.py            # weak login, no defences  -> falls
    python3 demo1_passwords.py --defended # same guesses, defences on -> stops

The lesson: the guessing is identical in both runs. Only the victim's
settings change. That is the whole point — you cannot stop the attacker
from guessing, you make each guess cost more and cap how many they get.
"""

import sys, time, hashlib, os

# ---- the "victim": one account with a weak, human-chosen password --------
# We store the password the correct way (salted, hashed), never in the clear.
SALT = os.urandom(16)
REAL_PASSWORD = "Summer2024"            # the kind of password people really pick

def slow_hash(pw: str, rounds: int) -> bytes:
    """A deliberately slow, salted hash (PBKDF2, Python standard library).
    More rounds = each check costs more. This is the defender's main dial."""
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), SALT, rounds)

# ---- a tiny guess list: the most common weak passwords -------------------
# A real list has millions of lines; fifteen is enough to make the point.
GUESSES = [
    "123456", "password", "qwerty", "letmein", "admin",
    "welcome", "monkey", "dragon", "football", "iloveyou",
    "Summer2023", "Spring2024", "Summer2024", "Autumn2024", "P@ssw0rd",
]

def main():
    defended = "--defended" in sys.argv

    # The defender's three settings. OFF in the first run, ON in the second.
    ROUNDS   = 200_000 if defended else 1     # slow hash vs none
    MAX_TRIES = 5      if defended else 10**9  # lock the account vs never
    stored = slow_hash(REAL_PASSWORD, ROUNDS)

    print()
    print("  Target account : arvane_ops")
    print("  Defences       :", "ON  (slow hash · lockout after 5)" if defended
                                else "OFF (fast hash · no lockout)")
    print("  " + "-" * 52)
    time.sleep(0.6)

    start = time.time()
    for i, guess in enumerate(GUESSES, 1):
        if i > MAX_TRIES:
            print("  " + "-" * 52)
            print(f"  >> Account LOCKED after {MAX_TRIES} wrong tries.")
            print(f"     The attacker never reached guess #{i} ('{guess}').")
            print("     Real password was never found.\n")
            return

        # each guess is hashed the same slow/fast way and compared
        ok = (slow_hash(guess, ROUNDS) == stored)
        time.sleep(0.15)                       # just so the class can read it
        mark = "  <== MATCH" if ok else ""
        print(f"  try {i:>2}: {guess:<12} {'OK' if ok else 'no':>3}{mark}")

        if ok:
            dt = time.time() - start
            print("  " + "-" * 52)
            print(f"  >> Cracked in {i} guesses, {dt:.2f} s.")
            print("     A real list runs millions of guesses a second.\n")
            return

    print("  (exhausted the demo list)\n")

if __name__ == "__main__":
    main()
