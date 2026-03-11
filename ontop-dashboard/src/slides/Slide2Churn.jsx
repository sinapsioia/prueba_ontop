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
      <div className="ct-label">{label}</div>
      <div className="ct-row">
        <span>Churned</span>
        <strong style={{ color: v === 143 ? 'var(--red)' : 'var(--text)' }}>{v} accounts</strong>
      </div>
      {v === 143 && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>
          9.5× monthly average
        </div>
      )}
    </div>
  )
}

// SVG icon: alert triangle
function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

export default function Slide2Churn({ data }) {
  const cm = data.churn_metrics
  const cr = data.churn_reasons

  const spikeData = Object.entries(data.churn_spike).map(([key, count]) => ({
    month: key.match(/\(([^)]+)\)/)?.[1]?.replace(' 2024', '') || key,
    count,
    isSpike: count === 143,
  }))

  const controllableSet = new Set(cr.controllable_reasons)
  const reasonData = Object.entries(cr.by_reason)
    .map(([name, mrr]) => ({
      name: name.length > 22 ? name.slice(0, 20) + '…' : name,
      fullName: name,
      mrr: Math.round(mrr),
      controllable: controllableSet.has(name),
    }))
    .sort((a, b) => b.mrr - a.mrr)

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">02 · Churn Story</div>
          <h1 className="slide-title">Why are customers leaving — and when?</h1>
          <p className="slide-subtitle">Formal churn analysis · Jan–Dec 2024</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="metrics-row" style={{ flexShrink: 0 }}>
        <div className="card card-kpi accent-red">
          <div className="card-label">Formal Churn Rate</div>
          <div className="card-value text-gradient-red">{cm.formal_churn_rate_pct}%</div>
          <div className="card-sub">{cm.formal_churn_count} accounts · registered exits</div>
        </div>
        <div className="card card-kpi accent-green">
          <div className="card-label">Behavioral Churn</div>
          <div className="card-value" style={{ color: cm.behavioral_churn_count === 0 ? 'var(--green)' : 'var(--red)' }}>
            {cm.behavioral_churn_count === 0 ? 'None' : `${cm.behavioral_churn_rate_pct}%`}
          </div>
          <div className="card-sub">
            {cm.behavioral_churn_count === 0
              ? 'All churners formally registered'
              : `${cm.behavioral_churn_count} silent churners`}
          </div>
        </div>
        <div className="card card-kpi accent-gold">
          <div className="card-label">Controllable Lost MRR</div>
          <div className="card-value text-gold">{fmtK(cr.controllable_total)}</div>
          <div className="card-sub">{cr.controllable_pct}% of losses — CS can act</div>
        </div>
        <div className="card card-kpi">
          <div className="card-label">Uncontrollable Lost MRR</div>
          <div className="card-value text-muted">{fmtK(cr.uncontrollable_total)}</div>
          <div className="card-sub">{cr.uncontrollable_pct}% — business closures</div>
        </div>
      </div>

      {/* Two charts */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, minHeight: 0 }}>

        {/* Spike chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="card-label">Churn by Month — When did they leave?</div>
            <span className="badge badge-red">Aug spike · 143</span>
          </div>
          <div className="insight insight-red">
            <IconAlert />
            <span>
              August 2024: <strong style={{ color: 'var(--red)' }}>143 churns</strong> vs. avg 15/month.
              Possible annual contract cycle, seasonal pattern, or batch data entry — requires investigation.
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spikeData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<SpikeTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {spikeData.map((entry, i) => (
                    <Cell key={i} fill={entry.isSpike ? 'var(--red)' : 'var(--blue)'} fillOpacity={entry.isSpike ? 1 : 0.5} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: 'var(--muted)', fontSize: 9 }}
                    formatter={(v) => v === 143 ? '143 !' : v}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reasons chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-label" style={{ marginBottom: 10 }}>Lost MRR by Reason (pre-churn MRR)</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, marginBottom: 10, flexShrink: 0 }}>
            <span className="badge badge-gold">Controllable — CS can act</span>
            <span className="badge badge-muted">Uncontrollable</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={reasonData} margin={{ top: 4, right: 50, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => `$${(v/1000).toFixed(0)}K`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="name"
                  tick={{ fill: 'var(--text)', fontSize: 11 }}
                  axisLine={false} tickLine={false} width={148}
                />
                <Tooltip
                  formatter={(v, n, p) => [fmtK(v), p.payload.fullName]}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="mrr" radius={[0, 4, 4, 0]}>
                  {reasonData.map((entry, i) => (
                    <Cell key={i} fill={entry.controllable ? 'var(--gold)' : 'var(--subtle)'} fillOpacity={0.9} />
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
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            Focus CS on the{' '}
            <strong style={{ color: 'var(--gold)' }}>{fmtK(cr.controllable_total)}</strong>{' '}
            controllable loss. "No longer has workforce" is business closure — not recoverable.
          </div>
        </div>

      </div>
    </div>
  )
}
