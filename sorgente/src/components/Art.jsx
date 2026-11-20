// Disegni originali a tratto (si "disegnano" allo scroll con la classe .draw).

// La piazzetta: un portone ad arco sotto i portici, l'insegna con la stella appesa.
export function Piazzetta() {
  return (
    <svg viewBox="0 0 420 380" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Disegno: il portone dell'osteria sulla piazzetta, con l'insegna e una stella">
      <path className="draw" d="M20 360 H400" />
      <path className="draw" d="M40 360 V120 H380 V360" />
      <path className="draw" d="M40 120 L60 92 H360 L380 120" />
      <path className="draw" d="M60 92 V60 H360 V92" />
      <path className="draw" d="M60 60 L72 40 H348 L360 60" />
      {/* finestre con persiane */}
      <path className="draw" d="M84 150 h60 v80 h-60 z M114 150 v80 M84 190 h60" />
      <path className="draw" d="M276 150 h60 v80 h-60 z M306 150 v80 M276 190 h60" />
      {/* portone ad arco */}
      <path className="draw" d="M165 360 V250 a45 45 0 0 1 90 0 V360" />
      <path className="draw" d="M210 205 V360 M175 300 h20 M225 300 h20" />
      {/* lanterna */}
      <path className="draw" d="M210 130 v22 M200 152 h20 l-4 22 h-12 z" />
      {/* insegna a bandiera */}
      <path className="draw" d="M380 140 h28 M396 140 v10" />
      <path className="draw" d="M372 150 h48 v40 h-48 z" />
      <path className="draw star-fill" d="M396 158 l4 9 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1 z" />
      {/* tavolino in piazzetta */}
      <path className="draw" d="M60 330 h70 M95 330 v30 M80 360 h30" />
      <path className="draw" d="M300 330 h70 M335 330 v30 M320 360 h30" />
      <path className="draw" d="M320 330 v-14 h10 v14 M90 330 v-18 a6 6 0 0 1 10 0 v18" />
      <text x="210" y="84" textAnchor="middle" className="svg-sign">OSTERIA · 1803</text>
    </svg>
  )
}

export function StaticBear() {
  return (
    <svg viewBox="0 0 1400 800" fill="currentColor" aria-hidden="true">
      <ellipse cx="690" cy="400" rx="300" ry="150" /><ellipse cx="600" cy="315" rx="190" ry="105" /><ellipse cx="860" cy="370" rx="130" ry="120" />
      <ellipse cx="1050" cy="320" rx="105" ry="82" /><ellipse cx="1150" cy="352" rx="70" ry="40" /><circle cx="1000" cy="246" r="29" /><circle cx="1062" cy="240" r="25" />
      <path d="M880 280 Q960 240 1020 262 L1060 380 Q960 430 900 450 Z" />
      <path d="M858 440 h95 l10 220 q0 20 -20 20 h-90 z M760 470 h80 l-10 200 h-80 z M500 440 h110 l-8 220 q0 20 -20 20 h-90 z M408 440 h85 l12 220 h-85 z" />
    </svg>
  )
}

export function StaticGlass() {
  return (
    <svg viewBox="0 0 200 300" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M50 20 C40 90 50 140 100 160 C150 140 160 90 150 20" />
      <path d="M58 100 C64 135 80 150 100 152 C120 150 136 135 142 100 Z" fill="#9E2B36" stroke="none" />
      <path d="M100 160 V260 M60 270 Q100 255 140 270" />
    </svg>
  )
}
