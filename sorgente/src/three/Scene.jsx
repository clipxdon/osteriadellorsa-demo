// "Sotto l'Orsa Maggiore": un cielo di stelle sopra la piazzetta. All'apertura alcune stelle si radunano
// nella costellazione dell'Orsa; scorrendo, il cielo si condensa nella sagoma di un orso che cammina,
// poi diventa la piastra rovente con la costata della Madama la Piemonteisa, poi un calice di Barbera,
// e infine torna cielo. Un solo sistema di particelle (un draw call) più 13 segmenti per la costellazione.
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scene, isMobile, PALETTE } from '../store'

const N = isMobile ? 7000 : 16000
const PER_STAR = isMobile ? 34 : 60
const CW = 1400, CH = 800 // spazio di disegno dell'orso e della costellazione (pixel canvas)
const UNIT = 1 / 900      // pixel canvas → unità "orso" (larghezza ~1)

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }
const gauss = (rand) => { let u = 0, v = 0; while (u === 0) u = rand(); v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }

/* ---------- la costellazione, disegnata nello stesso spazio dell'orso: il manico del Grande Carro è la coda ---------- */
const STARS = [
  [330, 300], [440, 252], [545, 238], [655, 258], // 0 Alkaid, 1 Mizar, 2 Alioth, 3 Megrez
  [648, 392], [800, 405], [805, 268],             // 4 Phecda, 5 Merak, 6 Dubhe
  [935, 248], [1045, 262], [1160, 330],           // 7–9 collo e muso
  [880, 525], [905, 640],                         // 10–11 zampa anteriore
  [575, 525], [548, 640],                         // 12–13 zampa posteriore
]
const LINES = [[0, 1], [1, 2], [2, 3], [3, 6], [6, 5], [5, 4], [4, 3], [6, 7], [7, 8], [8, 9], [5, 10], [10, 11], [4, 12], [12, 13]]
const toUnit = ([x, y]) => [(x - CW / 2) * UNIT, (CH / 2 - y) * UNIT]

/* ---------- 1. l'orso: sagoma disegnata su canvas e campionata ---------- */
function bearTargets(rand) {
  const c = document.createElement('canvas')
  c.width = CW; c.height = CH
  const g = c.getContext('2d')
  g.fillStyle = '#fff'
  const el = (x, y, rx, ry, r = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); g.fill() }
  const leg = (x, y0, y1, w, lean = 0) => {
    g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x + w / 2, y0); g.lineTo(x + w / 2 + lean, y1 - 20)
    g.quadraticCurveTo(x + w / 2 + lean + 18, y1, x + lean, y1); g.lineTo(x - w / 2 + lean, y1); g.closePath(); g.fill()
  }
  el(690, 400, 300, 150)            // corpo
  el(600, 315, 190, 105, -0.12)     // gobba
  el(860, 370, 130, 120, 0.3)       // spalla
  g.beginPath(); g.moveTo(880, 280); g.quadraticCurveTo(960, 240, 1020, 262); g.lineTo(1060, 380); g.quadraticCurveTo(960, 430, 900, 450); g.fill() // collo
  el(1050, 320, 105, 82, 0.15)      // testa
  el(1150, 352, 70, 40, 0.25)       // muso
  el(1000, 246, 30, 28); el(1062, 240, 26, 25) // orecchie
  el(395, 350, 34, 26, -0.4)        // coda
  leg(905, 440, 680, 95, 12); leg(800, 470, 670, 80, -10)   // zampe anteriori
  leg(555, 440, 680, 110, -8); leg(450, 440, 660, 85, 10)   // zampe posteriori
  g.globalCompositeOperation = 'destination-out'
  el(1100, 312, 9, 9)               // occhio
  const data = g.getImageData(0, 0, CW, CH).data
  const pts = []
  for (let y = 0; y < CH; y += 2) for (let x = 0; x < CW; x += 2) if (data[(y * CW + x) * 4 + 3] > 140) pts.push(x, y)
  const out = new Float32Array(N * 3)
  const n = pts.length / 2
  for (let i = 0; i < N; i++) {
    const k = Math.floor(rand() * n) * 2
    const [ux, uy] = toUnit([pts[k] + (rand() - 0.5) * 2, pts[k + 1] + (rand() - 0.5) * 2])
    out[i * 3] = ux; out[i * 3 + 1] = uy; out[i * 3 + 2] = (rand() - 0.5) * 0.08
  }
  return out
}

