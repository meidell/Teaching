# Terminal lab — the live-demo companion to Session 4 "The arsenal"

Four small Python programs you run in Terminal on your own Mac and show by
sharing your screen. They make the mechanisms visible the way the in-page
gadgets on Session 4 cannot: real commands, real output.

## The one rule, said out loud in class
**Every target here is your own laptop.** Nothing connects to the internet;
the "connection" demo talks to `127.0.0.1` (loopback), which never leaves the
machine. You only ever run things like this against systems you own or have
written permission to test. That rule *is* the professional boundary — model
it for the students.

## Setup
macOS already ships Python 3, so there is nothing to install.
```
cd GBS/enterprise-security/lab
python3 demo1_passwords.py
```
Everything is pure standard library. No pip, no accounts, no network.

## The four demos (run in this order)

**1 · demo1_passwords.py — why weak passwords fall, and what stops it**
```
python3 demo1_passwords.py              # defences off: the password is found
python3 demo1_passwords.py --defended   # same guesses: locked out at 5
```
Lesson: the guessing is identical. Only the victim's settings change — a slow
hash and a lockout. You cannot stop guessing; you make it cost more and cap it.

**2 · demo2_hashing.py — why a stolen password file isn't game over**
```
python3 demo2_hashing.py                # ~10 seconds
```
Times this laptop guessing through a fast hash vs a slow one. Same stolen
file, same attacker; the defender's storage choice changes the answer by
~100,000×. This is why "salt and a slow hash" is the whole lesson of storage.

**3 · demo3_connection.py — what "a connection" actually is**
Two terminals, side by side on screen:
```
# terminal 1
python3 demo3_connection.py listen
# terminal 2
python3 demo3_connection.py connect
```
Type in one, it appears in the other. A command-and-control beacon is
mechanically just this socket. We deliberately do **not** wire the far end to
a shell — that is the line between a demo and a weapon, and naming it is half
the lesson. Defence: the malicious part is one outbound connection, which is
why egress firewall rules and EDR watch the connection itself.

**4 · demo4_sqli.py — one apostrophe walks past the login**
```
python3 demo4_sqli.py
```
Runs the same attacker input (`' OR '1'='1' --`) two ways against a throwaway
in-memory table: glued into the query (logs in with no password) and passed
as a parameter (does nothing). One line of code is the entire fix.

## Showing it well
- Make the Terminal font large (⌘+ a few times) before you share.
- Run each demo's "broken" version first, let it land, then the defended one.
- After each, point back at the kill chain on the Session 4 page.
