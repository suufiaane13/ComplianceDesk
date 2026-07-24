import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageShell from '../components/ui/PageShell'
import Button from '../components/ui/Button'
import { Pagination, ViewToggle } from '../components/ui/DataTable'
import {
  BellIcon,
  CheckCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  AlertTriangleIcon,
  ClockIcon,
  SearchIcon,
} from '../components/icons'

const FILTERS = [
  { value: '', label: 'Toutes', Icon: BellIcon },
  { value: 'unread', label: 'Non lues', Icon: AlertTriangleIcon },
  { value: 'read', label: 'Lues', Icon: CheckCircleIcon },
]

function notifHref(n, isSuperAdmin) {
  if (n.obligation_id) return `/obligations/${n.obligation_id}`
  if (isSuperAdmin && n.entreprise_id) return `/admin/entreprises/${n.entreprise_id}`
  return null
}

function typeLabel(type) {
  const map = {
    echeance_proche: 'Échéance proche',
    expiree: 'Expirée',
    document_ajoute: 'Document ajouté',
    document_supprime: 'Document supprimé',
    entreprise_creee: 'Entreprise créée',
    entreprise_suspendue: 'Entreprise suspendue',
    entreprise_activee: 'Entreprise activée',
    admin_ajoute: 'Administrateur ajouté',
  }
  return map[type] || 'Notification'
}

function NotifIcon({ type, unread }) {
  const wrap = unread
    ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400'
    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
  let Icon = BellIcon
  if (type === 'expiree' || type === 'entreprise_suspendue') Icon = AlertTriangleIcon
  else if (type === 'echeance_proche') Icon = ClockIcon
  else if (type === 'entreprise_creee' || type === 'entreprise_activee' || type === 'admin_ajoute') Icon = BuildingOfficeIcon
  else if (!unread) Icon = CheckCircleIcon

  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${wrap}`}>
      <Icon className="h-4 w-4" />
    </span>
  )
}

function formatNotifDate(n) {
  return new Date(n.created_at || n.date_creation).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function unreadSummary(unreadCount) {
  if (unreadCount <= 0) return 'Toutes lues'
  const plural = unreadCount > 1 ? 's' : ''
  return `${unreadCount} non lue${plural}`
}

function FilterChip({ filter, active, onSelect }) {
  const Icon = filter.Icon
  return (
    <button
      type="button"
      onClick={() => onSelect(filter.value)}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
        active
          ? 'bg-teal-700 text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/20 dark:bg-teal-600 dark:shadow-teal-900/30'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:bg-teal-900/20 dark:hover:text-teal-400'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'}`} />
      {filter.label}
    </button>
  )
}

