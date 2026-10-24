#!/usr/bin/env python3
"""The presentation demo's fictional cohort → /demo/data.js (24 Oct 2026).

Twenty invented students on a copy of OMBAFR455, frozen on Tuesday
8 September 2026, 09:00 Geneva — the morning the final exam opens, two
days after the Apple note was due. Everything the demo dashboard and the
room screen show comes from here: module progress, time on page, the
real quiz questions with each student's picks, weekly feedback (four
ratings + two sentences), message threads, hand-ins.

Deterministic (seeded), so a re-run gives the same cohort. Nobody in it
is real: names are invented combinations, and the free-text comments
were written for the demo. Re-run:   python3 demo/_build/make-data.py
"""
import json, random, os, re, datetime as dt
random.seed(455)
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); WEB=os.path.dirname(ROOT)

# ---- the course's own questions and sections, read from the demo copy ----
def extract(w):
    s=open(os.path.join(ROOT,'course','week%d.html'%w),encoding='utf-8').read()
    m=re.search(r'const QUIZ\s*=\s*\[(.*?)\n\s*\];',s,re.S); qs=[]
    for qm in re.finditer(r"\{q:'((?:[^'\\]|\\.)*)',\s*opts:\[(.*?)\],a:(\d)",m.group(1),re.S):
        opts=[o.replace("\\'","'") for o in re.findall(r"'((?:[^'\\]|\\.)*)'",qm.group(2))]
        qs.append({'q':qm.group(1).replace("\\'","'"),'opts':opts,'a':int(qm.group(3))})
    secs=[[i,re.sub('<[^>]+>','',h).replace('&amp;','&').strip()] for i,h in re.findall(r'<section[^>]*id="(s\d)"[^>]*>.*?<h2[^>]*>(.*?)</h2>',s,re.S)]
    return qs,secs
QUIZ={}; SECS={}
for w in range(1,9): QUIZ[w],SECS[w]=extract(w)

CET=dt.timezone(dt.timedelta(hours=2))
def ms(y,m,d,h=9,mi=0): return int(dt.datetime(y,m,d,h,mi,tzinfo=CET).timestamp()*1000)
NOW=ms(2026,9,8,9,0)
W0=ms(2026,7,6,0,0); DAY=86400000
WEEKS=[(1,'6–12 Jul','Introduction to Sustainable Investing'),(2,'13–19 Jul','Building a Sustainable Financial System'),(3,'20–26 Jul','Regulatory & Policy Environment'),(4,'27 Jul – 2 Aug','Risk Management & Measurement'),(5,'3–9 Aug','The Sustainable Debt Market'),(6,'10–16 Aug','The Sustainable Equity Market'),(7,'17–23 Aug','Sustainable Derivatives & Impact Investing'),(8,'24–30 Aug','Carbon, Biodiversity Credits & Crowdfunding')]
HW={1:24,2:22,3:22,4:22,5:22,6:21,7:22,8:22}
MODULES=[]
for n,_,_ in WEEKS:
    MODULES.append({'id':'w%d'%n,'label':'W%d · Lesson'%n,'total':6,'week':n,'kind':'lesson'})
    if n==6: MODULES.append({'id':'w6-quiz','label':'W6 · Timed quiz','total':18,'week':6,'kind':'quiz'})
    MODULES.append({'id':'w%d-hw'%n,'label':'W%d · Homework'%n,'total':HW[n],'week':n,'kind':'hw'})

# ---- twenty invented students; the type decides how the term went ----
PEOPLE=[('Amara Okonkwo','Nigeria','Lagos','strong'),('Lukas Brändli','Switzerland','Zurich','steady'),('Priya Raghunathan','India','Bengaluru','strong'),
 ('Mateo Villarreal','Colombia','Bogotá','steady'),('Chen Wei-Lin','Taiwan','Taipei','strong'),('Sofia Papadimitriou','Greece','Athens','late'),
 ('Daniel Achterberg','Netherlands','Rotterdam','steady'),('Nadia El-Fassi','Morocco','Casablanca','steady'),('Tomás Ferreira','Portugal','Lisbon','weak'),
 ('Ayşe Demirkan','Türkiye','Istanbul','quiet'),('Kwame Asante','Ghana','Accra','late'),('Elena Vasquez','Spain','Madrid','strong'),
 ('Hiroshi Tanabe','Japan','Osaka','steady'),('Ingrid Solheim','Norway','Bergen','steady'),('Rahul Mehrotra','UAE','Dubai','quiet'),
 ('Camille Lefèvre','France','Lyon','strong'),('Olusegun Adeyemi','Nigeria','Abuja','never'),('Mei-Ling Chau','Singapore','Singapore','steady'),
 ('Jonas Lindqvist','Sweden','Stockholm','quiet'),('Fatima Benali','Tunisia','Tunis','never')]
