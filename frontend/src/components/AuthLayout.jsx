import { ShieldCheckIcon, CalendarIcon, DocumentIcon } from './icons'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const features = [
  { Icon: ShieldCheckIcon, text: 'CNSS, assurances, médecine du travail' },
  { Icon: CalendarIcon, text: "Tableau de bord et alertes d'échéance" },
  { Icon: DocumentIcon, text: 'Gestion documentaire centralisée' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid h-dvh max-h-dvh overflow-hidden bg-[#faf9f7] dark:bg-slate-950 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-teal-50 via-teal-100/80 to-slate-100 transition-colors duration-200 dark:from-teal-900 dark:via-teal-800 dark:to-slate-900 lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-8 xl:px-14">
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-teal-300 blur-3xl dark:bg-teal-400" />
          <div className="absolute -right-10 bottom-1/4 h-80 w-80 rounded-full bg-emerald-200 blur-3xl dark:bg-emerald-300" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-200/60 blur-3xl dark:bg-teal-500/40" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="flex flex-col items-center gap-3">
            <Logo className="h-14 w-14 dark:hidden" />
            <Logo variant="footer" className="hidden h-14 w-14 dark:block" />
            <span className="text-xs font-semibold tracking-[0.2em] text-teal-700 uppercase dark:text-teal-300/90">
              ComplianceDesk
            </span>
          </div>

          <h1 className="mt-8 text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white xl:text-[2.5rem]">
            Gérez vos{' '}
            <span className="text-teal-700 dark:text-teal-300">obligations</span>
            <br />
            en toute simplicité.
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-teal-100/75 xl:text-[0.95rem]">
            Centralisez vos obligations réglementaires, suivez vos échéances et pilotez la conformité de votre PME.
          </p>

          <div className="mt-8 h-px w-16 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent dark:via-teal-300/50" />

          <ul className="mt-8 w-full space-y-3 text-left">
            {features.map(({ Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-teal-200/80 bg-white/70 px-3.5 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 ring-1 ring-teal-200/80 dark:bg-teal-400/15 dark:ring-teal-300/20">
                  <Icon className="h-4 w-4 text-teal-700 dark:text-teal-200" />
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-teal-50/95">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative flex h-full items-center justify-center overflow-hidden px-4 py-4 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="lg:hidden">
              <Logo className="h-10 w-10 shrink-0 dark:hidden" />
              <Logo variant="footer" className="hidden h-10 w-10 shrink-0 dark:block" />
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 sm:p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
            <div className="mt-4">{children}</div>
            {footer && <div className="mt-4 border-t border-slate-100 pt-3 text-center text-sm text-slate-600 dark:border-slate-700/50 dark:text-slate-400">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
