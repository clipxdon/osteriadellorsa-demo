// Adapted from the React Bits "SplitText" pattern (github.com/DavidHDev/react-bits):
// splits a string into words/chars and reveals them with GSAP when scrolled into view.
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from '../store'

export default function SplitText({ text, as: Tag = 'h2', className = '', delay = 0, stagger = 0.035, start = 'top 85%', immediate = false }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion) return
    const chars = ref.current.querySelectorAll('.st-char')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { yPercent: 110, opacity: 0, rotate: 6 },
        {
          yPercent: 0, opacity: 1, rotate: 0, duration: 1.1, ease: 'expo.out', stagger, delay,
          scrollTrigger: immediate ? undefined : { trigger: ref.current, start, once: true },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [delay, stagger, start, immediate])

  const words = text.split(' ')
  return (
    <Tag ref={ref} className={`split ${className}`} aria-label={text}>
      {words.map((w, wi) => (
        <span className="st-word" key={wi} aria-hidden="true" style={{ marginRight: wi < words.length - 1 ? '0.24em' : 0 }}>
          {[...w].map((c, ci) => (
            <span className="st-char" key={ci}>{c}</span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
