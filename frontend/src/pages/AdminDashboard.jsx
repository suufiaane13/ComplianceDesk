import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  UserIcon,
  ChartBarIcon,
} from '../components/icons'
import PageShell from '../components/ui/PageShell'
import LoadingScreen from '../components/ui/LoadingScreen'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = () => {
    setLoading(true)
    setError(null)
    api.get('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        setData(null)
        setError(err.response?.data?.message || 'Impossible de charger le tableau de bord.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDashboard() }, [])

  if (!isSuperAdmin) return <Navigate to="/login" replace />
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

  const cards = [
    {
      label: 'Entreprises',
      Icon: BuildingOfficeIcon,
      iconWrap: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      valueColor: 'text-slate-900 dark:text-slate-100',
      value: data.entreprises_total,
    },
    {
      label: 'Actives',
      Icon: CheckCircleIcon,
      iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      valueColor: 'text-emerald-700 dark:text-emerald-400',
      value: data.entreprises_actives,
    },
    {
      label: 'Utilisateurs',
      Icon: UserIcon,
      iconWrap: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
      valueColor: 'text-sky-700 dark:text-sky-400',
      value: data.users_total,
    },
    {
      label: 'Obligations',
      Icon: ChartBarIcon,
      iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      valueColor: 'text-amber-700 dark:text-amber-400',
      value: data.obligations_total,
    },
  ]

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tableau de bord</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Vue d'ensemble de la plateforme</p>
          </div>
          <Button onClick={() => navigate('/admin/entreprises')}>
            <BuildingOfficeIcon className="h-4 w-4" /> Gérer les entreprises
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="shrink-0">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Entreprises actives</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {data.entreprises_actives} active{data.entreprises_actives !== 1 ? 's' : ''} sur {data.entreprises_total}
                {data.entreprises_suspendues > 0 && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    · {data.entreprises_suspendues} suspendue{data.entreprises_suspendues !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
            <div className="flex w-full min-w-0 items-center gap-3 sm:max-w-md sm:flex-1">
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-500 transition-all dark:from-teal-500 dark:to-teal-400"
                  style={{
                    width: `${data.entreprises_total > 0 ? Math.round((data.entreprises_actives / data.entreprises_total) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="shrink-0 text-2xl font-extrabold tabular-nums text-teal-800 dark:text-teal-400">
                {data.entreprises_total > 0 ? Math.round((data.entreprises_actives / data.entreprises_total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {cards.map(({ label, Icon, iconWrap, valueColor, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-700"
            >
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
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Entreprises récentes</h2>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Dernières créées sur la plateforme</p>
            </div>
            <Link to="/admin/entreprises" className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data.recent_entreprises || []).length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">Aucune entreprise</p>
            ) : (
              data.recent_entreprises.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => navigate(`/admin/entreprises/${e.id}`)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{e.raison_sociale}</p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {e.users_count ?? 0} utilisateur{(e.users_count ?? 0) !== 1 ? 's' : ''} · {e.obligations_count ?? 0} obligation{(e.obligations_count ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {e.statut === 'active'
                    ? <Badge tone="success">Activée</Badge>
                    : <Badge tone="danger">Suspendue</Badge>}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
