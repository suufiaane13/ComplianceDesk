export const statusLabels = {
  a_jour: 'À jour',
  proche_echeance: 'Proche échéance',
  expiree: 'Expirée',
  renouvele: 'Renouvelée',
}

export const statusStyles = {
  a_jour: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-400/20',
  proche_echeance: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-400/20',
  expiree: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/20',
  renouvele: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-400 dark:ring-sky-400/20',
}

export const statusDotColors = {
  a_jour: 'bg-emerald-500 dark:bg-emerald-400',
  proche_echeance: 'bg-amber-500 dark:bg-amber-400',
  expiree: 'bg-red-500 dark:bg-red-400',
  renouvele: 'bg-sky-500 dark:bg-sky-400',
}

export const documentTypes = [
  { value: 'contrat', label: 'Contrat' },
  { value: 'attestation', label: 'Attestation' },
  { value: 'facture', label: 'Facture' },
  { value: 'certificat', label: 'Certificat' },
  { value: 'autre', label: 'Autre' },
]

export const documentTypeLabels = {
  contrat: 'Contrat',
  attestation: 'Attestation',
  facture: 'Facture',
  certificat: 'Certificat',
  autre: 'Autre',
}
