import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, DownloadIcon } from './icons'
import api from '../api/axios'
import ModalFrame from './ui/ModalFrame'
import { useToast } from '../context/ToastContext'

function isImage(filename) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename)
}

function isPdf(filename) {
  return /\.pdf$/i.test(filename)
}

function PreviewBody({ loading, error, blobUrl, name, onDownload }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600 dark:border-slate-700 dark:border-t-teal-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Impossible de charger l'aperçu.</p>
        <button type="button" onClick={onDownload}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 dark:bg-teal-600">
          <DownloadIcon className="h-4 w-4" /> Télécharger
        </button>
      </div>
    )
  }

  if (blobUrl && isImage(name)) {
    return <img src={blobUrl} alt={name} className="mx-auto max-h-[calc(90vh-4rem)] object-contain" />
  }

  if (blobUrl && isPdf(name)) {
    return <iframe src={blobUrl} title={name} className="h-[calc(90vh-4rem)] w-full rounded-lg border-0" />
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">Aperçu non disponible pour ce type de fichier.</p>
      <button type="button" onClick={onDownload}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 dark:bg-teal-600">
        <DownloadIcon className="h-4 w-4" /> Télécharger
      </button>
    </div>
  )
}

export default function FilePreviewModal({ open, onClose, document: doc }) {
  const { error: toastError } = useToast()
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const prevDocId = useRef(null)

  useEffect(() => {
    if (!open || !doc) {
      if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null) }
      prevDocId.current = null
      return
    }
    if (prevDocId.current === doc.id) return
    prevDocId.current = doc.id
    setError(false)
    setLoading(true)

    let cancelled = false
    api.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
      .then(res => {
        if (cancelled) return
        const type = res.headers['content-type'] || (isPdf(doc.nom_fichier) ? 'application/pdf' : 'image/jpeg')
        const blob = new Blob([res.data], { type })
        setBlobUrl(URL.createObjectURL(blob))
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [open, doc])

  useEffect(() => {
    if (!open && blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); prevDocId.current = null }
  }, [open])

  const name = doc?.nom_fichier || 'document'

  const handleDownload = async () => {
    if (!doc) return
    try {
      const res = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = name; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toastError(err.response?.status === 404 ? 'Fichier non trouvé.' : 'Erreur lors du téléchargement.')
    }
  }

  return (
    <ModalFrame
      open={open && Boolean(doc)}
      onClose={onClose}
      size="2xl"
      ariaLabel={name}
      panelClassName="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      {doc && (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-700/50">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{doc.type_document || 'Document'}</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-400">
                <DownloadIcon className="h-3.5 w-3.5" /> Télécharger
              </button>
              <button type="button" onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-50 p-1 dark:bg-slate-950">
            <PreviewBody
              loading={loading}
              error={error}
              blobUrl={blobUrl}
              name={name}
              onDownload={handleDownload}
            />
          </div>
        </>
      )}
    </ModalFrame>
  )
}
