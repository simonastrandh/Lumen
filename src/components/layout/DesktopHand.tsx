import styles from './DesktopHand.module.css'

/**
 * Dekor på datorskärm: en hand som håller telefonramen. Tummen och handflatan ligger bakom ramen,
 * fingertopparna ligger över ramens kant. Syns bara när telefonramen visas (se AppShell) och tar inga klick.
 */
export function DesktopHand({ layer }: { layer: 'back' | 'front' }) {
  return (
    <div className={`${styles.hand} ${layer === 'back' ? styles.back : styles.front}`} aria-hidden="true">
      {layer === 'back' ? <Back /> : <Front />}
    </div>
  )
}

/** Hudtoner: ljus överkant, mörkare undersida, så att formerna ser rundade ut */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f4d2bf" />
        <stop offset="0.55" stopColor="#e6b49b" />
        <stop offset="1" stopColor="#cf9078" />
      </linearGradient>
      <linearGradient id={`${id}-tube`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6d8c6" />
        <stop offset="0.45" stopColor="#e8b9a1" />
        <stop offset="1" stopColor="#c98a72" />
      </linearGradient>
      {/* fingret böjer bort bakom telefonen: mörkare mot höger */}
      <linearGradient id={`${id}-bend`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0.35" stopColor="#a8664f" stopOpacity="0" />
        <stop offset="1" stopColor="#a8664f" stopOpacity="0.55" />
      </linearGradient>
      <radialGradient id={`${id}-nail`} cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#fbe6dc" />
        <stop offset="1" stopColor="#e9bfae" />
      </radialGradient>
    </defs>
  )
}

/** Tumme och handflata bakom ramen: tummen går längs vänsterkanten, handleden försvinner nedåt vänster */
function Back() {
  return (
    <svg className={styles.backSvg} viewBox="-320 0 640 1100" width="640" height="1100">
      <Defs id="hb" />
      <path
        d="M -1 327 A 37 37 0 0 0 -75 327 L -78 520 C -80 570 -120 600 -135 650 C -170 740 -230 880 -300 1100 L 120 1100 L 120 800 L -1 700 Z"
        fill="url(#hb-skin)"
      />
      {/* ljuskant längs tummens vänstersida och en mjuk skugga där tummen möter handflatan */}
      <path d="M -66 335 C -68 420 -70 480 -72 520" stroke="#fbe3d5" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M -100 590 C -85 560 -50 540 -18 540" stroke="#b9775f" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.18" />
    </svg>
  )
}

/** Fyra fingrar som vilar mot ramens högerkant, med naglar vid topparna */
function Front() {
  const fingers = [
    { y: 0, w: 88, tilt: -6 },
    { y: 54, w: 80, tilt: -2 },
    { y: 108, w: 72, tilt: 1 },
    { y: 160, w: 60, tilt: 4 },
  ]
  return (
    <svg className={styles.frontSvg} viewBox="380 -20 170 260" width="170" height="260">
      <Defs id="hf" />
      {fingers.map((f, i) => (
        <g key={i} transform={`rotate(${f.tilt} 392 ${f.y + 22})`}>
          <rect x="392" y={f.y} width={f.w} height="50" rx="25" fill="url(#hf-tube)" />
          <rect x="392" y={f.y} width={f.w} height="50" rx="25" fill="url(#hf-bend)" />
          <ellipse cx="410" cy={f.y + 23} rx="12" ry="15" fill="url(#hf-nail)" stroke="#d9a691" strokeWidth="1" />
          <path d={`M 414 ${f.y + 5} H ${392 + f.w - 22}`} stroke="#fdeee5" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
        </g>
      ))}
    </svg>
  )
}
