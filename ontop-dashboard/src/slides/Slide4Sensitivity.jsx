import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList
} from 'recharts'

const fmtM = (n) => `$${(n / 1_000_000).toFixed(2)}M`
const fmtK = (n) => `$${(n / 1_000).toFixed(0)}K`

export default function Slide4Sensitivity({ data }) {
  const sens = data.sensitivity
  const scenarios = sens.scenarios

  const current = scenarios.find(s => s.scenario_label === 'current')

  // Chart data — highlight current scenario
  const chartData = scenarios.map(s => ({
    label: `${s.churn_rate_pct}%`,
    annual: Math.round(s.annual_mrr_at_risk / 1_000_000 * 100) / 100,
    saving: s.annual_saving_vs_current,
    isCurrent: s.scenario_label === 'current',
    isImprovement: s.scenario_label === 'improvement',
    raw: s,
  }))

  // Color per bar
  const barColor = (d) => {
    if (d.isCurrent) return 'var(--amber)'
    if (d.isImprovement) return 'var(--green)'
    return 'var(--red)'
  }

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">Slide 4 · The Stakes</div>
          <h1 className="slide-title">What is churn costing us — and what could we save?</h1>
          <p className="slide-subtitle">
            Sensitivity analysis · avg ${Math.round(sens.avg_mrr_per_account).toLocaleString()} MRR/account ·{' '}
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{sens.note}</span>
          </p>
        </div>
        <span className="brand">ontop</span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, minHeight: 0 }}>

        {/* Bar chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="card-label">Annual MRR at Risk by Churn Rate Scenario</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
              <span style={{ color: 'var(--green)' }}>⬤ Improvement</span>
              <span style={{ color: 'var(--amber)' }}>⬤ Current</span>
              <span style={{ color: 'var(--red)' }}>⬤ Deterioration</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Annual Churn Rate', position: 'insideBottom', offset: -4, fill: 'var(--muted)', fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={v => `$${v}M`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={46}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="custom-tooltip">
                        <div className="label">{label} churn rate</div>
                        <div style={{ marginTop: 4 }}>
                          Annual MRR at risk: <strong>{fmtM(d.raw.annual_mrr_at_risk)}</strong>
                        </div>
                        {!d.isCurrent && (
                          <div style={{ color: d.isImprovement ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                            {d.isImprovement ? '✓ Saves ' : '✗ Extra loss '}
                            <strong>{fmtM(Math.abs(d.raw.annual_saving_vs_current))}/yr vs current</strong>
                          </div>
                        )}
                        <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: 11 }}>
                          Accounts lost: {d.raw.accounts_lost_annual}
                        </div>
                      </div>
                    )
                  }}
                />
                {/* Reference line at current scenario level */}
                <ReferenceLine
                  y={current ? current.annual_mrr_at_risk / 1_000_000 : undefined}
                  stroke="var(--amber)"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <Bar dataKey="annual" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry)} fillOpacity={entry.isCurrent ? 1 : 0.75} />
                  ))}
                  <LabelList
                    dataKey="annual"
                    position="top"
                    style={{ fill: 'var(--text)', fontSize: 11, fontWeight: 600 }}
                    formatter={v => `$${v}M`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scenario table + callouts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Hero callout */}
          <div style={{
            background: 'var(--green-dim)', border: '1px solid var(--green)',
            borderRadius: 12, padding: '16px 20px'
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Reducing churn from 21.9% → 15%
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--green)' }}>
              {fmtM(scenarios.find(s => s.churn_rate_pct === 15)?.annual_saving_vs_current || 0)}/yr
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              in protected annual revenue
            </div>
          </div>

          {/* Scenario table */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-label" style={{ marginBottom: 10 }}>Scenario Breakdown</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 8 }}>Churn</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8 }}>Accounts</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8 }}>Annual risk</th>
                  <th style={{ textAlign: 'right', paddingBottom: 8 }}>vs. now</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => {
                  const isCur = s.scenario_label === 'current'
                  const isImp = s.scenario_label === 'improvement'
                  return (
                    <tr
                      key={i}
                      style={{
                        background: isCur ? 'var(--amber-dim)' : 'transparent',
                        borderRadius: 6,
                      }}
                    >
                      <td style={{ padding: '7px 6px', fontWeight: isCur ? 700 : 400 }}>
                        {s.churn_rate_pct}%
                        {isCur && <span className="badge badge-amber" style={{ marginLeft: 6 }}>now</span>}
                      </td>
                      <td style={{ textAlign: 'right', padding: '7px 6px', color: 'var(--muted)' }}>
                        {s.accounts_lost_annual}
                      </td>
                      <td style={{ textAlign: 'right', padding: '7px 6px', fontWeight: 600 }}>
                        {fmtM(s.annual_mrr_at_risk)}
                      </td>
                      <td style={{
                        textAlign: 'right', padding: '7px 6px', fontWeight: 600,
                        color: isCur ? 'var(--muted)' : isImp ? 'var(--green)' : 'var(--red)'
                      }}>
                        {isCur ? '—' : (isImp ? '+' : '') + fmtM(s.annual_saving_vs_current)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--subtle)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              "vs. now" = annual saving (green) or additional loss (red) vs. current 21.9% rate.
              Based on avg MRR/account; actual impact depends on which accounts churn.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
