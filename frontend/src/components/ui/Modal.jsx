import { useId } from 'react'
import { AlertTriangleIcon, XMarkIcon } from '../icons'
import Button from './Button'
import ModalFrame from './ModalFrame'

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const titleId = useId()
  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      size={size}
      panelClassName="flex max-h-[min(92dvh,640px)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
    >
      <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-700/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      {footer && (
        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-800/80">
          {footer}
        </div>
      )}
    </ModalFrame>
  )
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  loading = false,
  variant = 'danger',
  detail = 'Cette action est irréversible.',
}) {
  const isDanger = variant === 'danger'
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Traitement...' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-800/80">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDanger ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
          <AlertTriangleIcon className="h-5 w-5" />
        </span>
        <p className="pt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{detail}</p>
      </div>
    </Modal>
  )
}
