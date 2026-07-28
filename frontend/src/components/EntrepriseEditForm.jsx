import { useState } from 'react'
import Button from './ui/Button'
import { Input } from './ui/FormFields'
import { BuildingOfficeIcon, CheckCircleIcon } from './icons'
import { isValidMoroccanPhone, PHONE_ERROR } from '../utils/phone'

export default function EntrepriseEditForm({
  entreprise,
  onChange,
  onSubmit,
  saving = false,
  success = '',
  title = 'Modifier les informations',
}) {
  const [localSuccess, setLocalSuccess] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const shownSuccess = success || localSuccess
  const phoneInvalid = entreprise?.telephone && !isValidMoroccanPhone(entreprise.telephone)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalSuccess('')
    if (!isValidMoroccanPhone(entreprise?.telephone)) {
      setPhoneError(PHONE_ERROR)
      return
    }
    setPhoneError('')
    await onSubmit?.(e)
  }

  const handleChange = (e) => {
    setLocalSuccess('')
    if (e.target.name === 'telephone') setPhoneError('')
    onChange?.(e)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <BuildingOfficeIcon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      {shownSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircleIcon className="h-4 w-4" />
          {shownSuccess}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Raison sociale" name="raison_sociale" required placeholder="Ex: Atlas Services SARL" value={entreprise?.raison_sociale || ''} onChange={handleChange} />
          <Input label="Secteur d'activité" name="secteur_activite" placeholder="Ex: Commerce, Industrie, Services…" value={entreprise?.secteur_activite || ''} onChange={handleChange} />
          <Input label="Adresse" name="adresse" placeholder="Ex: 12 Bd Mohammed V, Oujda" value={entreprise?.adresse || ''} onChange={handleChange} />
          <div>
            <Input
              label="Téléphone"
              name="telephone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ex: 0522 00 00 00"
              value={entreprise?.telephone || ''}
              onChange={handleChange}
              error={phoneError || (phoneInvalid ? PHONE_ERROR : '')}
            />
          </div>
          <Input label="Email" name="email" type="email" placeholder="Ex: contact@entreprise.ma" value={entreprise?.email || ''} onChange={handleChange} />
        </div>
        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </div>
      </form>
    </div>
  )
}
