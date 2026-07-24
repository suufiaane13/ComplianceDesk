import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { ArrowRightIcon, CalendarIcon, PlusIcon, TrashIcon, XMarkIcon, PaperClipIcon, FolderIcon } from '../components/icons'
import PageShell from '../components/ui/PageShell'
import { Pagination, ViewToggle } from '../components/ui/DataTable'
import ObligationFilterBar from '../components/ObligationFilterBar'
import CreateObligationTrigger from '../components/CreateObligationTrigger'
import ObligationModal from '../components/ObligationModal'
import ObligationMobileCard from '../components/mobile/ObligationMobileCard'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingScreen from '../components/ui/LoadingScreen'
import Button from '../components/ui/Button'
import ModalFrame from '../components/ui/ModalFrame'
import { Input } from '../components/ui/FormFields'
import { useToast } from '../context/ToastContext'
import { formatDateFr } from '../utils/date'
import { useAuth } from '../context/AuthContext'

function SortIcon({ field, sortBy, sortDirection }) {
  if (sortBy !== field) return <span className="ml-1 text-slate-300 dark:text-slate-600">↕</span>
  return <span className="ml-1 text-teal-600 dark:text-teal-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
}

function matchesUpcomingFilter(ob) {
  const d = ob.date_echeance || ob.due_date
  if (!d) return false
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  const diff = Math.ceil((t.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff > 0
}

function matchesExpiredFilter(ob) {
  const d = ob.date_echeance || ob.due_date
  if (!d) return false
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return t.getTime() < Date.now()
}

function matchesObligationFilters(ob, viewFilter, searchFilter) {
  const status = ob.statut || ob.status

  if (viewFilter === 'upcoming') {
    if (!matchesUpcomingFilter(ob)) return false
  }

  if (viewFilter === 'expired') {
    if (!matchesExpiredFilter(ob)) return false
  }

  if (viewFilter?.startsWith('status:')) {
    if (status !== viewFilter.split(':')[1]) return false
  }

  const q = searchFilter.toLowerCase().trim()
  if (q) {
    const title = (ob.intitule || ob.title || '').toLowerCase()
    const cat = (ob.categorie || ob.category?.nom || '').toLowerCase()
    if (!title.includes(q) && !cat.includes(q)) return false
  }

  return true
}

function sortValueFor(ob, sortBy) {
  if (sortBy === 'title') {
    return (ob.intitule || ob.title || '').toLowerCase()
  }
  if (sortBy === 'status') {
    return (ob.statut || ob.status || '').toLowerCase()
  }
  if (sortBy === 'created_at') {
    return new Date(ob.created_at).getTime()
  }
  return new Date(ob.date_echeance || ob.due_date || 0).getTime()
}

function compareObligations(a, b, sortBy, sortDirection) {
  const valA = sortValueFor(a, sortBy)
  const valB = sortValueFor(b, sortBy)
  if (valA < valB) {
    return sortDirection === 'asc' ? -1 : 1
  }
  if (valA > valB) {
    return sortDirection === 'asc' ? 1 : -1
  }
  return 0
}

function CategoriesModal({ isOpen, onClose, categories, onRefresh }) {
  const { error: toastError } = useToast()
  const [newCat, setNewCat] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setNewCat('')
      setDeletingId(null)
    }
  }, [isOpen])

  const handleAdd = async () => {
    const name = newCat.trim()
    if (!name) return
    setLoading(true)
    try {
      await api.post('/categories', { nom: name })
      setNewCat('')
      onRefresh()
    } catch (err) {
      toastError(err.response?.data?.message || 'Impossible d\'ajouter la catégorie.')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/categories/${id}`)
      onRefresh()
    } catch (err) {
      toastError(err.response?.data?.message || 'Impossible de supprimer la catégorie.')
    } finally { setDeletingId(null) }
  }

  return (
    <ModalFrame
      open={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel="Gérer les catégories"
      panelClassName="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/50">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gérer les catégories</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 pb-6 pt-6">
        <div className="space-y-4">
          <Input
            label="Nouvelle catégorie"
            required
            placeholder="Ex: Assurance, CNSS, Fiscal, RH…"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />

          <div className="rounded-xl bg-slate-50/60 p-3 dark:bg-slate-800/60">
            <div className="mb-2 flex items-center justify-between">
              <p className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Catégories existantes
              </p>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                {categories.length}
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-white py-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <FolderIcon className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Aucune catégorie</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Ajoutez-en une ci-dessus</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <FolderIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {cat.nom}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={loading || !newCat.trim()}
              className="flex-1"
            >
              <PlusIcon className="h-4 w-4" />
              {loading ? 'Ajout…' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </div>
    </ModalFrame>
  )
}

export default function Obligations() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [obligations, setObligations] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewFilter, setViewFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [sortBy, setSortBy] = useState('date_echeance')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const itemsPerPage = 8

  const fetchAllObligations = async () => {
    const perPage = 100
    let page = 1
    let lastPage = 1
    const all = []

    do {
      const res = await api.get('/obligations', { params: { per_page: perPage, page } })
      const chunk = res.data.data || (Array.isArray(res.data) ? res.data : [])
      all.push(...chunk)
      lastPage = res.data.last_page || 1
      page += 1
    } while (page <= lastPage)

    return all
  }

  const fetchData = async () => {
    setError(null)
    setLoading(true)
    try {
      const [obligationsData, categoriesRes] = await Promise.all([
        fetchAllObligations(),
        api.get('/categories').catch(() => ({ data: [] })),
      ])
      setObligations(obligationsData)
      const cats = categoriesRes.data
      setCategories(Array.isArray(cats) ? cats : cats?.data || [])
    } catch {
      setError('Impossible de charger les obligations.')
      setObligations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => { if (location.state?.openCreate) { setShowForm(true); window.history.replaceState({}, '') } }, [location])

  const handleCreate = async (form) => {
    const res = await api.post('/obligations', {
      intitule: form.intitule,
      categorie_id: form.categorie_id || null,
      date_echeance: form.date_echeance,
      commentaire: form.commentaire || null,
    })
    if (form.documents?.length && res.data?.id) {
      for (const doc of form.documents) {
        const fd = new FormData()
        fd.append('fichier', doc.file)
        fd.append('nom_fichier', doc.file.name)
        fd.append('type_document', doc.type || 'Contrat')
        await api.post(`/obligations/${res.data.id}/documents`, fd)
      }
    }
    await fetchData()
    setShowForm(false)
  }

  const handleSort = (field) => {
    if (sortBy === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDirection('asc') }
  }

  const getFilteredObligations = useCallback(() => {
    const filtered = obligations.filter((ob) => matchesObligationFilters(ob, viewFilter, searchFilter))
    filtered.sort((a, b) => compareObligations(a, b, sortBy, sortDirection))
    return filtered
  }, [obligations, viewFilter, searchFilter, sortBy, sortDirection])

  const filteredObligations = getFilteredObligations()
  const totalItems = filteredObligations.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const safeCurrent = Math.min(currentPage, totalPages)
  const paginated = filteredObligations.slice((safeCurrent - 1) * itemsPerPage, safeCurrent * itemsPerPage)

  if (loading) {
    return <PageShell><LoadingScreen /></PageShell>
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{error}</p>
          <Button type="button" className="mt-4" onClick={fetchData}>Réessayer</Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Obligations</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{totalItems} obligation{totalItems !== 1 ? 's' : ''} au total</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button type="button" onClick={() => setShowCategories(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-400">
                <FolderIcon className="h-4 w-4" /> Catégories
              </button>
            )}
            {isAdmin && <CreateObligationTrigger onClick={() => setShowForm(true)} />}
          </div>
        </div>

        <ObligationFilterBar
          viewFilter={viewFilter}
          onChange={(v) => { setViewFilter(v); setCurrentPage(1) }}
          searchFilter={searchFilter}
          onSearchChange={(v) => { setSearchFilter(v); setCurrentPage(1) }}
          total={totalItems}
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Toutes les obligations</h2>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{totalItems} obligation{totalItems !== 1 ? 's' : ''} au total</p>
            </div>
            <div><ViewToggle mode={viewMode} onChange={setViewMode} /></div>
          </div>
          <div className="px-5 py-4">
            {filteredObligations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"><CalendarIcon className="h-8 w-8" /></span>
                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Aucune obligation trouvée</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aucune obligation ne correspond à vos filtres.</p>
                {isAdmin && <button type="button" onClick={() => setShowForm(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg">Créer une obligation</button>}
              </div>
            ) : (
              <>
                <div>
                {viewMode === 'table' ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead><tr className="border-b border-slate-100 dark:border-slate-700/50">
                        <th className="cursor-pointer select-none px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500" onClick={() => handleSort('title')}>
                          <span className="inline-flex items-center">Intitulé <SortIcon field="title" sortBy={sortBy} sortDirection={sortDirection} /></span>
                        </th>
                        <th className="cursor-pointer select-none px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500" onClick={() => handleSort('status')}>
                          <span className="inline-flex items-center">Statut <SortIcon field="status" sortBy={sortBy} sortDirection={sortDirection} /></span>
                        </th>
                        <th className="cursor-pointer select-none px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500" onClick={() => handleSort('date_echeance')}>
                          <span className="inline-flex items-center">Échéance <SortIcon field="date_echeance" sortBy={sortBy} sortDirection={sortDirection} /></span>
                        </th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Catégorie</th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Docs</th>
                        <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Action</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {paginated.map(ob => {
                          const s = ob.statut || ob.status
                          const d = ob.date_echeance || ob.due_date
                          return (
                            <tr key={ob.id} className="group cursor-pointer transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50" onClick={() => navigate(`/obligations/${ob.id}`)}>
                              <td className="whitespace-nowrap px-6 py-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{ob.intitule || ob.title}</td>
                              <td className="px-6 py-3.5"><StatusBadge status={s} /></td>
                              <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">{formatDateFr(d)}</td>
                              <td className="px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400">{ob.categorie || ob.category?.nom || '—'}</td>
                              <td className="px-6 py-3.5">
                                {ob.documents?.length > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                    <PaperClipIcon className="h-3.5 w-3.5 text-slate-400" />
                                    {ob.documents.length}
                                  </span>
                                ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                              </td>
                              <td className="px-6 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-0.5">
                                  <Link to={`/obligations/${ob.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60">
                                    Détails<ArrowRightIcon className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {paginated.map(ob => {
                      const s = ob.statut || ob.status
                      const d = ob.date_echeance || ob.due_date
                      return (
                        <Link key={ob.id} to={`/obligations/${ob.id}`}
                          className="group flex flex-col rounded-xl border border-slate-100 bg-white p-4 transition hover:border-teal-200 hover:shadow-md hover:shadow-teal-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-teal-700 dark:hover:shadow-teal-900/20">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">{ob.intitule || ob.title}</p>
                            <StatusBadge status={s} />
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{ob.categorie || ob.category?.nom || '—'}</p>
                            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <PaperClipIcon className="h-3 w-3" />
                              {ob.documents?.length || 0}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatDateFr(d)}</p>
                        </Link>
                      )
                    })}
                  </div>
                )}
                </div>
                <div className={`divide-y divide-slate-200 dark:divide-slate-700 ${viewMode === 'table' ? 'hidden' : 'md:hidden'}`}>
                  {paginated.map(ob => (
                    <Link key={ob.id} to={`/obligations/${ob.id}`} className="block">
                      <ObligationMobileCard obligation={ob} isNew={ob.created_at && (Date.now() - new Date(ob.created_at).getTime()) < 10 * 60 * 1000} showDocs={false} />
                    </Link>
                  ))}
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

      <ObligationModal isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={handleCreate} categories={categories} />
      <CategoriesModal isOpen={showCategories} onClose={() => setShowCategories(false)} categories={categories} onRefresh={() => api.get('/categories').then(res => setCategories(Array.isArray(res.data) ? res.data : res.data?.data || []))} />
    </PageShell>
  )
}
