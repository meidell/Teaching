/* =====================================================================
   GBS · Enterprise Security — "Cyber risk in numbers" (numbers.html).
   EVERY number on that page lives here and nowhere else (Jan Erik's build
   brief, 13 Nov 2026: "Put every number in one file, data.js … Chart code
   reads from data.js only; no number is typed into chart code or prose").
   The figures are the brief's, copied without adding, rounding or
   extrapolating; null = unknown, drawn as a gap. Each chart carries
   source, sourceUrl and unit. A chart without its own URL in the brief
   uses the URL the brief gives for the same report elsewhere. A source
   link the brief named without an address is null (shown as plain text).
   ===================================================================== */
var DBIR26 = "https://www.verizon.com/business/resources/T6a9/reports/2026-dbir-data-breach-investigations-report.pdf";
var IBM = "https://www.ibm.com/reports/data-breach";
var IC3 = "https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf";

var DATA = {
  asOf: "13 November 2026",
  game: { teams: 7, points: 100 },  /* seven teams on the scoreboard; one guess won = 100 points */

  /* ------------------------------------------------------------------ */
  enterprise: {
    title: "Enterprise security",
    sub: "How organisations get breached",
    intro: "The way into organisations has shifted from stolen passwords to unpatched software and suppliers, while ransomware has grown from one breach in ten to almost one in two.",
    blocks: {
      A: { lead: "A finance director asks whether last year's breach was bad luck or part of a pattern.",
           theory: "Each share depends on who sends data to the publisher and how it defines the category, so read the direction of a line, and treat a dashed segment as a change of definition, not a change in the world." },
      B: { lead: "An insurer asks a client which kinds of attack it has prepared for.",
           theory: "One breach can involve a person, a stolen password, a supplier and ransomware at the same time, so the categories overlap and the bars do not add up to a whole." },
      C: { lead: "A board asks what the worst case looks like for a company like theirs.",
           theory: "The largest consequences came from one missing control at a single point that thousands of people or firms depended on." },
      D: { lead: "An IT manager has the budget for one control this quarter.",
           theory: "A control that exists on paper protects nothing until someone checks that it is applied every single time." }
    },
    evolution: {
      // Chart E1, line. Year = Verizon DBIR edition (data is from the 12 months before).
      dbirShares: {
        id: "E1", kind: "line",
        title: "What breaches involve",
        prompt: "In 2021 ransomware was in 10% of breaches. What is it now?",
        unit: "% of breaches",
        xNote: "Year of the DBIR edition; the data is from the 12 months before.",
        years: [2021, 2022, 2023, 2024, 2025, 2026],
        series: [
          { key: "ransomware", name: "Ransomware", values: [10, 25, 24, 23, 44, 48] },
          { key: "humanElement", name: "Human element", values: [85, 82, 74, 68, 60, 62] },
          { key: "thirdParty", name: "Third party involved", values: [null, null, null, 15, 30, 48] }
        ],
        breaks: [
          { series: "humanElement", year: 2024, note: "Definition tightened in 2024; about 76% on the old basis." },
          { series: "ransomware", year: 2025, note: "Contributor base widened to more small businesses in 2025." },
          { series: "thirdParty", year: 2024, note: "Measure introduced in 2024." }
        ],
        check: ["ransomware 2022", "ransomware 2023"],
        source: "Verizon DBIR 2021-2026, as compiled by Security Scientist",
        sourceUrl: "https://www.securityscientist.net/blog/dbir-decade-of-data-breaches/"
      },
      // Chart E2, line, two series that cross.
      initialAccess: {
        id: "E2", kind: "line",
        title: "How attackers get in first",
        prompt: "Which is now the most common way in: a stolen password or an unpatched flaw?",
        unit: "% of breaches, first recorded step",
        years: [2024, 2025, 2026],
        series: [
          { key: "vulnerabilityExploitation", name: "Vulnerability exploitation", values: [14, 20, 31] },
          { key: "credentialAbuse", name: "Credential abuse", values: [null, 22, 13] }
        ],
        check: ["vulnerabilityExploitation 2024"],
        note: "Credentials still appear somewhere in 39% of breaches in 2026; 13% counts the first step only.",
        source: "Verizon DBIR 2026",
        sourceUrl: DBIR26
      },
      // Chart E3, bars for victims, line for groups.
      ransomwareVolume: {
        id: "E3", kind: "barline",
        title: "Victims named on ransomware leak sites",
        prompt: "More victims or fewer than last year?",
        years: ["2024", "2025", "2026 to 25 Oct"],
        bars: { key: "victimsPosted", name: "Victims posted (bars)", unit: "victims posted", values: [6112, 8146, 8558] },
        line: { key: "groupsActive", name: "Groups active (line)", unit: "groups active", values: [95, 126, 157] },
        note: "Leak-site postings are claims by criminals, not confirmed attacks.",
        source: "ransomware.live, via Stingrai",
        sourceUrl: "https://www.stingrai.io/blog/ransomware-statistics-2026"
      },
      // Two number tiles under the charts.
      patching: {
        tiles: [
          { label: "Known exploited vulnerabilities fully fixed, % of them", values: [["2025 edition", "38%"], ["2026 edition", "26%"]] },
          { label: "Median days to fix a known exploited vulnerability", values: [["2025 edition", "32 days"], ["2026 edition", "43 days"]] }
        ],
        source: "Verizon DBIR 2026",
        sourceUrl: DBIR26
      }
    },
    typeCards: [
      { name: "Vulnerability exploitation", def: "Attacking a known or unknown flaw in software facing the internet.", example: "MOVEit, 2023", number: "31% of breaches start this way", src: "DBIR 2026" },
      { name: "Credential abuse", def: "Logging in with a stolen or guessed password.", example: "Change Healthcare, 2024", number: "First step in 13%, present in 39%", src: "DBIR 2026" },
      { name: "Phishing and social engineering", def: "Persuading a person to hand over access.", example: "Clorox, 2023", number: "Email and phishing caused 50% of ransomware attacks", src: "Sophos 2026" },
      { name: "Ransomware and extortion", def: "Encrypting or stealing data and demanding payment.", example: "Change Healthcare, 2024", number: "In 48% of breaches", src: "DBIR 2026" },
      { name: "Third party and supply chain", def: "Reaching the victim through a supplier or its software.", example: "ConnectWise Cloud Backup, October 2026", number: "In 48% of breaches", src: "DBIR 2026" },
      { name: "Insider and error", def: "Staff misuse or mistakes, including unapproved AI tools.", example: "Source code pasted into unapproved AI tools", number: "Shadow AI activity up fourfold", src: "DBIR 2026" },
      { name: "AI-enabled attack", def: "Attackers using AI to scale or speed up the steps above.", example: "Autonomous AI pentest tool used on about 60 Korean firms, 2026", number: "One in four malicious breaches, average $6 million", src: "IBM 2026" }
    ],
    types: {
      // Chart E4, horizontal bars. Categories overlap, so they do not sum to 100.
      shareOfBreaches2026: {
        id: "E4", kind: "hbar",
        title: "What appears in a breach (categories overlap)",
        prompt: "Rank these five from most to least common before you reveal.",
        unit: "% of breaches",
        items: [
          ["Human element", 62], ["Ransomware", 48], ["Third party involved", 48],
          ["Stolen credentials anywhere in the chain", 39], ["Vulnerability exploited as first step", 31]
        ],
        source: "Verizon DBIR 2026",
        sourceUrl: DBIR26
      },
      // Chart E5, horizontal bars.
      ransomwareRootCause2026: {
        id: "E5", kind: "hbar",
        title: "Root cause of ransomware attacks",
        prompt: "Which root cause comes first for ransomware?",
        unit: "% of attacks",
        items: [["Malicious email", 26], ["Phishing", 24], ["Compromised credentials", 23], ["Exploited vulnerability", 18]],
        note: "Survey of 2,158 victim organisations with 100 to 5,000 employees.",
        source: "Sophos, State of Ransomware 2026",
        sourceUrl: "https://assets.sophos.com/X24WTUEQ/at/jbww7pmb8n3gp99wr6hfq4/sophos-state-ransomware-report-2026.pdf"
      }
    },
    serious: [
      {
        name: "Change Healthcare", where: "United States", date: "February 2024", tag: "Enterprise security",
        happened: [
          "Attackers logged in to a Citrix remote access portal with a stolen password on 12 February 2024.",
          "They moved through the network for nine days, then deployed ransomware on 21 February.",
          "Claims and pharmacy processing across US healthcare stopped for weeks."
        ],
        steps: ["Stolen password", "Portal with no second factor", "Nine days unnoticed", "Data stolen", "Ransomware"],
        impact: [
          ["192.7 million", "people affected"],
          ["$22 million", "ransom paid"],
          ["$2.2 billion", "direct response cost in 2024"],
          ["$867 million", "business disruption in 2024"],
          ["more than $9 billion", "emergency loans to providers"]
        ],
        root: "One remote access portal without multi-factor authentication, in a company bought 16 months earlier.",
        control: "Multi-factor authentication on every external login, verified from outside.",
        question: "The ransom was the smallest number on the card. Why?",
        sources: [["HIPAA Journal", null], ["CodeAnt timeline with 10-K figures", null]]
      },
      {
        name: "MOVEit", where: "Worldwide", date: "May to June 2023", tag: "Enterprise security",
        happened: [
          "The Cl0p group used an unknown flaw (CVE-2023-34362) in MOVEit Transfer, a file transfer product from Progress Software.",
          "It copied data from every exposed server it could find.",
          "No ransomware was deployed; the extortion was the threat to publish."
        ],
        steps: ["One flaw in one product", "Mass scanning", "Data copied from thousands of servers", "Victims named on a leak site"],
        impact: [
          ["2,773", "organisations"],
          ["95.8 million", "individuals"],
          ["more than 80%", "of victims in the United States"]
        ],
        root: "A single supplier product trusted by thousands of organisations, many of which were hit through their own suppliers.",
        control: "A supplier inventory, and limits on how long sensitive files stay on transfer servers.",
        question: "Your company never bought MOVEit. How could you still be a victim?",
        sources: [["Emsisoft tally", "https://www.emsisoft.com/en/blog/44123/unpacking-the-moveit-breach-statistics-and-analysis/"], ["Wikipedia", "https://en.wikipedia.org/wiki/2023_MOVEit_data_breach"]]
      }
    ],
    avoidable: {
      name: "Clorox", where: "United States", date: "August 2023", tag: "Enterprise security",
      happened: [
        "According to Clorox's lawsuit, an attacker phoned the outsourced IT service desk, said they were an employee and asked for a new password.",
        "The agent supplied one without checking identity, then reset multi-factor authentication.",
        "The attacker repeated the call for other accounts."
      ],
      steps: ["Phone call", "Password handed over", "Second factor reset", "Security tools disabled", "Production and shipping disrupted"],
      impact: [
        ["$380 million", "in damages claimed"],
        ["about $49 million", "of it remediation"]
      ],
      root: "An identity check that existed on paper and was skipped on the phone.",
      control: "No password or second-factor reset without verification, and a self-service reset tool so the desk never needs to.",
      label: "These are allegations in a lawsuit filed in July 2025. Cognizant, the service desk provider, disputes them and says it was hired for a narrow scope of services.",
      question: "Is this a technology failure, a people failure or a contract failure?",
      sources: [["Reuters via NBC News", null], ["CPO Magazine", null]]
    }
  },

  /* ------------------------------------------------------------------ */
  warfare: {
    title: "Cyber warfare",
    sub: "What states and their proxies do",
    intro: "State activity is rising on every published series, but the loudest attacks by count are the least damaging; the serious ones are quiet espionage and rare sabotage.",
    blocks: {
      A: { lead: "A company with a plant in Taiwan or a supplier in Korea asks whether state activity concerns it.",
           theory: "Governments count attempts, criminals post claims and analysts trace money: each series measures a different thing, so compare the direction of each line, not the sizes across charts." },
      B: { lead: "A security manager has to tell the board which state threats are noise and which are serious.",
           theory: "By count, hacktivist noise dominates. By consequence, the three incidents below matter more than thousands of website outages. Which measure should a board watch?" },
      C: { lead: "A satellite-internet customer or a telecom subscriber is rarely the target, and can still be the victim.",
           theory: "State operations aim at systems that many others depend on, so the damage reaches people and firms that were never the target." },
      D: { lead: "A small water utility believes that no state would bother with it.",
           theory: "Small targets with factory settings are attacked because they are easy, and each one shows a capability that could be used against a larger one." }
    },
    evolution: {
      // Chart W1, bars.
      taiwanDailyAttempts: {
        id: "W1", kind: "bar",
        title: "Daily intrusion attempts on Taiwan's critical infrastructure",
        prompt: "How many attempts per day does Taiwan count from China?",
        unit: "million per day",
        years: [2023, 2024, 2025],
        values: [1.23, 2.46, 2.63],
        note: "Attempts, including automated scanning, not successful intrusions. First published for 2023.",
        source: "Taiwan National Security Bureau, via Taipei Times",
        sourceUrl: "https://www.taipeitimes.com/News/front/archives/2026/01/05/2003850052"
      },
      // Chart W2, bars for attacks, line for groups.
      industrialRansomware: {
        id: "W2", kind: "barline",
        title: "Ransomware attacks on industrial organisations",
        prompt: "Factories and utilities: how fast is this growing?",
        years: [2022, 2023, 2024, 2025],
        bars: { key: "attacks", name: "Attacks (bars)", unit: "attacks", values: [605, 905, 1693, 3300] },
        line: { key: "groups", name: "Groups (line)", unit: "groups", values: [null, 50, 80, 119] },
        check: ["attacks 2023"],
        note: "Mostly criminal, but these are the same weak points states use. Dragos reports state groups increasingly hide behind ransomware.",
        source: "Dragos OT Cybersecurity Year in Review, 2023 to 2026 editions",
        sourceUrl: "https://dragos.com/blog/dragos-2026-ot-cybersecurity-year-in-review"
      },
      // Chart W3, North Korea inside the total.
      cryptoTheft: {
        id: "W3", kind: "inside",
        title: "Cryptocurrency stolen by hackers, and North Korea's share",
        prompt: "How much did one state steal in 2025?",
        unit: "USD billion",
        years: [2022, 2023, 2024, 2025],
        outer: { key: "allHackers", name: "All hackers", values: [3.7, 1.8, 2.2, 3.4] },
        inner: { key: "northKorea", name: "North Korea (inside the total)", values: [1.7, 0.66, 1.34, 2.02] },
        check: ["northKorea 2022"],
        annotation: "29 October 2026: one theft from Binance, about 6.3 billion, attributed by the FBI to North Korea.",
        source: "Chainalysis, via The Record and TechCrunch",
        sourceUrl: "https://therecord.media/over-3-billion-crypto-stolen-2025-north-korea"
      },
      tiles: [
        { label: "Rise in Taiwan's daily attempts, 2023 to 2025", value: "113%", source: "Taiwan NSB" },
        { label: "Rise in state-sponsored attacks counted by South Korea, first half of 2026", value: "7.5%", source: "Korea Times" },
        { label: "Breaches with an espionage motive", value: "13%", source: "Verizon DBIR 2026" }
      ]
    },
    typeCards: [
      { name: "Espionage", def: "Staying hidden in networks to read communications and data.", example: "Salt Typhoon, disclosed 2024", number: "At least 200 US organisations, 80 countries", src: "FBI" },
      { name: "Pre-positioning", def: "Gaining access now in order to disrupt later, in a crisis.", example: "Volt Typhoon in US energy, water and transport", number: "At least five years of access before discovery", src: "CISA, NSA, FBI" },
      { name: "Sabotage and wipers", def: "Destroying data or devices.", example: "Viasat, 2022; Stryker, March 2026", number: "Tens of thousands of modems disabled in one morning", src: "" },
      { name: "Disruption by proxy", def: "Hacktivist groups aligned with a state flooding websites.", example: "NoName057(16) against European sites", number: "77% of EU incidents were DDoS, but only 2% caused disruption", src: "ENISA" },
      { name: "Theft to fund the state", def: "Stealing money, mainly cryptocurrency.", example: "Bybit, 2025; Binance, 2026", number: "$2.02 billion taken by North Korea in 2025", src: "Chainalysis" },
      { name: "Attacks on physical processes", def: "Changing what machines do in the real world.", example: "Aliquippa water, 2023; supermarket freezers, 2026", number: "About 700 French retail sites in one night", src: "CERT-FR" }
    ],
    types: {
      // Chart W4, grouped horizontal bars. The lesson: counting incidents rewards noise.
      euIncidentsByMotive: {
        id: "W4", kind: "hbarGroup",
        title: "EU incidents by who was behind them",
        prompt: "What share of recorded EU incidents is hacktivism, mostly DDoS?",
        unit: "% of recorded incidents",
        groups: ["Jul 2024 to Jun 2025 (4,875 incidents)", "Calendar 2025 (8,257 incidents)"],
        items: [
          ["Hacktivism, mostly DDoS", 79, 57.3],
          ["Financially motivated crime", 13.4, 29.3]
        ],
        note: "The remainder is state-linked or unattributed. ENISA changed its reporting period between editions, so the two columns are not a clean trend.",
        source: "ENISA Threat Landscape 2025 and 2026",
        sourceUrl: "https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025"
      }
    },
    serious: [
      {
        name: "Viasat KA-SAT", where: "Ukraine and Europe", date: "24 February 2022", tag: "Cyber warfare",
        happened: [
          "About an hour before Russian troops crossed the border, attackers reached the management network of the KA-SAT satellite service.",
          "They pushed destructive software, named AcidRain, to customer modems.",
          "Ukrainian military and civilian satellite internet went down as the invasion began."
        ],
        steps: ["Access to the management network", "Wiper pushed as an update", "Modems erased", "Communications lost", "Spillover across Europe"],
        impact: [
          ["tens of thousands", "of modems disabled"],
          ["5,800", "Enercon wind turbines in Germany cut off from remote monitoring"],
          ["about 30,000", "replacement modems shipped"]
        ],
        root: "One management channel able to rewrite every modem at once.",
        control: "Separate and strictly limit the systems that can push updates to devices in the field.",
        attribution: "The US, UK and EU attributed it to Russia; the UK's NCSC called Russian responsibility almost certain.",
        question: "The turbines were not the target. What does that say about collateral damage in cyber conflict?",
        sources: [["SentinelOne on AcidRain", "https://www.sentinelone.com/labs/acidrain-a-modem-wiper-rains-down-on-europe/"], ["EuRepoC case file", null]]
      },
      {
        name: "Salt Typhoon", where: "United States and worldwide", date: "disclosed late 2024", tag: "Cyber warfare",
        happened: [
          "A Chinese state-linked group lived inside telecom networks for years, including at least nine US carriers.",
          "It reached the lawful intercept systems that hold court-ordered wiretap requests.",
          "It collected call records of senior political figures."
        ],
        steps: ["Old unpatched router flaws", "Access to core network equipment", "Movement to wiretap systems", "Call records and wiretap targets copied", "Years undetected"],
        impact: [
          ["at least 9", "US carriers"],
          ["at least 200", "US organisations"],
          ["80", "countries"],
          ["about 600", "organisations notified by the FBI"]
        ],
        root: "Network equipment with flaws dating back to 2018 for which fixes existed but were never applied.",
        control: "Patch and monitor network edge devices, and treat wiretap systems as the most sensitive asset in the company.",
        question: "Nothing was broken or switched off. Why do officials call this the worst telecom hack in US history?",
        sources: [["Nextgov", null], ["Defense One", null]]
      }
    ],
    avoidable: {
      name: "Aliquippa water authority", where: "United States", date: "November 2023", tag: "Cyber warfare",
      happened: [
        "A group linked to Iran's Revolutionary Guard, calling itself CyberAv3ngers, took over a pressure controller at a water booster station in Pennsylvania.",
        "It put a political message on the controller's screen.",
        "Operators switched to manual control; the water supply was not affected."
      ],
      steps: ["Controller connected directly to the internet", "Factory password \"1111\" never changed", "Default port open", "Attacker logs in", "Screen defaced"],
      impact: [
        ["1", "pump station serving two towns switched to manual"],
        ["about 15,000", "customers of the utility"],
        ["several", "other US water facilities found with the same device compromised"]
      ],
      root: "A default password on an internet-facing industrial device.",
      control: "Change default passwords and take controllers off the public internet.",
      question: "The damage was trivial. Why did this small utility trigger a joint advisory from five agencies?",
      sources: [["CISA advisory AA23-335A", "https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-335a"], ["The Register", null], ["Claroty", null]]
    }
  },

  /* ------------------------------------------------------------------ */
  assets: {
    title: "Asset protection",
    sub: "What is lost and what it costs",
    intro: "Losses keep rising on every measure except one: fewer victims pay ransoms, so criminals have moved to larger thefts and to stopping operations.",
    blocks: {
      A: { lead: "A finance director needs a figure for the cyber line of next year's risk budget.",
           theory: "An average cost comes from a survey of breached firms, and reported losses come from victims who chose to complain, so both measure less than the whole." },
      B: { lead: "A risk manager has to decide which assets to insure and which to protect first.",
           theory: "Reported losses depend on what victims report: a fraud is reported because the money is gone, while the downtime from ransomware often is not reported at all." },
      C: { lead: "A company asks what it loses when it is not the one that was hacked.",
           theory: "The largest losses came from operations that stopped and from money that moved in minutes, not from ransom payments." },
      D: { lead: "A supermarket's facilities manager is responsible for the freezers, not for cyber security.",
           theory: "Equipment that its maker no longer updates, and that anyone can reach from the internet, is an open door, whoever in the company owns it." }
    },
    evolution: {
      // Chart A1, line.
      breachCost: {
        id: "A1", kind: "line",
        title: "Average cost of a data breach",
        prompt: "What does one breach cost a company on average?",
        unit: "USD million",
        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        series: [
          { key: "global", name: "Global", values: [3.92, 3.86, 4.24, 4.35, 4.45, 4.88, 4.44, 4.99] },
          { key: "unitedStates", name: "United States", values: [null, null, null, null, null, null, 10.22, 11.5] }
        ],
        check: ["global 2019", "global 2020", "global 2021"],
        note: "About 600 breached organisations per year; excludes the very largest breaches.",
        source: "IBM Cost of a Data Breach Report, annual editions",
        sourceUrl: IBM
      },
      // Chart A2, bars.
      reportedLosses: {
        id: "A2", kind: "bar",
        title: "Losses reported to the FBI by victims of online crime",
        prompt: "The FBI recorded $4.2 billion in 2020. And in 2025?",
        unit: "USD billion",
        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
        values: [3.5, 4.2, 6.9, 10.3, 12.5, 16.6, 20.877],
        check: ["2019", "2021", "2022", "2023"],
        note: "Complaints people chose to file, mostly in the United States. A floor, not a total.",
        source: "FBI Internet Crime Complaint Center, 2025 Internet Crime Report",
        sourceUrl: IC3
      },
      // Chart A3, line falling. The x axis is not evenly spaced: a gap between 2019 and 2025.
      ransomPaymentRate: {
        id: "A3", kind: "line",
        title: "Share of ransomware victims who paid",
        prompt: "In early 2019, 85% paid. What share pays today?",
        unit: "% of cases handled by Coveware",
        years: ["Q1 2019", "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"],
        series: [{ key: "paid", name: "Paid a ransom", values: [85, 27, 26, 23, 20, 23, 19] }],
        gapAfter: 0,
        note: "The x axis is not evenly spaced: the gap marks the years between 2019 and 2025, which are not shown.",
        source: "Coveware quarterly reports, via Stingrai",
        sourceUrl: "https://www.stingrai.io/blog/ransomware-statistics-2026"
      },
      tiles: [
        { label: "Ransom payments traced on-chain", value: "$892M in 2024, $820M in 2025", source: "Chainalysis" },
        { label: "Days to identify and contain a breach", value: "241 in 2025, 247 in 2026", source: "IBM" },
        { label: "Complaints to the FBI in 2025", value: "1,008,597", source: "FBI IC3" }
      ]
    },
    typeCards: [
      { name: "Personal data", def: "Records about customers, patients or citizens.", example: "Change Healthcare, 2024; Denmark's person register, 2026", number: "8.8 million records taken from Denmark's register, more than its population", src: "" },
      { name: "Money moved by deception", def: "Staff or customers tricked into paying criminals.", example: "Business email compromise", number: "$3.05 billion reported in 2025", src: "FBI" },
      { name: "Digital assets", def: "Cryptocurrency taken from exchanges and wallets.", example: "Binance, 2026", number: "$3.4 billion stolen in 2025", src: "Chainalysis" },
      { name: "Operations", def: "Production, sales or services stopped.", example: "Jaguar Land Rover, 2025", number: "$1.7 million mean recovery cost before any ransom", src: "Sophos 2026" },
      { name: "Extortion payments", def: "Money paid to get data or systems back.", example: "Change Healthcare paid $22 million", number: "About $820 million paid in 2025", src: "Chainalysis" },
      { name: "Physical stock and equipment", def: "Goods or machines damaged through their control systems.", example: "Supermarket freezers, 2026", number: "Tens of millions of euros of food", src: "French authorities" }
    ],
    types: {
      // Chart A4, horizontal bars, log scale so the smallest bar is visible.
      reportedLossByCrime2025: {
        id: "A4", kind: "hbar", log: true,
        title: "Losses reported to the FBI in 2025, by type",
        prompt: "Investment fraud, business email compromise, ransomware: which reported the largest loss?",
        unit: "USD million",
        items: [["Investment fraud", 8648], ["Business email compromise", 3046], ["Ransomware", 32.3]],
        note: "The ransomware figure excludes downtime and unreported cases; the FBI calls it artificially low. One ransomware case, Change Healthcare, cost about 3,000.",
        source: "FBI IC3 2025 Internet Crime Report",
        sourceUrl: IC3
      },
      // Chart A5, horizontal bars.
      breachCostBySegment2026: {
        id: "A5", kind: "hbar",
        title: "Average breach cost, by country and sector",
        prompt: "Which costs more per breach: a US company, or a hospital anywhere?",
        unit: "USD million",
        items: [["United States", 11.5], ["Middle East", 8.0], ["Healthcare", 6.64], ["Financial services", 6.29], ["Energy", 5.2], ["Global average", 4.99]],
        source: "IBM Cost of a Data Breach Report 2026",
        sourceUrl: IBM
      },
      // Chart A6, diverging bars around zero.
      whatMovesTheCost2026: {
        id: "A6", kind: "hbar", diverging: true,
        title: "What raises or lowers the cost of a breach",
        prompt: "Which of the four lowers the cost of a breach the most?",
        unit: "USD million against the average",
        items: [["Attack used AI", 1.0], ["Supplier or supply chain compromise", 0.227], ["DevSecOps approach", -0.254], ["Extensive security AI and automation", -1.93]],
        note: "Correlations from a survey sponsored by a security vendor, not controlled comparisons.",
        source: "IBM Cost of a Data Breach Report 2026",
        sourceUrl: IBM
      }
    },
    serious: [
      {
        name: "Binance hot wallet theft", where: "Worldwide", date: "29 October 2026", tag: "Asset protection",
        happened: [
          "Attackers spent months compromising Binance engineers.",
          "They then drained the exchange's hot wallets across several blockchains in about 20 minutes.",
          "It is the largest cryptocurrency theft publicly reported."
        ],
        steps: ["Tampered software installer in June", "Fake job interview with a malicious code repository in September", "Abuse of an internal AI tool on 20 October", "Access to the wallet signing service", "Wallets drained on 29 October"],
        impact: [
          ["about $6.3 billion", "taken"],
          ["about 20 minutes", "to drain the wallets"],
          ["about $3 billion", "frozen on-chain"],
          ["the rest", "covered by Binance from its own funds"]
        ],
        root: "Engineer workstations with a path to the service that signs transactions.",
        control: "Isolate signing systems, require several independent approvals for large transfers, and limit what internal AI tools can reach.",
        attribution: "The FBI attributed the theft to North Korea on 31 October 2026.",
        label: "Figures are two weeks old and may be revised.",
        question: "Binance reimbursed customers. Who bears the loss when a smaller firm cannot?",
        sources: [["SOCRadar, October 2026 review", null]]
      },
      {
        name: "Jaguar Land Rover", where: "United Kingdom", date: "August to October 2025", tag: "Asset protection",
        happened: [
          "After detecting an intrusion at the end of August 2025, JLR shut down its IT systems.",
          "It halted production at its UK plants from 1 September for about five weeks.",
          "Thousands of suppliers went unpaid until the government stepped in."
        ],
        steps: ["Intrusion detected", "Systems shut down to contain it", "Plants stopped", "Suppliers and dealers stopped", "State loan guarantee"],
        impact: [
          ["£1.9 billion", "estimated cost to the UK economy (range £1.6 to £2.1 billion)"],
          ["about 5,000", "organisations affected"],
          ["about five weeks", "without production"],
          ["£1.5 billion", "government loan guarantee"]
        ],
        rootLabel: "Root cause of the loss",
        root: "Production that could not run without the IT systems, and reportedly no cyber insurance in place.",
        control: "A tested plan for running or restarting production when IT is down, and segmentation between office and factory systems.",
        label: "How the attackers first got in has not been officially confirmed, so the steps start at detection.",
        question: "Most of the loss fell on suppliers who were never hacked. Should a firm's cyber risk be its supply chain's business?",
        sources: [["ITPro on the Cyber Monitoring Centre estimate", null], ["Reinsurance News", null]]
      }
    ],
    avoidable: {
      name: "Supermarket freezers", where: "France", date: "11 to 12 October 2026", tag: "Asset protection",
      also: "This is also a case for Cyber warfare, type \"Attacks on physical processes\".",
      happened: [
        "Overnight, attackers logged in to refrigeration controllers at French supermarkets and forced them into defrost cycles for about six hours.",
        "Staff arrived to hot air from the freezers.",
        "Stock was destroyed and some stores had fires."
      ],
      steps: ["Controllers reachable from the public internet", "Username \"admin\"", "Password derived from the day's date", "Defrost forced remotely", "No alarm raised"],
      impact: [
        ["about 700", "retail sites"],
        ["at least 15", "fires"],
        ["up to 50 °C", "temperatures"],
        ["tens of millions of euros", "of food"],
        ["€270,000", "lost by two stores in Alsace alone"]
      ],
      root: "Legacy Danfoss controllers, no longer updated, exposed to the internet with a login anyone could work out.",
      control: "Never expose building or refrigeration controllers to the internet; replace equipment the maker no longer supports; alarm on abnormal temperature commands.",
      attribution: "French authorities attributed it on 9 November 2026 to a cyber unit of Iran's Revolutionary Guard. A similar wave hit other European countries on 2 November.",
      question: "Who owned this risk in the supermarket: IT, facilities, or the refrigeration contractor?",
      sources: [["Dark Reading", null], ["SOCRadar", null], ["Wikipedia", null], ["CBS News", null]]
    }
  }
};

