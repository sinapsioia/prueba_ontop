# CS Ops Lead Technical Challenge - Churn Analysis & Prediction

This plan outlines the approach to solve the Ontop technical challenge, focusing on high-impact insights and a premium dashboard experience.

## Technical Deep Dive & Methodology

### 1. Metric Calculation & Assumptions
To calculate **NRR (Net Revenue Retention)** across 12 months, we utilize the following logic:
- **Starting MRR**: Total MRR from all accounts active in Month 1.
- **Expansion MRR**: Sum of positive deltas (Month $i$ > Month $i-1$) from existing customers. This assumes growth within a customer (upgrades, more seats, higher volume tiers).
- **Contraction MRR**: Sum of negative deltas (but still $>0$) from existing customers. This represents downgrades without full churn.
- **Churn MRR**: MRR from accounts that hit $0$ and stay at $0$ or have a churn date.
- **NRR Formula**: $\frac{\text{Starting MRR} + \text{Expansion} - \text{Contraction} - \text{Churn}}{\text{Starting MRR}}$.
- **Assumption**: Since we don't have "Plan Type" changes, expansion is inferred purely from revenue growth per ID.

### 2. Churn Prediction: Why Random Forest?
We selected **Random Forest** over simpler models (like Logistic Regression) for several reasons:
- **Feature Importance**: It provides a clear ranking of "Business Drivers." We can tell the VP exactly *which* metric (Age vs. TPV Volatility) is the biggest red flag.
- **Non-Linearity**: SaaS churn often isn't linear. A customer might be fine for 10 months and then drop due to a massive TPV crash in Month 11. Random Forests capture these thresholds effectively.
- **Parameters**: 
    - `n_estimators=100`: High enough for stability without over-calculating.
    - `max_depth=None`: Allows the trees to catch complex patterns in account behavior.
    - `random_state=42`: Ensures our findings are reproducible.

### 3. The Stack: Python + Vite (Complementary)
These tools are not alternatives; they are a **symbiotic pair**:
- **Python (The Engine)**: Used for heavy lifting—cleaning the 1,500 rows, running the statistical simulations, and training the ML model. It outputs a structured `analysis_results.json`.
- **Vite/React (The Interface)**: Used to build the "Impactful Dashboard." While Python can generate static plots, Vite allows the VP to *interact* (hover over spikes, toggle cohorts, walk through the executive presentation).
- **Seamless Integration**: Python "thinks," Vite "shows."

## Data Integrity & N/A Handling Strategy

To ensure a robust analysis without making unfounded assumptions, we will apply the following logic:

### 1. Revenue & Usage (MRR/TPV)
- **Assumption**: A `NaN` in a specific month's MRR or TPV is treated as `0.0` ONLY if it occurs before the account's first active month or after its last active month (churn).
- **Gaps**: If `NaN` occurs between two months with positive revenue, we will treat it as a "Missing Data Point" rather than 0 revenue to avoid skewing volatility metrics, unless the TPV is also 0 (which confirms no activity).

### 2. Churn Reconciliation
- **The "Active" Definition**: An account is "Active" if both `Churn_Date` and `Churn_Reason` are null AND it has positive MRR in the final month (Month 12).
- **Missing Dates**: If an account has a `Churn_Reason` but no `Churn_Date`, we will identify the churn month by finding the first month where MRR drops to 0 and stays at 0.
- **Inconsistent Reasons**: If an account has a `Churn_Date` but `NaN` for `Churn_Reason`, it will be categorized as "Unspecified Churn". We will not guess the reason, but we will still include it in the NRR and Churn Rate calculations.

### 3. Comprehensive "Bleed & Usage" Analysis
The case explicitly asks for "hidden" trends. We will analyze the relationship between usage (TPV) and revenue (MRR) to catch churn before it happens:
- **TPV as a Leading Indicator**: TPV represents the *actual volume* of payroll processed. A drop in TPV usually precedes a drop in MRR by 1-2 months.
- **The "Usage Bleed" Metric**: We will measure the 60-day moving average of TPV. If TPV drops by >30% while MRR remains flat, the account is flagged as "Functional Churn risk."
- **Usage-Revenue Divergence**: We will identify accounts where TPV is declining but MRR is stable. These are "Zombies"—customers who have stopped using the platform but haven't cancelled the subscription yet.
- **Integrated Bleed Index**: Our finalized Bleed Index will be a weighted score: $0.7 \times (\text{MRR Change}) + 0.3 \times (\text{TPV Change})$. This captures both financial and operational "bleeding."

### 4. Behavioral Clustering (The "Why" Story)
To move beyond surface numbers and explain *why* bleeding happens, we will perform a **Cluster Analysis**:
- **Clustering Variables**: TPV Stability (std dev of TPV), MRR Efficiency (TPV/MRR), and Account Age.
- **Narrative Groups**: We will identify 3-4 distinct "Behavioral Profiles" (e.g., *"High-Efficiency Scalers"* vs. *"High-Volatility Bleeders"*). 
- **The VP Story**: By analyzing the shared traits of the "Bleeder" cluster (e.g., "They all saw a TPV drop 4 months before churn"), we can provide concrete, non-predictive evidence of *what* is causing the impact.
- **Metric Distillation**: We will limit the presentation to **3 Core "Health Signals"** derived from this clustering to avoid overcomplicating the executive report.

## Proposed Changes

### 1. Advanced Data Analysis (Python)
We will use a Python engine to execute a sequential analytical flow:
- **Phase A: Core Metrics & Diagnostics**: Calculate NRR, Churn Drivers, and TPV/MRR Efficiency.
- **Phase B: Behavioral Clustering (The Diagnosis)**: Identify the 3-4 customer profiles and the "Why" behind the revenue bleed.
- **Phase C: Churn Prediction (The Pitch)**: Using the clusters as a foundation, train the Random Forest model to move from *reactive* diagnostics to *proactive* staging/intervention.

### 2. Interactive Dashboard & Executive Presentation (React/Vite)
A modern, single-page web application that mirrors the analytical flow:
- **Slide 1: Revenue Health**: The "Big Picture" (NRR & Metrics).
- **Slide 2: The Pattern**: Visualizing the Behavioral Clusters and the "Bleed" story.
- **Slide 3: The Future**: The Prediction Model (Risk Scores & Staging).
- **Slide 4: Action Plan**: Strategic Recommendations for the next quarter.

---

## Verification Plan

### Automated Tests
- **Data Validation Script:** Run a script to ensure NRR and Churn counts match between the raw data and the dashboard's processed JSON.
- **Build Check:** Run `npm run build` to ensure the dashboard compiles correctly.

### Manual Verification
1. **Dashboard Interaction:** Verify that hovering over charts shows detailed tooltips and that "Presentation Mode" flows logically.
2. **Prediction Logic:** Check if the model's "Most Important Features" align with the EDA results (e.g., if Age is a high driver, it should show up in feature importance).
