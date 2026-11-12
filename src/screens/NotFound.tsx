import { Link } from 'react-router-dom'

/** Visas när adressen inte finns. */
export default function NotFound() {
  return (
    <div>
      <h1 style={{ fontSize: 24 }}>Sidan finns inte</h1>
      <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
        Adressen du försökte öppna finns inte i appen. <Link to="/" style={{ color: 'var(--accent)' }}>Till Hem</Link>
      </p>
    </div>
  )
}
