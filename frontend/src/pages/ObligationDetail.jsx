import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'
import PageShell from '../components/ui/PageShell'
import LoadingScreen from '../components/ui/LoadingScreen'
import StatusBadge from '../components/ui/StatusBadge'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/Modal'
import ObligationModal from '../components/ObligationModal'
import FilePreviewModal from '../components/FilePreviewModal'
import { formatDateFr } from '../utils/date'
import { statusLabels } from '../constants/labels'
import { ArrowLeftIcon, CalendarIcon, DocumentTextIcon, PencilIcon, TrashIcon, PaperClipIcon, DownloadIcon, InformationCircleIcon, PlusIcon, XMarkIcon, EyeIcon } from '../components/icons'
import { Select } from '../components/ui/FormFields'
import { useAuth } from '../context/AuthContext'

const DOC_TYPES = ['Contrat', 'Attestation', 'Certificat', 'Facture', 'Autorisation', 'Rapport', 'Autre']

function fileExt(name = '') {
  const parts = String(name).split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : 'file'
}

function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function fileTone(ext) {
  if (['pdf'].includes(ext)) return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (['doc', 'docx'].includes(ext)) return 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
  return 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
}

function uploadFileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function statutIconWrap(statut) {
  if (statut === 'a_jour') return 'bg-emerald-50 dark:bg-emerald-900/30'
  if (statut === 'proche_echeance') return 'bg-amber-50 dark:bg-amber-900/30'
  if (statut === 'expiree') return 'bg-red-50 dark:bg-red-900/30'
  return 'bg-slate-100 dark:bg-slate-800'
}

function statutIconColor(statut) {
  if (statut === 'a_jour') return 'text-emerald-600 dark:text-emerald-400'
  if (statut === 'proche_echeance') return 'text-amber-600 dark:text-amber-400'
  if (statut === 'expiree') return 'text-red-600 dark:text-red-400'
  return 'text-slate-600 dark:text-slate-400'
}

