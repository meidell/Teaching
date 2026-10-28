#!/usr/bin/env python3
"""Build exam-cards.html (+ exam-cards.pdf) — 215 midterm practice cards for Quantitative Methods I.

    python3 HEG/quantitative-methods/_build/exam_cards.py

Every card is written HERE as data and checked before the page is written:
the true answer is recomputed with sympy from the question (`chk`), the
option marked correct must equal it, and no distractor may. The build stops
on the first card that fails.

⚠ THESE ARE NOT THE MIDTERM'S QUESTIONS. The cards train the same skills
on different functions, numbers and situations; no stem, function or
number set is copied from a midterm paper. Keep it that way when adding.

⚠ FORMAT MIRRORS THE PAPER: five options, E is always "None of the above",
and about one card in five has E as the right answer, because the paper
does too. The position of the right answer is assigned by a fixed plan
(balanced A–E, never three alike in a row) — not by where it was typed.
"""
import json, os, random, re
from sympy import (symbols, sympify, simplify, diff, sqrt, log, exp, Rational,
                   solve, expand_log, nsimplify, N, E as EE, expand)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "exam-cards.html"))
x, p, q, a, t, u, y, z = symbols("x p q a t u y z", positive=True)
NS = {"x": x, "p": p, "q": q, "a": a, "t": t, "u": u, "y": y, "z": z, "e": EE, "ln": log}


def F(n, d):
    """a stacked fraction"""
    return f'<span class="fr"><span>{n}</span><span>{d}</span></span>'


def S(v):
    return f'√<span class="ov">{v}</span>'


def val(s):
    """'e:expr' sympy · 'n:number' · 't:text key'"""
    k, v = s.split(":", 1)
    if k == "e":
        return ("e", sympify(v, locals=NS))
    if k == "n":
        return ("n", sympify(v, locals=NS))
    return ("t", v.strip())


def same(A, B):
    if A[0] != B[0]:
        return False
    if A[0] == "t":
        return A[1] == B[1]
    if A[0] == "n":
        return abs(float(N(A[1])) - float(N(B[1]))) < 1e-9
    d = simplify(A[1] - B[1])
    if d == 0:
        return True
    # numeric fallback at a few positive points (all variables positive)
    fs = sorted(d.free_symbols, key=str)
    for pt in (0.7, 1.3, 2.9):
        if abs(complex(N(d.subs({s: pt + i * 0.37 for i, s in enumerate(fs)})))) > 1e-9:
            return False
    return True


CARDS = []


def C(cat, title, stem, right, wrong, hint, sol, chk=None):
    """right = (html, val); wrong = four (html, val); chk = value recomputed from the question"""
    CARDS.append(dict(cat=cat, title=title, stem=stem, right=right, wrong=wrong, hint=hint, sol=sol, chk=chk))


# ======================================================================
# 1 · DOMAIN AND RANGE (8)
# ======================================================================
D = "Domain & range"
C(D, "Where a square root is defined",
  f"What is the domain of f(x) = {S('2x − 6')} ?",
  ("[3, +∞[", "t:[3,inf["),
  [("]3, +∞[", "t:]3,inf["), ("[−3, +∞[", "t:[-3,inf["), ("[6, +∞[", "t:[6,inf["), ("ℝ", "t:R")],
  "A square root needs what is under it to be ≥ 0 — not > 0.",
  "2x − 6 ≥ 0 ⇔ x ≥ 3. Zero is allowed under a root (√0 = 0), so the bracket is closed: <b>[3, +∞[</b>.",
  chk=val("t:[3,inf["))
C(D, "Two holes in the line",
  f"What is the domain of f(x) = {F('x + 1', 'x² − 9')} ?",
  ("ℝ \\ {−3, 3}", "t:R-{-3,3}"),
  [("ℝ \\ {3}", "t:R-{3}"), ("ℝ \\ {−1, 3}", "t:R-{-1,3}"), ("]−3, 3[", "t:]-3,3["), ("ℝ", "t:R")],
  "Only the denominator can forbid a value. Where is x² − 9 = 0?",
  "x² − 9 = 0 ⇔ x = 3 or x = −3 — both roots, not just the positive one. The numerator x + 1 forbids nothing. Domain: <b>ℝ \\ {−3, 3}</b>.",
  chk=val("t:R-{-3,3}"))
C(D, "A logarithm of a difference",
  "What is the domain of f(x) = ln(5 − x) ?",
  ("]−∞, 5[", "t:]-inf,5["),
  [("]5, +∞[", "t:]5,inf["), ("]−∞, 5]", "t:]-inf,5]"), ("ℝ \\ {5}", "t:R-{5}"), ("]0, 5[", "t:]0,5[")],
  "ln needs a strictly positive argument. Solve 5 − x > 0.",
  "5 − x > 0 ⇔ x < 5. Strict, because ln 0 does not exist: <b>]−∞, 5[</b>. Negative x are fine — ln(5 − (−10)) = ln 15.",
  chk=val("t:]-inf,5["))
C(D, "A root over a fraction",
  f"What is the domain of f(x) = {F(S('x − 2'), 'x − 4')} ?",
  ("[2, 4[ ∪ ]4, +∞[", "t:[2,4[u]4,inf["),
  [("[2, +∞[", "t:[2,inf["), ("]2, 4[ ∪ ]4, +∞[", "t:]2,4[u]4,inf["), ("ℝ \\ {4}", "t:R-{4}"), ("[4, +∞[", "t:[4,inf[")],
  "Two conditions at once: what is under the root ≥ 0, and the denominator ≠ 0.",
  "x − 2 ≥ 0 gives x ≥ 2; x − 4 ≠ 0 removes 4. Together: <b>[2, 4[ ∪ ]4, +∞[</b>. x = 2 is allowed: f(2) = 0 ⁄ (−2) = 0.",
  chk=val("t:[2,4[u]4,inf["))
C(D, "The top of a parabola",
  "What is the range of f(x) = 3 − x², for x ∈ ℝ ?",
  ("]−∞, 3]", "t:]-inf,3]"),
  [("]−∞, 3[", "t:]-inf,3["), ("[3, +∞[", "t:[3,inf["), ("ℝ", "t:R"), ("[0, 3]", "t:[0,3]")],
  "x² is never negative, so 3 − x² is never more than … ?",
  "x² ≥ 0, so 3 − x² ≤ 3, with 3 reached at x = 0. As |x| grows, f goes to −∞. Range: <b>]−∞, 3]</b> — closed at 3 because it is reached.",
  chk=val("t:]-inf,3]"))
C(D, "An exponential, lifted",
  "What is the range of f(x) = eˣ + 2 ?",
  ("]2, +∞[", "t:]2,inf["),
  [("[2, +∞[", "t:[2,inf["), ("]0, +∞[", "t:]0,inf["), ("ℝ", "t:R"), ("]3, +∞[", "t:]3,inf[")],
  "eˣ takes every value in ]0, +∞[ and never 0. Add 2 to everything.",
  "eˣ ∈ ]0, +∞[, so eˣ + 2 ∈ <b>]2, +∞[</b>. 2 is approached as x → −∞ but never reached, so the bracket is open.",
  chk=val("t:]2,inf["))
C(D, "A root plus one",
  f"What is the range of f(x) = {S('x')} + 1, for x ≥ 0 ?",
  ("[1, +∞[", "t:[1,inf["),
  [("]1, +∞[", "t:]1,inf["), ("[0, +∞[", "t:[0,inf["), ("ℝ", "t:R"), ("[−1, +∞[", "t:[-1,inf[")],
  "√x starts at 0 (for x = 0) and grows without limit.",
  "√x ∈ [0, +∞[, so √x + 1 ∈ <b>[1, +∞[</b>; 1 is reached at x = 0.",
  chk=val("t:[1,inf["))
C(D, "A price list with limits",
  "A shop sets its price by p(q) = 40 − 2q, and only for 0 ≤ q ≤ 20 units. Which prices can occur?",
  ("[0, 40]", "t:[0,40]"),
  [("[0, 20]", "t:[0,20]"), ("]0, 40[", "t:]0,40["), ("[20, 40]", "t:[20,40]"), ("ℝ", "t:R")],
  "p decreases with q. Compute p at both ends of the allowed q.",
  "p(0) = 40 and p(20) = 0, and p is a straight line in between, so it takes every value from 0 to 40: <b>[0, 40]</b>. [0, 20] is the domain, not the range.",
  chk=val("t:[0,40]"))

# ======================================================================
# 2 · FUNCTIONS: OPERATIONS AND COMPOSITION (8)
# ======================================================================
D = "Operations & composition"
C(D, "A product of two functions",
  "Let f(x) = 2x + 1 and g(x) = x². Compute (f · g)(3).",
  ("63", "n:63"),
  [("19", "n:19"), ("49", "n:49"), ("16", "n:16"), ("42", "n:42")],
  "(f · g)(3) means f(3) times g(3) — a product, not a composition.",
  "f(3) = 7, g(3) = 9, so (f · g)(3) = 7 × 9 = <b>63</b>. 19 is f(g(3)) and 49 is g(f(3)) — the two compositions.",
  chk=sympify(2 * 3 + 1) * 3 ** 2)
C(D, "Composition as a formula",
  "Let f(x) = x² − 1 and g(x) = x + 3. What is (f ∘ g)(x)?",
  ("x² + 6x + 8", "e:x**2+6*x+8"),
  [("x² + 2", "e:x**2+2"), ("x² + 8", "e:x**2+8"), ("x² + 6x + 10", "e:x**2+6*x+10"), ("x² + 3x + 8", "e:x**2+3*x+8")],
  "f ∘ g means: first g, then f. Replace every x in f by (x + 3).",
  "(f ∘ g)(x) = f(x + 3) = (x + 3)² − 1 = x² + 6x + 9 − 1 = <b>x² + 6x + 8</b>. x² + 2 is g ∘ f; x² + 8 forgets the middle term of (x + 3)².",
  chk=(x + 3) ** 2 - 1)
C(D, "Inside out, with a root",
  f"Let f(x) = {S('x')} and g(x) = 4x + 1. Compute (g ∘ f)(9).",
  ("13", "n:13"),
  [(S("37"), "n:sqrt(37)"), ("37", "n:37"), ("12", "n:12"), ("7", "n:7")],
  "First the inner function: f(9). Then feed the result to g.",
  "f(9) = 3, then g(3) = 4·3 + 1 = <b>13</b>. √37 is the other order, f(g(9)).",
  chk=4 * sqrt(9) + 1)
C(D, "A quotient at a point",
  f"Let f(x) = x³ − 2 and g(x) = x + 2. Compute ({F('f', 'g')})(2).",
  ("1.5", "n:1.5"),
  [(F("2", "3"), "n:2/3"), ("6", "n:6"), ("4", "n:4"), ("3", "n:3")],
  "Evaluate each function at 2 first, then divide.",
  "f(2) = 8 − 2 = 6, g(2) = 4, so (f ⁄ g)(2) = 6 ⁄ 4 = <b>1.5</b>. 2 ⁄ 3 is g ⁄ f.",
  chk=Rational(6, 4))
C(D, "Cost of an hour's production",
  "A workshop produces q(h) = 12h units in h hours, and the cost of q units is C(q) = 500 + 3q. Express the cost as a function of the hours worked.",
  ("C = 500 + 36h", "e:500+36*y"),
  [("C = 36h", "e:36*y"), ("C = 500 + 12h", "e:500+12*y"), ("C = 1 500 + 36h", "e:1500+36*y"), ("C = 536h", "e:536*y")],
  "Replace q in C(q) by 12h — a composition C(q(h)).",
  "C(q(h)) = 500 + 3(12h) = <b>500 + 36h</b>: the fixed 500 does not depend on the hours; each hour adds 12 units at 3 each.",
  chk=500 + 3 * 12 * y)
C(D, "The difference f(a + 1) − f(a)",
  "Let f(x) = x². Simplify f(a + 1) − f(a).",
  ("2a + 1", "e:2*a+1"),
  [("1", "e:1+0*a"), ("a² + 1", "e:a**2+1"), ("2a", "e:2*a"), ("2a + 2", "e:2*a+2")],
  "f(a + 1) means: replace x by the whole bracket (a + 1), then square it.",
  "(a + 1)² − a² = a² + 2a + 1 − a² = <b>2a + 1</b>. The answer 1 comes from writing f(a + 1) as f(a) + 1 — the classic slip.",
  chk=(a + 1) ** 2 - a ** 2)
C(D, "Taking a function apart",
  "h(x) = (3x − 1)⁵. Which pair gives h = f ∘ g ?",
  ("g(x) = 3x − 1, f(u) = u⁵", "t:ok"),
  [("g(x) = x⁵, f(u) = 3u − 1", "t:rev"), ("g(x) = 3x − 1, f(u) = 5u", "t:5u"), ("g(x) = x − 1, f(u) = (3u)⁵", "t:3u"), ("g(x) = 5x, f(u) = 3u − 1", "t:5x")],
  "g is what you compute first (the inside), f what you do to the result (the outside).",
  "Inside: 3x − 1. Outside: raise to the fifth power. So <b>g(x) = 3x − 1 and f(u) = u⁵</b>. The reversed pair gives 3x⁵ − 1; f(u) = (3u)⁵ applied to x − 1 gives (3x − 3)⁵.",
  chk=val("t:ok"))
C(D, "A function applied twice",
  "Let f(x) = 2x − 3. Compute f(f(2)).",
  ("−1", "n:-1"),
  [("1", "n:1"), ("4", "n:4"), ("−5", "n:-5"), ("2", "n:2")],
  "Work from the inside: f(2) first, then f of that.",
  "f(2) = 1, then f(1) = 2 − 3 = <b>−1</b>. 1 stops after one step; 4 is (f(2))² + 3, which is not a composition.",
  chk=2 * (2 * 2 - 3) - 3)

# ======================================================================
# 3 · INVERSE FUNCTIONS (6)
# ======================================================================
D = "Inverse functions"
def inv_ok(fexpr, gexpr):  # g is the inverse of f
    return simplify(fexpr.subs(x, gexpr) - x) == 0
C(D, "Undo a straight line",
  "Let f(x) = 4x − 7. What is f⁻¹(x)?",
  (F("x + 7", "4"), "e:(x+7)/4"),
  [(F("x", "4") + " + 7", "e:x/4+7"), (F("x − 7", "4"), "e:(x-7)/4"), ("4x + 7", "e:4*x+7"), (F("1", "4x − 7"), "e:1/(4*x-7)")],
  "Write y = 4x − 7 and solve for x. Undo the steps in reverse order: first +7, then ÷4.",
  "y = 4x − 7 ⇔ x = (y + 7) ⁄ 4, so <b>f⁻¹(x) = (x + 7) ⁄ 4</b>. Check: f(f⁻¹(5)) = f(3) = 5. 1 ⁄ (4x − 7) is 1 ⁄ f, not f⁻¹.",
  chk=sympify("(x+7)/4", locals=NS))
C(D, "Price → quantity",
  "Demand is p = 60 − 3q. Express the quantity demanded as a function of the price.",
  ("q = 20 − " + F("p", "3"), "e:20-p/3"),
  [("q = 60 − " + F("p", "3"), "e:60-p/3"), ("q = " + F("p − 60", "3"), "e:(p-60)/3"), ("q = 20 − 3p", "e:20-3*p"), ("q = 60 − 3p", "e:60-3*p")],
  "Solve p = 60 − 3q for q. Move 3q to one side first.",
  "3q = 60 − p ⇔ q = (60 − p) ⁄ 3 = <b>20 − p ⁄ 3</b>. Check: p = 30 gives q = 10, and 60 − 3·10 = 30.",
  chk=solve(sympify("60-3*q", locals=NS) - p, q)[0])
C(D, "Inverse of a rational function",
  f"Let f(x) = {F('2x + 1', 'x − 3')}, x ≠ 3. What is f⁻¹(x)?",
  (F("3x + 1", "x − 2"), "e:(3*x+1)/(x-2)"),
  [(F("3x − 1", "x − 2"), "e:(3*x-1)/(x-2)"), (F("x − 3", "2x + 1"), "e:(x-3)/(2*x+1)"), (F("3x + 1", "x + 2"), "e:(3*x+1)/(x+2)"), (F("x + 1", "2x − 3"), "e:(x+1)/(2*x-3)")],
  "y(x − 3) = 2x + 1. Expand, collect every x on one side, factor x out.",
  "yx − 3y = 2x + 1 ⇔ x(y − 2) = 3y + 1 ⇔ x = (3y + 1) ⁄ (y − 2). So <b>f⁻¹(x) = (3x + 1) ⁄ (x − 2)</b>. (x − 3) ⁄ (2x + 1) is 1 ⁄ f.",
  chk=sympify("(3*x+1)/(x-2)", locals=NS))
C(D, "Undo an exponential",
  "Let f(x) = e²ˣ. What is f⁻¹(x), for x > 0?",
  (F("ln x", "2"), "e:log(x)/2"),
  [("2 ln x", "e:2*log(x)"), ("ln(2x)", "e:log(2*x)"), ("e<sup>x⁄2</sup>", "e:exp(x/2)"), ("ln x − 2", "e:log(x)-2")],
  "y = e²ˣ. Take ln of both sides: ln y = 2x.",
  "ln y = 2x ⇔ x = ln(y) ⁄ 2, so <b>f⁻¹(x) = ln(x) ⁄ 2</b>. Check: f(ln(5) ⁄ 2) = e<sup>ln 5</sup> = 5.",
  chk=log(x) / 2)
C(D, "Undo a shifted logarithm",
  "Let f(x) = 3 + ln(x − 1), x > 1. What is f⁻¹(x)?",
  ("1 + e<sup>x − 3</sup>", "e:1+exp(x-3)"),
  [("e<sup>x − 3</sup> − 1", "e:exp(x-3)-1"), ("1 + e<sup>x + 3</sup>", "e:1+exp(x+3)"), ("ln(x − 3) + 1", "e:log(x-3)+1"), ("eˣ − 2", "e:exp(x)-2")],
  "Undo in reverse order: subtract 3, then exponentiate, then add 1.",
  "y − 3 = ln(x − 1) ⇔ e<sup>y − 3</sup> = x − 1 ⇔ x = 1 + e<sup>y − 3</sup>. So <b>f⁻¹(x) = 1 + e<sup>x − 3</sup></b>.",
  chk=1 + exp(x - 3))
C(D, "Undo a cube",
  "Let f(x) = x³ + 2. What is f⁻¹(x)?",
  ("∛(x − 2)", "e:(x-2)**(1/3)"),
  [("∛x − 2", "e:x**(1/3)-2"), ("∛(x + 2)", "e:(x+2)**(1/3)"), (F("1", "x³ + 2"), "e:1/(x**3+2)"), ("(x − 2)³", "e:(x-2)**3")],
  "Subtract 2 first, then take the cube root — the reverse of 'cube, then add 2'.",
  "y = x³ + 2 ⇔ x³ = y − 2 ⇔ x = ∛(y − 2). <b>f⁻¹(x) = ∛(x − 2)</b>. ∛x − 2 undoes the steps in the wrong order.",
  chk=sympify("(x-2)**(1/3)", locals=NS))

# ======================================================================
# 4 · EXPONENTIALS AND LOGARITHMS (9)
# ======================================================================
D = "Exponentials & logarithms"
C(D, "Solve an exponential equation",
  "Solve e²ˣ = 9.",
  ("x = ln 3", "n:log(3)"),
  [("x = ln 9", "n:log(9)"), ("x = 4.5", "n:4.5"), ("x = ln 4.5", "n:log(4.5)"), ("x = 3", "n:3")],
  "Take ln of both sides; ln(e²ˣ) = 2x.",
  "2x = ln 9 = 2 ln 3, so <b>x = ln 3 ≈ 1.099</b>. ln 4.5 divides inside the log, which is not allowed.",
  chk=log(9) / 2)
C(D, "Logs in other bases",
  f"Compute log₂(32) + log₃({F('1', '9')}).",
  ("3", "n:3"),
  [("7", "n:7"), ("−3", "n:-3"), ("1.5", "n:1.5"), ("4", "n:4")],
  "log₂ 32 asks: 2 to what power is 32? log₃(1⁄9): 3 to what power is 1⁄9?",
  "2⁵ = 32 → 5. 3⁻² = 1⁄9 → −2. Sum: <b>3</b>. 7 forgets the minus sign of the second log.",
  chk=log(32, 2) + log(Rational(1, 9), 3))
C(D, "A power of e inside ln",
  f"Simplify ln(e³ · {S('e')}).",
  ("3.5", "n:3.5"),
  [("1.5", "n:1.5"), ("3", "n:3"), ("4", "n:4"), ("e<sup>3.5</sup>", "n:exp(3.5)")],
  "√e = e<sup>1⁄2</sup>; multiplying powers adds the exponents; ln(eᵏ) = k.",
  "e³ · e<sup>1⁄2</sup> = e<sup>3.5</sup>, and ln(e<sup>3.5</sup>) = <b>3.5</b>.",
  chk=log(exp(3) * sqrt(EE)))
