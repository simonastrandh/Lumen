import type { IconName } from '../components/ui/Icon'

export interface NavItem {
  to: string
  label: string
  icon: IconName
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Hem', icon: 'home' },
  { to: '/pass', label: 'Pass', icon: 'workout' },
  { to: '/statistik', label: 'Statistik', icon: 'stats' },
  { to: '/installningar', label: 'Inställningar', icon: 'settings' },
]
