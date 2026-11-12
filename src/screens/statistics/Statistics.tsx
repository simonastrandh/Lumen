import { kgToDisplay, toDisplay, unitLabel, weightUnit } from '../../data/units'
import { useState } from 'react'
import { BarChart } from '../../components/ui/BarChart'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { IconBadge } from '../../components/ui/IconBadge'
import { LineChart } from '../../components/ui/LineChart'
import { showFor } from '../../components/pickers/MeasureFields'
import { SearchField } from '../../components/ui/SearchField'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { StatChip } from '../../components/ui/StatChip'
import { formatTime } from '../../components/pickers/TimeField'
import {
  ago,
  averageStrengthIncrease,
  exerciseSummary,
  loggedExercises,
  metricUnit,
  strengthIncreases,
  totalSeconds,
  totalVolume,
  weeksInRow,
  workoutsPerMonth,
  workoutsThisMonth,
} from '../../data/stats'
import { useWorkoutStore, type CompletedWorkout } from '../../store/WorkoutStore'
import { ExercisePicker } from '../home/ExercisePicker'
import { describeSets, describeValues } from '../workouts/labels'
import styles from './Statistics.module.css'

type Tab = 'overview' | 'exercise'
type Range = '4v' | '3m' | 'ar' | 'allt'
const rangeDays: Record<Range, number> = { '4v': 28, '3m': 92, ar: 365, allt: Infinity }
const norm = (t: string) => t.toLocaleLowerCase('sv-SE').trim()

const when = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
const comma = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',')
const sign = (n: number) => (n > 0 ? '+' : '')

/** Statistik över avslutade pass. Varje pass som avslutas i Aktivt pass loggas här (Figma "05 – Statistik"). */
export default function Statistics() {
  const { history } = useWorkoutStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [range, setRange] = useState<Range>('allt')
  const cutoff = Date.now() - rangeDays[range] * 24 * 3600 * 1000
  const inRange = history.filter((h) => new Date(h.completedAt).getTime() >= cutoff)

  return (
    <>
      <header>
        <h1 className={styles.title}>Statistik</h1>
        <p className={styles.sub}>{tab === 'overview' ? 'Din utveckling totalt sett' : 'Din utveckling i en övning'}</p>
      </header>
      <SegmentedControl<Tab>
        label="Visa statistik"
        value={tab}
        onChange={setTab}
        options={[{ value: 'overview', label: 'Översikt' }, { value: 'exercise', label: 'Per övning' }]}
      />
      {tab === 'overview' && history.length > 0 && (
        <SegmentedControl<Range>
          label="Tidsperiod"
          value={range}
          onChange={setRange}
          options={[{ value: '4v', label: '4 v' }, { value: '3m', label: '3 mån' }, { value: 'ar', label: 'År' }, { value: 'allt', label: 'Allt' }]}
        />
      )}
      {history.length === 0 ? (
        <p className={styles.empty}>Inga pass loggade än. När du avslutar ett pass i Aktivt pass sparas det här med tid, set och vikt.</p>
      ) : tab === 'overview' ? (
        <Overview history={inRange} />
      ) : (
        <PerExercise />
      )}
    </>
  )
}

