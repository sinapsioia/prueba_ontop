import { useState, useEffect, useCallback } from 'react'
import data from './data/results.json'

import Slide1Revenue    from './slides/Slide1Revenue.jsx'
import Slide2Churn      from './slides/Slide2Churn.jsx'
import Slide3Patterns   from './slides/Slide3Patterns.jsx'
import Slide4Sensitivity from './slides/Slide4Sensitivity.jsx'
import Slide5Vision     from './slides/Slide5Vision.jsx'

// Each slide gets a label shown in the nav bar
const SLIDES = [
  { component: Slide1Revenue,     label: 'Revenue Health'    },
  { component: Slide2Churn,       label: 'Churn Story'       },
  { component: Slide3Patterns,    label: 'Hidden Patterns'   },
  { component: Slide4Sensitivity, label: 'The Stakes'        },
  { component: Slide5Vision,      label: 'Future Vision'     },
]

export default function App() {
  const [current, setCurrent] = useState(0)

  // Keyboard navigation: ← prev, → next
  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
      setCurrent(c => Math.min(c + 1, SLIDES.length - 1))
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')
      setCurrent(c => Math.max(c - 1, 0))
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const SlideComponent = SLIDES[current].component

  return (
    <>
      {/* Active slide — full screen */}
      <SlideComponent data={data} />

      {/* Fixed navigation bar at bottom center */}
      <nav className="nav">
        <button
          className="nav-btn"
          onClick={() => setCurrent(c => Math.max(c - 1, 0))}
          disabled={current === 0}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <div className="nav-dots">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              className={`nav-dot${i === current ? ' active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to ${s.label}`}
            />
          ))}
        </div>

        <button
          className="nav-btn"
          onClick={() => setCurrent(c => Math.min(c + 1, SLIDES.length - 1))}
          disabled={current === SLIDES.length - 1}
          aria-label="Next slide"
        >
          ›
        </button>

        <span className="nav-label">
          {current + 1} / {SLIDES.length} · {SLIDES[current].label}
        </span>
      </nav>
    </>
  )
}
