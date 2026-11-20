// Stato condiviso della scena: lo scroll scrive, il loop di R3F legge (nessun re-render React).
export const scene = {
  p: 0,            // progresso 0..4 (cielo → orsa → piastra → calice → cielo)
  pointer: { x: 0, y: 0 },
}

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isMobile =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches

// Design DNA: Antica Osteria dell'Orsa, "Sotto l'Orsa Maggiore"
export const PALETTE = {
  notte: '#0E1424',
  bronzo: '#B8885A',
  miele: '#E7C08A',
  crema: '#F3EADB',
  barbera: '#9E2B36',
}

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
