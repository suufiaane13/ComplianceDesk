import { formatDateFr } from '../../utils/date'
import StatusBadge from '../ui/StatusBadge'
import ObligationTitleBlock from '../ObligationTitleBlock'
import DocsCountButton from '../ui/DocsCountButton'
import { getDocumentsCount, getObligationComment } from '../../utils/obligation'

export default function ObligationMobileCard({ obligation, isNew = false, showDocs = false, showComment = true, onDocsClick, actions }) {
  const comment = getObligationComment(obligation)
  return (
    <div className={`px-4 py-4 ${isNew ? 'bg-teal-50/90 ring-1 ring-inset ring-teal-200 dark:bg-teal-900/20 dark:ring-teal-700' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ObligationTitleBlock title={obligation.intitule || obligation.title} createdAt={obligation.created_at} comment={showComment ? comment : null} isNew={isNew} />
        </div>
        <StatusBadge status={obligation.statut || obligation.status} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Catégorie</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{obligation.categorie || obligation.category?.name || '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Échéance</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateFr(obligation.date_echeance || obligation.due_date)}</p>
        </div>
      </div>
      {showDocs && (
        <div className="mt-3">
          <DocsCountButton variant="compact" count={getDocumentsCount(obligation)} onClick={onDocsClick} />
        </div>
      )}
      {actions && <div className="mt-3 flex justify-end gap-2">{actions}</div>}
    </div>
  )
}
