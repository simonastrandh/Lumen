import { getDailyMotivation, getTimeGreeting, type Motivation } from '../../data/motivation'
import styles from './Greeting.module.css'

interface GreetingProps {
  name?: string
  /** Går att styra i t.ex. tester; standard är nu */
  now?: Date
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function MotivationText({ text, highlight }: Motivation) {
  const i = highlight ? text.indexOf(highlight) : -1
  if (!highlight || i === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <span className={styles.highlight}>{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  )
}

/** Hälsning högst upp på Hem: datum, hälsning med namn och ett motiverande citat för dagen. */
export function Greeting({ name, now = new Date() }: GreetingProps) {
  const greeting = getTimeGreeting(now)
  const motivation = getDailyMotivation(now)

  return (
    <div className={styles.greeting}>
      <p className={styles.date}>{formatDate(now)}</p>
      <h1 className={styles.title}>
        {greeting}
        {name ? (
          <>
            , <span className={styles.name}>{name}</span>
          </>
        ) : (
          '!'
        )}
      </h1>
      <p className={styles.motivation}>
        <MotivationText {...motivation} />
      </p>
    </div>
  )
}
