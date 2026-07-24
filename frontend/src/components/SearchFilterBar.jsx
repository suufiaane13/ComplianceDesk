import { SearchIcon } from './icons'

function FilterChip({ filter, active, onSelect }) {
  const Icon = filter.Icon
  return (
    <button
      type="button"
      onClick={() => onSelect(filter.value)}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
        active
          ? 'bg-teal-700 text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/20 dark:bg-teal-600 dark:shadow-teal-900/30'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:bg-teal-900/20 dark:hover:text-teal-400'
      }`}
    >
      {Icon && <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'}`} />}
      {filter.label}
    </button>
  )
}

export default function SearchFilterBar({
  title = 'Filtrer',
  subtitle = 'Affinez la liste',
  Icon,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher…',
  filters = [],
  filterValue = '',
  onFilterChange,
  total = 0,
  filtersLabel = 'Statut',
}) {
  const isFiltered = Boolean(search) || Boolean(filterValue)
  const HeaderIcon = Icon

  return (
    <section
      aria-label={title}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-700/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          {HeaderIcon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-900/20 dark:bg-teal-600">
              <HeaderIcon className="h-5 w-5" />
            </span>
          )}
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          {isFiltered && (
            <button
              type="button"
              onClick={() => { onFilterChange?.(''); onSearchChange?.('') }}
              className="text-sm font-semibold text-teal-700 transition hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Réinitialiser
            </button>
          )}
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <span className="tabular-nums text-slate-900 dark:text-slate-200">{total}</span> résultat{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/30"
          />
        </div>
        {filters.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{filtersLabel}</p>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <FilterChip
                  key={filter.value || 'all'}
                  filter={filter}
                  active={filterValue === filter.value}
                  onSelect={onFilterChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
