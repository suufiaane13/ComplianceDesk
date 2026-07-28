import { statusLabels, statusStyles, statusDotColors } from '../../constants/labels'

export default function StatusBadge({ status, className = '' }) {
  const dotColor = statusDotColors[status] || 'bg-slate-400'
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status] ?? 'bg-slate-100 text-slate-700 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20'} ${className}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {statusLabels[status] ?? status}
    </span>
  )
}
