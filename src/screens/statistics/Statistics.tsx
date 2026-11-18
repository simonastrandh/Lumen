import { useFitScale } from '../../hooks/useFitScale'
import { kgToDisplay, toDisplay, unitLabel, weightUnit } from '../../data/units'
import { useState } from 'react'
import { BarChart } from '../../components/ui/BarChart'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Tag } from '../../components/ui/Tag'
import { Icon } from '../../components/ui/Icon'
import { showFor } from '../../components/pickers/MeasureFields'
import { SearchField } from '../../components/ui/SearchField'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { formatTime } from '../../components/pickers/TimeField'
import {
  ago,
  averageStrengthIncrease,
  exerciseSummary,
  loggedExercises,
  metricUnit,
  strengthIncreases,
  totalVolume,
  weeksInRow,
  workoutsPerMonth,
  workoutsThisMonth,
} from '../../data/stats'
import { useWorkoutStore, type CompletedWorkout } from '../../store/WorkoutStore'
import { ExercisePicker } from '../../components/pickers/ExercisePicker'
import { describeSets, describeValues } from '../workouts/labels'
import styles from './Statistics.module.css'

type Tab = 'overview' | 'exercise'
type Range = '4v' | '3m' | 'ar' | 'allt'
const rangeDays: Record<Range, number> = { '4v': 28, '3m': 92, ar: 365, allt: Infinity }
const rangeText: Record<Range, string> = { '4v': 'Pass de senaste 4 veckorna', '3m': 'Pass de senaste 3 månaderna', ar: 'Pass det senaste året', allt: 'Pass totalt' }
const norm = (t: string) => t.toLocaleLowerCase('sv-SE').trim()

const when = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
const comma = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',')
const sign = (n: number) => (n > 0 ? '+' : '')

