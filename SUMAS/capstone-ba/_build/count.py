#!/usr/bin/env python3
"""Recount each week page's progress denominator and write it into
courseprogress.js.  total = .sec[data-step] + (#recall ? 1) + (#quiz ? 1)
+ [data-work] — exactly what capstone.js computes at runtime.  Run after
editing any week page; a drift here shows every student a wrong bar."""
import re, pathlib
here = pathlib.Path(__file__).resolve().parent.parent
tot = {}
for n in range(1, 11):
    s = (here / f"week{n}.html").read_text()
    secs = len(re.findall(r'<section class="sec" data-step=', s))
    recall = 1 if 'id="recall"' in s else 0
    quiz = 1 if 'id="quiz"' in s else 0
    work = len(re.findall(r'data-work="', s))
    tot[f"w{n}"] = secs + recall + quiz + work
    print(f"week{n}: sections {secs} + recall {recall} + quiz {quiz} + work {work} = {tot[f'w{n}']}")
cp = here / "courseprogress.js"
js = cp.read_text()
line = "  WEEK_TOTALS={" + ",".join(f"{k}:{v}" for k, v in tot.items()) + "};"
js = re.sub(r"  WEEK_TOTALS=\{w1:\d+.*?\};", line, js, count=1)
cp.write_text(js)
print("courseprogress.js ←", line.strip())
