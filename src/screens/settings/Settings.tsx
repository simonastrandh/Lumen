import { useState, type ReactNode } from 'react'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon, type IconName } from '../../components/ui/Icon'
import { IconBadge } from '../../components/ui/IconBadge'
import { durationLabel } from '../../components/pickers/TimeField'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { TimeWheel } from '../../components/pickers/MeasureFields'
import { useSettings } from '../../store/SettingsStore'
import styles from './Settings.module.css'

const KEY_PREFIX = 'styrkeloggen-'

/** Hämtar all appdata som sparats lokalt */
function readAllData(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith(KEY_PREFIX)) continue
    const raw = localStorage.getItem(k)
    try { out[k] = raw === null ? null : JSON.parse(raw) } catch { out[k] = raw }
  }
  return out
}

function Row({ icon, label, children, danger, onClick, stacked }: { icon: IconName; label: string; children?: ReactNode; danger?: boolean; onClick?: () => void; stacked?: boolean }) {
  const inner = (
    <>
      <span className={styles.rowHead}>
        <IconBadge icon={icon} size={40} />
        <span className={`${styles.label} ${danger ? styles.danger : ''}`}>{label}</span>
        {!stacked && <span className={styles.value}>{children}</span>}
        {onClick && <Icon name="chevronRight" size={16} className={styles.chevron} />}
      </span>
      {stacked && <span className={styles.control}>{children}</span>}
    </>
  )
  const cls = `${styles.row} ${stacked ? styles.stacked : ''}`
  return onClick ? (
    <button type="button" className={cls} onClick={onClick}>{inner}</button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

/**
 * Inställningar: standardvila, enheter (kg/km eller lb/miles), utseende (mörkt/ljust) och rensning av lokal data.
 * Enhet ändrar bara visningen: allt sparas i kg och km (se data/units.ts).
 */
export default function Settings() {
  const { defaultRest, setDefaultRest, units, setUnits, theme, setTheme } = useSettings()
  const [confirmClear, setConfirmClear] = useState(false)

  function clearAll() {
    Object.keys(readAllData()).forEach((k) => localStorage.removeItem(k))
    window.location.assign(import.meta.env.BASE_URL)
  }

  return (
    <>
      <h1 className={styles.top}>Inställningar</h1>

      <section className={styles.group} aria-label="Allmänt">
        <div className={styles.list}>
          <Row icon="clock" label="Standard vilotid">
            <TimeWheel title="Standard vilotid" display={durationLabel(defaultRest)} seconds={defaultRest} onChange={setDefaultRest} />
          </Row>
          <Row icon="workout" label="Enheter" stacked>
            <SegmentedControl label="Enheter" value={units} onChange={setUnits} options={[{ value: 'metric', label: 'kg · km' }, { value: 'imperial', label: 'lb · mi' }]} />
          </Row>
          <Row icon="settings" label="Utseende" stacked>
            <SegmentedControl label="Utseende" value={theme} onChange={setTheme} options={[{ value: 'dark', label: 'Mörkt' }, { value: 'light', label: 'Ljust' }]} />
          </Row>
        </div>
      </section>

      <section className={styles.dataGroup} aria-label="Data">
        <button type="button" className={styles.clear} onClick={() => setConfirmClear(true)}>
          <Icon name="trash" size={20} />
          <span className={styles.clearLabel}>Rensa all data</span>
          <Icon name="chevronRight" size={16} className={styles.chevron} />
        </button>
      </section>

      <footer className={styles.footer}>
        <strong>Lumen</strong>
        <span>Version 0.1.0</span>
      </footer>

      <BottomSheet open={confirmClear} onClose={() => setConfirmClear(false)} title="Rensa all data?">
        <p className={styles.note}>Alla pass, övningar, mål, historik och inställningar tas bort från den här enheten. Det går inte att ångra.</p>
        <Button variant="secondary" fullWidth onClick={clearAll} className={styles.danger}>Ja, rensa allt</Button>
        <Button variant="secondary" fullWidth onClick={() => setConfirmClear(false)}>Avbryt</Button>
      </BottomSheet>
    </>
  )
}
