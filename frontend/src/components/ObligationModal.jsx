import { useEffect, useState } from 'react'
import { XMarkIcon, ClipboardIcon, PaperClipIcon } from './icons'
import Button from './ui/Button'
import { Input, Select, FileInput, Textarea } from './ui/FormFields'
import StepIndicator from './ui/StepIndicator'
import ModalFrame from './ui/ModalFrame'

const createSteps = [
  { id: 1, label: 'Informations', Icon: ClipboardIcon },
  { id: 2, label: 'Documents', Icon: PaperClipIcon },
]

const DOC_TYPES = ['Contrat', 'Autorisation', 'Certificat', 'Attestation', 'Rapport', 'Autre']

function submitButtonLabel(loading, isEdit) {
  if (loading) return 'Enregistrement...'
  if (isEdit) return 'Enregistrer'
  return 'Créer'
}

export default function ObligationModal({ isOpen, onClose, obligation, categories, onSubmit }) {
  const categoryOptions = [
    { value: '', label: 'Sélectionner une catégorie…' },
    ...(categories || []).map(c => ({ value: c.id ?? c.nom, label: c.nom || c })),
  ]
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ intitule: '', categorie_id: '', date_echeance: '', commentaire: '', documents: [] })
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(obligation)

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      if (obligation) {
        setForm({
          intitule: obligation.intitule || '',
          categorie_id: obligation.categorie_id || '',
          date_echeance: obligation.date_echeance ? new Date(obligation.date_echeance).toISOString().split('T')[0] : '',
          commentaire: obligation.commentaire || '',
          documents: [],
        })
      } else {
        setForm({ intitule: '', categorie_id: '', date_echeance: '', commentaire: '', documents: [] })
      }
    }
  }, [isOpen, obligation])

  const validateStep1 = () => {
    if (!form.intitule.trim()) return false
    if (!form.categorie_id) return false
    if (!form.date_echeance) return false
    return true
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const addFile = (file) => {
    if (!file) return
    setForm(prev => ({ ...prev, documents: [...prev.documents, { file, type: 'Contrat' }] }))
  }

  const removeFile = (idx) => {
    setForm(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }))
  }

  const updateFileType = (idx, type) => {
    setForm(prev => ({ ...prev, documents: prev.documents.map((d, i) => i === idx ? { ...d, type } : d) }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch { /* toast handled upstream */ } finally { setLoading(false) }
  }

  return (
    <ModalFrame
      open={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel={isEdit ? 'Modifier l\'obligation' : 'Créer une obligation'}
      panelClassName="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/50">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEdit ? "Modifier l'obligation" : 'Nouvelle obligation'}</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"><XMarkIcon className="h-5 w-5" /></button>
      </div>

      <div className="px-6 pt-6">
        <StepIndicator currentStep={step} steps={createSteps} />
      </div>

      <div className="px-6 pb-6">
        {step === 1 ? (
          <div className="space-y-4">
            <Input label="Intitulé" required placeholder="Ex: Assurance RC, déclaration CNSS, visite médicale…" value={form.intitule} onChange={(e) => setForm({ ...form, intitule: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Catégorie" required value={form.categorie_id} onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                options={categoryOptions} />
              <Input label="Date d'échéance" type="date" required value={form.date_echeance} onChange={(e) => setForm({ ...form, date_echeance: e.target.value })} />
            </div>
            <Textarea label="Commentaire" placeholder="Ex: Renouvellement annuel, contact assureur, n° de police…" rows={3} value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Annuler</Button>
              <Button type="button" onClick={handleNext} className="flex-1">Suivant</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50/60 p-3 dark:bg-slate-800/60">
              <FileInput
                id="obligation-modal-docs"
                label="Joindre des documents"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                emptyLabel="Choisir un fichier (PDF, Word, image…)"
                onChange={addFile}
              />
              {form.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.documents.map((doc, idx) => (
                    <div key={`${doc.file.name}-${doc.file.size}-${doc.file.lastModified}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <PaperClipIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-900 dark:text-slate-100">{doc.file.name}</span>
                      <Select
                        size="sm"
                        className="w-auto shrink-0 min-w-[7.5rem]"
                        value={doc.type}
                        onChange={(e) => updateFileType(idx, e.target.value)}
                        options={DOC_TYPES.map(t => ({ value: t, label: t }))}
                      />
                      <button type="button" onClick={() => removeFile(idx)} className="shrink-0 rounded p-0.5 text-slate-400 hover:text-red-500">
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">Optionnel — vous pouvez ajouter des documents plus tard</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setStep(1)} className="flex-1">Retour</Button>
              <Button type="button" onClick={handleSubmit} className="flex-1" disabled={loading}>
                {submitButtonLabel(loading, isEdit)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalFrame>
  )
}
