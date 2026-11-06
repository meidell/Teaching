#!/usr/bin/env python3
"""
DEMO 4 · SQL injection — one quoted apostrophe walks past the login.

Enterprise Security, Cyber Warfare & Asset Protection — classroom lab.
Self-contained: it builds a tiny users table IN MEMORY (sqlite3, Python
standard library) and logs in against it. There is no server and no file;
the "database" vanishes when the program ends.

    python3 demo4_sqli.py

You will see the SAME login input run two ways:
  1. the VULNERABLE way  — the username is glued straight into the query
  2. the FIXED way       — the username is passed as a parameter

The attacker's input is the classic:   ' OR '1'='1' --
Against (1) it logs in with no password. Against (2) it does nothing.
One line of code is the whole difference.
"""

import sqlite3

def build():
    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE users (name TEXT, password TEXT, role TEXT)")
    db.executemany("INSERT INTO users VALUES (?,?,?)", [
        ("arvane_ops", "Summer2024", "operator"),
        ("admin",      "9f3$Kx!2qL", "administrator"),
    ])
    db.commit()
    return db

def vulnerable_login(db, user, pw):
    # DANGER: the user's text is pasted straight into the SQL string.
    q = ("SELECT name, role FROM users "
         f"WHERE name = '{user}' AND password = '{pw}'")
    print("    query sent to the database:")
    print("      " + q)
    try:
        rows = db.execute(q).fetchall()
    except sqlite3.Error as e:
        print("    (database error:", e, ")")
        return []
    return rows

def safe_login(db, user, pw):
    # SAFE: the text is passed as data (?), never as part of the command.
    q = "SELECT name, role FROM users WHERE name = ? AND password = ?"
    print("    query sent to the database:")
    print("      " + q + "        params =", (user, pw))
    return db.execute(q, (user, pw)).fetchall()

def show(rows):
    if rows:
        print("    >> LOGGED IN as:", ", ".join(f"{n} ({r})" for n, r in rows))
    else:
        print("    >> rejected.")
    print()

def main():
    db = build()

    # the attacker types this where a username is expected:
    attacker_user = "' OR '1'='1' --"
    attacker_pw   = "anything"

    print()
    print("  Attacker's username :", repr(attacker_user))
    print("  Attacker's password :", repr(attacker_pw), " (they don't know a real one)")
    print("  " + "=" * 60)

    print("\n  1) VULNERABLE login (username glued into the query):\n")
    show(vulnerable_login(db, attacker_user, attacker_pw))

    print("  2) FIXED login (username passed as a parameter):\n")
    show(safe_login(db, attacker_user, attacker_pw))

    print("  " + "=" * 60)
    print("  Same input. In (1) the apostrophe ends the name and 'OR 1=1'")
    print("  makes every row match, so the first user is logged in — no")
    print("  password needed. In (2) the input is only ever data, so it is")
    print("  just a username that does not exist. That one change is the fix.\n")

if __name__ == "__main__":
    main()
