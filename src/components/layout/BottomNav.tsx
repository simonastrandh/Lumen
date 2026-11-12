import { NavLink } from 'react-router-dom'
import { navItems } from '../../data/navigation'
import { Icon } from '../ui/Icon'
import styles from './BottomNav.module.css'

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Huvudnavigering">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          {({ isActive }) => (
            <>
              <Icon name={item.icon} size={24} glow={isActive} />
              <span className={styles.label}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
