// SVG icons — replacing emojis for consistent, themeable visuals

function IconTrendDown({ color = 'var(--green)' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  )
}

function IconScore({ color = 'var(--blue)' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      <line x1="7" y1="8" x2="7" y2="12"/><line x1="12" y1="6" x2="12" y2="12"/>
      <line x1="17" y1="10" x2="17" y2="12"/>
    </svg>
  )
}

function IconUsers({ color = 'var(--gold)' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function IconRadar({ color = 'var(--blue)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    </svg>
  )
}

function IconQueue({ color = 'var(--gold)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function IconBrain({ color = 'var(--purple)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.66z"/>
    </svg>
  )
}

export default function Slide5Vision({ data }) {
  const bleed    = data.bleed_analysis
  const clusters = data.clusters

  const signals = [
    {
      Icon: IconTrendDown,
      iconColor: 'var(--green)',
      title: 'TPV Leading Indicator',
      desc: 'TPV drops precede MRR cancellation by 1–2 months. We have 12 months of TPV history per account.',
      status: 'Data available',
      badgeClass: 'badge-green',
    },
    {
      Icon: IconScore,
      iconColor: 'var(--blue)',
      title: 'Account Health Score',
      desc: 'Early-warning metric combining MRR and TPV trend signals. Flags accounts entering decline 1–2 months before they cancel — giving CS a concrete intervention window.',
      status: 'Framework defined',
      badgeClass: 'badge-blue',
    },
    {
      Icon: IconUsers,
      iconColor: 'var(--gold)',
      title: 'Customer Segments',
      desc: '4 distinct customer profiles identified from behavioral data. High-Risk accounts are separable from stable ones — detectable before they churn.',
      status: 'Model trained',
      badgeClass: 'badge-gold',
    },
  ]

  const capabilities = [
    {
      phase: 'Month 1–2',
      Icon: IconRadar,
      iconColor: 'var(--blue)',
      title: 'Account Health Monitor',
      desc: 'Run existing TPV/MRR data monthly. Score every account automatically. CS gets a ranked list — no guesswork about where to focus.',
      color: 'var(--blue)',
    },
    {
      phase: 'Month 3–4',
      Icon: IconQueue,
      iconColor: 'var(--gold)',
      title: 'CS Risk Queue',
      desc: 'Auto-rank the CS portfolio by risk score. Highest-risk accounts surface for outreach before formal churn registration.',
      color: 'var(--gold)',
    },
    {
      phase: 'Month 5–6',
      Icon: IconBrain,
      iconColor: 'var(--purple)',
      title: 'Forward-Looking Churn Prediction',
      desc: 'Only if Months 1–4 show the health score has predictive power. Earn this phase with results — do not promise it upfront.',
      color: 'var(--purple)',
    },
  ]

  const highRiskCluster = Object.entries(clusters).find(([k]) => k.includes('High-Risk'))

  return (
    <div className="slide">
      <div className="slide-header">
        <div>
          <div className="slide-tag">05 · Future Vision</div>
          <h1 className="slide-title">From reactive reporting to proactive intelligence</h1>
          <p className="slide-subtitle">
            The data we already have is sufficient to build an early warning system.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 0 }}>

        {/* Left: What we have */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
            What we already have
          </div>
          {signals.map((s) => (
            <div key={s.title} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
              <div style={{ flexShrink: 0, marginTop: 2, width: 36, height: 36, borderRadius: 10,
                background: `color-mix(in srgb, ${s.iconColor} 15%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <s.Icon color={s.iconColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              <span className={`badge ${s.badgeClass}`} style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                {s.status}
              </span>
            </div>
          ))}

          {/* Key data point */}
          {highRiskCluster && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid var(--red)',
              borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: 12, flexShrink: 0
            }}>
              <div style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>
                High-Risk segment: {Math.round(highRiskCluster[1].count)} accounts churned at 100%
              </div>
              <div style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                These accounts have a distinct behavioral fingerprint. An early-warning system running today would
                flag accounts that <strong style={{ color: 'var(--text)' }}>look like this</strong> — before they leave.
              </div>
            </div>
          )}
        </div>

        {/* Right: What we'd build */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
            What we would build (6-month roadmap)
          </div>
          {capabilities.map((c) => (
            <div key={c.title} className="card" style={{ flex: 1, borderLeft: `3px solid ${c.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8,
                    background: `color-mix(in srgb, ${c.color} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <c.Icon color={c.iconColor} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: c.color }}>{c.title}</div>
                </div>
                <span className="badge badge-muted">{c.phase}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, var(--blue-dim) 0%, var(--purple-dim) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px', flexShrink: 0
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