/* ---------- 0. il cielo ---------- */
function skyTargets(rand) {
  const out = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    out[i * 3] = (rand() - 0.5) * 20
    out[i * 3 + 1] = (rand() - 0.5) * 12
    out[i * 3 + 2] = -7 + rand() * 7.5
  }
  return out
}

/* ---------- 2. la piastra con la costata ---------- */
function steakTargets(rand) {
  const out = new Float32Array(N * 3)
  const kind = new Float32Array(N) // 0 ferro, 1 carne, 2 segni della griglia, 3 osso, 4 braci
  // forma della costata (piano xz): lombo ovale + osso della costola
  const inSteak = (x, z) => ((x + 0.15) / 1.05) ** 2 + (z / 0.72) ** 2 < 1
  const inBone = (x, z) => x > 0.6 && x < 1.75 && Math.abs(z - 0.18 - (x - 0.6) * 0.08) < 0.1
  for (let i = 0; i < N; i++) {
    const u = rand()
    let x, y, z, k
    if (u < 0.34) { // piastra di ghisa a righe
      x = (rand() - 0.5) * 4.2; z = (rand() - 0.5) * 2.8
      const ridge = Math.round(z / 0.22) * 0.22
      if (rand() < 0.75) z = ridge + (rand() - 0.5) * 0.04
      y = 0; k = 0
    } else if (u < 0.42) { // braci che salgono
      x = (rand() - 0.5) * 3.6; z = (rand() - 0.5) * 2.4; y = 0.1; k = 4
    } else if (u < 0.5) { // osso
      do { x = 0.6 + rand() * 1.15; z = (rand() - 0.5) * 0.24 + 0.18 + (x - 0.6) * 0.08 } while (!inBone(x, z))
      y = 0.12 + rand() * 0.12; k = 3
    } else { // carne
      do { x = -1.2 + rand() * 2.1; z = (rand() - 0.5) * 1.5 } while (!inSteak(x, z))
      const top = rand() < 0.8
      y = top ? 0.32 + (rand() - 0.5) * 0.03 : rand() * 0.32
      // segni della griglia in diagonale
      const mark = Math.abs(((x * 0.8 + z * 0.6) / 0.26) % 1) < 0.22
      k = top && mark ? 2 : 1
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z; kind[i] = k
  }
  return { pos: out, kind }
}

/* ---------- 3. il calice di Barbera ---------- */
function glassTargets(rand) {
  const out = new Float32Array(N * 3)
  const kind = new Float32Array(N) // 0 vetro, 1 vino, 2 superficie del vino
  const bowlR = (y) => { const u = (y + 0.35) / 1.9; return 0.95 * Math.pow(Math.sin(Math.min(1, u) * Math.PI * 0.6 + 0.12), 0.7) * (1 - 0.18 * u * u) }
  const LIQ = 0.35
  for (let i = 0; i < N; i++) {
    const u = rand(), a = rand() * Math.PI * 2
    let r, y, k
    if (u < 0.12) { y = -1.75 + rand() * 0.04; r = Math.sqrt(rand()) * 0.72; k = 0 }         // piede
    else if (u < 0.18) { y = -1.75 + rand() * 1.42; r = 0.045 + (y < -1.6 ? (-1.6 - y) * 2 : 0); k = 0 } // stelo
    else if (u < 0.5) { y = -0.35 + rand() * 1.9; r = bowlR(y); k = 0 }                      // coppa
    else if (u < 0.62) { y = LIQ; r = Math.sqrt(rand()) * bowlR(LIQ) * 0.97; k = 2 }          // superficie
    else { y = -0.33 + rand() * (LIQ + 0.33); r = Math.sqrt(rand()) * bowlR(y) * 0.95; k = 1 } // vino
    out[i * 3] = Math.cos(a) * r; out[i * 3 + 1] = y; out[i * 3 + 2] = Math.sin(a) * r; kind[i] = k
  }
  return { pos: out, kind }
}

const vert = /* glsl */ `
  uniform float uP, uTime, uSize, uPix, uIntro;
  uniform float uCS, uBS, uStS, uGlS;
  uniform vec3 uCOff, uBOff, uSteakOff, uGlassOff;
  uniform mat3 uSteakTilt, uGlassTilt;
  uniform vec3 cStar, cMiele, cBronzo, cIron, cMeat, cMark, cBone, cEmber, cGlass, cWine, cWineTop;
  attribute vec3 aSky, aBear, aSteak, aGlass, aConst;
  attribute float aKS, aKG, aAnchor;
  attribute vec4 aRnd;
  varying vec3 vCol;
  varying float vA;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  float seg(float k) { float t = clamp((uP - k) * 1.6 - aRnd.x * 0.6, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }

  void main() {
    float s0 = seg(0.0), s1 = seg(1.0), s2 = seg(2.0), s3 = seg(3.0);
    float intro = clamp(uIntro * 1.5 - aRnd.y * 0.5, 0.0, 1.0);
    intro = intro * intro * (3.0 - 2.0 * intro);
    vec3 cons = vec3(aConst.xy, 0.0);
    vec3 sky = mix(aSky, cons * uCS + uCOff, intro * aAnchor);
    vec3 bear = mix(aBear, cons, aAnchor) * uBS + uBOff;
    vec3 steakP = aSteak;
    if (aKS > 3.5) steakP.y += fract(uTime * (0.12 + aRnd.w * 0.18) + aRnd.z) * 2.2; // braci che salgono
    vec3 steak = uSteakTilt * rotY(steakP * uStS, uTime * 0.07) + uSteakOff;
    vec3 glass = uGlassTilt * rotY(aGlass * uGlS, uTime * 0.1) + uGlassOff;

    vec3 p = sky;
    p = mix(p, bear, s0);
    p = mix(p, steak, s1);
    p = mix(p, glass, s2);
    p = mix(p, aSky * 1.2, s3);
    float morph = 4.0 * (s0 * (1.0 - s0) + s1 * (1.0 - s1) + s2 * (1.0 - s2) + s3 * (1.0 - s3));
    float amp = 0.008 + 0.45 * morph;
    float t = uTime;
    p += vec3(sin(t * 0.6 + aRnd.y * 6.283 + p.y), cos(t * 0.5 + aRnd.z * 6.283 + p.x * 0.7), sin(t * 0.4 + aRnd.w * 6.283)) * amp * (0.4 + aRnd.y * 0.6);

    // pesi dei cinque stati
    float w0 = 1.0 - s0, w1 = s0 * (1.0 - s1), w2 = s1 * (1.0 - s2), w3 = s2 * (1.0 - s3), w4 = s3;
    vec3 skyC = mix(cStar, cMiele, aAnchor * intro + step(0.93, aRnd.z) * 0.6);
    vec3 bearC = mix(cBronzo, cMiele, aAnchor + aRnd.w * 0.25);
    vec3 stC = aKS < 0.5 ? cIron : aKS < 1.5 ? cMeat : aKS < 2.5 ? cMark : aKS < 3.5 ? cBone : cEmber;
    vec3 glC = aKG < 0.5 ? cGlass : aKG < 1.5 ? cWine : cWineTop;
    vCol = skyC * (w0 + w4) + bearC * w1 + stC * w2 + glC * w3;

    float tw = 0.65 + 0.35 * sin(t * (1.0 + aRnd.w * 2.5) + aRnd.x * 40.0); // scintillio
    float glassA = aKG < 0.5 ? 0.7 : 1.0;
    float emberA = aKS > 3.5 ? (1.0 - fract(uTime * (0.12 + aRnd.w * 0.18) + aRnd.z)) : 1.0;
    vA = (0.5 + 0.5 * aRnd.z) * ((w0 + w4) * tw + w1 * 1.35 + w2 * emberA * 1.25 + w3 * glassA);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float big = aAnchor * (w0 * intro + w1) * 0.9 + (1.0 - aAnchor) * w1 * 0.3 + w2 * 0.25;
    float skySmall = (w0 + w4) * step(aRnd.z, 0.93) * 0.35;
    gl_PointSize = uSize * (0.45 + aRnd.w * 0.8) * (1.0 + big - skySmall) * uPix / -mv.z;
  }
`

const frag = /* glsl */ `
  varying vec3 vCol;
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = (smoothstep(0.5, 0.0, d) * 0.7 + smoothstep(0.18, 0.0, d) * 0.6) * vA;
    gl_FragColor = vec4(vCol * a, a);
  }
`

function tiltX(a) { return new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationX(a)) }
const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t) }