C(D, "Expand a logarithm",
  f"Write ln({F('x² y', 'z³')}) in terms of ln x, ln y, ln z (x, y, z > 0).",
  ("2 ln x + ln y − 3 ln z", "e:2*log(x)+log(y)-3*log(z)"),
  [("2 ln x · ln y − 3 ln z", "e:2*log(x)*log(y)-3*log(z)"), ("2 ln x + ln y + 3 ln z", "e:2*log(x)+log(y)+3*log(z)"), (F("2 ln x + ln y", "3 ln z"), "e:(2*log(x)+log(y))/(3*log(z))"), ("ln 2x + ln y − ln 3z", "e:log(2*x)+log(y)-log(3*z)")],
  "Product → sum, quotient → difference, power → a factor in front.",
  "ln(x²) + ln(y) − ln(z³) = <b>2 ln x + ln y − 3 ln z</b>. A quotient inside ln becomes a subtraction, never a division of logs.",
  chk=expand_log(log(x ** 2 * y / z ** 3), force=True))
C(D, "Combine into one logarithm",
  f"Write 2 ln a − ln b + {F('1', '2')} ln c as a single logarithm (a, b, c > 0).",
  ("ln(" + F("a²" + S("c"), "b") + ")", "e:log(a**2*sqrt(z)/y)"),
  [("ln(" + F("2a" + S("c"), "b") + ")", "e:log(2*a*sqrt(z)/y)"), ("ln(a² − b + " + S("c") + ")", "e:log(a**2-y+sqrt(z))"), ("ln(" + F("a²c", "2b") + ")", "e:log(a**2*z/(2*y))"), ("ln(a²b" + S("c") + ")", "e:log(a**2*y*sqrt(z))")],
  "A factor in front becomes a power inside; + becomes ×, − becomes ÷.",
  "2 ln a = ln a², ½ ln c = ln √c. Then ln a² − ln b + ln √c = <b>ln(a²√c ⁄ b)</b>.",
  chk=log(a ** 2 * sqrt(z) / y))
C(D, "Solve with a base-2 power",
  "Solve 5 · 2ˣ = 40.",
  ("x = 3", "n:3"),
  [("x = 8", "n:8"), ("x = 4", "n:4"), ("x = 2", "n:2"), ("x = ln 8", "n:log(8)")],
  "Divide by 5 first, then ask: 2 to what power is 8?",
  "2ˣ = 8 = 2³, so <b>x = 3</b>. With logs: x = ln 8 ⁄ ln 2 = 3. x = 8 stops one step early.",
  chk=solve(5 * 2 ** x - 40, x)[0])
C(D, "How long until it doubles",
  "CHF 1 000 grows at 4% a year, compounded continuously: V(t) = 1 000 e<sup>0.04t</sup>. After how many years does it reach CHF 2 000?",
  ("≈ 17.33 years", "n:log(2)/0.04"),
  [("25 years", "n:25"), ("≈ 17.67 years", "n:log(2)/log(1.04)"), ("12.5 years", "n:12.5"), ("50 years", "n:50")],
  "Set V(t) = 2 000, divide by 1 000, take ln.",
  "e<sup>0.04t</sup> = 2 ⇔ 0.04t = ln 2 ⇔ t = 0.6931 ⁄ 0.04 = <b>17.33 years</b>. 17.67 is the answer for yearly compounding (ln 2 ⁄ ln 1.04) — a different model.",
  chk=log(2) / 0.04)
C(D, "Two logs equal",
  "Solve ln(x + 2) = ln(3x − 4).",
  ("x = 3", "n:3"),
  [("x = 1", "n:1"), ("x = 2", "n:2"), ("x = −3", "n:-3"), ("x = 6", "n:6")],
  "ln is one-to-one: equal logs mean equal arguments. Then check both arguments are positive.",
  "x + 2 = 3x − 4 ⇔ 2x = 6 ⇔ <b>x = 3</b>. Check: ln 5 = ln 5, both arguments positive.",
  chk=solve(x + 2 - (3 * x - 4), x)[0])
C(D, "A small number in base 10",
  "Compute log₁₀(0.001) + ln 1.",
  ("−3", "n:-3"),
  [("3", "n:3"), ("−2", "n:-2"), ("−4", "n:-4"), ("1", "n:1")],
  "0.001 = 10 to what power? And ln 1 = ?",
  "0.001 = 10⁻³ → −3. ln 1 = 0. Sum: <b>−3</b>.",
  chk=log(Rational(1, 1000), 10) + log(1))

# ======================================================================
# 5 · LINES (9)
# ======================================================================
D = "Lines"
C(D, "A line through two points",
  "Which line passes through (−2, 1) and (4, 13)?",
  ("y = 2x + 5", "e:2*x+5"),
  [("y = 2x + 1", "e:2*x+1"), ("y = " + F("1", "2") + "x + 2", "e:x/2+2"), ("y = 2x − 3", "e:2*x-3"), ("y = 6x + 13", "e:6*x+13")],
  "Slope = rise ⁄ run between the two points. Then use one point to find the intercept.",
  "m = (13 − 1) ⁄ (4 − (−2)) = 12 ⁄ 6 = 2. 1 = 2(−2) + b ⇔ b = 5. <b>y = 2x + 5</b>; check (4, 13): 8 + 5 = 13 ✓.",
  chk=2 * x + 5)
C(D, "Where a line crosses the axis",
  "Where does the line 4x + 3y = 24 cross the x-axis?",
  ("(6, 0)", "t:(6,0)"),
  [("(8, 0)", "t:(8,0)"), ("(0, 8)", "t:(0,8)"), ("(0, 6)", "t:(0,6)"), ("(4, 0)", "t:(4,0)")],
  "On the x-axis, y = 0.",
  "y = 0 ⇒ 4x = 24 ⇒ x = 6: <b>(6, 0)</b>. (0, 8) is where it crosses the y-axis.",
  chk=val("t:(6,0)"))
C(D, "Parallel through a point",
  "Which line is parallel to y = −3x + 1 and passes through (2, 4)?",
  ("y = −3x + 10", "e:-3*x+10"),
  [("y = −3x + 4", "e:-3*x+4"), ("y = " + F("1", "3") + "x + " + F("10", "3"), "e:x/3+10/3"), ("y = 3x − 2", "e:3*x-2"), ("y = −3x − 2", "e:-3*x-2")],
  "Parallel lines have the SAME slope. Only the intercept changes.",
  "Slope −3. 4 = −3(2) + b ⇔ b = 10: <b>y = −3x + 10</b>. The slope 1⁄3 would be for a perpendicular, and with a sign error.",
  chk=-3 * x + 10)
C(D, "Read a slope from the general form",
  "What is the slope of the line 6x − 2y + 7 = 0?",
  ("3", "n:3"),
  [("−3", "n:-3"), ("6", "n:6"), (F("1", "3"), "n:1/3"), (F("7", "2"), "n:7/2")],
  "Solve for y first: put the equation in the form y = mx + b.",
  "2y = 6x + 7 ⇔ y = 3x + 3.5. Slope <b>3</b>. −3 comes from forgetting that −2y moves across with its sign.",
  chk=Rational(3))
C(D, "A taxi fare",
  "A taxi charges a fixed fee plus a price per km. A 12 km trip costs CHF 31, a 20 km trip costs CHF 47. What is the fixed fee?",
  ("CHF 7", "n:7"),
  [("CHF 2", "n:2"), ("CHF 12", "n:12"), ("CHF 15", "n:15"), ("CHF 31", "n:31")],
  "The 8 extra km cost 16 francs: that gives the price per km. The fee is what is left of 31.",
  "Per km: (47 − 31) ⁄ (20 − 12) = 2. Fee: 31 − 12 × 2 = <b>CHF 7</b>. The fare is C = 7 + 2x.",
  chk=31 - 12 * Rational(47 - 31, 20 - 12))
C(D, "Where two lines meet",
  "Where do y = 2x − 1 and y = −x + 8 intersect?",
  ("(3, 5)", "t:(3,5)"),
  [("(5, 3)", "t:(5,3)"), ("(3, −5)", "t:(3,-5)"), ("(−3, 5)", "t:(-3,5)"), ("(7, 13)", "t:(7,13)")],
  "At the intersection both y's are equal: 2x − 1 = −x + 8.",
  "3x = 9 ⇔ x = 3, y = 2·3 − 1 = 5: <b>(3, 5)</b>. Check in the second line: −3 + 8 = 5 ✓.",
  chk=val("t:(3,5)"))
C(D, "Which point is on the line",
  f"Which point lies on y = −{F('1', '2')}x + 4 ?",
  ("(6, 1)", "t:(6,1)"),
  [("(2, 5)", "t:(2,5)"), ("(4, 4)", "t:(4,4)"), ("(−2, 3)", "t:(-2,3)"), ("(8, 1)", "t:(8,1)")],
  "Put each x into the equation and compare with the y.",
  "x = 6: −3 + 4 = 1 ✓ → <b>(6, 1)</b>. x = 2 gives 3, x = 4 gives 2, x = −2 gives 5, x = 8 gives 0.",
  chk=val("t:(6,1)"))
C(D, "Straight-line depreciation",
  "A machine bought for CHF 18 000 is worth CHF 3 000 after 5 years, losing value at a constant rate. What is its value V after t years?",
  ("V = 18 000 − 3 000t", "e:18000-3000*t"),
  [("V = 18 000 − 3 600t", "e:18000-3600*t"), ("V = 18 000 − 15 000t", "e:18000-15000*t"), ("V = 3 000 + 18 000t", "e:3000+18000*t"), ("V = 15 000 − 3 000t", "e:15000-3000*t")],
  "Two points: (0, 18 000) and (5, 3 000). The slope is the loss per year.",
  "Slope (3 000 − 18 000) ⁄ 5 = −3 000 a year; intercept 18 000: <b>V = 18 000 − 3 000t</b>. Check t = 5: 3 000 ✓.",
  chk=18000 + Rational(3000 - 18000, 5) * t)
C(D, "From slope and intercept to the general form",
  "A line has slope −4 and y-intercept 7. Which equation describes it?",
  ("4x + y − 7 = 0", "e:-4*x+7"),
  [("4x − y + 7 = 0", "e:4*x+7"), ("4x + y + 7 = 0", "e:-4*x-7"), ("x + 4y − 7 = 0", "e:-x/4+7/4"), ("4x + y − 4 = 0", "e:-4*x+4")],
  "Solve each option for y and compare with y = −4x + 7.",
  "4x + y − 7 = 0 ⇔ y = −4x + 7 ✓ → <b>4x + y − 7 = 0</b>. 4x − y + 7 = 0 gives y = 4x + 7 — the right intercept, the wrong slope.",
  chk=-4 * x + 7)

# ======================================================================
# 6 · LINEAR BUSINESS MODELS (12)
# ======================================================================
D = "Business models"
C(D, "A food truck breaks even",
  "A food truck pays CHF 2 400 a month in rent and licences. Each meal sells for CHF 25 and costs CHF 13 in ingredients. How many meals a month cover all costs?",
  ("200", "n:200"),
  [("96", "n:96"), ("≈ 184.6", "n:2400/13"), ("≈ 63.2", "n:2400/38"), ("2 400", "n:2400")],
  "Each meal contributes 25 − 13 to the fixed costs. How many contributions make 2 400?",
  "Break-even: 25q = 2 400 + 13q ⇔ 12q = 2 400 ⇔ <b>q = 200</b> meals. 96 divides by the price only, ignoring ingredients.",
  chk=Rational(2400, 25 - 13))
C(D, "Profit at a given volume",
  "Cost C(q) = 1 500 + 8q, revenue R(q) = 14q. What is the profit at q = 400?",
  ("CHF 900", "n:900"),
  [("CHF 2 100", "n:2100"), ("−CHF 900", "n:-900"), ("CHF 5 600", "n:5600"), ("CHF 3 700", "n:3700")],
  "Profit = revenue − cost, both at q = 400.",
  "R = 5 600, C = 1 500 + 3 200 = 4 700. P = <b>900</b>. 2 100 forgets the fixed cost.",
  chk=14 * 400 - (1500 + 8 * 400))
C(D, "Equilibrium, quantity as a function of price",
  "Demand: q = 120 − 4p. Supply: q = 6p − 30. Find the equilibrium (p, q).",
  ("(15, 60)", "t:(15,60)"),
  [("(60, 15)", "t:(60,15)"), ("(12, 72)", "t:(12,72)"), ("(9, 84)", "t:(9,84)"), ("(18, 48)", "t:(18,48)")],
  "Here quantity is written as a function of price, so set the two q's equal and solve for p.",
  "120 − 4p = 6p − 30 ⇔ 10p = 150 ⇔ p = 15, q = 120 − 60 = 60: <b>(p, q) = (15, 60)</b>. Check supply: 90 − 30 = 60 ✓.",
  chk=val("t:(15,60)"))
C(D, "Demand from two observations",
  "At a price of CHF 8 a café sells 300 cups a day; at CHF 10 it sells 260. Assuming a linear demand, what is q as a function of p?",
  ("q = 460 − 20p", "e:460-20*p"),
  [("q = 300 − 20p", "e:300-20*p"), ("q = 460 + 20p", "e:460+20*p"), ("q = 140 + 20p", "e:140+20*p"), ("q = 460 − 10p", "e:460-10*p")],
  "Slope = change in q ⁄ change in p. Then use one observation for the intercept.",
  "Slope (260 − 300) ⁄ (10 − 8) = −20. 300 = b − 20·8 ⇔ b = 460: <b>q = 460 − 20p</b>. Check p = 10: 260 ✓.",
  chk=300 + Rational(260 - 300, 10 - 8) * (p - 8))
C(D, "The revenue-maximising price",
  "Demand is q = 300 − 5p. Which price maximises revenue R = p · q?",
  ("p = 30", "n:30"),
  [("p = 60", "n:60"), ("p = 150", "n:150"), ("p = 15", "n:15"), ("p = 45", "n:45")],
  "R(p) = 300p − 5p² is a downward parabola; its top is halfway between its two zeros.",
  "R(p) = p(300 − 5p) is zero at p = 0 and p = 60; the vertex is halfway: <b>p = 30</b> (R = 4 500). 60 is where nobody buys.",
  chk=solve(diff(p * (300 - 5 * p), p), p)[0])
C(D, "Build the profit function",
  "Demand p = 50 − 0.5q, cost C(q) = 200 + 10q. What is the profit P(q)?",
  ("−0.5q² + 40q − 200", "e:-q**2/2+40*q-200"),
  [("−0.5q² + 60q − 200", "e:-q**2/2+60*q-200"), ("−0.5q² + 40q + 200", "e:-q**2/2+40*q+200"), ("−0.5q² + 50q − 210", "e:-q**2/2+50*q-210"), ("0.5q² + 40q − 200", "e:q**2/2+40*q-200")],
  "Revenue is p times q, with p replaced by the demand formula. Then subtract the WHOLE cost.",
  "R = (50 − 0.5q)q = 50q − 0.5q². P = 50q − 0.5q² − 200 − 10q = <b>−0.5q² + 40q − 200</b>. 60q adds the unit cost instead of subtracting it.",
  chk=(50 - q / 2) * q - (200 + 10 * q))
C(D, "The best profit a parabola allows",
  "P(q) = −2q² + 96q − 700. What is the maximum profit?",
  ("452", "n:452"),
  [("24", "n:24"), ("1 152", "n:1152"), ("604", "n:604"), ("1 604", "n:1604")],
  "The vertex of a·q² + b·q + c is at q = −b ⁄ (2a). The question asks for the PROFIT there, not the quantity.",
  "q* = −96 ⁄ (−4) = 24. P(24) = −1 152 + 2 304 − 700 = <b>452</b>. 24 is the quantity, not the profit.",
  chk=(lambda qq: -2 * qq ** 2 + 96 * qq - 700)(24))
C(D, "Two products, two constraints",
  "A bakery makes croissants (c) and baguettes (b). Labour: 2 min per croissant, 3 min per baguette, 480 min available. Butter: 50 g per croissant, 10 g per baguette, 6.8 kg available. How many of each use up both exactly?",
  ("c = 120, b = 80", "t:(120,80)"),
  [("c = 80, b = 120", "t:(80,120)"), ("c = 96, b = 96", "t:(96,96)"), ("c = 120, b = 60", "t:(120,60)"), ("c = 150, b = 50", "t:(150,50)")],
  "Two equations: 2c + 3b = 480 and 50c + 10b = 6 800 (grams!). Solve one for b and substitute.",
  "From the second: b = 680 − 5c. Then 2c + 3(680 − 5c) = 480 ⇔ −13c = −1 560 ⇔ c = 120, b = 80. <b>120 croissants, 80 baguettes</b>. Check: 240 + 240 = 480 ✓; 6 000 + 800 = 6 800 g ✓.",
  chk=val("t:(120,80)"))
C(D, "Fixed cost from two production runs",
  "Producing 100 units costs CHF 3 200; producing 250 units costs CHF 5 600. If cost is linear in output, what is the fixed cost?",
  ("CHF 1 600", "n:1600"),
  [("CHF 16", "n:16"), ("CHF 3 200", "n:3200"), ("CHF 2 400", "n:2400"), ("CHF 1 000", "n:1000")],
  "The 150 extra units cost 2 400: that is the variable cost per unit. Fixed = cost at 0 units.",
  "Per unit: 2 400 ⁄ 150 = 16. Fixed: 3 200 − 100 × 16 = <b>CHF 1 600</b>. 16 is the marginal cost.",
  chk=3200 - 100 * Rational(5600 - 3200, 150))
C(D, "Average cost at a volume",
  "C(q) = 900 + 6q. What is the average cost per unit at q = 150?",
  ("CHF 12", "n:12"),
  [("CHF 6", "n:6"), ("CHF 906", "n:906"), ("CHF 1 800", "n:1800"), ("CHF 15", "n:15")],
  "Average cost = total cost ⁄ quantity.",
  "C(150) = 900 + 900 = 1 800; 1 800 ⁄ 150 = <b>CHF 12</b>. 6 is the marginal cost; 1 800 is the total.",
  chk=Rational(900 + 6 * 150, 150))
C(D, "A per-unit tax moves the market",
  "Demand p = 100 − 2q, supply p = 20 + 2q. A tax of CHF 8 per unit is added to the supply price. What price do buyers pay at the new equilibrium?",
  ("CHF 64", "n:64"),
  [("CHF 68", "n:68"), ("CHF 60", "n:60"), ("CHF 56", "n:56"), ("CHF 72", "n:72")],
  "With the tax, supply becomes p = 28 + 2q. Set it equal to demand.",
  "100 − 2q = 28 + 2q ⇔ q = 18, p = 100 − 36 = <b>64</b>. Without tax p = 60 — buyers carry 4 of the 8 francs. 68 assumes they carry all of it.",
  chk=100 - 2 * solve(100 - 2 * q - (28 + 2 * q), q)[0])
C(D, "Up 25%, then down 20%",
  "A price rises by 25%, then falls by 20%. What is the overall change?",
  ("0%", "n:0"),
  [("+5%", "n:5"), ("−5%", "n:-5"), ("+2.5%", "n:2.5"), ("+45%", "n:45")],
  "Percentages multiply, they do not add: × 1.25, then × 0.80.",
  "1.25 × 0.80 = 1.00 → <b>0%</b>: back exactly where it started. +5% adds the percentages, which is the trap.",
  chk=(Rational(125, 100) * Rational(80, 100) - 1) * 100)

# ======================================================================
# 7 · DERIVATIVE RULES (18)
# ======================================================================
D = "Derivative rules"
def Dv(title, fhtml, f, right, wrong, hint, sol):
    C(D, title, f"What is the derivative of f(x) = {fhtml} ?", right, wrong, hint, sol, chk=diff(f, x))
Dv("A power and a reciprocal", "5x⁴ − " + F("3", "x"), 5 * x ** 4 - 3 / x,
   ("20x³ + " + F("3", "x²"), "e:20*x**3+3/x**2"),
   [("20x³ − " + F("3", "x²"), "e:20*x**3-3/x**2"), ("20x³ + " + F("3", "x"), "e:20*x**3+3/x"), ("5x³ + " + F("3", "x²"), "e:5*x**3+3/x**2"), ("20x³ − 3", "e:20*x**3-3")],
   "Write 3 ⁄ x as 3x⁻¹, then use the power rule on both terms.",
   "(5x⁴)′ = 20x³; (−3x⁻¹)′ = −3·(−1)x⁻² = +3 ⁄ x². <b>f′(x) = 20x³ + 3 ⁄ x²</b>. Two minus signs make a plus.")
Dv("A negative power", F("4", "x³"), 4 / x ** 3,
   ("−" + F("12", "x⁴"), "e:-12/x**4"),
   [(F("12", "x⁴"), "e:12/x**4"), ("−" + F("12", "x²"), "e:-12/x**2"), (F("4", "3x²"), "e:4/(3*x**2)"), ("−" + F("4", "3x⁴"), "e:-4/(3*x**4)")],
   "4 ⁄ x³ = 4x⁻³. The exponent goes down by one: −3 − 1 = −4.",
   "(4x⁻³)′ = −12x⁻⁴ = <b>−12 ⁄ x⁴</b>. −12 ⁄ x² comes from moving the exponent the wrong way.")
