export default function Slide5Vision({ data }) {
  const bleed = data.bleed_analysis
  const clusters = data.clusters

  const signals = [
    {
      icon: '📉',
      title: 'TPV Leading Indicator',
      desc: 'TPV drops precede MRR cancellation by 1–2 months. We have 12 months of TPV history per account.',
      status: 'Data available',
      color: 'var(--green)',
    },
    {
      icon: '🔢',
      title: 'Bleed Score',
      desc: `Empirical threshold derived from churner data: ${bleed.tpv_threshold_empirical_pct}% TPV drop. Score = 0.4×|MRR Δ| + 0.6×|TPV Δ|.`,
      status: 'Framework defined',
      color: 'var(--blue)',
    },
    {
      icon: '👥',
      title: 'Behavioral Clusters',
      desc: 'K-Means model identifies 4 profiles. "High-Risk Bleeders" cluster (100% churn rate) is already separated from the rest.',
      status: 'Model trained',
      color: 'var(--amber)',
    },
  ]

  const capabilities = [
    {
      phase: 'Month 1–2',
      title: 'Live Bleed Monitor',
      desc: 'Ingest TPV/MRR data monthly. Score every account. Flag any that cross the empirical TPV threshold.',
      color: 'var(--blue)',
    },
    {
      phase: 'Month 3–4',
      title: 'CS Risk Queue',
      desc: 'Auto-rank the CS portfolio by risk score. Highest-risk accounts surface for outreach before formal churn registration.',
      color: 'var(--amber)',
    },
    {
      phase: 'Month 5–6',
      title: 'Predictive Model (v1)',
      desc: 'Train on early signals (Months 1–4) to predict churn by Month 8. Temporal train/test split avoids data leakage.',
      color: 'var(--purple)',
    },
  ]

  const highRiskCluster = Object.entries(clusters).find(([k]) => k.includes('High-Risk'))
  const scalerCluster   = Object.entries(clusters).find(([k]) => k.includes('Scalers'))

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">Slide 5 · Future Vision</div>
          <h1 className="slide-title">From reactive reporting to proactive intelligence</h1>
          <p className="slide-subtitle">
            The data we already have is sufficient to build an early warning system.
            This is what the CS team could operationalize next.
          </p>
        </div>
        <span className="brand">ontop</span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 0 }}>

        {/* Left: What we have */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            What we already have
          </div>
          {signals.map((s) => (
            <div key={s.title} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
              <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              <div className="badge badge-green" style={{
                flexShrink: 0, whiteSpace: 'nowrap',
                background: `color-mix(in srgb, ${s.color} 18%, transparent)`,
                color: s.color,
                border: `1px solid ${s.color}`,
              }}>
                {s.status}
              </div>
            </div>
          ))}

          {/* Key data point */}
          {highRiskCluster && scalerCluster && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid var(--red)',
              borderRadius: 10, padding: '12px 16px', fontSize: 12
            }}>
              <div style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>
                High-Risk Bleeders cluster: {Math.round(highRiskCluster[1].count)} accounts — 100% churn rate
              </div>
              <div style={{ color: 'var(--muted)' }}>
                This cluster is already algorithmically separable from stable accounts.
                A live model would have flagged these <strong style={{ color: 'var(--text)' }}>before</strong> they churned.
              </div>
            </div>
          )}
        </div>

        {/* Right: What we'd build */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            What we would build (6-month roadmap)
          </div>
          {capabilities.map((c) => (
            <div key={c.title} className="card" style={{ flex: 1, borderLeft: `3px solid ${c.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: c.color }}>{c.title}</div>
                <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--card-alt)', padding: '2px 8px', borderRadius: 4 }}>
                  {c.phase}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, var(--blue-dim) 0%, rgba(167,139,250,0.12) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px'
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              The #1 priority for Q2
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Deploy a <strong style={{ color: 'var(--text)' }}>monthly bleed score pipeline</strong> using existing TPV/MRR data.
              No new data collection needed. Gives the CS team a ranked risk list within 60 days.
              Target: reduce churn from <span style={{ color: 'var(--red)' }}>21.9%</span> →{' '}
              <span style={{ color: 'var(--green)' }}>15%</span> within 12 months,
              protecting <strong style={{ color: 'var(--green)' }}>~$3.7M</strong> in annual revenue.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
