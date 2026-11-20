import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import SplitText from './components/SplitText'
import CountUp from './components/CountUp'
import Magnetic from './components/Magnetic'
import { Piazzetta, StaticBear, StaticGlass } from './components/Art'
import { R, MENU, MADAMA, WINES, HOURS } from './content'
import { scene, reducedMotion, isMobile } from './store'

gsap.registerPlugin(ScrollTrigger)
const Scene = lazy(() => import('./three/Scene'))

const SECTIONS = [
  { id: 'storia', label: 'Dal 1803' },
  { id: 'carta', label: 'La carta' },
  { id: 'madama', label: 'La Madama' },
  { id: 'cantina', label: 'Cantina' },
  { id: 'info', label: 'Orari' },
]

function useLenis() {
  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({ duration: 1.35, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    window.__lenis = lenis
    return () => { gsap.ticker.remove(raf); lenis.destroy() }
  }, [])
}

const go = (id) => (e) => {
  e.preventDefault()
  const el = document.getElementById(id)
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -10 })
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
}

// Progresso della scena (0 cielo, 1 orsa, 2 piastra, 3 calice, 4 cielo), ancorato alle sezioni.
function useStory() {
  useEffect(() => {
    let anchors = []
    const top = (id) => document.getElementById(id).offsetTop
    const mid = (id) => { const el = document.getElementById(id); return el.offsetTop + el.offsetHeight / 2 }
    const compute = () => {
      const vh = window.innerHeight
      const max = document.documentElement.scrollHeight - vh
      anchors = [
        [0, 0],
        [vh * 0.2, 0],
        [top('storia') + vh * 0.05, 1],
        [top('carta'), 1.05],
        [top('madama') - vh * 0.1, 1.3],
        [mid('madama') - vh / 2, 2],
        [top('cantina') - vh * 0.15, 2.15],
        [mid('cantina') - vh / 2, 3],
        [top('asporto'), 3.1],
        [top('info'), 4],
        [max, 4],
      ]
    }
    const update = () => {
      const y = window.scrollY
      let p = 4
      for (let i = 0; i < anchors.length - 1; i++) {
        const [y0, p0] = anchors[i], [y1, p1] = anchors[i + 1]
        if (y <= y1) { p = p0 + (p1 - p0) * Math.min(1, Math.max(0, (y - y0) / Math.max(1, y1 - y0))); break }
      }
      scene.p = p
    }
    compute(); update()
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: () => { compute(); update() } })
    const move = (e) => { scene.pointer.x = e.clientX / window.innerWidth - 0.5; scene.pointer.y = 0.5 - e.clientY / window.innerHeight }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { st.kill(); window.removeEventListener('pointermove', move) }
  }, [])
}