Dv("x times its own root", "x" + S("x"), x * sqrt(x),
   (F("3", "2") + S("x"), "e:3*sqrt(x)/2"),
   [(S("x"), "e:sqrt(x)"), (F("1", "2" + S("x")), "e:1/(2*sqrt(x))"), (F("3", "2") + "x", "e:3*x/2"), (F("3", "2" + S("x")), "e:3/(2*sqrt(x))")],
   "x√x = x¹ · x<sup>1⁄2</sup> = x<sup>3⁄2</sup>. Then the power rule.",
   "(x<sup>3⁄2</sup>)′ = (3⁄2)x<sup>1⁄2</sup> = <b>(3⁄2)√x</b>. Or by the product rule: √x + x ⁄ (2√x) = √x + √x ⁄ 2 — the same.")
Dv("A product of two polynomials", "(x² + 1)(x − 3)", (x ** 2 + 1) * (x - 3),
   ("3x² − 6x + 1", "e:3*x**2-6*x+1"),
   [("2x", "e:2*x"), ("2x(x − 3)", "e:2*x*(x-3)"), ("3x² + 1", "e:3*x**2+1"), ("3x² − 6x − 1", "e:3*x**2-6*x-1")],
   "Product rule: u′v + uv′ — or multiply out first.",
   "2x(x − 3) + (x² + 1)·1 = 2x² − 6x + x² + 1 = <b>3x² − 6x + 1</b>. 2x is (x²+1)′ · (x−3)′ — the derivative of a product is NOT the product of the derivatives.")
Dv("A quotient", F("x²", "x − 1"), x ** 2 / (x - 1),
   (F("x² − 2x", "(x − 1)²"), "e:(x**2-2*x)/(x-1)**2"),
   [("2x", "e:2*x"), (F("x² − 2x", "x − 1"), "e:(x**2-2*x)/(x-1)"), (F("2x − x²", "(x − 1)²"), "e:(2*x-x**2)/(x-1)**2"), (F("3x² − 2x", "(x − 1)²"), "e:(3*x**2-2*x)/(x-1)**2")],
   "(u ⁄ v)′ = (u′v − uv′) ⁄ v². The order in the numerator matters.",
   "(2x(x − 1) − x²·1) ⁄ (x − 1)² = (2x² − 2x − x²) ⁄ (x − 1)² = <b>(x² − 2x) ⁄ (x − 1)²</b>. Reversing u′v and uv′ flips the sign.")
Dv("A root of a linear function", S("4x + 1"), sqrt(4 * x + 1),
   (F("2", S("4x + 1")), "e:2/sqrt(4*x+1)"),
   [(F("1", "2" + S("4x + 1")), "e:1/(2*sqrt(4*x+1))"), (F("4", S("4x + 1")), "e:4/sqrt(4*x+1)"), ("2" + S("4x + 1"), "e:2*sqrt(4*x+1)"), (F("1", S("4x + 1")), "e:1/sqrt(4*x+1)")],
   "Chain rule: (√u)′ = u′ ⁄ (2√u), with u = 4x + 1.",
   "4 ⁄ (2√(4x + 1)) = <b>2 ⁄ √(4x + 1)</b>. 1 ⁄ (2√(4x+1)) forgets the inner derivative 4.")
Dv("e to a polynomial", "e<sup>x² − 3x</sup>", exp(x ** 2 - 3 * x),
   ("(2x − 3) e<sup>x² − 3x</sup>", "e:(2*x-3)*exp(x**2-3*x)"),
   [("e<sup>x² − 3x</sup>", "e:exp(x**2-3*x)"), ("(x² − 3x) e<sup>x² − 3x − 1</sup>", "e:(x**2-3*x)*exp(x**2-3*x-1)"), ("(2x − 3) e<sup>2x − 3</sup>", "e:(2*x-3)*exp(2*x-3)"), ("2x e<sup>x² − 3x</sup>", "e:2*x*exp(x**2-3*x)")],
   "(eᵘ)′ = u′ eᵘ. The exponent itself does NOT change.",
   "u = x² − 3x, u′ = 2x − 3: <b>(2x − 3)e<sup>x² − 3x</sup></b>. Treating eᵘ like a power (u·e<sup>u−1</sup>) is the classic mistake.")
Dv("ln x over x", F("ln x", "x"), log(x) / x,
   (F("1 − ln x", "x²"), "e:(1-log(x))/x**2"),
   [(F("1", "x²"), "e:1/x**2"), (F("ln x − 1", "x²"), "e:(log(x)-1)/x**2"), (F("1", "x") + " − ln x", "e:1/x-log(x)"), (F("1 + ln x", "x²"), "e:(1+log(x))/x**2")],
   "Quotient rule with u = ln x (u′ = 1⁄x) and v = x (v′ = 1).",
   "((1⁄x)·x − ln x · 1) ⁄ x² = <b>(1 − ln x) ⁄ x²</b>. It is zero at x = e, where ln x ⁄ x is largest.")
Dv("A cube times a log", "x³ ln x", x ** 3 * log(x),
   ("3x² ln x + x²", "e:3*x**2*log(x)+x**2"),
   [("3x", "e:3*x"), ("3x² ln x", "e:3*x**2*log(x)"), ("3x² ln x + x³", "e:3*x**2*log(x)+x**3"), ("x²(3 ln x − 1)", "e:x**2*(3*log(x)-1)")],
   "Product rule: (x³)′ ln x + x³ (ln x)′.",
   "3x² ln x + x³ · (1⁄x) = <b>3x² ln x + x²</b>. 3x is (x³)′ × (ln x)′, the forbidden shortcut.")
Dv("Exponential decay", "5e<sup>−0.2x</sup>", 5 * exp(-x / 5),
   ("−e<sup>−0.2x</sup>", "e:-exp(-x/5)"),
   [("5e<sup>−0.2x</sup>", "e:5*exp(-x/5)"), ("−0.2e<sup>−0.2x</sup>", "e:-exp(-x/5)/5"), ("e<sup>−0.2x</sup>", "e:exp(-x/5)"), ("−5e<sup>−0.2x</sup>", "e:-5*exp(-x/5)")],
   "(e<sup>kx</sup>)′ = k e<sup>kx</sup>. Keep the 5.",
   "5 × (−0.2) e<sup>−0.2x</sup> = <b>−e<sup>−0.2x</sup></b>. −0.2e<sup>−0.2x</sup> drops the factor 5.")
Dv("Growth at 5% a period", "10 · 1.05ˣ", 10 * Rational(105, 100) ** x,
   ("10 · 1.05ˣ · ln 1.05", "e:10*(21/20)**x*log(21/20)"),
   [("10x · 1.05<sup>x − 1</sup>", "e:10*x*(21/20)**(x-1)"), ("10 · 1.05ˣ", "e:10*(21/20)**x"), ("10.5 · 1.05ˣ", "e:(21/2)*(21/20)**x"), (F("10 · 1.05ˣ", "ln 1.05"), "e:10*(21/20)**x/log(21/20)")],
   "(bˣ)′ = bˣ ln b. x is in the EXPONENT, so the power rule does not apply.",
   "<b>10 · 1.05ˣ · ln 1.05</b> ≈ 0.488 · 1.05ˣ. x·1.05<sup>x−1</sup> treats the exponential like a power.")
Dv("One over a square", F("1", "(2x + 5)²"), 1 / (2 * x + 5) ** 2,
   ("−" + F("4", "(2x + 5)³"), "e:-4/(2*x+5)**3"),
   [("−" + F("2", "(2x + 5)³"), "e:-2/(2*x+5)**3"), (F("4", "(2x + 5)³"), "e:4/(2*x+5)**3"), ("−" + F("4", "2x + 5"), "e:-4/(2*x+5)"), ("−" + F("1", "(2x + 5)³"), "e:-1/(2*x+5)**3")],
   "Write it as (2x + 5)⁻². Power rule, then multiply by the inside derivative 2.",
   "−2(2x + 5)⁻³ · 2 = <b>−4 ⁄ (2x + 5)³</b>. −2 ⁄ (2x+5)³ forgets the inner 2.")
Dv("ln of a root", "ln(" + S("x") + ")", log(sqrt(x)),
   (F("1", "2x"), "e:1/(2*x)"),
   [(F("1", S("x")), "e:1/sqrt(x)"), (F("1", "2" + S("x")), "e:1/(2*sqrt(x))"), (F("2", "x"), "e:2/x"), (F("1", "x"), "e:1/x")],
   "Simplify first: ln √x = ½ ln x.",
   "½ · (1⁄x) = <b>1 ⁄ (2x)</b>. By the chain rule: (1⁄√x) · 1⁄(2√x) = 1⁄(2x) — the same.")
C(D, "A second derivative",
  "Let f(x) = x⁴ − 2x³ + 5x. What is f″(x)?",
  ("12x² − 12x", "e:12*x**2-12*x"),
  [("4x³ − 6x² + 5", "e:4*x**3-6*x**2+5"), ("12x² − 12x + 5", "e:12*x**2-12*x+5"), ("12x − 12", "e:12*x-12"), ("12x² − 6x", "e:12*x**2-6*x")],
  "Differentiate twice. The 5x disappears at the second step.",
  "f′ = 4x³ − 6x² + 5, f″ = <b>12x² − 12x</b>. The first option stops after one derivative.",
  chk=diff(x ** 4 - 2 * x ** 3 + 5 * x, x, 2))
C(D, "A second derivative at a point",
  "Let f(x) = x eˣ. Compute f″(0).",
  ("2", "n:2"),
  [("1", "n:1"), ("0", "n:0"), ("e", "n:exp(1)"), ("3", "n:3")],
  "f′ = eˣ + x eˣ = (x + 1)eˣ. Differentiate once more.",
  "f″ = eˣ + (x + 1)eˣ = (x + 2)eˣ, so f″(0) = <b>2</b>. f′(0) = 1 is one step short.",
  chk=diff(x * exp(x), x, 2).subs(x, 0))
C(D, "A derivative at a point",
  f"Let f(x) = x² + {F('16', 'x')}. Compute f′(2).",
  ("0", "n:0"),
  [("8", "n:8"), ("−4", "n:-4"), ("12", "n:12"), ("4", "n:4")],
  "f′(x) = 2x − 16 ⁄ x². Then put x = 2.",
  "f′(2) = 4 − 16 ⁄ 4 = <b>0</b> — the graph is flat there; x = 2 is where x² + 16⁄x is smallest for x > 0.",
  chk=diff(x ** 2 + 16 / x, x).subs(x, 2))
Dv("A ratio of two lines", F("1 + x", "1 − x"), (1 + x) / (1 - x),
   (F("2", "(1 − x)²"), "e:2/(1-x)**2"),
   [("0", "e:0*x"), ("−" + F("2", "(1 − x)²"), "e:-2/(1-x)**2"), (F("2", "1 − x"), "e:2/(1-x)"), (F("2x", "(1 − x)²"), "e:2*x/(1-x)**2")],
   "Quotient rule: u = 1 + x, v = 1 − x, v′ = −1.",
   "(1·(1 − x) − (1 + x)(−1)) ⁄ (1 − x)² = (1 − x + 1 + x) ⁄ (1 − x)² = <b>2 ⁄ (1 − x)²</b>.")
Dv("x times e to the minus x", "x e<sup>−x</sup>", x * exp(-x),
   ("(1 − x) e<sup>−x</sup>", "e:(1-x)*exp(-x)"),
   [("e<sup>−x</sup>", "e:exp(-x)"), ("−x e<sup>−x</sup>", "e:-x*exp(-x)"), ("(1 + x) e<sup>−x</sup>", "e:(1+x)*exp(-x)"), ("(x − 1) e<sup>−x</sup>", "e:(x-1)*exp(-x)")],
   "Product rule; (e<sup>−x</sup>)′ = −e<sup>−x</sup>.",
   "1·e<sup>−x</sup> + x·(−e<sup>−x</sup>) = <b>(1 − x)e<sup>−x</sup></b>. (1 + x)e<sup>−x</sup> forgets the minus of the chain rule.")

# ======================================================================
# 8 · TANGENTS AND MARGINAL ANALYSIS (8)
# ======================================================================
D = "Tangents & marginal analysis"
C(D, "Tangent to a root",
  f"What is the tangent line to f(x) = {S('x')} at x = 9?",
  ("y = " + F("x", "6") + " + " + F("3", "2"), "e:x/6+3/2"),
  [("y = " + F("x", "6") + " + 3", "e:x/6+3"), ("y = 6x − 51", "e:6*x-51"), ("y = " + F("x", "3"), "e:x/3"), ("y = " + F("x", "6") + " − " + F("3", "2"), "e:x/6-3/2")],
  "y = f(9) + f′(9)(x − 9). f(9) = 3, f′(x) = 1 ⁄ (2√x).",
  "f′(9) = 1⁄6. y = 3 + (x − 9) ⁄ 6 = <b>x⁄6 + 3⁄2</b>. y = x⁄6 + 3 forgets to subtract 9⁄6.",
  chk=sqrt(9) + diff(sqrt(x), x).subs(x, 9) * (x - 9))
C(D, "Tangent to ln at 1",
  "What is the tangent line to f(x) = ln x at x = 1?",
  ("y = x − 1", "e:x-1"),
  [("y = x", "e:x"), ("y = x + 1", "e:x+1"), ("y = 1", "e:1+0*x"), ("y = −x + 1", "e:-x+1")],
  "ln 1 = 0 and (ln x)′ = 1⁄x.",
  "f(1) = 0, f′(1) = 1: y = 0 + 1·(x − 1) = <b>x − 1</b>. Near 1, ln x ≈ x − 1.",
  chk=log(1) + diff(log(x), x).subs(x, 1) * (x - 1))
C(D, "Marginal cost of a cubic",
  "C(q) = 0.02q³ − 3q² + 200q + 5 000. What is the marginal cost at q = 50?",
  ("CHF 50", "n:50"),
  [("CHF 150", "n:150"), ("CHF 200", "n:200"), ("CHF 7 500", "n:7500"), ("CHF 350", "n:350")],
  "Marginal cost is C′(q). Differentiate term by term, then put q = 50.",
  "C′ = 0.06q² − 6q + 200; C′(50) = 150 − 300 + 200 = <b>50</b>. 150 stops after the first term.",
  chk=diff(Rational(2, 100) * q ** 3 - 3 * q ** 2 + 200 * q + 5000, q).subs(q, 50))
C(D, "Marginal revenue",
  "R(q) = 120q − 0.4q². What is the marginal revenue at q = 100?",
  ("CHF 40", "n:40"),
  [("CHF 8 000", "n:8000"), ("CHF 80", "n:80"), ("CHF 120", "n:120"), ("−CHF 40", "n:-40")],
  "MR = R′(q) = 120 − 0.8q.",
  "R′(100) = 120 − 80 = <b>40</b>: the 101st unit adds about CHF 40. 8 000 is total revenue.",
  chk=diff(120 * q - Rational(4, 10) * q ** 2, q).subs(q, 100))
C(D, "Marginal revenue meets marginal cost",
  "R(q) = 60q − 0.5q², C(q) = 200 + 12q + 0.25q². At which q is MR = MC?",
  ("q = 32", "n:32"),
  [("q = 48", "n:48"), ("q = 64", "n:64"), ("q = 24", "n:24"), ("q = 16", "n:16")],
  "MR = 60 − q, MC = 12 + 0.5q. Set them equal.",
  "60 − q = 12 + 0.5q ⇔ 1.5q = 48 ⇔ <b>q = 32</b>. 48 is 60 − 12, before dividing by 1.5.",
  chk=solve(diff(60 * q - q ** 2 / 2, q) - diff(200 + 12 * q + q ** 2 / 4, q), q)[0])
C(D, "Cheapest per unit",
  "C(q) = 0.5q² + 30q + 800. At which output is the AVERAGE cost per unit lowest?",
  ("q = 40", "n:40"),
  [("q = 30", "n:30"), ("q = 20", "n:20"), ("q = 80", "n:80"), ("q = 1 600", "n:1600")],
  "Average cost C̄ = C ⁄ q = 0.5q + 30 + 800⁄q. Set its derivative to zero.",
  "C̄′ = 0.5 − 800 ⁄ q² = 0 ⇔ q² = 1 600 ⇔ <b>q = 40</b> (C̄ = 70 there). At that point marginal cost equals average cost: C′(40) = 70.",
  chk=[r for r in solve(diff((q ** 2 / 2 + 30 * q + 800) / q, q), q) if r > 0][0])
C(D, "The cost of one more unit",
  "C(q) = 1 000 + 20q + 0.1q². Using the marginal cost, estimate the cost of producing the 101st unit.",
  ("≈ CHF 40", "n:40"),
  [("CHF 40.10", "n:40.1"), ("CHF 20", "n:20"), ("CHF 3 000", "n:3000"), ("CHF 30", "n:30")],
  "The cost of one more unit ≈ C′(100). The question says ESTIMATE using marginal cost.",
  "C′(q) = 20 + 0.2q, C′(100) = <b>40</b>. The exact extra cost is C(101) − C(100) = 40.10; the marginal cost is its approximation.",
  chk=diff(1000 + 20 * q + q ** 2 / 10, q).subs(q, 100))
C(D, "Slope of a tangent",
  "What is the slope of the tangent to f(x) = 3x² − x at x = −1?",
  ("−7", "n:-7"),
  [("7", "n:7"), ("4", "n:4"), ("−5", "n:-5"), ("5", "n:5")],
  "The slope of the tangent is f′(−1).",
  "f′(x) = 6x − 1, f′(−1) = −6 − 1 = <b>−7</b>. 4 is f(−1), the height, not the slope.",
  chk=diff(3 * x ** 2 - x, x).subs(x, -1))

# ======================================================================
# 9 · THE CHAIN RULE IN BUSINESS (4)
# ======================================================================
D = "Chain rule in business"
C(D, "Ads → visitors → sales",
  f"Spending a (thousand CHF) on ads brings N(a) = 200{S('a')} visitors; each visitor buys on average CHF 0.05. At a = 25, how fast do sales grow per extra thousand spent?",
  ("CHF 1 per thousand", "n:1"),
  [("CHF 2", "n:2"), ("CHF 0.05", "n:0.05"), ("CHF 50", "n:50"), ("CHF 0.5", "n:0.5")],
  "Sales S = 0.05 · N(a) = 10√a. Differentiate with respect to a.",
  "dS⁄da = 0.05 · N′(a) = 0.05 · 200 ⁄ (2√a) = 5 ⁄ √a; at a = 25: 5 ⁄ 5 = <b>1</b>. 50 is the level of sales, not the rate.",
  chk=diff(Rational(5, 100) * 200 * sqrt(a), a).subs(a, 25))
C(D, "A price that drifts",
  "The price rises over time as p(t) = 20 + 0.5t (t in weeks) and demand is q(p) = 1 000 − 30p. How fast does demand change, per week?",
  ("−15 units per week", "n:-15"),
  [("−30", "n:-30"), ("0.5", "n:0.5"), ("+15", "n:15"), ("−600", "n:-600")],
  "dq⁄dt = dq⁄dp × dp⁄dt.",
  "dq⁄dp = −30, dp⁄dt = 0.5: dq⁄dt = <b>−15</b> units per week. −30 is the change per franc, not per week.",
  chk=diff(1000 - 30 * (20 + t / 2), t))
C(D, "Cost through time",
  "Output grows as q(t) = 50 + 4t (t in months), and cost is C(q) = 1 000 + 2q². How fast is cost rising at t = 5?",
  ("CHF 1 120 per month", "n:1120"),
  [("CHF 280", "n:280"), ("CHF 4", "n:4"), ("CHF 1 400", "n:1400"), ("CHF 9 800", "n:9800")],
  "dC⁄dt = C′(q) · q′(t). First find q at t = 5.",
  "q(5) = 70, C′(q) = 4q = 280, q′ = 4. dC⁄dt = 280 × 4 = <b>1 120</b> a month. 280 is per unit of output, not per month.",
  chk=diff(1000 + 2 * (50 + 4 * t) ** 2, t).subs(t, 5))
C(D, "A cubed demand curve",
  "Demand over time is D(t) = (2t + 1)³. Compute D′(1).",
  ("54", "n:54"),
  [("27", "n:27"), ("18", "n:18"), ("162", "n:162"), ("9", "n:9")],
  "Chain rule: 3(2t + 1)² × 2.",
  "D′(t) = 6(2t + 1)²; D′(1) = 6 × 9 = <b>54</b>. 27 is D(1); 27 also comes from 3 × 9 without the inner 2.",
  chk=diff((2 * t + 1) ** 3, t).subs(t, 1))

# ======================================================================
# 10 · LINEAR APPROXIMATION AND NEWTON (7)
# ======================================================================
D = "Approximation & Newton"
C(D, "A root without a calculator",
  f"Use the linear approximation of f(x) = {S('x')} at x₀ = 100 to estimate {S('102')}.",
  ("10.1", "n:10.1"),
  [("10.2", "n:10.2"), ("10.01", "n:10.01"), ("10.0995", "n:10.0995"), ("10.05", "n:10.05")],
  "f(x) ≈ f(100) + f′(100)(x − 100), with f′(x) = 1 ⁄ (2√x).",
  "f′(100) = 1⁄20 = 0.05. √102 ≈ 10 + 0.05 × 2 = <b>10.1</b>. 10.0995 is the true value — close, but not what the approximation gives.",
  chk=10 + diff(sqrt(x), x).subs(x, 100) * 2)
