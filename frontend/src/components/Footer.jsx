import { NavLink } from 'react-router-dom'
import { useAuth, homePathForUser } from '../context/AuthContext'
import Logo, { logoHoverClassName } from './Logo'
import { ShieldCheckIcon } from './icons'
import { getNavItems } from '../utils/nav'

export default function Footer({ className = '' }) {
  const { user } = useAuth()
  const home = homePathForUser(user)
  const navLinks = getNavItems(user)

  return (
    <footer className={`relative overflow-hidden border-t border-teal-900/30 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-teal-50 dark:from-teal-950 dark:via-teal-900 dark:to-slate-950 dark:border-slate-700/50 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-teal-400 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-emerald-300 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <NavLink to={home} end className="group relative inline-flex shrink-0 rounded-xl">
              <Logo variant="footer" className={`relative h-11 w-11 ${logoHoverClassName}`} />
            </NavLink>
            <div>
              <p className="text-sm font-extrabold text-white sm:text-base">ComplianceDesk Maroc</p>
              <p className="text-xs text-teal-100/80">Conformité réglementaire PME</p>
            </div>
          </div>
          <nav className="mt-5 hidden items-center gap-1 sm:mt-0 sm:flex">
            {navLinks.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white/15 text-white ring-1 ring-white/20' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-4 w-4 shrink-0" />{label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-white/10 pt-5 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm leading-snug text-white">
              <span className="text-white/70">©</span>{' '}
              <time dateTime="2026" className="font-semibold tabular-nums">2026</time>{' '}
              <span className="font-extrabold tracking-tight">ComplianceDesk</span>{' '}
              <span className="font-medium text-teal-100">Maroc</span>
            </p>
            <p className="mt-1 text-[11px] font-medium tracking-wide text-teal-100/65">Tous droits réservés</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur">
            <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            Conformité réglementaire · PME Maroc
          </span>
        </div>
      </div>
    </footer>
  )
}