def slug(n):
    import unicodedata
    s=unicodedata.normalize('NFKD',n).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')

# ability → quiz accuracy; difficulty per question (a few deliberately hard ones)
ABIL={'strong':0.92,'steady':0.78,'late':0.72,'weak':0.55,'quiet':0.74,'never':0.5}
DIFF={w:[random.uniform(0.05,0.3) for _ in range(12)] for w in range(1,9)}
for w,i,d in [(3,6,0.55),(5,7,0.5),(6,9,0.42),(4,4,0.45),(2,10,0.4),(7,5,0.42),(8,3,0.38),(1,8,0.35)]: DIFF[w][i]=d

HELPED={1:['The spectrum-of-capital diagram — I finally see where my own pension fund sits.','The greenwashing test (what / how / receipts). I used it on a factsheet the same evening.','Having the Léman mandate from day one; it made the definitions concrete.','The short SSF video, then the lab right after it.'],
 2:['The flow-of-capital map in 2.3 — who moves the money was never explained to me like that.','The market-failures section. The externality example with the cement plant.','The EU Action Plan timeline; the dates stopped being a blur.'],
 3:['The Taxonomy eligible-vs-aligned lab. I had those backwards for a year.','Article 6 / 8 / 9 side by side with real fund names.','The Swiss section — I work in Geneva and did not know FINMA’s position.'],
 4:['The WACI lab. Doing the arithmetic by hand made the formula stick.','Financed emissions holding by holding — the 78% on Rhône Cement was a shock.','The TCFD → ISSB story in one page.'],
 5:['The Rhône Cement step-up calculation. Finally a number for “does the incentive have teeth”.','The greenium break-even — I had assumed the discount was much bigger.','The four-structure comparison table.'],
 6:['The divest-or-engage arithmetic: −24.6% reported vs −9.9% real. Best single idea of the course.','The escalation ladder with a real case on it.','The tracking-error section — the cost of a screen in numbers.'],
 7:['The total return swap example — same exposure, no vote. It reframed the whole week.','The virtual PPA walk-through from MWh to settlement.','Intention / measurement / contribution — a test I can apply to any impact claim.'],
 8:['Price per real tonne instead of price per credit. The 40% additionality example.','The cap-and-budget arithmetic — the compliance market finally made sense.','The crowdfunding section was short and honest about what it cannot do.']}
CHANGE={1:['Too many acronyms in one go — a glossary link in the text would help.','The market-size section drags; the number changes with the definition and that point is made three times.','Nothing — good start.','Audio for the readings would help on my commute.'],
 2:['Week 2 is more theory than labs. One more numeric exercise would balance it.','The actor map is hard to read on a phone.','Shorter videos.'],
 3:['Too much regulation in one week. Split the EU and the Swiss parts.','SFDR examples went by too fast.','The homework took me four hours, not two.'],
 4:['The scenario-analysis part is dense — more steps in the lab.','Scope 3 deserves its own section.','The pace picked up a lot after week 3.'],
 5:['Too much for one week, with the online test on top. The SLB and the greenium should be two weeks.','The ICMA section repeats the video.','I needed the test to be a week later.','More practice on the break-even calculation before the test.'],
 6:['Hard to say — maybe one more real fund factsheet to read.','The stewardship section could be shorter.','The timed quiz password was in an announcement I had not seen.'],
 7:['The derivative families all look alike on first reading — a one-line summary each would help.','Fewer families, more depth on the swap.','The impact section deserves more than two sections.'],
 8:['Biodiversity credits felt rushed at the end.','I wanted one full worked example of an offset decision, start to finish.','More time for the assignment this week.']}

def section_times(kind,total):
    return random.randint(600,1500)*total//6 if kind=='lesson' else random.randint(2400,7200)

students=[]
# each written comment is used at most once per week: a pool per week and key, shuffled, popped
POOL={n:{'helped':random.sample(HELPED[n],len(HELPED[n])),'change':random.sample(CHANGE[n],len(CHANGE[n]))} for n,_,_ in WEEKS}
def comment(n,key,p):
    if random.random()>p or not POOL[n][key]: return ''
    return POOL[n][key].pop()
