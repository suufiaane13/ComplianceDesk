import { NavLink, Outlet } from 'react-router-dom'
import { useAuth, homePathForUser } from '../context/AuthContext'
import { usePageLoading } from '../context/PageLoadingContext'
import Footer from './Footer'
import MobileNav, { MobileMenuButton } from './MobileNav'
import NotificationDropdown from './NotificationDropdown'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'
import Logo, { logoHoverClassName } from './Logo'
import { getNavItems } from '../utils/nav'
import { useState } from 'react'

function NavItem({ to, label, Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          isActive
            ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20 dark:bg-teal-600 dark:shadow-teal-900/30'
            : 'text-slate-600 hover:bg-white/70 hover:text-teal-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal-400'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, isSuperAdmin } = useAuth()
  const { isPageLoading } = usePageLoading()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navItems = getNavItems(user)

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[linear-gradient(180deg,#faf9f7_0%,#f1f5f9_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink
            to={homePathForUser(user)}
            end
            className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <Logo className={`relative h-10 w-10 shrink-0 ${logoHoverClassName}`} />
            <div>
              <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">ComplianceDesk</p>
              <p className="hidden text-xs font-medium text-teal-700 dark:text-teal-400 sm:block">
                {isSuperAdmin ? 'Plateforme · Administration' : 'Maroc · Conformité PME'}
              </p>
            </div>
          </NavLink>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </nav>
            <ThemeToggle />
            <NotificationDropdown />
            <div className="hidden sm:block">
              <UserMenu />
            </div>
            <MobileMenuButton open={mobileNavOpen} onClick={() => setMobileNavOpen((v) => !v)} />
          </div>
        </div>
      </header>
      {mobileNavOpen && <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      {!isPageLoading && <Footer className="shrink-0" />}
    </div>
  )
}
