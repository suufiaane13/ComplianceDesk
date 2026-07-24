import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/FormFields'
import { useAuth, homePathForUser } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ShieldCheckIcon, UserIcon, ArrowLeftIcon, BuildingOfficeIcon } from '../components/icons'

const SEED_ACCOUNTS = [
  {
    label: 'Super administrateur',
    email: 'superadmin@compliancedesk.ma',
    password: 'password',
    Icon: BuildingOfficeIcon,
    accent: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600',
    hover: 'hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/80',
  },
  {
    label: 'Administrateur',
    email: 'admin@compliancedesk.ma',
    password: 'password',
    Icon: ShieldCheckIcon,
    accent: 'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-800',
    hover: 'hover:border-violet-300 hover:bg-violet-50/60 dark:hover:border-violet-700 dark:hover:bg-violet-950/30',
  },
  {
    label: 'Utilisateur',
    email: 'user@compliancedesk.ma',
    password: 'password',
    Icon: UserIcon,
    accent: 'bg-teal-100 text-teal-700 ring-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:ring-teal-800',
    hover: 'hover:border-teal-300 hover:bg-teal-50/60 dark:hover:border-teal-700 dark:hover:bg-teal-950/30',
  },
]

export default function Login() {
  const toast = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      toast.success('Connexion réussie.')
      navigate(homePathForUser(data.user))
    } catch (err) {
      const message = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || 'Connexion impossible.'
      toast.error(message)
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accédez à votre espace conformité."
      footer={
        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400">
            <ArrowLeftIcon className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Pas de compte ?<br />
            Contactez l’administrateur de votre entreprise.
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Email" type="email" required placeholder="Ex: vous@entreprise.ma" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Mot de passe" type="password" required placeholder="Saisissez votre mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</Button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-4">
          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center text-[11px]"><span className="bg-white px-2 text-slate-400 dark:bg-slate-900 dark:text-slate-500">Comptes démo</span></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SEED_ACCOUNTS.map(({ label, email, password, Icon, accent, hover }) => (
              <button
                key={email}
                type="button"
                title={email}
                disabled={loading}
                onClick={() => { setForm({ email, password }) }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1.5 py-2 text-center transition disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 ${hover}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${accent}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-semibold leading-tight text-slate-800 dark:text-slate-200">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
