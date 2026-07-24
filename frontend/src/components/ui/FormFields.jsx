import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarIcon, ChevronDownIcon, PaperClipIcon } from '../icons'

function fieldBorderClasses(error) {
  return error ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
}

/** Shared trigger styles for custom select. */
export const selectFieldClassName = (error, size = 'md', open = false) => {
  const sizing = size === 'sm'
    ? 'py-1.5 pl-2.5 pr-8 text-xs'
    : 'py-2.5 pl-3.5 pr-10 text-sm'
  const openRing = open
    ? 'border-teal-500 ring-2 ring-teal-500/20 dark:border-teal-400 dark:ring-teal-400/30'
    : 'hover:border-slate-300 dark:hover:border-slate-600'
  return `select-field flex w-full cursor-pointer items-center appearance-none rounded-xl border bg-white text-left font-medium text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30 disabled:cursor-not-allowed disabled:opacity-50 ${sizing} ${fieldBorderClasses(error)} ${openRing}`
}

function SelectCaret({ size = 'md', open = false }) {
  const box = size === 'sm' ? 'h-5 w-5 right-1.5' : 'h-6 w-6 right-2'
  const icon = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition group-hover:text-slate-500 dark:text-slate-500 ${open ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' : ''} ${box}`}
    >
      <ChevronDownIcon className={`${icon} transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </span>
  )
}

function normalizeOptions(options, children) {
  if (options?.length) return options.map((opt) => ({ value: String(opt.value), label: opt.label }))
  const list = []
  const walk = (nodes) => {
    ;(Array.isArray(nodes) ? nodes : [nodes]).forEach((child) => {
      if (!child) return
      if (Array.isArray(child)) { walk(child); return }
      if (child.type === 'option' || child?.props?.value !== undefined) {
        list.push({
          value: String(child.props.value ?? ''),
          label: child.props.children,
          disabled: Boolean(child.props.disabled),
        })
      }
    })
  }
  if (children) walk(children)
  return list
}

export function Input({ label, id, error, className = '', type, ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  const isDate = type === 'date'
  const input = (
    <input id={inputId} type={type}
      className={`w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/30 dark:placeholder-slate-500 disabled:cursor-not-allowed disabled:opacity-50 ${fieldBorderClasses(error)} ${isDate ? 'date-input cursor-pointer pl-4 pr-10 hover:border-slate-300 dark:hover:border-slate-600' : 'px-4 placeholder:text-slate-400'}`}
      {...props} />
  )
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      {isDate ? (
        <div className="group relative">{input}<CalendarIcon aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600 dark:text-slate-500 dark:group-focus-within:text-teal-400" /></div>
      ) : input}
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export function Select({
  label,
  id,
  children,
  options,
  error,
  className = '',
  size = 'md',
  value,
  onChange,
  disabled = false,
  required = false,
  name,
  placeholder = 'Sélectionner…',
  ...props
}) {
  const autoId = useId()
  const selectId = id || autoId
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)
  const rootRef = useRef(null)
  const btnRef = useRef(null)
  const menuRef = useRef(null)
  const list = useMemo(() => normalizeOptions(options, children), [options, children])
  const current = list.find((o) => o.value === String(value ?? ''))
  const display = current?.label ?? placeholder

  const updateMenuPosition = () => {
    const el = btnRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gap = 6
    const maxH = 224 // max-h-56
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const spaceAbove = rect.top - gap
    const openUp = spaceBelow < Math.min(maxH, 160) && spaceAbove > spaceBelow
    const height = Math.min(maxH, openUp ? spaceAbove : spaceBelow, maxH)

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: Math.max(rect.width, 120),
      maxHeight: Math.max(height, 120),
      zIndex: 200,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    })
  }

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null)
      return undefined
    }
    updateMenuPosition()
    const onScrollOrResize = () => updateMenuPosition()
    window.addEventListener('resize', onScrollOrResize)
    // capture scroll on any scrollable ancestor (modals)
    window.addEventListener('scroll', onScrollOrResize, true)
    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      const t = e.target
      if (rootRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const pick = (opt) => {
    if (opt.disabled) return
    onChange?.({ target: { value: opt.value, name } })
    setOpen(false)
  }

  const onButtonKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
      return
    }
    // Ignore printable keys so browsers never "typeahead-select" into this control
    // while focus is on the trigger (or after a focus steal from a parent re-render).
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
    }
  }

  const menuSize = Math.min(Math.max(list.length || 1, 2), 8)
  const menu = open && menuStyle && createPortal(
    <select
      ref={menuRef}
      id={`${selectId}-listbox`}
      size={menuSize}
      aria-labelledby={selectId}
      value={String(value ?? '')}
      style={menuStyle}
      className="overflow-auto rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-lg ring-1 ring-slate-900/5 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:ring-white/5 [&_option]:rounded-lg [&_option]:px-3 [&_option]:py-2"
      onChange={(e) => {
        const opt = list.find((o) => o.value === e.target.value)
        if (opt) pick(opt)
      }}
    >
      {list.length === 0 ? (
        <option value="" disabled>Aucune option</option>
      ) : (
        list.map((opt) => (
          <option key={opt.value || '__empty'} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))
      )}
    </select>,
    document.body,
  )

  return (
    <div className={className} ref={rootRef}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <div className="group relative">
        <button
          ref={btnRef}
          type="button"
          id={selectId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${selectId}-listbox`}
          aria-required={required || undefined}
          className={selectFieldClassName(error, size, open)}
          {...props}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onButtonKeyDown}
        >
          <span className={`min-w-0 flex-1 truncate ${current ? '' : 'text-slate-400 dark:text-slate-500'}`}>
            {display}
          </span>
        </button>
        <SelectCaret size={size} open={open} />
      </div>
      {menu}
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export const FileInput = forwardRef(function FileInput({ label, id, error, className = '', disabled = false, file = null, onChange, accept, emptyLabel = 'Aucun fichier sélectionné', feedback = '' }, ref) {
  const autoId = useId()
  const inputId = id || autoId
  const displayText = file?.name ?? (feedback || emptyLabel)
  let textTone = 'text-slate-500 dark:text-slate-400'
  if (file) textTone = 'text-slate-900 dark:text-slate-100'
  else if (feedback) textTone = 'font-medium text-teal-700 dark:text-teal-400'
  const handleChange = (e) => { if (onChange) onChange(e.target.files?.[0] || null) }
  return (
    <div className={`min-w-0 ${className}`}>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="group relative">
        <label htmlFor={disabled ? undefined : inputId}
          className={`flex w-full min-w-0 min-h-[3rem] cursor-pointer items-center rounded-xl border bg-white py-3 pl-4 pr-10 text-sm shadow-sm transition hover:border-slate-300 focus-within:border-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-500/20 dark:bg-slate-900 dark:hover:border-slate-600 dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400/30 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${fieldBorderClasses(error)}`}
          title={displayText}>
          <span className={`min-w-0 flex-1 truncate ${textTone}`}>{displayText}</span>
        </label>
        <PaperClipIcon aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600 dark:text-slate-500 dark:group-focus-within:text-teal-400" />
        <input ref={ref} id={inputId} type="file" className="sr-only" disabled={disabled} accept={accept} onChange={handleChange} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

export function Textarea({ label, id, error, className = '', rows = 3, ...props }) {
  const autoId = useId()
  const textareaId = id || autoId
  return (
    <div className={className}>
      {label && <label htmlFor={textareaId} className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      <textarea id={textareaId} rows={rows}
        className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/30 ${error ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'}`}
        {...props} />
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