for i,(name,country,city,typ) in enumerate(PEOPLE):
    sid=slug(name); joined=W0+random.randint(0,4)*DAY+random.randint(8,22)*3600000
    if typ=='late': joined=W0+random.randint(16,22)*DAY
    st={'sid':sid,'name':name,'country':country,'city':city,'type':typ,'joined':joined,'mod':{},'picks':{},'feedback':{},'handin':None}
    quiet_after={'ayse-demirkan':4,'rahul-mehrotra':5,'jonas-lindqvist':5}.get(sid,99)
    last_any=joined
    for m in MODULES:
        n=m['week']; wstart=W0+(n-1)*7*DAY
        if typ=='never':
            if n==1 and m['kind']=='lesson' and sid=='olusegun-adeyemi':
                st['mod'][m['id']]={'done':['s1'],'secs':420,'last':joined+3600000}
            continue
        if n>quiet_after: continue
        if typ=='late' and n<=3:
            when=joined+random.randint(0,6)*DAY+random.randint(0,12)*3600000   # caught up after joining
        else:
            when=wstart+random.randint(0,6)*DAY+random.randint(7,23)*3600000
        if when>NOW: continue
        if m['kind']=='lesson':
            frac={'strong':1,'steady':random.choice([1,1,1,5/6]),'late':random.choice([1,5/6,4/6]),'weak':random.choice([1,5/6]),'quiet':random.choice([1,5/6,3/6])}[typ]
            k=max(1,round(6*frac)); done=['s%d'%j for j in range(1,k+1)]
            rec={'done':done,'secs':section_times('lesson',k),'last':when}
            if k==6:   # took the checkpoint
                picks=[]; ab=ABIL[typ]; right=0
                for qi,q in enumerate(QUIZ[n]):
                    pw=min(0.95,(1-ab)+DIFF[n][qi])
                    if random.random()<pw:
                        wrong=[j for j in range(len(q['opts'])) if j!=q['a']]; picks.append(random.choice(wrong))
                    else: picks.append(q['a']); right+=1
                st['picks'][n]=picks; rec['score']=[right,12]
            st['mod'][m['id']]=rec
        elif m['kind']=='hw':
            if typ=='quiet' and n==quiet_after: continue
            frac={'strong':random.uniform(0.9,1),'steady':random.uniform(0.7,0.95),'late':random.uniform(0.5,0.85),'weak':random.uniform(0.45,0.75),'quiet':random.uniform(0.4,0.8)}[typ]
            k=round(m['total']*frac); rec={'n':k,'secs':section_times('hw',k),'last':when+DAY}
            if frac>0.6: rec['score']=[k,m['total']]; rec['submitted']=True
            st['mod'][m['id']]=rec
        else:  # the week-6 timed quiz
            if typ in('quiet',) and n>=quiet_after: continue
            g=round(18*min(1,ABIL[typ]+random.uniform(-0.12,0.06))); st['mod'][m['id']]={'score':[g,18],'secs':random.randint(1200,1800),'last':when,'n':18}
        last_any=max(last_any,st['mod'][m['id']]['last'])
    # feedback: most weeks for the engaged, none for the silent
    for n,_,_ in WEEKS:
        if typ=='never' or n>quiet_after: continue
        if 'w%d'%n not in st['mod']: continue
        p={'strong':0.85,'steady':0.7,'late':0.5,'weak':0.6,'quiet':0.5}[typ]
        if random.random()>p: continue
        base={'clear':[4.3,4.1,3.5,3.9,3.3,4.2,3.8,4.0],'pace':[4.0,3.9,3.2,3.5,2.9,3.8,3.6,3.7],'work':[4.1,3.8,3.4,3.3,2.8,3.6,3.5,3.4],'useful':[4.4,4.0,3.9,4.3,4.1,4.4,4.2,4.1]}
        fb={k:max(1,min(5,round(base[k][n-1]+random.gauss(0,0.7)))) for k in base}
        fb['helped']=comment(n,'helped',0.7)
        fb['change']=comment(n,'change',0.6)
        fb['ts']=st['mod']['w%d'%n]['last']+random.randint(1,3)*3600000
        st['feedback'][n]=fb
    # the Apple note, due Sun 6 Sep 23:59
    due=ms(2026,9,6,23,59)
    if typ in('strong','steady','late','weak') and sid not in('mei-ling-chau','tomas-ferreira') :
        late=typ=='late' or sid=='daniel-achterberg'   # Sofia and Kwame (late starters) and Daniel: after the deadline
        ts=(due+(3 if sid=='daniel-achterberg' else random.randint(9,30))*3600000) if late else due-random.randint(2,120)*3600000
        st['handin']={'ts':ts,'file':'apple-green-bond-note-%s.pdf'%sid,'words':random.randint(1650,2350),'late':late}
        last_any=max(last_any,ts)
    elif sid=='tomas-ferreira':
        st['handin']={'ts':due-5*3600000,'file':'apple-note-DRAFT-tomas.pdf','words':1180,'late':False}
        last_any=max(last_any,st['handin']['ts'])
    st['last']=last_any
    students.append(st)

# ---- message threads (the instructor's sid is 'i') ----
def S(sid): return next(s for s in students if s['sid']==sid)
T=[]
def thread(tid,kind,title,msgs):
    T.append({'tid':tid,'kind':kind,'title':title,'msgs':[{'by':b,'sid':sd,'name':(S(sd)['name'] if b=='s' else 'Jan Erik Meidell'),'txt':t,'ts':ts} for b,sd,t,ts in msgs]})
