---
title: "The Quiet Inflation"
subtitle: "How a strait reprices a GPU hour"
byline: "vizzmaya · The Asymmetry Letter · March 2026"
date: "2026-03-01"
theme:
  colors:
    background: "#052f4a"
    text: "#e0ddd5"
    accent: "#f54900"
    accent2: "#155dfc"
    teal: "#00d5be"
    surface: "#023555"
    muted: "#aca286"
    positive: "#009966"
    amber: "#EF9F27"
    red: "#E24B4A"
  fonts:
    serif: "Georgia"
    sans: "Inter"
    mono: "JetBrains Mono"
---

# South Korea Makes the Memory and Builds the Ships. It Just Lost All Three Energy Lines.

*The country that produces the majority of the world's AI memory chips and 84% of its LNG carriers is simultaneously losing its oil, its gas, and its helium from the same chokepoint. Here is how that reprices every GPU hour on earth.*

**By vizzmaya · The Asymmetry Letter · March 2026**

---

## 18%

South Korea's stock market plunged 18% in four trading days — the worst since 2008. Over $500 billion erased. Samsung and SK Hynix each fell more than 20% in a single week.

The market panic is the visible crisis. The invisible one is what's happening inside the fabs and the shipyards.

---

## Act I: The most consequential industrial economy in this crisis

South Korea did not start this war. It has no leverage over the combatants. It does not control the strait. But it may be the single most important economy in this conflict — because it sits at the intersection of two industries the world cannot function without, and both are powered by the same energy grid.

The government imposed fuel rationing on March 25: a one-day-per-week vehicle ban for 1.5 million government vehicles, enforced by licence plate number. Oil at $119 a barrel. 1.7 million barrels of crude bound for Seoul delayed or stranded every day.

But the fuel rationing is the visible crisis. The invisible one is what's happening inside the fabs and the shipyards.

### The triple exposure

**Oil: 70%** of crude from the Middle East. Used for naphtha — a feedstock for semiconductor chemicals, not just fuel. Now on the government's "economic security" watchlist.

**Gas (LNG): 26%** of electricity generated from gas. Qatar declared force majeure on Korean contracts. SK Hynix was building an LNG plant to power its own fabs. That gas now carries a 3-5 year disruption notice.

**Helium: 64.7%** of helium from Qatar. The highest dependency of any major chip-producing nation. No substitute exists for plasma etch cooling.

### The memory dominance

SK Hynix holds **62%** of global HBM — the memory NVIDIA cannot build an H100, B200, or Blackwell Ultra without. Samsung holds **33%** of global DRAM. Combined: the majority of memory in every AI training cluster on earth. HBM is sold out through 2026. Zero slack.

NVIDIA derived 27% of SK Hynix's total revenue in the first half of 2025 — approximately 10.9 trillion Korean won. UBS projects SK Hynix will capture roughly 70% of the HBM4 market for NVIDIA's next-generation Rubin platform. Bank of America defines 2026 as a memory supercycle, forecasting the HBM market to reach $54.6 billion, a 58% increase year over year.

This is the market that South Korea's energy crisis now threatens.

### The shipbuilding dominance

Here's the connection nobody else has made.

South Korea also builds **84%** of the world's LNG carriers. HD Hyundai, Samsung Heavy Industries, and Hanwha Ocean delivered 248 carriers between 2021 and 2025 — versus 48 from China. Korean yards hold two-thirds of the global LNG carrier orderbook by value, at $71.3 billion. A single 174,000-cubic-metre LNG carrier costs $220-260 million and takes 30-36 months from steel cutting to delivery.

Gas carriers make up over 60% of Korean shipyard order composition. Korean vessel exports hit $31.8 billion in 2025. This is not a peripheral industry. It is a pillar of the economy.

### One grid, all exposed

Both industries — semiconductors and shipbuilding — run on the same energy grid. A grid where fossil fuels dominate. Where renewable energy is just **9.6%** of the power mix — less than a third of the global average. Where the country was *building more LNG power plants* to feed the fabs, right up until the gas stopped flowing.

South Korea is losing three supply lines simultaneously. Oil. Gas. Helium. All from the same chokepoint. The country that fabricates the memory chips that make artificial intelligence physically possible is being energy-starved by a war it did not start, in a strait it does not control, over a conflict between nations it has no leverage to influence.

---

## Act II: The chokepoint — how Qatar's helium reaches a Korean fab

The chain that connects the Strait of Hormuz to a GPU shortage in Santa Clara runs through helium extraction plants, cryogenic separation, and a market structure that almost nobody covering this story has gotten right.

Qatar's three helium plants at Ras Laffan produce roughly one-third of global supply — 33.2%, according to the USGS 2026 Mineral Commodity Summaries. Helium 1 (660 million standard cubic feet per year, online 2005), Helium 2 (1.3 billion scf, the world's largest, online 2013), and Helium 3 (400 million scf, online approximately 2021).

