import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'

const CLUSTER_STYLES = {
  'High-Risk Bleeders':      { bg: 'var(--red-dim)',    border: 'var(--red)',    text: 'var(--red)',    barColor: '#ef4444' },
  'High-Efficiency Scalers': { bg: 'var(--green-dim)',  border: 'var(--green)',  text: 'var(--green)',  barColor: '#22c55e' },
  'Tenured Stable':          { bg: 'var(--blue-dim)',   border: 'var(--blue)',   text: 'var(--blue)',   barColor: '#3b82f6' },
  'Volatile Newcomers':      { bg: 'var(--gold-dim)',   border: 'var(--gold)',   text: 'var(--gold)',   barColor: '#f59e0b' },
}

const CLUSTER_ACTION = {
  'High-Risk Bleeders':      'ICP mismatch — these profiles should inform acquisition filters so we stop signing similar accounts.',
  'Volatile Newcomers':      'Onboarding gap — first-90-day structured engagement reduces early churn meaningfully.',
  'High-Efficiency Scalers': 'Expansion ready — getting more value than they pay for. Prime upsell and advocacy candidates.',
  'Tenured Stable':          'Your true ICP — define acquisition criteria from this segment and recruit more like them.',
}

function getClusterAction(name) {
  for (const key of Object.keys(CLUSTER_ACTION)) {
    if (name.includes(key)) return CLUSTER_ACTION[key]
  }
  return ''
}

function getClusterStyle(name) {
  for (const key of Object.keys(CLUSTER_STYLES)) {
    if (name.includes(key)) return CLUSTER_STYLES[key]
  }
  return CLUSTER_STYLES['Volatile Newcomers']
}

function IconInsight({ color = 'var(--blue)' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color, flexShrink: 0, marginTop: 1 }}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
    </svg>
  )
}

// ── Lollipop bar: replaces standard BarChart for efficiency ────────
// Each cohort = a thin stem + a labeled circle at the top.
// Far more readable for showing scale differences (25x vs 1x).
function LollipopShape(props) {
  const { x, y, width, height, value } = props
  if (!value) return null

  const cx   = x + width / 2
  const isHigh = value > 20
  const color  = isHigh ? '#22c55e' : '#3b82f6'
  const r      = isHigh ? 17 : 13

  return (
    <g>
      {/* Stem */}
      <rect x={cx - 1.5} y={y + r} width={3} height={height - r} fill={color} opacity={0.22} rx={1.5} />
      {/* Circle */}
      <circle cx={cx} cy={y + r} r={r} fill={color} fillOpacity={isHigh ? 0.92 : 0.72} />
      {/* Value label */}
      <text
        x={cx} y={y + r}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={isHigh ? 10 : 9}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
      >
        {value.toFixed(0)}x
      </text>
    </g>
  )
}

export default function Slide3Patterns({ data }) {
  const lifecycle  = data.lifecycle
  const efficiency = data.efficiency
  const bleed      = data.bleed_analysis
  const clusters   = data.clusters

  const cohortChurnData = Object.entries(lifecycle)
    .filter(([, v]) => v.total > 0)
    .map(([cohort, v]) => ({
      cohort: cohort.replace(' months', 'mo').replace(' years', 'yr').replace(' year', 'yr'),
      churn_rate: v.churn_rate_pct,
      total: v.total,
      churned: v.churned,
    }))

  const efficiencyData = Object.entries(efficiency)
    .filter(([, v]) => v !== null)
    .map(([cohort, v]) => ({
      cohort: cohort.replace(' months', 'mo').replace(' years', 'yr').replace(' year', 'yr'),
      ratio: v,
    }))

  const clusterEntries = Object.entries(clusters).map(([name, vals]) => ({
    name,
    vals,
    style: getClusterStyle(name),
  }))

  const avgChurn = (cohortChurnData.reduce((s, d) => s + d.churn_rate, 0) / cohortChurnData.length).toFixed(1)

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">03 · Hidden Patterns</div>
          <h1 className="slide-title">What does the data tell us beneath the surface?</h1>
          <p className="slide-subtitle">Lifecycle analysis · Efficiency cohorts · Customer segmentation</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16, minHeight: 0 }}>

        {/* Top-left: Age cohort churn rate */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-label">Churn Rate by Account Age</div>
          <div className="insight insight-blue">
            <IconInsight color="var(--blue)" />
            <span>
              Churn is equally likely at any account age (~<strong>{avgChurn}%</strong>).
              This is <strong>not an onboarding problem</strong> — it's a sustained engagement deficit.
              No account is ever "safe."
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortChurnData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="cohort" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={34} domain={[0, 30]}
                />
                <Tooltip
                  formatter={(v, n, p) => [`${v}% (${p.payload.churned}/${p.payload.total})`, 'Churn Rate']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={l => `Cohort: ${l}`}
                />
                <ReferenceLine y={Number(avgChurn)} stroke="var(--coral)" strokeDasharray="4 4"
                  label={{ value: `avg ${avgChurn}%`, fill: 'var(--coral)', fontSize: 10, position: 'right' }} />
                <Bar dataKey="churn_rate" radius={[4, 4, 0, 0]}>
                  {cohortChurnData.map((entry, i) => (
                    <Cell key={i} fill="var(--blue)" fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top-right: Efficiency — LOLLIPOP chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-label">TPV/MRR Efficiency by Account Age</div>
          <div className="insight insight-green">
            <IconInsight color="var(--green)" />
            <span>
              Accounts aged 2–5 years are <strong style={{ color: 'var(--green)' }}>25× more efficient</strong>.
              Highest LTV segment — protect and expand at all costs.
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="cohort" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => `${v}x`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={34}
                />
                <Tooltip
                  formatter={v => [`${v}x`, 'TPV/MRR Efficiency']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={l => `Cohort: ${l}`}
                />
                <Bar dataKey="ratio" shape={<LollipopShape />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Cluster cards */}
        <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-label">4 Customer Segments — Who are they really?</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              TPV stability · MRR efficiency · Account age
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {clusterEntries.map(({ name, vals, style }) => {
              const churnPct  = (vals.churn_rate * 100).toFixed(0)
              const churnColor = vals.churn_rate > 0.5
                ? 'var(--red)'
                : vals.churn_rate < 0.05
                  ? 'var(--green)'
                  : 'var(--gold)'
              const action = getClusterAction(name)

              return (
                <div key={name} className="cluster-card" style={{ background: style.bg, borderColor: style.border }}>
                  <div className="cluster-card-name" style={{ color: style.text }}>{name}</div>
                  <div className="cluster-stats">
                    <span className="stat-label">Accounts</span>
                    <span className="stat-value">{Math.round(vals.count)}</span>
                    <span className="stat-label">Avg age</span>
                    <span className="stat-value">{vals.avg_age_months.toFixed(0)} mo</span>
                    <span className="stat-label">Efficiency</span>
                    <span className="stat-value">{vals.avg_efficiency.toFixed(1)}x</span>
                    <span className="stat-label">Churn rate</span>
                    <span className="stat-value" style={{ color: churnColor }}>{churnPct}%</span>
                  </div>
                  <div className="churn-bar-track">
                    <div
                      className="churn-bar-fill"
                      style={{ width: `${Math.min(Number(churnPct), 100)}%`, background: style.barColor }}
                    />
                  </div>
                  {action && (
                    <div style={{ marginTop: 8, fontSize: 10, color: style.text, lineHeight: 1.45, opacity: 0.9 }}>
                      {action}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <strong style={{ color: 'var(--green)' }}>Active portfolio health: </strong>
            {bleed.interpretation}
          </div>
        </div>

      </div>
    </div>
  )
}
