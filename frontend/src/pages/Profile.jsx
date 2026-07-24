import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'
import PageShell from '../components/ui/PageShell'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/FormFields'
import { UserIcon, CheckCircleIcon, ShieldCheckIcon, BuildingOfficeIcon, CalendarIcon, XMarkIcon } from '../components/icons'
import ModalFrame from '../components/ui/ModalFrame'

function roleLabel(role) {
  if (role === 'super_admin') return 'Super administrateur'
  if (role === 'admin') return 'Administrateur'
  return 'Utilisateur'
}

function RoleBadge({ role }) {
  if (role === 'super_admin' || role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1">
        <ShieldCheckIcon className="h-3.5 w-3.5" />
        {roleLabel(role)}
      </span>
    )
  }
  return <span>Utilisateur</span>
}

function ConfirmPasswordModal({ isOpen, onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => { setPassword(''); setError(''); onClose() }

  const handleConfirm = async () => {
    if (!password.trim()) { setError('Entrez votre mot de passe.'); return }
    setLoading(true); setError('')
    try {
      await onConfirm(password)
      setPassword('')
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.current_password?.[0] || 'Erreur lors de la vérification.')
    } finally { setLoading(false) }
  }

  return (
    <ModalFrame
      open={isOpen}
      onClose={handleClose}
      size="sm"
      ariaLabel="Confirmation requise"
      panelClassName="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <button type="button" onClick={handleClose} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"><XMarkIcon className="h-5 w-5" /></button>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30"><ShieldCheckIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" /></div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Confirmation requise</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Entrez votre mot de passe pour modifier vos informations.</p>
      <div className="mt-4">
        <Input label="Mot de passe" type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} error={error} placeholder="Saisissez votre mot de passe actuel" />
      </div>
      <div className="mt-5 flex gap-3">
        <Button variant="secondary" type="button" onClick={handleClose} className="flex-1">Annuler</Button>
        <Button type="button" onClick={handleConfirm} disabled={loading} className="flex-1">{loading ? 'Vérification...' : 'Confirmer'}</Button>
      </div>
    </ModalFrame>
  )
}

export default function Profile() {
  const toast = useToast()
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ nom: user?.nom || '', prenom: user?.prenom || '', email: user?.email || '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [success, setSuccess] = useState('')
  const [successPwd, setSuccessPwd] = useState('')
  const [confirmModal, setConfirmModal] = useState(null)

  const doProfileSave = async (pwd) => {
    setSaving(true)
    setSuccess('')
    try {
      const res = await api.put('/user', { nom: form.nom, prenom: form.prenom, email: form.email, password: pwd })
      setUser(res.data)
      setSuccess('Profil mis à jour.')
      toast.success('Profil mis à jour.')
    } finally {
      setSaving(false)
    }
  }

  const doPasswordSave = async (pwd) => {
    setSavingPwd(true)
    setSuccessPwd('')
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.warning('Les mots de passe ne correspondent pas.')
      setSavingPwd(false)
      throw new Error('no match')
    }
    try {
      await api.put('/user/password', {
        current_password: pwd,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      })
      setSuccessPwd('Mot de passe modifié.')
      toast.success('Mot de passe modifié.')
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
    } finally {
      setSavingPwd(false)
    }
  }

  const initials = `${user?.prenom?.charAt(0) || ''}${user?.nom?.charAt(0) || ''}`.toUpperCase()

  return (
    <PageShell>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Mon profil</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Gérez vos informations personnelles</p></div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold text-white backdrop-blur-sm">{initials}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.prenom} {user?.nom}</h2>
                <p className="text-sm text-teal-100">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3">
            {[
              { Icon: BuildingOfficeIcon, label: 'Entreprise', value: 'ComplianceDesk Maroc' },
              { Icon: CalendarIcon, label: 'Membre depuis', value: new Date(user?.date_creation || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) },
              { Icon: ShieldCheckIcon, label: 'Rôle', value: roleLabel(user?.role) },
            ].map(({ Icon, label, value }, i) => (
              <div key={label} className={`flex items-center gap-3 px-6 py-4 ${i < 2 ? 'border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700/50' : ''}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"><Icon className="h-4 w-4" /></span>
                <div><p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</p><p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-700/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"><UserIcon className="h-4 w-4" /></span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Informations personnelles</h3>
              </div>
            </div>
            <div className="px-6 py-5">
              {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><CheckCircleIcon className="h-4 w-4" />{success}</div>}
              <form onSubmit={(e) => { e.preventDefault(); setConfirmModal('profile') }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nom" required placeholder="Ex: Benali" value={form.nom} onChange={(e) => { setForm({ ...form, nom: e.target.value }); setSuccess('') }} />
                  <Input label="Prénom" required placeholder="Ex: Fatima" value={form.prenom} onChange={(e) => { setForm({ ...form, prenom: e.target.value }); setSuccess('') }} />
                </div>
                <Input label="Email" type="email" required placeholder="Ex: fatima.benali@entreprise.ma" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setSuccess('') }} />
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
                </div>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-700/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600"><ShieldCheckIcon className="h-4 w-4" /></span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Changer le mot de passe</h3>
              </div>
            </div>
            <div className="px-6 py-5">
              {successPwd && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><CheckCircleIcon className="h-4 w-4" />{successPwd}</div>}
              <form onSubmit={(e) => { e.preventDefault(); setConfirmModal('password') }} className="space-y-4">
                <Input label="Nouveau mot de passe" type="password" required placeholder="Minimum 8 caractères" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                <Input label="Confirmer" type="password" required placeholder="Retapez le nouveau mot de passe" value={passwordForm.password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })} />
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" disabled={savingPwd}>{savingPwd ? 'Modification...' : 'Modifier le mot de passe'}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ConfirmPasswordModal
        isOpen={confirmModal === 'profile'}
        onClose={() => setConfirmModal(null)}
        onConfirm={doProfileSave}
      />
      <ConfirmPasswordModal
        isOpen={confirmModal === 'password'}
        onClose={() => setConfirmModal(null)}
        onConfirm={doPasswordSave}
      />
    </PageShell>
  )
}