function Stars() {
  const { size, viewport, camera } = useThree()
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINES.length * 6), 3))
    return g
  }, [])
  const lineMat = useRef()
  const intro = useRef(0)

  const geo = useMemo(() => {
    const rand = rng(1803)
    const g = new THREE.BufferGeometry()
    const sky = skyTargets(rand)
    const steak = steakTargets(rand)
    const glass = glassTargets(rand)
    const cons = new Float32Array(N * 3)
    const anchor = new Float32Array(N)
    const units = STARS.map(toUnit)
    for (let s = 0; s < STARS.length; s++) for (let j = 0; j < PER_STAR; j++) {
      const i = s * PER_STAR + j
      anchor[i] = 1
      cons[i * 3] = units[s][0]; cons[i * 3 + 1] = units[s][1]
    }
    // ogni stella è un piccolo ammasso di particelle: al centro si sommano e brillano
    for (let i = 0; i < STARS.length * PER_STAR; i++) { const a = rand() * Math.PI * 2, r = Math.abs(gauss(rand)) * 0.01; cons[i * 3] += Math.cos(a) * r; cons[i * 3 + 1] += Math.sin(a) * r }
    const rnd = new Float32Array(N * 4)
    for (let i = 0; i < N * 4; i++) rnd[i] = rand()
    g.setAttribute('position', new THREE.BufferAttribute(sky, 3))
    g.setAttribute('aSky', new THREE.BufferAttribute(sky, 3))
    g.setAttribute('aBear', new THREE.BufferAttribute(bearTargets(rand), 3))
    g.setAttribute('aSteak', new THREE.BufferAttribute(steak.pos, 3))
    g.setAttribute('aKS', new THREE.BufferAttribute(steak.kind, 1))
    g.setAttribute('aGlass', new THREE.BufferAttribute(glass.pos, 3))
    g.setAttribute('aKG', new THREE.BufferAttribute(glass.kind, 1))
    g.setAttribute('aConst', new THREE.BufferAttribute(cons, 3))
    g.setAttribute('aAnchor', new THREE.BufferAttribute(anchor, 1))
    g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)
    return g
  }, [])

  const C = (h) => new THREE.Color(h)
  const uniforms = useMemo(() => ({
    uP: { value: 0 }, uTime: { value: 0 }, uIntro: { value: 0 }, uSize: { value: isMobile ? 24 : 28 }, uPix: { value: 1 },
    uCS: { value: 4 }, uBS: { value: 4 }, uStS: { value: 1.45 }, uGlS: { value: 1 },
    uCOff: { value: new THREE.Vector3() }, uBOff: { value: new THREE.Vector3() },
    uSteakOff: { value: new THREE.Vector3() }, uGlassOff: { value: new THREE.Vector3() },
    uSteakTilt: { value: tiltX(0.85) }, uGlassTilt: { value: tiltX(0.12) },
    cStar: { value: C(PALETTE.crema) }, cMiele: { value: C(PALETTE.miele) }, cBronzo: { value: C(PALETTE.bronzo) },
    cIron: { value: C('#8a93ab') }, cMeat: { value: C('#d0603f') }, cMark: { value: C('#6a2a1a') }, cBone: { value: C('#efe2c8') }, cEmber: { value: C('#ff8a3c') },
    cGlass: { value: C('#e4ecf7') }, cWine: { value: C(PALETTE.barbera) }, cWineTop: { value: C('#d0485a') },
  }), [])

  // layout responsivo rispetto ai testi HTML
  useEffect(() => {
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0])
    const narrow = size.width < 760
    const u = uniforms
    u.uCS.value = Math.min(vp.width * (narrow ? 0.95 : 0.55), 7.5)
    u.uCOff.value.set(narrow ? 0 : vp.width * 0.12, narrow ? vp.height * 0.2 : vp.height * 0.14, 0)
    u.uBS.value = Math.min(vp.width * (narrow ? 0.9 : 0.46), 6)
    u.uBOff.value.set(narrow ? 0 : vp.width * 0.2, narrow ? vp.height * 0.22 : 0, 0)
    u.uStS.value = narrow ? 0.85 : 1.45
    u.uGlS.value = narrow ? 0.6 : 1
    u.uSteakOff.value.set(narrow ? 0 : vp.width * 0.2, narrow ? vp.height * 0.24 : -0.3, 0)
    u.uGlassOff.value.set(narrow ? 0 : -vp.width * 0.2, narrow ? vp.height * 0.25 : 0, 0)
    u.uPix.value = size.height * Math.min(2, window.devicePixelRatio || 1) / 1000
  }, [size, viewport, camera, uniforms])

  useFrame((_, dt) => {
    const u = uniforms
    dt = Math.min(dt, 0.05)
    u.uTime.value += dt
    intro.current = Math.min(1, intro.current + dt / 2.8)
    u.uIntro.value = intro.current
    u.uP.value += (scene.p - u.uP.value) * Math.min(1, dt * 3)

    // la costellazione: si disegna all'apertura, segue l'orso, poi sparisce
    const p = u.uP.value
    const k = smooth(p)
    const draw = smooth((intro.current - 0.45) / 0.55)
    const arr = lineGeo.attributes.position.array
    const units = STARS.map(toUnit)
    const tf = ([x, y]) => [
      x * (u.uCS.value * (1 - k) + u.uBS.value * k) + u.uCOff.value.x * (1 - k) + u.uBOff.value.x * k,
      y * (u.uCS.value * (1 - k) + u.uBS.value * k) + u.uCOff.value.y * (1 - k) + u.uBOff.value.y * k,
    ]
    LINES.forEach(([a, b], i) => {
      const A = tf(units[a]), B = tf(units[b])
      const t = smooth(draw * LINES.length - i * 0.6)
      arr.set([A[0], A[1], 0, A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, 0], i * 6)
    })
    lineGeo.attributes.position.needsUpdate = true
    if (lineMat.current) lineMat.current.opacity = 0.42 * draw * (1 - smooth((p - 1.05) / 0.35))
  })

  return (
    <>
      <points geometry={geo} frustumCulled={false}>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments geometry={lineGeo} frustumCulled={false}>
        <lineBasicMaterial ref={lineMat} color={PALETTE.miele} transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </>
  )
}

function Rig() {
  const { camera } = useThree()
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 2)
    camera.position.x += (scene.pointer.x * 0.6 - camera.position.x) * k
    camera.position.y += (scene.pointer.y * 0.35 - camera.position.y) * k
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene({ active = true }) {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={isMobile ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 40, near: 0.1, far: 60, position: [0, 0, 8] }}
      >
        <Stars />
        <Rig />
      </Canvas>
    </div>
  )
}