/** Statistik över avslutade pass. Varje pass som avslutas i Aktivt pass loggas här. */
export default function Statistics() {
  const { history } = useWorkoutStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [range, setRange] = useState<Range>('allt')
  const cutoff = Date.now() - rangeDays[range] * 24 * 3600 * 1000
  const fitRef = useFitScale<HTMLDivElement>(`${history.length}-${tab}-${range}`)
  const inRange = history.filter((h) => new Date(h.completedAt).getTime() >= cutoff)

  return (
    <>
      <h1 className={styles.top}>Statistik</h1>

      {history.length > 0 && tab === 'overview' && (
        <section className={styles.big} aria-label="Pass totalt">
          <div ref={fitRef} className={styles.bigValue}>
            <span className={styles.bigNumber}>{inRange.length}</span>
            <span className={styles.bigUnit}>PASS</span>
          </div>
          <p className={styles.bigSub}>{rangeText[range]}</p>
        </section>
      )}

      <div className={styles.controls}>
        <SegmentedControl<Tab>
          label="Visa statistik"
          value={tab}
          onChange={setTab}
          options={[{ value: 'overview', label: 'Översikt' }, { value: 'exercise', label: 'Per övning' }]}
        />
        {tab === 'overview' && history.length > 0 && (
          <div className={styles.chips} role="group" aria-label="Tidsperiod">
            {([['4v', '4 v'], ['3m', '3 mån'], ['ar', 'År'], ['allt', 'Allt']] as [Range, string][]).map(([value, label]) => (
              <button key={value} type="button" className={styles.chip} aria-pressed={range === value} onClick={() => setRange(value)}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

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

/** Antal loggade pass som visas åt gången i Senaste pass */
const RECENT_PAGE = 5

function Overview({ history }: { history: CompletedWorkout[] }) {
  const { exerciseStats, deleteHistoryEntry, getExercise } = useWorkoutStore()
  const [query, setQuery] = useState('')
  /** Så många loggade pass visas; "Visa mer" lägger till fler */
  const [shown, setShown] = useState(RECENT_PAGE)
  const [deleting, setDeleting] = useState<string | null>(null)
  const deletingEntry = history.find((h) => h.completedAt === deleting)
  const q = norm(query)
  const matches = [...history].reverse().filter((h) => !q || norm(h.name).includes(q) || (h.exercises ?? []).some((e) => norm(e.name).includes(q)))
  const recent = matches.slice(0, shown)
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

  return (
    <>
      <div className={styles.tiles}>
        <div className={styles.tile}><strong>{workoutsThisMonth(history)}</strong><span>Denna månad</span></div>
        <div className={styles.tile}><strong>{weeksInRow(history)}</strong><span>Veckor i rad</span></div>
        <div className={styles.tile}><strong>{Math.round(kgToDisplay(totalVolume(history)))}</strong><span>{weightUnit()} totalt</span></div>
      </div>

      <section className={styles.card} aria-labelledby="chart-t">
        <div className={styles.cardHead}>
          <h2 id="chart-t" className={styles.cardTitle}>Pass per månad</h2>
          <span className={styles.trend}>
            {trend > 0 && <Icon name="trendUp" size={16} />}
            {trend > 0 ? 'stigande' : trend === 0 ? 'jämn' : 'sjunkande'}
          </span>
        </div>
        <BarChart data={monthly} label="Pass per månad" />
      </section>

      <section className={styles.section} aria-labelledby="recent-t">
        <h2 id="recent-t" className={styles.heading}>Senaste pass</h2>
        <SearchField value={query} onChange={(v) => { setQuery(v); setShown(RECENT_PAGE) }} label="Sök bland loggade pass" placeholder="Sök pass eller övning..." />
        {recent.length === 0 && <p className={styles.empty}>{q ? `Inga loggade pass matchar ”${query}”.` : 'Inga pass i den här perioden.'}</p>}
        {recent.length > 0 && <ul className={styles.list}>
          {recent.map((h, i) => (
            <li key={`${h.completedAt}-${i}`} className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>
                  {h.name}
                  {h.pbs && h.pbs.length > 0 && <Tag tone="highlight">PB</Tag>}
                </p>
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
              <button type="button" className={styles.del} onClick={() => setDeleting(h.completedAt)} aria-label={`Ta bort ${h.name} den ${when(h.completedAt)}`}>
                <Icon name="trash" size={16} />
              </button>
            </li>
          ))}
        </ul>}
        {matches.length > shown && (
          <Button variant="secondary" fullWidth onClick={() => setShown((n) => n + RECENT_PAGE)}>
            Visa mer ({matches.length - shown} till)
          </Button>
        )}
      </section>

      {bests.length > 0 && (
        <section className={styles.section} aria-labelledby="pb-t">
          <h2 id="pb-t" className={styles.heading}>Personbästa</h2>
          <p className={styles.sub}>Bästa set: högst distans eller vikt först, sedan längst tid eller flest reps. Värdena hör ihop i samma set.</p>
          <ul className={styles.list}>
            {bests.map((e) => (
              <li key={e.id} className={styles.row}>
                <p className={styles.rowTitle}>{e.name}</p>
                <p className={styles.rowValue}>{describeValues(e.set && Object.keys(e.set).length > 0 ? e.set : e.best)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(avg !== null || latest || more.length > 0) && (
        <section className={styles.section} aria-labelledby="inc-t">
          <h2 id="inc-t" className={styles.heading}>Styrkeökning</h2>
          <ul className={styles.list}>
            {avg !== null && (
              <li className={styles.row}>
                <p className={styles.rowTitle}>Genomsnitt sedan första passet</p>
                <p className={styles.delta}>{sign(avg)}{Math.round(avg)} %</p>
              </li>
            )}
            {[...(latest ? [latest] : []), ...more].map((m, i) => (
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

      <BottomSheet open={!!deletingEntry} onClose={() => setDeleting(null)} title="Ta bort loggat pass?">
        <p className={styles.sub}>{deletingEntry ? `${deletingEntry.name} (${when(deletingEntry.completedAt)}) tas bort ur statistiken och personbästa räknas om. Det går inte att ångra.` : ''}</p>
        <Button variant="secondary" fullWidth onClick={() => { if (deleting) deleteHistoryEntry(deleting); setDeleting(null) }} className={styles.dangerBtn}>Ja, ta bort</Button>
        <Button variant="secondary" fullWidth onClick={() => setDeleting(null)}>Avbryt</Button>
      </BottomSheet>
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
  const best = Math.max(sum.best, stats?.best[sum.metric] ?? 0)
  const fitRef2 = useFitScale<HTMLDivElement>(`${best}-${unit}-${sum.metric}`)

  return (
    <>
      <div className={styles.picker}>
        <ExercisePicker label="Övning" value={chosen.name} options={options.map((o) => o.name)} onChange={setName} emptyText="Inga övningar loggade än." />
      </div>

      <section className={styles.big} aria-label="Personbästa">
        <p className={styles.bigLabel}>
          Personbästa
          {stats?.lastPb && <Tag tone="highlight">Nytt</Tag>}
        </p>
        <div ref={fitRef2} className={styles.bigValue}>
          <span className={styles.bigNumber}>{sum.metric === 'seconds' ? formatTime(best) : comma(disp(best))}</span>
          {sum.metric !== 'seconds' && <span className={styles.bigUnit}>{unit}</span>}
        </div>
        {stats?.lastPb && <p className={styles.bigSub}>{ago(stats.lastPb.date)}</p>}
      </section>

      <div className={styles.tiles}>
        <div className={styles.tile}><strong>{fmt(best)}</strong><span>PR</span></div>
        <div className={styles.tile}><strong>{fmt(sum.average)}</strong><span>Snitt</span></div>
        <div className={styles.tile}><strong>{sum.sessions} st</strong><span>Pass</span></div>
      </div>

      <section className={styles.card} aria-labelledby="ex-chart">
        <div className={styles.cardHead}>
          <h2 id="ex-chart" className={styles.cardTitle}>Senaste 6 månaderna</h2>
          {sum.change !== null && (
            <span className={styles.trend}>
              {sum.change > 0 && <Icon name="trendUp" size={16} />}
              {sign(sum.change)}{Math.round(sum.change)} %
            </span>
          )}
        </div>
        <BarChart data={sum.monthly.map((d) => ({ ...d, value: disp(d.value) }))} label={`Bästa värde per månad (${unit})`} unit={` ${unit}`} />
      </section>

      {stats?.bestSet && (
        <p className={styles.sub}>Bästa set: {describeValues(stats.bestSet)}</p>
      )}
    </>
  )
}
