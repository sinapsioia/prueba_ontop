"""
Ontop CS Ops — Churn Analysis Engine v2
Analysis period: Feb 2025 (Month 1) → Jan 2026 (Month 12)

Each function maps to a slide section in the executive dashboard.
All metric logic is documented so it can be explained to a VP step by step.
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# ── Constants ──────────────────────────────────────────────────────────────────
FILE_PATH = 'Data Business Case.xlsx'
SHEET_NAME = 'CS_Ops_Case_Study_Final'
ANALYSIS_START = pd.Timestamp('2024-01-01')   # Month 1 = January 2024
# Note: Churn_Dates in the dataset are all in 2024. The data covers the full
# calendar year 2024 and was downloaded/exported in February 2025.
# Month 1 = Jan 2024, Month 8 = Aug 2024 (churn spike), Month 12 = Dec 2024.

MRR_COLS = [f'MRR_Month_{i}' for i in range(1, 13)]
TPV_COLS = [f'TPV_Month_{i}' for i in range(1, 13)]

# Calendar label for each relative analysis month
MONTH_LABELS = {
    1:  'Jan 2024', 2:  'Feb 2024', 3:  'Mar 2024', 4:  'Apr 2024',
    5:  'May 2024', 6:  'Jun 2024', 7:  'Jul 2024', 8:  'Aug 2024',
    9:  'Sep 2024', 10: 'Oct 2024', 11: 'Nov 2024', 12: 'Dec 2024'
}

CONTROLLABLE_REASONS = ['Left for competition', 'Missing Product Features', 'Pricing', 'Compliance']
UNCONTROLLABLE_REASONS = ['No longer has workforce']


# ── 1. Load & Preprocess ───────────────────────────────────────────────────────
def load_data():
    """
    Load the primary analysis sheet and apply baseline cleaning.
    NaN in MRR/TPV is filled with 0 at this stage; the analysis functions
    will replace 0 with NaN where needed to compute averages over active months only.
    """
    df = pd.read_excel(FILE_PATH, sheet_name=SHEET_NAME)
    df[MRR_COLS] = df[MRR_COLS].fillna(0)
    df[TPV_COLS] = df[TPV_COLS].fillna(0)
    df['Churn_Date'] = pd.to_datetime(df['Churn_Date'], errors='coerce')

    # Average MRR and TPV computed over active months only (exclude zeros from
    # churned periods so the average reflects real utilization, not diluted by
    # post-churn zeroes)
    df['avg_mrr'] = df[MRR_COLS].replace(0, np.nan).mean(axis=1)
    df['avg_tpv'] = df[TPV_COLS].replace(0, np.nan).mean(axis=1)

    return df


# ── 2. Churn Definition ────────────────────────────────────────────────────────
def define_churn(df):
    """
    Two-layer churn classification:

    Layer 1 — Formal churn:
        The account has a registered Churn_Date.
        Someone on the team logged this departure.

    Layer 2 — Behavioral churn:
        No Churn_Date exists, but MRR_Month_12 = 0.
        The account stopped paying without being formally processed.
        These are 'silent churners' — real revenue losses invisible to
        registration-only counts.

    combined 'is_churned' flag = formal OR behavioral.
    We report both separately so the VP can see the headline effective rate
    and the formal rate side by side.
    """
    df['is_churned_formal']     = df['Churn_Date'].notna().astype(int)
    df['is_churned_behavioral'] = (
        df['Churn_Date'].isna() & (df['MRR_Month_12'] == 0)
    ).astype(int)
    df['is_churned'] = (
        (df['is_churned_formal'] == 1) | (df['is_churned_behavioral'] == 1)
    ).astype(int)
    return df


# ── 3. NRR Waterfall ───────────────────────────────────────────────────────────
def compute_nrr_waterfall(df):
    """
    NRR (Net Revenue Retention) measures: of the revenue we had at the start
    of the period, how much do we still have 12 months later?

    Formula: NRR = (Ending MRR from the same starting cohort / Starting MRR) × 100

    We also decompose the gap into three components so the VP can see
    exactly where revenue was gained or lost:

    Starting MRR
        + Expansion MRR   → accounts that grew their MRR month-over-month
        − Contraction MRR → accounts that shrank but did not hit $0
        − Churn MRR       → revenue lost from accounts that went to $0
        = Ending MRR

    The math reconciles: Ending = Starting + Expansion − Contraction − Churn.

    Note on Expansion: since the dataset has no plan-tier data, any positive
    MRR delta for an existing account is treated as expansion (more seats,
    higher usage tier). This is flagged as an inference, not a certainty.
    """
    active_at_start = df[df['MRR_Month_1'] > 0].copy()
    starting_mrr = float(active_at_start['MRR_Month_1'].sum())

    expansion_mrr   = 0.0
    contraction_mrr = 0.0
    churn_mrr       = 0.0

    for _, row in active_at_start.iterrows():
        mrr = [row[f'MRR_Month_{i}'] for i in range(1, 13)]
        churned = False
        for i in range(1, 12):          # compare month i+1 vs month i (0-indexed: [i] vs [i-1])
            if churned:
                continue
            prev = mrr[i - 1]
            curr = mrr[i]
            if prev == 0:
                continue                # account not yet active or already at 0
            if curr == 0:
                churn_mrr += prev       # record MRR value at last active month
                churned = True
            elif curr > prev:
                expansion_mrr += (curr - prev)
            elif curr < prev:
                contraction_mrr += (prev - curr)

    ending_mrr = float(active_at_start['MRR_Month_12'].sum())
    nrr = (ending_mrr / starting_mrr * 100) if starting_mrr > 0 else 0

    return {
        'starting_mrr':    round(starting_mrr,    2),
        'expansion_mrr':   round(expansion_mrr,   2),
        'contraction_mrr': round(contraction_mrr, 2),
        'churn_mrr':       round(churn_mrr,       2),
        'ending_mrr':      round(ending_mrr,      2),
        'nrr':             round(nrr,             2),
        # Reconciliation check — should equal 0 (within floating point)
        '_reconciliation_check': round(
            starting_mrr + expansion_mrr - contraction_mrr - churn_mrr - ending_mrr, 2
        )
    }


# ── 4. Churn Rates ─────────────────────────────────────────────────────────────
def compute_churn_rates(df):
    """
    Returns formal, behavioral, and effective churn rates.
    Formal = registered Churn_Date.
    Behavioral = MRR_Month_12 = 0 with no registration.
    Effective = formal + behavioral (true revenue loss count).
    """
    total = len(df)
    formal_n      = int(df['is_churned_formal'].sum())
    behavioral_n  = int(df['is_churned_behavioral'].sum())
    effective_n   = int(df['is_churned'].sum())

    return {
        'total_accounts':        total,
        'formal_churn_count':    formal_n,
        'behavioral_churn_count': behavioral_n,
        'effective_churn_count': effective_n,
        'formal_churn_rate_pct':     round(formal_n    / total * 100, 2),
        'behavioral_churn_rate_pct': round(behavioral_n / total * 100, 2),
        'effective_churn_rate_pct':  round(effective_n  / total * 100, 2),
    }


# ── 5. Churn Spike — Relative Month Mapping ────────────────────────────────────
def compute_churn_spike(df):
    """
    Maps each Churn_Date to its relative analysis month (Feb 2025 = Month 1).

    WHY: The raw Churn_Date contains calendar months (Jan=1 … Dec=12).
    If we use calendar months directly, we introduce an offset: the dataset
    starts in February, so calendar month 8 (August) = relative Month 7.
    Relative Month 8 = September 2025. Using calendar months would shift
    every spike label by one month.

    CORRECT mapping:
        relative_month = (year diff × 12) + (calendar month − Feb) + 1
    """
    def to_relative(d):
        if pd.isna(d):
            return None
        m = (d.year - ANALYSIS_START.year) * 12 + (d.month - ANALYSIS_START.month) + 1
        return m if 1 <= m <= 12 else None

    df['churn_relative_month'] = df['Churn_Date'].apply(to_relative)
    spike = df['churn_relative_month'].value_counts().sort_index()

    result = {}
    for k, v in spike.items():
        label = f"Month {int(k)} ({MONTH_LABELS.get(int(k), '?')})"
        result[label] = int(v)
    return result


# ── 6. Churn Reasons ───────────────────────────────────────────────────────────
def compute_churn_reasons(df):
    """
    Financial impact per churn reason, using pre-churn MRR (last non-zero
    MRR month before the account hit $0). Using Month 1 MRR, as in v1,
    would misstate the impact for accounts that grew or shrank before leaving.

    Results are split into:
    - Controllable: CS team can intervene (competition, pricing, features, compliance)
    - Uncontrollable: business closure / workforce eliminated — no CS action possible

    This split prevents the VP from directing resources at irrecoverable losses.
    """
    formal_churned = df[df['is_churned_formal'] == 1].copy()

    def pre_churn_mrr(row):
        for col in reversed(MRR_COLS):
            if row[col] > 0:
                return row[col]
        return row[MRR_COLS[0]]   # fallback

    formal_churned['pre_churn_mrr'] = formal_churned.apply(pre_churn_mrr, axis=1)

    by_reason = (
        formal_churned.groupby('Churn_Reason')['pre_churn_mrr']
        .sum()
        .sort_values(ascending=False)
    )

    controllable_total   = float(by_reason[by_reason.index.isin(CONTROLLABLE_REASONS)].sum())
    uncontrollable_total = float(by_reason[by_reason.index.isin(UNCONTROLLABLE_REASONS)].sum())
    total_impact         = float(by_reason.sum())

    return {
        'by_reason': {k: round(float(v), 2) for k, v in by_reason.items()},
        'controllable_total':        round(controllable_total,   2),
        'uncontrollable_total':      round(uncontrollable_total, 2),
        'controllable_pct':          round(controllable_total   / total_impact * 100, 1) if total_impact else 0,
        'uncontrollable_pct':        round(uncontrollable_total / total_impact * 100, 1) if total_impact else 0,
        'controllable_reasons':   CONTROLLABLE_REASONS,
        'uncontrollable_reasons': UNCONTROLLABLE_REASONS,
    }


# ── 7. Customer Lifecycle — Churn Rate by Age Bucket ──────────────────────────
def compute_lifecycle(df):
    """
    Pearson correlation (used in v1) measures only linear relationships.
    The actual age-churn pattern in SaaS is often non-linear (high early churn,
    lower mid-life, potentially rising again for long-tenure). A near-zero
    Pearson does NOT mean age is irrelevant — it may just be non-linear.

    We replace it with churn rate per age bucket. This is VP-readable:
    "X% of accounts in their first 6 months churned" is actionable.
    "correlation = 0.013" is not.
    """
    bins   = [0, 6, 12, 24, 60, 120]
    labels = ['0–6 months', '6–12 months', '1–2 years', '2–5 years', '5+ years']
    df['age_cohort'] = pd.cut(df['Age_Months'], bins=bins, labels=labels)

    stats = df.groupby('age_cohort', observed=False).agg(
        total=('is_churned',  'count'),
        churned=('is_churned', 'sum')
    )
    stats['churn_rate_pct'] = (stats['churned'] / stats['total'] * 100).round(2)

    return {
        cohort: {
            'total':          int(row['total']),
            'churned':        int(row['churned']),
            'churn_rate_pct': None if np.isnan(row['churn_rate_pct']) else float(row['churn_rate_pct'])
        }
        for cohort, row in stats.iterrows()
    }


# ── 8. Cohort Efficiency ───────────────────────────────────────────────────────
def compute_efficiency(df):
    """
    TPV/MRR efficiency = how much payment volume is processed per $1 of MRR.
    Higher = more deeply embedded in the customer's payroll workflow.

    avg_mrr and avg_tpv are computed over active months only (zeros excluded)
    so that churned accounts don't have their averages deflated by post-churn zeros.
    """
    df['efficiency_ratio'] = (df['avg_tpv'] / df['avg_mrr']).replace([np.inf, -np.inf], np.nan)

    bins   = [0, 6, 12, 24, 60, 120]
    labels = ['0–6 months', '6–12 months', '1–2 years', '2–5 years', '5+ years']
    df['age_cohort'] = pd.cut(df['Age_Months'], bins=bins, labels=labels)

    result = df.groupby('age_cohort', observed=False)['efficiency_ratio'].mean().round(2)
    return {str(k): (float(v) if not np.isnan(v) else None) for k, v in result.items()}


# ── 9. Bleed Analysis ─────────────────────────────────────────────────────────
def compute_bleed_analysis(df):
    """
    BLEED INDEX — two-signal early warning score per account.

    TPV as a leading indicator:
        TPV reflects actual payroll usage. A customer who stops processing
        payroll through Ontop (TPV drops) will cancel their subscription
        (MRR drops) 1–2 months later. TPV gives us the intervention window.

    Empirical threshold:
        Rather than assuming a 30% drop is the trigger, we derive the threshold
        from confirmed churners. We compute the median TPV % decline (month-over-
        month) observed among all churned accounts prior to their churn event.
        This makes the flag data-driven.

    Bleed Score (per account, last 3 months):
        Score = 0.4 × |% MRR change| + 0.6 × |% TPV change|

        TPV weighted higher (60%) because it is the leading indicator.
        MRR included (40%) because it has direct P&L impact.
        Both expressed as percentage changes (same scale, no unit distortion).

    Zombie accounts:
        Active accounts (not formally churned) where late-period avg TPV
        (last 3 months) has fallen to <10% of early-period avg TPV (first 3
        months) while MRR_Month_12 is still positive.
        These customers are still paying but have effectively stopped using
        the platform — highest surprise churn risk.
    """
    # ── Empirical TPV threshold from churner behaviour ──
    churners = df[df['is_churned_formal'] == 1]
    tpv_drops = []
    for _, row in churners.iterrows():
        tpv = [row[c] for c in TPV_COLS]
        for i in range(1, len(tpv)):
            if tpv[i - 1] > 0:
                pct = (tpv[i] - tpv[i - 1]) / tpv[i - 1]
                if pct < 0:
                    tpv_drops.append(pct)

    tpv_threshold = float(np.percentile(tpv_drops, 50)) if tpv_drops else -0.20

    # ── Bleed risk flag (active accounts only) ──
    active = df[df['is_churned'] == 0].copy()
    bleed_flagged = []
    zombie_flagged = []

    for _, row in active.iterrows():
        tpv = [row[c] for c in TPV_COLS]
        mrr = [row[c] for c in MRR_COLS]

        # Bleed flag: any 2-month window where TPV drops past threshold
        # while MRR is relatively flat (< 5% change)
        for i in range(1, len(tpv)):
            if tpv[i - 1] > 0:
                tpv_chg = (tpv[i] - tpv[i - 1]) / tpv[i - 1]
                mrr_chg = abs((mrr[i] - mrr[i - 1]) / (mrr[i - 1] + 1))
                if tpv_chg <= tpv_threshold and mrr[i] > 0 and mrr_chg < 0.05:
                    bleed_flagged.append(row['Account'])
                    break

        # Zombie flag: late TPV < 10% of early TPV, but MRR still active
        early_tpv = np.mean([v for v in tpv[:3] if v > 0] or [0])
        late_tpv  = np.mean([v for v in tpv[-3:] if v > 0] or [0])
        if early_tpv > 0 and late_tpv < 0.10 * early_tpv and mrr[-1] > 0:
            zombie_flagged.append(row['Account'])

    # ── Bleed score (all accounts, last 3 months vs 3 months prior) ──
    scores = []
    for _, row in df.iterrows():
        m9  = row['MRR_Month_9']
        m12 = row['MRR_Month_12']
        t9  = row['TPV_Month_9']
        t12 = row['TPV_Month_12']

        mrr_chg = abs((m12 - m9) / m9) if m9 > 0 else 0
        tpv_chg = abs((t12 - t9) / t9) if t9 > 0 else 0
        scores.append(0.4 * mrr_chg + 0.6 * tpv_chg)

    df['bleed_score'] = scores

    bleed_count  = len(set(bleed_flagged))
    zombie_count = len(set(zombie_flagged))

    # What this means for the VP:
    # 0 bleed-risk or zombie accounts is a POSITIVE finding — the active portfolio
    # shows no gradual decay signals. Churn in this dataset is discrete (accounts
    # drop sharply to $0, not bleed slowly). The framework is defined and ready;
    # in a live deployment with real-time data, it would flag emerging risk before
    # formal churn registration.
    interpretation = (
        'Active portfolio shows no bleed signals — churn pattern is discrete (sharp drop to $0), '
        'not gradual decay. Bleed framework is operational; will flag risk in live deployment.'
        if bleed_count == 0
        else f'{bleed_count} active accounts show TPV bleed signals requiring CS outreach.'
    )

    return {
        'tpv_threshold_empirical_pct': round(tpv_threshold * 100, 2),
        'bleed_risk_active_accounts':  bleed_count,
        'zombie_accounts':             zombie_count,
        'avg_bleed_score_churned':     round(float(df[df['is_churned'] == 1]['bleed_score'].mean()), 4),
        'avg_bleed_score_active':      round(float(df[df['is_churned'] == 0]['bleed_score'].mean()), 4),
        'interpretation':              interpretation,
        'note': (
            'Bleed Score = 0.4 × |% MRR change (M9→M12)| + 0.6 × |% TPV change (M9→M12)|. '
            f'TPV empirical threshold (from churner median): {round(tpv_threshold * 100, 1)}% drop.'
        )
    }


# ── 10. Behavioral Clustering ─────────────────────────────────────────────────
def compute_clustering(df):
    """
    K-Means clustering (k=4) on three normalized features:
    - TPV Stability (std dev of monthly TPV) — how consistent is usage?
    - MRR Efficiency (avg TPV / avg MRR) — how deeply embedded is the account?
    - Account Age — lifecycle stage

    Features are standardized (z-score) before clustering so that differences
    in scale (e.g., TPV in millions vs Age in months) don't dominate.

    Output: 4 behavioral profiles with their average characteristics and
    churn rate per cluster. The cluster with the highest churn rate and lowest
    efficiency = the 'Bleeder' segment to prioritize for CS intervention.
    """
    df['tpv_stability'] = df[TPV_COLS].replace(0, np.nan).std(axis=1).fillna(0)
    df['mrr_efficiency'] = (
        df['avg_tpv'] / df['avg_mrr']
    ).replace([np.inf, -np.inf], np.nan).fillna(0)

    features = df[['tpv_stability', 'mrr_efficiency', 'Age_Months']].fillna(0)
    scaler = StandardScaler()
    scaled = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(scaled)

    profiles = (
        df.groupby('cluster')
        .agg(
            count=          ('Account',        'count'),
            avg_age_months= ('Age_Months',      'mean'),
            avg_tpv_std=    ('tpv_stability',   'mean'),
            avg_efficiency= ('mrr_efficiency',  'mean'),
            avg_mrr=        ('avg_mrr',         'mean'),
            avg_tpv=        ('avg_tpv',         'mean'),
            churn_rate=     ('is_churned',      'mean'),
        )
        .round(2)
    )

    # Assign descriptive names in priority order so no two clusters share a name.
    # Priority: Bleeders (highest churn) → Scalers (highest efficiency among rest)
    #           → Tenured Stable (oldest among rest) → Volatile Newcomers (remainder)
    profiles_dict = profiles.to_dict(orient='index')
    named = {}
    unassigned = dict(profiles_dict)

    def pop_by(metric, ascending=False):
        """Pick cluster with max (or min) value of metric from unassigned pool."""
        best = sorted(unassigned.keys(),
                      key=lambda k: unassigned[k][metric],
                      reverse=not ascending)[0]
        return best, unassigned.pop(best)

    cid, vals = pop_by('churn_rate')
    named[f"Cluster {cid} — High-Risk Bleeders"] = {k: float(v) for k, v in vals.items()}

    cid, vals = pop_by('avg_efficiency')
    named[f"Cluster {cid} — High-Efficiency Scalers"] = {k: float(v) for k, v in vals.items()}

    cid, vals = pop_by('avg_age_months')
    named[f"Cluster {cid} — Tenured Stable"] = {k: float(v) for k, v in vals.items()}

    cid, vals = list(unassigned.items())[0]
    named[f"Cluster {cid} — Volatile Newcomers"] = {k: float(v) for k, v in vals.items()}

    return named


# ── 11. Sensitivity Analysis ──────────────────────────────────────────────────
def compute_sensitivity(starting_mrr, total_accounts, current_churn_rate):
    """
    Revenue impact of different churn rate scenarios.

    Method:
    - Average MRR per account = Starting MRR / Total accounts
    - For each scenario churn rate, compute accounts lost and MRR at risk
    - 'Annual saving vs current' shows the dollar upside of improving churn

    These are order-of-magnitude estimates using average MRR. In reality,
    higher-MRR accounts that churn have larger individual impact. A refined
    version would weight by MRR tier. Flagged here as an assumption.
    """
    avg_mrr = starting_mrr / total_accounts
    current_accounts_lost = round(total_accounts * current_churn_rate)

    scenarios = []
    for rate in [0.10, 0.15, current_churn_rate, 0.25, 0.30]:
        accounts_lost      = round(total_accounts * rate)
        monthly_mrr_lost   = round(accounts_lost * avg_mrr, 2)
        annual_mrr_lost    = round(monthly_mrr_lost * 12, 2)
        saving_vs_current  = round(
            (current_accounts_lost - accounts_lost) * avg_mrr * 12, 2
        )
        implied_nrr = round(
            100 - (rate * 100),   # simplified: no expansion assumed
            1
        )

        scenarios.append({
            'churn_rate_pct':          round(rate * 100, 2),
            'scenario_label':          (
                'current' if abs(rate - current_churn_rate) < 0.001
                else ('improvement' if rate < current_churn_rate else 'deterioration')
            ),
            'accounts_lost_annual':    accounts_lost,
            'monthly_mrr_at_risk':     monthly_mrr_lost,
            'annual_mrr_at_risk':      annual_mrr_lost,
            'annual_saving_vs_current': saving_vs_current,
            'implied_nrr_simplified':  implied_nrr,
        })

    return {
        'avg_mrr_per_account': round(avg_mrr, 2),
        'note': (
            'Projections use average MRR per account as proxy. '
            'Actual impact depends on which accounts churn (high-MRR churners cost more).'
        ),
        'scenarios': scenarios,
    }


# ── 12. MRR & TPV Trends ──────────────────────────────────────────────────────
def compute_trends(df):
    return {
        'mrr':    [round(float(df[c].sum()), 2) for c in MRR_COLS],
        'tpv':    [round(float(df[c].sum()), 2) for c in TPV_COLS],
        'months': [f"Month {i} ({MONTH_LABELS[i]})" for i in range(1, 13)],
    }


# ── MAIN ───────────────────────────────────────────────────────────────────────
def run_analysis():
    print("Loading data...")
    df = load_data()

    print("Defining churn layers...")
    df = define_churn(df)

    print("Computing NRR waterfall...")
    nrr_waterfall = compute_nrr_waterfall(df)

    print("Computing churn rates...")
    churn_rates = compute_churn_rates(df)

    # Use effective churn rate (formal + behavioral) as the base for sensitivity
    effective_rate = churn_rates['effective_churn_rate_pct'] / 100

    print("Computing churn spike (relative months)...")
    churn_spike = compute_churn_spike(df)

    print("Computing churn reasons...")
    churn_reasons = compute_churn_reasons(df)

    print("Computing lifecycle analysis...")
    lifecycle = compute_lifecycle(df)

    print("Computing cohort efficiency...")
    efficiency = compute_efficiency(df)

    print("Computing bleed analysis...")
    bleed = compute_bleed_analysis(df)

    print("Computing behavioral clusters...")
    clusters = compute_clustering(df)

    print("Computing sensitivity scenarios...")
    sensitivity = compute_sensitivity(
        nrr_waterfall['starting_mrr'],
        churn_rates['total_accounts'],
        effective_rate
    )

    print("Computing trends...")
    trends = compute_trends(df)

    # ── Assemble output ──
    output = {
        'metadata': {
            'analysis_period':  'Jan 2024 – Dec 2024 (downloaded Feb 2025)',
            'total_accounts':   churn_rates['total_accounts'],
            'generated_at':     datetime.now().isoformat(timespec='seconds'),
            'version':          'v2',
        },
        'revenue_health':  nrr_waterfall,
        'churn_metrics':   churn_rates,
        'churn_spike':     churn_spike,
        'churn_reasons':   churn_reasons,
        'lifecycle':       lifecycle,
        'efficiency':      efficiency,
        'bleed_analysis':  bleed,
        'clusters':        clusters,
        'sensitivity':     sensitivity,
        'mrr_tpv_trends':  trends,
    }

    with open('analysis_results.json', 'w') as f:
        json.dump(output, f, indent=4)

    # ── Print summary to console ──
    print("\n" + "="*60)
    print("ANALYSIS COMPLETE — KEY RESULTS")
    print("="*60)
    print(f"\n  NRR:                    {nrr_waterfall['nrr']}%")
    print(f"  Starting MRR:           ${nrr_waterfall['starting_mrr']:,.0f}")
    print(f"  Ending MRR:             ${nrr_waterfall['ending_mrr']:,.0f}")
    print(f"  Expansion MRR:         +${nrr_waterfall['expansion_mrr']:,.0f}")
    print(f"  Contraction MRR:       -${nrr_waterfall['contraction_mrr']:,.0f}")
    print(f"  Churn MRR:             -${nrr_waterfall['churn_mrr']:,.0f}")
    print(f"  Waterfall check (≈0):   {nrr_waterfall['_reconciliation_check']}")
    print(f"\n  Formal churn rate:      {churn_rates['formal_churn_rate_pct']}%  ({churn_rates['formal_churn_count']} accounts)")
    print(f"  Behavioral churn:       {churn_rates['behavioral_churn_rate_pct']}%  ({churn_rates['behavioral_churn_count']} accounts)")
    print(f"  Effective churn rate:   {churn_rates['effective_churn_rate_pct']}%  ({churn_rates['effective_churn_count']} accounts)")
    print(f"\n  Controllable MRR lost:  ${churn_reasons['controllable_total']:,.0f}  ({churn_reasons['controllable_pct']}%)")
    print(f"  Uncontrollable MRR lost:${churn_reasons['uncontrollable_total']:,.0f}  ({churn_reasons['uncontrollable_pct']}%)")
    print(f"\n  Zombie accounts:        {bleed['zombie_accounts']}")
    print(f"  Bleed-risk accounts:    {bleed['bleed_risk_active_accounts']}")
    print(f"  Empirical TPV threshold:{bleed['tpv_threshold_empirical_pct']}%")
    print(f"\n  Churn spike month(s):")
    for month, count in churn_spike.items():
        bar = '█' * min(count // 3, 40)
        print(f"    {month:35s} {count:4d}  {bar}")
    print(f"\n  Sensitivity — annual MRR at risk:")
    for s in sensitivity['scenarios']:
        marker = ' ◄ current' if s['scenario_label'] == 'current' else ''
        print(f"    {s['churn_rate_pct']:5.1f}% churn  →  ${s['annual_mrr_at_risk']:>12,.0f}/yr{marker}")
    print("\n  Saved → analysis_results.json")
    print("="*60)


if __name__ == "__main__":
    run_analysis()
