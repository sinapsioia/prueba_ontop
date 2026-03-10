# Session Notes — Ontop Implementation Plan Review
_Saved: 2026-03-10_

## What Was Done
1. Read and analyzed `implementation_plan.md` (v1) against the actual code (`analyze_churn.py`), computed results (`analysis_results.json`), and business case brief (`case_text.md`).
2. Identified 13 issues ranging from critical bugs to strategic framing problems.
3. Incorporated user feedback on 5 specific points.
4. Produced `implementation_plan_v2.md` as the corrected, aligned plan.

---

## Issues Found in v1 (with decisions)

### Critical
| # | Issue | Decision |
|---|---|---|
| 1 | ML model used Month 12 data to predict Month 12 churn (target leakage) | ML removed from build scope. Reframed as Future Vision pitch in Slide 5. |
| 2 | Churn spike month: code used calendar month, not relative analysis month | Fixed. Feb 2025 = Month 1. Relative Month 8 = September 2025. Spike month needs re-run to confirm. |
| 3 | Behavioral churners (MRR_Month_12=0, no Churn_Date) excluded from churn rate | Added as "Layer 2 Behavioral Churn" — reported separately from formal churn. |
| 4 | "No longer has workforce" is uncontrollable churn (business closures) but was not flagged as such | Churn reasons split into Controllable vs. Uncontrollable. VP should focus on $340K controllable, not $495K uncontrollable. |

### Significant
| # | Issue | Decision |
|---|---|---|
| 5 | Bleed Index: said TPV is leading indicator, weighted it 30% | Weights flipped: TPV 60%, MRR 40% |
| 6 | "60-day moving average" — data is monthly | Changed to "2-month moving average" |
| 7 | 30% TPV drop threshold is arbitrary | Changed to empirical: derived from churner distribution in data |
| 8 | Pearson correlation 0.0134 is misleading for non-linear age-churn relationship | Replaced with churn rate by age bucket table |
| 9 | Churn MRR impact used MRR_Month_1, not pre-churn MRR | Changed to last non-zero MRR before churn month |
| 10 | NRR waterfall described in plan but code only computed single ratio | Waterfall components to be computed explicitly |

### Minor
| # | Issue | Decision |
|---|---|---|
| 11 | max_depth=None overfitting risk, no test accuracy | Moot — ML moved to Future Vision |
| 12 | 5y+ NaN not explained | Reframed: Ontop platform age means no long-tenure cohort yet |
| 13 | Secondary sheet (Data Business Case) unused without explanation | Cannot join (different ID formats). Use qualitatively as CS context only. |

---

## User Feedback → v2 Actions

| User Comment | Action Taken |
|---|---|
| "Since data starts Feb-25, month would be September?" | Confirmed. Added relative month mapping table. Calendar month 8 (Aug) = relative Month 7. Relative Month 8 = September 2025. Flag as needing re-run to confirm. |
| "ML: propose as future pitch, not a build" | ML moved entirely to Slide 5 as "Future Vision." Plain-language description of what could be built and why the data supports it. |
| "Explain churn logic simply for VP" | Full VP-readable NRR and Churn Rate walkthrough added as Section 2. NRR waterfall table included. |
| "Can the two sheets be related?" | No reliable join key. Explicitly documented. Secondary sheet used qualitatively only. |
| "Add sensitivity analysis" | New Phase C: scenario table at 10/15/21.87/25/30% churn. $3M recovery opportunity from improving to 15%. |

---

## Current Metric Baselines (from analysis_results.json)
- **NRR:** 79.43%
- **Starting MRR (Feb 2025):** $4,476,064
- **Ending MRR (Jan 2026):** $3,555,135
- **MRR decline:** −$920,929 (−20.6%)
- **TPV growth:** +$45.5M (+67.8%) ← key divergence insight
- **Formal churn rate:** 21.87% (~328/1,500 accounts)
- **Age-Churn correlation:** 0.0134 (not meaningful — use bucket table instead)

## Churn Reason Breakdown (using MRR_Month_1 as proxy — to be updated)
- No longer has workforce: $494,694 (UNCONTROLLABLE)
- Left for competition: $127,316
- Missing Product Features: $112,139
- Pricing: $100,188
- Compliance: $87,154

## Open Questions Before Deployment
1. Does corrected relative-month mapping confirm spike at September (Month 8)?
2. How many behavioral churners exist (MRR_Month_12=0, no Churn_Date)?
3. Is there a CL_ ↔ ACC_ account mapping key anywhere?
4. Should sensitivity projections be refined by MRR cohort?
