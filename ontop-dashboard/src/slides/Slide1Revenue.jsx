import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'

const fmt = (n) => `$${(n / 1_000_000).toFixed(2)}M`
const fmtK = (n) => `$${(n / 1_000).toFixed(0)}K`

// ── NRR Waterfall ─────────────────────────────────────────────────
// A waterfall shows how Starting MRR flows to Ending MRR through
// Expansion, Contraction, and Churn. Each bar "floats" — an invisible
// spacer bar pushes it up to the right vertical position.
function buildWaterfall(rh) {
  return [
    {
      name: 'Starting MRR',
      invisible: 0,
      value: rh.starting_mrr,
      color: '#4f7cef',
      solid: true,
    },
    {
      name: 'Expansion',
      invisible: rh.starting_mrr,
      value: rh.expansion_mrr,
      color: '#10b981',
      solid: false,
    },
    {
      name: 'Contraction',
      invisible: rh.starting_mrr + rh.expansion_mrr - rh.contraction_mrr,
      value: rh.contraction_mrr,
      color: '#f43f5e',
      solid: false,
    },
    {
      name: 'Churn MRR',
      invisible: rh.ending_mrr,
      value: rh.churn_mrr,
      color: '#f43f5e',
      solid: false,
    },
    {
      name: 'Ending MRR',
      invisible: 0,
      value: rh.ending_mrr,
      color: '#4f7cef',
      solid: true,
    },
  ]
}

function WaterfallTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const item = payload.find(p => p.dataKey === 'value')
  if (!item) return null
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      <div className="value">{fmtK(item.value)}</div>
    </div>
  )
}

// ── Trend chart tooltip ───────────────────────────────────────────
function TrendTooltip({ active, payload, label }) {
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

export default function Slide1Revenue({ data }) {
  const rh = data.revenue_health
  const trends = data.mrr_tpv_trends

  const waterfallData = buildWaterfall(rh)

  // Month labels shortened to "Jan 24", "Feb 24", etc. for x-axis readability
  const trendDataClean = trends.months.map((m, i) => {
    const inner = m.match(/\(([^)]+)\)/)?.[1] || m
    const [mon, yr] = inner.split(' ')
    return { label: `${mon} ${yr.slice(2)}`, mrr: Math.round(trends.mrr[i]), tpv: Math.round(trends.tpv[i]) }
  })

  const mrrDelta = rh.ending_mrr - rh.starting_mrr
  const tpvGrowth = ((trends.tpv[11] - trends.tpv[0]) / trends.tpv[0] * 100).toFixed(1)

  return (
    <div className="slide">
      {/* Header */}
      <div className="slide-header">
        <div>
          <div className="slide-tag">Slide 1 · Revenue Health</div>
          <h1 className="slide-title">How did we perform in 2024?</h1>
          <p className="slide-subtitle">
            Jan 2024 – Dec 2024 · {data.metadata.total_accounts.toLocaleString()} accounts
          </p>
        </div>
        <span className="brand">ontop</span>
      </div>

      {/* Top metric row */}
      <div className="metrics-row" style={{ flexShrink: 0 }}>
        <div className="card" style={{ borderColor: rh.nrr >= 100 ? 'var(--green)' : 'var(--red)', borderWidth: 1 }}>
          <div className="card-label">Net Revenue Retention</div>
          <div className="card-value" style={{ color: rh.nrr >= 100 ? 'var(--green)' : 'var(--red)' }}>
            {rh.nrr}%
          </div>
          <div className="card-sub">Industry target: &gt;100% · Ours: <strong style={{ color: 'var(--red)' }}>below benchmark</strong></div>
        </div>
        <div className="card">
          <div className="card-label">Starting MRR</div>
          <div className="card-value text-blue">{fmt(rh.starting_mrr)}</div>
          <div className="card-sub">Jan 2024</div>
        </div>
        <div className="card">
          <div className="card-label">Ending MRR</div>
          <div className="card-value text-red">{fmt(rh.ending_mrr)}</div>
          <div className="card-sub">
            {fmt(Math.abs(mrrDelta))} lost · Dec 2024
          </div>
        </div>
        <div className="card">
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
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `$${(v/1e6).toFixed(1)}M`}
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip content={<WaterfallTooltip />} />
                {/* Invisible spacer bar — transparent, stacks below the real bar */}
                <Bar dataKey="invisible" stackId="wf" fill="transparent" legendType="none" />
                {/* Visible bar — color per entry */}
                <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={entry.solid ? 1 : 0.85} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MRR vs TPV divergence */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div className="card-label">MRR vs. TPV — The key divergence</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
              <span style={{ color: 'var(--red)' }}>⬤ MRR (left axis)</span>
              <span style={{ color: 'var(--green)' }}>⬤ TPV (right axis)</span>
            </div>
          </div>
          {/* Insight callout */}
          <div style={{
            background: 'var(--blue-dim)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px', marginBottom: 10,
            fontSize: 12, color: 'var(--text)'
          }}>
            💡 Revenue is falling while platform usage grows +{tpvGrowth}%.
            This is a <strong>retention problem</strong>, not a product problem.
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendDataClean} margin={{ top: 4, right: 50, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                {/* Left axis: MRR */}
                <YAxis
                  yAxisId="mrr"
                  orientation="left"
                  tickFormatter={v => `$${(v/1e6).toFixed(1)}M`}
                  tick={{ fill: 'var(--red)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                {/* Right axis: TPV */}
                <YAxis
                  yAxisId="tpv"
                  orientation="right"
                  tickFormatter={v => `$${(v/1e6).toFixed(0)}M`}
                  tick={{ fill: 'var(--green)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                />
                <Tooltip content={<TrendTooltip />} />
                {/* MRR line — declining */}
                <Line
                  yAxisId="mrr"
                  type="monotone"
                  dataKey="mrr"
                  name="MRR"
                  stroke="var(--red)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {/* TPV line — growing */}
                <Line
                  yAxisId="tpv"
                  type="monotone"
                  dataKey="tpv"
                  name="TPV"
                  stroke="var(--green)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {/* Vertical line at August — the churn spike month */}
                <ReferenceLine
                  yAxisId="mrr"
                  x="Aug 24"
                  stroke="var(--red)"
                  strokeDasharray="4 4"
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
