import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList
} from 'recharts'

const fmt  = (n) => `$${(n / 1_000_000).toFixed(2)}M`
const fmtK = (n) => `$${(n / 1_000).toFixed(0)}K`

function buildWaterfall(rh) {
  return [
    { name: 'Starting',    invisible: 0,                                                    value: rh.starting_mrr,    color: '#3b82f6', solid: true  },
    { name: 'Expansion',   invisible: rh.starting_mrr,                                     value: rh.expansion_mrr,   color: '#22c55e', solid: false },
    { name: 'Contraction', invisible: rh.starting_mrr + rh.expansion_mrr - rh.contraction_mrr, value: rh.contraction_mrr, color: '#ef4444', solid: false },
    { name: 'Churn MRR',   invisible: rh.ending_mrr,                                       value: rh.churn_mrr,       color: '#ef4444', solid: false },
    { name: 'Ending',      invisible: 0,                                                    value: rh.ending_mrr,      color: '#3b82f6', solid: true  },
  ]
}

function WaterfallTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const item = payload.find(p => p.dataKey === 'value')
  if (!item) return null
  return (
    <div className="custom-tooltip">
      <div className="ct-label">{label}</div>
      <div className="ct-row"><span>Value</span><strong>{fmtK(item.value)}</strong></div>
    </div>
  )
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="ct-label">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="ct-row" style={{ color: p.color }}>
          <span>{p.name}</span><strong>{fmtK(p.value)}</strong>
        </div>
      ))}
    </div>
  )
}

// Inline SVG: lightbulb icon
function IconInsight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 1 }}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
    </svg>
  )
}

export default function Slide1Revenue({ data }) {
  const rh     = data.revenue_health
  const trends = data.mrr_tpv_trends

  const waterfallData = buildWaterfall(rh)

  const trendDataClean = trends.months.map((m, i) => {
    const inner = m.match(/\(([^)]+)\)/)?.[1] || m
    const [mon, yr] = inner.split(' ')
    return { label: `${mon} ${yr.slice(2)}`, mrr: Math.round(trends.mrr[i]), tpv: Math.round(trends.tpv[i]) }
  })

  const mrrDelta  = rh.ending_mrr - rh.starting_mrr
  const tpvGrowth = ((trends.tpv[11] - trends.tpv[0]) / trends.tpv[0] * 100).toFixed(1)

  return (
    <div className="slide">
      {/* Header */}
      <div className="slide-header">
        <div>
          <div className="slide-tag">01 · Revenue Health</div>
          <h1 className="slide-title">How did we perform in 2024?</h1>
          <p className="slide-subtitle">
            Jan 2024 – Dec 2024 · {data.metadata.total_accounts.toLocaleString()} accounts
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="metrics-row" style={{ flexShrink: 0 }}>
        <div className="card card-kpi accent-red">
          <div className="card-label">Net Revenue Retention</div>
          <div className="card-value text-gradient-red">{rh.nrr}%</div>
          <div className="card-sub">Industry target: &gt;100% · <strong style={{ color: 'var(--red)' }}>Below benchmark</strong></div>
        </div>
        <div className="card card-kpi accent-blue">
          <div className="card-label">Starting MRR</div>
          <div className="card-value text-blue">{fmt(rh.starting_mrr)}</div>
          <div className="card-sub">Jan 2024 baseline</div>
        </div>
        <div className="card card-kpi accent-red">
          <div className="card-label">Ending MRR</div>
          <div className="card-value text-red">{fmt(rh.ending_mrr)}</div>
          <div className="card-sub">{fmt(Math.abs(mrrDelta))} lost · Dec 2024</div>
        </div>
        <div className="card card-kpi accent-green">
          <div className="card-label">TPV Growth</div>
          <div className="card-value text-green">+{tpvGrowth}%</div>
          <div className="card-sub">Platform usage growing strongly</div>
        </div>
      </div>

      {/* Two charts */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, minHeight: 0 }}>

        {/* Waterfall */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-label">NRR Waterfall — Where did the revenue go?</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={waterfallData} margin={{ top: 8, right: 8, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={v => `$${(v/1e6).toFixed(1)}M`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={52}
                />
                <Tooltip content={<WaterfallTooltip />} />
                <Bar dataKey="invisible" stackId="wf" fill="transparent" legendType="none" />
                <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={entry.solid ? 1 : 0.85} />
                  ))}
                  <LabelList content={(props) => {
                    const { x, y, width, index } = props
                    const entry = waterfallData[index]
                    if (!entry || entry.solid) return null
                    const isExpansion = entry.name === 'Expansion'
                    const sign  = isExpansion ? '▲' : '▼'
                    const color = isExpansion ? '#22c55e' : '#ef4444'
                    return (
                      <text x={x + width / 2} y={y - 5} textAnchor="middle"
                        fill={color} fontSize={9} fontWeight={700}
                        fontFamily="JetBrains Mono, monospace">
                        {sign} {fmtK(entry.value)}
                      </text>
                    )
                  }} />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MRR vs TPV divergence */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div className="card-label">MRR vs. TPV — The key divergence</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
              <span className="badge badge-red">MRR · left axis</span>
              <span className="badge badge-green">TPV · right axis</span>
            </div>
          </div>

          <div className="insight insight-blue">
            <IconInsight />
            <span>
              Revenue is falling while platform usage grows <strong>+{tpvGrowth}%</strong>.
              This is a <strong>retention problem</strong>, not a product problem.
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendDataClean} margin={{ top: 4, right: 50, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false} tickLine={false} interval={1}
                />
                <YAxis
                  yAxisId="mrr" orientation="left"
                  tickFormatter={v => `$${(v/1e6).toFixed(1)}M`}
                  tick={{ fill: 'var(--red)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={52}
                />
                <YAxis
                  yAxisId="tpv" orientation="right"
                  tickFormatter={v => `$${(v/1e6).toFixed(0)}M`}
                  tick={{ fill: 'var(--green)', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={42}
                />
                <Tooltip content={<TrendTooltip />} />
                <Line yAxisId="mrr" type="monotone" dataKey="mrr" name="MRR"
                  stroke="var(--red)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line yAxisId="tpv" type="monotone" dataKey="tpv" name="TPV"
                  stroke="var(--green)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <ReferenceLine
                  yAxisId="mrr" x="Aug 24"
                  stroke="var(--red)" strokeDasharray="4 4"
                  label={{ value: 'Churn spike', fill: 'var(--red)', fontSize: 10, position: 'top' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
