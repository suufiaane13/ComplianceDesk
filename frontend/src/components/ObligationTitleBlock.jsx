export default function ObligationTitleBlock({ title, createdAt, comment = null, isNew = false, titleClassName = 'text-sm' }) {
  const createdLabel = createdAt ? new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <div className={`flex min-w-0 max-w-full flex-wrap items-baseline gap-x-1.5 ${titleClassName}`}>
          <span className="min-w-0 truncate font-semibold text-slate-900 dark:text-slate-100" title={title}>{title}</span>
          <span className="shrink-0 whitespace-nowrap text-slate-400 dark:text-slate-500" title={createdLabel !== '—' ? `Créée le ${createdLabel}` : undefined}>· {createdLabel}</span>
        </div>
        {isNew && <span className="inline-flex shrink-0 animate-fade-in rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-teal-600">Nouveau</span>}
      </div>
      {comment && <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500 dark:text-slate-400" title={comment}>{comment}</p>}
    </div>
  )
}
