import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList
} from 'recharts'

const fmtM = (n) => `$${(n / 1_000_000).toFixed(2)}M`

export default function Slide4Sensitivity({ data }) {
  const sens      = data.sensitivity
  const scenarios = sens.scenarios

  const current = scenarios.find(s => s.scenario_label === 'current')

  const chartData = scenarios.map(s => ({
    label: `${s.churn_rate_pct}%`,
    annual: Math.round(s.annual_mrr_at_risk / 1_000_000 * 100) / 100,
    saving: s.annual_saving_vs_current,
    isCurrent:     s.scenario_label === 'current',
    isImprovement: s.scenario_label === 'improvement',
    raw: s,
  }))

  const barColor = (d) => {
    if (d.isCurrent)     return 'var(--gold)'
    if (d.isImprovement) return 'var(--green)'
    return 'var(--red)'
  }

  const saving15 = scenarios.find(s => s.churn_rate_pct === 15)?.annual_saving_vs_current || 0

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">04 · The Stakes</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-label">Annual MRR at Risk by Churn Rate Scenario</div>
            <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
              <span className="badge badge-green">Improvement</span>
              <span className="badge badge-gold">Current</span>
              <span className="badge badge-red">Deterioration</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  label={{ value: 'Annual Churn Rate', position: 'insideBottom', offset: -4, fill: 'var(--muted)', fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={v => `$${v}M`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={46}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="custom-tooltip">
                        <div className="ct-label">{label} churn rate</div>
                        <div className="ct-row">
                          <span>Annual MRR at risk</span>
                          <strong>{fmtM(d.raw.annual_mrr_at_risk)}</strong>
                        </div>
                        {!d.isCurrent && (
                          <div className="ct-row" style={{ color: d.isImprovement ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                            <span>{d.isImprovement ? 'Saves' : 'Extra loss'}</span>
                            <strong>{fmtM(Math.abs(d.raw.annual_saving_vs_current))}/yr</strong>
                          </div>
                        )}
                        <div className="ct-row" style={{ color: 'var(--muted)', marginTop: 2 }}>
                          <span>Accounts lost/yr</span>
                          <span>{d.raw.accounts_lost_annual}</span>
                        </div>
                      </div>
                    )
                  }}
                />
                <ReferenceLine
                  y={current ? current.annual_mrr_at_risk / 1_000_000 : undefined}
                  stroke="var(--gold)" strokeDasharray="5 5" strokeWidth={1.5}
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

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Hero saving callout */}
          <div style={{
            background: 'var(--green-dim)', border: '1px solid var(--green)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
            boxShadow: 'var(--shadow-glow-green)'
          }}>
            <div className="card-label" style={{ color: 'var(--green)', marginBottom: 6 }}>
              Reducing churn 21.9% → 15%
            </div>
            <div className="card-value-hero text-gradient-green">
              {fmtM(saving15)}/yr
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              in protected annual revenue
            </div>
          </div>

          {/* Scenario table */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-label" style={{ marginBottom: 10 }}>Scenario Breakdown</div>
            <table className="scenario-table">
              <thead>
                <tr>
                  <th>Churn</th>
                  <th style={{ textAlign: 'right' }}>Accounts</th>
                  <th style={{ textAlign: 'right' }}>Annual risk</th>
                  <th style={{ textAlign: 'right' }}>vs. now</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => {
                  const isCur = s.scenario_label === 'current'
                  const isImp = s.scenario_label === 'improvement'
                  return (
                    <tr key={i} className={isCur ? 'row-current' : ''}>
                      <td style={{ fontWeight: isCur ? 700 : 400 }}>
                        {s.churn_rate_pct}%
                        {isCur && <span className="badge badge-gold" style={{ marginLeft: 6 }}>now</span>}
                      </td>
                      <td className="num" style={{ color: 'var(--muted)' }}>{s.accounts_lost_annual}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{fmtM(s.annual_mrr_at_risk)}</td>
                      <td className="num" style={{
                        fontWeight: 600,
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
