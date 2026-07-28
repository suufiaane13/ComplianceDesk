import { ChevronRightIcon, FolderIcon } from '../icons'

export default function DocsCountButton({ count, onClick, className = '', variant = 'default' }) {
  const docLabel = count === 1 ? 'document' : 'documents'
  const compact = variant === 'compact'
  return (
    <button type="button" onClick={onClick}
      className={`group inline-flex items-center border border-teal-200 bg-teal-50 font-semibold text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:border-teal-700 dark:hover:bg-teal-900/50 dark:focus-visible:outline-teal-500 ${compact ? 'gap-1 rounded-lg px-2 py-1 text-[11px]' : 'gap-2 rounded-xl px-3 py-2 text-xs'} ${className}`}>
      <span className={`flex shrink-0 items-center justify-center rounded-md bg-white text-teal-700 ring-1 ring-teal-100 transition group-hover:ring-teal-200 dark:bg-slate-900 dark:text-teal-400 dark:ring-teal-800 dark:group-hover:ring-teal-700 ${compact ? 'h-5 w-5' : 'h-7 w-7 rounded-lg'}`}>
        <FolderIcon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </span>
      {compact ? (
        <><span className="tabular-nums">{count}</span><span className="inline-flex items-center gap-0.5 font-bold uppercase tracking-wide text-teal-600 dark:text-teal-400">Voir<ChevronRightIcon className="h-3 w-3 transition group-hover:translate-x-0.5" /></span></>
      ) : (
        <><span className="whitespace-nowrap"><span className="tabular-nums">{count}</span> {docLabel}</span><span className="inline-flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wide text-teal-600 dark:text-teal-400">Voir<ChevronRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></>
      )}
    </button>
  )
}
