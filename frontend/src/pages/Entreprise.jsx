import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageShell from '../components/ui/PageShell'
import EntrepriseHeaderCard from '../components/EntrepriseHeaderCard'
import EntrepriseEditForm from '../components/EntrepriseEditForm'
import { useToast } from '../context/ToastContext'

export default function Entreprise() {
  const toast = useToast()
  const { user, isAdmin } = useAuth()
  const [entreprise, setEntreprise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user?.entreprise_id) return
    api.get(`/entreprises/${user.entreprise_id}`)
      .then(res => setEntreprise(res.data))
      .catch(() => toast.error('Impossible de charger les informations.'))
      .finally(() => setLoading(false))
  }, [user?.entreprise_id])

  const handleChange = (e) => {
    setEntreprise(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      await api.put(`/entreprises/${user.entreprise_id}`, {
        raison_sociale: entreprise.raison_sociale,
        secteur_activite: entreprise.secteur_activite,
        adresse: entreprise.adresse,
        telephone: entreprise.telephone,
        email: entreprise.email,
      })
      setSuccess('Informations enregistrées.')
      toast.success('Informations enregistrées.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d\'enregistrer les modifications.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />
  if (!entreprise) {
    return (
      <PageShell>
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune entreprise trouvée.</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Mon entreprise</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Gérez les informations de votre entreprise</p>
        </div>

        <EntrepriseHeaderCard entreprise={entreprise} />

        {isAdmin && (
          <EntrepriseEditForm
            entreprise={entreprise}
            onChange={handleChange}
            onSubmit={handleSubmit}
            saving={saving}
            success={success}
          />
        )}
      </div>
    </PageShell>
  )
}
