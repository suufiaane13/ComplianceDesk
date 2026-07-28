import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-[56rem]',
}

function getFocusable(container) {
  if (!container) return []
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')
}

/**
 * Full-viewport modal shell: native <dialog> + portal so backdrop covers the page.
 */
export default function ModalFrame({
  open,
  onClose,
  children,
  size = 'md',
  panelClassName = '',
  zIndexClass = 'z-[100]',
  ariaLabel = 'Dialogue',
  ariaLabelledBy,
}) {
  const dialogRef = useRef(null)
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    if (open) {
      previousFocusRef.current = document.activeElement
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
    return undefined
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFirst = () => {
      const focusable = getFocusable(panelRef.current)
      const firstField = focusable.find((el) => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
      ;(firstField || focusable[0] || panelRef.current)?.focus?.()
    }
    const timer = window.setTimeout(focusFirst, 0)

    const handleKey = (event) => {
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = getFocusable(panelRef.current)
      if (focusable.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
      previousFocusRef.current?.focus?.()
    }
  }, [open])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`${zIndexClass} fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none border-0 bg-transparent p-0 open:flex open:items-end open:justify-center open:p-4 sm:open:items-center [&::backdrop]:bg-slate-900/55 [&::backdrop]:backdrop-blur-md dark:[&::backdrop]:bg-black/70`}
      onCancel={(event) => {
        event.preventDefault()
        onCloseRef.current?.()
      }}
    >
      <button
        type="button"
        aria-label="Fermer"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
        onClick={() => onCloseRef.current?.()}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative z-10 w-full animate-slide-up outline-none ${sizes[size] || sizes.md} ${panelClassName}`}
      >
        {children}
      </div>
    </dialog>,
    document.body,
  )
}
