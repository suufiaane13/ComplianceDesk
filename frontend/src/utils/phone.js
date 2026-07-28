/** Digits only; +212… → 0… */
export function normalizeMoroccanPhone(value) {
  if (value == null || value === '') return ''
  let digits = String(value).replace(/\D+/g, '')
  if (digits.startsWith('212')) digits = `0${digits.slice(3)}`
  return digits
}

/** Empty is valid (optional field). Otherwise Moroccan mobile/fixe 0[5-7]XXXXXXXX. */
export function isValidMoroccanPhone(value) {
  if (value == null || String(value).trim() === '') return true
  return /^0[5-7]\d{8}$/.test(normalizeMoroccanPhone(value))
}

export const PHONE_HINT = 'Format marocain : 0522 00 00 00 ou +212 522 00 00 00'
export const PHONE_ERROR = 'Indiquez un numéro marocain valide (ex. 0522 00 00 00).'
