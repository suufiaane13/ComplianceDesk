const variants = {
  primary:
    'bg-teal-700 text-white shadow-sm shadow-teal-900/20 hover:bg-teal-800 focus-visible:ring-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus-visible:ring-teal-400',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500',
  danger:
    'border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-400 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/30 dark:focus-visible:ring-red-400/50',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500',
  soft: 'bg-teal-50 text-teal-800 hover:bg-teal-100 focus-visible:ring-teal-500 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50 dark:focus-visible:ring-teal-400/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold',
  md: 'px-4 py-2.5 text-sm font-semibold',
  lg: 'px-5 py-3 text-sm font-semibold',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
