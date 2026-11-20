// Small "magnetic" pull on hover for primary buttons (pointer devices only).
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { reducedMotion, isMobile } from '../store'

export default function Magnetic({ as: Tag = 'a', strength = 0.3, children, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion || isMobile) return
    const el = ref.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - r.left - r.width / 2) * strength)
      yTo((e.clientY - r.top - r.height / 2) * strength)
    }
    const leave = () => { xTo(0); yTo(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [strength])
  return <Tag ref={ref} {...rest}>{children}</Tag>
}
