import { useEffect, useState } from 'react'
import { XMarkIcon, BuildingOfficeIcon, ShieldCheckIcon } from './icons'
import Button from './ui/Button'
import { Input } from './ui/FormFields'
import StepIndicator from './ui/StepIndicator'
import ModalFrame from './ui/ModalFrame'
import api from '../api/axios'
import { isValidMoroccanPhone, PHONE_ERROR } from '../utils/phone'

const createSteps = [
  { id: 1, label: 'Entreprise', Icon: BuildingOfficeIcon },
  { id: 2, label: 'Administrateur', Icon: ShieldCheckIcon },
]

const emptyForm = {
  raison_sociale: '',
  secteur_activite: '',
  adresse: '',
  telephone: '',
  email: '',
  admin_nom: '',
  admin_prenom: '',
  admin_email: '',
  admin_password: '',
}

function formFromEntreprise(entreprise) {
  return {
    ...emptyForm,
    raison_sociale: entreprise?.raison_sociale || '',
    secteur_activite: entreprise?.secteur_activite || '',
    adresse: entreprise?.adresse || '',
    telephone: entreprise?.telephone || '',
    email: entreprise?.email || '',
  }
}

function EntrepriseFields({ form, setField }) {
  return (
    <div className="space-y-4">
      <Input
        label="Raison sociale"
        required
        placeholder="Ex: Atlas Services SARL"
        value={form.raison_sociale}
        onChange={setField('raison_sociale')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Secteur d'activité"
          placeholder="Ex: Commerce, Industrie…"
          value={form.secteur_activite}
          onChange={setField('secteur_activite')}
        />
        <div>
          <Input
            label="Téléphone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ex: 0522 00 00 00"
            value={form.telephone}
            onChange={setField('telephone')}
            error={form.telephone && !isValidMoroccanPhone(form.telephone) ? PHONE_ERROR : ''}
          />
        </div>
      </div>
      <Input
        label="Email entreprise"
        type="email"
        placeholder="Ex: contact@entreprise.ma"
        value={form.email}
        onChange={setField('email')}
      />
      <Input
        label="Adresse"
        placeholder="Ex: 12 Bd Mohammed V, Oujda"
        value={form.adresse}
        onChange={setField('adresse')}
      />
    </div>
  )
}

export default function EntrepriseModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  mode = 'create',
  entreprise = null,
}) {
  const isEdit = mode === 'edit'
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setStep(1)
    setError('')
    setForm(isEdit ? formFromEntreprise(entreprise) : emptyForm)
  }, [isOpen, isEdit, entreprise])

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const validateEntreprise = () => {
    if (!form.raison_sociale.trim()) {
      setError('La raison sociale est obligatoire.')
      return false
    }
    if (!isValidMoroccanPhone(form.telephone)) {
      setError(PHONE_ERROR)
      return false
    }
    return true
  }

  const validateStep2 = () => (
    form.admin_nom.trim()
    && form.admin_prenom.trim()
    && form.admin_email.trim()
    && form.admin_password.length >= 8
  )

  const handleNext = () => {
    setError('')
    if (!validateEntreprise()) return
    setStep(2)
  }

  const payloadEntreprise = () => ({
    raison_sociale: form.raison_sociale.trim(),
    secteur_activite: form.secteur_activite || null,
    adresse: form.adresse || null,
    telephone: form.telephone || null,
    email: form.email || null,
  })

  const handleCreate = async () => {
    setError('')
    if (!validateStep2()) {
      setError('Complétez les informations administrateur (mot de passe ≥ 8 caractères).')
      return
    }

    setLoading(true)
    try {
      await api.post('/entreprises', {
        ...payloadEntreprise(),
        admin: {
          nom: form.admin_nom.trim(),
          prenom: form.admin_prenom.trim(),
          email: form.admin_email.trim(),
          password: form.admin_password,
        },
      })
      onCreated?.()
      onClose()
    } catch (err) {
      const data = err.response?.data
      const firstError = data?.errors
        ? Object.values(data.errors).flat()[0]
        : data?.message
      setError(firstError || 'Erreur lors de la création.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setError('')
    if (!validateEntreprise()) return
    if (!entreprise?.id) return

    setLoading(true)
    try {
      const res = await api.put(`/entreprises/${entreprise.id}`, payloadEntreprise())
      onUpdated?.(res.data)
      onClose()
    } catch (err) {
      const data = err.response?.data
      const firstError = data?.errors
        ? Object.values(data.errors).flat()[0]
        : data?.message
      setError(firstError || 'Erreur lors de l\'enregistrement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalFrame
      open={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel={isEdit ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
      panelClassName="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/50">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isEdit ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {!isEdit && (
        <div className="px-6 pt-6">
          <StepIndicator currentStep={step} steps={createSteps} />
        </div>
      )}

      <div className={`px-6 pb-6 ${isEdit ? 'pt-6' : ''}`}>
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {isEdit && (
          <div className="space-y-4">
            <EntrepriseFields form={form} setField={setField} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Annuler</Button>
              <Button type="button" onClick={handleUpdate} className="flex-1" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}

        {!isEdit && step === 1 && (
          <div className="space-y-4">
            <EntrepriseFields form={form} setField={setField} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Annuler</Button>
              <Button type="button" onClick={handleNext} className="flex-1">Suivant</Button>
            </div>
          </div>
        )}

        {!isEdit && step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compte administrateur initial de <span className="font-semibold text-slate-800 dark:text-slate-200">{form.raison_sociale || 'l’entreprise'}</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nom" required placeholder="Ex: Alaoui" value={form.admin_nom} onChange={setField('admin_nom')} />
              <Input label="Prénom" required placeholder="Ex: Youssef" value={form.admin_prenom} onChange={setField('admin_prenom')} />
            </div>
            <Input
              label="Email"
              type="email"
              required
              placeholder="youssef.alaoui@entreprise.ma"
              value={form.admin_email}
              onChange={setField('admin_email')}
            />
            <Input
              label="Mot de passe"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 caractères"
              value={form.admin_password}
              onChange={setField('admin_password')}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => { setError(''); setStep(1) }} className="flex-1">
                Retour
              </Button>
              <Button type="button" onClick={handleCreate} className="flex-1" disabled={loading}>
                {loading ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalFrame>
  )
}
