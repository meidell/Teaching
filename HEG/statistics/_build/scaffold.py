#!/usr/bin/env python3
"""
HEG · Applied Statistics — generator for the scaffold week pages (3–16).

Each scaffold is a REAL page on the same chrome as week1/week2 (stats.css,
top banner, course bar, ▶ Lecture) whose content is the plan for that week:
objectives, the sections it will have and the interaction each one is meant
to carry, the Saylor sections it maps to, a workbook outline and a slide
outline the Lecture button actually plays. It records NOTHING — no
StatsTrack.init, no progress steps — and courseprogress.js lists it as
live:false, so nobody's percentage moves until the week is written.

Re-run after editing SPEC:   python3 HEG/statistics/_build/scaffold.py
When a week is written by hand, delete its entry from SPEC (or the
generator will overwrite the hand-written file).
"""
import os, html, json
ROOT=os.path.join(os.path.dirname(__file__),'..')
SAY='https://saylordotorg.github.io/text_introductory-statistics/'

def S(u): return SAY+u

SPEC=[
 dict(n=3,slug='Discrete random variables',emoji='🎲',
  title='Will we run out of dough on <em>Friday</em>?',
  sub='Description told you what the market looks like. Now the pizzeria has to act on chances: how many Margheritas will Friday bring, and what is the probability we sell out? This week builds the language of <b>random variables</b> and its first workhorse, the <b>binomial distribution</b> — opening with the handful of probability rules the textbook\'s chapter 3 supplies and chapter 4 assumes.',
  ch='Saylor ch. 4 (with the rules of ch. 3)',
  reads=[('Saylor §3.1–3.3 — the probability rules, condensed',S('s07-basic-concepts-of-probability.html')),('Saylor §4.1 — Random variables',S('s08-01-random-variables.html')),('Saylor §4.2 — Probability distributions for discrete random variables',S('s08-02-probability-distributions-for-.html')),('Saylor §4.3 — The binomial distribution',S('s08-03-the-binomial-distribution.html'))],
  objectives=['Compute a probability from a two-way count using complements, unions, intersections and conditional probability — and say when two events are independent.','Tell a discrete random variable from a continuous one.','Read and build a probability distribution table, and compute its mean µ = Σ x·P(x) and standard deviation.','Recognise a binomial situation (n identical independent trials, success probability p), compute P(X = k), and its mean np and standard deviation √(npq).','Turn "what is the chance we sell out?" into a calculation the pizzeria can plan staffing on.'],
  sections=[
   ('The hook','Will we run out of dough?','Estimate P(sell-out) on a slider, lock it in',['A slider: "on a Friday we prepare 120 dough balls — what is the chance we sell out?" Lock the estimate; the week ends by computing it.','Reveal: the answer depends on a distribution nobody has yet written down — which is the point of the week.'],'Hook'),
   ('The rules you need','Chances from counting','Complement · union · intersection · conditional · independence (Saylor ch. 3)',['A two-way count of last month\'s orders: topping (Margherita / other) × neighbourhood (Plainpalais / Eaux-Vives). Every probability in the section is read straight off it.','Widget: click any cell or margin to see P(A), P(A ∪ B), P(A ∩ B), P(A | B) computed by counting — the exam card "probability from a two-way count" (c3) already exists and seeds this.','Classify (6 rows): independent or not; mutually exclusive or not — with the "why" for each.'],'Rules'),
   ('Random variables','A number attached to chance','Discrete vs continuous random variables (§4.1)',['Definition: a random variable assigns a number to each outcome. Friday\'s Margherita count is one; the time the oven takes to heat is another.','Classify (6 rows): discrete or continuous — sold-out or not, number of tables occupied, weight of dough used, waiting time, number of no-shows, temperature.'],'Concept'),
   ('Probability distributions','The whole table of chances','Mean and standard deviation of a discrete random variable (§4.2)',['Widget: the distribution of daily Margherita orders, X = 0…5 (per hour), as a bar chart you can reshape by dragging bars — probabilities must sum to 1, and the mean µ = Σ x·P(x) and σ update live.','Worked example: expected orders per hour → expected dough per Friday, the number the shopping list is built on.','Exam card c4 ("discrete random variable") is the drill.'],'Distribution'),
   ('The binomial','Ten tables, each 30% likely to order dessert','n, p, P(X = k), mean np, standard deviation √(npq) (§4.3)',['Widget: binomial bars with sliders for n and p; click a bar for P(X = k), drag a range for P(a ≤ X ≤ b).','The four conditions (fixed n, two outcomes, constant p, independence) as a checklist the pizzeria situations pass or fail.','The hook closes: sell-out probability from "each of 140 expected customers orders a Margherita with p = 0.8" — P(X > 120). Exam card c5.'],'Binomial'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: two-way count probabilities, independence, discrete vs continuous, µ and σ of a distribution, binomial P(X = k), np and √(npq), and one "is this binomial?" trap.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment three','Workbook fields, saved for your instructor',['w3_event — a Friday event with its probability, computed from a two-way count you define.','w3_expected — the expected number of Margheritas per Friday and how you built the distribution.','w3_binomial — one binomial question about your pizzeria, with n, p and the answer.'],'Exercise')],
  slides=['Applied Statistics · Week 3 — Discrete random variables','Recap → today: from describing to betting','Poll: chance we sell out on Friday?','The rules you need: a two-way count of orders','Conditional probability and independence — "given that"','Random variables: a number attached to chance','A probability distribution: the whole table','Mean and standard deviation of a random variable','The binomial: four conditions','P(X = k), np, √(npq) — with the dessert tables','The hook closes: P(sell-out)','Your turn — checkpoint live','Takeaways · homework · Week 4'],
  tools=[('distributions.html','The shape of uncertainty — which distribution, when'),('exam-cards.html','Exam cards c3–c5')]),

 dict(n=4,slug='Continuous random variables',emoji='🔔',
  title='How long until the pizza <em>reaches the table</em>?',
  sub='Counting things gave you the binomial. Measuring things — delivery time, dough weight, daily takings — needs a different object: a <b>density</b>, where probability is <b>area</b>. This week is the normal distribution end to end: the standard normal table, standardising, tails, and reading the table backwards to find the value behind a percentile.',
  ch='Saylor ch. 5',
  reads=[('Saylor §5.1 — Continuous random variables',S('s09-01-continuous-random-variables.html')),('Saylor §5.2 — The standard normal distribution',S('s09-02-the-standard-normal-distributi.html')),('Saylor §5.3 — Probability computations for general normal random variables',S('s09-03-probability-computations-for-g.html')),('Saylor §5.4 — Areas of tails of distributions',S('s09-04-areas-of-tails-of-distribution.html'))],
  objectives=['Explain why P(X = x) is zero for a continuous variable and why probability is area under a density.','Use the standard normal table for P(Z < z), P(Z > z) and P(a < Z < b).','Standardise a general normal variable, z = (x − µ)/σ, and compute probabilities for delivery times.','Find the value x behind a tail area — the 95th percentile of delivery time — by reading the table backwards.','Recognise z₀.₀₅ and z₀.₀₂₅ as the numbers Weeks 6–7 will use constantly.'],
  sections=[
   ('The hook','Under twelve minutes?','Estimate the share of pizzas served within 12 minutes',['Slider: "delivery-to-table time averages 14 min with SD 3 — what share of pizzas arrive within 12?" Lock it; section 4.4 computes it.'],'Hook'),
   ('Density','Probability is area','Continuous random variables and the uniform distribution (§5.1)',['Widget: a uniform distribution of oven temperature drift; drag two bounds and read the area.','Why P(X = 14.000…) = 0 and why "between 13.9 and 14.1" is the only kind of question that has an answer.'],'Concept'),
   ('The standard normal','The one curve that fits all','P(Z < z) from the table (§5.2)',['Widget: the standard normal curve; drag z and watch the shaded area and the table row highlight together.','Classify (6 rows): which area is asked — left tail, right tail, between — and how to get it from a left-tail table.'],'Table'),
   ('General normal','Standardise, then look up','z = (x − µ)/σ for delivery times N(14, 3) (§5.3)',['Widget: delivery times; type a time, see z, the area and the sentence "x% of pizzas arrive within…".','The hook closes: P(X < 12) with µ = 14, σ = 3. Exam card c6 ("normal distribution & inverse") is the drill.'],'Standardise'),
   ('Tails and the inverse','The value behind a percentile','z_c, the 95th percentile, and the numbers Week 6 needs (§5.4)',['Widget: choose a tail area (0.05, 0.025, 0.01) and read z_c off the curve; then un-standardise to a delivery time the pizzeria can promise: "95% of pizzas within __ minutes".','Introduce z₀.₀₂₅ = 1.96 as a number to know by heart — it returns in every confidence interval.'],'Inverse'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: area = probability, left/right/between areas, standardising, an inverse lookup, and one uniform-distribution question.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment four','Workbook fields',['w4_promise — the delivery promise you would print on the menu ("within __ minutes, 95% of the time") and the calculation behind it.','w4_normal — one quantity of your pizzeria you would model as normal, with a µ and σ you can justify, and one you would not.'],'Exercise')],
  slides=['Applied Statistics · Week 4 — Continuous random variables','Recap → today: from counting to measuring','Poll: share of pizzas within 12 minutes?','Probability is area — the density','The standard normal: one curve, one table','Reading the table: left, right, between','Standardise: z = (x − µ)/σ','Delivery times N(14, 3): the hook closes','Tails: z₀.₀₅, z₀.₀₂₅ — numbers to know','The inverse: the value behind a percentile','Your turn — checkpoint live','Takeaways · homework · Week 5'],
  tools=[('distributions.html','The shape of uncertainty — the normal, the bell, the tails'),('exam-cards.html','Exam cards c2 and c6')]),

 dict(n=5,slug='Sampling distributions',emoji='🎲',
  title='If you sampled again tomorrow, how different would the <em>mean</em> be?',
  sub='The keystone of the course. Your thirty prices gave a mean of about CHF 19.6 — but another thirty would give another mean. This week is about the distribution <b>of the sample mean itself</b>: where it is centred, how wide it is (σ/√n), and why it is bell-shaped even when the population is not. Everything from Week 6 onward rests on it.',
  ch='Saylor ch. 6',
  reads=[('Saylor §6.1 — The mean and standard deviation of the sample mean',S('s10-01-the-mean-and-standard-deviatio.html')),('Saylor §6.2 — The sampling distribution of the sample mean',S('s10-02-the-sampling-distribution-of-t.html')),('Saylor §6.3 — The sample proportion',S('s10-03-the-sample-proportion.html'))],
  objectives=['State the mean and standard deviation of the sample mean: µ_x̄ = µ and σ_x̄ = σ/√n — and explain the √n.','State the Central Limit Theorem and say when it applies.','Compute P(x̄ in a range) for a sample of size n from a population with known µ and σ.','Do the same for a sample proportion p̂, with µ_p̂ = p and σ_p̂ = √(pq/n).','Explain, in the pizzeria\'s words, why a sample of 30 says something about all of Geneva.'],
  sections=[
   ('The hook','Another thirty tomorrow','Estimate how far a second sample mean would land from the first',['Slider: "your thirty averaged CHF 19.6. Another thirty tomorrow — within how many francs would you bet the new mean lands?" Lock it.'],'Hook'),
   ('The sampling machine','Watch the mean of the means','µ_x̄ = µ and σ_x̄ = σ/√n, made visible (§6.1)',['The existing <b>sampling-distribution simulator</b> embedded: a skewed population of prices, draw 1 / 100 / 1,000 samples, watch the means pile up. The σ/√n readout against the observed SD of the means is the whole section.','Slider n from 1 to 50: the pile narrows by √n, not by n — the single most-missed fact of the chapter.'],'Keystone'),
   ('The Central Limit Theorem','Why the bell shows up','The sampling distribution of x̄ (§6.2)',['Widget: switch the population to bimodal and uniform; the means still go bell-shaped once n ≥ ~30.','Compute P(x̄ > 20) for n = 30 from µ = 19, σ = 4: standardise with σ/√n. Exam card c7.','Classify (6 rows): does the CLT apply? — n = 5 from a skewed population, n = 40 from anything, a normal population at any n, and two traps.'],'CLT'),
   ('The sample proportion','Share above CHF 20, again','µ_p̂ = p, σ_p̂ = √(pq/n) (§6.3)',['Widget: the proportion of pizzerias over CHF 20 across repeated samples; the pile of p̂ values and its SD against √(pq/n).','P(p̂ in a range) for n = 30, p = 0.35. Exam card c8.'],'Proportion'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: µ_x̄, σ_x̄, the √n, when the CLT applies, P(x̄ in a range), µ_p̂ and σ_p̂, and one "the population is not normal — so what?" trap.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment five','Workbook fields',['w5_se — the standard error of your sample mean for your n, and what halving it would cost in extra visits.','w5_clt — in two sentences, why thirty pizzerias can speak for Geneva — and the one situation where they could not.'],'Exercise')],
  slides=['Applied Statistics · Week 5 — Sampling distributions','Recap → today: the keystone','Poll: how far would tomorrow\'s mean land?','The sampling machine — live','µ_x̄ = µ · σ_x̄ = σ/√n — the √n','The Central Limit Theorem','P(x̄ in a range): standardise with σ/√n','Bimodal, uniform, skewed — still a bell','The sample proportion p̂','Your turn — checkpoint live','Takeaways · homework · Week 6'],
  tools=[('sampling-sim.html','Where the sample mean lives — the simulator'),('sampling-machine.html','The sampling machine'),('exam-cards.html','Exam cards c7–c8')]),

 dict(n=6,slug='Estimation',emoji='📏',
  title='The Geneva price — <em>with a margin</em>',
  sub='Week 5 told you how far a sample mean wanders. Now turn that around: from one sample, build an interval that captures the true Geneva price with a stated confidence. Large samples use z; small samples use t; proportions have their own formula; and the last section asks the question a budget asks — how many pizzerias must we visit to be within one franc?',
  ch='Saylor ch. 7',
  reads=[('Saylor §7.1 — Large-sample estimation of a population mean',S('s11-01-large-sample-estimation-of-a-p.html')),('Saylor §7.2 — Small-sample estimation of a population mean',S('s11-02-small-sample-estimation-of-a-p.html')),('Saylor §7.3 — Large-sample estimation of a population proportion',S('s11-03-large-sample-estimation-of-a-p.html')),('Saylor §7.4 — Sample size considerations',S('s11-04-sample-size-considerations.html'))],
  objectives=['Build and interpret a confidence interval for a mean with a large sample: x̄ ± z·σ/√n.','Build one for a small sample with t and df = n − 1 — and say why t is wider.','Build a confidence interval for a proportion: p̂ ± z·√(p̂q̂/n).','Compute the sample size needed for a target margin of error.','Say what "95% confident" means — and what it does not.'],
  sections=[
   ('The hook','Give me a margin','Estimate the ± you would put on the Geneva price',['Slider: "the true Geneva Margherita price is CHF 19.6, plus or minus how much?" Lock it; section 6.2 computes it.'],'Hook'),
   ('Large samples','x̄ ± z·σ/√n','The confidence interval for a mean (§7.1)',['Widget: the interval on the number line, confidence level 90/95/99 as a toggle, n as a slider; watch the interval widen with confidence and shrink with n.','<b>Catch the mean</b>: 100 samples, 100 intervals, about 95 of them capture µ — the meaning of "95% confident" as a picture. Exam card c9.'],'CI (z)'),
   ('Small samples','When n is small, use t','df = n − 1 and the t table (§7.2)',['Widget: z versus t curves for df = 5, 10, 29 — the fatter tails and the wider interval.','Classify (6 rows): z or t? — n = 8 with unknown σ, n = 50, a normal population with known σ, and traps. Exam card c10.'],'CI (t)'),
   ('Proportions','Share above CHF 20, with a margin','p̂ ± z·√(p̂q̂/n) (§7.3)',['Widget: the interval for the proportion over CHF 20 from 30 pizzerias, and why 30 is barely enough (np̂ ≥ 10 and nq̂ ≥ 10 check). Exam card c11.'],'Proportion'),
   ('Sample size','How many pizzerias for ± 1 franc?','n = (z·σ/E)² and n = z²·p̂q̂/E² (§7.4)',['Widget: choose the margin E and confidence; read n. The budget question: each visit costs a Margherita — what does ±1 franc cost? Exam card c12.'],'Sample size'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: a z-interval, a t-interval, a proportion interval, a sample-size calculation, two interpretation traps ("95% of pizzerias are inside the interval" is wrong), and the z-or-t choice.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment six','Workbook fields',['w6_ci — your 95% confidence interval for the Geneva price, written as a sentence a bank would accept.','w6_n — the sample size for the margin you would want, and whether it is worth the visits.'],'Exercise')],
  slides=['Applied Statistics · Week 6 — Estimation','Recap → today: turning σ/√n around','Poll: the Geneva price ± how much?','The interval: x̄ ± z·σ/√n','What 95% means — 100 intervals, ~95 catches','Small samples: t and df = n − 1','z or t? the decision','A proportion: p̂ ± z·√(p̂q̂/n)','Sample size: n = (z·σ/E)²','Your turn — checkpoint live','Takeaways · homework · Week 7'],
  tools=[('catch-the-mean.html','Catch the mean — intervals that catch µ'),('exam-cards.html','Exam cards c9–c12')]),

 dict(n=7,slug='Testing hypotheses',emoji='⚖️',
  title='A competitor claims the Geneva average is CHF 20. <em>Is it?</em>',
  sub='Estimation says where the truth probably is; testing asks whether a specific claim survives the data. This week is the logic of hypothesis testing — null and alternative, test statistic, rejection region, the two kinds of error — then the one-sample z test, the p-value, the small-sample t test, and the test for a proportion.',
  ch='Saylor ch. 8',
  reads=[('Saylor §8.1 — The elements of hypothesis testing',S('s12-01-the-elements-of-hypothesis-tes.html')),('Saylor §8.2 — Large-sample tests for a population mean',S('s12-02-large-sample-tests-for-a-popul.html')),('Saylor §8.3 — The observed significance of a test',S('s12-03-the-observed-significance-of-a.html')),('Saylor §8.4 — Small-sample tests for a population mean',S('s12-04-small-sample-tests-for-a-popul.html')),('Saylor §8.5 — Large-sample tests for a population proportion',S('s12-05-large-sample-tests-for-a-popul.html'))],
  objectives=['Write H₀ and Hₐ for a claim, and choose left-, right- or two-tailed.','Run a large-sample z test for a mean with a rejection region at level α.','Compute and interpret a p-value — and say what it is not.','Run a small-sample t test and a test for a proportion.','Name Type I and Type II errors in the pizzeria\'s terms, and say which α trades against which.'],
  sections=[
   ('The hook','The CHF 20 claim','Estimate: is CHF 19.6 from 30 pizzerias "different enough" from 20?',['Slider: "how sure are you the true average is NOT 20?" Lock it; section 7.4 gives the p-value.'],'Hook'),
   ('The logic','Innocent until the data say otherwise','H₀, Hₐ, test statistic, rejection region, Type I and II errors (§8.1)',['Classify (6 rows): write the hypotheses — left, right or two-tailed — for six pizzeria claims.','Widget: the two errors as a 2×2 — "we change the price when we shouldn\'t" vs "we keep it when we should change" — with α and β on sliders.'],'Logic'),
   ('The z test','Large samples','Rejection region at α = 0.05, 0.01 (§8.2)',['Widget: the standard normal with the rejection region shaded for the chosen tail and α; type x̄, n, σ and watch the test statistic land inside or outside. Exam card c13.'],'z test'),
   ('The p-value','How surprising is this?','Observed significance (§8.3)',['Widget: the p-value as the tail area beyond the observed statistic; compare with α. The hook closes: p-value for x̄ = 19.6, n = 30, σ = 4 against µ₀ = 20.','The five-line list of what a p-value is NOT — the exam\'s favourite trap.'],'p-value'),
   ('t and proportions','Small samples, and shares','Small-sample t test (§8.4) · test for a proportion (§8.5)',['Widget: the t test with df = n − 1 on a sample of 12 lakeside pizzerias; the proportion test on "more than 30% charge over CHF 20". Exam cards c14–c15.'],'t & p'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: hypotheses, tails, the rejection region, a z statistic, a p-value interpretation, Type I vs II, a t test, a proportion test, and "significant ≠ important".'],'Quiz'),
   ('Workshop','The pizzeria file · instalment seven','Workbook fields',['w7_claim — a claim about your pizzeria you would test, with H₀ and Hₐ.','w7_errors — the Type I and Type II error for that test, in plain words, and which one costs you more.'],'Exercise')],
  slides=['Applied Statistics · Week 7 — Testing hypotheses','Recap → today: from "where" to "whether"','Poll: is 19.6 different enough from 20?','H₀ and Hₐ — innocent until the data say otherwise','Left, right, two-tailed','The z test and the rejection region','The p-value: how surprising?','What a p-value is not (five things)','Type I and Type II — which do you fear?','t tests and proportion tests','Your turn — checkpoint live','Takeaways · homework · Week 8'],
  tools=[('real-or-random.html','Real or random? — signal vs noise, again'),('exam-cards.html','Exam cards c13–c15')]),

 dict(n=8,slug='Two-sample problems',emoji='⚔️',
  title='Do lakeside pizzerias <em>really</em> charge more?',
  sub='One sample tested one claim. Most business questions compare two things: two neighbourhoods, before and after a menu change, two proportions. This week is the two-sample toolkit — independent samples large and small, paired samples, two proportions — and, above all, the judgement of which one applies.',
  ch='Saylor ch. 9',
  reads=[('Saylor §9.1 — Two means, large independent samples',S('s13-01-comparison-of-two-population-m.html')),('Saylor §9.2 — Two means, small independent samples',S('s13-02-comparison-of-two-population-m.html')),('Saylor §9.3 — Paired samples',S('s13-03-comparison-of-two-population-m.html')),('Saylor §9.4 — Two population proportions',S('s13-04-comparison-of-two-population-p.html')),('Saylor §9.5 — Sample size considerations',S('s13-05-sample-size-considerations.html'))],
  objectives=['Build a confidence interval and a test for the difference of two means with large independent samples.','Do the same with small samples using the pooled t.','Tell paired from independent samples, and run the paired test on the differences.','Compare two proportions.','Choose the right two-sample procedure for a business question — the exam\'s real test.'],
  sections=[
   ('The hook','Lake vs station','Estimate the price gap between lakeside and station pizzerias',['Slider: "lakeside pizzerias charge on average __ francs more." Lock it.'],'Hook'),
   ('Two means, large samples','The difference and its standard error','x̄₁ − x̄₂ and √(σ₁²/n₁ + σ₂²/n₂) (§9.1)',['Widget: two strips of prices (lake, station); the difference of means, its standard error, the interval and the z test. Exam card c16.'],'Independent'),
   ('Two means, small samples','Pooled t','s_p² and df = n₁ + n₂ − 2 (§9.2)',['Widget: the same with 8 and 10 pizzerias; pooled variance built step by step. Exam card c17.'],'Pooled'),
   ('Paired samples','Before and after the new menu','The test on the mean difference d̄ (§9.3)',['Widget: the same 12 pizzerias before and after; watch the paired analysis find a difference the independent one misses — variance between pizzerias vanishes.','Classify (6 rows): paired or independent? — the most important six rows of the semester. Exam card c18.'],'Paired'),
   ('Two proportions','Share over CHF 20, lake vs station','p̂₁ − p̂₂ and the pooled proportion (§9.4) · sample size (§9.5)',['Widget: two proportions, the pooled p̂ for the test, the unpooled SE for the interval. Exam card c19.'],'Proportions'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: SE of a difference, a two-sample z, a pooled t, paired vs independent ×3, two proportions, and one sample-size question.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment eight','Workbook fields',['w8_design — an A/B test for your pizzeria (two recipes, two prices, two evenings): what is compared, paired or independent, and why.','w8_result — what result would make you change the menu, in numbers.'],'Exercise')],
  slides=['Applied Statistics · Week 8 — Two-sample problems','Recap → today: from one claim to two things','Poll: the lake–station price gap','The difference of two means and its SE','Large samples: z','Small samples: the pooled t','Paired samples: the difference is the data','Paired or independent? — the decision','Two proportions','Your turn — checkpoint live','Takeaways · homework · Week 9'],
  tools=[('exam-cards.html','Exam cards c16–c19')]),

 dict(n=9,slug='Correlation and regression',emoji='📈',
  title='Does a higher price buy a <em>better rating</em>?',
  sub='Week 1 warned you that the price–rating scatter had a lurking variable in it. This week you fit the line anyway — properly: the correlation coefficient r, the least-squares line, inference on its slope, the coefficient of determination r², and prediction with an honest interval. Then, with the tools in hand, the lurking variable comes back.',
  ch='Saylor ch. 10',
  reads=[('Saylor §10.1–10.2 — Linear relationships and r',S('s14-01-linear-relationships-between-v.html')),('Saylor §10.3–10.4 — The model and the least-squares line',S('s14-03-modelling-linear-relationships.html')),('Saylor §10.5–10.6 — Inference about β₁ and r²',S('s14-05-statistical-inferences-about-1.html')),('Saylor §10.7–10.8 — Estimation, prediction, a complete example',S('s14-07-estimation-and-prediction.html')),('Saylor §10.9 — Formula list',S('s14-09-formula-list.html'))],
  objectives=['Compute and interpret the linear correlation coefficient r.','Fit the least-squares regression line ŷ = b₁x + b₀ and interpret both coefficients in business terms.','Test whether the slope β₁ is zero and build a confidence interval for it.','Interpret r² as the share of variation explained.','Predict y for a given x with a prediction interval — and refuse to extrapolate.'],
  sections=[
   ('The hook','Price and rating','Guess r before you see the scatter',['Slider from −1 to +1: "how strongly does price go with rating?" Lock it.'],'Hook'),
   ('The scatter and r','How strong, which way','r from the data (§10.1–10.2)',['Widget: the 12-pizzeria price–rating scatter; drag a point and watch r change; four canned scatters to classify by r. Exam card c20.','Classify (6 rows): strong positive / weak / none / strong negative — from pictures.'],'Correlation'),
   ('The line','Least squares','ŷ = b₁x + b₀, residuals (§10.3–10.4)',['Widget: draw your own line by hand, then reveal least squares and compare the sum of squared residuals.','Interpret b₁: "each extra franc buys __ rating points" — and b₀\'s meaning, or lack of one. Exam card c21.'],'Regression'),
   ('Inference','Is the slope real?','Test and CI for β₁; r² (§10.5–10.6)',['Widget: the t test on the slope with df = n − 2; r² as a shaded share of the variation. Exam cards c22–c23.'],'Inference'),
   ('Prediction — and the trap','What would a CHF 24 pizzeria score?','Prediction intervals, extrapolation, the lurking variable (§10.7–10.8)',['Widget: predict at x with a prediction interval that widens away from x̄; the extrapolation warning at CHF 40.','The Week 1 reveal returns: colour the points by neighbourhood. The line was right; the causal story was not.'],'Prediction'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: interpret r, interpret b₁, compute ŷ, the slope test, r², a prediction, extrapolation, and correlation ≠ causation.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment nine','Workbook fields',['w9_model — one thing that might predict your takings, as ŷ = b₁x + b₀ with plausible numbers.','w9_lurking — the lurking variable that could explain that relationship without causation.'],'Exercise')],
  slides=['Applied Statistics · Week 9 — Correlation and regression','Recap → today: two variables at once','Poll: guess r','The scatter, and r','The least-squares line: ŷ = b₁x + b₀','Interpreting the slope in francs','Is the slope real? t on β₁','r²: the share explained','Prediction — and where it stops','The lurking variable, revisited','Your turn — checkpoint live','Takeaways · homework · Week 10'],
  tools=[('exam-cards.html','Exam cards c20–c23')]),

 dict(n=10,slug='Chi-square tests and F-tests',emoji='🧮',
  title='Does topping preference depend on the <em>neighbourhood</em>?',
  sub='The last chapter of the textbook, and the first that handles categories and more than two groups: the chi-square test for independence on a contingency table, the goodness-of-fit test against a claimed distribution, the F test for two variances, and one-way ANOVA for comparing several means at once.',
  ch='Saylor ch. 11',
  reads=[('Saylor §11.1 — Chi-square tests for independence',S('s15-01-chi-square-tests-for-independe.html')),('Saylor §11.2 — Chi-square goodness-of-fit tests',S('s15-02-chi-square-one-sample-goodness.html')),('Saylor §11.3 — F-tests for equality of two variances',S('s15-03-f-tests-for-equality-of-two-va.html')),('Saylor §11.4 — F-tests in one-way ANOVA',S('s15-04-f-tests-in-one-way-anova.html'))],
  objectives=['Compute expected counts and the chi-square statistic for a contingency table, and test independence.','Run a goodness-of-fit test against a claimed distribution.','Compare two variances with an F test.','Run a one-way ANOVA and read its table.','Choose among the semester\'s tests for a given business question — the "which test?" reflex.'],
  sections=[
   ('The hook','Toppings by neighbourhood','Estimate whether the 3×2 table shows dependence',['Slider: "how confident are you that topping choice depends on neighbourhood?" Lock it.'],'Hook'),
   ('Independence','Observed vs expected','The chi-square test on a contingency table (§11.1)',['Widget: a 3×2 table of orders; click any cell for its expected count (row × column ÷ total); the chi-square statistic builds cell by cell; df = (r−1)(c−1). Exam card c24.'],'χ² independence'),
   ('Goodness of fit','Are orders even across the week?','Observed vs a claimed distribution (§11.2)',['Widget: seven weekday counts against "all days equal"; then against "Friday and Saturday double". Exam card c25.'],'χ² fit'),
   ('Two variances','Is Rive really riskier than Pâquis?','F = s₁²/s₂² (§11.3)',['Widget: the two neighbourhoods from Week 2, at last tested. Exam card c26.'],'F'),
   ('ANOVA','Four branches, one question','Between vs within variance, the F ratio, the table (§11.4)',['Widget: four branches × six days; between-group and within-group sums of squares as stacked bars; F and its p-value. The case is built so F is clearly significant while a naïve pairwise look would over-claim. Exam card c27.','Classify (8 rows): which test? — every procedure of the semester on eight pizzeria questions.'],'ANOVA'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Ten questions: expected counts, df, a chi-square decision, goodness of fit, an F for variances, an ANOVA table reading, and three "which test?" items.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment ten','Workbook fields',['w10_table — a contingency table your pizzeria could collect, and the hypothesis it would test.','w10_which — for three questions you actually have about your pizzeria, name the test and why.'],'Exercise')],
  slides=['Applied Statistics · Week 10 — Chi-square and F','Recap → today: categories and many groups','Poll: does topping depend on neighbourhood?','Observed vs expected — the chi-square idea','The test for independence','Goodness of fit: the weekday counts','Two variances: F','ANOVA: between vs within','Reading the ANOVA table','Which test? — the semester in one tree','Your turn — checkpoint live','Takeaways · homework · Week 11'],
  tools=[('exam-cards.html','Exam cards c24–c27')]),

 dict(n=11,slug='PCA and other non-parametric tests',emoji='🧭',
  title='Nine survey questions, <em>one</em> satisfaction score?',
  sub='Beyond the textbook. Two things a working analyst meets in the first month: data that break the assumptions of the tests you have learned (small, skewed, ordinal), and too many variables to look at one at a time. This week is the non-parametric toolkit and a first meeting with principal component analysis — hands-on in DataTab, no formulas by hand.',
  ch='DataTab · beyond Saylor',
  reads=[('DataTab — online statistics calculator (free, browser-based)','https://datatab.net/'),('DataTab tutorial — Mann-Whitney U test','https://datatab.net/tutorial/mann-whitney-u-test'),('DataTab tutorial — Principal component analysis','https://datatab.net/tutorial/principal-component-analysis')],
  objectives=['Recognise when a parametric test\'s assumptions fail and name the non-parametric counterpart (Mann–Whitney, Wilcoxon, Kruskal–Wallis, Spearman).','Run and interpret one of them in DataTab.','Explain the idea of principal component analysis: variance, components, loadings.','Run a PCA on a customer survey in DataTab and read the first two components.','Understand what "machine learning" adds to — and borrows from — the statistics of this course.'],
  sections=[
   ('The hook','The customer survey','Nine questions on a 1–5 scale — what would you do with them?',['A survey of 60 customers, nine items. Estimate: how many underlying things is it really measuring?'],'Hook'),
   ('When assumptions fail','Ordinal, skewed, small','Non-parametric counterparts',['Classify (6 rows): the parametric test → its non-parametric twin — t test ↔ Mann–Whitney, paired t ↔ Wilcoxon, ANOVA ↔ Kruskal–Wallis, Pearson ↔ Spearman.','Widget: ranks instead of values — watch an outlier lose its power.'],'Non-parametric'),
   ('In DataTab','Run a Mann–Whitney','The pizzeria survey, lake vs station',['Step-by-step: paste the data, choose the test, read the output. Screenshots of what DataTab shows and what each number means.'],'Hands-on'),
   ('PCA — the idea','Directions of variance','Components, loadings, the scree plot',['Widget: a 2-D cloud of two survey items; rotate the axis and watch the variance along it; the first component is the direction that captures most of it.','Then nine dimensions: what "the first two components explain 71%" means, and how to name a component from its loadings.'],'PCA'),
   ('PCA in DataTab','Nine items → two scores','Run it, read it, name the components',['Step-by-step on the survey; the loadings table; naming "food quality" and "service" from what loads where.','A closing card: how this connects to machine learning — models that predict, evaluation on held-out data, the same estimation logic underneath.'],'Hands-on'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Eight questions: which non-parametric test, why ranks, what a component is, reading a loadings table, the scree plot, and one machine-learning vocabulary item.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment eleven','Workbook fields',['w11_survey — the survey you would run on your customers: five items, and the analysis you would do.'],'Exercise')],
  slides=['Applied Statistics · Week 11 — Beyond the textbook','Recap → today: when the assumptions fail','Poll: nine questions, how many things?','Ranks instead of values','The non-parametric twins','Mann–Whitney in DataTab — live','PCA: directions of variance','Loadings, components, the scree plot','PCA in DataTab — live','From statistics to machine learning','Your turn — checkpoint','Takeaways · Week 12'],
  tools=[]),

 dict(n=12,slug='Statistics in Python',emoji='🐍',
  title='Everything from Weeks 1–10, in <em>twelve lines</em>',
  sub='The exam is by hand; the job is not. This week redoes the whole semester in <b>Python</b> — describe the thirty prices, test the CHF 20 claim, compare the lake and the station, fit the price–rating line, run the chi-square — and gets the same numbers you got with a calculator. Everything runs in <b>Google Colab</b> in the browser, so there is nothing to install and nothing that can go wrong with your laptop. Computer session; bring one anyway.',
  ch='Google Colab · pandas · SciPy',
  reads=[('Google Colab — open a notebook in the browser, nothing to install','https://colab.research.google.com/'),('pandas — 10 minutes to pandas','https://pandas.pydata.org/docs/user_guide/10min.html'),('SciPy — statistical functions (scipy.stats)','https://docs.scipy.org/doc/scipy/reference/stats.html'),('statsmodels — ordinary least squares, with the summary table','https://www.statsmodels.org/stable/regression.html')],
  objectives=['Open a Colab notebook, type a cell, run it — and know where the data went.','Put the pizzeria data in a pandas DataFrame and compute mean, median, std, quantiles; draw a histogram and a box plot.','Run the semester\'s tests with scipy.stats — ttest_1samp, ttest_ind, ttest_rel, chi2_contingency, f_oneway — and match each output to the hand calculation from its week.','Fit and read a regression with statsmodels, including the slope test and R².','Read a Python output without panic: statistic, p-value, degrees of freedom, confidence interval — and keep a notebook that reproduces your project.'],
  sections=[
   ('The hook','The same numbers','Predict which hand calculation Python will disagree with',['A poll: "which of this semester\'s results will Python get differently?" (None — but <code>std()</code> will surprise you: pandas divides by n − 1, NumPy by n. The Week 2 trap, one last time.)','Reveal: the machine does not know more statistics than you do. It only does the arithmetic faster, and it will happily compute the wrong test.'],'Hook'),
   ('Set-up','Colab, cells, a DataFrame','No install · lists, Series, DataFrames, read_csv',['Step-by-step with screenshots: open Colab, first cell, shift-enter. Why nothing needs installing and where the notebook is saved.','The thirty prices as a list → a <code>pandas.Series</code>; the pizzeria table as a <code>DataFrame</code>; <code>pd.read_csv</code> on the course\'s own CSV.','A card on the three imports that carry the whole week: <code>pandas as pd</code>, <code>matplotlib.pyplot as plt</code>, <code>scipy.stats as st</code>.'],'Set-up'),
   ('Describe','Week 2, in Python','describe() · mean · median · std · quantile · hist · boxplot',['A code block per Week 2 section, each next to the widget it reproduces: <code>s.describe()</code> gives the five-number summary in one line.','The n − 1 catch, made visible: <code>s.std()</code> (pandas, ddof=1) vs <code>np.std(s)</code> (ddof=0). Which one is the sample standard deviation, and why the default differs between the two libraries.','<code>plt.hist</code> and <code>plt.boxplot</code> — the same pictures, in three lines.'],'Describe'),
   ('Infer','Weeks 6–10, in Python','ttest_1samp · ttest_ind · ttest_rel · chi2_contingency · f_oneway · OLS',['One block per test, each checked against the hand result from its week: the CHF 20 claim, lake vs station, before-and-after the menu change, toppings by neighbourhood, four branches.','Confidence intervals: <code>st.t.interval</code> — and the same number the Week 6 widget drew.','Regression with <code>statsmodels.formula.api.ols</code>: reading <code>summary()</code> line by line — coefficient, standard error, t, p, R².'],'Infer'),
   ('Checkpoint','Prove it to yourself','Self-check quiz & where this goes next',['Eight questions: read four Python outputs and answer the exam-style question each one settles; plus the ddof trap and one "the code ran, the test was wrong" item.'],'Quiz'),
   ('Workshop','The pizzeria file · instalment twelve','Workbook fields',['w12_notebook — the Colab link (set to "anyone with the link can view") for the notebook that reproduces your project\'s numbers.','w12_learned — one line on what the notebook told you that the hand calculation did not, and one thing Python made easy that would have been an hour by hand.'],'Exercise')],
  slides=['Applied Statistics · Week 12 — Statistics in Python','Why code, when the exam is by hand','Colab: nothing to install','Cells, Series, DataFrames','Describe: the thirty prices in one line','The ddof trap: pandas vs NumPy','Infer: scipy.stats, test by test','Regression: statsmodels summary()','Reading an output without panic','The machine does the arithmetic, you choose the test','Your notebook is your project','Takeaways · Weeks 13–15'],
  tools=[]),

 dict(n=13,slug='Exercises and repetition I',emoji='🔁',
  title='Weeks 1–6, <em>by hand</em>',
  sub='Three weeks of practice before the exam. This one covers description, probability, the normal, sampling distributions and estimation — the material the exam\'s first three exercises draw on. The practice arena gives you endless fresh numbers; the exam cards give you every question type; the room gives you the worked answers and the traps.',
  ch='Weeks 1–6',
  reads=[('Practice arena — endless randomised problems','practice.html'),('Exam cards c1–c12','exam-cards.html')],
  objectives=['Do a full descriptive analysis — displays, centre, spread, position — in twenty minutes without notes.','Compute binomial and normal probabilities and inverse normal values fluently.','Build any confidence interval of the course and choose z or t correctly.','Recognise from the wording which method a question wants.'],
  sections=[
   ('The plan','What this week is for','A drill session, in the room and on the site',['Two-hour session: a timed set of six exam-style exercises, solved live after twenty minutes each. The dashboard\'s weakest quiz questions from Weeks 1–6 decide which ones.'],'Plan'),
   ('Describe','Exam cards c1–c2','Descriptive statistics · z-scores, rules',['Practice arena rounds until the method is automatic; the cards for the exam\'s exact phrasing.'],'Drill'),
   ('Probability and the normal','Exam cards c3–c6','Two-way counts · discrete RVs · binomial · normal and inverse',['The trap list: n vs n − 1, which tail, P(X = k) vs P(X ≤ k), standardise before you look up.'],'Drill'),
   ('Sampling and estimation','Exam cards c7–c12','CLT · proportions · z and t intervals · sample size',['The decision drill: z or t? mean or proportion? — twelve wordings, twelve answers.'],'Drill'),
   ('Open questions','Bring what you could not do','Q&A, worked live',['A workbook field: the one question type you still cannot do — read before the session, answered in it.'],'Q&A')],
  slides=['Applied Statistics · Week 13 — Exercises I','How the exam reads: six exercises, ten points each','Exercise 1 — describe (20 min)','Worked answer, and the traps','Exercise 2 — probability and the normal','Worked answer','Exercise 3 — estimation','Worked answer','Your questions','Next: Weeks 7–12'],
  tools=[('practice.html','Practice arena'),('exam-cards.html','Exam cards')]),

 dict(n=14,slug='Exercises and repetition II',emoji='🔁',
  title='Weeks 7–12, <em>by hand</em>',
  sub='The second drill week: hypothesis tests, two-sample problems, regression, chi-square and ANOVA — the exam\'s last three exercises. The hardest skill is not any single computation; it is choosing the procedure from the wording. That decision tree is the week.',
  ch='Weeks 7–12',
  reads=[('Exam cards c13–c27','exam-cards.html'),('Practice arena','practice.html')],
  objectives=['Choose the test from the wording: one mean or two, paired or independent, proportion or mean, categories or numbers.','Run any test of the course with a rejection region and with a p-value.','Fit and interpret a regression line, and test its slope.','Read a contingency table and an ANOVA table.'],
  sections=[
   ('The plan','What this week is for','A drill session on Weeks 7–12',['Same format as Week 13: a timed set of three exam-style exercises, worked live; chosen from the dashboard\'s weakest questions.'],'Plan'),
   ('Which test?','The decision tree','Every procedure of the semester, on one page',['Widget: a click-through tree — how many groups? numbers or categories? paired? — landing on the test and its exam card. Twelve pizzeria questions to route.'],'Decide'),
   ('Tests','Exam cards c13–c19','One-sample and two-sample tests',['The trap list: tails, pooled vs unpooled, paired differences, "significant ≠ important".'],'Drill'),
   ('Regression and chi-square','Exam cards c20–c27','r, the line, the slope test, r², chi-square, F, ANOVA',['The interpretation drill: every number in an output, in one business sentence.'],'Drill'),
   ('Open questions','Bring what you could not do','Q&A, worked live',['A workbook field: the question type you still cannot do.'],'Q&A')],
  slides=['Applied Statistics · Week 14 — Exercises II','Which test? — the tree','Exercise 4 — a test (20 min)','Worked answer, and the traps','Exercise 5 — two samples or regression','Worked answer','Exercise 6 — chi-square or ANOVA','Worked answer','Your questions','Next: the blank test'],
  tools=[('practice.html','Practice arena'),('exam-cards.html','Exam cards')]),

 dict(n=15,slug='The blank test',emoji='📝',
  title='The dress rehearsal',
  sub='A complete exam paper — six exercises, ninety minutes — taken at home under exam conditions, then corrected together in class. It does not count. It is the most useful ninety minutes of the semester, because it is the only way to find out what the two hand-written sheets need to contain.',
  ch='Week 15',
  reads=[('Exam cards — every archetype','exam-cards.html')],
  objectives=['Sit a full paper under the real constraints: 90 minutes, calculator, two hand-written sheets.','Find out what your summary sheets are missing, and fix them.','Correct your own paper against the worked solutions and score it.','Arrive at Week 16 knowing exactly which two question types to rehearse once more.'],
  sections=[
   ('The blank test','Take it at home','90 minutes · six exercises · exam conditions',['The paper is distributed on Cyberlearn (and printable from here once written). Sit it in one go, timed, with only your sheets and a calculator.','A workbook field: your score by exercise, entered honestly, so the correction session can target the room\'s weak spots.'],'Test'),
   ('The correction','In class','Every exercise worked, every trap named',['Worked solutions, the marking scheme, and the pattern of what the class lost points on — from the dashboard.'],'Correction'),
   ('Your two sheets','What to write on them','Formulas, decision rules, the traps — not worked examples',['A card with the recommended contents of the two sheets, section by section: the formula list, the "which test?" tree, the n − 1 rule, the tail conventions.'],'Sheets'),
   ('Last pass','The two types you rehearse once more','Exam cards, targeted',['From your blank-test score: the two archetypes to redo with fresh numbers until Week 16.'],'Rehearse')],
  slides=['Applied Statistics · Week 15 — The blank test','How it went: the room\'s scores','Exercise 1–2: worked','Exercise 3–4: worked','Exercise 5–6: worked','What your sheets should contain','The traps, one last time','Week 16: what to bring'],
  tools=[('exam-cards.html','Exam cards')]),

 dict(n=16,slug='Final exam',emoji='🎓',
  title='The final exam',
  sub='Ninety minutes, closed book, six exercises. Everything below is the syllabus\'s own rules, so that nothing about the format is a surprise on the day. The date and room are on Cyberlearn.',
  ch='Week 16 · exam week',
  reads=[],
  objectives=['Know the format: 90 minutes, six exercises of ten points, graded to the half point, 70% of the course grade.','Bring exactly what is allowed: a simple non-programmable calculator and two hand-written sheets (both sides).','Leave at home what is not: computers, phones, communication devices of any kind.','Hand in the pizzeria file — the individual project — by the deadline on Cyberlearn.'],
  sections=[
   ('The format','What the paper looks like','Six exercises · ten points each · 90 minutes',['One exercise per block of the course: describe · probability and the normal · sampling and estimation · a test · two samples or regression · chi-square or ANOVA. Each is one of the archetypes in the exam cards, with fresh numbers.'],'Format'),
   ('The rules','What you may bring','Calculator and two hand-written sheets',['A simple, non-programmable calculator. A personal summary of two sheets, two-sided (four pages), hand-written — printed or photocopied sheets are not allowed. No computers, smartphones or communication devices.'],'Rules'),
   ('The project','Hand in the pizzeria file','15% · individual · graded to the half point',['The workshop pages from Weeks 1–12, finished and argued, as one document. The deadline and the upload are on Cyberlearn.'],'Project'),
   ('After','Results and the viva that never was','How the grade is built',['Final grade = 15% presence + 15% project + 70% exam. Results on the school\'s schedule.'],'Grade')],
  slides=['Applied Statistics · Week 16 — the final exam','The format: six exercises, 90 minutes','What you may bring','The project deadline','Good luck'],
  tools=[('exam-cards.html','Exam cards')]),
]

def esc(s): return html.escape(s,quote=True)

def page(w):
  n=w['n']; sections=w['sections']
  secs_js=json.dumps([dict(id='s%d'%(i+1),num='%d.%d'%(n,i+1),name=s[1],tag=s[2],badge=s[4]) for i,s in enumerate(sections)],ensure_ascii=False)
  slides_js=json.dumps([dict(cls=('dk' if i==0 else None),k=('HEG Genève · Applied Statistics' if i==0 else 'Week %d · slide %d'%(n,i+1)),t=t,
                             b=('<p style="font-size:1.15em"><b>Week %d · %s</b></p><p>Jan Erik Meidell · Haute école de gestion de Genève</p><div class="onproj"><b>Outline deck →</b> this week\'s slides are an outline. Each title becomes a full slide, with an "On the pizzeria →" callout and speaker notes, when the week is written.</div>'%(n,w['slug']) if i==0 else '<ul><li>Outline slide — content to write.</li><li>Kicker, body and an <b>On the pizzeria →</b> callout follow the Week 1–2 pattern.</li></ul>'),
                             logo=(True if i==0 else None),n='Outline — speaker notes to write.') for i,t in enumerate(w['slides'])],ensure_ascii=False)
  reads=''.join('<div class="mi" data-read="r%d"><span class="box">✓</span><span><a href="%s"%s>%s%s</a></span></div>'%(i+1,esc(u),(' target="_blank" rel="noopener"' if u.startswith('http') else ''),esc(t),(' ↗' if u.startswith('http') else '')) for i,(t,u) in enumerate(w['reads']))
  objs=''.join('<li>%s</li>'%o for o in w['objectives'])
  tools=''.join('<a href="%s">%s</a>'%(esc(h),esc(t)) for h,t in w['tools'])
  screens=[]
  for i,(kick,name,tag,plan,badge) in enumerate(sections):
    sid='s%d'%(i+1); prev='s%d'%i if i>0 else None; nxt='s%d'%(i+2) if i<len(sections)-1 else None
    plan_html=''.join('<li>%s</li>'%p for p in plan)
    lab='problem' if badge=='Hook' else ('play' if badge in ('Quiz','Exercise','Drill','Hands-on') else 'idea')
    nav='<div class="nav-foot">'+('<button class="btn ghost" data-prev="%s">← Back</button>'%prev if prev else '<button class="btn ghost" data-home>Menu</button>')+('<button class="btn" data-next="%s">Next: %s →</button>'%(nxt,sections[i+1][1].lower()) if nxt else '<a class="btn" href="index.html" style="text-decoration:none;display:inline-block;">Course page →</a>')+'</div>'
    screens.append('''
<!-- ============================ %d.%d ============================ -->
<section class="screen" id="%s" data-num="%d">
  <button class="crumb" data-home>← Week menu</button>
  <div class="sec-head"><div class="kicker">Section %d.%d · %s</div><h2>%s</h2></div>
  <div class="card">
    <span class="label %s">Planned · %s</span>
    <h3>%s</h3>
    <ul class="plan-list">%s</ul>
    <div class="case-note"><b>Status →</b> this section is an outline. When the week is written it becomes an interactive screen on the Week 1–2 pattern: an earned completion, a classify exercise or lab where one is listed, and its own share of the progress bar.</div>
  </div>
  %s
</section>'''%(n,i+1,sid,i+1,n,i+1,kick,name,lab,badge,tag,plan_html,nav))
  return '''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<base href="/HEG/statistics/">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Week %d · %s · Applied Statistics · HEG</title>
<meta name="description" content="Applied Statistics, Week %d — %s (%s). In preparation: objectives, planned sections and the lecture outline.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#002C46">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>%s</text></svg>">
<link rel="stylesheet" href="/shared/themes/heg.css">
<link rel="stylesheet" href="stats.css">
</head>
<body data-course="statistics">
<!-- GENERATED by _build/scaffold.py — edit the SPEC there, not this file.
     Delete this week's SPEC entry once the page is written by hand. -->

<div class="topbar">
  <div class="topbar-inner">
    <img class="brand" src="logo_heg-ge.svg" alt="HEG Genève">
    <span class="course">APPLIED STATISTICS · WEEK %d</span>
    <span class="tb-spacer"></span>
    <a class="home" href="index.html">← Course</a>
    <button class="lect-btn" id="lectOpen" title="The slide outline for this week">▶ Lecture</button>
  </div>
  <div class="topbar-bars">
    <div class="tbar"><span class="tbl">This week</span><div class="tk"><div class="tf" id="progFill" style="width:0"></div></div><span class="tp" id="progPct">—</span></div>
    <div class="tbar"><span class="tbl">Course</span><div class="cbar" id="courseBar"></div><span class="tp" id="coursePct">0%%</span></div>
  </div>
</div>
<div class="draft-banner">🔧 <b>Week %d is in preparation.</b> What follows is the plan for the week — its objectives, sections and slide outline. Nothing here is counted yet.</div>

<div class="wrap">

<section class="screen active" id="home">
  <div class="hero">
    <div class="eyebrow">Week %d · Applied Statistics · HEG Genève</div>
    <h1>%s</h1>
    <p class="sub">%s</p>
    <div class="liveinfo">
      <span class="li">🏫 In class: <b>Week %d</b></span>
      <span class="li">📖 <b>%s</b></span>
      <span class="li">▶ The <b>Lecture</b> button shows the slide outline</span>
    </div>
  </div>

  <div class="objectives">
    <h4>By the end of Week %d you will be able to</h4>
    <ul>%s</ul>
  </div>

  <div class="materials">
    <h4>Resources</h4>
    %s
    <div class="note" style="font-size:12.5px;color:var(--grey);margin-top:8px;font-style:italic;">Homework for this week is written with the week itself, on the Week 1–2 pattern: a fresh dataset, hints and worked solutions.</div>
  </div>

  <div class="section-list" id="sectionList"></div>

  %s

  <div class="foot">
    <a class="backlink" href="index.html">← Course page</a>
  </div>
</section>
%s
</div>

<div id="lect" role="dialog" aria-label="Lecture deck">
  <div class="lect-stage" id="lectStage">
    <div class="lect-zone prev" title="Previous (←)"></div>
    <div class="lect-zone next" title="Next (→ or space)"></div>
  </div>
  <div id="lectNotes"></div>
  <div class="lect-foot">
    <img src="logo_heg-ge.svg" alt="HEG Genève">
    <span class="lf-t">Applied Statistics · Week %d · %s · outline · Jan Erik Meidell · HEG Genève</span>
    <button id="lectNotesBtn" title="Toggle speaker notes (N)">Notes</button>
    <button onclick="window.print()" title="Print / save the deck as PDF">PDF</button>
    <button id="lectClose" title="Exit (Esc)">✕ Exit</button>
    <span class="lf-n" id="lectCount">1 / 1</span>
  </div>
</div>
<div id="printDeck"></div>

<script>
/* Scaffold engine: navigation + lecture outline only. Records nothing. */
var SECTIONS=%s;
function renderList(){
  var list=document.getElementById('sectionList');if(!list)return;list.innerHTML='';
  SECTIONS.forEach(function(s){
    var c=document.createElement('div');c.className='section-card';
    c.innerHTML='<div class="num">'+s.num+'</div><div class="info"><div class="name">'+s.name+'</div><div class="tag">'+s.tag+'</div><span class="badge">'+s.badge+' · planned</span></div><div class="status">▸</div>';
    c.onclick=function(){show(s.id);};list.appendChild(c);
  });
}
function show(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  var t=document.getElementById(id);if(t)t.classList.add('active');
  if(id==='home')renderList();
  window.scrollTo({top:0,behavior:'instant'in window?'instant':'auto'});
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-next],[data-prev],[data-home]');if(!b)return;
  if(b.hasAttribute('data-home'))return show('home');
  if(b.hasAttribute('data-prev'))return show(b.getAttribute('data-prev'));
  var n=b.getAttribute('data-next');if(n)show(n);
});
var SLIDES=%s;
(function lecture(){
  var idx=0,open=false,cur=null;
  var lect=document.getElementById('lect'),stage=document.getElementById('lectStage'),count=document.getElementById('lectCount'),notes=document.getElementById('lectNotes');
  function slideHTML(s){return (s.logo?'<img class="lect-logo-big" src="logo_heg-ge.svg" alt="HEG Genève">':'')+'<div class="lect-kicker">'+s.k+'</div><h2>'+s.t+'</h2><div class="lect-body">'+s.b+'</div>';}
  function render(){var s=SLIDES[idx];if(cur)cur.remove();cur=document.createElement('div');cur.className='lect-slide'+(s.cls?' '+s.cls:'');cur.innerHTML=slideHTML(s);stage.appendChild(cur);lect.classList.toggle('dkbg',s.cls==='dk');count.textContent=(idx+1)+' / '+SLIDES.length;notes.innerHTML='<span class="nt">Speaker notes · slide '+(idx+1)+'</span>'+(s.n||'—');}
  function go(d){idx=Math.max(0,Math.min(SLIDES.length-1,idx+d));render();}
  function openLect(){open=true;lect.classList.add('on');render();if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(function(){});}}
  function closeLect(){open=false;lect.classList.remove('on');if(document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen().catch(function(){});}}
  document.getElementById('lectOpen').addEventListener('click',openLect);
  document.getElementById('lectClose').addEventListener('click',closeLect);
  document.getElementById('lectNotesBtn').addEventListener('click',function(){notes.classList.toggle('on');});
  stage.querySelector('.lect-zone.next').addEventListener('click',function(){go(1);});
  stage.querySelector('.lect-zone.prev').addEventListener('click',function(){go(-1);});
  document.addEventListener('keydown',function(e){if(!open)return;
    if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();go(1);}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(-1);}
    else if(e.key==='Escape'){closeLect();}else if(e.key==='n'||e.key==='N'){notes.classList.toggle('on');}
    else if(e.key==='Home'){idx=0;render();}else if(e.key==='End'){idx=SLIDES.length-1;render();}});
  if(location.hash==='#lecture')setTimeout(openLect,150);
  document.getElementById('printDeck').innerHTML=SLIDES.map(function(s,i){return '<div class="p-slide'+(s.cls?' '+s.cls:'')+'">'+slideHTML(s)+'<span class="pnum">Applied Statistics · Week %d · outline · '+(i+1)+'/'+SLIDES.length+'</span></div>';}).join('');
})();
renderList();
</script>
<script src="/shared/config.js"></script>
<script src="courseprogress.js"></script>
<script>CourseProgress.render({bar:document.getElementById('courseBar'),pct:document.getElementById('coursePct'),compact:true});</script>
<script src="/shared/announce.js" defer></script>
<script src="/shared/chat.js" defer></script>
<script src="/track.js" defer></script>
</body>
</html>
'''%(n,w['slug'],n,w['slug'],w['ch'],w['emoji'],n,n,n,w['title'],w['sub'],n,esc(w['ch']),n,objs,reads,
     ('<div class="card" style="margin-top:22px;"><span class="label play">Tools for this week</span><div class="tool-links">%s</div></div>'%tools if tools else ''),
     ''.join(screens),n,w['slug'],secs_js,slides_js,n)

if __name__=='__main__':
  for w in SPEC:
    p=os.path.join(ROOT,'week%d.html'%w['n'])
    open(p,'w',encoding='utf-8').write(page(w))
    print('wrote week%d.html · %s · %d sections · %d slides'%(w['n'],w['slug'],len(w['sections']),len(w['slides'])))
