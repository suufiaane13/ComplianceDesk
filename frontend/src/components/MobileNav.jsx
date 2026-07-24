import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BarsIcon, LogoutIcon, XMarkIcon, ShieldCheckIcon } from './icons'
import Logo, { logoHoverClassName } from './Logo'
import Button from './ui/Button'
import ThemeToggle from './ThemeToggle'
import { getNavItems } from '../utils/nav'

function MobileNavItem({ to, label, Icon, end, onNavigate }) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate}
      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20 dark:bg-teal-600' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal-400'}`}>
      {({ isActive }) => (
        <>
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-white/15 text-white' : 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'}`}>
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </>
      )}
    </NavLink>
  )
}

export function MobileMenuButton({ onClick, open = false }) {
  return (
    <button type="button" onClick={onClick} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-300 md:hidden">
      {open ? <XMarkIcon className="h-5 w-5" /> : <BarsIcon className="h-5 w-5" />}
    </button>
  )
}

export default function MobileNav({ open, onClose }) {
  const { logout, user } = useAuth()
  const navItems = getNavItems(user)
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    if (open) {
      if (!dialog.open) dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (dialog.open) {
      dialog.close()
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (typeof document === 'undefined') return null

  return (
    <dialog
      ref={dialogRef}
      aria-label="Menu de navigation"
      className="fixed inset-0 z-50 m-0 h-[100dvh] max-h-none w-screen max-w-none border-0 bg-transparent p-0 md:hidden open:block [&::backdrop]:bg-slate-900/55 [&::backdrop]:backdrop-blur-md dark:[&::backdrop]:bg-black/70"
      onCancel={(event) => {
        event.preventDefault()
        onCloseRef.current?.()
      }}
    >
      <button
        type="button"
        aria-label="Fermer le menu"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
        onClick={() => onCloseRef.current?.()}
      />
      <aside className="absolute inset-y-0 right-0 z-10 flex w-[min(100vw-2.5rem,19.5rem)] flex-col overflow-hidden border-l border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
        <div className="border-b border-slate-100 bg-white px-5 pb-5 pt-5 dark:border-slate-700/50 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="group relative inline-flex shrink-0 rounded-xl"><Logo className={`relative h-11 w-11 ${logoHoverClassName}`} /></span>
              <div>
                <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">ComplianceDesk</p>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">Maroc · Conformité PME</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {user?.prenom && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-sm font-extrabold text-white dark:bg-teal-600">
                {user.prenom.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{user.prenom} {user.nom}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Apparence</span>
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto bg-white px-4 py-4 dark:bg-slate-900">
          <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Navigation</p>
          {navItems.map((item) => <MobileNavItem key={item.to} {...item} onNavigate={onClose} />)}
        </nav>
        <div className="border-t border-slate-100 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-900">
          <span className="mb-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-600/10 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-400/20">
            <ShieldCheckIcon className="h-3.5 w-3.5" />Conformité réglementaire · PME Maroc
          </span>
          <Button variant="secondary" className="w-full" onClick={() => { onClose(); logout() }}>
            <LogoutIcon className="h-4 w-4" />Déconnexion
          </Button>
        </div>
      </aside>
    </dialog>
  )
}
