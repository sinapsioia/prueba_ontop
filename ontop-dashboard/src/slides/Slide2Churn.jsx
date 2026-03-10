import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts'

const fmtK = (n) => `$${(n / 1_000).toFixed(0)}K`

function SpikeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      <div className="value" style={{ color: v === 143 ? 'var(--red)' : 'var(--text)' }}>
        {v} accounts churned{v === 143 ? ' ⚠ Spike' : ''}
      </div>
    </div>
  )
}

function ReasonTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginTop: 2 }}>
          {p.name}: {fmtK(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function Slide2Churn({ data }) {
  const cm = data.churn_metrics
  const cr = data.churn_reasons

  // Churn spike — month labels shortened
  const spikeData = Object.entries(data.churn_spike).map(([key, count]) => ({
    month: key.match(/\(([^)]+)\)/)?.[1]?.replace(' 2024', '') || key,
    count,
    isSpike: count === 143,
  }))

  // Churn reasons — one bar per reason, colored by type
  const controllableSet = new Set(cr.controllable_reasons)
  const reasonData = Object.entries(cr.by_reason)
    .map(([name, mrr]) => ({
      name: name.length > 22 ? name.slice(0, 20) + '…' : name,
      fullName: name,
      mrr: Math.round(mrr),
      controllable: controllableSet.has(name),
    }))
    .sort((a, b) => b.mrr - a.mrr)

  const totalLost = cr.controllable_total + cr.uncontrollable_total

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">Slide 2 · Churn Story</div>
          <h1 className="slide-title">Why are customers leaving — and when?</h1>
          <p className="slide-subtitle">Formal churn analysis · Jan–Dec 2024</p>
        </div>
        <span className="brand">ontop</span>
      </div>

      {/* Churn rate cards */}
      <div className="metrics-row" style={{ flexShrink: 0 }}>
        <div className="card">
          <div className="card-label">Formal Churn Rate</div>
          <div className="card-value text-red">{cm.formal_churn_rate_pct}%</div>
          <div className="card-sub">{cm.formal_churn_count} accounts lost · registered</div>
        </div>
        <div className="card">
          <div className="card-label">Behavioral Churn</div>
          <div className="card-value" style={{ color: cm.behavioral_churn_count === 0 ? 'var(--green)' : 'var(--red)' }}>
            {cm.behavioral_churn_count === 0 ? 'None' : `${cm.behavioral_churn_rate_pct}%`}
          </div>
          <div className="card-sub">
            {cm.behavioral_churn_count === 0
              ? 'All churners were formally registered ✓'
              : `${cm.behavioral_churn_count} silent churners detected`}
          </div>
        </div>
        <div className="card">
          <div className="card-label">Controllable Lost MRR</div>
          <div className="card-value text-amber">{fmtK(cr.controllable_total)}</div>
          <div className="card-sub">{cr.controllable_pct}% of total losses — CS can address</div>
        </div>
        <div className="card">
          <div className="card-label">Uncontrollable Lost MRR</div>
          <div className="card-value text-muted">{fmtK(cr.uncontrollable_total)}</div>
          <div className="card-sub">{cr.uncontrollable_pct}% — business closures (not recoverable)</div>
        </div>
      </div>

      {/* Two charts */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, minHeight: 0 }}>

        {/* Churn spike bar chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="card-label">Churn by Month — When did they leave?</div>
            <span className="badge badge-red">⚠ Aug spike: 143</span>
          </div>
          <div style={{
            background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.25)',
            borderRadius: 8, padding: '6px 12px', marginBottom: 10, fontSize: 12
          }}>
            August 2024: <strong style={{ color: 'var(--red)' }}>143 churns</strong> vs. avg 15/month.
            Cause requires investigation — possible annual contract cycle, seasonal pattern, or batch data entry.
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spikeData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip content={<SpikeTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {spikeData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isSpike ? 'var(--red)' : 'var(--blue)'}
                      fillOpacity={entry.isSpike ? 1 : 0.5}
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: 'var(--muted)', fontSize: 9 }}
                    formatter={(v) => v === 143 ? '143 ⚠' : v}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn reasons — horizontal bar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="card-label">Lost MRR by Reason (pre-churn MRR)</div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, fontSize: 11, marginBottom: 10 }}>
            <span style={{ color: 'var(--amber)' }}>⬤ Controllable — CS can act</span>
            <span style={{ color: 'var(--subtle)' }}>⬤ Uncontrollable — business closure</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={reasonData}
                margin={{ top: 4, right: 50, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => `$${(v/1000).toFixed(0)}K`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'var(--text)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={148}
                />
                <Tooltip
                  formatter={(v, n, p) => [fmtK(v), p.payload.fullName]}
                  contentStyle={{ background: 'var(--card-alt)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="mrr" radius={[0, 4, 4, 0]}>
                  {reasonData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.controllable ? 'var(--amber)' : 'var(--subtle)'}
                      fillOpacity={0.9}
                    />
                  ))}
                  <LabelList
                    dataKey="mrr"
                    position="right"
                    style={{ fill: 'var(--muted)', fontSize: 10 }}
                    formatter={v => fmtK(v)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Summary */}
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            Focus CS resources on the{' '}
            <strong style={{ color: 'var(--amber)' }}>{fmtK(cr.controllable_total)}</strong>{' '}
            controllable loss. "No longer has workforce" is business closure — not recoverable.
          </div>
        </div>

      </div>
    </div>
  )
}