C(D, "Linear approximation of 1⁄x",
  f"What is the linear approximation of f(x) = {F('1', 'x')} at x₀ = 2?",
  ("y = −" + F("x", "4") + " + 1", "e:-x/4+1"),
  [("y = " + F("x", "4"), "e:x/4"), ("y = −" + F("x", "4") + " + " + F("1", "2"), "e:-x/4+1/2"), ("y = −" + F("x", "2") + " + 1", "e:-x/2+1"), ("y = " + F("x", "4") + " + 1", "e:x/4+1")],
  "f(2) = 1⁄2, f′(x) = −1⁄x², so f′(2) = −1⁄4.",
  "y = ½ − ¼(x − 2) = ½ − x⁄4 + ½ = <b>−x⁄4 + 1</b>. −x⁄4 + ½ forgets the + ½ that comes from −¼ × (−2).",
  chk=Rational(1, 2) + diff(1 / x, x).subs(x, 2) * (x - 2))
C(D, "Estimate a cost a little further out",
  "At q = 200 a firm's cost is CHF 9 000 and its marginal cost is CHF 35. Estimate the cost at q = 204.",
  ("CHF 9 140", "n:9140"),
  [("CHF 9 035", "n:9035"), ("CHF 9 004", "n:9004"), ("CHF 9 280", "n:9280"), ("CHF 9 175", "n:9175")],
  "C(204) ≈ C(200) + C′(200) × 4.",
  "9 000 + 35 × 4 = <b>9 140</b>. 9 035 adds one unit's cost instead of four.",
  chk=9000 + 35 * 4)
C(D, "Newton's method on a square root",
  "Apply one step of Newton's method to f(x) = x² − 5, starting from x₀ = 2. What is x₁?",
  ("2.25", "n:2.25"),
  [("2.5", "n:2.5"), ("1.75", "n:1.75"), ("2.236", "n:2.236"), ("2.2", "n:2.2")],
  "x₁ = x₀ − f(x₀) ⁄ f′(x₀), with f′(x) = 2x.",
  "f(2) = −1, f′(2) = 4. x₁ = 2 − (−1)⁄4 = <b>2.25</b>. The true root √5 ≈ 2.236 is the target, not the first step. 1.75 is a sign slip.",
  chk=2 - (2 ** 2 - 5) / Rational(4))
C(D, "Newton on an exponential",
  "One step of Newton's method on f(x) = eˣ − 3, starting from x₀ = 1. What is x₁ (to 4 decimals)?",
  ("1.1036", "n:3/exp(1)"),
  [("1.0986", "n:log(3)"), ("0.9000", "n:0.9"), ("1.5000", "n:1.5"), ("1.2817", "n:1.2817")],
  "f(1) = e − 3, f′(x) = eˣ, so f′(1) = e.",
  "x₁ = 1 − (e − 3) ⁄ e = 3 ⁄ e = <b>1.1036</b>. 1.0986 = ln 3 is the exact root; one step lands 0.005 away.",
  chk=1 - (exp(1) - 3) / exp(1))
C(D, "Two Newton steps",
  "Newton's method on f(x) = x³ − 10 from x₀ = 2. What is x₂ (to 4 decimals)?",
  ("2.1545", "n:2.15450"),
  [("2.1667", "n:2.1667"), ("2.1000", "n:2.1"), ("2.2000", "n:2.2"), ("2.1500", "n:2.15")],
  "Two steps of x − f(x) ⁄ f′(x), with f′(x) = 3x². Keep all decimals between the steps.",
  "x₁ = 2 − (−2)⁄12 = 2.16667. f(x₁) = 0.17130, f′(x₁) = 14.0833; x₂ = 2.16667 − 0.01216 = <b>2.1545</b>. 2.1667 is x₁. The true root ∛10 = 2.15443 — two steps already agree to four figures.",
  chk=None)
C(D, "A revenue change, approximated",
  "R(q) = 50q − 0.05q². Output rises from 400 to 408. Using R′(400), estimate the change in revenue.",
  ("≈ CHF 80", "n:80"),
  [("CHF 76.80", "n:76.8"), ("CHF 400", "n:400"), ("CHF 160", "n:160"), ("CHF 8", "n:8")],
  "ΔR ≈ R′(400) × Δq.",
  "R′(q) = 50 − 0.1q, R′(400) = 10; ΔR ≈ 10 × 8 = <b>80</b>. The exact change, 76.80, is what the approximation estimates.",
  chk=diff(50 * q - q ** 2 / 20, q).subs(q, 400) * 8)

# ======================================================================
# 11 · ELASTICITY (5)
# ======================================================================
D = "Elasticity"
C(D, "Elasticity of a linear demand",
  "Demand q = 200 − 4p. What is the price elasticity of demand at p = 30?",
  ("−1.5", "n:-1.5"),
  [("−0.6", "n:-0.6"), ("1.5", "n:1.5"), ("−4", "n:-4"), ("−0.67", "n:-0.67")],
  "η = q′(p) × p ⁄ q. First q(30).",
  "q(30) = 80, q′ = −4. η = −4 × 30 ⁄ 80 = <b>−1.5</b>: elastic. −0.6 inverts p ⁄ q.",
  chk=Rational(-4 * 30, 200 - 4 * 30))
C(D, "A constant elasticity",
  f"Demand q = {F('1 200', 'p')}. What is the price elasticity at p = 8?",
  ("−1", "n:-1"),
  [("−150", "n:-150"), ("−0.125", "n:-0.125"), ("−8", "n:-8"), ("1", "n:1")],
  "q′(p) = −1 200 ⁄ p². Then η = q′ × p ⁄ q.",
  "q(8) = 150, q′(8) = −18.75. η = −18.75 × 8 ⁄ 150 = <b>−1</b>. For q = k ⁄ p it is −1 at EVERY price: revenue p·q = 1 200 never changes.",
  chk=simplify(diff(1200 / p, p) * p / (1200 / p)).subs(p, 8))
C(D, "Inelastic: what a price rise does",
  "At the current price, demand for bus passes has elasticity η = −0.4. What happens to revenue if the price rises slightly?",
  ("Revenue rises", "t:up"),
  [("Revenue falls", "t:down"), ("Revenue stays the same", "t:same"), ("Quantity sold rises", "t:qup"), ("It cannot be known from η", "t:unknown")],
  "|η| < 1: quantity falls proportionally LESS than price rises.",
  "A 1% price rise loses only about 0.4% of passes, so revenue p·q goes up by roughly 0.6%: <b>revenue rises</b>. Quantity still falls.",
  chk=val("t:up"))
C(D, "The price where demand is unit-elastic",
  "Demand q = 90 − 3p. At which price is the elasticity exactly −1?",
  ("p = 15", "n:15"),
  [("p = 30", "n:30"), ("p = 45", "n:45"), ("p = 10", "n:10"), ("p = 7.5", "n:7.5")],
  "η = −3p ⁄ (90 − 3p). Set it equal to −1 and solve.",
  "−3p = −(90 − 3p) ⇔ 6p = 90 ⇔ <b>p = 15</b> — halfway to the choke price 30, which is also where revenue peaks.",
  chk=solve(-3 * p / (90 - 3 * p) + 1, p)[0])
C(D, "Elasticity from two observations",
  "When a gym cut its monthly fee from CHF 20 to CHF 19, membership rose from 500 to 530. Estimate the price elasticity (relative to the starting point).",
  ("−1.2", "n:-1.2"),
  [("−0.83", "n:-0.83"), ("1.2", "n:1.2"), ("−30", "n:-30"), ("−0.06", "n:-0.06")],
  "η ≈ (Δq ⁄ q) ⁄ (Δp ⁄ p): percentage change of quantity over percentage change of price.",
  "Δq ⁄ q = 30 ⁄ 500 = +6%; Δp ⁄ p = −1 ⁄ 20 = −5%. η ≈ 6% ⁄ (−5%) = <b>−1.2</b>. −0.83 divides the other way round.",
  chk=Rational(30, 500) / Rational(-1, 20))

# ======================================================================
# 12 · CRITICAL POINTS, CONCAVITY, OPTIMISATION (5)
# ======================================================================
D = "Critical points & concavity"
C(D, "Where the slope is zero",
  "Let f(x) = 2x³ + 3x² − 36x. What are the critical points?",
  ("x = −3 and x = 2", "t:{-3,2}"),
  [("x = 3 and x = −2", "t:{-2,3}"), ("x = 2 only", "t:{2}"), ("x = 0, x = −3 and x = 2", "t:{-3,0,2}"), ("x = −1 and x = 6", "t:{-1,6}")],
  "Solve f′(x) = 0. Divide the quadratic by 6 first.",
  "f′ = 6x² + 6x − 36 = 6(x² + x − 6) = 6(x + 3)(x − 2). <b>x = −3 and x = 2</b>.",
  chk=val("t:{-3,2}"))
C(D, "Maximum or minimum?",
  "f(x) = x³ − 6x² + 9x + 2 has critical points at x = 1 and x = 3. What is f at x = 1?",
  ("A local maximum", "t:max"),
  [("A local minimum", "t:min"), ("An inflection point", "t:infl"), ("Neither: f′(1) ≠ 0", "t:notcrit"), ("A global maximum", "t:globalmax")],
  "Second-derivative test: the sign of f″(1).",
  "f″ = 6x − 12, f″(1) = −6 < 0 → concave down → <b>local maximum</b> (f(1) = 6). Not global: f → +∞ as x → +∞.",
  chk=val("t:max"))
C(D, "Where the curvature turns",
  "At which x does f(x) = x³ − 6x² + 5 have an inflection point?",
  ("x = 2", "n:2"),
  [("x = 0", "n:0"), ("x = 4", "n:4"), ("x = 6", "n:6"), ("x = −2", "n:-2")],
  "An inflection point is where f″ changes sign.",
  "f″ = 6x − 12 = 0 ⇔ <b>x = 2</b>, and f″ changes from − to + there. x = 0 and x = 4 are the critical points (f′ = 0) — a different thing.",
  chk=solve(diff(x ** 3 - 6 * x ** 2 + 5, x, 2), x)[0])
C(D, "Where a quartic is concave down",
  "On which interval is f(x) = x⁴ − 6x² concave down?",
  ("]−1, 1[", "t:]-1,1["),
  [("]−∞, −1[ ∪ ]1, +∞[", "t:out"), ("]−√3, √3[", "t:]-r3,r3["), ("]0, +∞[", "t:]0,inf["), ("]−√6, √6[", "t:]-r6,r6[")],
  "Concave down where f″ < 0.",
  "f″ = 12x² − 12 = 12(x² − 1) < 0 ⇔ <b>−1 < x < 1</b>. ±√3 are where f′ = 4x³ − 12x is zero — the critical points, which say nothing about curvature.",
  chk=val("t:]-1,1["))
C(D, "The profit-maximising output",
  "P(q) = −q³ + 15q² − 48q − 20. Which output maximises profit?",
  ("q = 8", "n:8"),
  [("q = 2", "n:2"), ("q = 5", "n:5"), ("q = 10", "n:10"), ("q = 16", "n:16")],
  "Solve P′(q) = 0, then use P″ to tell the maximum from the minimum.",
  "P′ = −3q² + 30q − 48 = −3(q² − 10q + 16) = −3(q − 2)(q − 8). P″ = −6q + 30: P″(2) = 18 > 0 (a minimum, a loss of 64), P″(8) = −18 < 0 → <b>q = 8</b>, P = 44.",
  chk=Rational(8))


# ======================================================================
# SECOND SET · 66 more cards (28 Oct 2026), same categories, new
# functions and situations — checked against the first 99 as well
# ======================================================================
D = "Domain & range"
C(D, "A root in the denominator",
  f"What is the domain of f(x) = {F('1', S('8 − 2x'))} ?",
  ("]−∞, 4[", "t:]-inf,4["),
  [("]−∞, 4]", "t:]-inf,4]"), ("]4, +∞[", "t:]4,inf["), ("ℝ \\ {4}", "t:R-{4}"), ("]−∞, 8[", "t:]-inf,8[")],
  "Under the root: ≥ 0. In the denominator: ≠ 0. Together: strictly positive.",
  "8 − 2x > 0 ⇔ x < 4. 4 itself makes the denominator √0 = 0, so it is excluded: <b>]−∞, 4[</b>.",
  chk=val("t:]-inf,4["))
C(D, "A log and a root together",
  f"What is the domain of f(x) = ln x + {S('3 − x')} ?",
  ("]0, 3]", "t:]0,3]"),
  [("[0, 3]", "t:[0,3]"), ("]0, 3[", "t:]0,3["), ("]−∞, 3]", "t:]-inf,3]"), ("]0, +∞[", "t:]0,inf[")],
  "Each piece has its own condition; x must satisfy both.",
  "ln x needs x > 0; √(3 − x) needs x ≤ 3. Both: <b>]0, 3]</b> — open at 0, closed at 3.",
  chk=val("t:]0,3]"))
C(D, "A denominator that is never zero",
  f"What is the domain of f(x) = {F('x − 2', 'x² + 4')} ?",
  ("ℝ", "t:R"),
  [("ℝ \\ {2}", "t:R-{2}"), ("ℝ \\ {−2, 2}", "t:R-{-2,2}"), ("ℝ \\ {−4}", "t:R-{-4}"), ("]2, +∞[", "t:]2,inf[")],
  "Can x² + 4 ever be 0?",
  "x² ≥ 0, so x² + 4 ≥ 4 > 0 for every x. Nothing is forbidden: <b>ℝ</b>. x = 2 only makes f equal to 0, which is allowed.",
  chk=val("t:R"))
C(D, "A shifted parabola",
  "What is the range of f(x) = (x − 1)² + 5 ?",
  ("[5, +∞[", "t:[5,inf["),
  [("]5, +∞[", "t:]5,inf["), ("[1, +∞[", "t:[1,inf["), ("ℝ", "t:R"), ("[0, +∞[", "t:[0,inf[")],
  "A square is ≥ 0, and equals 0 at x = 1.",
  "(x − 1)² ≥ 0, so f ≥ 5, reached at x = 1: <b>[5, +∞[</b>. 1 is where the minimum is, not its value.",
  chk=val("t:[5,inf["))
C(D, "A negative exponential",
  "What is the range of f(x) = −2eˣ ?",
  ("]−∞, 0[", "t:]-inf,0["),
  [("]−∞, 0]", "t:]-inf,0]"), ("]0, +∞[", "t:]0,inf["), ("]−∞, −2]", "t:]-inf,-2]"), ("ℝ", "t:R")],
  "eˣ takes every value in ]0, +∞[. Multiply that whole set by −2.",
  "eˣ ∈ ]0, +∞[ ⇒ −2eˣ ∈ <b>]−∞, 0[</b>. 0 is never reached; −2 is only the value at x = 0.",
  chk=val("t:]-inf,0["))

D = "Operations & composition"
C(D, "A reciprocal after a shift",
  f"Let f(x) = x + 2 and g(x) = {F('1', 'x')}. What is (g ∘ f)(x)?",
  (F("1", "x + 2"), "e:1/(x+2)"),
  [(F("1", "x") + " + 2", "e:1/x+2"), (F("1", "2x"), "e:1/(2*x)"), ("x + " + F("1", "2"), "e:x+1/2"), (F("x", "x + 2"), "e:x/(x+2)")],
  "g ∘ f: first add 2, then take the reciprocal.",
  "g(f(x)) = g(x + 2) = <b>1 ⁄ (x + 2)</b>. 1⁄x + 2 is the other order, f(g(x)).",
  chk=1 / (x + 2))
C(D, "A difference at a negative point",
  "Let f(x) = 3x² and g(x) = x³ − x. Compute (f − g)(−1).",
  ("3", "n:3"),
  [("2", "n:2"), ("4", "n:4"), ("−3", "n:-3"), ("6", "n:6")],
  "Evaluate each at −1, keeping the signs: (−1)² = 1, (−1)³ = −1.",
  "f(−1) = 3, g(−1) = −1 + 1 = 0. (f − g)(−1) = <b>3</b>.",
  chk=3 * (-1) ** 2 - ((-1) ** 3 - (-1)))
C(D, "Revenue per hour open",
  "A bakery serves n(h) = 40 + 5h customers when it opens h hours a day, and each customer spends CHF 15. Write the daily revenue as a function of h.",
  ("R = 600 + 75h", "e:600+75*y"),
  [("R = 600 + 5h", "e:600+5*y"), ("R = 40 + 75h", "e:40+75*y"), ("R = 75h", "e:75*y"), ("R = 55 + 75h", "e:55+75*y")],
  "R(n) = 15n; replace n by 40 + 5h.",
  "R = 15(40 + 5h) = <b>600 + 75h</b>: the 40 regulars bring 600; each extra hour adds 5 customers × 15.",
  chk=15 * (40 + 5 * y))
C(D, "Replace x by 2x",
  "Let f(x) = x² + 1. What is f(2x)?",
  ("4x² + 1", "e:4*x**2+1"),
  [("2x² + 2", "e:2*x**2+2"), ("2x² + 1", "e:2*x**2+1"), ("4x² + 4", "e:4*x**2+4"), ("4x² + 2", "e:4*x**2+2")],
  "Every x becomes (2x), brackets included.",
  "(2x)² + 1 = <b>4x² + 1</b>. 2x² + 2 is 2·f(x) — doubling the output, not the input.",
  chk=(2 * x) ** 2 + 1)
C(D, "Order matters",
  "Let f(x) = x + 5 and g(x) = 2x. Compute (g ∘ f)(1) − (f ∘ g)(1).",
  ("5", "n:5"),
  [("0", "n:0"), ("−5", "n:-5"), ("12", "n:12"), ("7", "n:7")],
  "Compute both compositions at 1 separately.",
  "(g ∘ f)(1) = g(6) = 12; (f ∘ g)(1) = f(2) = 7. Difference: <b>5</b>. 0 assumes the order does not matter — it does.",
  chk=2 * (1 + 5) - (2 * 1 + 5))

D = "Inverse functions"
C(D, "Undo a division",
  f"Let f(x) = {F('x − 4', '3')}. What is f⁻¹(x)?",
  ("3x + 4", "e:3*x+4"),
  [("3x − 4", "e:3*x-4"), (F("x + 4", "3"), "e:(x+4)/3"), (F("3", "x − 4"), "e:3/(x-4)"), (F("x", "3") + " + 4", "e:x/3+4")],
  "f subtracts 4 then divides by 3. Undo: multiply by 3, then add 4.",
  "y = (x − 4) ⁄ 3 ⇔ 3y = x − 4 ⇔ x = 3y + 4: <b>f⁻¹(x) = 3x + 4</b>.",
  chk=3 * x + 4)
C(D, "Supply, read the other way",
  "Supply is p = 2q + 10. Express the quantity supplied as a function of the price.",
  ("q = " + F("p − 10", "2"), "e:(p-10)/2"),
  [("q = " + F("p + 10", "2"), "e:(p+10)/2"), ("q = 2p − 10", "e:2*p-10"), ("q = " + F("p", "2") + " − 10", "e:p/2-10"), ("q = 2(p − 10)", "e:2*(p-10)")],
  "Solve p = 2q + 10 for q.",
  "2q = p − 10 ⇔ <b>q = (p − 10) ⁄ 2</b>. At p = 10 nothing is supplied; each extra franc brings half a unit.",
  chk=solve(2 * q + 10 - p, q)[0])
C(D, "Undo a reciprocal",
  f"Let f(x) = {F('5', 'x + 1')}, x ≠ −1. What is f⁻¹(x)?",
  (F("5", "x") + " − 1", "e:5/x-1"),
  [(F("5", "x − 1"), "e:5/(x-1)"), (F("x", "5") + " − 1", "e:x/5-1"), (F("5", "x") + " + 1", "e:5/x+1"), (F("x + 1", "5"), "e:(x+1)/5")],
  "y(x + 1) = 5 ⇒ x + 1 = 5 ⁄ y.",
  "x + 1 = 5 ⁄ y ⇔ x = 5 ⁄ y − 1: <b>f⁻¹(x) = 5⁄x − 1</b>. (x + 1) ⁄ 5 is 1 ⁄ f.",
  chk=5 / x - 1)
C(D, "Undo ln(2x)",
  "Let f(x) = ln(2x), x > 0. What is f⁻¹(x)?",
  (F("eˣ", "2"), "e:exp(x)/2"),
  [("2eˣ", "e:2*exp(x)"), ("e<sup>x⁄2</sup>", "e:exp(x/2)"), ("e<sup>2x</sup>", "e:exp(2*x)"), (F("ln x", "2"), "e:log(x)/2")],
  "y = ln(2x) ⇔ eʸ = 2x.",
  "eʸ = 2x ⇔ x = eʸ ⁄ 2: <b>f⁻¹(x) = eˣ ⁄ 2</b>.",
  chk=exp(x) / 2)
