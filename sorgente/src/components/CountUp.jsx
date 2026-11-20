// React Bits "CountUp"-style counter driven by GSAP + ScrollTrigger.
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { reducedMotion } from '../store'

export default function CountUp({ to, duration = 1.6, suffix = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion) { ref.current.textContent = to + suffix; return }
    const o = { v: 0 }
    const tw = gsap.to(o, {
      v: to, duration, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
      onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(o.v) + suffix },
    })
    return () => tw.kill()
  }, [to, duration, suffix])
  return <span ref={ref}>0{suffix}</span>
}
