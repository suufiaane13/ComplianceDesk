import { ChevronLeftIcon, ChevronRightIcon } from '../icons'

export function Pagination({ page, lastPage, total, from, to, onPageChange }) {
  if (!total || lastPage <= 1) return null

  const getPages = () => {
    const pages = []
    const delta = 1
    const left = Math.max(2, page - delta)
    const right = Math.min(lastPage - 1, page + delta)

    pages.push(1)
    if (left > 2) pages.push('ellipsis-start')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < lastPage - 1) pages.push('ellipsis-end')
    if (lastPage > 1) pages.push(lastPage)

    return pages
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700/50 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Affichage <span className="font-semibold text-slate-700 dark:text-slate-300">{from}–{to}</span> sur <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-400 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-400"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Préc.</span>
        </button>
        {getPages().map((p) => {
          if (typeof p === 'string') {
            return (
              <span key={p} className="px-1 text-sm text-slate-300 dark:text-slate-600">…</span>
            )
          }
          return (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p)}
              className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-xs font-bold transition ${
                p === page
                  ? 'bg-teal-700 text-white shadow-sm shadow-teal-200 dark:bg-teal-600 dark:shadow-teal-900/50'
                  : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-400'
              }`}
            >
              {p}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-400"
        >
          <span className="hidden sm:inline">Suiv.</span>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => onChange('table')}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
          mode === 'table' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Tableau
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
          mode === 'grid' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
        </svg>
        Grille
      </button>
    </div>
  )
}
