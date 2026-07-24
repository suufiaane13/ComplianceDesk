import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoutIcon, UserIcon, BuildingOfficeIcon, ChevronDownIcon } from './icons'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [open])

  if (!user) return null

  const initials = `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase()
  const profileActive = pathname.startsWith('/profile')
  const entrepriseActive = pathname.startsWith('/entreprise')
  const menuActive = profileActive || entrepriseActive

  const triggerClass = open || menuActive
    ? 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-600 bg-teal-700 text-xs font-bold text-white shadow-md shadow-teal-900/20 transition dark:border-teal-500 dark:bg-teal-600'
    : 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-400'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menu utilisateur"
        className={triggerClass}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/5">
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-xs font-bold text-white shadow-sm dark:bg-teal-600">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{user.prenom} {user.nom}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5 p-1.5">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                profileActive
                  ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                profileActive
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-teal-900/40 dark:group-hover:text-teal-300'
              }`}>
                <UserIcon className="h-3.5 w-3.5" />
              </span>
              Mon profil
              <ChevronDownIcon className="ml-auto h-3.5 w-3.5 -rotate-90 text-slate-300 dark:text-slate-600" />
            </Link>

            {user.role !== 'super_admin' && (
              <Link
                to="/entreprise"
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  entrepriseActive
                    ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  entrepriseActive
                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-teal-900/40 dark:group-hover:text-teal-300'
                }`}>
                  <BuildingOfficeIcon className="h-3.5 w-3.5" />
                </span>
                Mon entreprise
                <ChevronDownIcon className="ml-auto h-3.5 w-3.5 -rotate-90 text-slate-300 dark:text-slate-600" />
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 p-1.5 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => { setOpen(false); logout() }}
              className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:group-hover:bg-red-900/50">
                <LogoutIcon className="h-3.5 w-3.5" />
              </span>
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
