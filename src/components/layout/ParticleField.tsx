import { useEffect, useRef } from 'react'

interface ParticleFieldProps {
  className?: string
  /** Antal partiklar per 100 000 px² (anpassas efter skärmstorlek) */
  density?: number
  /** Färger att slumpa mellan – standard är guld med inslag av turkos och lila */
  colors?: string[]
  /** Storlek och hastighet jämfört med standard (förgrundslager: större och snabbare) */
  sizeScale?: number
  speedScale?: number
  /** Andel partiklar (0–1) som ibland blixtrar till som en liten stjärna */
  flares?: number
  /** Stillbild: partiklarna ritas en gång och rör sig inte */
  still?: boolean
}

interface Particle {
  x: number
  y: number
  r: number
  vy: number
  swayAmp: number
  swaySpeed: number
  phase: number
  twinkle: number
  flare: boolean
  sprite: HTMLCanvasElement
}

/** Förrenderad mjuk "glödprick" – mycket billigare än shadowBlur varje bildruta. */
function makeSprite(color: string): HTMLCanvasElement {
  const size = 32
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, color)
  g.addColorStop(0.25, color)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return c
}

/** Fyruddig stjärna som används när en partikel "blixtrar" */
function makeStar(color: string): HTMLCanvasElement {
  const size = 48
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const m = size / 2
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(m, 0)
  ctx.quadraticCurveTo(m, m, size, m)
  ctx.quadraticCurveTo(m, m, m, size)
  ctx.quadraticCurveTo(m, m, 0, m)
  ctx.quadraticCurveTo(m, m, m, 0)
  ctx.fill()
  const g = ctx.createRadialGradient(m, m, 0, m, m, 9)
  g.addColorStop(0, '#fff')
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return c
}

/**
 * Glittrande stoft som långsamt driver uppåt och slingrar sig.
 * Lätt: en canvas, förrenderade sprites, pausar när fliken inte syns,
 * och ritar bara en stillbild om användaren valt "minska rörelser".
 */
export function ParticleField({
  className,
  density = 14,
  colors = ['#d9b35c', '#d9b35c', '#d9b35c', '#f0d89a', '#3fe8da', '#9b7bff'],
  sizeScale = 1,
  speedScale = 1,
  flares = 0,
  still = false,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = still || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sprites = colors.map(makeSprite)
    const stars = colors.map(makeStar)
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let frame = 0
    let last = performance.now()

    const spawn = (anywhere: boolean): Particle => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10,
      r: (0.6 + Math.random() ** 2 * 2.4) * sizeScale, // de flesta små, några större
      vy: (4 + Math.random() * 10) * speedScale, // px/s uppåt
      swayAmp: 4 + Math.random() * 14,
      swaySpeed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.6 + Math.random() * 1.6,
      flare: Math.random() < flares,
      sprite: sprites[Math.floor(Math.random() * sprites.length)],
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(((width * height) / 100_000) * density)
      particles = Array.from({ length: count }, () => spawn(true))
    }

    const draw = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        if (!reduceMotion) {
          p.y -= p.vy * dt
          if (p.y < -10) Object.assign(p, spawn(false))
        }
        const time = t / 1000
        const x = p.x + Math.sin(time * p.swaySpeed + p.phase) * p.swayAmp
        // Glittrar: ljusstyrkan pulserar mjukt, och tonar ut i över- och underkant
        const edgeFade = Math.min(1, p.y / 80, (height - p.y) / 80)
        const alpha = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * p.twinkle + p.phase))) * Math.max(0, edgeFade)
        const size = p.r * 6
        ctx.globalAlpha = alpha
        ctx.drawImage(p.sprite, x - size / 2, p.y - size / 2, size, size)
        if (p.flare) {
          // Kort, skarp blixt ungefär var 4–8:e sekund per partikel
          const spike = Math.max(0, Math.sin(time * 0.9 * p.twinkle + p.phase * 3)) ** 24
          if (spike > 0.02) {
            const star = size * 2.3
            ctx.globalAlpha = spike * Math.max(0, edgeFade)
            ctx.drawImage(stars[Math.floor(p.phase * 10) % stars.length], x - star / 2, p.y - star / 2, star, star)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (t: number) => {
      if (width === 0) return // dold (t.ex. ljust läge) – ResizeObserver startar om när den syns
      draw(t)
      frame = requestAnimationFrame(loop)
    }

    const start = () => {
      cancelAnimationFrame(frame)
      last = performance.now()
      if (reduceMotion) draw(last)
      else frame = requestAnimationFrame(loop)
    }

    const onVisibility = () => (document.hidden ? cancelAnimationFrame(frame) : start())

    resize()
    start()
    const observer = new ResizeObserver(() => {
      resize()
      start()
    })
    observer.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- colors behandlas som konstant
  }, [density, still])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
