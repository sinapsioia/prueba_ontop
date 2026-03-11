import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const fmtM = (n) => `$${(n / 1_000_000).toFixed(2)}M`

// Custom dot renderer — large amber for current, small colored for others
function RiskDot(props) {
  const { cx, cy, payload } = props
  if (payload.isCurrent) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill="rgba(245,158,11,0.18)" />
        <circle cx={cx} cy={cy} r={7} fill="#f59e0b" stroke="#07090f" strokeWidth={2} />
      </g>
    )
  }
  const color = payload.isImprovement ? '#22c55e' : '#ef4444'
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#07090f" strokeWidth={1.5} />
}

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
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, minHeight: 0 }}>

        {/* ── Risk curve — AreaChart ─────────────────────────────── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-label">Annual MRR at Risk — Churn Rate Scenarios</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-green">Improvement</span>
              <span className="badge badge-gold">Current</span>
              <span className="badge badge-red">Deterioration</span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 8, left: 10 }}>
                <defs>
                  {/* Horizontal gradient: green → amber → red (left to right) */}
                  <linearGradient id="riskStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#22c55e" />
                    <stop offset="38%"  stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                  {/* Area fill: same gradient but semi-transparent */}
                  <linearGradient id="riskFill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.18} />
                    <stop offset="38%"  stopColor="#f59e0b" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.32} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'Annual Churn Rate',
                    position: 'insideBottom',
                    offset: -2,
                    fill: 'var(--muted)',
                    fontSize: 10,
                  }}
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

                {/* Vertical line at current rate */}
                <ReferenceLine
                  x={`${current?.churn_rate_pct}%`}
                  stroke="rgba(245,158,11,0.5)"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Today',
                    fill: 'var(--gold)',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    position: 'top',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="annual"
                  stroke="url(#riskStroke)"
                  strokeWidth={3}
                  fill="url(#riskFill)"
                  dot={<RiskDot />}
                  activeDot={{ r: 7, stroke: '#07090f', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Hero saving callout */}
          <div style={{
            background: 'var(--green-dim)',
            border: '1px solid var(--green)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-glow-green)',
          }}>
            <div className="card-label" style={{ color: 'var(--green)', marginBottom: 8 }}>
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
