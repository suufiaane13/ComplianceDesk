import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/FormFields'
import { useToast } from '../context/ToastContext'
import { ArrowLeftIcon } from '../components/icons'
import api from '../api/axios'

export default function SetPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    email: params.get('email') || '',
    token: params.get('token') || '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await api.post('/password/set', form, { skipAuthRedirect: true })
      toast.success('Mot de passe défini. Vous pouvez vous connecter.')
      navigate('/login', { replace: true })
    } catch (err) {
      const message = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.errors?.password?.[0]
        || err.response?.data?.message
        || 'Impossible de définir le mot de passe.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Définir le mot de passe"
      subtitle="Activez votre compte ComplianceDesk."
      footer={
        <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400">
          <ArrowLeftIcon className="h-4 w-4" />
          Retour à la connexion
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Nouveau mot de passe"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Input
          label="Confirmation"
          type="password"
          required
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
        />
        <Button type="submit" className="w-full" disabled={loading || !form.token}>
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        {!form.token && (
          <p className="text-center text-xs text-red-600 dark:text-red-400">
            Lien invalide ou incomplet. Demandez un nouvel email d’invitation.
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
