import { CheckIcon, ClipboardIcon, PaperClipIcon } from '../icons'

const defaultSteps = [
  { id: 1, label: 'Informations', Icon: ClipboardIcon },
  { id: 2, label: 'Document', Icon: PaperClipIcon },
]

function stepCircleClass(done, active) {
  if (done) {
    return 'border-teal-700 bg-teal-700 text-white shadow-sm shadow-teal-900/20 dark:border-teal-500 dark:bg-teal-500 dark:shadow-teal-900/50'
  }
  if (active) {
    return 'border-teal-700 bg-teal-700 text-white shadow-md shadow-teal-900/25 ring-4 ring-teal-100 dark:border-teal-400 dark:bg-teal-500 dark:shadow-teal-900/50 dark:ring-teal-900/50'
  }
  return 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
}

function stepCaptionClass(active, done) {
  if (active) return 'text-teal-700 dark:text-teal-400'
  if (done) return 'text-teal-600 dark:text-teal-500'
  return 'text-slate-400 dark:text-slate-500'
}

function stepLabelClass(active, done) {
  if (active) return 'text-slate-900 dark:text-slate-100'
  if (done) return 'text-slate-700 dark:text-slate-300'
  return 'text-slate-400 dark:text-slate-500'
}

function stepBarClass(done, active) {
  if (done) return 'w-full bg-teal-600 dark:bg-teal-500'
  if (active) return 'w-1/2 bg-teal-300 dark:bg-teal-500'
  return 'w-0 bg-teal-600 dark:bg-teal-500'
}

export default function StepIndicator({ currentStep, steps = defaultSteps }) {
  return (
    <nav aria-label="Étapes du formulaire" className="mb-6">
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const done = currentStep > step.id
          const active = currentStep === step.id
          const Icon = step.Icon
          const isLast = index === steps.length - 1
          return (
            <li key={step.id} className={`flex items-start ${isLast ? 'shrink-0' : 'flex-1'}`}>
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${stepCircleClass(done, active)}`}>
                  {done ? <CheckIcon className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="mt-2.5 text-center">
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${stepCaptionClass(active, done)}`}>Étape {step.id}</p>
                  <p className={`mt-0.5 text-sm font-semibold leading-tight ${stepLabelClass(active, done)}`}>{step.label}</p>
                </div>
              </div>
              {!isLast && (
                <div className="mx-3 mt-5 h-0.5 min-w-[2rem] flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className={`h-full rounded-full transition-all duration-300 ${stepBarClass(done, active)}`} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
