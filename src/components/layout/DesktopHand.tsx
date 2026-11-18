import styles from './DesktopHand.module.css'

/**
 * Dekor på datorskärm: en hand som håller telefonramen, i 3D-/lera-stil.
 * Tumme, handflata och handled ligger bakom ramen; fingrarna vilar mot ramens högerkant.
 * Koordinaterna utgår från ramens nedre vänstra ytterhörn (x åt höger, y uppåt negativt).
 * Syns bara när telefonramen visas (se AppShell) och tar inga klick.
 */
export function DesktopHand({ layer }: { layer: 'back' | 'front' }) {
  return (
    <div className={styles.hand} aria-hidden="true">
      {layer === 'back' ? <Back /> : <Front />}
    </div>
  )
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* hud: ljus överkant mot vänster, mörkare mot höger och nedåt */}
      <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0" stopColor="#f3cfbb" />
        <stop offset="0.5" stopColor="#e4b198" />
        <stop offset="1" stopColor="#c98a71" />
      </linearGradient>
      <radialGradient id={`${id}-thumb`} cx="0.35" cy="0.25" r="0.8">
        <stop offset="0" stopColor="#f8dccb" />
        <stop offset="0.6" stopColor="#e7b69d" />
        <stop offset="1" stopColor="#d39a81" />
      </radialGradient>
      <linearGradient id={`${id}-tube`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7dbc9" />
        <stop offset="0.4" stopColor="#ebbca4" />
        <stop offset="1" stopColor="#c7896f" />
      </linearGradient>
      <linearGradient id={`${id}-bend`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0.4" stopColor="#9c5d47" stopOpacity="0" />
        <stop offset="1" stopColor="#9c5d47" stopOpacity="0.45" />
      </linearGradient>
      <radialGradient id={`${id}-nail`} cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#fdebe2" />
        <stop offset="1" stopColor="#ecc4b3" />
      </radialGradient>
    </defs>
  )
}

/** Tumme längs vänsterkanten, handflata under telefonen och handled som går ut nedåt vänster */
function Back() {
  return (
    <svg className={styles.backSvg} viewBox="-340 -600 800 1200" width="800" height="1200">
      <Defs id="hb" />
      <path
        fill="url(#hb-skin)"
        d="M 0 -525 C -5 -560 -40 -578 -70 -563 C -100 -550 -113 -515 -114 -470
           L -118 -260 C -120 -150 -150 -60 -177 7 C -210 100 -270 260 -313 379
           L -340 600 L 30 600 L 95 379 C 180 230 280 110 313 60 C 345 15 380 -20 405 -73
           L 300 -400 Z"
      />
      {/* tummen: egen rundad form ovanpå handflatan */}
      <path
        fill="url(#hb-thumb)"
        d="M 0 -525 C -5 -560 -40 -578 -70 -563 C -100 -550 -113 -515 -114 -470 L -116 -300 C -100 -270 -50 -262 0 -270 Z"
      />
      {/* ljuskant och mjuk veckskugga där tummen möter handflatan */}
      <path d="M -100 -505 C -104 -440 -106 -360 -108 -300" stroke="#fde8dc" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M -112 -285 C -90 -262 -45 -255 -5 -262" stroke="#a8664f" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.22" />
    </svg>
  )
}

/** Ett finger: platt topp som trycker mot ramen till vänster, rund knoge till höger, något tjockare mot knogen */
function fingerPath(x: number, cy: number, w: number, h: number) {
  const hl = h * 0.84 // tunnare vid fingertoppen
  const rl = hl * 0.36 // fingertoppen är tillplattad mot telefonen
  const r = h / 2
  return `M ${x + rl} ${cy - hl / 2} L ${x + w - r} ${cy - r} A ${r} ${r} 0 0 1 ${x + w - r} ${cy + r} L ${x + rl} ${cy + hl / 2} A ${rl} ${hl / 2} 0 0 1 ${x + rl} ${cy - hl / 2} Z`
}

/** Fyra fingrar mot högerkanten; pekfingret överst. Ritas nerifrån så att varje finger ligger lite över det under. */
function Front() {
  const x = 401
  const fingers = [
    { cy: -425, w: 100, h: 78, tilt: -7 },
    { cy: -331, w: 104, h: 78, tilt: -3 },
    { cy: -241, w: 98, h: 72, tilt: 0 },
    { cy: -158, w: 82, h: 64, tilt: 4 },
  ]
  return (
    <svg className={styles.frontSvg} viewBox="380 -500 170 420" width="170" height="420">
      <Defs id="hf" />
      <defs>
        <filter id="hf-shadow" x="-20%" y="-30%" width="140%" height="170%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#5a2f20" floodOpacity="0.35" />
        </filter>
        <linearGradient id="hf-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4ec" stopOpacity="0.75" />
          <stop offset="0.35" stopColor="#fff4ec" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...fingers].reverse().map((f, i) => {
        const d = fingerPath(x, f.cy, f.w, f.h)
        const hl = f.h * 0.84
        return (
          <g key={i} transform={`rotate(${f.tilt} ${x} ${f.cy})`} filter="url(#hf-shadow)">
            <path d={d} fill="url(#hf-tube)" />
            <path d={d} fill="url(#hf-bend)" />
            <path d={d} fill="url(#hf-shine)" />
            {/* nageln: ljus, lite insjunken, i fingertoppens övre del */}
            <ellipse cx={x + 22} cy={f.cy - 3} rx="13" ry={hl / 2 - 11} fill="url(#hf-nail)" opacity="0.95" />
            <ellipse cx={x + 22} cy={f.cy - 3} rx="13" ry={hl / 2 - 11} fill="none" stroke="#c98d76" strokeOpacity="0.45" strokeWidth="1.2" />
            <ellipse cx={x + 18} cy={f.cy - hl / 2 + 16} rx="5" ry="3" fill="#fff" opacity="0.55" />
          </g>
        )
      })}
    </svg>
  )
}