function Mark() {
  // marchio originale: sette stelle del Grande Carro
  return (
    <svg viewBox="0 0 40 24" aria-hidden="true" className="mark">
      <path d="M3 9 L10 5 L17 4 L24 6 L24 16 L35 17 L35 7 L24 6" />
      {[[3, 9], [10, 5], [17, 4], [24, 6], [24, 16], [35, 17], [35, 7]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.9" />)}
    </svg>
  )
}

function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const st = ScrollTrigger.create({ start: 80, end: 'max', onToggle: (s) => setScrolled(s.isActive) })
    return () => st.kill()
  }, [])
  const nav = (id) => (e) => { setOpen(false); go(id)(e) }
  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <a href="#top" onClick={nav('top')} className="wordmark" aria-label="Antica Osteria dell'Orsa, torna su">
        <Mark /><span>Osteria dell&rsquo;Orsa</span>
      </a>
      <button className="burger" aria-expanded={open} aria-controls="menu-nav" onClick={() => setOpen(!open)}>
        <span className="sr-only">Menu</span><i /><i />
      </button>
      <nav id="menu-nav" aria-label="Sezioni">
        {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`} onClick={nav(s.id)}>{s.label}</a>)}
        <a href={R.tel} className="nav-cta">Prenota</a>
      </nav>
    </header>
  )
}

// Le sette stelle del Grande Carro si accendono mentre scorri.
function StarMeter() {
  const ref = useRef(null)
  useEffect(() => {
    const dots = ref.current.querySelectorAll('circle')
    const st = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => dots.forEach((d, i) => d.classList.toggle('on', s.progress >= i / 7 + 0.02)),
    })
    return () => st.kill()
  }, [])
  return (
    <svg className="meter" ref={ref} viewBox="0 0 24 120" aria-hidden="true">
      <path d="M12 6 L8 22 L10 38 L14 54 L4 66 L6 86 L18 84 L14 54" />
      {[[12, 6], [8, 22], [10, 38], [14, 54], [4, 66], [6, 86], [18, 84]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" />)}
    </svg>
  )
}

function useDraw(ref, opts = {}) {
  useEffect(() => {
    if (reducedMotion) return
    const paths = ref.current.querySelectorAll('.draw')
    paths.forEach((p) => { const l = p.getTotalLength ? p.getTotalLength() : 400; p.style.strokeDasharray = l; p.style.strokeDashoffset = l })
    const tw = gsap.to(paths, {
      strokeDashoffset: 0, ease: 'none', stagger: 0.06,
      scrollTrigger: { trigger: ref.current, start: opts.start || 'top 80%', end: opts.end || 'bottom 45%', scrub: 0.8 },
    })
    return () => tw.scrollTrigger && tw.scrollTrigger.kill()
  }, [])
}

function Hero({ ready3d }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.ht-line > span', { yPercent: 105, duration: 1.6, ease: 'expo.out', stagger: 0.12, delay: 0.3 })
      gsap.from('.hero-in', { opacity: 0, y: 24, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.9 })
      gsap.to('.hero-fade', { opacity: 0, y: -50, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: '55% top', scrub: true } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="top" className={`hero ${ready3d ? 'has-3d' : ''}`} ref={ref}>
      <p className="kicker hero-in hero-fade"><span>Osteria piemontese</span><span>Savigliano</span><span>dal 1803</span></p>
      <div className="hero-main hero-fade">
        <h1 className="hero-title">
          <span className="ht-line ht-small"><span>Antica Osteria</span></span>
          <span className="ht-line"><span>dell&rsquo;<em>Orsa</em></span></span>
        </h1>
        <p className="lead hero-in">Cucina piemontese in una piazzetta del centro storico di Savigliano. Due salette, il vitello tonnato, i tajarin e la Madama la Piemonteisa, sotto la stessa stella da più di due secoli.</p>
        <div className="ctas hero-in">
          <Magnetic className="btn btn-gold" href={R.tel}>Prenota · {R.phone}</Magnetic>
          <Magnetic className="btn btn-ghost" href="#carta" onClick={go('carta')}>Sfoglia la carta</Magnetic>
        </div>
        <p className="badge hero-in"><span className="stars" aria-hidden="true">★★★★½</span>4,5 su Google · oltre 400 recensioni</p>
      </div>
      <p className="sky-note hero-in hero-fade" aria-hidden="true">Ursa Major</p>
      <a href="#storia" onClick={go('storia')} className="scroll-hint">Scorri <span aria-hidden="true">↓</span></a>
    </section>
  )
}

function SectionHead({ n, kicker, title, children }) {
  return (
    <header className="s-head">
      <p className="s-kicker"><span className="s-n">{n}</span>{kicker}</p>
      <SplitText text={title} className="h2" />
      {children}
    </header>
  )
}

function Storia() {
  const ref = useRef(null)
  const art = useRef(null)
  useDraw(art, { start: 'top 85%', end: 'bottom 60%' })
  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.facts li', { opacity: 0, y: 24, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.facts', start: 'top 88%', once: true } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="storia" className="section storia" ref={ref}>
      <div className="storia-grid">
        <div className="panel">
          <SectionHead n="I" kicker="Dal 1803" title="Un’osteria in piazzetta, da due secoli." />
          <p className="s-lead">In Piazza Cesare Battisti, nel cuore del centro storico di Savigliano, si mangia dal 1803.</p>
          <p>Due salette raccolte e una cucina che non ha bisogno di inseguire le mode: la carne cruda battuta al coltello, gli agnolotti fatti in casa, il bonet. Le ricette piemontesi di sempre, servite come si faceva in osteria.</p>
          <ul className="facts">
            <li><b><CountUp to={1803} duration={2.2} /></b><span>l&rsquo;anno sull&rsquo;insegna</span></li>
            <li><b><CountUp to={2} /></b><span>salette</span></li>
            <li><b><CountUp to={6} /></b><span>giorni aperti</span></li>
          </ul>
        </div>
        <figure className="piazzetta" ref={art}>
          <Piazzetta />
          <figcaption>Piazza Cesare Battisti, 5</figcaption>
        </figure>
      </div>
      <div className="static-art static-bear"><StaticBear /></div>
    </section>
  )
}

function Carta() {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.chart', { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.chart', start: 'top 88%', once: true } })
      gsap.utils.toArray('.course').forEach((c) => {
        gsap.from(c.querySelectorAll('li'), { opacity: 0, x: -16, duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: c, start: 'top 85%', once: true } })
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="carta" className="section carta" ref={ref}>
      <SectionHead n="II" kicker="La carta" title="Le stelle della carta.">
        <p className="s-lead">Quattro portate, come quattro stelle da seguire. La carta cambia con le stagioni: questa è quella di adesso.</p>
      </SectionHead>
      <div className="chart">
        <div className="chart-in">
          {MENU.map((c) => (
            <div className="course" key={c.id}>
              <p className="course-star"><span aria-hidden="true">✦</span>{c.star}</p>
              <h3>{c.title}</h3>
              <ul>{c.dishes.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="chart-foot">Molti piatti sono disponibili senza glutine: chiedi in sala · prezzi e piatti del giorno in osteria</p>
      </div>
    </section>
  )
}

function Madama() {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.madama-steps li', { opacity: 0, y: 20, duration: 0.9, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.madama-steps', start: 'top 82%', once: true } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="madama" className="section madama" ref={ref}>
      <div className="sticky-panel glass">
        <SectionHead n="III" kicker="Il piatto della casa" title="Madama la Piemonteisa." />
        <p className="s-lead">Una costata di vitella femmina di razza piemontese, circa seicento grammi, cotta alla piastra.</p>
        <p>La accompagna una salsa che viene da lontano: un&rsquo;antica ricetta tratta dal ricettario della Contessa di Santa Rosa. Per chi vuole tutta la carne, c&rsquo;è il menu dedicato.</p>
        <ol className="madama-steps">
          {MADAMA.map((m) => <li key={m.t}><b>{m.t}</b><span>{m.d}</span></li>)}
        </ol>
        <Magnetic className="btn btn-gold" href={R.tel}>Prenota la Madama</Magnetic>
      </div>
    </section>
  )
}

function Cantina() {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.wines li', { opacity: 0, x: 20, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.wines', start: 'top 82%', once: true } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="cantina" className="section cantina" ref={ref}>
      <div className="cantina-card glass">
        <SectionHead n="IV" kicker="La cantina" title="Un calice per ogni piatto." />
        <p className="s-lead">Una carta dei vini ampia, divisa in sette capitoli: dalle mezze bottiglie alle birre artigianali.</p>
        <ul className="wines">
          {WINES.map((w) => <li key={w.t}><b>{w.t}</b><span>{w.d}</span></li>)}
        </ul>
        <p className="small muted">Chiedi in sala il consiglio per l&rsquo;abbinamento: la carta completa è sempre al tavolo.</p>
        <div className="static-art"><StaticGlass /></div>
      </div>
    </section>
  )
}

function Asporto() {
  return (
    <section id="asporto" className="section asporto">
      <SectionHead n="V" kicker="Asporto e feste" title="L’Orsa anche a casa tua." />
      <div className="duo">
        <div className="card">
          <h3>Sempre da asporto</h3>
          <p>Tutta la carta si può portare a casa. Chiama o scrivi su WhatsApp, e passa a ritirare in piazzetta.</p>
          <div className="ctas">
            <Magnetic className="btn btn-ghost" href={R.wa} target="_blank" rel="noopener">WhatsApp · {R.whatsapp}</Magnetic>
          </div>
        </div>
        <div className="card card-gold">
          <h3>Le feste all&rsquo;Orsa</h3>
          <p>Per Natale e per le feste l&rsquo;osteria prepara un menu dedicato. Le date si riempiono presto: meglio prenotare per tempo.</p>
          <div className="ctas">
            <Magnetic className="btn btn-dark" href={R.tel}>Prenota per le feste</Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}

function Info() {
  const [now, setNow] = useState(null)
  useEffect(() => { setNow(new Date()) }, [])
  return (
    <section id="info" className="section info">
      <SectionHead n="VI" kicker="Orari e prenotazioni" title="Ti aspettiamo in piazzetta." />
      <div className="contact-grid">
        <div className="card">
          <h3>Orari</h3>
          <ul className="hours">
            {HOURS.map((h) => (
              <li key={h.d} className={`${now && now.getDay() === h.i ? 'today' : ''} ${h.h === 'Chiuso' ? 'closed' : ''}`}><span>{h.d}</span><span>{h.h}</span></li>
            ))}
          </ul>
          <p className="muted small">La prenotazione è gradita.</p>
        </div>
        <div className="card card-gold">
          <h3>Prenota un tavolo</h3>
          <a className="big-link" href={R.tel}>{R.phone}</a>
          <p className="small">Oppure su WhatsApp al {R.whatsapp}.</p>
          <div className="ctas">
            <Magnetic className="btn btn-dark" href={R.tel}>Chiama ora</Magnetic>
            <Magnetic className="btn btn-line" href={R.wa} target="_blank" rel="noopener">WhatsApp</Magnetic>
          </div>
        </div>
        <div className="card">
          <h3>Dove siamo</h3>
          <p><b>{R.address}</b><br />{R.city}</p>
          <p className="small muted">Nel centro storico di Savigliano, in una piazzetta tranquilla.</p>
          <a className="link-arrow" href={R.maps} target="_blank" rel="noopener">Apri in Google Maps →</a>
          <a className="link-arrow" href={`mailto:${R.email}`}>Scrivici una mail →</a>
          <a className="link-arrow" href={R.facebook} target="_blank" rel="noopener">Facebook →</a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <p className="f-big" aria-hidden="true">dell&rsquo;Orsa</p>
      <div className="f-row">
        <p>© 2026 {R.name} · {R.address}, {R.city}</p>
        <p>Bozza dimostrativa: testi indicativi, scena 3D e disegni originali.</p>
      </div>
    </footer>
  )
}

export default function App() {
  useLenis()
  useStory()
  const [show3d, setShow3d] = useState(false)
  const [active, setActive] = useState(true)
  useEffect(() => {
    if (!reducedMotion) {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200))
      idle(() => setShow3d(true))
    }
    // la carta è un pannello opaco: quando copre lo schermo il 3D si mette in pausa
    const st = ScrollTrigger.create({ trigger: '.chart', start: 'top top', end: 'bottom bottom', onToggle: (s) => setActive(!s.isActive) })
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => st.kill()
  }, [])
  return (
    <>
      <div className="static-bg" aria-hidden="true" />
      {show3d && <Suspense fallback={null}><Scene active={active} /></Suspense>}
      <a className="skip" href="#storia">Vai al contenuto</a>
      <Nav />
      <main>
        <Hero ready3d={show3d} />
        <Storia />
        <Carta />
        <Madama />
        <Cantina />
        <Asporto />
        <Info />
      </main>
      <Footer />
      <StarMeter />
    </>
  )
}
