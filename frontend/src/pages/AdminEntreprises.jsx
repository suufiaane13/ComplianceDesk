import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageShell from '../components/ui/PageShell'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { ConfirmModal } from '../components/ui/Modal'
import { ViewToggle } from '../components/ui/DataTable'
import EntrepriseModal from '../components/EntrepriseModal'
import SearchFilterBar from '../components/SearchFilterBar'
import {
  BuildingOfficeIcon,
  PlusIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  EyeIcon,
  UserIcon,
  ClipboardIcon,
} from '../components/icons'

function companyInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'E'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function StatusBadge({ statut }) {
  if (statut === 'active') return <Badge tone="success">Activée</Badge>
  return <Badge tone="danger">Suspendue</Badge>
}

function StatutActionButton({ entreprise, onToggle, iconClass = 'h-4 w-4' }) {
  const isActive = entreprise.statut === 'active'
  return (
    <button
      type="button"
      title={isActive ? 'Suspendre' : 'Activer'}
      onClick={() => onToggle(entreprise)}
      className={`rounded-lg p-1.5 text-slate-400 transition dark:text-slate-500 ${
        isActive
          ? 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400'
          : 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
      }`}
    >
      {isActive
        ? <AlertTriangleIcon className={iconClass} />
        : <CheckCircleIcon className={iconClass} />}
    </button>
  )
}