function NotificationMobileCard({ n, href, onMarkRead, onNavigate }) {
  const unread = !n.lue
  return (
    <div className={`flex items-start gap-3 px-1 py-3 ${unread ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}>
      <NotifIcon type={n.type} unread={unread} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.message || 'Notification'}</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatNotifDate(n)}</p>
        <div className="mt-2 flex items-center gap-2">
          {unread && (
            <button
              type="button"
              onClick={() => onMarkRead(n.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
            >
              <CheckCheckIcon className="h-3 w-3" />
              Lu
            </button>
          )}
          {href && (
            <Link
              to={href}
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
            >
              Voir <ArrowRightIcon className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Notifications() {
  const { isSuperAdmin } = useAuth()
  const { error: toastError } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewFilter, setViewFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications', { params: { per_page: 100 } })
      setNotifications(res.data.data || res.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n))
    } catch (err) {
      toastError(err.response?.data?.message || 'Impossible de marquer la notification comme lue.')
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })))
    } catch (err) {
      toastError(err.response?.data?.message || 'Impossible de marquer toutes les notifications comme lues.')
    }
  }

  const unreadCount = notifications.filter(n => !n.lue).length

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (viewFilter === 'unread' && n.lue) return false
      if (viewFilter === 'read' && !n.lue) return false
      const q = searchFilter.toLowerCase().trim()
      if (q) {
        const msg = (n.message || '').toLowerCase()
        const ent = (n.entreprise?.raison_sociale || '').toLowerCase()
        const typ = typeLabel(n.type).toLowerCase()
        if (!msg.includes(q) && !ent.includes(q) && !typ.includes(q)) return false
      }
      return true
    })
  }, [notifications, viewFilter, searchFilter])

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const safeCurrent = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safeCurrent - 1) * itemsPerPage, safeCurrent * itemsPerPage)
  const isFiltered = Boolean(viewFilter) || Boolean(searchFilter)

  if (loading) return <LoadingScreen />

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {unreadSummary(unreadCount)}
              {' · '}
              {totalItems} affichée{totalItems !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <section aria-label="Filtrer les notifications" className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-700/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-900/20 dark:bg-teal-600">
                <BellIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Filtrer les notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Par statut de lecture ou recherche</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:justify-end">
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => { setViewFilter(''); setSearchFilter(''); setCurrentPage(1) }}
                  className="text-sm font-semibold text-teal-700 transition hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  Réinitialiser
                </button>
              )}
              <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <span className="tabular-nums text-slate-900 dark:text-slate-200">{totalItems}</span> résultat{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={searchFilter}
                onChange={(e) => { setSearchFilter(e.target.value); setCurrentPage(1) }}
                placeholder="Rechercher une notification…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <FilterChip
                  key={filter.value || 'all'}
                  filter={filter}
                  active={viewFilter === filter.value}
                  onSelect={(v) => { setViewFilter(v); setCurrentPage(1) }}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-700/50 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Toutes les notifications</h2>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {totalItems} notification{totalItems !== 1 ? 's' : ''} au total
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllRead}>
                  <CheckCheckIcon className="h-4 w-4" /> Tout marquer lu
                </Button>
              )}
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
          </div>

          <div className="px-5 py-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <BellIcon className="h-8 w-8" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Aucune notification trouvée</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aucune notification ne correspond à vos filtres.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700/50">
                            <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Message</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Type</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Date</th>
                            <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Statut</th>
                            <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {paginated.map((n) => {
                            const href = notifHref(n, isSuperAdmin)
                            const unread = !n.lue
                            return (
                              <tr
                                key={n.id}
                                className={`group transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50 ${unread ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}
                              >
                                <td className="px-6 py-3.5">
                                  <div className="flex items-start gap-3">
                                    <NotifIcon type={n.type} unread={unread} />
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.message || 'Notification'}</p>
                                      {n.entreprise?.raison_sociale && (
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.entreprise.raison_sociale}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                                  {typeLabel(n.type)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                  {formatNotifDate(n)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-3.5">
                                  {unread ? (
                                    <span className="inline-flex whitespace-nowrap items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-400/20">
                                      Non lue
                                    </span>
                                  ) : (
                                    <span className="inline-flex whitespace-nowrap items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                                      Lue
                                    </span>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-3.5 text-right">
                                  <div className="inline-flex items-center justify-end gap-1.5">
                                    {unread && (
                                      <button
                                        type="button"
                                        onClick={() => markAsRead(n.id)}
                                        title="Marquer comme lue"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
                                      >
                                        <CheckCheckIcon className="h-3.5 w-3.5" />
                                        Lu
                                      </button>
                                    )}
                                    {href && (
                                      <Link
                                        to={href}
                                        onClick={() => { if (unread) markAsRead(n.id) }}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
                                      >
                                        Voir <ArrowRightIcon className="h-3.5 w-3.5" />
                                      </Link>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {paginated.map((n) => {
                        const href = notifHref(n, isSuperAdmin)
                        const unread = !n.lue
                        const CardInner = (
                          <div className={`group flex h-full flex-col rounded-xl border p-4 transition hover:shadow-md ${
                            unread
                              ? 'border-teal-100 bg-teal-50/40 hover:border-teal-200 hover:shadow-teal-50 dark:border-teal-800/50 dark:bg-teal-900/20 dark:hover:border-teal-700 dark:hover:shadow-teal-900/20'
                              : 'border-slate-100 bg-white hover:border-teal-200 hover:shadow-teal-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-teal-700 dark:hover:shadow-teal-900/20'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <NotifIcon type={n.type} unread={unread} />
                              {unread ? (
                                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">Non lue</span>
                              ) : (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Lue</span>
                              )}
                            </div>
                            <p className="mt-3 line-clamp-3 text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">{n.message || 'Notification'}</p>
                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{typeLabel(n.type)}</p>
                            <p className="mt-auto pt-3 text-xs text-slate-500 dark:text-slate-400">{formatNotifDate(n)}</p>
                            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/50">
                              {unread && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(n.id) }}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
                                >
                                  <CheckCheckIcon className="h-3 w-3" />
                                  Lu
                                </button>
                              )}
                              {href && (
                                <span className="ml-auto inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                  Voir <ArrowRightIcon className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        )
                        return href ? (
                          <Link key={n.id} to={href} onClick={() => { if (unread) markAsRead(n.id) }} className="block">
                            {CardInner}
                          </Link>
                        ) : (
                          <div key={n.id}>{CardInner}</div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
                  {paginated.map((n) => {
                    const href = notifHref(n, isSuperAdmin)
                    return (
                      <NotificationMobileCard
                        key={n.id}
                        n={n}
                        href={href}
                        onMarkRead={markAsRead}
                        onNavigate={() => { if (!n.lue) markAsRead(n.id) }}
                      />
                    )
                  })}
                </div>

                <Pagination
                  page={safeCurrent}
                  lastPage={totalPages}
                  total={totalItems}
                  from={(safeCurrent - 1) * itemsPerPage + 1}
                  to={Math.min(safeCurrent * itemsPerPage, totalItems)}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
