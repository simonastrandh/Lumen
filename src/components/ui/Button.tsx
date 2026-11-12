import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = fylld turkos CTA, secondary = lila kontur, tonal = lila kontur med färgad bakgrund, ghost = liten neutral pill */
  variant?: 'primary' | 'secondary' | 'tonal' | 'ghost'
  fullWidth?: boolean
  /** Ikon framför texten (eller ensam i en ikonknapp) */
  icon?: IconName
}

export function Button({ variant = 'primary', fullWidth, icon, className, children, type = 'button', ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], fullWidth && styles.full, className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size={variant === 'ghost' ? 16 : 18} />}
      {children}
    </button>
  )
}