C(D, "Undo a root",
  f"Let f(x) = {S('x + 4')}, x ≥ −4. What is f⁻¹(x), for x ≥ 0?",
  ("x² − 4", "e:x**2-4"),
  [("x² + 4", "e:x**2+4"), (S("x") + " − 4", "e:sqrt(x)-4"), ("(x − 4)²", "e:(x-4)**2"), (S("x − 4"), "e:sqrt(x-4)")],
  "Square both sides of y = √(x + 4).",
  "y² = x + 4 ⇔ x = y² − 4: <b>f⁻¹(x) = x² − 4</b>. Check: f(5) = 3 and 3² − 4 = 5 ✓.",
  chk=x ** 2 - 4)

D = "Exponentials & logarithms"
C(D, "Undo a natural log",
  "Solve ln x = 2.",
  ("x = e² ≈ 7.389", "n:exp(2)"),
  [("x = 2e ≈ 5.437", "n:2*exp(1)"), ("x = ln 2", "n:log(2)"), ("x = 100", "n:100"), ("x = √e", "n:sqrt(exp(1))")],
  "ln x = 2 means: e to the power 2 is x.",
  "x = <b>e² ≈ 7.389</b>. 100 would be the answer for log₁₀ x = 2.",
  chk=exp(2))
C(D, "Powers of three",
  "Solve 3<sup>x + 1</sup> = 81.",
  ("x = 3", "n:3"),
  [("x = 4", "n:4"), ("x = 27", "n:27"), ("x = 26", "n:26"), ("x = 2", "n:2")],
  "81 = 3⁴. Compare the exponents.",
  "3<sup>x + 1</sup> = 3⁴ ⇔ x + 1 = 4 ⇔ <b>x = 3</b>. 4 forgets to subtract 1.",
  chk=solve(x + 1 - 4, x)[0])
C(D, "ln of e and of 1⁄e",
  f"Compute ln(e⁵) − ln({F('1', 'e')}).",
  ("6", "n:6"),
  [("4", "n:4"), ("5", "n:5"), ("−6", "n:-6"), ("e⁶", "n:exp(6)")],
  "ln(eᵏ) = k, and 1⁄e = e⁻¹.",
  "5 − (−1) = <b>6</b>. 4 drops the minus sign of ln(1⁄e).",
  chk=log(exp(5)) - log(1 / EE))
C(D, "Which one equals ln 12?",
  "Which expression is equal to ln 12?",
  ("ln 3 + 2 ln 2", "n:log(3)+2*log(2)"),
  [("ln 3 · ln 4", "n:log(3)*log(4)"), ("2 ln 6", "n:2*log(6)"), ("ln 24 − ln 4", "n:log(24)-log(4)"), ("ln 9 + ln 3", "n:log(9)+log(3)")],
  "12 = 3 × 4 = 3 × 2². Use ln(ab) = ln a + ln b and ln(aᵏ) = k ln a.",
  "ln 12 = ln 3 + ln 4 = <b>ln 3 + 2 ln 2</b>. 2 ln 6 = ln 36; ln 24 − ln 4 = ln 6; ln 3 · ln 4 is not a log law at all.",
  chk=log(12))
C(D, "Sales that triple",
  "Monthly sales follow S(t) = 500 e<sup>0.1t</sup> (t in months). When do they reach 1 500?",
  ("t = 10 ln 3 ≈ 11 months", "n:10*log(3)"),
  [("30 months", "n:30"), ("20 months", "n:20"), ("10 months", "n:10"), ("3 months", "n:3")],
  "Divide by 500, then take ln.",
  "e<sup>0.1t</sup> = 3 ⇔ 0.1t = ln 3 ⇔ <b>t = 10 ln 3 ≈ 10.99</b>. 30 treats the growth as linear.",
  chk=10 * log(3))
C(D, "Half the value",
  "A car's value is V(t) = 8 000 e<sup>−0.25t</sup> (t in years). After how long is it worth half?",
  ("≈ 2.77 years", "n:4*log(2)"),
  [("4 years", "n:4"), ("2 years", "n:2"), ("0.5 years", "n:0.5"), ("≈ 0.17 years", "n:0.25*log(2)")],
  "Set e<sup>−0.25t</sup> = ½ and take ln.",
  "−0.25t = ln ½ = −ln 2 ⇔ t = ln 2 ⁄ 0.25 = <b>2.77 years</b>. 0.17 multiplies by 0.25 instead of dividing.",
  chk=log(2) / Rational(1, 4))

D = "Lines"
C(D, "The intercept from one point",
  "A line has slope −3 and passes through (2, 7). What is its y-intercept?",
  ("13", "n:13"),
  [("1", "n:1"), ("7", "n:7"), ("−13", "n:-13"), ("4", "n:4")],
  "y = −3x + b; put in (2, 7).",
  "7 = −6 + b ⇔ <b>b = 13</b>. 1 comes from 7 − 6, a sign slip.",
  chk=7 + 3 * 2)
C(D, "Two points with the same x",
  "Which equation describes the line through (1, 4) and (1, −2)?",
  ("x = 1", "t:x=1"),
  [("y = 1", "t:y=1"), ("y = x + 3", "t:y=x+3"), ("x = 4", "t:x=4"), ("y = −3x + 7", "t:y=-3x+7")],
  "Both points have x = 1. What does a line through them look like?",
  "Same x, different y: the line is vertical, <b>x = 1</b>. Its slope (6 ⁄ 0) does not exist, so no y = mx + b form fits.",
  chk=val("t:x=1"))
C(D, "A perpendicular slope",
  f"What is the slope of any line perpendicular to y = {F('2', '5')}x − 1 ?",
  ("−" + F("5", "2"), "n:-5/2"),
  [(F("5", "2"), "n:5/2"), ("−" + F("2", "5"), "n:-2/5"), (F("2", "5"), "n:2/5"), ("−1", "n:-1")],
  "Perpendicular slopes multiply to −1: flip the fraction and change the sign.",
  "m₂ = −1 ⁄ (2⁄5) = <b>−5⁄2</b>. Check: (2⁄5)(−5⁄2) = −1 ✓.",
  chk=-1 / Rational(2, 5))
C(D, "From the two intercepts",
  "A line crosses the x-axis at 4 and the y-axis at −2. What is its equation?",
  ("y = " + F("x", "2") + " − 2", "e:x/2-2"),
  [("y = −" + F("x", "2") + " − 2", "e:-x/2-2"), ("y = 2x − 4", "e:2*x-4"), ("y = −2x + 4", "e:-2*x+4"), ("y = " + F("x", "2") + " + 4", "e:x/2+4")],
  "Two points: (4, 0) and (0, −2).",
  "m = (0 − (−2)) ⁄ (4 − 0) = ½, b = −2: <b>y = x⁄2 − 2</b>. Check x = 4: 2 − 2 = 0 ✓.",
  chk=x / 2 - 2)
C(D, "Two phone plans",
  "Plan A: CHF 20 a month plus CHF 0.10 a minute. Plan B: CHF 35 a month, unlimited. Above how many minutes is B cheaper?",
  ("150 minutes", "n:150"),
  [("350 minutes", "n:350"), ("200 minutes", "n:200"), ("15 minutes", "n:15"), ("55 minutes", "n:55")],
  "Set the two costs equal: 20 + 0.10m = 35.",
  "0.10m = 15 ⇔ <b>m = 150</b>. Above 150 minutes plan A costs more than 35.",
  chk=Rational(35 - 20) / Rational(1, 10))
C(D, "Read a value off a line",
  "A line passes through (0, 0) and (3, −6). What is y at x = −2?",
  ("4", "n:4"),
  [("−4", "n:-4"), ("2", "n:2"), ("−2", "n:-2"), ("6", "n:6")],
  "Slope first, then y = mx (the line passes through the origin).",
  "m = −6 ⁄ 3 = −2, so y = −2x and y(−2) = <b>4</b>.",
  chk=-2 * (-2))

D = "Business models"
C(D, "A profit target",
  "A product sells for CHF 40, costs CHF 28 per unit to make, and the fixed costs are CHF 9 000. How many units give a profit of CHF 3 000?",
  ("1 000", "n:1000"),
  [("750", "n:750"), ("300", "n:300"), ("1 250", "n:1250"), ("≈ 428.6", "n:12000/28")],
  "Profit = (40 − 28)q − 9 000. Set it equal to 3 000.",
  "12q = 12 000 ⇔ <b>q = 1 000</b>. 750 is break-even (profit 0).",
  chk=Rational(9000 + 3000, 40 - 28))
C(D, "Equilibrium quantity",
  "Demand q = 500 − 10p, supply q = 40p. What quantity is traded at equilibrium?",
  ("400", "n:400"),
  [("10", "n:10"), ("500", "n:500"), ("100", "n:100"), ("450", "n:450")],
  "Set demand = supply, solve for p, then compute q.",
  "500 − 10p = 40p ⇔ p = 10, q = 40 × 10 = <b>400</b>. 10 is the price, not the quantity.",
  chk=40 * solve(500 - 10 * p - 40 * p, p)[0])
C(D, "Revenue at a price",
  "Demand is q = 80 − 2p. What is the revenue at p = 15?",
  ("CHF 750", "n:750"),
  [("CHF 1 200", "n:1200"), ("CHF 50", "n:50"), ("CHF 1 170", "n:1170"), ("CHF 600", "n:600")],
  "R = p × q, with q from the demand curve.",
  "q(15) = 50, R = 15 × 50 = <b>750</b>. 1 200 uses q = 80, ignoring the price.",
  chk=15 * (80 - 2 * 15))
C(D, "The best ticket price",
  "A cinema with 300 seats sells out at CHF 12. Each franc added to the price loses 15 spectators. Which price maximises revenue?",
  ("CHF 16", "n:16"),
  [("CHF 12", "n:12"), ("CHF 32", "n:32"), ("CHF 20", "n:20"), ("CHF 18", "n:18")],
  "q = 300 − 15(p − 12) = 480 − 15p. R = p·q is a parabola.",
  "R = 480p − 15p², R′ = 480 − 30p = 0 ⇔ <b>p = 16</b> (240 seats, CHF 3 840 against 3 600 at 12). 32 is where nobody comes.",
  chk=solve(diff(p * (480 - 15 * p), p), p)[0])
C(D, "What a budget buys",
  "Total cost is C(q) = 5 000 + 12q. How many units can a budget of CHF 11 000 produce?",
  ("500", "n:500"),
  [("≈ 916.7", "n:11000/12"), ("≈ 1 333", "n:16000/12"), ("≈ 416.7", "n:5000/12"), ("600", "n:600")],
  "Set C(q) = 11 000.",
  "12q = 6 000 ⇔ <b>q = 500</b>. 916.7 forgets that 5 000 of the budget goes to fixed costs.",
  chk=Rational(11000 - 5000, 12))
