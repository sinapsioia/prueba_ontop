import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'

// Cluster tag colors
const CLUSTER_COLORS = {
  'High-Risk Bleeders':       { bg: 'var(--red-dim)',   border: 'var(--red)',   text: 'var(--red)'   },
  'High-Efficiency Scalers':  { bg: 'var(--green-dim)', border: 'var(--green)', text: 'var(--green)' },
  'Tenured Stable':           { bg: 'var(--blue-dim)',  border: 'var(--blue)',  text: 'var(--blue)'  },
  'Volatile Newcomers':       { bg: 'var(--amber-dim)', border: 'var(--amber)', text: 'var(--amber)' },
}

function getClusterType(name) {
  for (const key of Object.keys(CLUSTER_COLORS)) {
    if (name.includes(key)) return key
  }
  return 'Volatile Newcomers'
}

export default function Slide3Patterns({ data }) {
  const lifecycle = data.lifecycle
  const efficiency = data.efficiency
  const bleed = data.bleed_analysis
  const clusters = data.clusters

  // Age-cohort churn rate bars (exclude 5+ years — no accounts)
  const cohortChurnData = Object.entries(lifecycle)
    .filter(([, v]) => v.total > 0)
    .map(([cohort, v]) => ({
      cohort: cohort.replace(' months', 'mo').replace(' years', 'yr').replace(' year', 'yr'),
      churn_rate: v.churn_rate_pct,
      total: v.total,
      churned: v.churned,
    }))

  // Efficiency bars (exclude 5+ years)
  const efficiencyData = Object.entries(efficiency)
    .filter(([, v]) => v !== null)
    .map(([cohort, v]) => ({
      cohort: cohort.replace(' months', 'mo').replace(' years', 'yr').replace(' year', 'yr'),
      ratio: v,
    }))

  // Cluster cards
  const clusterEntries = Object.entries(clusters).map(([name, vals]) => {
    const type = getClusterType(name)
    const shortName = type
    return { name, shortName, vals, type, colors: CLUSTER_COLORS[type] }
  })

  const avgChurn = (cohortChurnData.reduce((s, d) => s + d.churn_rate, 0) / cohortChurnData.length).toFixed(1)

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">Slide 3 · Hidden Patterns</div>
          <h1 className="slide-title">What does the data tell us beneath the surface?</h1>
          <p className="slide-subtitle">Lifecycle analysis · Efficiency cohorts · Behavioral clustering</p>
        </div>
        <span className="brand">ontop</span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16, minHeight: 0 }}>

        {/* Top-left: Age cohort churn rate */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-label">Churn Rate by Account Age</div>
          <div style={{
            fontSize: 12, color: 'var(--muted)', marginBottom: 8,
            background: 'var(--blue-dim)', borderRadius: 8, padding: '5px 10px'
          }}>
            💡 Churn is uniform across all lifecycle stages (~{avgChurn}%).
            No single age group is a retention priority — it's a cross-portfolio problem.
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortChurnData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="cohort" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={34}
                  domain={[0, 30]}
                />
                <Tooltip
                  formatter={(v, n, p) => [`${v}% (${p.payload.churned}/${p.payload.total})`, 'Churn Rate']}
                  contentStyle={{ background: 'var(--card-alt)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={l => `Cohort: ${l}`}
                />
                <ReferenceLine y={Number(avgChurn)} stroke="var(--amber)" strokeDasharray="4 4"
                  label={{ value: `avg ${avgChurn}%`, fill: 'var(--amber)', fontSize: 10, position: 'right' }} />
                <Bar dataKey="churn_rate" radius={[4, 4, 0, 0]} fill="var(--blue)" fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top-right: Efficiency by cohort */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-label">TPV/MRR Efficiency by Account Age</div>
          <div style={{
            fontSize: 12, color: 'var(--muted)', marginBottom: 8,
            background: 'var(--green-dim)', borderRadius: 8, padding: '5px 10px'
          }}>
            💡 Accounts aged 2–5 years are <strong style={{ color: 'var(--green)' }}>25x more efficient</strong> than younger cohorts.
            Established customers process far more payroll per $ of MRR — highest LTV segment.
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="cohort" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => `${v}x`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={34}
                />
                <Tooltip
                  formatter={v => [`${v}x`, 'TPV/MRR']}
                  contentStyle={{ background: 'var(--card-alt)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={l => `Cohort: ${l}`}
                />
                <Bar dataKey="ratio" radius={[4, 4, 0, 0]}>
                  {efficiencyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.ratio > 20 ? 'var(--green)' : 'var(--blue)'}
                      fillOpacity={entry.ratio > 20 ? 1 : 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Behavioral clusters (4 cards) */}
        <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="card-label">Behavioral Clusters — 4 Customer Profiles (K-Means)</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              Clustered on: TPV stability · MRR efficiency · Account age
            </div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {clusterEntries.map(({ shortName, vals, colors }) => (
              <div key={shortName} style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: colors.text }}>{shortName}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', fontSize: 11 }}>
                  <span style={{ color: 'var(--muted)' }}>Accounts</span>
                  <span style={{ fontWeight: 600 }}>{Math.round(vals.count)}</span>
                  <span style={{ color: 'var(--muted)' }}>Avg age</span>
                  <span style={{ fontWeight: 600 }}>{vals.avg_age_months.toFixed(0)} mo</span>
                  <span style={{ color: 'var(--muted)' }}>Efficiency</span>
                  <span style={{ fontWeight: 600 }}>{vals.avg_efficiency.toFixed(1)}x</span>
                  <span style={{ color: 'var(--muted)' }}>Churn rate</span>
                  <span style={{ fontWeight: 600, color: vals.churn_rate > 0.5 ? 'var(--red)' : vals.churn_rate < 0.05 ? 'var(--green)' : 'var(--amber)' }}>
                    {(vals.churn_rate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Bleed finding */}
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <strong style={{ color: 'var(--green)' }}>Active portfolio health: </strong>
            {bleed.interpretation}
          </div>
        </div>

      </div>
    </div>
  )
}
