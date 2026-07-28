import { useEffect } from 'react'
import { usePageLoading } from '../../context/PageLoadingContext'
import Logo from '../Logo'

export default function LoadingScreen({ label = 'Chargement…' }) {
  const { startLoading, stopLoading } = usePageLoading()

  useEffect(() => {
    startLoading()
    return () => stopLoading()
  }, [startLoading, stopLoading])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[linear-gradient(180deg,#faf9f7_0%,#f1f5f9_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <Logo className="h-14 w-14 sm:h-16 sm:w-16" alt="ComplianceDesk" />
          <div className="text-center">
            <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              ComplianceDesk
            </p>
            <p className="mt-0.5 text-xs font-medium text-teal-700 dark:text-teal-400 sm:text-sm">
              Maroc · Conformité PME
            </p>
          </div>
        </div>

        <div className="flex w-44 flex-col items-center gap-3 sm:w-52">
          <div className="loading-track h-[3px] w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="loading-bar h-full w-2/5 rounded-full bg-teal-600 dark:bg-teal-400" />
          </div>
          <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}
