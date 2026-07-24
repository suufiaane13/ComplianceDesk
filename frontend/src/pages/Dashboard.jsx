import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { CheckCircleIcon, ClockIcon, AlertTriangleIcon, ChartBarIcon } from '../components/icons'
import PageShell from '../components/ui/PageShell'
import LoadingScreen from '../components/ui/LoadingScreen'
import StatusBadge from '../components/ui/StatusBadge'
import CreateObligationTrigger from '../components/CreateObligationTrigger'
import { formatDateFr } from '../utils/date'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = () => {
    setLoading(true)
    setError(null)
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch((err) => {
        setData(null)
        setError(err.response?.data?.message || 'Impossible de charger le tableau de bord.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) return <LoadingScreen />
  if (error || !data) {
    return (
      <PageShell>
        <div className="space-y-3 text-center">
          <p className="text-slate-500 dark:text-slate-400">{error || 'Erreur de chargement.'}</p>
          <button
            type="button"
            onClick={fetchDashboard}
            className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Réessayer
          </button>
        </div>
      </PageShell>
    )
  }

  const { total_obligations: total, a_jour, proches_echeance: aVenir, expirees: enRetard, prochaines_echeances: recent } = data
  const tauxConformite = total > 0 ? Math.round((a_jour / total) * 100) : 0

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tableau de bord</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Vue d'ensemble de vos obligations</p>
          </div>
          {isAdmin && <CreateObligationTrigger onClick={() => navigate('/obligations', { state: { openCreate: true } })} />}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="shrink-0">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Taux de conformité</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{a_jour} obligation{a_jour !== 1 ? 's' : ''} à jour sur {total}</p>
            </div>
            <div className="flex w-full min-w-0 items-center gap-3 sm:max-w-md sm:flex-1">
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-500 transition-all dark:from-teal-500 dark:to-teal-400" style={{ width: `${tauxConformite}%` }} />
              </div>
              <span className="shrink-0 text-2xl font-extrabold tabular-nums text-teal-800 dark:text-teal-400">{tauxConformite}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[
            { label: 'Total obligations', Icon: ChartBarIcon, iconWrap: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', valueColor: 'text-slate-900 dark:text-slate-100', value: total },
            { label: 'À jour', Icon: CheckCircleIcon, iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', valueColor: 'text-emerald-700 dark:text-emerald-400', value: a_jour },
            { label: 'Proches échéance', Icon: ClockIcon, iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', valueColor: 'text-amber-700 dark:text-amber-400', value: aVenir },
            { label: 'Expirées', Icon: AlertTriangleIcon, iconWrap: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', valueColor: 'text-red-700 dark:text-red-400', value: enRetard },
          ].map(({ label, Icon, iconWrap, valueColor, value }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-700">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-3xl font-extrabold tabular-nums ${valueColor}`}>{value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Obligations récentes</h2>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Prochaines échéances</p>
            </div>
          </div>
          <div className="p-5">
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Aucune obligation</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recent.map(ob => (
                  <button
                    key={ob.id}
                    type="button"
                    onClick={() => navigate(`/obligations/${ob.id}`)}
                    className="group flex w-full flex-col rounded-xl border border-slate-100 bg-white p-4 text-left transition hover:border-teal-200 hover:shadow-md hover:shadow-teal-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-teal-700 dark:hover:shadow-teal-900/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">{ob.intitule}</p>
                      <StatusBadge status={ob.statut} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatDateFr(ob.date_echeance)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
