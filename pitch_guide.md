# Ontop CS Operations — Pitch Guide
### How to walk someone through the dashboard and make them care

---

## The one sentence you are selling

Before you open the laptop, know this by heart:

> **"Our platform is working. Our revenue is leaking. We know exactly where, we know why, and we already have everything we need to stop it."**

Every slide either builds toward that sentence or reinforces it.
If a conversation takes you away from it, bring it back.

---

## Before you start — set the room up

Don't just open the first slide. Spend 30 seconds anchoring expectations:

- This is a data analysis of 2024 CS performance — numbers, not opinions
- By the end you want to agree on **one specific action for Q2**
- That's it. One action. Keep that promise.

---

## Slide 01 — Revenue Health
### *"The platform is growing. The revenue isn't. Here's why that matters."*

**Open with the number — 79.43% NRR — and let it sit for a second.**

Then explain what it actually means in plain English:
> NRR below 100% means that even if we sign zero new customers next year, we are still shrinking. We cannot outgrow a retention problem by selling harder.

**Show the waterfall chart.** Walk through it left to right like a story:
- We started the year with $4.47M in monthly recurring revenue
- Expansion added a real $98K — customers growing their contracts
- But churn took out $898K
- We ended at $3.55M — nearly $1M lighter than January

The math is structurally working against us.

**Now flip to the TPV vs MRR chart — this is the twist.**

TPV (total payroll volume processed) is going *up* while MRR goes *down*.
Customers are using the platform more, processing more payroll, and then cancelling.

Make this land clearly:
> This is not a product problem. The product is delivering value. This is a retention problem — and retention is CS.

---

## Slide 02 — Churn Story
### *"Let's name the problem precisely."*

**Start with scale.** 21.87% annual churn. SaaS B2B benchmark is 5–7%.
We are running at roughly 3× what healthy looks like.

**The behavioral churn being zero is actually good news** — say so.
Every single churner was formally registered. No hidden silent attrition.
The data is clean. That matters for everything that follows.

**Now go to the August spike.** This is the most dramatic moment in the slide.

15 churns per month on average.
August: 143.

That is not noise. That is a 9.5× jump in a single month.
You don't need to explain why — the data doesn't prove causation.
But you need to flag it as something that demands an investigation:
- Annual contract renewal cycle?
- Seasonal industry pattern?
- Batch data entry from a backlog?

Whatever the cause, proactive CS would have caught some of it.

**The reasons chart is where this gets strategic.**

Split the audience's attention in two:

- **Controllable ($404K — 45% of losses)**
  These customers left for reasons CS could have addressed.
  Price concerns, lack of perceived value, competitive alternatives.
  This is CS's addressable market.

- **Uncontrollable ($494K — 55% of losses)**
  "No longer has workforce" means the business closed.
  You cannot save a company that ceases to exist.
  Don't let this number create false pessimism.

The takeaway: **nearly half of what we lost was preventable.**
We are not fighting gravity. We are fighting inertia.

---

## Slide 03 — Hidden Patterns
### *"The data knows things we haven't been asking it."*

This is the most intellectually interesting slide. Give it room.

**The cohort churn chart delivers a counterintuitive finding.**

Most people expect newer customers to churn more.
The data says churn is uniform across every age group — ~21–22% whether an account is 3 months old or 3 years old.

What does that mean?
> The problem is not onboarding. It's ongoing engagement across the entire portfolio. There is no "safe" age group — everyone is at equal risk.

**The efficiency chart flips the conversation.**

Accounts aged 2–5 years process 25× more payroll per dollar of MRR than newer accounts.
These are your highest lifetime value customers.
If they churn, the revenue loss is disproportionate to their contract size.

The implication: these accounts deserve a premium retention track.
Losing one 4-year customer hurts far more than losing three 6-month customers.

**The cluster cards are the centerpiece of the slide.**

Think of these as four customer personality types discovered by the data:

| Profile | Size | Churn | What CS should do |
|---|---|---|---|
| **High-Risk Bleeders** | 157 accounts | 100% | Already gone — but the algorithm can spot the next ones early |
| **Volatile Newcomers** | 621 accounts | 24% | Largest risk pool — needs structured early engagement |
| **Tenured Stable** | 374 accounts | 3% | Protect at all costs — do not neglect these |
| **High-Efficiency Scalers** | 348 accounts | 2% | Upsell candidates — they're getting more value than they're paying for |

The most important thing to say about the High-Risk Bleeders:
> These 157 accounts have already churned, but they are algorithmically separable from the rest of the portfolio. A live version of this model, running today, would flag accounts that *look like* this cluster — before they leave.

Close the slide on the bleed health note: the active portfolio shows no accounts in active decline right now.
That is a window. Not a reason to relax.