C(D, "Rent goes up",
  "Price CHF 30, unit cost CHF 18, fixed costs CHF 6 000. Fixed costs rise by 20%. What is the new break-even quantity?",
  ("600", "n:600"),
  [("500", "n:500"), ("520", "n:520"), ("720", "n:720"), ("240", "n:240")],
  "Break-even = fixed ⁄ (price − unit cost), with the new fixed cost.",
  "New fixed 7 200; 7 200 ⁄ 12 = <b>600</b> (from 500). A 20% rise in fixed costs moves break-even by exactly 20%.",
  chk=Rational(6000 * 12 // 10, 30 - 18))
C(D, "Markup, then a discount",
  "A shop buys an item for CHF 80 and prices it 25% above cost. In the sales it then takes 25% off that price. What is the profit per item?",
  ("−CHF 5 (a loss)", "n:-5"),
  [("CHF 0", "n:0"), ("CHF 5", "n:5"), ("−CHF 20", "n:-20"), ("CHF 20", "n:20")],
  "Price: 80 × 1.25. Sale price: that × 0.75.",
  "80 × 1.25 = 100; 100 × 0.75 = 75; 75 − 80 = <b>−5</b>. 0 assumes +25% and −25% cancel; they are 25% of different amounts.",
  chk=80 * Rational(125, 100) * Rational(75, 100) - 80)
C(D, "Compound interest",
  "CHF 5 000 is invested at 3% a year, compounded yearly. What is it worth after 4 years?",
  ("≈ CHF 5 627.54", "n:5000*1.03**4"),
  [("CHF 5 600", "n:5600"), ("≈ CHF 5 637.48", "n:5000*exp(0.12)"), ("CHF 5 150", "n:5150"), ("≈ CHF 5 450", "n:5450")],
  "Each year multiplies by 1.03: V = 5 000 × 1.03⁴.",
  "1.03⁴ = 1.12551 → <b>5 627.54</b>. 5 600 is simple interest (3% of 5 000, four times); 5 637.48 is continuous compounding.",
  chk=5000 * Rational(103, 100) ** 4)

D = "Derivative rules"
Dv("Divide first", F("x² − 4", "x"), (x ** 2 - 4) / x,
   ("1 + " + F("4", "x²"), "e:1+4/x**2"),
   [("2x", "e:2*x"), ("1 − " + F("4", "x²"), "e:1-4/x**2"), ("x − " + F("4", "x²"), "e:x-4/x**2"), ("1 + " + F("4", "x"), "e:1+4/x")],
   "Split the fraction: x − 4⁄x. Then the power rule.",
   "(x − 4x⁻¹)′ = 1 + 4x⁻² = <b>1 + 4⁄x²</b>. 2x differentiates only the numerator.")
Dv("eˣ times a polynomial", "eˣ(x² + 1)", exp(x) * (x ** 2 + 1),
   ("eˣ(x + 1)²", "e:exp(x)*(x+1)**2"),
   [("2x eˣ", "e:2*x*exp(x)"), ("eˣ(x² + 1)", "e:exp(x)*(x**2+1)"), ("eˣ(x² + 2x)", "e:exp(x)*(x**2+2*x)"), ("2x eˣ + 1", "e:2*x*exp(x)+1")],
   "Product rule: eˣ(x² + 1) + eˣ·2x.",
   "eˣ(x² + 2x + 1) = <b>eˣ(x + 1)²</b>. eˣ(x² + 1) forgets the derivative of the polynomial.")
Dv("ln of a multiple", "ln(5x)", log(5 * x),
   (F("1", "x"), "e:1/x"),
   [(F("5", "x"), "e:5/x"), (F("1", "5x"), "e:1/(5*x)"), (F("ln 5", "x"), "e:log(5)/x"), ("5", "e:5+0*x")],
   "ln(5x) = ln 5 + ln x, and ln 5 is a constant.",
   "(ln 5)′ = 0, (ln x)′ = 1⁄x: <b>1⁄x</b>. By the chain rule: 5 ⁄ (5x) — the 5s cancel.")
Dv("A cube root of a quadratic", "∛(x² + 7)", (x ** 2 + 7) ** Rational(1, 3),
   (F("2x", "3 ∛(x² + 7)²"), "e:2*x/(3*(x**2+7)**(2/3))"),
   [(F("1", "3 ∛(x² + 7)²"), "e:1/(3*(x**2+7)**(2/3))"), (F("2x", "∛(x² + 7)²"), "e:2*x/(x**2+7)**(2/3)"), (F("2x", "3") + "∛(x² + 7)", "e:2*x*(x**2+7)**(1/3)/3"), (F("x", "3 ∛(x² + 7)²"), "e:x/(3*(x**2+7)**(2/3))")],
   "(x² + 7)<sup>1⁄3</sup>: power rule with exponent 1⁄3, then × the inner derivative 2x.",
   "(1⁄3)(x² + 7)<sup>−2⁄3</sup> · 2x = <b>2x ⁄ (3∛(x² + 7)²)</b>.")
Dv("A log squared", "(ln x)²", log(x) ** 2,
   (F("2 ln x", "x"), "e:2*log(x)/x"),
   [("2 ln x", "e:2*log(x)"), (F("2", "x"), "e:2/x"), (F("ln x", "x"), "e:log(x)/x"), (F("1", "x²"), "e:1/x**2")],
   "u² with u = ln x: 2u · u′.",
   "2 ln x · (1⁄x) = <b>2 ln x ⁄ x</b>. 2 ln x forgets the inner derivative. (ln x)² is not ln(x²) = 2 ln x.")
Dv("An exponential over x", F("e<sup>3x</sup>", "x"), exp(3 * x) / x,
   (F("e<sup>3x</sup>(3x − 1)", "x²"), "e:exp(3*x)*(3*x-1)/x**2"),
   [("3e<sup>3x</sup>", "e:3*exp(3*x)"), (F("e<sup>3x</sup>(3x + 1)", "x²"), "e:exp(3*x)*(3*x+1)/x**2"), (F("e<sup>3x</sup>(1 − 3x)", "x²"), "e:exp(3*x)*(1-3*x)/x**2"), (F("3e<sup>3x</sup>", "x"), "e:3*exp(3*x)/x")],
   "Quotient rule: u = e<sup>3x</sup> (u′ = 3e<sup>3x</sup>), v = x.",
   "(3e<sup>3x</sup>·x − e<sup>3x</sup>·1) ⁄ x² = <b>e<sup>3x</sup>(3x − 1) ⁄ x²</b>.")
Dv("A product with a square", "(x + 1)²(x − 2)", (x + 1) ** 2 * (x - 2),
   ("3x² − 3", "e:3*x**2-3"),
   [("2(x + 1)", "e:2*(x+1)"), ("(x + 1)²", "e:(x+1)**2"), ("3x² + 3", "e:3*x**2+3"), ("3x² − 3x", "e:3*x**2-3*x")],
   "Product rule, or expand first: (x + 1)²(x − 2) = x³ − 3x − 2.",
   "Expanded: x³ − 3x − 2, so f′ = <b>3x² − 3</b>. By the product rule: 2(x+1)(x−2) + (x+1)² = (x+1)(3x−3) — the same.")
Dv("One over a root", F("1", S("x")), 1 / sqrt(x),
   ("−" + F("1", "2x" + S("x")), "e:-1/(2*x*sqrt(x))"),
   [(F("1", "2" + S("x")), "e:1/(2*sqrt(x))"), ("−" + F("1", "2" + S("x")), "e:-1/(2*sqrt(x))"), ("−" + F("2", "x²"), "e:-2/x**2"), ("−" + F("1", "x" + S("x")), "e:-1/(x*sqrt(x))")],
   "1⁄√x = x<sup>−1⁄2</sup>. The new exponent is −3⁄2.",
   "(−1⁄2)x<sup>−3⁄2</sup> = <b>−1 ⁄ (2x√x)</b>. −1⁄(2√x) lowers the exponent to −1⁄2 − 0 instead of −1⁄2 − 1.")
C(D, "A third derivative",
  "Let f(x) = x⁵. What is f‴(x)?",
  ("60x²", "e:60*x**2"),
  [("20x³", "e:20*x**3"), ("120x", "e:120*x"), ("60x³", "e:60*x**3"), ("5x⁴", "e:5*x**4")],
  "Three times the power rule: 5x⁴, then 20x³, then …",
  "5x⁴ → 20x³ → <b>60x²</b>. 20x³ is f″.",
  chk=diff(x ** 5, x, 3))
Dv("Two to the 3x", "2<sup>3x</sup>", 2 ** (3 * x),
   ("3 · 2<sup>3x</sup> · ln 2", "e:3*2**(3*x)*log(2)"),
   [("3x · 2<sup>3x − 1</sup>", "e:3*x*2**(3*x-1)"), ("2<sup>3x</sup> · ln 2", "e:2**(3*x)*log(2)"), ("3 · 2<sup>3x</sup>", "e:3*2**(3*x)"), ("8ˣ", "e:8**x")],
   "(bᵘ)′ = bᵘ · ln b · u′, with u = 3x.",
   "2<sup>3x</sup> · ln 2 · 3 = <b>3 · 2<sup>3x</sup> · ln 2</b> (= 8ˣ ln 8, the same thing). 8ˣ is the function itself, not its derivative.")

D = "Tangents & marginal analysis"
C(D, "Tangent to a cubic",
  "What is the tangent line to f(x) = x³ − 2x at x = 2?",
  ("y = 10x − 16", "e:10*x-16"),
  [("y = 10x + 4", "e:10*x+4"), ("y = 4x + 2", "e:4*x+2"), ("y = 10x − 4", "e:10*x-4"), ("y = 12x − 20", "e:12*x-20")],
  "f(2) and f′(2), then y = f(2) + f′(2)(x − 2).",
  "f(2) = 4, f′ = 3x² − 2 → f′(2) = 10. y = 4 + 10(x − 2) = <b>10x − 16</b>. 12x − 20 forgets the −2 in f′.",
  chk=(x ** 3 - 2 * x).subs(x, 2) + diff(x ** 3 - 2 * x, x).subs(x, 2) * (x - 2))
C(D, "Marginal profit",
  "P(q) = −0.02q² + 60q − 8 000. What is the marginal profit at q = 1 000?",
  ("CHF 20", "n:20"),
  [("CHF 32 000", "n:32000"), ("CHF 40", "n:40"), ("CHF 60", "n:60"), ("−CHF 20", "n:-20")],
  "P′(q) = −0.04q + 60.",
  "P′(1 000) = −40 + 60 = <b>20</b>: one more unit still adds about CHF 20. 32 000 is the profit itself.",
  chk=diff(-q ** 2 / 50 + 60 * q - 8000, q).subs(q, 1000))
C(D, "Where marginal cost is lowest",
  "C(q) = q³ − 12q² + 60q + 100. At which output is the marginal cost lowest?",
  ("q = 4", "n:4"),
  [("q = 8", "n:8"), ("q = 2", "n:2"), ("q = 6", "n:6"), ("q = 12", "n:12")],
  "MC = C′(q) = 3q² − 24q + 60 is a parabola. Its minimum is where its own derivative is 0.",
  "MC′ = C″ = 6q − 24 = 0 ⇔ <b>q = 4</b> (MC = 12 there). This is the inflection point of C.",
  chk=solve(diff(q ** 3 - 12 * q ** 2 + 60 * q + 100, q, 2), q)[0])
C(D, "How fast average cost falls",
  "C(q) = 2 000 + 5q. The average cost is A(q) = C(q) ⁄ q. What is A′(100)?",
  ("−0.2", "n:-0.2"),
  [("0.2", "n:0.2"), ("5", "n:5"), ("−20", "n:-20"), ("25", "n:25")],
  "A(q) = 2 000⁄q + 5, so A′(q) = −2 000⁄q².",
  "A′(100) = −2 000 ⁄ 10 000 = <b>−0.2</b>: the 101st unit lowers the average by about 20 centimes. 25 is A(100) itself.",
  chk=diff(2000 / q + 5, q).subs(q, 100))
C(D, "Marginal revenue from a price curve",
  "Demand p = 200 − 4q. What is the marginal revenue at q = 10?",
  ("CHF 120", "n:120"),
  [("CHF 160", "n:160"), ("CHF 1 600", "n:1600"), ("CHF 200", "n:200"), ("CHF 80", "n:80")],
  "R = p·q = 200q − 4q², then R′.",
  "R′ = 200 − 8q, R′(10) = <b>120</b>. 160 is the price at q = 10 — marginal revenue is below price because the price falls on every unit.",
  chk=diff((200 - 4 * q) * q, q).subs(q, 10))
C(D, "Where the tangent is flat",
  "At which point of the graph of f(x) = x² − 6x + 11 is the tangent horizontal?",
  ("(3, 2)", "t:(3,2)"),
  [("(3, −2)", "t:(3,-2)"), ("(6, 11)", "t:(6,11)"), ("(2, 3)", "t:(2,3)"), ("(−3, 38)", "t:(-3,38)")],
  "Horizontal tangent: f′(x) = 0. Then compute f there.",
  "f′ = 2x − 6 = 0 ⇔ x = 3; f(3) = 9 − 18 + 11 = 2: <b>(3, 2)</b>.",
  chk=val("t:(3,2)"))

D = "Chain rule in business"
C(D, "Costs in euros, paid in francs",
  "A supplier's cost in euros is E(q) = 200 + 3q, and 1 euro costs CHF 0.95. What is the marginal cost in francs?",
  ("CHF 2.85 per unit", "n:2.85"),
  [("CHF 3", "n:3"), ("CHF 0.95", "n:0.95"), ("CHF 3.95", "n:3.95"), ("CHF 190", "n:190")],
  "C(q) = 0.95 · E(q). dC⁄dq = 0.95 · E′(q).",
  "0.95 × 3 = <b>2.85</b> francs per unit. 3 is the marginal cost in euros.",
  chk=Rational(95, 100) * 3)
C(D, "Warmer days, more ice cream",
  "Ice-cream sales are S(T) = 40T (T in °C), and the temperature rises as T(t) = 18 + 2t (t in hours after 8 am). How fast do sales grow per hour?",
  ("80 per hour", "n:80"),
  [("40", "n:40"), ("2", "n:2"), ("720", "n:720"), ("42", "n:42")],
  "dS⁄dt = dS⁄dT × dT⁄dt.",
  "40 × 2 = <b>80</b> per hour. 40 is per degree, not per hour.",
  chk=diff(40 * (18 + 2 * t), t))
C(D, "A root of a sum of squares",
  f"R(q) = {S('q² + 900')}. Compute R′(40).",
  ("0.8", "n:0.8"),
  [("0.5", "n:0.5"), ("40", "n:40"), ("50", "n:50"), ("1.6", "n:1.6")],
  "(√u)′ = u′ ⁄ (2√u), with u = q² + 900.",
  "R′ = 2q ⁄ (2√(q² + 900)) = q ⁄ √(q² + 900); at 40: 40 ⁄ 50 = <b>0.8</b>. 1.6 forgets the 2 in 2√u.",
  chk=diff(sqrt(q ** 2 + 900), q).subs(q, 40))
C(D, "Hiring over time",
  f"Output is q(L) = 10{S('L')} with L workers, and the workforce grows as L(t) = 100 + 4t (t in months). How fast does output grow at t = 0?",
  ("2 units per month", "n:2"),
  [("0.5", "n:0.5"), ("4", "n:4"), ("20", "n:20"), ("0.2", "n:0.2")],
  "dq⁄dt = q′(L) · L′(t), with q′(L) = 5 ⁄ √L and L(0) = 100.",
  "q′(100) = 5 ⁄ 10 = 0.5 per worker; L′ = 4 workers a month → <b>2</b> units a month.",
  chk=diff(10 * sqrt(100 + 4 * t), t).subs(t, 0))

D = "Approximation & Newton"
C(D, "A power close to 1",
  "Use the linear approximation of f(x) = x¹⁰ at x₀ = 1 to estimate 1.02¹⁰.",
  ("1.2", "n:1.2"),
  [("1.02", "n:1.02"), ("1.0", "n:1"), ("1.25", "n:1.25"), ("1.12", "n:1.12")],
  "f(1) = 1, f′(x) = 10x⁹, so f′(1) = 10.",
  "1.02¹⁰ ≈ 1 + 10 × 0.02 = <b>1.2</b> (the true value is 1.219 — the approximation errs on the low side because x¹⁰ curves up).",
  chk=1 + 10 * Rational(2, 100))
C(D, "ln of a number near 1",
  "Using the tangent to ln x at x₀ = 1, estimate ln 1.05.",
  ("0.05", "n:0.05"),
  [("0.0488", "n:0.0488"), ("1.05", "n:1.05"), ("0.5", "n:0.5"), ("0.005", "n:0.005")],
  "The tangent at 1 is y = x − 1.",
  "ln 1.05 ≈ 1.05 − 1 = <b>0.05</b>. 0.0488 is the exact value — the approximation, not the calculator, is asked for.",
  chk=Rational(105, 100) - 1)
C(D, "Newton on a quadratic",
  "One step of Newton's method on f(x) = x² − 2x − 5, starting from x₀ = 4. What is x₁?",
  ("3.5", "n:3.5"),
  [("4.5", "n:4.5"), ("3.25", "n:3.25"), ("3.449", "n:3.449"), ("3", "n:3")],
  "f(4) = 3, f′(x) = 2x − 2, so f′(4) = 6.",
  "x₁ = 4 − 3⁄6 = <b>3.5</b>. 4.5 adds the correction instead of subtracting it; 3.449 = 1 + √6 is the root itself.",
  chk=4 - Rational(4 ** 2 - 2 * 4 - 5, 2 * 4 - 2))
C(D, "When Newton cannot start",
  "Newton's method is applied to f(x) = x² − 4 from x₀ = 0. What happens at the first step?",
  ("The step is undefined, because f′(0) = 0", "t:undef"),
  [("x₁ = 2 straight away", "t:2"), ("x₁ = −2 straight away", "t:-2"), ("x₁ = 4", "t:4"), ("It converges slowly to 2", "t:slow")],
  "x₁ = x₀ − f(x₀) ⁄ f′(x₀). What is f′(0)?",
  "f′(x) = 2x, f′(0) = 0: the formula divides by zero — <b>the step is undefined</b>. Geometrically, the tangent at x = 0 is horizontal and never meets the x-axis. Start from any x₀ ≠ 0.",
  chk=val("t:undef"))

D = "Elasticity"
C(D, "Elasticity of a curved demand",
  "Demand q = 500 − 2p². What is the price elasticity at p = 10?",
  ("≈ −1.33", "n:-4/3"),
  [("−0.75", "n:-0.75"), ("−40", "n:-40"), ("≈ 1.33", "n:4/3"), ("≈ −0.13", "n:-2/15")],
  "η = q′(p) · p ⁄ q, with q′ = −4p.",
  "q(10) = 300, q′(10) = −40. η = −40 × 10 ⁄ 300 = <b>−4⁄3 ≈ −1.33</b>: elastic.",
  chk=Rational(-40 * 10, 300))
C(D, "Elastic demand and a price cut",
  "At the current price, η = −2.5. What does a small price cut do to revenue?",
  ("Revenue rises", "t:up"),
  [("Revenue falls", "t:down"), ("Revenue stays the same", "t:same"), ("Quantity falls", "t:qdown"), ("It cannot be known from η", "t:unknown")],
  "|η| > 1: quantity reacts more than proportionally to price.",
  "A 1% cut brings about 2.5% more sales, so revenue rises by roughly 1.5%: <b>revenue rises</b>. With elastic demand, price and revenue move in opposite directions.",
  chk=val("t:up"))
C(D, "A constant-elasticity demand",
  "Demand q = 1 000 p<sup>−0.6</sup>. What is the price elasticity?",
  ("−0.6, at every price", "t:-0.6"),
  [("−600 p<sup>−1.6</sup>", "t:-600p"), ("−0.4", "t:-0.4"), ("0.6", "t:0.6"), ("It depends on p", "t:dep")],
  "q′ = −600 p<sup>−1.6</sup>. Compute q′ · p ⁄ q.",
  "q′ · p ⁄ q = −600 p<sup>−1.6</sup> · p ⁄ (1 000 p<sup>−0.6</sup>) = <b>−0.6</b>, whatever p is. For q = k·pᵃ the elasticity is always a.",
  chk=val("t:-0.6"))
C(D, "Elasticity of a straight demand",
  "Demand q = 60 − p. What is the price elasticity at p = 20?",
  ("−0.5", "n:-0.5"),
  [("−2", "n:-2"), ("−1", "n:-1"), ("0.5", "n:0.5"), ("−20", "n:-20")],
  "η = q′ · p ⁄ q with q′ = −1 and q(20) = 40.",
  "η = −1 × 20 ⁄ 40 = <b>−0.5</b>: inelastic here. −2 inverts p ⁄ q.",
  chk=Rational(-20, 40))

D = "Critical points & concavity"
C(D, "The lowest value of a parabola",
  "What is the minimum VALUE of f(x) = x² − 8x + 30?",
  ("14", "n:14"),
  [("4", "n:4"), ("30", "n:30"), ("−14", "n:-14"), ("16", "n:16")],
  "Find where f′ = 0, then compute f there. The question asks for the value, not the x.",
  "f′ = 2x − 8 = 0 ⇔ x = 4; f(4) = 16 − 32 + 30 = <b>14</b>. 4 is where the minimum is.",
  chk=(x ** 2 - 8 * x + 30).subs(x, 4))
C(D, "A maximum on an interval",
  "What is the largest value of f(x) = −x² + 6x on the interval [0, 4]?",
  ("9", "n:9"),
  [("8", "n:8"), ("3", "n:3"), ("0", "n:0"), ("16", "n:16")],
  "Compare f at the critical point inside the interval with f at both ends.",
  "f′ = −2x + 6 = 0 ⇔ x = 3 ∈ [0, 4]; f(3) = 9, f(0) = 0, f(4) = 8. Maximum <b>9</b>. 8 is the value at the end point.",
  chk=max((-x ** 2 + 6 * x).subs(x, v) for v in (0, 3, 4)))
C(D, "Ordering costs",
  f"A shop's yearly stock cost is C(q) = q + {F('400', 'q')}, where q is the order size (q > 0). Which order size minimises it?",
  ("q = 20", "n:20"),
  [("q = 400", "n:400"), ("q = 10", "n:10"), ("q = 40", "n:40"), ("q = 200", "n:200")],
  "C′(q) = 1 − 400⁄q². Set it to zero.",
  "q² = 400 ⇔ <b>q = 20</b> (C = 40). C″ = 800⁄q³ > 0, so it is a minimum. 40 is the cost, not the order size.",
  chk=[r for r in solve(1 - 400 / q ** 2, q) if r > 0][0])



# ======================================================================
# THIRD SET · 50 more cards (28 Oct 2026), same categories. New functions
# and situations again: checked against the four midterm papers (no
# template of theirs reused — no p(q) = k⁄(q+a)+b inverses, no nth-root
# log expansions, no linear Newton, no x³ tangents, no package/event or
# visits→revenue stories) and against the first 165 cards.
# ======================================================================
D = "Domain & range"
C(D, "A log of a quotient",
  f"What is the domain of f(x) = ln({F('x − 1', 'x + 3')}) ?",
  ("]−∞, −3[ ∪ ]1, +∞[", "t:out"),
  [("]−3, 1[", "t:in"), ("]1, +∞[", "t:]1,inf["), ("ℝ \\ {−3}", "t:R-{-3}"), ("]−∞, −3] ∪ [1, +∞[", "t:closed")],
  "ln needs its argument strictly positive. A quotient is positive when top and bottom have the same sign.",
  "Both positive: x > 1. Both negative: x < −3. So <b>]−∞, −3[ ∪ ]1, +∞[</b>. Both ends are open: x = 1 gives ln 0, x = −3 divides by zero. ]−3, 1[ is exactly where the quotient is negative.",
  chk=val("t:out"))
C(D, "An exponential in the denominator",
  f"What is the domain of f(x) = {F('1', 'eˣ − 1')} ?",
  ("ℝ \\ {0}", "t:R-{0}"),
  [("ℝ", "t:R"), ("]0, +∞[", "t:]0,inf["), ("ℝ \\ {1}", "t:R-{1}"), ("ℝ \\ {e}", "t:R-{e}")],
  "Only a zero denominator is forbidden. For which x is eˣ = 1?",
  "eˣ = 1 ⇔ x = 0. Every other x is allowed — for x < 0 the denominator is negative, but not zero. <b>ℝ \\ {0}</b>.",
  chk=val("t:R-{0}"))
C(D, "Range of an upward parabola",
  "What is the range of f(x) = x² − 6x + 10 ?",
  ("[1, +∞[", "t:[1,inf["),
  [("]1, +∞[", "t:]1,inf["), ("[10, +∞[", "t:[10,inf["), ("[3, +∞[", "t:[3,inf["), ("ℝ", "t:R")],
  "Complete the square: x² − 6x + 10 = (x − 3)² + … ?",
  "x² − 6x + 10 = (x − 3)² + 1 ≥ 1, with 1 reached at x = 3: <b>[1, +∞[</b>. 10 is f(0), and 3 is where the minimum sits, not its value.",
  chk=val("t:[1,inf["))
C(D, "A price that settles",
  "After a launch, a product's price follows p(t) = 20 + 30e<sup>−0.1t</sup> (t ≥ 0, in months). Which prices can occur?",
  ("]20, 50]", "t:]20,50]"),
  [("[20, 50]", "t:[20,50]"), ("]20, +∞[", "t:]20,inf["), ("]0, 50]", "t:]0,50]"), ("[30, 50]", "t:[30,50]")],
  "Compute p(0). Then ask what e<sup>−0.1t</sup> does as t grows — does it ever reach 0?",
  "p(0) = 20 + 30 = 50, reached. e<sup>−0.1t</sup> decreases towards 0 without reaching it, so p approaches 20 but never gets there: <b>]20, 50]</b>.",
  chk=val("t:]20,50]"))

D = "Operations & composition"
C(D, "Solve for the inside",
  "Let f(x) = 2x + 1 and g(x) = x². For which x > 0 is (f ∘ g)(x) = 19?",
  ("x = 3", "n:3"),
  [("x = 9", "n:9"), ("x = √19", "n:sqrt(19)"), ("x = (√19 − 1) ⁄ 2", "n:(sqrt(19)-1)/2"), ("x = 2", "n:2")],
  "(f ∘ g)(x) = f(g(x)) = 2x² + 1. Set it equal to 19.",
  "2x² + 1 = 19 ⇔ x² = 9 ⇔ <b>x = 3</b> (x > 0). 9 stops at x²; (√19 − 1) ⁄ 2 solves (g ∘ f)(x) = 19 — the other order.",
  chk=[r for r in solve(2 * x ** 2 + 1 - 19, x) if r > 0][0])
C(D, "Domain of a composition",
  f"Let f(x) = {S('x')} and g(x) = 4 − x². What is the domain of f ∘ g ?",
  ("[−2, 2]", "t:[-2,2]"),
  [("[0, 2]", "t:[0,2]"), ("ℝ", "t:R"), ("]−2, 2[", "t:]-2,2["), ("[−4, 4]", "t:[-4,4]")],
  f"(f ∘ g)(x) = {S('4 − x²')}. What must be true of 4 − x²?",
  "4 − x² ≥ 0 ⇔ x² ≤ 4 ⇔ <b>−2 ≤ x ≤ 2</b>. Negative x are fine: g(−1) = 3 and √3 exists. The ends are included because √0 = 0.",
  chk=val("t:[-2,2]"))
C(D, "Shift inside, shift outside",
  "Let f(x) = x². Write g(x) = f(x − 3) + 2 as a polynomial.",
  ("x² − 6x + 11", "e:x**2-6*x+11"),
  [("x² + 6x + 11", "e:x**2+6*x+11"), ("x² − 7", "e:x**2-7"), ("x² − 1", "e:x**2-1"), ("x² − 6x + 7", "e:x**2-6*x+7")],
  "Replace x by (x − 3) INSIDE the square, then add 2 outside.",
  "(x − 3)² + 2 = x² − 6x + 9 + 2 = <b>x² − 6x + 11</b>. x² − 7 squares each term separately; x² − 1 subtracts 3 outside instead of inside.",
  chk=expand((x - 3) ** 2 + 2))

D = "Inverse functions"
C(D, "Undo an exponential with a minus",
  "Let f(x) = 5 − 2eˣ. What is f⁻¹(x), for x < 5?",
  ("ln(" + F("5 − x", "2") + ")", "e:log((5-x)/2)"),
  [(F("ln(5 − x)", "2"), "e:log(5-x)/2"), ("ln(" + F("x − 5", "2") + ")", "e:log((x-5)/2)"), (F("5 − ln x", "2"), "e:(5-log(x))/2"), ("ln(5 − 2x)", "e:log(5-2*x)")],
  "y = 5 − 2eˣ. Isolate eˣ first, then take ln.",
  "2eˣ = 5 − y ⇔ eˣ = (5 − y) ⁄ 2 ⇔ x = ln((5 − y) ⁄ 2). So <b>f⁻¹(x) = ln((5 − x) ⁄ 2)</b>, defined for x < 5 — exactly the range of f. ln(5 − x) ⁄ 2 divides the log instead of its argument.",
  chk=sympify("log((5-x)/2)", locals=NS))
C(D, "When will sales reach a level?",
  "Sales grow as f(x) = 100 · 1.04ˣ (x in years). Which formula gives the year x at which sales reach a level s?",
  (F("ln(s ⁄ 100)", "ln 1.04"), "e:log(x/100)/log(104/100)"),
  [(F("ln(s ⁄ 100)", "1.04"), "e:log(x/100)/(104/100)"), (F("ln(s − 100)", "ln 1.04"), "e:log(x-100)/log(104/100)"), (F("ln s", "100 ln 1.04"), "e:log(x)/(100*log(104/100))"), ("1.04<sup>s ⁄ 100</sup>", "e:(104/100)**(x/100)")],
  "Solve s = 100 · 1.04ˣ for x: divide by 100 first, then take ln of both sides.",
  "1.04ˣ = s ⁄ 100 ⇔ x ln 1.04 = ln(s ⁄ 100) ⇔ <b>x = ln(s ⁄ 100) ⁄ ln 1.04</b>. For s = 200: ln 2 ⁄ ln 1.04 ≈ 17.7 years. Dividing 100 out must happen before the log, not inside it.",
  chk=sympify("log(x/100)/log(104/100)", locals=NS))
C(D, "A value of the inverse, without the formula",
  "Let f(x) = x³ + x + 1, which is strictly increasing. What is f⁻¹(3)?",
  ("1", "n:1"),
  [("31", "n:31"), (F("1", "31"), "n:1/31"), ("2", "n:2"), ("∛2", "n:2**(1/3)")],
  "f⁻¹(3) is the x for which f(x) = 3. Try small whole numbers.",
  "f(1) = 1 + 1 + 1 = 3, so <b>f⁻¹(3) = 1</b>; f is strictly increasing (f′ = 3x² + 1 > 0), so no other x works. 31 is f(3), and 1 ⁄ 31 is 1 ⁄ f(3) — neither is the inverse.",
  chk=[r for r in solve(x ** 3 + x + 1 - 3, x) if r.is_real][0])

D = "Exponentials & logarithms"
C(D, "A sum of logs",
  "Solve ln(x + 2) + ln(x − 2) = ln 5.",
  ("x = 3", "n:3"),
  [("x = 3 or x = −3", "t:pm3"), ("x = 9", "n:9"), ("x = 5 ⁄ 2", "n:5/2"), ("x = √5", "n:sqrt(5)")],
  "ln a + ln b = ln(ab). Then check that every log you started with exists.",
  "ln((x + 2)(x − 2)) = ln 5 ⇔ x² − 4 = 5 ⇔ x = ±3. x = −3 makes both x + 2 and x − 2 negative, so their logs do not exist: <b>x = 3</b> only.",
  chk=[r for r in solve((x + 2) * (x - 2) - 5, x) if r > 2][0])
C(D, "e to a combination of logs",
  "Compute e<sup>2 ln 3 − ln 6</sup> without a calculator.",
  ("1.5", "n:1.5"),
  [("3", "n:3"), ("0.5", "n:0.5"), ("6", "n:6"), ("54", "n:54")],
  "First turn 2 ln 3 − ln 6 into ONE logarithm.",
  "2 ln 3 − ln 6 = ln 9 − ln 6 = ln(9 ⁄ 6) = ln 1.5, and e<sup>ln 1.5</sup> = <b>1.5</b>. 54 = 9 × 6 adds the logs instead of subtracting them.",
  chk=simplify(exp(2 * log(3) - log(6))))
C(D, "A continuous growth rate",
  "Revenue follows R(t) = 200e<sup>kt</sup> and grows from 200 to 300 in 4 years. What is k?",
  ("ln 1.5 ⁄ 4 ≈ 0.101", "n:log(1.5)/4"),
  [("0.125", "n:0.125"), ("ln 1.5 ≈ 0.405", "n:log(1.5)"), ("log₁₀ 1.5 ⁄ 4 ≈ 0.044", "n:log(1.5,10)/4"), ("0.5", "n:0.5")],
  "300 = 200e<sup>4k</sup>. Divide, then take ln.",
  "e<sup>4k</sup> = 1.5 ⇔ 4k = ln 1.5 ⇔ <b>k = ln 1.5 ⁄ 4 ≈ 0.101</b>, about 10.1% a year, continuously. 0.125 = 50% ⁄ 4 ignores compounding; ln 1.5 forgets to divide by the 4 years.",
  chk=log(Rational(3, 2)) / 4)

D = "Lines"
C(D, "A line from a table",
  "A linear relation gives y = 11 at x = 2, y = 8 at x = 4 and y = 5 at x = 6. What is its equation?",
  ("y = −1.5x + 14", "e:-3*x/2+14"),
  [("y = −1.5x + 11", "e:-3*x/2+11"), ("y = 1.5x + 8", "e:3*x/2+8"), ("y = −3x + 17", "e:-3*x+17"), ("y = −" + F("2", "3") + "x + " + F("37", "3"), "e:-2*x/3+37/3")],
  "Slope = Δy ⁄ Δx between any two rows. The intercept is y at x = 0, not y at the first row.",
  "m = (8 − 11) ⁄ (4 − 2) = −1.5. b = 11 − (−1.5)(2) = 14: <b>y = −1.5x + 14</b>. −3 takes Δy for a step of 2 as if it were a step of 1; −2⁄3 is Δx ⁄ Δy.",
  chk=Rational(8 - 11, 4 - 2) * x + (11 - Rational(8 - 11, 4 - 2) * 2))
C(D, "A sales trend",
  "A firm sold 1 200 units in 2020 and 1 560 in 2026, and sales grow linearly. What does the trend predict for 2030?",
  ("1 800", "n:1800"),
  [("1 680", "n:1680"), ("2 040", "n:2040"), ("1 720", "n:1720"), ("1 900", "n:1900")],
  "Slope = extra units per year = 360 ⁄ 6. Then add 4 more years to 2026.",
  "m = (1 560 − 1 200) ⁄ (2026 − 2020) = 60 units a year. 2030: 1 560 + 4 × 60 = <b>1 800</b>. 2 040 uses 360 ⁄ 3; 1 680 adds only 2 years.",
  chk=1560 + 4 * Rational(1560 - 1200, 6))
C(D, "Which pair is perpendicular?",
  "Which pair of lines is perpendicular?",
  ("y = 2x + 1 and y = −½x + 4", "t:perp"),
  [("y = 2x + 1 and y = 2x − 3", "t:par"), ("y = 3x − 1 and y = −3x + 2", "t:opp"), ("y = 4x and y = ¼x + 1", "t:recip"), ("y = −2x + 1 and y = −½x + 3", "t:prod1")],
  "Perpendicular slopes multiply to −1: m₂ = −1 ⁄ m₁ — the reciprocal AND the opposite sign.",
  "2 × (−½) = −1: <b>y = 2x + 1 and y = −½x + 4</b>. Equal slopes are parallel; 3 and −3 only flip the sign; 4 and ¼ only invert; −2 × −½ = +1.",
  chk=val("t:perp"))
C(D, "A line with slope zero",
  "What is the equation of the line through (−2, 3) with slope 0?",
  ("y = 3", "t:y=3"),
  [("x = −2", "t:x=-2"), ("y = −2", "t:y=-2"), ("y = 3x", "t:y=3x"), ("y = x + 5", "t:y=x+5")],
  "Slope 0 means y never changes as x moves.",
  "y − 3 = 0 · (x + 2) ⇔ <b>y = 3</b>, a horizontal line. x = −2 is the vertical line through the point — its slope is undefined, not 0.",
  chk=val("t:y=3"))

D = "Business models"
C(D, "Break-even revenue",
  "A shop's fixed costs are CHF 18 000 a month, and each franc of sales leaves 40 centimes after variable costs. What monthly revenue breaks even?",
  ("CHF 45 000", "n:45000"),
  [("CHF 7 200", "n:7200"), ("CHF 30 000", "n:30000"), ("CHF 25 200", "n:25200"), ("CHF 18 000", "n:18000")],
  "Each franc of revenue covers 0.40 of fixed cost. How many francs cover 18 000?",
  "0.40 · R = 18 000 ⇔ <b>R = CHF 45 000</b>. 7 200 multiplies instead of dividing; 30 000 divides by the 60% that goes to variable costs.",
  chk=Rational(18000) / Rational(4, 10))
C(D, "Two break-even points",
  "A price-setter's profit is P(q) = −q² + 14q − 40. At which outputs does it break even?",
  ("q = 4 and q = 10", "t:{4,10}"),
  [("q = 7 only", "t:{7}"), ("q = −10 and q = −4", "t:{-10,-4}"), ("q = 2 and q = 20", "t:{2,20}"), ("q = 5 and q = 8", "t:{5,8}")],
  "Break-even means P(q) = 0. Factor −(q² − 14q + 40).",
  "q² − 14q + 40 = (q − 4)(q − 10): <b>q = 4 and q = 10</b>. Profit is positive between them and peaks at q = 7 (P = 9) — 7 is the best output, not a break-even point.",
  chk=val("t:{4,10}"))
C(D, "A curved supply",
  "Demand is p = 50 − q and supply is p = 10 + q² ⁄ 2 (q ≥ 0). What is the market equilibrium?",
  ("q = 8, p = 42", "t:8,42"),
  [("q = 10, p = 40", "t:10,40"), ("q = 40, p = 10", "t:40,10"), ("q = 6, p = 44", "t:6,44"), ("q = −10, p = 60", "t:-10,60")],
  "Set the two prices equal: a quadratic in q. Keep the root that makes sense.",
  "50 − q = 10 + q² ⁄ 2 ⇔ q² + 2q − 80 = 0 ⇔ (q + 10)(q − 8) = 0. q ≥ 0 gives <b>q = 8, p = 42</b> (check: 10 + 32 = 42). q = −10 is the root a market cannot have.",
  chk=val("t:8,42"))
C(D, "A price floor",
  "Demand is q = 100 − 2p and supply is q = 3p − 20. The authorities set a minimum price of CHF 30. How many units are left unsold?",
  ("30", "n:30"),
  [("0", "n:0"), ("40", "n:40"), ("70", "n:70"), ("52", "n:52")],
  "At p = 30, compute what buyers want and what sellers offer. Is the floor above the equilibrium price?",
  "Equilibrium: 100 − 2p = 3p − 20 ⇔ p = 24, so the floor binds. At p = 30 buyers take 40 and sellers offer 70: a surplus of <b>30</b> units. 52 is the equilibrium quantity.",
  chk=(3 * 30 - 20) - (100 - 2 * 30))
C(D, "Two machines",
  "Machine A costs CHF 5 000 a year plus CHF 8 per unit; machine B costs CHF 11 000 a year plus CHF 5 per unit. At what yearly volume do they cost the same?",
  ("2 000 units", "n:2000"),
  [("1 200 units", "n:1200"), ("750 units", "n:750"), ("≈ 1 231 units", "n:16000/13"), ("3 000 units", "n:3000")],
  "Write both costs as lines in q and set them equal.",
  "5 000 + 8q = 11 000 + 5q ⇔ 3q = 6 000 ⇔ <b>q = 2 000</b>. Above 2 000 units the higher fixed cost of B pays off. 1 231 adds the costs instead of subtracting them.",
  chk=solve(5000 + 8 * q - (11000 + 5 * q), q)[0])
C(D, "Price up, volume down",
  "A café raises its price by 10% and sells 10% fewer coffees. What happens to its revenue?",
  ("It falls by 1%", "n:-1"),
  [("It is unchanged", "n:0"), ("It rises by 1%", "n:1"), ("It falls by 10%", "n:-10"), ("It falls by 0.1%", "n:-0.1")],
  "Revenue = p · q. Multiply the two factors 1.10 and 0.90.",
  "1.10 × 0.90 = 0.99: revenue <b>falls by 1%</b>. Percentages do not simply add — +10% and −10% do not cancel.",
  chk=(Rational(11, 10) * Rational(9, 10) - 1) * 100)

D = "Derivative rules"
Dv("eˣ times ln x", "eˣ ln x", exp(x) * log(x),
   ("eˣ(ln x + " + F("1", "x") + ")", "e:exp(x)*(log(x)+1/x)"),
   [(F("eˣ", "x"), "e:exp(x)/x"), ("eˣ ln x", "e:exp(x)*log(x)"), ("eˣ(ln x − " + F("1", "x") + ")", "e:exp(x)*(log(x)-1/x)"), ("eˣ + " + F("1", "x"), "e:exp(x)+1/x")],
   "Product rule: (eˣ)′ ln x + eˣ (ln x)′.",
   "eˣ ln x + eˣ · (1⁄x) = <b>eˣ(ln x + 1⁄x)</b>. eˣ ⁄ x multiplies the two derivatives; eˣ + 1⁄x adds them — neither is the product rule.")
Dv("A line over a parabola", F("3x − 2", "x² + 1"), (3 * x - 2) / (x ** 2 + 1),
   (F("−3x² + 4x + 3", "(x² + 1)²"), "e:(-3*x**2+4*x+3)/(x**2+1)**2"),
   [(F("3", "2x"), "e:3/(2*x)"), (F("3x² − 4x − 3", "(x² + 1)²"), "e:(3*x**2-4*x-3)/(x**2+1)**2"), (F("9x² − 4x + 3", "(x² + 1)²"), "e:(9*x**2-4*x+3)/(x**2+1)**2"), (F("−3x² + 4x + 3", "x² + 1"), "e:(-3*x**2+4*x+3)/(x**2+1)")],
   "(u ⁄ v)′ = (u′v − uv′) ⁄ v², with u = 3x − 2 and v = x² + 1.",
   "(3(x² + 1) − (3x − 2)·2x) ⁄ (x² + 1)² = (3x² + 3 − 6x² + 4x) ⁄ (x² + 1)² = <b>(−3x² + 4x + 3) ⁄ (x² + 1)²</b>. 9x² − 4x + 3 adds uv′ instead of subtracting it.")
Dv("A root times an exponential", S("x") + " e<sup>2x</sup>", sqrt(x) * exp(2 * x),
   ("e<sup>2x</sup>(" + F("1", "2" + S("x")) + " + 2" + S("x") + ")", "e:exp(2*x)*(1/(2*sqrt(x))+2*sqrt(x))"),
   [(F("e<sup>2x</sup>", S("x")), "e:exp(2*x)/sqrt(x)"), ("e<sup>2x</sup>(" + F("1", "2" + S("x")) + " + " + S("x") + ")", "e:exp(2*x)*(1/(2*sqrt(x))+sqrt(x))"), ("2" + S("x") + " e<sup>2x</sup>", "e:2*sqrt(x)*exp(2*x)"), (F("e<sup>2x</sup>", "2" + S("x")), "e:exp(2*x)/(2*sqrt(x))")],
   "Product rule, and inside it the chain rule: (e<sup>2x</sup>)′ = 2e<sup>2x</sup>.",
   "(1 ⁄ (2√x))·e<sup>2x</sup> + √x · 2e<sup>2x</sup> = <b>e<sup>2x</sup>(1 ⁄ (2√x) + 2√x)</b>. Dropping the inner 2 gives the third option; multiplying the two derivatives gives e<sup>2x</sup> ⁄ √x.")
Dv("The logistic curve", F("1", "1 + e<sup>−x</sup>"), 1 / (1 + exp(-x)),
   (F("e<sup>−x</sup>", "(1 + e<sup>−x</sup>)²"), "e:exp(-x)/(1+exp(-x))**2"),
   [("−" + F("e<sup>−x</sup>", "(1 + e<sup>−x</sup>)²"), "e:-exp(-x)/(1+exp(-x))**2"), ("−" + F("1", "(1 + e<sup>−x</sup>)²"), "e:-1/(1+exp(-x))**2"), (F("1", "1 − e<sup>−x</sup>"), "e:1/(1-exp(-x))"), (F("e<sup>−x</sup>", "1 + e<sup>−x</sup>"), "e:exp(-x)/(1+exp(-x))")],
   "(1 ⁄ u)′ = −u′ ⁄ u², with u = 1 + e<sup>−x</sup>. What is u′?",
   "u′ = −e<sup>−x</sup>, so −u′ ⁄ u² = <b>e<sup>−x</sup> ⁄ (1 + e<sup>−x</sup>)²</b> — positive, as it must be: the curve only rises. The first option loses one of the two minus signs; −1 ⁄ u² forgets u′ altogether.")
Dv("ln of a quotient", "ln(" + F("x + 1", "x − 1") + "), x > 1", log((x + 1) / (x - 1)),
   ("−" + F("2", "x² − 1"), "e:-2/(x**2-1)"),
   [(F("x − 1", "x + 1"), "e:(x-1)/(x+1)"), (F("2", "x² − 1"), "e:2/(x**2-1)"), (F("2x", "x² − 1"), "e:2*x/(x**2-1)"), ("−" + F("2", "(x − 1)²"), "e:-2/(x-1)**2")],
   "Split it first: ln(x + 1) − ln(x − 1).",
   "1 ⁄ (x + 1) − 1 ⁄ (x − 1) = ((x − 1) − (x + 1)) ⁄ (x² − 1) = <b>−2 ⁄ (x² − 1)</b>. 2x ⁄ (x² − 1) adds the two pieces; −2 ⁄ (x − 1)² is the derivative of the quotient itself, without the ln.")
Dv("A square times a power of 2", "x² · 2ˣ", x ** 2 * 2 ** x,
   ("2ˣ(2x + x² ln 2)", "e:2**x*(2*x+x**2*log(2))"),
   [("2x · 2ˣ ln 2", "e:2*x*2**x*log(2)"), ("2ˣ(2x + x²)", "e:2**x*(2*x+x**2)"), ("x³ · 2<sup>x − 1</sup>", "e:x**3*2**(x-1)"), ("2ˣ(2x ln 2 + x²)", "e:2**x*(2*x*log(2)+x**2)")],
   "(aˣ)′ = aˣ ln a — not x·a<sup>x−1</sup>. Then the product rule.",
   "2x · 2ˣ + x² · 2ˣ ln 2 = <b>2ˣ(2x + x² ln 2)</b>. Forgetting ln 2 treats 2ˣ like eˣ; x³ · 2<sup>x−1</sup> treats 2ˣ like a power of x.")
Dv("e to a root", "e<sup>" + S("x") + "</sup>", exp(sqrt(x)),
   (F("e<sup>" + S("x") + "</sup>", "2" + S("x")), "e:exp(sqrt(x))/(2*sqrt(x))"),
   [("e<sup>" + S("x") + "</sup>", "e:exp(sqrt(x))"), (S("x") + " e<sup>" + S("x") + " − 1</sup>", "e:sqrt(x)*exp(sqrt(x)-1)"), ("2" + S("x") + " e<sup>" + S("x") + "</sup>", "e:2*sqrt(x)*exp(sqrt(x))"), ("e<sup>1 ⁄ (2" + S("x") + ")</sup>", "e:exp(1/(2*sqrt(x)))")],
   "(eᵘ)′ = u′ eᵘ with u = √x, u′ = 1 ⁄ (2√x).",
   "<b>e<sup>√x</sup> ⁄ (2√x)</b>. The exponent stays as it is; only the factor u′ appears in front. 2√x multiplies by the inverse of u′.")
C(D, "A second derivative with a log",
  "Let f(x) = x² ln x, x > 0. What is f″(x)?",
  ("2 ln x + 3", "e:2*log(x)+3"),
  [("2x ln x + x", "e:2*x*log(x)+x"), ("2 ln x + 1", "e:2*log(x)+1"), ("−" + F("2", "x²"), "e:-2/x**2"), ("2 ln x + 2", "e:2*log(x)+2")],
  "First f′ by the product rule, then differentiate f′ — again with the product rule on its first term.",
  "f′ = 2x ln x + x² · (1⁄x) = 2x ln x + x. f″ = 2 ln x + 2x · (1⁄x) + 1 = <b>2 ln x + 3</b>. 2x ln x + x is f′; −2 ⁄ x² multiplies the two second derivatives.",
  chk=diff(x ** 2 * log(x), x, 2))

D = "Tangents & marginal analysis"
C(D, "Tangent to e²ˣ at 0",
  "What is the tangent line to f(x) = e<sup>2x</sup> at x = 0?",
  ("y = 2x + 1", "e:2*x+1"),
  [("y = x + 1", "e:x+1"), ("y = 2x", "e:2*x"), ("y = 2x + 2", "e:2*x+2"), ("y = e²x + 1", "e:exp(2)*x+1")],
  "y = f(0) + f′(0)(x − 0). f′(x) = 2e<sup>2x</sup>.",
  "f(0) = 1 and f′(0) = 2: <b>y = 2x + 1</b>. y = x + 1 is the tangent to eˣ, not e<sup>2x</sup>; y = 2x forgets that the curve passes through (0, 1).",
  chk=exp(2 * 0) + diff(exp(2 * x), x).subs(x, 0) * x)
C(D, "Tangent to x ln x at e",
  "What is the tangent line to f(x) = x ln x at x = e?",
  ("y = 2x − e", "e:2*x-e"),
  [("y = 2x + e", "e:2*x+e"), ("y = x", "e:x"), ("y = 2x − 2e", "e:2*x-2*e"), ("y = ex − e", "e:e*x-e")],
  "f(e) = e · ln e = e. f′(x) = ln x + 1.",
  "f′(e) = 2, so y = e + 2(x − e) = <b>2x − e</b>. y = x uses f′ = ln x, forgetting the product rule.",
  chk=(x * log(x)).subs(x, EE) + diff(x * log(x), x).subs(x, EE) * (x - EE))
C(D, "The exact cost of one more unit",
  "Total cost is C(q) = 0.02q² + 5q + 300. What does the 51st unit cost exactly, i.e. C(51) − C(50)?",
  ("CHF 7.02", "n:7.02"),
  [("CHF 7", "n:7"), ("CHF 7.04", "n:7.04"), ("CHF 5.02", "n:5.02"), ("CHF 607.02", "n:607.02")],
  "Compute both totals — or note that only the q² term differs from the marginal-cost estimate.",
  "C(51) = 52.02 + 255 + 300 = 607.02 and C(50) = 50 + 250 + 300 = 600, so the 51st unit costs <b>CHF 7.02</b>. The marginal cost C′(50) = 0.04 × 50 + 5 = 7 is the approximation of it; 607.02 is the total, not the extra.",
  chk=Rational(2, 100) * (51 ** 2 - 50 ** 2) + 5)
C(D, "A tangent parallel to a line",
  "At which x is the tangent to f(x) = x² − 4x + 1 parallel to the line y = 2x + 7?",
  ("x = 3", "n:3"),
  [("x = 1", "n:1"), ("x = 2", "n:2"), ("x = −3", "n:-3"), ("x = 4", "n:4")],
  "Parallel lines have equal slopes. Solve f′(x) = 2.",
  "f′(x) = 2x − 4 = 2 ⇔ <b>x = 3</b>, at the point (3, −2). x = 2 is where the tangent is flat; x = 1 is where the slope is −2.",
  chk=solve(2 * x - 4 - 2, x)[0])

D = "Chain rule in business"
C(D, "Cost through the working day",
  "Cost is C(q) = 400 + 2q², and output after t hours is q(t) = 5t + 10. How fast is cost rising at t = 2 (CHF per hour)?",
  ("400", "n:400"),
  [("80", "n:80"), ("5", "n:5"), ("1 200", "n:1200"), ("100", "n:100")],
  "dC⁄dt = C′(q) · q′(t). First find q at t = 2.",
  "q(2) = 20, C′(q) = 4q = 80 per unit, q′ = 5 units an hour: 80 × 5 = <b>CHF 400 an hour</b>. 80 stops at C′(q); 1 200 is C(20) itself.",
  chk=diff(400 + 2 * (5 * t + 10) ** 2, t).subs(t, 2))
C(D, "A price that rises week by week",
  "Revenue as a function of price is R(p) = p(100 − 2p), and the price rises as p(t) = 10 + 0.5t (t in weeks). How fast does revenue change at t = 10?",
  ("20 CHF per week", "n:20"),
  [("40", "n:40"), ("30", "n:30"), ("1 050", "n:1050"), ("−20", "n:-20")],
  "dR⁄dt = R′(p) · p′(t), with R′(p) = 100 − 4p. Use the price at t = 10, not at t = 0.",
  "p(10) = 15, R′(15) = 100 − 60 = 40, p′ = 0.5: dR⁄dt = <b>20</b> francs a week. 30 uses R′ at p = 10 (the price at t = 0); 1 050 is R(15).",
  chk=diff((10 + t / 2) * (100 - 2 * (10 + t / 2)), t).subs(t, 10))
C(D, "Users and revenue",
  "An app has U(t) = 1 000 ln(1 + t) users after t months, and each user brings CHF 3 a month. How fast is monthly revenue growing at t = 4?",
  ("CHF 600 per month", "n:600"),
  [("CHF 200", "n:200"), ("CHF 750", "n:750"), ("CHF 3 000", "n:3000"), ("≈ CHF 4 828", "n:3000*log(5)")],
  "Revenue R = 3U. dR⁄dt = 3 · U′(t), with U′(t) = 1 000 ⁄ (1 + t).",
  "U′(4) = 1 000 ⁄ 5 = 200 users a month; × CHF 3 = <b>CHF 600</b> a month. 200 forgets the price per user; 750 divides by t instead of 1 + t; 4 828 is the revenue level, not its growth.",
  chk=diff(3 * 1000 * log(1 + t), t).subs(t, 4))

D = "Approximation & Newton"
C(D, "A square root near 100",
  "Using the tangent to √x at x₀ = 100, estimate √102.",
  ("10.1", "n:10.1"),
  [("10.2", "n:10.2"), ("10.0995", "n:10.0995"), ("10.01", "n:10.01"), ("11", "n:11")],
  "f(100) = 10 and f′(x) = 1 ⁄ (2√x), so f′(100) = 1 ⁄ 20.",
  "√102 ≈ 10 + 2 × (1⁄20) = <b>10.1</b>. 10.0995 is the calculator's value — the question asks for the tangent's estimate; 10.2 forgets the 2 in 2√x.",
  chk=10 + Rational(2, 20))
C(D, "ln 3 from the tangent at e",
  "Using the tangent to ln x at x₀ = e, estimate ln 3.",
  ("3 ⁄ e ≈ 1.104", "n:3/e"),
  [("ln 3 ≈ 1.099", "n:log(3)"), ("3 − e ≈ 0.282", "n:3-e"), ("1 + 3 ⁄ e ≈ 2.104", "n:1+3/e"), ("2", "n:2")],
  "ln e = 1 and (ln x)′ = 1 ⁄ x, so the slope at e is 1 ⁄ e.",
  "ln x ≈ 1 + (x − e) ⁄ e = x ⁄ e, so ln 3 ≈ <b>3 ⁄ e ≈ 1.104</b> — close to the true 1.099 because 3 is close to e ≈ 2.718. 3 − e forgets the value ln e = 1.",
  chk=1 + (3 - EE) / EE)
C(D, "Newton towards √10",
  "One step of Newton's method on f(x) = x² − 10, starting from x₀ = 3. What is x₁?",
  ("19 ⁄ 6 ≈ 3.1667", "n:19/6"),
  [("17 ⁄ 6 ≈ 2.8333", "n:17/6"), ("√10 ≈ 3.1623", "n:sqrt(10)"), ("10 ⁄ 3", "n:10/3"), ("3.5", "n:3.5")],
  "x₁ = x₀ − f(x₀) ⁄ f′(x₀). f(3) = −1 and f′(3) = 6.",
  "x₁ = 3 − (−1) ⁄ 6 = <b>19 ⁄ 6 ≈ 3.1667</b>, already within 0.005 of √10. 17 ⁄ 6 loses the minus sign of f(3).",
  chk=3 - Rational(3 ** 2 - 10, 2 * 3))
C(D, "Newton on a cubic",
  "One step of Newton's method on f(x) = x³ − x − 1, starting from x₀ = 1. What is x₁?",
  ("1.5", "n:1.5"),
  [("0.5", "n:0.5"), ("1.3247", "n:1.3247"), ("2", "n:2"), ("1.25", "n:1.25")],
  "f(1) = −1, f′(x) = 3x² − 1, so f′(1) = 2.",
  "x₁ = 1 − (−1) ⁄ 2 = <b>1.5</b>. 0.5 adds the wrong sign; 1.3247 is the root itself, which Newton only reaches after several steps.",
  chk=1 - Rational(1 - 1 - 1, 3 - 1))

D = "Elasticity"
C(D, "Elasticity of an exponential demand",
  "Demand is q = 400e<sup>−0.02p</sup>. What is the price elasticity at p = 75?",
  ("−1.5", "n:-1.5"),
  [("−0.02", "n:-0.02"), ("1.5", "n:1.5"), ("−75", "n:-75"), ("−0.75", "n:-0.75")],
  "η = q′(p) · p ⁄ q. Here q′ = −0.02 q, so most of the expression cancels.",
  "η = (−0.02q) · p ⁄ q = −0.02p; at p = 75: <b>−1.5</b> — elastic. −0.02 is the slope factor, not the elasticity.",
  chk=simplify(diff(400 * exp(-p / 50), p) * p / (400 * exp(-p / 50))).subs(p, 75))
C(D, "Elasticity when price is given as a function of quantity",
  "The demand curve is written p = 80 − 2q. What is the price elasticity of demand at q = 10?",
  ("−3", "n:-3"),
  [("−" + F("1", "3"), "n:-1/3"), ("−12", "n:-12"), ("−0.5", "n:-0.5"), ("3", "n:3")],
  "Elasticity uses dq⁄dp. Rewrite as q = 40 − p ⁄ 2, and find the price at q = 10.",
  "q = 40 − p⁄2, so dq⁄dp = −½; at q = 10, p = 60. η = −½ × 60 ⁄ 10 = <b>−3</b>. −12 uses dp⁄dq = −2 in place of dq⁄dp; −1⁄3 inverts p ⁄ q.",
  chk=Rational(-1, 2) * 60 / 10)
C(D, "The price cut a target needs",
  "At the current price, η = −1.5. Approximately what price change raises sales by 6%?",
  ("A 4% price cut", "n:-4"),
  [("A 9% price cut", "n:-9"), ("A 4% price rise", "n:4"), ("A 6% price cut", "n:-6"), ("A 1.5% price cut", "n:-1.5")],
  "Δq ⁄ q ≈ η · Δp ⁄ p. Solve for Δp ⁄ p.",
  "6% = −1.5 × Δp ⁄ p ⇔ Δp ⁄ p = −4%: <b>a 4% price cut</b>. −9% multiplies by η instead of dividing.",
  chk=Rational(6) / Rational(-3, 2))

D = "Critical points & concavity"
C(D, "The top of x e⁻ˣ",
  "For x ≥ 0, where does f(x) = x e<sup>−x</sup> reach its maximum?",
  ("x = 1", "n:1"),
  [("x = 0", "n:0"), ("x = e", "n:e"), ("x = 1 ⁄ e", "n:1/e"), ("x = 2", "n:2")],
  "f′(x) = e<sup>−x</sup>(1 − x). e<sup>−x</sup> is never 0.",
  "f′ = 0 ⇔ x = 1; f′ > 0 before and < 0 after, so <b>x = 1</b> is the maximum (f(1) = 1 ⁄ e). 1 ⁄ e is the maximum VALUE, not where it occurs.",
  chk=solve(diff(x * exp(-x), x), x)[0])
C(D, "Smallest value on an interval",
  "What is the smallest value of f(x) = x³ − 12x on the interval [0, 3]?",
  ("−16", "n:-16"),
  [("−9", "n:-9"), ("2", "n:2"), ("0", "n:0"), ("16", "n:16")],
  "Compare f at the critical points inside [0, 3] with f at both ends.",
  "f′ = 3x² − 12 = 0 ⇔ x = ±2; only 2 lies in [0, 3]. f(0) = 0, f(2) = −16, f(3) = −9: minimum <b>−16</b>. −9 is the value at the end point; 2 is where the minimum is.",
  chk=min((x ** 3 - 12 * x).subs(x, v) for v in (0, 2, 3)))
C(D, "When the second-derivative test is silent",
  "You know that f′(2) = 0 and f″(2) = 0. What can you conclude about x = 2?",
  ("Nothing yet: it may be a maximum, a minimum or neither", "t:none"),
  [("A local maximum", "t:max"), ("A local minimum", "t:min"), ("An inflection point", "t:infl"), ("f is constant near 2", "t:const")],
  "Think of x⁴, −x⁴ and x³ at x = 0 — all three have f′ = f″ = 0 there.",
  "x⁴ has a minimum at 0, −x⁴ a maximum, x³ neither (an inflection point), and all three have f′(0) = f″(0) = 0. So the test gives <b>no conclusion</b>: look at the sign of f′ on each side instead.",
  chk=val("t:none"))
C(D, "Reading a sign chart",
  "f′(x) > 0 on ]0, 3[ and f′(x) < 0 on ]3, 6[. What does f have at x = 3?",
  ("A local maximum", "t:max"),
  [("A local minimum", "t:min"), ("An inflection point", "t:infl"), ("f(3) = 0", "t:f0"), ("f″(3) > 0", "t:fpp")],
  "f′ > 0: f rises. f′ < 0: f falls. Rises, then falls …",
  "f increases up to 3 and decreases after it: <b>a local maximum</b> at 3 (first-derivative test). Nothing says f(3) itself is 0 — it is f′(3) that changes sign.",
  chk=val("t:max"))
C(D, "Where eˣ − 3x² is concave up",
  "On which interval is f(x) = eˣ − 3x² concave up?",
  ("]ln 6, +∞[", "t:]ln6,inf["),
  [("]−∞, ln 6[", "t:]-inf,ln6["), ("]6, +∞[", "t:]6,inf["), ("]0, +∞[", "t:]0,inf["), ("]ln 3, +∞[", "t:]ln3,inf[")],
  "Concave up where f″ > 0. f′ = eˣ − 6x.",
  "f″ = eˣ − 6 > 0 ⇔ eˣ > 6 ⇔ <b>x > ln 6 ≈ 1.79</b>. ]6, +∞[ forgets the ln; ]−∞, ln 6[ is where f is concave down.",
  chk=val("t:]ln6,inf["))

# ----------------------------------------------------------------------
# checks that need more than one line
# ----------------------------------------------------------------------
x1 = Rational(2) - (8 - 10) / Rational(12)
x2 = x1 - (x1 ** 3 - 10) / (3 * x1 ** 2)
for c in CARDS:
    if c["title"] == "Two Newton steps":
        c["chk"] = ("n", sympify("2.15450"))
assert abs(float(x2) - 2.15450) < 5e-5, float(x2)
assert all(inv_ok(*pair) for pair in [(4 * x - 7, (x + 7) / 4), ((2 * x + 1) / (x - 3), (3 * x + 1) / (x - 2)),
                                     (exp(2 * x), log(x) / 2), (3 + log(x - 1), 1 + exp(x - 3))])
assert solve(diff(2 * x ** 3 + 3 * x ** 2 - 36 * x, x), x) in ([2], [-3, 2])  # positive symbol hides −3
from sympy import Symbol
xr = Symbol("xr", real=True)
assert sorted(solve(diff(2 * xr ** 3 + 3 * xr ** 2 - 36 * xr, xr), xr)) == [-3, 2]
assert sorted(solve(diff(xr ** 4 - 6 * xr ** 2, xr, 2), xr)) == [-1, 1]
assert diff(xr ** 3 - 6 * xr ** 2 + 9 * xr + 2, xr, 2).subs(xr, 1) < 0
assert expand_log(log(x ** 2 * y / z ** 3), force=True) == 2 * log(x) + log(y) - 3 * log(z)
# third set: the cards whose answer is a text key, recomputed here
from sympy import reduce_inequalities, Interval, Union, oo
assert reduce_inequalities((xr - 1) / (xr + 3) > 0, xr).as_set() == Union(Interval.open(-oo, -3), Interval.open(1, oo))
assert solve(exp(xr) - 1, xr) == [0]
assert reduce_inequalities(4 - xr ** 2 >= 0, xr).as_set() == Interval(-2, 2)
assert sorted(solve(-xr ** 2 + 14 * xr - 40, xr)) == [4, 10]
assert [r for r in solve(50 - xr - (10 + xr ** 2 / 2), xr) if r >= 0] == [8] and 50 - 8 == 42
assert 2 * Rational(-1, 2) == -1 and all(m1 * m2 != -1 for m1, m2 in [(2, 2), (3, -3), (4, Rational(1, 4)), (-2, Rational(-1, 2))])
assert solve(diff(exp(xr) - 3 * xr ** 2, xr, 2), xr) == [log(6)]
assert inv_ok(5 - 2 * exp(x), log((5 - x) / 2)) and inv_ok(100 * Rational(104, 100) ** x, log(x / 100) / log(Rational(104, 100)))
assert [diff(f, xr).subs(xr, 0) == 0 and diff(f, xr, 2).subs(xr, 0) == 0 for f in (xr ** 4, -xr ** 4, xr ** 3)] == [True] * 3

# ----------------------------------------------------------------------
# verify every card: the right option equals the recomputed answer,
# and no distractor does
# ----------------------------------------------------------------------
assert len(CARDS) == 215, len(CARDS)
# keep each category together, in the order the categories first appear
ORDER = []
for c in CARDS:
    if c["cat"] not in ORDER:
        ORDER.append(c["cat"])
CARDS.sort(key=lambda c: ORDER.index(c["cat"]))
for i, c in enumerate(CARDS, 1):
    R = val(c["right"][1])
    chk = c["chk"]
    if chk is not None:
        K = chk if isinstance(chk, tuple) else ("e" if R[0] == "e" else "n", chk)
        if R[0] == "t":
            K = chk if isinstance(chk, tuple) else ("t", str(chk))
        assert same(R, K), f"card {i} {c['title']}: right {R} != recomputed {K}"
    W = [val(w[1]) for w in c["wrong"]]
    assert len(W) == 4, f"card {i}: four distractors"
    for j, w in enumerate(W):
        assert not same(w, R), f"card {i} {c['title']}: distractor {j} equals the answer"
        for k in range(j):
            assert not same(w, W[k]), f"card {i}: distractors {k} and {j} are equal"

# ----------------------------------------------------------------------
# position plan: 215 slots, 43 each for A–D and for E (none of the above),
# never three alike in a row; fixed seed so a rebuild does not reshuffle
# ----------------------------------------------------------------------
rng = random.Random(545)
while True:
    plan = [0] * 43 + [1] * 43 + [2] * 43 + [3] * 43 + [4] * 43
    rng.shuffle(plan)
    if all(not (plan[i] == plan[i + 1] == plan[i + 2]) for i in range(len(plan) - 2)):
        break

out = []
for i, c in enumerate(CARDS):
    slot = plan[i]
    wrong = list(c["wrong"])
    rng.shuffle(wrong)
    if slot == 4:   # the right answer is NOT shown; four distractors fill A–D
        opts = [w[0] for w in wrong]
        sol = c["sol"] + f'<br><span class="note">On this card the right answer — <b>{c["right"][0]}</b> — is not among A–D, so the answer is <b>E · None of the above</b>.</span>'
    else:
        shown = wrong[:3]
        opts = [w[0] for w in shown]
        opts.insert(slot, c["right"][0])
        sol = c["sol"]
    opts.append("None of the above")
    out.append(dict(id=f"c{i + 1:02d}", cat=c["cat"], title=c["title"], stem=c["stem"],
                    opts=opts, ans=slot, hint=c["hint"], sol=sol))

counts = [plan.count(k) for k in range(5)]
cats = {}
for c in out:
    cats[c["cat"]] = cats.get(c["cat"], 0) + 1

tpl = open(os.path.join(HERE, "exam_cards.tpl.html"), encoding="utf-8").read()
html = tpl.replace("/*CARDS*/[]", json.dumps(out, ensure_ascii=False, indent=0)).replace("{{N}}", str(len(out)))
open(OUT, "w", encoding="utf-8").write(html)
# ----------------------------------------------------------------------
# exam-cards.pdf — every card with its hint, answer and worked solution,
# printed by headless Chrome from a page built here (not kept in the repo)
# ----------------------------------------------------------------------
import html as H, subprocess, tempfile
PDF = os.path.normpath(os.path.join(HERE, "..", "exam-cards.pdf"))
LET = "ABCDE"
rows, last = [], None
for n, c in enumerate(out, 1):
    if c["cat"] != last:
        last = c["cat"]
        rows.append(f'<h2 class="cat">{last} <span>· {cats[last]} cards</span></h2>')
    opts = "".join(f'<li><b>{LET[i]}.</b> {o}</li>' for i, o in enumerate(c["opts"]))
    rows.append(f"""<section class="q"><div class="qh"><span class="no">{n}</span><span class="t">{c['title']}</span></div>
<div class="stem">{c['stem']}</div><ol class="op">{opts}</ol>
<div class="hint"><b>Hint.</b> {c['hint']}</div>
<div class="sol"><b>Answer: {LET[c['ans']]}.</b> {c['sol']}</div></section>""")
logo = "file://" + os.path.normpath(os.path.join(HERE, "..", "logo_heg-ge.svg"))
doc = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>QM I · Exam cards</title><style>
@page{{size:A4;margin:16mm 15mm 16mm;@bottom-center{{content:"Quantitative Methods I · exam cards · page " counter(page);font:8pt Helvetica,Arial,sans-serif;color:#6B7680;}}}}
body{{font:10pt/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;color:#24272A;margin:0;}}
.cover{{border-bottom:2px solid #CC0000;padding-bottom:10px;margin-bottom:14px;}}
.cover img{{height:26px;}} .cover h1{{font-size:20pt;color:#002C46;margin:8px 0 4px;}} .cover p{{margin:3px 0;color:#3C4650;}}
h2.cat{{font-size:13pt;color:#CC0000;border-bottom:1px solid #DADFE2;padding-bottom:3px;margin:16px 0 8px;break-after:avoid;}}
h2.cat span{{color:#6B7680;font-weight:normal;font-size:10pt;}}
.q{{break-inside:avoid;border:1px solid #DADFE2;border-radius:8px;padding:8px 11px;margin:0 0 8px;}}
.qh{{display:flex;gap:8px;align-items:baseline;}} .no{{font-weight:800;color:#fff;background:#002C46;border-radius:4px;padding:0 6px;font-size:9pt;}}
.t{{font-weight:800;color:#002C46;}} .stem{{margin:4px 0;}}
.op{{list-style:none;padding:0;margin:3px 0 6px;display:grid;grid-template-columns:1fr 1fr;column-gap:18px;}} .op li{{margin:1px 0;}} .op b{{color:#002C46;}}
.hint{{background:#F1F3F5;border-radius:6px;padding:4px 8px;margin:4px 0;color:#3C4650;font-size:9.5pt;}}
.sol{{background:#F3F0FB;border-radius:6px;padding:4px 8px;color:#3D2A8A;font-size:9.5pt;}}
.note{{display:block;margin-top:4px;padding-left:8px;border-left:2px solid rgba(204,0,0,.35);color:#3C4650;}}
.fr{{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;font-size:.9em;line-height:1.1;margin:0 2px;}}
.fr>span:first-child{{border-bottom:1px solid currentColor;padding:0 2px 1px;}} .fr>span:last-child{{padding:1px 2px 0;}}
.ov{{border-top:1px solid currentColor;padding:0 1px;}}
</style></head><body>
<div class="cover"><img src="{logo}" alt="HEG Genève"><h1>Quantitative Methods I · {len(out)} exam cards</h1>
<p>Midterm practice in the format of the paper: five options, <b>E is always "None of the above"</b> (and is the right answer on {counts[4]} cards).</p>
<p>Each card is followed by its hint and its worked solution. Cover them, work the card with pen, paper and calculator, then check. Every answer was recomputed in Python.</p></div>
{''.join(rows)}</body></html>"""
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
with tempfile.TemporaryDirectory() as tmp:
    src = os.path.join(tmp, "cards.html")
    open(src, "w", encoding="utf-8").write(doc)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files",
                    f"--print-to-pdf={PDF}", "file://" + src], check=True, capture_output=True)
print(f"exam-cards.pdf written ({os.path.getsize(PDF) // 1024} KB)")
print(f"{len(out)} cards verified · answer positions A–E {counts} · {len(cats)} categories")
for k, v in cats.items():
    print(f"  {v:3d}  {k}")
