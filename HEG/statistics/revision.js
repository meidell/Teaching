/* =====================================================================
   APPLIED STATISTICS · THE REVISION GAME — the question bank of the
   Kahoot-style game (25 Nov 2026, Jan Erik: "build a kahoot … just the
   same structure as yesterday's in FL III", "of all weeks until 9 - make
   it not too difficult. 30 secs", "30 questions"). A copy of
   Kalaidos/fl3/revision.js's shape.
   Thirty questions on Weeks 1–9, in two tiers (lvl 1 easy, lvl 2 medium),
   fifteen of each, in week order inside each tier; 30 s for every question.
   Numbers are the course's own where it has them (the tea shop, the
   pizzerias, the four-observation printout); every computed answer was
   checked in Python.
   Shared by revision.html (the players) and revision-tv.html (the screen).
   The answers are in this public file, like every quiz of the course: the
   game is played live and the screen reveals them anyway.
   Points: right answer → 500 + 500 × (time left ÷ time); wrong or none → 0.
   ===================================================================== */
window.REV_BANK=[
  /* ---- tier 1 · easy ---- */
  {s:1,lvl:1,q:'You ask 40 of Geneva’s 300 pizzerias for their price. What are the 40?',opts:['The population','A sample','A parameter','A variable'],a:1,w:'The population is all 300 pizzerias. The 40 you actually measure are a sample of it.'},
  {s:1,lvl:1,q:'“The price of a Margherita in CHF” is what type of variable?',opts:['Qualitative (a category)','Quantitative (a number you can average)','A sample','A parameter'],a:1,w:'A price is a number that can be added and averaged, so it is a quantitative variable. “Neighbourhood” would be qualitative.'},
  {s:2,lvl:1,q:'What is the mean of 2, 4, 6, 8 and 10?',opts:['5','6','8','30'],a:1,w:'Mean = sum ÷ count = 30 ÷ 5 = 6.'},
  {s:2,lvl:1,q:'What is the median of 3, 7, 8, 12 and 40?',opts:['8','14','12','7'],a:0,w:'Put the values in order and take the middle one: 3, 7, 8, 12, 40. The middle (third) value is 8. The mean would be 14.'},
  {s:2,lvl:1,q:'One pizzeria charges CHF 40 while the others charge about CHF 20. Which measure does that one price move the most?',opts:['The median','The mean','The mode','None of them'],a:1,w:'The mean uses every value, so one extreme value pulls it. The median only looks at the middle of the ordered list.'},
  {s:3,lvl:1,q:'The probability that a customer orders a dessert is 0.3. What is the probability that they do not?',opts:['0.3','0.7','1.3','0'],a:1,w:'P(not A) = 1 − P(A) = 1 − 0.3 = 0.7.'},
  {s:3,lvl:1,q:'Binomial: 10 customers, each orders a dessert with probability 0.3. How many desserts do you expect?',opts:['0.3','3','7','10'],a:1,w:'The mean of a binomial is n × p = 10 × 0.3 = 3.'},
  {s:4,lvl:1,q:'For a normal distribution, about what share of the values lies within 2 standard deviations of the mean?',opts:['50 %','68 %','95 %','99.7 %'],a:2,w:'The empirical rule: about 68 % within 1 standard deviation, 95 % within 2, 99.7 % within 3.'},
  {s:4,lvl:1,q:'Mean 100, standard deviation 10. What is the z-score of 115?',opts:['1.5','15','0.15','11.5'],a:0,w:'z = (x − µ) ÷ σ = (115 − 100) ÷ 10 = 1.5: 115 is one and a half standard deviations above the mean.'},
  {s:5,lvl:1,q:'You take larger and larger samples. What happens to the standard error of the sample mean?',opts:['It grows','It gets smaller','It stays the same','It becomes negative'],a:1,w:'Standard error = σ ÷ √n. A larger n divides by a larger number, so sample means vary less around µ.'},
  {s:6,lvl:1,q:'What does “a 95 % confidence interval” mean?',opts:['95 % of the data lie inside it','The method catches the true mean in 95 % of samples','The sample mean is 95 % correct','There is a 5 % chance the data are wrong'],a:1,w:'The 95 % describes the method: built from many samples, 95 % of such intervals would contain the true population mean.'},
  {s:7,lvl:1,q:'A test gives a p-value of 0.03. The level is α = 0.05. What do you do?',opts:['Reject H₀','Do not reject H₀','Accept H₀','Collect no more data'],a:0,w:'0.03 < 0.05, so reject H₀: the data are unlikely if H₀ were true.'},
  {s:7,lvl:1,q:'What is a Type I error?',opts:['Not rejecting a false H₀','Rejecting a true H₀','A wrong calculation','Taking too small a sample'],a:1,w:'A Type I error is a false alarm: H₀ is true and you reject it. Its probability is α.'},
  {s:8,lvl:1,q:'You record the price of the SAME 12 pizzerias in 2025 and again in 2026. What kind of samples are these?',opts:['Two independent samples','Paired samples','One sample of 24','A population'],a:1,w:'Each 2025 price has its partner: the same pizzeria in 2026. Analyse the 12 differences: a paired test.'},
  {s:9,lvl:1,q:'A regression’s R Square is 0.968. What does it say?',opts:['The x explains 96.8 % of the differences in y','96.8 % of the points lie on the line','The slope is 0.968','The prediction is 96.8 % sure'],a:0,w:'R Square = SS Regression ÷ SS Total: the share of the variation of y the x explains, from 0 to 1.'},

  /* ---- tier 2 · medium ---- */
  {s:2,lvl:2,q:'What is the sample variance of 2, 4 and 6?',opts:['2','2.67','4','8'],a:2,w:'Mean 4. Squared distances 4 + 0 + 4 = 8. Sample variance = 8 ÷ (n − 1) = 8 ÷ 2 = 4. (2.67 divides by n, which is the population formula.)'},
  {s:2,lvl:2,q:'Prices have mean CHF 20 and standard deviation CHF 2. A pizzeria charges CHF 24. Where does it stand?',opts:['2 standard deviations above the mean','4 standard deviations above the mean','At the median','1 standard deviation above the mean'],a:0,w:'z = (24 − 20) ÷ 2 = 2: two standard deviations above the mean.'},
  {s:3,lvl:2,q:'Two independent events: P(A) = 0.5 and P(B) = 0.4. What is P(A and B)?',opts:['0.9','0.2','0.1','0.45'],a:1,w:'For independent events, P(A and B) = P(A) × P(B) = 0.5 × 0.4 = 0.2.'},
  {s:3,lvl:2,q:'Binomial, n = 4, p = 0.5. What is the probability that all 4 are successes?',opts:['0.5','0.25','0.125','0.0625'],a:3,w:'P(X = 4) = 0.5⁴ = 0.0625.'},
  {s:4,lvl:2,q:'Standard normal Z. What is P(Z > 1.96)?',opts:['0.05','0.025','0.975','0.0196'],a:1,w:'1.96 cuts off 2.5 % in the right tail: P(Z > 1.96) = 0.025. Both tails together are 5 %.'},
  {s:5,lvl:2,q:'Population standard deviation σ = 12, sample size n = 36. What is the standard error of the sample mean?',opts:['12','2','0.33','6'],a:1,w:'σ ÷ √n = 12 ÷ √36 = 12 ÷ 6 = 2.'},
  {s:5,lvl:2,q:'The population is NOT normal. When is the sample mean still roughly normal?',opts:['Never','When the sample is large (n ≥ 30)','Only when n = 1','Only when σ is known'],a:1,w:'The Central Limit Theorem: for a large sample (the rule of thumb is n ≥ 30) the sample mean is approximately normal, whatever the shape of the population.'},
  {s:6,lvl:2,q:'Sample mean CHF 20, margin of error CHF 1.50. What is the confidence interval?',opts:['CHF 18.50 to 21.50','CHF 19.25 to 20.75','CHF 20 to 21.50','CHF 17 to 23'],a:0,w:'x̄ ± E = 20 ± 1.50 → CHF 18.50 to 21.50.'},
  {s:6,lvl:2,q:'You want to halve the margin of error. How must the sample size change?',opts:['Double it','Multiply it by 4','Halve it','Add 30'],a:1,w:'E = z × σ ÷ √n. To halve E, √n must double, so n must be multiplied by 4.'},
  {s:7,lvl:2,q:'H₀: µ = 20 and Hₐ: µ > 20. What kind of test is this?',opts:['Left-tailed','Right-tailed','Two-tailed','Paired'],a:1,w:'Hₐ points to values above 20, so the rejection region is in the right tail.'},
  {s:7,lvl:2,q:'H₀: µ = 20, σ = 4, n = 16, sample mean 21. What is the test statistic z?',opts:['0.25','1','4','0.0625'],a:1,w:'z = (x̄ − µ₀) ÷ (σ ÷ √n) = (21 − 20) ÷ (4 ÷ 4) = 1.'},
  {s:8,lvl:2,q:'Two independent samples. The standard error of the first mean is 3, of the second 4. What is the standard error of the difference?',opts:['7','1','5','12'],a:2,w:'Variances add, not standard errors: √(3² + 4²) = √25 = 5.'},
  {s:9,lvl:2,q:'A week had 50 orders. The line predicted 47. What is the residual?',opts:['3','−3','97','47'],a:0,w:'Residual = y − ŷ = 50 − 47 = 3: the line missed that week by 3 orders, below the real value.'},
  {s:9,lvl:2,q:'The tea shop’s line is ŷ = 29.55 + 6.06x, with x = ad spend in CHF 100s. How many orders does it predict for CHF 500 of ads?',opts:['35.6','59.9','65.9','3 030'],a:1,w:'CHF 500 is x = 5: 29.55 + 6.06 × 5 = 59.85, about 59.9 orders. (65.9 uses x = 6; 3 030 uses x = 500.)'},
  {s:9,lvl:2,q:'The P-value of a slope is 0.3257. What do you conclude at the 5 % level?',opts:['The x has no effect on y','The data do not show that x matters','x lowers y','x matters, because 0.3257 > 0.05'],a:1,w:'0.3257 > 0.05: do not reject H₀. Not rejecting is not proof of no effect: the data are simply not enough to show one.'}
];
/* Spread the right answers over A–D (19 of 30 were B as written): each
   question's right option is swapped into a fixed position, the same on the
   screen and on every phone. */
(function(){var P=[2,0,3,1,1,3,0,2];window.REV_BANK.forEach(function(q,i){var to=P[i%8],o=q.opts,x=o[to];o[to]=o[q.a];o[q.a]=x;q.a=to;});})();
window.REV_TIME=function(q){return (q&&q.t)||30;};
window.REV_POINTS=function(q,ok,t){if(!ok)return 0;var T=window.REV_TIME(q)*1000;return 500+Math.round(500*Math.max(0,1-Math.min(t,T)/T));};