/* ---------------------------------------------------------------------
   THE WORDS FIRST (13 Nov 2026). Jan Erik: "cards before the game
   explaining the vocabulary … back up every word with real examples and
   explain to layman … short precise". One card per word: what it is in
   plain words, one real case with its year, and where it appears in the
   game. The examples are public, well-documented cases; their numbers are
   here, like every other number on the page.
   --------------------------------------------------------------------- */
DATA.vocab = [
  { group: "1 · The basic words", items: [
    { t: "Cyber attack", what: "Someone uses computers and networks to steal, spy, extort money or break something that belongs to someone else.", eg: "In May 2021 criminals locked the computers of Colonial Pipeline, which carries about half the fuel used on the US East Coast; the company shut the pipeline for about six days and petrol stations ran dry." },
    { t: "Data breach", what: "Information an organisation was supposed to protect ends up in the hands of people who should not have it.", eg: "In 2017 attackers took the names, birth dates and social security numbers of about 147 million Americans from Equifax, a company that rates people's creditworthiness.", where: "Charts E1, E4, A1" },
    { t: "Critical infrastructure", what: "The services a country cannot run without: electricity, water, telecoms, hospitals, transport, banks.", eg: "On 23 December 2015 attackers switched off power stations in western Ukraine; about 225,000 customers had no electricity for several hours in winter.", where: "Chart W1" },
    { t: "Network", what: "All the computers, phones, servers and machines of an organisation, connected so they can talk to each other and to the internet.", eg: "A hospital's network links the reception desk, the doctors' computers, the X-ray machines and the pharmacy." },
    { t: "Server", what: "A computer that runs all the time and serves data or a service to many other computers, for example a company's email or its website.", eg: "In the MOVEit case of 2023, the attackers copied files from the servers that companies used to send large files to each other.", where: "MOVEit card" }
  ]},
  { group: "2 · How attackers get in", items: [
    { t: "Vulnerability", also: "a flaw, a security hole", what: "A mistake in a piece of software that lets an outsider do something the software should never allow.", eg: "The MOVEit file-transfer program had a flaw, registered as CVE-2023-34362, that let anyone on the internet read the files on the server.", where: "Charts E2, E4" },
    { t: "Exploit · exploited vulnerability", what: "To exploit a vulnerability is to actually use the flaw to get in. An exploited vulnerability is a flaw that attackers really used, not just one that exists.", eg: "Equifax, 2017: the fix for a flaw in its web software was published in March; Equifax had not installed it, and attackers used the flaw from May.", where: "Charts E2, E4, E5" },
    { t: "Patch · unpatched", what: "A patch is the update the software maker publishes to close a flaw. Unpatched means the update exists but the company has not installed it.", eg: "Microsoft published a patch in March 2017; the WannaCry attack of May 2017 hit computers that had not installed it, and hospitals in England cancelled about 19,000 appointments.", where: "Tiles under chart E3" },
    { t: "Known exploited vulnerability", what: "A flaw that the authorities have confirmed attackers are already using. The US cyber agency CISA keeps a public list of them so companies know what to fix first.", eg: "The MOVEit flaw was added to CISA's list in June 2023, a few days after the attacks began.", where: "Tiles under chart E3" },
    { t: "Zero-day", also: "an unknown flaw", what: "A flaw that the software maker does not know about yet, so no patch exists on the day it is first used.", eg: "Cl0p used the MOVEit flaw in May 2023 before Progress Software, the maker, knew it existed.", where: "MOVEit card" },
    { t: "Internet-facing", what: "A computer or device that anyone on the internet can reach, like a shop door on a public street rather than a door inside the building.", eg: "The water controller at Aliquippa, 2023, was connected directly to the internet, so the attackers could reach its login screen from Iran.", where: "Aliquippa and freezer cards" },
    { t: "Credentials · stolen credentials", what: "Credentials are what you use to prove who you are: a username and a password. Stolen credentials are those that criminals have bought, guessed or tricked someone into giving.", eg: "Colonial Pipeline, 2021: the attackers logged in with the password of an old account that was no longer used, and nothing else was asked.", where: "Charts E2, E4" },
    { t: "Credential abuse", what: "Logging in as a real user with stolen or guessed credentials. To the system it looks like a normal login.", eg: "Change Healthcare, February 2024: the attackers logged in to a remote access portal with a stolen password.", where: "Chart E2, Change Healthcare card" },
    { t: "Multi-factor authentication (MFA)", also: "a second factor", what: "A login that asks for a second proof besides the password, usually a code sent to your phone or a tap in an app. A stolen password alone is then not enough.", eg: "Change Healthcare's portal asked only for a password; with a second factor, the stolen password would not have opened it.", where: "Change Healthcare and Clorox cards" },
    { t: "VPN · remote access portal", what: "The door that lets staff work from home: a program or a web page that connects their laptop to the company's internal network over the internet. If it is badly protected, anyone with a password can walk in.", eg: "Colonial Pipeline, 2021, was entered through its VPN; Change Healthcare, 2024, through a Citrix remote access portal; Viasat, 2022, through a badly configured VPN box.", where: "Change Healthcare and Viasat cards" },
    { t: "Phishing", what: "A fake message, usually an email, that looks like it comes from someone you trust and gets you to click a link, open a file or type your password on a fake page.", eg: "In March 2016 the chair of Hillary Clinton's campaign received a fake Google security warning; his password was typed into the fake page and his emails were published months later.", where: "Charts E4, E5" },
    { t: "Social engineering", what: "Tricking a person, rather than a computer, into giving access: by email, by phone, in person. The attacker exploits trust and helpfulness.", eg: "MGM Resorts, September 2023: an attacker found an employee's name on LinkedIn, phoned the IT help desk pretending to be them, and got in; MGM put the cost at about $100 million.", where: "Clorox card" },
    { t: "Supply chain attack · third party", what: "Reaching a company through a supplier it trusts: its software, its IT provider, its cloud service. A third party is any outside company with access to your systems or data.", eg: "SolarWinds, 2020: attackers hid a backdoor in an update of a network-monitoring program, and about 18,000 customers installed it, including US government departments.", where: "Charts E1, E4, A6" },
    { t: "Scanning · intrusion attempt", what: "Programs that try every address on the internet to find open doors, like someone walking down a street trying every door handle. An intrusion attempt is one try; most fail.", eg: "Taiwan counts millions of attempts a day against its critical infrastructure; most are automated knocks, not break-ins.", where: "Chart W1" },
    { t: "Default password", what: "The password a device has when it leaves the factory, the same on every unit and often printed in the manual. Anyone can look it up.", eg: "In 2016 the Mirai botnet took over hundreds of thousands of cameras and routers that still had their factory passwords, and used them to knock Twitter and Netflix offline for hours.", where: "Aliquippa card" }
  ]},
  { group: "3 · What attackers do once inside", items: [
    { t: "Malware", what: "Any harmful software: programs that spy, steal, lock or destroy. Ransomware and wipers are kinds of malware.", eg: "NotPetya, June 2017, spread from a Ukrainian accounting program to companies worldwide; the shipping firm Maersk had to reinstall about 45,000 computers." },
    { t: "Moving through the network", also: "lateral movement", what: "After the first computer, the attacker hops from machine to machine until they reach what they want, often for days without being noticed.", eg: "Change Healthcare, 2024: nine days passed between the first login and the ransomware.", where: "Change Healthcare and Binance cards" },
    { t: "Ransomware", what: "Malware that locks a company's files so nobody can open them, followed by a demand for money, usually in cryptocurrency, for the key that unlocks them.", eg: "Colonial Pipeline paid about $4.4 million in bitcoin in May 2021 to unlock its systems.", where: "Charts E1, E3, E5, A3, A4" },
    { t: "Extortion · leak site", what: "Extortion is demanding money with a threat. Today criminals often steal the data first and threaten to publish it. A leak site is the website where a gang names its victims and publishes the data of those who do not pay.", eg: "In 2023 the Cl0p gang named hundreds of MOVEit victims on its leak site, without locking a single file.", where: "Chart E3, MOVEit card" },
    { t: "Wiper", what: "Malware that destroys data or devices for good. There is no key and no ransom: the aim is damage.", eg: "AcidRain, 24 February 2022, wiped tens of thousands of Viasat satellite modems across Europe in one morning.", where: "Viasat card" },
    { t: "Espionage", what: "Spying: getting into networks and staying hidden as long as possible to read emails, calls and documents. Nothing visible breaks.", eg: "Salt Typhoon, disclosed in 2024: a group linked to China lived for years inside US telecom networks and read call records of senior politicians.", where: "Salt Typhoon card" },
    { t: "Pre-positioning", what: "Getting into a system now and doing nothing, so that it can be switched off later, in a crisis or a war.", eg: "In February 2024 US agencies warned that Volt Typhoon, a group linked to China, had sat inside US water, energy and transport systems for at least five years, apparently to be able to disrupt them in a crisis." },
    { t: "Sabotage", what: "Damaging or stopping a system on purpose: switching off power, breaking machines, wiping data.", eg: "Stuxnet, discovered in 2010, made the centrifuges of Iran's uranium enrichment plant spin too fast while showing normal readings to the operators." }
  ]},
  { group: "4 · Who attacks", items: [
    { t: "Criminal gang", also: "financially motivated", what: "Attackers who want money: ransom, stolen money, data to sell. They run like companies, with staff, help desks and affiliates.", eg: "LockBit was one of the largest ransomware gangs until police from ten countries took over its leak site in February 2024.", where: "Chart W4" },
    { t: "State-sponsored group", what: "Hackers who work for a government, often inside its army or intelligence service, or who are tolerated and directed by it.", eg: "The US, the UK and the EU attributed the Viasat attack of 2022 to Russia.", where: "Category 2" },
    { t: "Hacktivist · proxy", what: "A hacktivist attacks for a political cause. A proxy is a group that is not officially part of a state but acts in its interest, which lets the state deny involvement.", eg: "NoName057(16), a pro-Russian group, floods the websites of European governments and companies that support Ukraine.", where: "Chart W4" },
    { t: "DDoS", also: "distributed denial of service", what: "Flooding a website with so many fake visits from thousands of computers at once that real visitors cannot get through. Nothing is stolen; the site is just unreachable for a while.", eg: "In April and May 2007, Estonia's banks, newspapers and ministries were knocked offline for days after a dispute with Russia over a war memorial.", where: "Chart W4" },
    { t: "Insider", what: "A person inside the organisation, an employee or contractor, who causes harm, on purpose or by mistake.", eg: "In 2023 Samsung engineers pasted secret source code into ChatGPT to check it; Samsung then banned such tools at work.", where: "Type card \"Insider and error\"" },
    { t: "Shadow AI", what: "Staff using AI tools the company has not approved, often by pasting company data into them.", eg: "The Samsung case above is the best-known example.", where: "Type card \"Insider and error\"" },
    { t: "AI-enabled attack", what: "An attack in which the criminals use artificial intelligence to do their work faster or more convincingly: writing phishing emails, faking voices and faces, finding flaws.", eg: "In early 2024 an employee of the engineering firm Arup in Hong Kong joined a video call with a fake \"chief financial officer\" made by AI, and transferred about $25 million.", where: "Chart A6, Binance card" },
    { t: "Penetration test (pentest)", what: "A test in which a company pays hackers to attack it, with permission, to find the holes before criminals do.", eg: "Under the EU's DORA rules, in force since January 2025, large banks must have their critical systems tested this way at least every three years." },
    { t: "Attribution", what: "Deciding, with evidence, who was behind an attack. Governments announce it publicly when they want to send a message.", eg: "On 10 May 2022 the UK said it was \"almost certain\" that Russia was behind the Viasat attack.", where: "Viasat, Binance and freezer cards" }
  ]},
  { group: "5 · Machines, money and losses", items: [
    { t: "Industrial controller · OT", what: "OT, operational technology, means the computers that run machines rather than offices: pumps, valves, freezers, production lines. A controller is the small box that tells one machine what to do.", eg: "The Aliquippa water controller (2023) and the French supermarket freezer controllers (2026) are OT.", where: "Chart W2, Aliquippa and freezer cards" },
    { t: "Router · edge device", what: "The boxes that connect a company's network to the internet and pass traffic in and out. They sit at the edge, so everything goes through them.", eg: "Salt Typhoon entered telecom networks through routers whose flaws had been known since 2018.", where: "Salt Typhoon card" },
    { t: "Wiretap · lawful intercept", what: "A wiretap is listening to someone's calls. Lawful intercept systems are the systems telecom companies must run so the police can listen, with a court order.", eg: "Salt Typhoon reached these systems, so it could see whom US authorities were watching.", where: "Salt Typhoon card" },
    { t: "Cryptocurrency · exchange · hot wallet", what: "Cryptocurrency is digital money, such as bitcoin, recorded on a public ledger. An exchange is a company where people buy and hold it. A hot wallet is the part of an exchange's money kept online for quick withdrawals, and so the easiest to steal.", eg: "In February 2025 about $1.5 billion was stolen from the exchange Bybit; the FBI attributed it to North Korea.", where: "Chart W3, Binance card" },
    { t: "Business email compromise", what: "A criminal pretends, by email, to be your boss or your supplier and asks you to pay an invoice to a new bank account.", eg: "Between 2013 and 2015 one man sent fake invoices in the name of a hardware supplier and got Google and Facebook to pay him about $100 million.", where: "Chart A4" },
    { t: "Investment fraud", what: "Victims are persuaded to put money into an investment that does not exist, often fake cryptocurrency platforms, after weeks of friendly messages.", eg: "It is the largest loss type in the FBI's 2025 figures.", where: "Chart A4" },
    { t: "Cost of a breach", what: "Everything a breach costs the company: investigating, fixing, lawyers, informing customers, fines, lost business. It is usually much larger than any ransom.", eg: "Change Healthcare's 2024 costs ran into billions of dollars; the ransom was $22 million.", where: "Charts A1, A5, A6" },
    { t: "Segmentation", what: "Dividing a network into separate compartments, like the watertight sections of a ship, so an attacker who enters one cannot reach the others.", eg: "Jaguar Land Rover, 2025: the factories stopped because production could not run without the office IT systems.", where: "Viasat and JLR cards" },
    { t: "DevSecOps · security automation", what: "DevSecOps means checking software for security problems while it is being written, not after. Security automation means tools that spot and block attacks by themselves, without waiting for a person.", where: "Chart A6" },
    { t: "Cyber insurance", what: "Insurance that pays some of the costs after a cyber attack, such as lost business and recovery.", eg: "Jaguar Land Rover reportedly had no cyber insurance in place in 2025.", where: "JLR card" }
  ]},
  { group: "6 · Who counts, and how to read the charts", items: [
    { t: "Verizon DBIR", what: "The Data Breach Investigations Report, published every year by the telecom company Verizon from cases sent in by police forces, insurers and security firms around the world.", where: "Charts E1, E2, E4" },
    { t: "IBM Cost of a Data Breach", what: "A yearly survey, paid for by IBM, of about 600 organisations that had a breach, asking what it cost them.", where: "Charts A1, A5, A6" },
    { t: "FBI IC3", what: "The FBI's Internet Crime Complaint Center, where victims, mostly in the US, report online crime and their losses. It counts only what people choose to report.", where: "Charts A2, A4" },
    { t: "The others", what: "Sophos: a security company that surveys ransomware victims. Chainalysis: a firm that traces cryptocurrency. Dragos: a firm that protects industrial systems. ENISA: the EU's cybersecurity agency. Coveware: a firm that negotiates with ransomware gangs for victims.", where: "Charts E5, W2, W3, W4, A3" },
    { t: "\"% of breaches\" and overlapping categories", what: "A share of breaches counts how many breaches involved something. One breach can involve a person, a stolen password and ransomware at once, so the shares can add up to more than 100.", where: "Charts E1, E4" },
    { t: "Average · median", what: "The average adds everything and divides by the count, so one huge case pulls it up. The median is the middle case: half are below, half above.", where: "Chart A1, tiles under E3" },
    { t: "Logarithmic scale", what: "An axis where each step is ten times the one before (1, 10, 100, 1,000). It lets a very small and a very large number fit on one chart.", where: "Chart A4" }
  ]}
];