All three have been offline since March 2. Helium is extracted from the natural gas stream during cryogenic liquefaction. When the gas stops flowing, the helium stops flowing. One-third of global supply, removed in a single week.

But the helium market has a structure that makes the impact slower than the headlines suggest — and more dangerous than the reassurances admit.

### The misleading spike

Spot helium surged 50-100% in March. Northeast Asia hit **$153/MCF** — a 21.5% month-on-month increase. Headlines screamed shortage.

But here's what they didn't say: spot is only **2%** of the helium market. The other 98% trades on long-term contracts at $500-600/MCF. Those contracts haven't moved. The invoices are calmer than the headlines.

As helium consultant Phil Kornbluth told CNBC: "Spot prices comprise a very small slice of helium sales because it's mostly a long-term contract business. So even though it makes for good headlines, it doesn't have that much impact on the marketplace."

### The 6-month inflection

The real event comes at months 4-6. Contracts come up for renewal. Force majeure triggers renegotiation. If Qatar stays offline, contract prices climb toward $1,000-2,000/MCF — a 2-4x increase on the 98% of the market that actually matters.

That's when Korean fabs feel it in their operating budgets.

### The stockpile runway

Samsung holds approximately six months of helium stockpile plus an 18% consumption reduction via its Helium Reuse System. TSMC maintains helium from multiple suppliers with over two months of stock and has achieved recycling rates of 60-75%. Over 70% of fabs in Taiwan and Japan already operate helium recycling systems.

The question isn't whether there's a buffer. There is. The question is what happens at month 7.

The United States produces 42% of global helium but cannot rapidly scale. The former Federal Helium Reserve in Amarillo was privatised in June 2024 and can no longer serve as a government strategic buffer. Russia's Amur Gas Processing Plant has design capacity roughly equal to Qatar's output but faces Western sanctions. Algeria produces only 5-10% of global supply. Tanzania's emerging helium projects are years from commercial production.

If the conflict extends beyond six months, the structural deficit has no easy solution.

---

## Act III: One chip price tells the whole story

Everyone is asking: will Silicon Valley get its chips?

Wrong question. The right question is: at what price?

And the answer is visible in a single data point: the spot price of a DDR5 16Gb chip, tracked daily by DRAMeXchange.

### The trendline

This is the empirical backbone — not an assumption, but a price that updates every trading day.

From $6.84 in September 2025 to $27.20 in December: a **3.4x increase in 10 weeks.**

This happened before the first missile hit Ras Laffan.

The driver was not geopolitics. It was the AI boom itself. HBM production consumes **3x the wafer capacity** per gigabyte compared to standard DRAM. Every wafer allocated to an HBM stack for an NVIDIA GPU is a wafer denied to smartphones, laptops, and servers. Google, Amazon, Microsoft, and Meta placed open-ended orders — accepting any supply at any cost.

The memory supercycle was the crisis. Hormuz is the accelerant.

### The pre-existing fire

DRAM prices rose 172% through 2025. DDR5 contract pricing more than doubled. Server DRAM climbed 60% quarter-over-quarter in Q1 2026. Samsung halted new DDR5 orders to reassess pricing. SK Hynix reported HBM, DRAM, and NAND capacity "essentially sold out" for 2026. Distributors were down to 2-4 weeks of inventory.

All before the strait closed.

The AI boom was eating its own supply chain.

### What happens next: three scenarios

The DDR5 16Gb spot price absorbs every upstream shock into one number. When Korean energy costs rise, fab operating expenses increase, fewer wafers start, and the price moves. When helium contracts reprice, etch costs rise and the price moves. When the feedback loop tightens and LNG gets more expensive, Korean electricity costs rise, and the price moves.

**60-day resolution (DDR5 retreats to ~$18-20).** Stockpiles hold. Helium contracts don't reprice. The Hormuz increment is invisible against the pre-existing surge. GPU hour impact: **+2-4%**.

**6-month scenario (DDR5 climbs to ~$30-35).** Helium contracts reprice from $500-600 toward $1,000-1,500/MCF. Korean fabs cut utilisation 10-30% on helium-critical steps. Energy costs up 25-35% sustained. The supercycle faces a capacity reduction on top. GPU hour impact: **+12-20%**.

**3-5 year force majeure (DDR5 stabilises at $35-40 structural floor).** The cost curve shifts permanently. Korean fabs lose their cost advantage. Micron (US-based, zero Hormuz exposure) gains structural edge. Chinese memory makers (CXMT) accelerate. Korean shipyard dominance erodes as orders migrate to Chinese yards. GPU hour impact: **+30-50%** — and the "compute gets cheaper every year" assumption that underpins every AI business model breaks.

### The assumption nobody is stress-testing

