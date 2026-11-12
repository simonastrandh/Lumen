import { useState, type ReactNode } from 'react'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon, type IconName } from '../../components/ui/Icon'
import { IconBadge } from '../../components/ui/IconBadge'
import { TextField } from '../../components/ui/TextField'
import { durationLabel } from '../../components/pickers/TimeField'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { Toggle } from '../../components/ui/Toggle'
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

function Row({ icon, label, children, danger, onClick }: { icon: IconName; label: string; children?: ReactNode; danger?: boolean; onClick?: () => void }) {
  const inner = (
    <>
      <IconBadge icon={icon} size={34} flat tone={danger ? 'accent-2' : 'accent'} />
      <span className={`${styles.label} ${danger ? styles.danger : ''}`}>{label}</span>
      <span className={styles.value}>{children}</span>
      {onClick && <Icon name="chevronRight" size={14} className={styles.chevron} />}
    </>
  )
  return onClick ? (
    <button type="button" className={styles.row} onClick={onClick}>{inner}</button>
  ) : (
    <div className={styles.row}>{inner}</div>
  )
}

/**
 * Inställningar (Figma "06 – Profil/Inställningar"). Anpassat efter vad appen faktiskt har:
 * namn, standardvila, animerad bakgrund samt rensning av lokal data.
 * Enhet (kg/km eller lb/miles) ändrar bara visningen: allt sparas i kg och km (se data/units.ts).
 */
export default function Settings() {
  const { name, setName, defaultRest, setDefaultRest, animated, setAnimated, units, setUnits } = useSettings()
  const [editingName, setEditingName] = useState(false)
  const [draft, setDraft] = useState(name)
  const [confirmClear, setConfirmClear] = useState(false)

  function clearAll() {
    Object.keys(readAllData()).forEach((k) => localStorage.removeItem(k))
    window.location.assign('/')
  }

  return (
    <>
      <header>
        <h1 className={styles.title}>Inställningar</h1>
        <p className={styles.sub}>Anpassa appen. Allt sparas bara på den här enheten.</p>
      </header>

      <button type="button" className={styles.profile} onClick={() => { setDraft(name); setEditingName(true) }}>
        <span className={styles.avatar} aria-hidden="true">{(name.trim()[0] ?? '?').toLocaleUpperCase('sv-SE')}</span>
        <span className={styles.profileText}>
          <span className={styles.profileName}>{name.trim() || 'Inget namn'}</span>
          <span className={styles.profileEdit}>{name.trim() ? 'Redigera namn' : 'Lägg till namn'}</span>
        </span>
        <Icon name="chevronRight" size={14} className={styles.chevron} />
      </button>

      <section className={styles.group} aria-labelledby="g-general">
        <h2 id="g-general" className={styles.groupTitle}>ALLMÄNT</h2>
        <div className={styles.list}>
          <Row icon="clock" label="Standard vilotid">
            <TimeWheel title="Standard vilotid" display={durationLabel(defaultRest)} seconds={defaultRest} onChange={setDefaultRest} />
          </Row>
          <Row icon="workout" label="Enheter">
            <SegmentedControl label="Enheter" value={units} onChange={setUnits} options={[{ value: 'metric', label: 'kg · km' }, { value: 'imperial', label: 'lb · mi' }]} />
          </Row>
          <Row icon="bolt" label="Animerad bakgrund">
            <Toggle checked={animated} onChange={setAnimated} label="Animerad bakgrund" />
          </Row>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="g-data">
        <h2 id="g-data" className={styles.groupTitle}>DATA</h2>
        <div className={styles.list}>
          <Row icon="trash" label="Rensa all data" danger onClick={() => setConfirmClear(true)} />
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>Lumen</strong>
        <span>Version 0.1.0</span>
      </footer>

      <BottomSheet open={editingName} onClose={() => setEditingName(false)} title="Ditt namn">
        <TextField label="Namn" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Visas i hälsningen på Hem" autoComplete="off" onKeyDown={(e) => { if (e.key === 'Enter') { setName(draft.trim()); setEditingName(false) } }} />
        <Button variant="primary" fullWidth onClick={() => { setName(draft.trim()); setEditingName(false) }}>Spara</Button>
        <p className={styles.note}>Lämna fältet tomt för en hälsning utan namn.</p>
      </BottomSheet>

      <BottomSheet open={confirmClear} onClose={() => setConfirmClear(false)} title="Rensa all data?">
        <p className={styles.note}>Alla pass, övningar, mål, historik och inställningar tas bort från den här enheten. Det går inte att ångra.</p>
        <Button variant="secondary" fullWidth onClick={clearAll} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Ja, rensa allt</Button>
        <Button variant="secondary" fullWidth onClick={() => setConfirmClear(false)}>Avbryt</Button>
      </BottomSheet>
    </>
  )
}
