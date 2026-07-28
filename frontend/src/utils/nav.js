import { BuildingOfficeIcon, ClipboardIcon, DashboardIcon, UserIcon } from '../components/icons'

export function getNavItems(user) {
  if (!user) return []

  if (user.role === 'super_admin') {
    return [
      { to: '/admin/dashboard', label: 'Tableau de bord', end: true, Icon: DashboardIcon },
      { to: '/admin/entreprises', label: 'Entreprises', Icon: BuildingOfficeIcon },
    ]
  }

  return [
    { to: '/dashboard', label: 'Tableau de bord', end: true, Icon: DashboardIcon },
    { to: '/obligations', label: 'Obligations', Icon: ClipboardIcon },
    ...(user.role === 'admin' ? [{ to: '/users', label: 'Utilisateurs', Icon: UserIcon }] : []),
  ]
}