function PendingUploadCard({ doc, onRemove }) {
  const ext = fileExt(doc.file.name)
  return (
    <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-white p-3 shadow-sm dark:border-teal-800/50 dark:bg-slate-900">
      <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl ${fileTone(ext)}`}>
        <DocumentTextIcon className="h-4 w-4" />
        <span className="mt-0.5 text-[9px] font-bold uppercase leading-none">{ext}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={doc.file.name}>
          {doc.file.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            {doc.type}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatFileSize(doc.file.size)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        title="Retirer"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

function DocumentUploadSection({
  uploadFiles,
  uploadType,
  uploading,
  onTypeChange,
  onFilesSelected,
  onRemoveFile,
  onUpload,
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Importer des documents</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="flex min-h-[3.25rem] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-teal-300 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-600 dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400/30">
          <PaperClipIcon className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
          <span className="min-w-0 flex-1 truncate text-slate-500 dark:text-slate-400">
            Choisir un ou plusieurs fichiers (PDF, Word, image…)
          </span>
          <input
            type="file"
            className="sr-only"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => {
              onFilesSelected(Array.from(e.target.files || []))
              e.target.value = ''
            }}
          />
        </label>
        <div className="min-h-[3.25rem] shrink-0 sm:w-44">
          <Select
            value={uploadType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-full [&_button]:min-h-[3.25rem]"
            options={DOC_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>
        <button
          type="button"
          onClick={onUpload}
          disabled={!uploadFiles.length || uploading}
          className="inline-flex min-h-[3.25rem] shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
        >
          <PlusIcon className="h-4 w-4" />
          {uploading ? 'Envoi…' : 'Ajouter'}
        </button>
      </div>
      {uploadFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Prêts à envoyer · {uploadFiles.length}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {uploadFiles.map((doc) => (
              <PendingUploadCard
                key={uploadFileKey(doc.file)}
                doc={doc}
                onRemove={() => onRemoveFile(uploadFileKey(doc.file))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SavedDocumentCard({ doc, isAdmin, onPreview, onDownload, onDelete }) {
  const ext = fileExt(doc.nom_fichier)
  return (
    <div className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md hover:shadow-teal-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-teal-700 dark:hover:shadow-teal-900/20">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl ${fileTone(ext)}`}>
          <DocumentTextIcon className="h-5 w-5" />
          <span className="mt-0.5 text-[9px] font-bold uppercase leading-none">{ext}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100" title={doc.nom_fichier}>
            {doc.nom_fichier}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {doc.type_document || 'Document'}
            </span>
            {(doc.date_ajout || doc.created_at) && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {formatDateFr(doc.date_ajout || doc.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center dark:border-slate-700/50">
        <button
          type="button"
          onClick={() => onPreview(doc)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60"
        >
          <EyeIcon className="h-3.5 w-3.5" />
          Aperçu
        </button>
        <button
          type="button"
          onClick={() => onDownload(doc)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Télécharger
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(doc)}
            className="inline-flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-400 transition hover:bg-red-100 hover:text-red-500 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:hover:text-red-400 sm:bg-transparent sm:p-1.5 sm:text-slate-400 sm:hover:bg-red-50 sm:hover:text-red-500"
            title="Supprimer"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function DocumentsListSection({ documents, uploadFilesCount, isAdmin, onPreview, onDownload, onDelete }) {
  if (documents.length === 0 && !uploadFilesCount) {
    return (
      <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <PaperClipIcon className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Aucun document</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Importez un fichier ci-dessus pour commencer</p>
      </div>
    )
  }

  if (documents.length === 0) return null

  return (
    <div className="mt-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Documents enregistrés · {documents.length}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {documents.map((doc) => (
          <SavedDocumentCard
            key={doc.id}
            doc={doc}
            isAdmin={isAdmin}
            onPreview={onPreview}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default function ObligationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { success, error: toastError } = useToast()
  const [obligation, setObligation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadFiles, setUploadFiles] = useState([])
  const [uploadType, setUploadType] = useState('Contrat')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [deleteDoc, setDeleteDoc] = useState(null)

  const fetchObligation = () => {
    return api.get(`/obligations/${id}`).then(res => setObligation(res.data))
  }

  useEffect(() => {
    if (!id) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  useEffect(() => {
    Promise.all([
      fetchObligation(),
      api.get('/categories').then(res => setCategories(Array.isArray(res.data) ? res.data : res.data?.data || [])).catch(() => {}),
    ]).catch(() => toastError("Impossible de charger l'obligation."))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/obligations/${id}`)
      success('Obligation supprimée.')
      navigate('/obligations')
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat().join(' ')
        || 'Erreur lors de la suppression.'
      toastError(msg)
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = async (form) => {
    try {
      await api.put(`/obligations/${id}`, {
        intitule: form.intitule,
        categorie_id: form.categorie_id || null,
        date_echeance: form.date_echeance,
        commentaire: form.commentaire || null,
      })
      if (form.documents?.length) {
        for (const doc of form.documents) {
          const docFd = new FormData()
          docFd.append('fichier', doc.file)
          docFd.append('nom_fichier', doc.file.name)
          docFd.append('type_document', doc.type || 'Contrat')
          await api.post(`/obligations/${id}/documents`, docFd)
        }
      }
      await fetchObligation()
      setShowEdit(false)
      success('Obligation modifiée.')
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat().join(' ')
        || 'Erreur lors de la modification.'
      toastError(msg)
    }
  }

  const handleUpload = async () => {
    if (!uploadFiles.length) return
    setUploading(true)
    try {
      const count = uploadFiles.length
      for (const doc of uploadFiles) {
        const fd = new FormData()
        fd.append('fichier', doc.file)
        fd.append('nom_fichier', doc.file.name)
        fd.append('type_document', doc.type)
        await api.post(`/obligations/${id}/documents`, fd)
      }
      setUploadFiles([])
      await fetchObligation()
      const plural = count > 1 ? 's' : ''
      success(`${count} document${plural} ajouté${plural}.`)
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat().join(' ')
        || "Erreur lors du téléversement."
      toastError(msg)
    } finally {
      setUploading(false)
    }
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

  const addUploadFiles = (files) => {
    if (!files.length) return
    const rejected = []
    const accepted = []
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(file)
      } else {
        accepted.push({ file, type: uploadType })
      }
    }
    if (rejected.length) {
      const names = rejected.map(f => `"${f.name}" (${formatFileSize(f.size)})`).join(', ')
      toastError(`${names} — ${rejected.length > 1 ? 'dépassent' : 'dépasse'} la limite de 10 Mo.`)
    }
    if (accepted.length) {
      setUploadFiles((prev) => [...prev, ...accepted])
    }
  }

  const removeUploadFile = (key) => {
    setUploadFiles((prev) => prev.filter((doc) => uploadFileKey(doc.file) !== key))
  }

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
      if (res.data.size === 0) { toastError('Fichier vide.'); return }
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = doc.nom_fichier
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const msg = err.response?.status === 404 ? 'Fichier non trouvé.' : 'Erreur lors du téléchargement.'
      toastError(msg)
    }
  }

  const handleDeleteDocument = async () => {
    if (!deleteDoc) return
    try {
      await api.delete(`/documents/${deleteDoc.id}`)
      success('Document supprimé.')
      setDeleteDoc(null)
      await fetchObligation()
    } catch {
      toastError('Erreur lors de la suppression du document.')
    }
  }

  if (loading) return <LoadingScreen />
  if (!obligation) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <InformationCircleIcon className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Obligation introuvable</p>
          <Button variant="secondary" onClick={() => navigate('/obligations')} className="mt-4">
            Retour
          </Button>
        </div>
      </PageShell>
    )
  }

  const statut = obligation.statut || obligation.status
  const dateEcheance = obligation.date_echeance || obligation.due_date
  const documents = obligation.documents || []

  return (
    <PageShell>
      <div className="space-y-6 overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/obligations')}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-500 dark:text-slate-400 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:text-slate-300"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                {obligation.intitule || obligation.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Détails de l'obligation</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 dark:bg-teal-900/30 hover:text-teal-700 dark:text-teal-400 sm:flex-none"
              >
                <PencilIcon className="h-4 w-4" /> Modifier
              </button>
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 dark:bg-red-900/30 sm:flex-none"
              >
                <TrashIcon className="h-4 w-4" /> Supprimer
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="order-2 min-w-0 space-y-6 lg:order-1 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-slate-100">Informations</h2>
              <div className="mb-6 text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{obligation.intitule || obligation.title}</p>
              </div>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Statut</dt>
                  <dd className="mt-1.5"><StatusBadge status={statut} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Catégorie</dt>
                  <dd className="mt-1.5">
                    <Badge tone="info">
                      {obligation.categorie || obligation.category?.nom || '—'}
                    </Badge>
                  </dd>
                </div>
              </dl>
              <div className="my-5 border-t border-slate-100 dark:border-slate-700/50" />
              <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Date d'échéance</dt>
                  <dd className="mt-1.5 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CalendarIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    {formatDateFr(dateEcheance)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Créée le</dt>
                  <dd className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {formatDateFr(obligation.created_at)}
                  </dd>
                </div>
              </dl>
            </div>

            {obligation.description && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">Description</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {obligation.description}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                Documents
                {documents.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    {documents.length}
                  </span>
                )}
              </h2>

              <DocumentUploadSection
                uploadFiles={uploadFiles}
                uploadType={uploadType}
                uploading={uploading}
                onTypeChange={setUploadType}
                onFilesSelected={addUploadFiles}
                onRemoveFile={removeUploadFile}
                onUpload={handleUpload}
              />

              <DocumentsListSection
                documents={documents}
                uploadFilesCount={uploadFiles.length}
                isAdmin={isAdmin}
                onPreview={setPreviewDoc}
                onDownload={handleDownload}
                onDelete={setDeleteDoc}
              />
            </div>
          </div>

          <div className="order-1 space-y-6 sm:order-2 lg:order-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Statut</h2>
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${statutIconWrap(statut)}`}>
                  <InformationCircleIcon className={`h-7 w-7 ${statutIconColor(statut)}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{statusLabels[statut] || statut}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Échéance : {formatDateFr(dateEcheance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">Commentaire</h2>
              {obligation.commentaire ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {obligation.commentaire}
                </p>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Pas de commentaire</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ObligationModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        obligation={obligation}
        categories={categories}
        onSubmit={handleEdit}
      />

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer l'obligation"
        message={`Supprimer « ${obligation.intitule || obligation.title} » ?`}
        confirmLabel={deleting ? 'Suppression...' : 'Supprimer'}
        loading={deleting}
      />
      <FilePreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
      <ConfirmModal
        open={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleDeleteDocument}
        title="Supprimer le document"
        message={`Supprimer « ${deleteDoc?.nom_fichier} » ?`}
        confirmLabel="Supprimer"
      />
    </PageShell>
  )
}
