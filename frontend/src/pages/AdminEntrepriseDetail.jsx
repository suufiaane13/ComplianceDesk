import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageShell from '../components/ui/PageShell'
import Button from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/Modal'
import EntrepriseHeaderCard from '../components/EntrepriseHeaderCard'
import EntrepriseModal from '../components/EntrepriseModal'
import UserListPanel from '../components/UserListPanel'
import { ArrowLeftIcon, AlertTriangleIcon, CheckCircleIcon, PencilIcon } from '../components/icons'

export default function AdminEntrepriseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isSuperAdmin, user: currentUser } = useAuth()
  const [entreprise, setEntreprise] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showStatut, setShowStatut] = useState(false)
  const [statutSaving, setStatutSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [entRes, usersRes] = await Promise.all([
        api.get(`/entreprises/${id}`),
        api.get(`/entreprises/${id}/users`),
      ])
      setEntreprise(entRes.data)
      setUsers(usersRes.data || [])
    } catch {
      toast.error('Impossible de charger l\'entreprise.')
      navigate('/admin/entreprises')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (loading || !entreprise) return
    if (window.location.hash !== '#utilisateurs') return
    const el = document.getElementById('utilisateurs')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, entreprise])

  const handleToggleStatut = async () => {
    const next = entreprise.statut === 'active' ? 'suspendue' : 'active'
    setStatutSaving(true)
    try {
      const res = await api.patch(`/entreprises/${id}/statut`, { statut: next })
      setEntreprise((prev) => ({ ...prev, ...res.data }))
      setShowStatut(false)
      toast.success(next === 'active' ? 'Entreprise activée.' : 'Entreprise suspendue.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de modifier le statut.')
    } finally {
      setStatutSaving(false)
    }
  }

  const refreshUsers = async () => {
    const res = await api.get(`/entreprises/${id}/users`)
    setUsers(res.data || [])
  }

  if (!isSuperAdmin) return <Navigate to="/login" replace />
  if (loading) return <LoadingScreen />
  if (!entreprise) return null

  const isSuspending = entreprise.statut === 'active'
  let statutConfirmLabel = 'Activer'
  if (statutSaving) statutConfirmLabel = 'Traitement...'
  else if (isSuspending) statutConfirmLabel = 'Suspendre'

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              to="/admin/entreprises"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Retour aux entreprises
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {entreprise.raison_sociale}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              <PencilIcon className="h-4 w-4" /> Modifier
            </Button>
            <Button
              variant={isSuspending ? 'danger' : 'primary'}
              onClick={() => setShowStatut(true)}
            >
              {isSuspending ? (
                <><AlertTriangleIcon className="h-4 w-4" /> Suspendre</>
              ) : (
                <><CheckCircleIcon className="h-4 w-4" /> Activer</>
              )}
            </Button>
          </div>
        </div>

        <EntrepriseHeaderCard entreprise={entreprise} />

        <UserListPanel
          users={users}
          currentUserId={currentUser?.id}
          title="Utilisateurs"
          subtitle={`${users.length} membre${users.length !== 1 ? 's' : ''}`}
          onCreate={async (payload) => {
            await api.post(`/entreprises/${id}/users`, payload)
            toast.success('Utilisateur créé.')
            await refreshUsers()
          }}
          onUpdate={async (userId, payload) => {
            await api.put(`/entreprises/${id}/users/${userId}`, payload)
            toast.success('Utilisateur modifié.')
            await refreshUsers()
          }}
          onDelete={async (userId) => {
            await api.delete(`/entreprises/${id}/users/${userId}`)
            toast.success('Utilisateur supprimé.')
            await refreshUsers()
          }}
        />

        <EntrepriseModal
          isOpen={showEdit}
          mode="edit"
          entreprise={entreprise}
          onClose={() => setShowEdit(false)}
          onUpdated={(data) => {
            setEntreprise((prev) => ({ ...prev, ...data }))
            toast.success('Entreprise mise à jour.')
          }}
        />

        <ConfirmModal
          open={showStatut}
          onClose={() => setShowStatut(false)}
          onConfirm={handleToggleStatut}
          title={isSuspending ? 'Suspendre l\'entreprise' : 'Activer l\'entreprise'}
          message={
            isSuspending
              ? `Suspendre « ${entreprise.raison_sociale} » ?`
              : `Réactiver « ${entreprise.raison_sociale} » ?`
          }
          confirmLabel={statutConfirmLabel}
          loading={statutSaving}
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
