# CS Ops Lead Technical Challenge — Implementation Plan v2
## Churn Analysis, Revenue Health & Strategic Roadmap

---

## 0. Purpose of This Document

This plan serves two audiences simultaneously: the **technical team** building the analysis and the **VP of Customer Success** who will consume the outputs. Where relevant, we include plain-language explanations of how each metric is calculated so that any result can be walked through step-by-step without requiring a data background.

---

## 1. Data Sources & How We Use Each

The workbook contains four sheets. We treat them differently based on what they contain and whether they can be reliably connected.

### Primary Source: `CS_Ops_Case_Study_Final` (1,500 rows)
This is the **quantitative backbone** of the entire analysis. It contains one row per account with 12 months of MRR and TPV time series, plus churn metadata. All financial metrics, churn rates, cohort analysis, and trend charts are derived exclusively from this sheet.

**Columns used:**
- `Account` — unique identifier (ACC_ format)
- `Age_Months` — account age at the start of the analysis period
- `Churn_Date` / `Churn_Reason` — churn registration metadata
- `MRR_Month_1` through `MRR_Month_12` — monthly recurring revenue (Feb 2025 → Jan 2026)
- `TPV_Month_1` through `TPV_Month_12` — total payment volume processed each month

### Contextual Source: `Data Business Case` (1,260 rows)
This sheet has a **different account ID format** (`CL_` prefix vs `ACC_` prefix) and different column structure (point-in-time snapshot vs time series). Without a shared key or an explicit mapping table, we cannot reliably join these two sheets — doing so would be an assumption, not an analysis.

**How we use it:** Qualitatively, as business context. The columns `CS Group` (KAM, etc.), `Customer Success Path` (Active Growth / Stability / Potential Growth), and `Warning Metrics` tell us how the CS team currently categorizes accounts. This informs our framing of recommendations even without data merging. Specifically:
- The `Warning Metrics = "Normal"` field confirms that some form of health monitoring already exists — relevant context for the Future Vision section.
- The `Customer Success Path` categories validate the behavioral clusters we derive independently.
- If a mapping key is found in the future, enriching the quantitative analysis with this segmentation data would be a natural next step.

**We explicitly do not merge these sheets or draw quantitative conclusions from `Data Business Case`.** Any enrichment will be flagged as qualitative.

### Sheets 2 & 3
Sample/demonstration data. Not used in analysis but confirms the data schema and provides sanity-check examples.

---

## 2. Metric Definitions — Plain Language for the VP

Before running any code, this section defines precisely what each metric means and how it is calculated step by step. The goal is that any result can be reconstructed manually.

### 2.1 Monthly Recurring Revenue (MRR)
The fixed monthly fee an account pays to use the Ontop platform. This is **not** the payment volume they process — it is their subscription/service fee.

### 2.2 Total Payment Volume (TPV)
The total value of payroll payments processed **through** Ontop in a given month. An account can have a stable $1,500 MRR while processing $50K or $500K in TPV — these move independently.

### 2.3 Net Revenue Retention (NRR) — Step by Step

**What it answers:** "Of the revenue we had at the start, how much do we still have 12 months later?"

**Step-by-step calculation:**
1. Take all 1,500 accounts active in Month 1 (February 2025). Sum their MRR → this is **Starting MRR**.
2. Take those exact same accounts. Sum their MRR in Month 12 (January 2026) → this is **Ending MRR from existing customers**. Accounts that churned contribute $0 to this sum.
3. **NRR = (Ending MRR / Starting MRR) × 100**

**What a number below 100% means:** For every $100 we earned in February 2025 from those accounts, we now earn less than $100 in January 2026. The gap is the combined effect of churned accounts (full loss) and contracting accounts (partial loss), net of any accounts that grew their MRR.

**Our result: NRR = 79.43%**
- Starting MRR (Feb 2025): **$4,476,064**
- Ending MRR (Jan 2026, same accounts): **$3,555,135**
- Revenue lost over 12 months: **~$921K**
- For every $100 earned in Feb 2025, we retain **$79.43** in Jan 2026.

**Industry benchmark context:** Healthy B2B SaaS targets >100% NRR (meaning expansion from existing accounts offsets any losses). SMB-focused payroll platforms typically see 80–90% NRR due to higher exposure to business closures. At 79.43%, we are at the lower edge of this range — meaningful but not catastrophic. The waterfall breakdown below shows where the losses are concentrated.

**NRR Waterfall (to build in the dashboard):**