thread('all','all','Everyone',[
 ('i','i','Reminder: the final online exam opens tomorrow, Tuesday 8 September, and closes on the 15th. Ninety minutes, open book, one attempt. Weeks 5–8 are examined here, since Online Test 2 was cancelled.',ms(2026,9,7,10,0)),
 ('s','amara-okonkwo','Is the exam the same format as Test 1 — MCQ only — or are there calculation questions?',ms(2026,9,7,12,14)),
 ('i','i','Both: twenty MCQ, three short calculations in the style of the labs (WACI, step-up cost, break-even), and one case question on Rhône Cement. The marking scheme is on the exam page.',ms(2026,9,7,13,2)),
 ('s','elena-vasquez','Thank you. Is a calculator allowed?',ms(2026,9,7,13,30))])
thread('dm-tomas-ferreira','dm','Tomás Ferreira',[
 ('s','tomas-ferreira','I uploaded my Apple note on Sunday evening but I think I attached the draft version (it is 1,180 words). Can I replace it? The final one is 2,100 words.',ms(2026,9,7,20,41))])
thread('dm-nadia-el-fassi','dm','Nadia El-Fassi',[
 ('s','nadia-el-fassi','Quick question on week 5 §5.3: in the Rhône Cement example, is the step-up paid on the remaining coupons only, or on the whole life of the bond? The homework problem 14 seems to assume remaining coupons.',ms(2026,8,8,17,5)),
 ('s','nadia-el-fassi','Is it the remaining coupons only, or the whole life? I want to be sure before the test.',ms(2026,8,8,17,30)),
 ('i','i','Remaining coupons only — the step-up starts after the observation date, so a missed target in year 3 of a 7-year bond costs four stepped-up coupons, not seven. Problem 14 is right.',ms(2026,8,8,18,20))])
thread('dm-kwame-asante','dm','Kwame Asante',[
 ('s','kwame-asante','I joined the course late (work travel) and I am two weeks behind on the homework. Is there a deadline for the homework sets or only for the test and the assignment?',ms(2026,7,28,9,12)),
 ('i','i','Only the test and the assignment have deadlines; the homework is for you. Do weeks 1 and 2 before Test 1 (3–9 Aug) — they are examined — and catch up on the rest at your own pace.',ms(2026,7,28,10,0))])
thread('dm-mei-ling-chau','dm','Mei-Ling Chau',[
 ('s','mei-ling-chau','I will be in hospital this week for a planned operation and cannot hand in the Apple note by Sunday. Could I have until 13 September? I can send a medical certificate.',ms(2026,9,3,8,30))])
thread('g-geneva','group','Study group · Geneva',[
 ('i','i','This thread is for the four of you preparing the Rhône Cement case together. I will drop in once a week.',ms(2026,8,17,9,0)),
 ('s','lukas-brandli','We are meeting Thursday 18:00 at the Uni Mail cafeteria if anyone else wants to join.',ms(2026,8,18,21,15)),
 ('s','camille-lefevre','I will be there. Bring the WACI spreadsheet from week 4.',ms(2026,8,18,22,2)),
 ('i','i','Good — and bring the Rhône Cement numbers from §6.5; the divest-or-engage arithmetic is what the exam case turns on.',ms(2026,8,19,8,45))])

DATA={'now':NOW,'course':{'code':'OMBAFR455','title':'Sustainable Financial Markets','school':'SUMAS · Online MBA','term':'Blue Term 2026','instructor':'Jan Erik Meidell'},
 'weeks':[{'n':n,'dates':d,'subject':s,'start':W0+(n-1)*7*DAY} for n,d,s in WEEKS],
 'modules':MODULES,'sections':SECS,'quiz':QUIZ,'rates':[['clear','The lesson was clear'],['pace','The pace was right'],['work','The workload was manageable'],['useful','I can use this at work']],
 'students':students,'threads':T,
 'assignment':{'title':'Written assignment — Apple’s green bonds','due':ms(2026,9,6,23,59),'weight':'25%'},
 'exam':{'opens':ms(2026,9,8,9,0),'closes':ms(2026,9,15,23,59),'weight':'35%'}}
out=os.path.join(ROOT,'data.js')
open(out,'w',encoding='utf-8').write('/* GENERATED by demo/_build/make-data.py — a fictional cohort for the presentation demo. Nobody here is real. */\nwindow.DEMO='+json.dumps(DATA,ensure_ascii=False,separators=(',',':'))+';\n')
print('wrote',out,os.path.getsize(out)//1024,'KB ·',len(students),'students ·',sum(len(s['feedback']) for s in students),'feedback records ·',sum(1 for s in students if s['handin']),'hand-ins ·',len(T),'threads')
