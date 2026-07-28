import { BuildingOfficeIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, DocumentTextIcon } from './icons'
import Badge from './ui/Badge'

export default function EntrepriseHeaderCard({ entreprise, badge, actions }) {
  if (!entreprise) return null

  const fields = [
    { Icon: MapPinIcon, label: 'Adresse', value: entreprise.adresse || '—' },
    { Icon: PhoneIcon, label: 'Téléphone', value: entreprise.telephone || '—' },
    { Icon: EnvelopeIcon, label: 'Email', value: entreprise.email || '—' },
    { Icon: DocumentTextIcon, label: 'Secteur', value: entreprise.secteur_activite || '—' },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <BuildingOfficeIcon className="h-7 w-7" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white">{entreprise.raison_sociale || 'Entreprise'}</h2>
                {badge}
                {!badge && entreprise.statut && (
                  entreprise.statut === 'active'
                    ? <Badge tone="success" className="bg-white/20 text-white ring-white/30">Activée</Badge>
                    : <Badge tone="danger" className="bg-white/20 text-white ring-white/30">Suspendue</Badge>
                )}
              </div>
              <p className="text-sm text-teal-100">{entreprise.secteur_activite || '—'}</p>
            </div>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>

      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map(({ Icon, label, value }, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-6 py-4 ${i < 3 ? 'border-b border-slate-100 sm:border-b-0 sm:border-r dark:border-slate-700/50' : ''}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
