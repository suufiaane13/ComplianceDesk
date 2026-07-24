export function getDocumentsCount(obligation) {
  return obligation?.documents_count ?? obligation?.documents?.length ?? 0
}

export function getObligationComment(obligation) {
  return obligation?.comment ?? obligation?.description ?? null
}

export function canRenewObligation(obligation) {
  return obligation?.statut === 'expiree'
}
