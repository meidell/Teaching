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