Every AI business model assumes compute gets cheaper over time. Moore's Law applied to GPU hours. Each generation cheaper than the last.

The memory supercycle was already challenging that assumption. Hormuz — if it extends past South Korea's stockpiles — breaks it.

Watch the helium contract price. That's the leading indicator. When it moves, the DRAM price follows. When the DRAM price moves, the GPU hour reprices. That's the full transmission chain in one sentence.

---

## Act IV: The feedback loop nobody has connected

South Korea makes the chips. That's the story everyone has told.

Here's the story nobody has told.

South Korea also builds the ships that carry the gas that the rest of the world needs to replace Qatar's output. This isn't a separate crisis. It's an additional bottleneck in the same supply chain.

The same economy. The same energy grid. The same chokepoint.

### The loop

Korea's energy crisis puts pressure on the shipyards that build the LNG carriers the world needs to transport replacement gas. If carrier construction slips, the global LNG fleet grows more slowly at exactly the moment the world needs more ships. If there aren't enough ships, the gas shortage deepens. If the shortage deepens, Korean industry takes a harder hit.

The loop tightens. And it feeds directly back into every cost scenario in Act III.

### The circuit breakers

The doom loop has brakes. Korea is restarting five nuclear reactors and easing coal restrictions. Shipbuilding is moderately energy-intensive, far less than steelmaking or semiconductor fabrication. There are approximately 60 idle LNG carriers providing buffer. Any disruption to shipyard output today only affects deliveries in 2028-2029, given 30-36 month build timelines.

The loop grinds. It doesn't spiral immediately. But the longer the war lasts, the deeper it cuts.

If the crisis extends for years, Korean shipbuilding competitiveness erodes. Orders migrate to Chinese yards that are already capturing a growing share of the market. The 84% Korean dominance of LNG carrier deliveries begins to fracture. And that fracture arrives at exactly the moment when the global energy system needs maximum carrier capacity to compensate for the Qatari shortfall.

---

## What to watch

**For procurement leaders:** Accelerate helium recycling investment now. Korean fabs running 18% reduction via recycling; Taiwan/Japan at 60-75%. Monitor helium contract renewal dates — the repricing signal comes before the shortage. Naphtha and petrochemical input costs are already rising double digits.

**For investors:** The 60-day scenario is the base case. Start discounting at month 4-5 when helium contracts reprice. Watch Linde and Air Products as lead indicators of helium market tightening. Watch Korean shipyard order cancellations as the structural signal that the feedback loop is biting.

**For AI builders:** Model your unit economics with compute costs flat or rising 20-30% over 18 months. If your business model breaks at +30% GPU cost, it was already fragile. The Hormuz-independent memory supercycle was going to test you anyway.

---

## Methodology & sources

**DDR5 16Gb spot price data:** DRAMeXchange via Tom's Hardware (Sep-Dec 2025 specific data points: $6.84, $24.83, $27.20). March 2026 spot from Accio/TrendForce ($23.50). December contract price doubling from TeamGroup GM Gerry Chen via DigiTimes. Q1 2026 contract forecast from TrendForce (+55-60% QoQ conventional DRAM, +60% QoQ server DRAM).

**Helium pricing:** IMARC Group (NE Asia March 2026: $152.70/MCF, +21.5% MoM). ChemAnalyst (Q4 2025 contract pricing). Phil Kornbluth via CNBC (spot vs. contract market structure). DiscoveryAlert (contract $500-600/MCF).

**South Korea energy and economy:** Carnegie Endowment for International Peace ("The Iran War Is Also Now a Semiconductor Problem"). IEEFA ("Lagging renewables growth in South Korea"). Korea Economic Institute of America ("The Iran War Is Stress-Testing South Korea's Energy Model"). Stock market data from AInvest, Bitget News.

**Shipbuilding:** BusinessKorea (248 vs. 48 carrier deliveries, 2021-2025). VesselsValue (orderbook data, $71.3B backlog).

**Semiconductor supply chain:** USGS 2026 Mineral Commodity Summaries (Qatar at 33.2% of world helium production). KITA (South Korea 64.7% helium dependency). Counterpoint Research (SK Hynix 62% HBM, Q2 2025). TrendForce, J2 Sourcing, DiscoveryAlert.

**Scenario estimates:** Forward projections for DDR5 pricing and GPU hour impact are directional estimates derived from the empirical trendline, not precise forecasts. The 60-day scenario assumes supercycle moderation consistent with spot price pullback already observed (Dec $27.20 → Mar $23.50). The 6-month scenario is based on helium contract repricing at 2-4x flowing through fab OpEx. The 3-5 year scenario reflects structural reallocation of Korean competitive advantage consistent with Carnegie Endowment analysis.

**This analysis is not investment advice.**

---

*vizzmaya · The Asymmetry Letter · March 2026*