| Component | Amount |
|---|---|
| Starting MRR (Feb 2025) | +$4,476,064 |
| Expansion MRR (accounts that grew) | +[to be computed] |
| Contraction MRR (accounts that shrank but didn't leave) | −[to be computed] |
| Churn MRR (accounts that went to $0) | −[to be computed] |
| **Ending MRR (Jan 2026)** | **= $3,555,135** |
| **NRR** | **79.43%** |

> **Note on Expansion:** Since the dataset does not include plan type or pricing tier changes, any month-over-month MRR increase for an account is treated as expansion (more seats, higher volume tier). This is a reasonable inference from the data available, and we flag it as an assumption rather than a certainty.

### 2.4 Churn Rate — Step by Step

**What it answers:** "What percentage of our accounts left during this 12-month period?"

We define churn in two layers to be rigorous:

**Layer 1 — Formal Churn (registered):**
An account is formally churned if `Churn_Date` is not empty. These are accounts where someone logged the departure.

**Layer 2 — Behavioral Churn (unregistered):**
An account is behaviorally churned if:
- `Churn_Date` is empty (not formally registered), AND
- `MRR_Month_12 = 0` (they are no longer paying in the last month)

These are "silent churners" — customers who stopped paying but were never formally processed as churned. They are invisible to a registration-only count but very real in the revenue data.

**Why this distinction matters for the VP:** If formal churn shows 21.87% but behavioral churn adds another 3–5%, the real revenue impact is larger than the dashboard metric suggests. The VP should know both numbers to allocate CS resources correctly.

**Churn Rate (formal) = Accounts with Churn_Date / Total Accounts = ~328 / 1,500 = 21.87%**

**Effective Churn Rate = (Formal + Behavioral) / Total Accounts** → to be confirmed in the analysis run.

**For accounts where `Churn_Reason` exists but `Churn_Date` does not:** We identify the churn month by finding the first month where MRR drops to $0 and stays at $0. This account is counted in both formal and behavioral churn.

**For accounts where `Churn_Date` exists but `Churn_Reason` is missing:** Counted as churned, categorized as "Unspecified." Not excluded from the rate.

### 2.5 TPV/MRR Efficiency Ratio
**What it answers:** "How much payment volume does each dollar of subscription fee represent?"

`Efficiency = Average Monthly TPV / Average Monthly MRR`

A ratio of 15 means the account processes $15 in payroll for every $1 they pay Ontop. Higher is better from a platform utilization perspective — these accounts are deeply embedded in their payroll workflow.

---

## 3. Data Integrity & N/A Handling

### 3.1 MRR / TPV Missing Values
- A `NaN` in a month's MRR or TPV that falls **after** the account's confirmed churn date is treated as `0.0`. The account has no activity, so zero is accurate.
- A `NaN` that falls **between** two months with positive revenue is **not** filled with zero — it is treated as a missing data point and excluded from volatility calculations to avoid false signals.
- A `NaN` that falls **before** Month 1 activity (i.e., account started after Month 1) is treated as `0.0`.

### 3.2 Churn Date / Reason Reconciliation

| Scenario | Handling |
|---|---|
| Both `Churn_Date` and `Churn_Reason` are null + MRR_Month_12 > 0 | Active account |
| Both are null but MRR_Month_12 = 0 | **Behavioral Churn** — flag separately |
| Has `Churn_Reason`, no `Churn_Date` | Identify churn month from first month MRR hits $0 and stays $0 |
| Has `Churn_Date`, no `Churn_Reason` | Churned, reason = "Unspecified" |
| Both present | Standard churned account |

---

## 4. Analytical Framework

### Phase A — Revenue Health (The "What")

#### A1. NRR Waterfall
Compute the four components explicitly (Starting, Expansion, Contraction, Churn MRR) so the dashboard can display a waterfall chart. The single NRR percentage is the headline; the waterfall is the story.

#### A2. MRR & TPV Trend
Plot both MRR and TPV month by month across the 12-month period. A critical divergence is already visible in the data:

- **MRR trend:** Declining — $4.47M → $3.55M (−20.6%)
- **TPV trend:** Growing — $67.1M → $112.7M (+67.8%)

This divergence is the most important single insight in the dataset. Revenue is falling while actual platform usage is growing. It means: **we are losing paying subscribers while the remaining customers are processing more payroll than ever.** The platform has strong product-market fit; the problem is retention, not value delivery.

#### A3. Churn Spike — Corrected Month Mapping

**The analysis period starts in February 2025 (Month 1).** The mapping of relative analysis months to calendar dates is:

| Analysis Month | Calendar Date |
|---|---|
| Month 1 | Feb 2025 |
| Month 2 | Mar 2025 |
| Month 3 | Apr 2025 |
| Month 4 | May 2025 |
| Month 5 | Jun 2025 |
| Month 6 | Jul 2025 |
| Month 7 | Aug 2025 |
| Month 8 | **Sep 2025** |
| Month 9 | Oct 2025 |
| Month 10 | Nov 2025 |
| Month 11 | Dec 2025 |
| Month 12 | Jan 2026 |

**Bug in v1 code:** The original code used `pd.to_datetime(df['Churn_Date']).dt.month` which extracts the **calendar month number** (August = 8, September = 9). This creates a **one-month offset** from the analysis period. The output showing "8.0 = 143 churns" means 143 accounts registered a churn date in calendar month 8 (August), which is **relative Month 7** of the analysis — not Month 8.

**Corrected approach:** Map each `Churn_Date` to its **relative analysis month** using the analysis start date of February 2025 as the anchor. In the corrected analysis, relative Month 8 = September 2025.

**Intent:** We do not assume whether the spike falls in August or September until the corrected calculation is run. The goal is to present the spike at its actual position in the analysis timeline. After correction, we investigate the spike:
- Is it a real business event (seasonal payroll cycles end, annual contract renewals, competitive campaign)?
- Is it a data recording artifact (were churn events batch-entered in a single month)?
- The 143-churn spike (vs. 8–26 in other months) is extreme enough to require a note in the presentation: "Spike at Month X warrants further investigation."

#### A4. Churn Driver Analysis — Controllable vs. Uncontrollable

We report churn reason impact using **MRR at the month immediately before churn** (not Month 1 MRR, which overstates or understates impact for accounts that grew or contracted before leaving).

We then split all churn reasons into two strategic buckets:

**Uncontrollable Churn** — CS team intervention cannot prevent this:
- `No longer has workforce` → The company shut down, downsized to zero employees, or paused operations. There is no Ontop action that retains a company with no payroll.

**Controllable Churn** — CS team can directly address:
- `Left for competition` → Win-back campaigns, competitive feature parity, account management
- `Missing Product Features` → Product roadmap feedback loop, interim workarounds
- `Pricing` → Commercial discussions, contract restructuring, value demonstration
- `Compliance` → Education, dedicated compliance support

**Why this matters for the VP's resource allocation:** "No longer has workforce" accounts for ~53% of lost MRR by the initial estimate. If the VP directs CS resources toward recovering this bucket, they are trying to rescue companies that no longer exist. The $340K in controllable churn (Competition + Features + Pricing) is where CS investment has direct ROI.

#### A5. Customer Lifecycle — Age vs. Churn Rate by Bucket

**Why we replaced the correlation approach:** The v1 plan computed a Pearson correlation of 0.0134 between `Age_Months` and churn. Pearson measures only **linear** relationships. If churn follows a U-shape (high for new accounts, low for mid-life, rising again for old accounts — a common SaaS pattern), Pearson returns ~0 even when the relationship is meaningful. A result of 0.0134 does not mean "age doesn't matter" — it means "age and churn are not linearly related."

**Correct approach:** Compute and present **churn rate by age bucket:**

| Age Cohort | Accounts | Churned | Churn Rate |
|---|---|---|---|
| 0–6 months | [n] | [n] | [%] |
| 6–12 months | [n] | [n] | [%] |
| 1–2 years | [n] | [n] | [%] |
| 2–5 years | [n] | [n] | [%] |

This table is VP-readable, directly actionable ("we lose X% of accounts in their first 6 months"), and requires no statistical background to interpret.

#### A6. Cohort Efficiency — TPV/MRR by Age Group

The 2–5 year cohort shows dramatically higher efficiency (~25x) vs. all younger cohorts (~15x). This is a strategic finding: **established customers process significantly more payroll volume per dollar of MRR.** They are the highest-utilization, likely highest-LTV segment.

The `5y+` cohort returns NaN (no accounts older than 60 months). This is not a data error — it reflects Ontop's platform age. There is no long-tenure cohort yet because the platform is still building toward that stage. This context belongs in the executive report: it means all current retention benchmarks are from a still-maturing customer base.

---

### Phase B — The Bleed Story (The "Why")

#### B1. TPV as a Leading Indicator

In payroll SaaS, TPV is **behavioral data** — it reflects whether employees are actually getting paid through the platform. MRR is a **contractual obligation** — it reflects the billing agreement, which changes more slowly than behavior.

A customer who stops running payroll through Ontop (TPV drops) will eventually cancel their subscription (MRR drops), but the TPV signal typically appears **1–2 months earlier.** This lag is the intervention window.

#### B2. Bleed Index — Corrected Definition

We flag an account as "Bleeding" if it meets either of the following conditions based on a **2-month moving average** (using "60-day" language is a misfit for monthly data):

- **Condition 1 (Usage Bleed):** TPV has declined >X% over a 2-month window while MRR remains flat. (The X% threshold is derived empirically from the data: we compute the distribution of 2-month TPV changes among confirmed churners and set the alert at the median of that distribution — not an arbitrary 30%.)
- **Condition 2 (Revenue Bleed):** MRR has declined for 2 consecutive months without a registered churn event.

**Bleed Composite Score:**
```
Bleed Score = α × |% MRR Change| + (1 − α) × |% TPV Change|
```
- Both components are expressed as **percentage changes** (not absolute values) so they are on the same scale.
- We use α = 0.4 (MRR) and (1−α) = 0.6 (TPV). This reversal from v1 is intentional: if TPV is the leading indicator, it should carry more weight in an early warning score. MRR change remains included because it has direct P&L impact.
- These weights should be validated once we know which accounts in the dataset were "bleeders before churn" — if the data shows MRR change is actually more predictive, we adjust accordingly.

#### B3. Zombie Accounts
Accounts where TPV has declined to near-zero but MRR remains positive are "Zombies" — still paying, no longer using. These are at highest risk for surprise churn and represent a CS outreach priority. We identify them, count them, and flag them for the VP.

#### B4. Behavioral Clustering

We perform a cluster analysis (K-Means, k=3 or 4 to be validated by elbow method) using three normalized variables:
- **TPV Stability:** Standard deviation of monthly TPV across 12 months (low = stable, high = volatile)
- **MRR Efficiency:** Average TPV/MRR ratio
- **Account Age:** Age_Months at the start of the period

**Target output:** 3–4 named behavioral profiles. Examples:
- *"Stable High-Efficiency"* — long-tenured, high TPV/MRR, low volatility → protect and expand
- *"Volatile Newcomers"* — young accounts, high TPV swings → early onboarding attention
- *"Silent Bleeders"* — declining TPV, stable MRR → urgent CS outreach

We present **3 core health signals** in the executive report — complexity beyond 3 metrics dilutes the VP's attention without increasing action clarity.

---

### Phase C — Sensitivity Analysis (The "Stakes")

**Purpose:** Give the VP a concrete, quantified understanding of what improving or failing to improve churn means in annual revenue terms. This is the financial justification for CS investment.

**Methodology:**
- Baseline MRR at start of period: $4,476,064/month → **$53.7M annualized**
- Average MRR per account: $4,476,064 / 1,500 = **$2,984/month**
- Current formal churn: 21.87% → ~328 accounts/year lost
- MRR lost to churn (direct): ~$921K/month → **~$11.1M annualized**

**Scenarios:**

| Churn Rate Scenario | Accounts Lost/Year | Annual MRR Lost | vs. Current | Implied NRR |
|---|---|---|---|---|
| 10% (target) | 150 | ~$5.4M | **+$5.7M saved** | ~90% |
| 15% (improved) | 225 | ~$8.1M | **+$3.0M saved** | ~85% |
| **21.87% (current)** | **328** | **~$11.1M** | **baseline** | **79.4%** |
| 25% (worsening) | 375 | ~$12.7M | −$1.6M more lost | ~75% |
| 30% (deterioration) | 450 | ~$15.3M | −$4.2M more lost | ~70% |

> **Assumption:** These projections use average MRR per account as a proxy for lost revenue per churned account. In reality, high-MRR accounts that churn have a larger impact; the scenarios represent order-of-magnitude estimates rather than precise forecasts. A more refined version could weight by MRR tier once cohort-level data is available.

**Key message for the VP:** Reducing churn from the current 21.87% to 15% is worth approximately **$3M in protected annual revenue** — before counting any expansion from retained accounts. If retained accounts grow their TPV over time (as the 2–5 year cohort data suggests), the true value of retention is higher.

This chart belongs in Slide 4 as the financial anchor for the action plan.

---

### Phase D — Future Vision: Proactive Churn Intelligence (The Pitch)

**This section is a strategic proposal, not a build plan.** We are not building an ML model as part of this challenge. We are demonstrating that the data we already have is sufficient to power a proactive early warning system — and proposing that as the next investment.

#### What the Data Already Tells Us

The 12-month time series contains genuine predictive signals:
- **TPV trajectory in Months 1–4** of an account's life appears to separate high-volatility accounts from stable ones.
- **The "Bleed Index"** (defined above) identifies accounts deteriorating 1–2 months before formal churn registration.
- **Age cohort churn rates** show which lifecycle stage carries the most risk.
- The `Warning Metrics` field in the CS operational data suggests some health monitoring is already in place — but it is manual and reactive.

#### What a Proactive System Would Add

A properly scoped early warning system would:
1. **Ingest** TPV and MRR signals month-by-month as they are produced (not in a 12-month retrospective)
2. **Score** each account with a rolling Bleed Index — updated every month
3. **Rank** the CS team's portfolio by risk, so outreach is prioritized, not reactive
4. **Flag** "Zombie" accounts (TPV dropping, MRR flat) before they formally churn

#### Why This Is Feasible with Existing Data

The features needed to train such a system are already present in `CS_Ops_Case_Study_Final`:
- TPV and MRR trends (Month 1–12)
- Account age
- Churn outcomes (labels for supervised learning)

A Random Forest or gradient boosting classifier could be trained retrospectively on the current dataset to identify which early-period signals (Months 1–4) best predict churn by Month 12. This avoids the target leakage problem present in the v1 model (which used Month 12 data to "predict" Month 12 outcomes — circular logic). A future model would be trained only on early signals to predict late outcomes.

#### What This Is Not

We are not proposing to deploy a production ML model from this analysis. The current dataset (1,500 accounts, 1 year) is enough for a proof-of-concept and a compelling pitch — it is not enough for a production system without ongoing data pipelines, model validation, and CS workflow integration. We present this as: **"Here is what we could build, here is the data that proves we have the raw materials, and here is the business case for doing it."**

This positions the CS Ops function as forward-looking and data-driven without overpromising on current capability.

---

## 5. Dashboard Structure — Executive Presentation Flow

A single-page React/Vite application structured as a 5-slide executive walkthrough:

| Slide | Title | Key Content |
|---|---|---|
| 1 | **Revenue Health** | NRR headline (79.43%), MRR vs. TPV divergence chart, waterfall breakdown |
| 2 | **The Churn Story** | Churn rate (formal + behavioral), churn by reason (controllable vs. uncontrollable), churn spike by corrected relative month |
| 3 | **The Hidden Patterns** | Behavioral clusters, Bleed Index map, Zombie accounts, cohort efficiency by age |
| 4 | **The Stakes** | Sensitivity analysis chart — revenue impact at different churn rate scenarios |
| 5 | **The Opportunity** | Future Vision pitch — proactive churn intelligence, what we have, what we'd build |

**Stack rationale:**
- **Python** runs the analysis engine, outputs `analysis_results.json`
- **React/Vite** consumes the JSON and renders the interactive dashboard (hover tooltips, cohort toggles, sensitivity slider)

---

## 6. Verification Plan

### Automated
- **NRR sanity check:** Verify that `(Starting MRR − MRR lost to formal churn − MRR lost to behavioral churn + expansion) ≈ Ending MRR` within a 1% tolerance.
- **Churn count reconciliation:** Verify that formal churn count from `Churn_Date.notna()` + behavioral churn count from `MRR_Month_12 == 0` does not double-count accounts.
- **Build check:** `npm run build` must pass before any demo.

### Manual
1. **Churn spike month validation:** Confirm the corrected relative month mapping is applied before presenting the spike finding.
2. **Churn reason split:** Confirm that "No longer has workforce" is correctly isolated in the "uncontrollable" bucket and that the VP-facing chart leads with controllable churn.
3. **Sensitivity chart:** Confirm that the "current" scenario row in the table reproduces the actual NRR (79.43%) to validate the model's baseline.
4. **Bleed Index threshold:** Confirm the TPV drop threshold is derived from churner distribution data, not set arbitrarily.
5. **Cluster narrative:** Confirm that at least one cluster maps clearly to known churner behavior (e.g., the cluster with highest churn rate should have the highest average Bleed Index).

---

## 7. Open Questions to Resolve Before Deployment

1. **Churn spike true month:** Does the corrected relative-month mapping confirm the spike at Month 8 (September 2025), or does it shift? What explains the concentration?
2. **Behavioral churn count:** How many additional accounts have `MRR_Month_12 = 0` without a registered `Churn_Date`? This changes the headline churn rate.
3. **Account mapping between sheets:** Is there any mapping table or common identifier that links `Platform Client ID` (CL_ format) to `Account` (ACC_ format)? If yes, the CS Group and Warning Metrics fields become quantitatively usable.
4. **Sensitivity analysis weights:** Should the $2,984 average MRR/account be refined by cohort? High-value churners have an outsized impact on the scenario projections.
