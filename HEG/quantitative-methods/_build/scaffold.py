#!/usr/bin/env python3
"""
HEG · Quantitative Methods I — generator for the scaffold week pages (fall 2–16).

Each scaffold is a REAL page on the same chrome as week1 (quant.css, top
banner, course bar, ▶ Lecture) whose content is the plan for that week:
objectives straight from the syllabus, the sections it will have and the
interaction each one is meant to carry, the reading, a Part 2 exercise
outline and a slide outline the Lecture button actually plays. It records
NOTHING — no StatsTrack.init, no progress steps — and courseprogress.js
lists it as live:false, so nobody's percentage moves until the week is
written by hand.

Ported from HEG/statistics/_build/scaffold.py. Two differences, both
because this course has no hand-in: the last planned section of every week
is the ungraded REVIEW QUIZ rather than a workbook, and there is no
`project` block in courses.json to keep in step.

Re-run after editing SPEC:
    python3 "HEG/quantitative-methods/_build/scaffold.py"

⚠ When a week is written by hand, DELETE its entry from SPEC — otherwise
the next run silently overwrites the hand-written file. (Week 1 is not in
SPEC for exactly this reason.)
"""
import os, html, json
ROOT=os.path.join(os.path.dirname(__file__),'..')

# Objectives and content below are taken from the 2026/2027 syllabus,
# week by week; the framing and the exercises are this site's.
SPEC=[
 dict(n=3,slug='Lines, parabolas and systems of linear equations',emoji='📐',
  title='Break-even, and where <em>supply meets demand</em>',
  sub='The single most-used shape in business is a straight line, and the second is a parabola. This week makes both precise: slope as a rate of change, the four ways to write a line, the vertex of a parabola, and systems of equations solved three ways — because break-even analysis and market equilibrium are the same piece of algebra.',
  ch='Lines · parabolas · systems of equations',
  reads=[('Gallo, "A Refresher on Break-even Quantity" (HBR, 2015) — on Cyberlearn','#')],
  objectives=['Compute and interpret the slope of a line as a rate of change in a business context — cost per unit, marginal revenue.',
              'Write and manipulate equations of lines (point-slope, slope-intercept, general form) and identify parallel and perpendicular lines.',
              'Build and interpret linear business functions: cost, revenue, profit, demand, supply and linear depreciation.',
              'Recognise quadratic functions and graph parabolas — vertex, axis of symmetry, intercepts, direction of opening.',
              'Find maximum and minimum values using the vertex to solve revenue and profit problems.',
              'Solve systems of two (and three) linear equations by substitution and elimination, and interpret consistent, inconsistent and dependent cases.',
              'Apply systems to break-even analysis (cost = revenue) and market equilibrium (supply = demand).'],
  sections=[
   ('The hook','At what price does the market clear?','Drag supply and demand until they cross',
    ['Two lines on one chart, both draggable. The crossing is the equilibrium price and quantity — and finding it is a system of two equations.',
     'Lock a guess for the equilibrium price of a kilo of house blend; the section closes by solving it exactly.'],'Hook'),
   ('The line','Slope is a rate of change','Point-slope, slope-intercept, general form · parallel and perpendicular',
    ['Widget: drag two points, read the slope as "francs per unit" and see all three forms of the equation update together.',
     'Horizontal and vertical lines, and why a vertical line is not a function.',
     'Classify (6 rows): given a business sentence, which is the slope and which the intercept.'],'Lines'),
   ('Linear business functions','Cost, revenue, profit, demand, supply, depreciation','Six shapes, one form',
    ['Linear depreciation worked in full: a CHF 48 000 roaster over eight years, straight-line to a residual value.',
     'Demand slopes down, supply slopes up — and the sign of the slope is the economics.'],'Build'),
   ('Parabolas','The vertex is the decision','Axis of symmetry · intercepts · concavity · max and min',
    ['Widget: a,b,c sliders with the vertex, axis and roots marked — the Week 1 discriminant lab, extended to read the vertex as an answer.',
     'Revenue maximisation worked on XY Coffee\'s demand curve, then profit maximisation, and the difference between the two answers.'],'Parabolas'),
   ('Systems','Two facts, two unknowns','Substitution · elimination · the graphical reading',
    ['Consistent, inconsistent and dependent, each shown as a picture: one crossing, no crossing, the same line twice.',
     'A three-variable system introduced briefly, and a first look at nonlinear systems (a line meeting a parabola — up to two answers).'],'Systems'),
   ('Applications','Break-even and market equilibrium','Cost = revenue · supply = demand',
    ['Break-even for the café, and then for the roastery with a second cost structure — the volume at which the new roaster becomes the cheaper option.',
     'The hook closes: equilibrium price and quantity for the house blend, solved exactly and read back as a business sentence.'],'Apply'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Slopes, forms of a line, the vertex, consistent vs inconsistent systems, break-even and equilibrium.'],'Quiz')],
  slides=['Quantitative Methods I · Session #3 — Lines, parabolas and systems','Recap: combining functions','Slope as a rate of change','Three forms of the equation of a line','Parallel and perpendicular','Horizontal and vertical lines','Linear cost, revenue and profit','Demand and supply as linear functions','Linear depreciation, worked','The quadratic function and its graph','Vertex, axis of symmetry, intercepts','Concavity: which way does it open?','Maximising revenue with the vertex','Systems: substitution','Systems: elimination','Consistent, inconsistent, dependent','Three variables, briefly','Nonlinear systems: a line meets a parabola','Break-even analysis','Market equilibrium: supply = demand','Part 2 · exercises','Takeaways · homework · Week 4'],
  ex=[('Slope as francs per unit',10,'three business sentences → three slopes, with units'),
      ('Write the line three ways',12,'one pair of points, three equivalent equations'),
      ('Linear depreciation',12,'the roaster over eight years, and its book value in year five'),
      ('Find the vertex',12,'a revenue parabola: peak price, peak revenue, and the two roots'),
      ('Solve a system twice',14,'substitution and elimination on the same pair — the answers must agree'),
      ('Consistent or not?',10,'three systems: one solution, none, or infinitely many'),
      ('Break-even, two cost structures',15,'at what volume does the new roaster become cheaper?'),
      ('Market equilibrium',12,'supply = demand for the house blend, solved and interpreted')],
  tools=[]),

 dict(n=4,slug='Rate of change and the derivative',emoji='📈',
  title='What does <em>one more</em> cost us?',
  sub='Week 1 found the cost of the 61st tonne by subtracting two rows of a table. That only works when somebody hands you the table. The derivative is how you answer the same question from the formula, at any point, exactly — and "the cost of one more" is the number almost every business decision turns on.',
  ch='Limits · the derivative · marginal cost and revenue',
  reads=[('Christensen, "How Will You Measure Your Life?" (HBR, 2020) — on Cyberlearn','#')],
  objectives=['Define instantaneous rate of change.',
              'Understand the derivative as a limit and as the slope of a tangent line.',
              'Interpret a derivative as a marginal quantity.',
              'Calculate simple derivatives by hand.',
              'Parenthesis: solve exponential and logarithmic equations.'],
  sections=[
   ('The hook','The 61st tonne, without the table','From average rate of change to instantaneous',
    ['Widget: the Week 1 cost curve with a secant line between two points. Drag the second point toward the first and watch the secant become a tangent.',
     'The number on screen stops moving. That limit is the derivative, and it was CHF 776 in the table.'],'Hook'),
   ('The limit','The intuitive idea','What "approaching" means, without the epsilons',
    ['A table of the difference quotient as h shrinks: 1, 0.1, 0.01, 0.001 — and the value it settles on.',
     'Where limits fail: a jump (the theatre ticket price from Week 1) has no derivative at the threshold, and the business reason is that the rule changes there.'],'Limit'),
   ('The derivative','Slope of the tangent','Notation: f′(x), dy/dx, and what each is for',
    ['Definition as the limit of the difference quotient, worked once by hand on f(x) = x².',
     'Widget: a curve with a tangent you can slide along it, reading the slope as a number at every point.'],'Define'),
   ('Marginal quantities','Marginal cost, marginal revenue','The derivative IS the business idea',
    ['Marginal cost as C′(q), marginal revenue as R′(q) — and the rule every manager should know: produce while MR > MC.',
     'Worked on XY Coffee\'s cost function, and compared with the table-subtraction answer from Week 1.'],'Marginal'),
   ('Basic rules','Differentiating without the limit','Constant · power · sum rules',
    ['The power rule derived once from the definition, then used freely.',
     'Widget: type a polynomial, see its derivative and both curves drawn — where the derivative is zero, the curve is flat.'],'Rules'),
   ('Parenthesis','Exponential and logarithmic equations','Solving for an exponent, properly',
    ['The Week 1 log rules, now used to solve equations rather than evaluate expressions.',
     'Worked: doubling times, payback periods, and the time to reach a subscriber target.'],'Solve'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Average vs instantaneous rate, reading a tangent, marginal interpretation, the power rule, and one exponential equation.'],'Quiz')],
  slides=['Quantitative Methods I · Session #4 — Rate of change and the derivative','Recap: the 61st tonne, found by subtraction','Average rate of change: the secant','Let the gap shrink: the tangent','The intuitive idea of a limit','A table of difference quotients','The derivative, defined','Notation: f′(x), dy/dx, and when to use which','Worked from the definition: f(x) = x²','Marginal cost as C′(q)','Marginal revenue as R′(q)','The rule: produce while MR > MC','The constant and power rules','The sum rule','Where the derivative is zero, the curve is flat','Parenthesis: exponential equations','Parenthesis: logarithmic equations','Part 2 · exercises','Takeaways · homework · Week 5'],
  ex=[('Average rate of change',10,'the cost table: three intervals, three rates'),
      ('Shrink the interval',12,'the difference quotient at h = 1, 0.1, 0.01 — and its limit'),
      ('From the definition',15,'differentiate f(x) = x² and f(x) = 3x + 5 by hand'),
      ('The power rule',10,'six derivatives, thirty seconds each'),
      ('Marginal cost',14,'C(q) given: find C′(q), evaluate it, interpret it in francs'),
      ('MR against MC',14,'the volume at which one more unit stops paying'),
      ('Solve for the exponent',12,'three exponential equations, by logarithm')],
  tools=[]),

 dict(n=5,slug='Differentiation rules',emoji='⚙️',
  title='The toolkit, <em>drilled</em>',
  sub='A short, honest week: the rules that let you differentiate anything this course will hand you. Product, quotient and chain — the chain rule most of all, because in business almost every function is a function of a function.',
  ch='Product · quotient · chain rules · higher-order derivatives',
  reads=[('Burns, "The Chain Rule Derivative Explained with Comics" (Medium, 2020) — on Cyberlearn','#')],
  objectives=['Differentiate the standard functions quickly and correctly.',
              'Apply the rules of differentiation to composite expressions.'],
  sections=[
   ('The standard functions','Power, exponential, logarithm','The three derivatives to know cold',
    ['A reference card that stays on screen: xⁿ, eˣ, ln x, and a constant.',
     'Widget: a drill that generates fresh functions and checks your derivative, endlessly.'],'Reference'),
   ('Constant and sum rules','The easy two','Differentiating term by term',
    ['Worked on a polynomial cost function, term by term, with the reasoning said out loud.'],'Rules'),
   ('The product rule','When two things vary at once','(fg)′ = f′g + fg′',
    ['Revenue = price × quantity, with both varying: the product rule IS the economics of a price change.',
     'Worked: R(p) = p·q(p), and the derivative read as "the extra francs per unit minus the units lost".'],'Product'),
   ('The quotient rule','Rates of rates','(f/g)′, and average cost',
    ['Average cost A(q) = C(q)/q differentiated, and the classic result: average cost is flat exactly where marginal cost crosses it.',
     'That is the Week 1 roastery table, proved rather than observed.'],'Quotient'),
   ('The chain rule','A function of a function','The rule you will use most',
    ['Worked slowly, three times, with the "outer × inner" phrasing.',
     'Widget: peel a composite function layer by layer and differentiate each layer as you go.'],'Chain'),
   ('Higher-order derivatives','The rate of the rate','f″ and what it will mean in Week 8',
    ['Second derivative introduced as acceleration — costs rising, and rising faster.',
     'Planted deliberately: in Week 8 the sign of f″ is what distinguishes a peak from a floor.'],'Second'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Twelve derivatives, mixed, timed the way the exam is timed.'],'Quiz')],
  slides=['Quantitative Methods I · Session #5 — Differentiation rules','Recap: the derivative as a limit','The standard derivatives: xⁿ, eˣ, ln x','The constant rule','The sum rule, term by term','The product rule','Why revenue needs the product rule','The quotient rule','Average cost differentiated','Where marginal cost crosses average cost','The chain rule: outer × inner','Chain rule, worked three times','A composite cost function','Higher-order derivatives','f″ as acceleration — and a promise about Week 8','Part 2 · exercises','Takeaways · homework · Week 6 is self-study'],
  ex=[('The standard four',8,'xⁿ, eˣ, ln x, constant — six quick derivatives'),
      ('Term by term',10,'a polynomial cost function, differentiated'),
      ('Product rule',14,'three products, including R(p) = p·q(p)'),
      ('Quotient rule',14,'average cost, differentiated and interpreted'),
      ('Chain rule',16,'four composites, peeled layer by layer'),
      ('Mixed drill',14,'eight derivatives with no clue which rule applies'),
      ('Second derivatives',10,'three functions: f, f′, f″, and what f″ says')],
  tools=[]),

 dict(n=6,slug='Self-study week — the business case',emoji='📚',
  title='A week with no class, and <em>material that counts</em>',
  sub='Week 6 of the fall semester is a self-study week: there is no class on campus, but you continue your progress. For Quantitative Methods there is a <b>case study and a set of exercises</b> consolidating everything from the first five weeks, <b>with answers provided</b>. The topics covered are included in the evaluations — both the midterm and the end-of-semester exam.',
  ch='Case study · review of Weeks 1–5',
  reads=[('The case study and its exercise set — on Cyberlearn','#')],
  objectives=['Review and consolidate the notions covered since the beginning of the semester.',
              'Work a full business case end to end, from a paragraph of prose to a defended recommendation.',
              'Find, before the midterm, which of Weeks 1–5 has not landed — at the last moment when it is free to fix.'],
  sections=[
   ('How this week works','No class, and no excuse','What to do, and in what order',
    ['The case study is released on Cyberlearn at the start of the week, with its answers.',
     'Suggested order: attempt the case cold, then check, then go back to whichever week the gaps point at.',
     'Week 7 debriefs the case in class, as time allows.'],'Plan'),
   ('The case','XY Coffee, five weeks on','One business, every tool so far',
    ['A single connected case: build the functions, combine them, find the break-even, differentiate, interpret the margin.',
     'Written so that each part uses one week — which makes the part you cannot do a diagnosis, not just a wrong answer.'],'Case'),
   ('Self-diagnosis','Which week is the gap in?','A map from mistake to section',
    ['A table: symptom → the week and section to reread. "I could not find the domain" → Week 1 §1.4, and so on.'],'Diagnose'),
   ('Review quiz','Weeks 1–5, mixed','Twelve questions · not graded',
    ['Deliberately unlabelled: the questions do not say which week they come from, because the midterm will not either.'],'Quiz')],
  slides=['Quantitative Methods I · Fall Week 6 — Self-study','No class this week — and material that counts','What to do, in what order','The case study: XY Coffee, five weeks on','Where to find it, and its answers','Self-diagnosis: symptom → section','The midterm is Week 9','Week 7 debriefs the case'],
  ex=[],
  tools=[]),

 dict(n=7,slug='Applications of the derivative',emoji='🎯',
  title='Elasticity, growth, and <em>how much a price cut really costs</em>',
  sub='The derivative earns its keep. Marginal analysis on all three functions, price elasticity of demand — the number that decides whether a discount makes or loses money — growth rates, linear approximation, and Newton\'s method for the equations that will not solve.',
  ch='Marginal analysis · elasticity · linear approximation · Newton',
  reads=[('Gallo, "A Refresher on Price Elasticity" (HBR, 2015) — on Cyberlearn','#')],
  objectives=['Measure change, margins and growth quantitatively.',
              'Compute and interpret marginal cost, marginal revenue and marginal profit.',
              'Compute and interpret elasticity and growth rates.',
              'Solve more complicated equations with an iterative method.',
              'Approximate functions with linear approximations.'],
  sections=[
   ('The hook','Will a 10% discount pay for itself?','Elasticity, guessed before it is computed',
    ['Slider: cut the price of the house blend by 10% and guess the change in revenue. Lock it.',
     'The answer depends on one number — the elasticity — and the section computes it.'],'Hook'),
   ('Marginal analysis','All three margins','MC, MR, MP and the rule that connects them',
    ['Worked on XY Coffee\'s functions: where MP = 0 is where profit peaks, which is next week\'s whole subject.'],'Margins'),
   ('Elasticity','The number behind every discount','E = (dq/dp)·(p/q), and what its size means',
    ['Widget: a demand curve with elasticity shown at every point — elastic above the midpoint, inelastic below.',
     'The rule in business words: if demand is elastic, a price cut raises revenue; if inelastic, it lowers it. The hook closes here.'],'Elastic'),
   ('Growth rates','Percentage change, continuously','Relative rate of change f′/f',
    ['Why a growth rate is a derivative divided by the level, and why that makes ln x the natural tool.'],'Growth'),
   ('Linear approximation','A straight line, locally','f(x + h) ≈ f(x) + f′(x)·h',
    ['The tangent used as a forecast: "one more tonne costs about C′(60)" — and how far you can trust it before it breaks.'],'Approx'),
   ('Newton\'s method','When the equation will not solve','Iterating to an answer',
    ['Widget: watch Newton\'s method converge on the root of an equation no formula solves, step by step.',
     'Where this actually turns up: internal rate of return, in the spring semester.'],'Newton'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Margins, an elasticity computation and its interpretation, a growth rate, a linear approximation, one Newton step.'],'Quiz')],
  slides=['Quantitative Methods I · Session #7 — Applications of the derivative','Debrief: the Week 6 business case','Poll: does a 10% discount pay for itself?','Marginal cost, revenue and profit','Where MP = 0','Price elasticity of demand, defined','Elastic, inelastic, unit elastic','Reading elasticity off a demand curve','The hook closes: the discount decision','Growth rates as f′/f','Why ln x is the natural tool for growth','Linear approximation: the tangent as a forecast','How far can you trust it?','Newton\'s method, iterated','Where Newton turns up: IRR, in the spring','Part 2 · exercises','Takeaways · homework · Week 8'],
  ex=[('The three margins',12,'MC, MR and MP for the café, evaluated and interpreted'),
      ('Compute an elasticity',15,'at two prices, and say what each one means'),
      ('The discount decision',14,'the hook closes: does a 10% cut raise revenue?'),
      ('Growth rate',10,'f′/f on a subscriber curve'),
      ('Linear approximation',12,'estimate C(61) from C(60) and C′(60), then check the error'),
      ('One Newton step',14,'an equation with no closed form, iterated twice by hand')],
  tools=[]),

 dict(n=8,slug='Optimization in one variable',emoji='🏔️',
  title='Where is profit <em>highest</em>?',
  sub='The question the whole fall semester has been walking toward. Critical values, the first- and second-order conditions, local against global, endpoints, and the business problems they settle: profit maximisation, cost minimisation, minimum average cost, and a first look at the economic order quantity.',
  ch='Critical points · first- and second-order conditions · optimisation',
  reads=[('Badaracco, "The “Maximize Profits” Trap in Decision Making" (HBR, 2016) — on Cyberlearn','#')],
  objectives=['Find critical values, to locate relative maxima and relative minima of a curve.',
              'Use the first and second derivatives to describe the behaviour of a function.',
              'Optimize value: find the maxima and minima of a function.',
              'Apply first-order and second-order conditions correctly.',
              'Set up and solve a variety of real optimization problems.',
              'Translate a business goal into an objective function to maximise or minimise.'],
  sections=[
   ('The hook','The tonnage the roastery should run','Guess it, then prove it',
    ['The Week 1 cost table returns. Guess the tonnage with the lowest average cost; the week proves it exactly.'],'Hook'),
   ('Critical points','Where the curve goes flat','Stationary points and the first-order condition',
    ['f′(x) = 0 as the condition, and the three things it can mean: a peak, a floor, or an inflection.',
     'Widget: a curve with its derivative drawn underneath — the zeros of one line up with the flats of the other.'],'Critical'),
   ('Second-order condition','Peak or floor?','f″ distinguishes them',
    ['The test stated, then used: f″ < 0 is a maximum, f″ > 0 a minimum. The Week 5 plant pays off here.',
     'Increasing and decreasing intervals from f′; concavity and inflection points from f″.'],'Second'),
   ('Local vs global','Do not forget the endpoints','And the business domain from Week 1',
    ['A maximum inside the interval is not necessarily the largest value on it. Check the ends — the roastery\'s 0 and 100 tonnes.',
     '⚠ The most-lost mark of the semester: reporting a local optimum as if it were global.'],'Global'),
   ('Profit maximisation','Setting up the objective function','From a business goal to a function to maximise',
    ['Worked end to end: demand estimate → revenue → cost → profit → differentiate → solve → check → interpret.',
     'And the honest comparison with revenue maximisation from Week 3: different price, different answer.'],'Maximise'),
   ('Minimising average cost','And a first look at EOQ','The hook closes',
    ['Minimum average cost found exactly, and shown to be where marginal cost crosses it — proved with Week 5\'s quotient rule.',
     'Economic order quantity introduced: how much coffee to order at a time, trading ordering cost against holding cost.'],'Minimise'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Critical points, the second-order test, an endpoint trap, one full optimisation set up from prose.'],'Quiz')],
  slides=['Quantitative Methods I · Session #8 — Optimization in one variable','Recap: the derivative and its uses','Poll: the tonnage with the lowest average cost','Stationary points: f′(x) = 0','What a flat point can mean — three cases','Increasing and decreasing from f′','Concavity and inflection from f″','The second-order condition','Local vs global extrema','Checking the endpoints — and the business domain','Translating a business goal into an objective function','Profit maximisation, end to end','Profit max is not revenue max','Minimising average cost','Where MC crosses AC, proved','Economic order quantity, a first look','Unconstrained vs constrained, briefly','Part 2 · exercises','Takeaways · homework · Week 9 is the midterm'],
  ex=[('Find the critical points',12,'three functions: solve f′ = 0'),
      ('Peak or floor?',10,'apply the second-order test to each'),
      ('The endpoint trap',12,'a maximum on a closed interval — and why the interior answer is wrong'),
      ('Profit maximisation',18,'from prose to price, end to end'),
      ('Profit max vs revenue max',12,'the same demand curve, two objectives, two answers'),
      ('Minimum average cost',15,'find it, and show MC = AC there'),
      ('EOQ',14,'how much coffee to order at a time')],
  tools=[]),

 dict(n=9,slug='Midterm exam · introduction to integration',emoji='📝',
  title='The midterm — and then, <em>differentiation in reverse</em>',
  sub='Week 9 is two halves. The first is the <b>midterm exam</b>: 60 minutes, multiple choice, 20% of the module grade. The second is a short course opening the last block of the fall semester — integration, which is the derivative run backwards, and the tool that recovers a total from a rate.',
  ch='Midterm (MCQ, 60 min) · antiderivatives',
  reads=[('More information on the midterm is provided during the semester','#')],
  objectives=['Sit the midterm: 60 minutes, multiple choice, covering Weeks 1 to 8 including the self-study week.',
              'Understand integration as the reverse of differentiation.',
              'Compute simple antiderivatives.',
              'Recover total cost and revenue from marginal functions.'],
  sections=[
   ('The midterm','What to expect','60 minutes · MCQ · 20%',
    ['Format, timing and what you may bring: one authorised calculator and two hand-written sheets recto/verso.',
     'Coverage: Weeks 1–8, and the self-study week\'s material is included.',
     'Every weekly review quiz on this site was written in this style. They were the rehearsal.'],'Exam'),
   ('Antiderivatives','Differentiation, backwards','If F′ = f, then F is an antiderivative of f',
    ['The power rule reversed, and the constant of integration — why "+ C" is not a formality.',
     'Widget: differentiate and integrate the same function and watch them undo each other.'],'Reverse'),
   ('Basic rules','Integrating term by term','Constant · power · sum',
    ['Worked on marginal cost functions from Weeks 4–5, now integrated back.'],'Rules'),
   ('Recovering a total','From marginal to total','Total cost from marginal cost, with the fixed cost as the constant',
    ['The "+ C" turns out to be the fixed cost — which is the moment integration stops being abstract.',
     'Worked: given MC(q) and the fixed cost, reconstruct C(q) and check it against Week 1.'],'Recover'),
   ('Review quiz','Prove it to yourself','Eight questions · not graded',
    ['Antiderivatives, the constant of integration, and one "recover the total" problem.'],'Quiz')],
  slides=['Quantitative Methods I · Session #9 — Midterm, then integration','The midterm: format and rules','What you may bring','Coverage: Weeks 1–8, self-study week included','— exam —','Short course: introduction to integration','Differentiation, backwards','The power rule, reversed','Why "+ C" matters','Basic integration rules','From marginal cost back to total cost','The constant IS the fixed cost','Takeaways · Week 10'],
  ex=[('Antiderivatives',12,'six functions, integrated'),
      ('The constant of integration',10,'two antiderivatives differing by a constant — and why both are right'),
      ('Recover total cost',15,'from MC(q) and a fixed cost'),
      ('Recover total revenue',12,'from MR(q), and the condition R(0) = 0')],
  tools=[]),

 dict(n=10,slug='Integration and surpluses',emoji='∫',
  title='Area, accumulation, and <em>what the customer got for free</em>',
  sub='The definite integral as area and as accumulated change — and then the idea it was invented for in economics: <b>consumer and producer surplus</b>, the value a market creates beyond the price that changes hands.',
  ch='The definite integral · area · consumer and producer surplus',
  reads=[('Eggers et al., "Why You Should Be Tracking Customer Surplus Value" (HBR, 2024) — on Cyberlearn','#')],
  objectives=['Understand integration as the reverse of differentiation and as accumulation.',
              'Compute definite integrals and interpret the area under a curve.',
              'Compute and interpret surpluses.'],
  sections=[
   ('The hook','What is a market worth?','More than the money that changes hands',
    ['Some customers would have paid CHF 6 for a coffee and paid 4.50. That difference is real value — and it has an area.'],'Hook'),
   ('The definite integral','Area under a curve','Limits of integration, and why the constant cancels',
    ['Widget: shade the area under a curve between two bounds and watch the number; rectangles refining into the exact value.'],'Area'),
   ('Accumulated change','A total from a rate','∫ of a rate over time IS the total',
    ['Worked: daily sales rate integrated over a month gives the month\'s sales. The same idea as recovering cost from marginal cost, in time instead of quantity.'],'Accumulate'),
   ('Consumer surplus','What buyers gained','Area between the demand curve and the price',
    ['Computed on XY Coffee\'s demand curve at the price chosen in Week 8 — and the trade-off made visible: a higher price takes surplus from customers.'],'Consumer'),
   ('Producer surplus','What sellers gained','Area between the price and the supply curve',
    ['Computed on the supply curve from Week 3, and the two surpluses added into total welfare at equilibrium.'],'Producer'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Definite integrals, area interpretation, accumulated change, and both surpluses.'],'Quiz')],
  slides=['Quantitative Methods I · Session #10 — Integration and surpluses','Recap: antiderivatives','The definite integral','Area under a curve','Rectangles refining into the exact value','The constant cancels — why definite is easier','Accumulated change: a total from a rate','Sales rate integrated over a month','Consumer surplus, defined','Consumer surplus on our demand curve','Producer surplus, defined','Producer surplus on our supply curve','Total welfare at equilibrium','What a price rise does to each side','Part 2 · exercises','Takeaways · homework · Week 11 — the data half begins'],
  ex=[('Definite integrals',12,'four, computed and checked'),
      ('Area as a number',10,'shade it, compute it, say what it measures'),
      ('Accumulated change',14,'a sales rate over a month'),
      ('Consumer surplus',15,'on the house-blend demand curve at two prices'),
      ('Producer surplus',12,'on the supply curve from Week 3'),
      ('Total welfare',12,'both surpluses at equilibrium, and what a price cap does')],
  tools=[]),

 dict(n=11,slug='Data foundations, collection methods and sampling',emoji='🔍',
  title='Where do the <em>numbers come from</em>?',
  sub='The calculus half assumed the numbers. The data half asks where they came from — and that turns out to be the question that decides whether an analysis is worth anything. Populations and samples, levels of measurement, how to collect data honestly, and the four sampling methods.',
  ch='Population vs sample · data classification · sampling methods · bias',
  reads=[('Gallo, "A Refresher on Statistical Significance" (HBR, 2016) — on Cyberlearn','#')],
  objectives=['Make sense of data in a business environment.',
              'Distinguish descriptive from inferential statistics, populations from samples, parameters from statistics.',
              'Classify data by timing, data type and measurement level.',
              'Evaluate data collection methods — censuses, sample surveys, experiments, observational studies.',
              'Identify sources of data bias.',
              'Apply statistical sampling techniques: simple random, stratified, systematic and cluster.'],
  sections=[
   ('The hook','Ask ten customers, or all four hundred?','Sampling, before the vocabulary',
    ['Widget: sample XY Coffee\'s customer base at different sizes and watch the estimate steady — and then watch a biased sample stay wrong however large it gets.'],'Hook'),
   ('The four words','Population · sample · parameter · statistic','And descriptive vs inferential',
    ['The distinction stated once, precisely, then drilled — it hides inside every exam question in the block.',
     'Classify (6 rows): which is which, on real XY Coffee quantities.'],'Words'),
   ('Classifying data','Type and level of measurement','Qualitative vs quantitative · nominal, ordinal, interval, ratio',
    ['Discrete vs continuous, and why it matters: the level of measurement decides which summary is even legal.',
     'Classify (8 rows): customer data from the app, each placed at its level.'],'Classify'),
   ('Collecting it','Census, survey, experiment, observation','And why we sample at all',
    ['Cost, time and destructiveness as the three reasons. Survey methodology, question wording, and non-response.'],'Collect'),
   ('Sampling methods','Four ways to choose','Simple random · systematic · stratified · cluster',
    ['Widget: the same customer base sampled four ways, side by side, with the strengths and failure modes of each.'],'Sample'),
   ('Bias','Size cures luck; only design cures bias','Sampling error vs non-sampling error',
    ['Selection bias and response bias, each with a XY Coffee example that looks perfectly reasonable until it does not.',
     'Data quality: missing values, errors, and "garbage in, garbage out".'],'Bias'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['The four words, levels of measurement, choosing a sampling method, and spotting a bias.'],'Quiz')],
  slides=['Quantitative Methods I · Session #11 — Data foundations and sampling','The data half begins','Poll: ask ten customers, or all four hundred?','Goal of business statistics','Population vs sample','Parameter vs statistic','Descriptive vs inferential','Data classification: qualitative and quantitative','Discrete and continuous','Levels of measurement: nominal, ordinal, interval, ratio','Why the level decides the summary','Collecting data: census, survey, experiment, observation','Why we sample','Simple random sampling','Systematic sampling','Stratified sampling','Cluster sampling','Sampling error vs non-sampling error','Selection bias and response bias','Garbage in, garbage out','Part 2 · exercises','Takeaways · homework · Week 12'],
  ex=[('The four words',10,'six quantities, labelled'),
      ('Levels of measurement',12,'eight app fields, classified with a reason'),
      ('Choose a sampling method',14,'three business situations, one method each, justified'),
      ('Draw a stratified sample',14,'proportional allocation across three cafés'),
      ('Spot the bias',12,'four survey designs, each with one fatal flaw'),
      ('Sampling error or not?',10,'six problems, sorted into the two kinds')],
  tools=[]),

 dict(n=12,slug='Describing data with graphs, charts and tables',emoji='📊',
  title='Show it — <em>without lying</em>',
  sub='Frequency distributions, histograms and ogives, and the principles that separate a chart that informs from one that misleads. The Week 1 rules about axes and chart types come back here in full.',
  ch='Frequency distributions · histograms · charts · visual honesty',
  reads=[('Kosara, "The Science of What We Do (and Don’t) Know About Data Visualization" (HBR, 2013) — on Cyberlearn','#')],
  objectives=['Construct and interpret frequency distribution tables.',
              'Calculate continuous class parameters using the dataset range.',
              'Construct and interpret histograms and ogives.',
              'Select appropriate visualization techniques and visualize data clearly.',
              'Identify fraudulent visualization.',
              'Learn how to avoid cluttering.'],
  sections=[
   ('The hook','Two charts, same numbers','One of them is lying',
    ['Side by side: the same monthly sales, one with a truncated axis. Which would you show the board?'],'Hook'),
   ('Frequency distributions','Counting into classes','Discrete and continuous data',
    ['Class width from the range, number of classes, and boundaries that leave no gaps and no overlaps.',
     'Widget: drag the class width and watch the table and the histogram change together.'],'Tables'),
   ('Histograms and ogives','The picture of a distribution','Cumulative frequency, and what it answers',
    ['The ogive read as "what share of days sold fewer than N cups?" — a question the histogram cannot answer directly.'],'Draw'),
   ('Choosing the chart','Bar, pie, line, scatter','Each answers a different question',
    ['A decision table: what you are showing → which chart. Time series, composition, distribution, relationship.',
     'Classify (6 rows): the right chart for six business questions.'],'Choose'),
   ('How charts mislead','Truncated axes, wrong types, clutter','Graphical presentation standards',
    ['Real examples rebuilt honestly, side by side with the misleading original.',
     'The four rules from Week 1, restated and now examinable.'],'Honest'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Build a frequency table, read a histogram and an ogive, choose a chart, and spot two lies.'],'Quiz')],
  slides=['Quantitative Methods I · Session #12 — Describing data with graphs','Poll: two charts, same numbers','Frequency distributions for discrete data','Classes for continuous data','Class width from the range','Boundaries: no gaps, no overlaps','Relative and cumulative frequency','Histograms','Ogives, and what they answer','Bar charts and pie charts','Line charts and time series','Scatterplots','Choosing the right chart','Graphical presentation standards','Truncated axes','Clutter, and what it hides','Fraudulent visualization','Part 2 · exercises','Takeaways · homework · Week 13'],
  ex=[('Build a frequency table',14,'daily cup sales into classes, with the width justified'),
      ('Draw the histogram',12,'from your own table'),
      ('Read an ogive',12,'three cumulative questions'),
      ('Choose the chart',10,'six business questions, six chart types'),
      ('Find the lie',14,'four charts, each with one flaw, rebuilt honestly'),
      ('Declutter',10,'one bad chart, stripped back to what it is for')],
  tools=[]),

 dict(n=13,slug='Describing data with numerical measures',emoji='📏',
  title='One number for the middle, one for the <em>spread</em>',
  sub='Mean, median and mode; quartiles, IQR and boxplots; variance, standard deviation and the coefficient of variation; the Empirical Rule and z-scores; and the correlation coefficient. The week where "the average" stops being a single word.',
  ch='Central tendency · location · variation · z-scores · correlation',
  reads=[('Nambiar, "Estimates of Location" and "Estimates of Variability" (Medium, 2024) — on Cyberlearn','#')],
  objectives=['Compute and evaluate measures of central tendency, and choose the right central measure for the situation.',
              'Calculate location measures: percentiles, quartiles, and the interquartile range.',
              'Quantify variability and spread, and interpret spread as consistency and risk.',
              'Apply the Empirical Rule and z-scores.',
              'Quantify the relationship between two variables using correlation.'],
  sections=[
   ('The hook','The average customer does not exist','Same mean, two different businesses',
    ['Two cafés with identical mean daily takings and completely different risk. Spread is the second number, and it is not optional.'],'Hook'),
   ('Centre','Mean, median, mode','And which one an outlier destroys',
    ['Widget: drag one value out to an extreme and watch the mean move while the median does not.',
     'Skewness read off the gap between mean and median.'],'Centre'),
   ('Location','Percentiles, quartiles, IQR','And the boxplot',
    ['Quartiles by hand, the five-number summary, and the 1.5×IQR fence for outliers.'],'Location'),
   ('Variation','Range, variance, standard deviation','n or n − 1, and why it matters',
    ['Built step by step from squared deviations — the same construction as the statistics course, because it is the only honest one.',
     'The coefficient of variation, for comparing spreads across different units.'],'Spread'),
   ('The Empirical Rule and z-scores','Two numbers, any probability','68–95–99.7',
    ['A value read as "so many standard deviations from the middle", and the share of the data beyond it.'],'Z'),
   ('Correlation','Do the two move together?','r, and what it does not mean',
    ['Widget: drag a scatterplot and watch r change; the four classic pictures that share the same r.',
     'Correlation is not causation, said once with a real XY Coffee example where it would have cost money.'],'Correlate'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Centre, quartiles, standard deviation with the right divisor, a z-score, and reading r.'],'Quiz')],
  slides=['Quantitative Methods I · Session #13 — Numerical measures','Poll: same mean, two businesses','Mean, median, mode','What an outlier does to each','Skewness from the mean–median gap','Percentiles and quartiles','The interquartile range','Boxplots and the five-number summary','Range','Variance, built from squares','Standard deviation','n or n − 1?','The coefficient of variation','The Empirical Rule: 68–95–99.7','z-scores','Correlation coefficient','Four scatterplots, one r','Correlation is not causation','Part 2 · exercises','Takeaways · homework · Week 14'],
  ex=[('Centre, three ways',12,'mean, median and mode, then an outlier added'),
      ('Quartiles and IQR',14,'by hand, then the boxplot'),
      ('Variance and SD',15,'sum of squared deviations, both divisors, both answers'),
      ('Coefficient of variation',10,'compare two quantities in different units'),
      ('Empirical Rule',12,'three bands, three shares'),
      ('z-scores',10,'two values, standardised and interpreted'),
      ('Correlation',14,'compute r, then say what it does and does not license')],
  tools=[]),

 dict(n=14,slug='Bivariate data, independence and concentration',emoji='🔗',
  title='Two columns, and <em>how concentrated a market is</em>',
  sub='Contingency tables and the test for independence; then the concentration indicators a competition authority actually uses — the Lorenz curve, the Gini index and the Herfindahl index. The last new material of the fall semester.',
  ch='Contingency tables · chi-square · Gini · Herfindahl',
  reads=[('Walsh, "Algorithms Are Making Economic Inequality Worse" (HBR, 2020) — on Cyberlearn','#')],
  objectives=['Construct and interpret contingency tables.',
              'Assess independence between categorical variables.',
              'Construct and interpret the Lorenz curve and the Gini index.',
              'Compute and apply the Herfindahl index.'],
  sections=[
   ('The hook','Do our subscribers differ by neighbourhood?','A two-way table, and a question about it',
    ['The table is easy to build and easy to over-read. The week is about what it does and does not license.'],'Hook'),
   ('Contingency tables','Joint, marginal and conditional','Reading a two-way table properly',
    ['Widget: click any cell and see the joint, marginal and conditional distributions it belongs to.'],'Tables'),
   ('Independence','What the table would look like if nothing were going on','Expected counts',
    ['Expected = row total × column total ÷ grand total, and why that formula IS the definition of independence.'],'Independent'),
   ('Chi-square and Cramér\'s V','Measuring the gap','The statistic, and its size',
    ['χ² built cell by cell from (observed − expected)²/expected, then Cramér\'s V to turn it into a comparable number.'],'ChiSq'),
   ('Inequality','Lorenz and Gini','How unevenly is something shared?',
    ['Built on XY Coffee\'s wholesale customers: what share of revenue comes from the top 20%?',
     'The Gini index as twice the area between the Lorenz curve and the diagonal — the integral of Week 10, put to work.'],'Gini'),
   ('Concentration','The Herfindahl index','Market competition and portfolio concentration',
    ['HHI computed for a market, and the thresholds competition authorities actually use.',
     'The same index applied to a customer portfolio: how exposed is XY Coffee to losing one account?'],'HHI'),
   ('Review quiz','Prove it to yourself','Twelve questions · not graded',
    ['Conditional distributions, expected counts, a χ² cell, reading a Lorenz curve, and computing an HHI.'],'Quiz')],
  slides=['Quantitative Methods I · Session #14 — Bivariate data and concentration','Poll: do subscribers differ by neighbourhood?','Contingency tables','Joint distributions','Marginal distributions','Conditional distributions','What independence would look like','Expected counts','The chi-square statistic, cell by cell','Cramér\'s V','Inequality: the Lorenz curve','The Gini index as an area','Gini on our wholesale customers','The Herfindahl index','HHI thresholds in competition policy','HHI on a customer portfolio','Part 2 · exercises','Takeaways · Week 15 is review'],
  ex=[('Read a contingency table',12,'joint, marginal and conditional from one table'),
      ('Expected counts',12,'build the whole expected table'),
      ('Chi-square by hand',15,'four cells, then the statistic'),
      ('Cramér\'s V',10,'and what its size means'),
      ('Lorenz and Gini',15,'plot it, then compute the index'),
      ('Herfindahl',12,'two markets, and which one a regulator would look at')],
  tools=[]),

 dict(n=15,slug='Review — no new material',emoji='🔁',
  title='The whole semester, worked as <em>exam questions</em>',
  sub='No new material. The session is Weeks 1 to 14 re-encountered as the exam will ask them — and the blank test, taken at home, is corrected here.',
  ch='Review · the blank test corrected',
  reads=[('The blank test — on Cyberlearn, to take at home before this session','#')],
  objectives=['Re-encounter every topic of the semester in the form the exam uses.',
              'Find, from the blank test, exactly what your two hand-written sheets are still missing.',
              'Practise the timing: 120 minutes, closed book, open questions.'],
  sections=[
   ('How the exam is built','Format, timing and what you may bring','120 min · closed book · open questions',
    ['One authorised calculator — Casio FX-82 Solar or TI-30 eco RS — and two sheets recto/verso, hand-written or typed.',
     'Both are checked during the exam.'],'Exam'),
   ('The blank test, corrected','Taken at home, corrected in class','Informative, never graded',
    ['Question by question, with the common wrong turns named rather than skipped.'],'Correct'),
   ('The calculus block, in questions','Weeks 1–10','Functions → derivatives → optimisation → integration',
    ['One question per week, each in the exam\'s own style.'],'Calculus'),
   ('The data block, in questions','Weeks 11–14','Sampling → charts → measures → bivariate',
    ['One question per week, same treatment.'],'Data'),
   ('Your two sheets','What belongs on them, and what does not','A workshop, not a lecture',
    ['A structure that has worked: formulas you cannot re-derive under time pressure, worked archetypes, and the traps you personally fall into. Not definitions you already know.'],'Sheets'),
   ('Review quiz','The whole semester, mixed','Twenty questions · not graded',
    ['Unlabelled and shuffled, because the exam will not tell you which week a question comes from either.'],'Quiz')],
  slides=['Quantitative Methods I · Session #15 — Review','No new material','How the fall exam is built','What you may bring','The blank test, corrected','Weeks 1–3 in one question each','Weeks 4–5: the derivative','Weeks 7–8: applications and optimisation','Weeks 9–10: integration and surpluses','Week 11: sampling','Week 12: charts','Week 13: numerical measures','Week 14: bivariate and concentration','Your two sheets: what belongs on them','Timing: 120 minutes, and how to spend them','Good luck'],
  ex=[],
  tools=[]),

 dict(n=16,slug='Fall semester exam',emoji='🎓',
  title='Fall semester <em>exam</em>',
  sub='Weeks 16–17. <b>120 minutes, closed book, open questions</b>, worth <b>40%</b> of the module. The only authorised material is one calculator from the approved list and a personal summary of two sheets recto/verso. Computers, smartphones and any other communication device are forbidden, and both the calculator and the sheets are checked during the exam.',
  ch='120 min · closed book · open questions · 40%',
  reads=[('The exam timetable — on Cyberlearn','#')],
  objectives=['Demonstrate everything from Fall Weeks 1 to 14, including the self-study week.'],
  sections=[
   ('What to bring','Two things, and they are checked','Calculator and two sheets',
    ['A <b>Casio FX-82 Solar</b> or a <b>Texas Instruments TI-30 eco RS</b> — no other model.',
     'A personal summary of <b>two sheets recto/verso</b>, hand-written or typed.',
     'Attendance at the exam is mandatory.'],'Bring'),
   ('What is covered','Weeks 1–14','Including the self-study week',
    ['The whole fall semester. The self-study week\'s case-study material is explicitly included.'],'Scope')],
  slides=['Quantitative Methods I · Fall semester exam','120 minutes · closed book · open questions','What you may bring','What is covered','Good luck'],
  ex=[],
  tools=[]),
]

def esc(s): return html.escape(s,quote=True)

def page(w):
  n=w['n']; sections=w['sections']
  exl=w.get('ex') or []
  exmins=sum(m for _,m,_ in exl)
  _secs=[dict(id='s%d'%(i+1),num='%d.%d'%(n,i+1),name=s[1],tag=s[2],badge=s[4],part=1) for i,s in enumerate(sections)]
  if exl:
    # Part 2 sits immediately before the review quiz, as it does in Week 1
    _secs.insert(len(sections)-1,
      dict(id='ex',num='%d.X'%n,name='Exercises — worked together',
           tag='%d exercises · ~%d min · solutions released in class'%(len(exl),exmins),
           badge='Part 2',part=2))
    for j,x in enumerate(_secs): x['num']='%d.%d'%(n,j+1)
  # the review quiz belongs to Part 2 of the session
  for x in _secs:
    if x['badge']=='Quiz': x['part']=2
  secs_js=json.dumps(_secs,ensure_ascii=False)
  slides_js=json.dumps([dict(cls=('dk' if i==0 else None),
                             k=('HEG Genève · Quantitative Methods I' if i==0 else 'Fall Week %d · slide %d'%(n,i+1)),t=t,
                             b=('<p style="font-size:1.15em"><b>Fall Week %d · %s</b></p><p>Haute école de gestion de Genève · 2026/2027</p><div class="onproj"><b>Outline deck →</b> this week\'s slides are an outline. Each title becomes a full slide, with the algebra on the left and what it means for XY Coffee on the right, when the week is written.</div>'%(n,w['slug']) if i==0 else '<ul><li>Outline slide — content to write.</li><li>Kicker, body and an <b>On the coffee →</b> callout follow the Week 1 pattern.</li></ul>'),
                             logo=(True if i==0 else None),n='Outline — speaker notes to write.') for i,t in enumerate(w['slides'])],ensure_ascii=False)
  reads=''.join('<div class="mi" data-read="r%d"><span class="box">✓</span><span>%s</span></div>'
                %(i+1,(('<a href="%s" target="_blank" rel="noopener">%s ↗</a>'%(esc(u),esc(t))) if u.startswith('http') else esc(t)))
                for i,(t,u) in enumerate(w['reads']))
  objs=''.join('<li>%s</li>'%o for o in w['objectives'])
  tools=''.join('<a href="%s">%s</a>'%(esc(h),esc(t)) for h,t in w['tools'])
  screens=[]
  for i,(kick,name,tag,plan,badge) in enumerate(sections):
    sid='s%d'%(i+1); prev='s%d'%i if i>0 else None; nxt='s%d'%(i+2) if i<len(sections)-1 else None
    plan_html=''.join('<li>%s</li>'%p for p in plan)
    lab='problem' if badge=='Hook' else ('play' if badge in ('Quiz','Exam','Correct','Sheets') else 'idea')
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
    <div class="case-note"><b>Status →</b> this section is an outline. When the week is written it becomes an interactive screen on the Week 1 pattern: an earned completion, a lab or classify exercise where one is listed, and its own share of the progress bar.</div>
  </div>
  %s
</section>'''%(n,i+1,sid,i+1,n,i+1,kick,name,lab,badge,tag,plan_html,nav))
  ex_rows=''.join('<li><b>Exercise %d · %s</b> &nbsp;<span class="exm">%d min</span><br><span style="color:var(--grey)">%s</span></li>'
                  %(j+1,html.escape(t),mn,html.escape(wht)) for j,(t,mn,wht) in enumerate(exl))
  ex_screen=('''
<!-- ==================== PART 2 · EXERCISES (outline) ==================== -->
<section class="screen" id="ex" data-num="99">
  <button class="crumb" data-home>&larr; Week menu</button>
  <div class="sec-head"><div class="kicker">Part 2 &middot; Exercises</div><h2>%d exercises, worked together</h2></div>
  <div class="card">
    <span class="label play">Planned &middot; ~%d min</span>
    <h3>The second half of the session</h3>
    <p class="lead">When this week is written, each exercise below becomes a <em>form on this page</em> and a <em>slide in the deck</em>, generated from one array so the two can never disagree &mdash; and its solution opens when the instructor reveals it in class. Same engine as Week 1 (<code>exercises.js</code>).</p>
    <ul class="plan-list">%s</ul>
    <div class="case-note"><b>Status &rarr;</b> outline only. Nothing here is interactive or counted yet.</div>
  </div>
  <div class="nav-foot"><button class="btn ghost" data-home>Menu</button><a class="btn" href="index.html" style="text-decoration:none;display:inline-block;">Course page &rarr;</a></div>
</section>''' % (len(exl), exmins, ex_rows)) if exl else ''
  return '''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<base href="/HEG/quantitative-methods/">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Fall Week %d · %s · Quantitative Methods I · HEG</title>
<meta name="description" content="Quantitative Methods I, Fall Week %d — %s (%s). In preparation: objectives, planned sections and the lecture outline.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#002C46">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>%s</text></svg>">
<link rel="stylesheet" href="/shared/themes/heg.css">
<link rel="stylesheet" href="quant.css">
</head>
<body data-course="qm1">
<!-- GENERATED by _build/scaffold.py — edit the SPEC there, not this file.
     Delete this week's SPEC entry once the page is written by hand. -->

<div class="topbar">
  <div class="topbar-inner">
    <img class="brand" src="logo_heg-ge.svg" alt="HEG Genève">
    <span class="course">QUANTITATIVE METHODS I · FALL WEEK %d</span>
    <span class="tb-spacer"></span>
    <a class="home" href="index.html">← Course</a>
    <button class="lect-btn" id="lectOpen" title="The slide outline for this week">▶ Lecture</button>
  </div>
  <div class="topbar-bars">
    <div class="tbar"><span class="tbl">This week</span><div class="tk"><div class="tf" id="progFill" style="width:0"></div></div><span class="tp" id="progPct">—</span></div>
    <div class="tbar"><span class="tbl">The year</span><div class="cbar" id="courseBar"></div><span class="tp" id="coursePct">0%%</span></div>
  </div>
</div>
<div class="draft-banner">🔧 <b>Fall Week %d is in preparation.</b> What follows is the plan for the 3-hour session — objectives, the Part 1 sections, the Part 2 exercise outline and the slide outline. Nothing here is counted yet.</div>

<div class="wrap">

<section class="screen active" id="home">
  <div class="hero">
    <div class="eyebrow">Fall Week %d · Quantitative Methods I · HEG Genève</div>
    <h1>%s</h1>
    <p class="sub">%s</p>
    <div class="liveinfo">
      <span class="li">🏫 In class: <b>3 h</b> · lesson, then exercises</span>
      <span class="li">📖 <b>%s</b></span>
      <span class="li">▶ The <b>Lecture</b> button shows the slide outline</span>
    </div>
  </div>

  <div class="objectives">
    <h4>By the end of Fall Week %d you will be able to</h4>
    <ul>%s</ul>
  </div>

  <div class="materials">
    <h4>Resources</h4>
    %s
    <div class="note" style="font-size:12.5px;color:var(--grey);margin-top:8px;font-style:italic;">Homework for this week is written with the week itself, on the Week 1 pattern: the printed problem sheet, with hints and full worked solutions. Neither the homework nor the review quiz is graded.</div>
  </div>

  <div class="section-list" id="sectionList"></div>

  %s

  <div class="foot">
    <a class="backlink" href="index.html">← Course page</a>
  </div>
</section>
%s
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
    <span class="lf-t">Quantitative Methods I · Fall Week %d · %s · outline · HEG Genève</span>
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
  var part=0;
  SECTIONS.forEach(function(s){
    if(s.part!==part){
      part=s.part;
      var h=document.createElement('div');h.className='part-head';
      h.innerHTML=part===1?'<span class="pt">Part 1 · the lesson</span><span class="pd">~1 h 15 · presented from the deck, followed here</span>'
                          :'<span class="pt">Part 2 · exercises and review</span><span class="pd">the rest of the session · worked together</span>';
      list.appendChild(h);
    }
    var c=document.createElement('div');c.className='section-card'+(s.part===2?' part2':'');
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
  document.getElementById('printDeck').innerHTML=SLIDES.map(function(s,i){return '<div class="p-slide'+(s.cls?' '+s.cls:'')+'">'+slideHTML(s)+'<span class="pnum">Quantitative Methods I · Fall Week %d · outline · '+(i+1)+'/'+SLIDES.length+'</span></div>';}).join('');
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
'''%(n,w['slug'],n,w['slug'],w['ch'],w['emoji'],n,n,n,w['title'],w['sub'],esc(w['ch']),n,objs,reads,
     ('<div class="card" style="margin-top:22px;"><span class="label play">Tools for this week</span><div class="tool-links">%s</div></div>'%tools if tools else ''),
     ''.join(screens),ex_screen,n,w['slug'],secs_js,slides_js,n)

if __name__=='__main__':
  for w in SPEC:
    p=os.path.join(ROOT,'week%d.html'%w['n'])
    open(p,'w',encoding='utf-8').write(page(w))
    print('wrote week%d.html · %s · %d sections · %d slides · %d exercises'
          %(w['n'],w['slug'],len(w['sections']),len(w['slides']),len(w.get('ex') or [])))
