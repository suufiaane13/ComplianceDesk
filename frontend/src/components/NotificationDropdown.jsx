import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { BellIcon, ClockIcon, AlertTriangleIcon, CheckCircleIcon, BuildingOfficeIcon } from './icons'

function notifHref(n, isSuperAdmin) {
  if (n.obligation_id) return `/obligations/${n.obligation_id}`
  if (isSuperAdmin && n.entreprise_id) return `/admin/entreprises/${n.entreprise_id}`
  if (isSuperAdmin) return '/admin/entreprises'
  return null
}

/**
 * Cloche = bouton d’action (dropdown + compteur), pas un item de nav.
 * Style « actif » uniquement sur /notifications (liste complète).
 * Après clic notif → /obligations/:id, c’est le lien nav « Obligations » qui est actif.
 */
export default function NotificationDropdown() {
  const { isSuperAdmin } = useAuth()
  const { error: toastError } = useToast()
  const { pathname } = useLocation()
  const isNotifPage = pathname === '/notifications' || pathname.startsWith('/notifications/')
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications', { params: { per_page: 20 } }),
        api.get('/notifications/unread-count'),
      ])
      const items = (notifRes.data.data || notifRes.data || [])
        .sort((a, b) => new Date(b.created_at || b.date_creation) - new Date(a.created_at || a.date_creation))
      setNotifications(items)
      setUnreadCount(countRes.data.unread_count ?? countRes.data.count ?? countRes.data ?? 0)
    } catch {}
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])
  useEffect(() => { fetchNotifications() }, [pathname, fetchNotifications])
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      toastError(err.response?.data?.message || 'Impossible de marquer la notification comme lue.')
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })))
      setUnreadCount(0)
    } catch (err) {
      toastError(err.response?.data?.message || 'Impossible de marquer toutes les notifications comme lues.')
    }
  }

  const getNotifIcon = (type) => {
    if (type === 'expiree' || type === 'en_retard' || type === 'entreprise_suspendue') {
      return <AlertTriangleIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
    }
    if (type === 'echeance_proche') {
      return <ClockIcon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
    }
    if (type === 'entreprise_creee' || type === 'entreprise_activee' || type === 'admin_ajoute') {
      return <BuildingOfficeIcon className="h-4 w-4 text-teal-500 dark:text-teal-400" />
    }
    return <CheckCircleIcon className="h-4 w-4 text-teal-500 dark:text-teal-400" />
  }

  const isUnread = (n) => !n.lue

  const triggerClass = isNotifPage
    ? 'relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-600 bg-teal-700 text-white shadow-md shadow-teal-900/20 transition dark:border-teal-500 dark:bg-teal-600 dark:shadow-teal-900/30'
    : 'relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-400'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} non lues)` : 'Notifications'}
        aria-current={isNotifPage ? 'page' : undefined}
        aria-expanded={open}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ${
              isNotifPage ? '' : 'ring-2 ring-white dark:ring-slate-900'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,24rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
                >
                  Tout lire
                </button>
              )}
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="inline-flex items-center rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
              >
                Voir tout
              </Link>
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <BellIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map(n => {
                const href = notifHref(n, isSuperAdmin)
                const unread = isUnread(n)
                return (
                  <Link
                    key={n.id}
                    to={href || '/notifications'}
                    onClick={() => {
                      setOpen(false)
                      if (unread) markAsRead(n.id)
                    }}
                    className={`flex cursor-pointer items-start gap-3 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${unread ? 'bg-teal-50/40 dark:bg-teal-900/20' : ''}`}
                  >
                    <span className="mt-0.5 shrink-0">{getNotifIcon(n.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${unread ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.message || 'Notification'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {new Date(n.created_at || n.date_creation).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
