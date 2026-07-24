import { AlertTriangleIcon, CheckCircleIcon, InformationCircleIcon, XMarkIcon } from '../icons'

const styles = {
  success: { wrap: 'border-emerald-200/80 bg-white ring-emerald-500/10 dark:border-emerald-800 dark:bg-slate-900 dark:ring-emerald-400/20', icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', Icon: CheckCircleIcon },
  error: { wrap: 'border-red-200/80 bg-white ring-red-500/10 dark:border-red-800 dark:bg-slate-900 dark:ring-red-400/20', icon: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', Icon: AlertTriangleIcon },
  warning: { wrap: 'border-amber-200/80 bg-white ring-amber-500/10 dark:border-amber-800 dark:bg-slate-900 dark:ring-amber-400/20', icon: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', Icon: AlertTriangleIcon },
  info: { wrap: 'border-teal-200/80 bg-white ring-teal-500/10 dark:border-teal-800 dark:bg-slate-900 dark:ring-teal-400/20', icon: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', Icon: InformationCircleIcon },
}

function ToastItem({ toast, onDismiss }) {
  const config = styles[toast.type] ?? styles.info
  const Icon = config.Icon
  return (
    <div role="alert" className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lg shadow-slate-900/10 ring-1 dark:shadow-black/20 sm:w-[22rem] ${config.wrap}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.icon}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="min-w-0 flex-1 pt-1.5 text-sm font-medium leading-snug text-slate-800 dark:text-slate-200">{toast.message}</p>
      <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Fermer la notification" className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:right-4 sm:items-end sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
