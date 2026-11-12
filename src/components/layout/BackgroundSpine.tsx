import type { CSSProperties } from 'react'
import { useSettings } from '../../store/SettingsStore'
import { ParticleField } from './ParticleField'
import styles from './BackgroundSpine.module.css'

// Hämtar bilden om den finns (webp, png eller jpg). Saknas den byggs appen ändå och en platshållare visas.
const found = import.meta.glob<string>('../../assets/spine-bg.{webp,png,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const imageUrl: string | undefined = Object.values(found)[0]

/**
 * Levande bakgrund med krom-/holografisk ryggrad (inspirerad av activetheory.net).
 *
 * Lager (nerifrån och upp):
 *  1. stage  – bilden svävar långsamt (andas) ...
 *     - image  – själva ryggraden
 *     - sheen  – en ljusare kopia som bara syns i ett diagonalt band som sveper längs kromet
 *  2. tint     – färgton i appens palett som långsamt skiftar turkos → lila → guld (oljefilm-känsla)
 *  3. particles – glittrande guldstoft som driver uppåt (canvas)
 *  4. vignette – mörka kanter så allt smälter in i --page-bg
 *  5. foreground – större, snabbare och suddigare partiklar framför ryggraden (djup)
 *  Dessutom tre "glint"-lager: ljusfläckar som vandrar över olika kotor i olika takt, så att olika delar glänser i olika ögonblick
 *
 * Bara i mörkt läge (bilden laddas inte i ljust läge). Respekterar "minska rörelser".
 * Bild: src/assets/spine-bg.webp – prompten för att generera om den finns i README.
 */
export function BackgroundSpine() {
  const { animated } = useSettings()
  if (!imageUrl) {
    return (
      <div className={styles.root} aria-hidden="true">
        <div className={styles.placeholder}>
          spine-bg.png saknas – generera med prompten i README eller lägg in en bild manuellt här:
          src/assets/spine-bg.png
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.root} ${animated ? '' : styles.still}`} aria-hidden="true" style={{ '--spine-url': `url("${imageUrl}")` } as CSSProperties}>
      <div className={styles.stage}>
        <div className={styles.image} />
        <div className={styles.sheen} />
        <div className={`${styles.glint} ${styles.glintA}`} />
        <div className={`${styles.glint} ${styles.glintB}`} />
        <div className={`${styles.glint} ${styles.glintC}`} />
      </div>
      <div className={styles.tint} />
      <ParticleField className={styles.particles} still={!animated} />
      <div className={styles.vignette} />
      <ParticleField still={!animated} className={styles.foreground} density={4} sizeScale={1.6} speedScale={2} colors={['#d9b35c', '#f0d89a', '#3fe8da', '#9b7bff']} />
    </div>
  )
}