---

## Slide 04 — The Stakes
### *"Let's put a dollar amount on the decision."*

Keep this slide short and sharp. The numbers do the work.

**Start with the bar chart — not the table.**

Point at the current bar (21.87%, amber).
> This is where we are. $11.7 million of annual MRR at risk.

Then point at the 15% bar.
> If CS brings churn to 15% — still twice the industry benchmark, but a realistic 12-month target — we protect $3.7 million per year.

**Use the table to make it feel human, not just financial.**

The accounts-lost column is important.
Every row is not just dollars — it's customer relationships, referral potential, expansion opportunities that won't happen.

**Reframe CS in the room.**

This is not a cost center conversation.
This is a $3.7M revenue protection conversation.
That changes the category CS operates in — from support function to revenue function.

---

## Slide 05 — Future Vision
### *"Here's what we build next — and it's simpler than you think."*

Open with a deliberate reframe:
> Everything I've shown you was backward-looking — 2024 in hindsight.
> This slide is about what we do with it in 2025.

**Walk through the three signals we already have — stress the word "already".**

- **TPV is a leading indicator.** It drops 1–2 months before MRR cancellation.
  We have 12 months of TPV history per account. That history is usable today.

- **The Bleed Score formula is defined.**
  Score = 0.4 × |MRR change| + 0.6 × |TPV change|.
  The threshold is empirically derived from real churner data.
  This is not a hypothesis — it's a validated formula.

- **The behavioral model is already trained.**
  Four clusters, clean separation, the High-Risk Bleeders profile exists.
  We know what a churner looks like before they churn.

No new data collection. No new tools. No new infrastructure budget.
The inputs exist today.

**The roadmap is deliberately conservative — use that.**

- **Month 1–2:** A Python script ingests monthly TPV/MRR data and scores every account.
  Output: a ranked list. That's it.
  This does not require a data engineer. It does not require new systems.

- **Month 3–4:** CS starts their week from the risk queue instead of gut feel.
  Same work, prioritized better. The highest-risk accounts get outreach first.

- **Month 5–6:** Only if months 1–4 show the model has predictive power.
  Train a forward-looking model. Validate on a held-out test period.
  This is the ambitious phase — earned by results, not promised upfront.

**The actual ask — say this clearly:**

> Approve a 60-day bleed score pilot.
> No new data. No new tooling. No additional headcount.
> At the end of 60 days, we have a ranked risk list and we know whether the model works.
> Then we decide whether to go further.

---

## How to close

Don't end with "any questions?" — end with a decision frame.

Present two paths:

**Path A — we run the 60-day pilot.**
We measure whether the bleed score predicts churn.
We use the results to decide on months 3–4.
Cost: CS team bandwidth + a few hours of data work.

**Path B — we don't.**
We enter 2026 with the same 21.87% churn rate and $11.7M at annual risk.
With no new information about which accounts to save first.

Then stop. Let them respond.

---

## If they push back

**"Is the August spike actually meaningful?"**
It's 9.5× the monthly average. Even if the cause is contract timing, that means renewals are not being managed proactively. That is a CS process question regardless of root cause.

**"More than half of churn is uncontrollable — isn't this just market attrition?"**
By MRR value, yes, 55% is business closures. But fixing only the controllable 45% gets us close to 12% churn and saves roughly $5M per year. We don't need to solve the uncontrollable portion to make this worthwhile.

**"Why 15% as the target?"**
It's the midpoint between where we are and healthy SaaS benchmarks. It's achievable in 12 months with targeted intervention. And $3.7M saved is a number the business can evaluate against the cost of CS effort.

**"Do we need engineering for this?"**
Phase 1 (Month 1–2) is a Python script and a spreadsheet. It does not require any engineering involvement. That is by design — we want to validate the model before we invest in building infrastructure around it.

**"The data is from a case study — does this apply to real data?"**
The analytical framework, the cluster model, and the bleed score are production-ready methodology. The numbers illustrate how the approach would work. The pilot would run on real production data.

---

## Pacing

| Slide | Time | What you're doing |
|---|---|---|
| Setup | 1 min | Anchor the room on one ask |
| Revenue Health | 4 min | Build the tension |
| Churn Story | 5 min | Name the problem precisely |
| Hidden Patterns | 6 min | Deliver the insights |
| The Stakes | 3 min | Make it financial |
| Future Vision | 5 min | Land the ask |
| Discussion | Open | Get to a decision |

**Total: ~25 minutes.** This is an executive briefing, not a workshop.
If it runs long, cut from Slide 03 — not from Slide 04 or 05.

---

*CS Operations Analysis · Ontop · Jan–Dec 2024*