function Overview({ history }: { history: CompletedWorkout[] }) {
  const { exerciseStats, deleteHistoryEntry, getExercise } = useWorkoutStore()
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const deletingEntry = history.find((h) => h.completedAt === deleting)
  const q = norm(query)
  const matches = [...history].reverse().filter((h) => !q || norm(h.name).includes(q) || (h.exercises ?? []).some((e) => norm(e.name).includes(q)))
  const recent = q ? matches : matches.slice(0, 8)
  const bests = Object.entries(exerciseStats)
    .map(([id, st]) => {
      const ex = getExercise(id)
      const show = showFor(ex?.kind, ex?.measure, ex?.strengthMeasure)
      // Bara de mått som övningen mäts i just nu
      const best = Object.fromEntries(Object.entries(st.best).filter(([m]) => show[m as 'kg' | 'reps' | 'seconds' | 'km']))
      // Bästa setet som en enhet (t.ex. "3 km på 20 min"); äldre poster utan bästa set faller tillbaka på enskilda bästa värden
      const set = st.bestSet ? Object.fromEntries(Object.entries(st.bestSet).filter(([m]) => (m === 'minutes' ? show.minutes : show[m as 'kg' | 'reps' | 'seconds' | 'km']))) : undefined
      return { id, name: ex?.name, best: best as typeof st.best, set }
    })
    .filter((e) => e.name && Object.keys(e.best).length > 0)

  const avg = averageStrengthIncrease(history)
  const increases = strengthIncreases(history)
  const latest = increases[0]
  const more = increases.slice(1, 5)
  const monthly = workoutsPerMonth(history)
  const trend = (monthly[monthly.length - 1]?.value ?? 0) - (monthly[monthly.length - 2]?.value ?? 0)
  const setsTotal = history.reduce((n, h) => n + (h.setsDone ?? 0), 0)

  return (
    <>
      {avg !== null && (
        <section className={styles.hero} aria-label="Genomsnittlig styrkeökning">
          <p className={styles.heroLabel}>GENOMSNITTLIG STYRKEÖKNING</p>
          <div className={styles.heroRow}>
            <span className={styles.heroValue}>{sign(avg)}{Math.round(avg)}%</span>
            <span className={styles.heroText}>sedan ditt första pass, över alla övningar med vikt</span>
          </div>
        </section>
      )}

      <div className={styles.tiles}>
        <div className={styles.tile}><StatChip value={history.length} label="pass totalt" /></div>
        <div className={styles.tile}><StatChip value={workoutsThisMonth(history)} label="denna månad" /></div>
        <div className={styles.tile}><StatChip value={weeksInRow(history)} label="veckor i rad" /></div>
        <div className={styles.tile}><StatChip value={setsTotal} label="set totalt" /></div>
        <div className={styles.tile}><StatChip value={formatTime(totalSeconds(history))} label="total tid" /></div>
        <div className={styles.tile}><StatChip value={Math.round(kgToDisplay(totalVolume(history)))} label={`${weightUnit()} totalt`} /></div>
      </div>

      <section className={styles.card} aria-labelledby="chart-t">
        <div className={styles.cardHead}>
          <h2 id="chart-t" className={styles.cardTitle}>Pass per månad</h2>
          <span className={styles.trend}>
            {trend > 0 && <Icon name="trendUp" size={14} />}
            {trend > 0 ? 'stigande' : trend === 0 ? 'jämn' : 'sjunkande'}
          </span>
        </div>
        <LineChart data={monthly} />
      </section>

      {latest && (
        <section className={styles.gold} aria-label="Senaste ökningen">
          <IconBadge icon="trophy" size={40} flat />
          <div>
            <p className={styles.goldTitle}>Senaste ökningen: {latest.name}</p>
            <p className={styles.goldText}>{comma(kgToDisplay(latest.from))} → {comma(kgToDisplay(latest.to))} {weightUnit()} ({sign(latest.to - latest.from)}{comma(kgToDisplay(latest.to) - kgToDisplay(latest.from))} {weightUnit()}) · {ago(latest.date)}</p>
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className={styles.section} aria-labelledby="more-t">
          <SectionHeader id="more-t" title="Fler ökningar" icon="trendUp" tone="accent" />
          <ul className={styles.list}>
            {more.map((m, i) => (
              <li key={`${m.exerciseId}-${m.date}-${i}`} className={styles.row}>
                <div>
                  <p className={styles.rowTitle}>{m.name}</p>
                  <p className={styles.rowMeta}>{ago(m.date)}</p>
                </div>
                <span className={styles.delta}>{sign(m.to - m.from)}{comma(kgToDisplay(m.to) - kgToDisplay(m.from))} {weightUnit()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby="recent-t">
        <SectionHeader id="recent-t" title="Senaste pass" icon="clock" tone="accent-2" />
        <SearchField value={query} onChange={setQuery} label="Sök bland loggade pass" placeholder="Sök pass eller övning..." />
        {recent.length === 0 && <p className={styles.empty}>{q ? `Inga loggade pass matchar ”${query}”.` : 'Inga pass i den här perioden.'}</p>}
        {recent.length > 0 && <ul className={styles.list}>
          {recent.map((h, i) => (
            <li key={`${h.completedAt}-${i}`} className={styles.row}>
              <div>
                <p className={styles.rowTitle}>{h.name}</p>
                <p className={styles.rowMeta}>
                  {when(h.completedAt)}
                  {h.durationSeconds !== undefined && ` · ${formatTime(h.durationSeconds)}`}
                  {h.setsDone !== undefined && ` · ${h.setsDone} set`}
                </p>
                {h.exercises && h.exercises.length > 0 && (
                  <ul className={styles.exList}>
                    {h.exercises.map((e) => (
                      <li key={e.exerciseId}><strong>{e.name}</strong> – {describeSets(e.sets)}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.rowSide}>
                {h.pbs && h.pbs.length > 0 && <span className={styles.pb}>PB</span>}
                <button type="button" className={styles.del} onClick={() => setDeleting(h.completedAt)} aria-label={`Ta bort ${h.name} den ${when(h.completedAt)}`}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>}
      </section>

      <BottomSheet open={!!deletingEntry} onClose={() => setDeleting(null)} title="Ta bort loggat pass?">
        <p className={styles.sub}>{deletingEntry ? `${deletingEntry.name} (${when(deletingEntry.completedAt)}) tas bort ur statistiken och personbästa räknas om. Det går inte att ångra.` : ''}</p>
        <Button variant="secondary" fullWidth onClick={() => { if (deleting) deleteHistoryEntry(deleting); setDeleting(null) }} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Ja, ta bort</Button>
        <Button variant="secondary" fullWidth onClick={() => setDeleting(null)}>Avbryt</Button>
      </BottomSheet>

      {bests.length > 0 && (
        <section className={styles.section} aria-labelledby="pb-t">
          <SectionHeader id="pb-t" title="Personbästa" icon="trendUp" tone="accent" />
          <p className={styles.sub}>Bästa set: högst distans eller vikt först, sedan längst tid eller flest reps. Värdena hör ihop i samma set.</p>
          <ul className={styles.list}>
            {bests.map((e) => (
              <li key={e.id} className={styles.row}>
                <p className={styles.rowTitle}>{e.name}</p>
                <p className={styles.rowMeta}>{describeValues(e.set && Object.keys(e.set).length > 0 ? e.set : e.best)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function PerExercise() {
  const { history, exerciseStats } = useWorkoutStore()
  const options = loggedExercises(history)
  const [name, setName] = useState(options[0]?.name ?? '')
  const chosen = options.find((o) => o.name === name) ?? options[0]
  const sum = chosen ? exerciseSummary(history, chosen.id) : null
  const stats = chosen ? exerciseStats[chosen.id] : undefined

  if (!chosen || !sum) return <p className={styles.empty}>Inga övningar loggade än.</p>
  const unit = unitLabel(metricUnit[sum.metric])
  const disp = (n: number) => toDisplay(metricUnit[sum.metric], n)
  const fmt = (n: number) => (sum.metric === 'seconds' ? formatTime(n) : `${comma(disp(n))} ${unit}`)

  return (
    <>
      <ExercisePicker label="Övning" value={chosen.name} options={options.map((o) => o.name)} onChange={setName} emptyText="Inga övningar loggade än." />

      <section className={styles.card} aria-labelledby="ex-chart">
        <div className={styles.cardHead}>
          <h2 id="ex-chart" className={styles.cardTitle}>Senaste 6 månaderna</h2>
          {sum.change !== null && (
            <span className={styles.trend}>
              {sum.change > 0 && <Icon name="trendUp" size={14} />}
              {sign(sum.change)}{Math.round(sum.change)}%
            </span>
          )}
        </div>
        <BarChart data={sum.monthly.map((d) => ({ ...d, value: disp(d.value) }))} label={`Bästa värde per månad (${unit})`} unit={` ${unit}`} />
      </section>

      <div className={styles.tiles3}>
        <div className={styles.tileC}><strong>{fmt(Math.max(sum.best, stats?.best[sum.metric] ?? 0))}</strong><span>PR</span></div>
        <div className={styles.tileC}><strong>{fmt(sum.average)}</strong><span>Snitt</span></div>
        <div className={styles.tileC}><strong>{sum.sessions} st</strong><span>Pass</span></div>
      </div>

      {stats?.lastPb && stats.bestSet && (
        <section className={styles.gold} aria-label="Personbästa">
          <IconBadge icon="trophy" size={40} flat />
          <div>
            <p className={styles.goldTitle}>Nytt personbästa!</p>
            <p className={styles.goldText}>{describeValues(stats.bestSet)} · {ago(stats.lastPb.date)}</p>
          </div>
        </section>
      )}
    </>
  )
}
