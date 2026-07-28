import { describe, expect, it } from 'vitest'
import { getNavItems } from './nav'

describe('getNavItems', () => {
  it('returns empty list without user', () => {
    expect(getNavItems(null)).toEqual([])
  })

  it('returns platform nav for super_admin', () => {
    const items = getNavItems({ role: 'super_admin' })
    expect(items.map((i) => i.to)).toEqual(['/admin/dashboard', '/admin/entreprises'])
  })

  it('hides users link for regular tenant user', () => {
    const items = getNavItems({ role: 'user' })
    expect(items.map((i) => i.to)).toEqual(['/dashboard', '/obligations'])
  })

  it('includes users link for tenant admin', () => {
    const items = getNavItems({ role: 'admin' })
    expect(items.map((i) => i.to)).toEqual(['/dashboard', '/obligations', '/users'])
  })
})