function EntrepriseTableRow({ entreprise, onNavigate, onOpenUsers, onToggleStatut }) {
  const e = entreprise
  return (
    <tr className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/70">
      <td className="whitespace-nowrap px-6 py-3.5">
        <button
          type="button"
          onClick={() => onNavigate(e.id)}
          className="flex w-full items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-xs font-extrabold text-white shadow-sm shadow-teal-200/50 dark:shadow-teal-900/40">
            {companyInitials(e.raison_sociale)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{e.raison_sociale}</p>
            {e.secteur_activite && (
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{e.secteur_activite}</p>
            )}
          </div>
        </button>
      </td>
      <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">{e.email || '—'}</td>
      <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">{e.users_count ?? 0}</td>
      <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">{e.obligations_count ?? 0}</td>
      <td className="px-6 py-3.5">
        <StatusBadge statut={e.statut} />
      </td>
      <td className="px-6 py-3.5 text-right">
        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            title="Voir la fiche"
            onClick={() => onNavigate(e.id)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Voir les utilisateurs"
            onClick={() => onOpenUsers(e.id)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-teal-50 hover:text-teal-700 dark:text-slate-500 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
          >
            <UserIcon className="h-4 w-4" />
          </button>
          <StatutActionButton entreprise={e} onToggle={onToggleStatut} />
        </div>
      </td>
    </tr>
  )
}

function EntrepriseCard({ entreprise, onNavigate, onOpenUsers, onToggleStatut }) {
  const e = entreprise
  const users = e.users_count ?? 0
  const obligations = e.obligations_count ?? 0
  return (
    <div className="group relative w-full rounded-xl border border-slate-100 bg-white p-4 text-left transition hover:border-teal-200 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-teal-700 dark:hover:bg-slate-800">
      <button
        type="button"
        onClick={() => onNavigate(e.id)}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-sm font-extrabold text-white shadow-sm shadow-teal-200/50 dark:shadow-teal-900/40">
          {companyInitials(e.raison_sociale)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{e.raison_sociale}</p>
            <StatusBadge statut={e.statut} />
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{e.email || '—'}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {users} utilisateur{users !== 1 ? 's' : ''} · {obligations} obligation{obligations !== 1 ? 's' : ''}
          </p>
        </div>
      </button>
      <div className="mt-3 flex justify-end gap-0.5">
        <button
          type="button"
          title="Voir la fiche"
          onClick={() => onNavigate(e.id)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <EyeIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Voir les utilisateurs"
          onClick={() => onOpenUsers(e.id)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-teal-50 hover:text-teal-700 dark:text-slate-500 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
        >
          <UserIcon className="h-3.5 w-3.5" />
        </button>
        <StatutActionButton entreprise={e} onToggle={onToggleStatut} iconClass="h-3.5 w-3.5" />
      </div>
    </div>
  )
}

function EntreprisesList({ filtered, viewMode, onNavigate, onOpenUsers, onToggleStatut }) {
  if (filtered.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        Aucun résultat pour ces filtres.
      </div>
    )
  }

  if (viewMode === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/50">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Entreprise</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Utilisateurs</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Obligations</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Statut</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((e) => (
              <EntrepriseTableRow
                key={e.id}
                entreprise={e}
                onNavigate={onNavigate}
                onOpenUsers={onOpenUsers}
                onToggleStatut={onToggleStatut}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((e) => (
        <EntrepriseCard
          key={e.id}
          entreprise={e}
          onNavigate={onNavigate}
          onOpenUsers={onOpenUsers}
          onToggleStatut={onToggleStatut}
        />
      ))}
    </div>
  )
}

const STATUS_FILTERS = [
  { value: '', label: 'Toutes', Icon: ClipboardIcon },
  { value: 'active', label: 'Actives', Icon: CheckCircleIcon },
  { value: 'suspendue', label: 'Suspendue', Icon: AlertTriangleIcon },
]

export default function AdminEntreprises() {
  const toast = useToast()
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  const [entreprises, setEntreprises] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('table')
  const [showAdd, setShowAdd] = useState(false)
  const [showStatut, setShowStatut] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchEntreprises = async () => {
    setLoading(true)
    try {
      const res = await api.get('/entreprises')
      setEntreprises(res.data || [])
    } catch {
      setError('Impossible de charger les entreprises.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEntreprises() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entreprises.filter((e) => {
      if (statusFilter && e.statut !== statusFilter) return false
      if (!q) return true
      return (
        (e.raison_sociale || '').toLowerCase().includes(q)
        || (e.email || '').toLowerCase().includes(q)
        || (e.secteur_activite || '').toLowerCase().includes(q)
      )
    })
  }, [entreprises, search, statusFilter])

  const handleCreated = () => {
    toast.success('Entreprise et administrateur créés.')
    fetchEntreprises()
  }

  const handleToggleStatut = async () => {
    if (!showStatut) return
    const next = showStatut.statut === 'active' ? 'suspendue' : 'active'
    setSaving(true)
    setError('')
    try {
      await api.patch(`/entreprises/${showStatut.id}/statut`, { statut: next })
      toast.success(next === 'active' ? 'Entreprise activée.' : 'Entreprise suspendue.')
      setShowStatut(null)
      fetchEntreprises()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de statut.')
      toast.error(err.response?.data?.message || 'Erreur lors du changement de statut.')
    } finally {
      setSaving(false)
    }
  }

  const goToEntreprise = (id) => navigate(`/admin/entreprises/${id}`)
  const goToUsers = (id) => navigate(`/admin/entreprises/${id}#utilisateurs`)

  if (loading) return <LoadingScreen />
  if (!isSuperAdmin) return <Navigate to="/login" replace />

  const isSuspending = showStatut?.statut === 'active'
  const confirmLabel = (() => {
    if (saving) return 'Traitement...'
    if (isSuspending) return 'Suspendre'
    return 'Activer'
  })()

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Entreprises</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {entreprises.length} entreprise{entreprises.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <PlusIcon className="h-4 w-4" /> Nouvelle entreprise
          </Button>
        </div>

        <SearchFilterBar
          title="Filtrer les entreprises"
          subtitle="Recherche par nom, email ou secteur"
          Icon={BuildingOfficeIcon}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ex: Atlas Services, contact@entreprise.ma…"
          filters={STATUS_FILTERS}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          total={filtered.length}
          filtersLabel="Par statut"
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Toutes les entreprises</h2>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {filtered.length} client{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>

          {entreprises.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <BuildingOfficeIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">Aucune entreprise pour le moment</p>
              <Button className="mt-4" onClick={() => setShowAdd(true)}>
                Créer la première entreprise
              </Button>
            </div>
          ) : (
            <EntreprisesList
              filtered={filtered}
              viewMode={viewMode}
              onNavigate={goToEntreprise}
              onOpenUsers={goToUsers}
              onToggleStatut={setShowStatut}
            />
          )}
        </div>

        <EntrepriseModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
        />

        <ConfirmModal
          open={!!showStatut}
          onClose={() => setShowStatut(null)}
          onConfirm={handleToggleStatut}
          title={isSuspending ? 'Suspendre l\'entreprise' : 'Activer l\'entreprise'}
          message={
            isSuspending
              ? `Suspendre « ${showStatut?.raison_sociale} » ?`
              : `Réactiver « ${showStatut?.raison_sociale} » ?`
          }
          confirmLabel={confirmLabel}
          loading={saving}
          variant={isSuspending ? 'danger' : 'primary'}
          detail={
            isSuspending
              ? 'Les utilisateurs de cette entreprise ne pourront plus se connecter.'
              : 'Les utilisateurs de cette entreprise pourront à nouveau se connecter.'
          }
        />
      </div>
    </PageShell>
  )
}
