import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth, homePathForUser } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import SetPassword from './pages/SetPassword'
import Dashboard from './pages/Dashboard'
import Obligations from './pages/Obligations'
import ObligationDetail from './pages/ObligationDetail'
import Entreprise from './pages/Entreprise'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Accueil from './pages/Accueil'
import AdminDashboard from './pages/AdminDashboard'
import AdminEntreprises from './pages/AdminEntreprises'
import AdminEntrepriseDetail from './pages/AdminEntrepriseDetail'
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'

function AuthLoadingScreen() {
  const { loadingLabel } = useAuth()
  return <LoadingScreen label={loadingLabel || 'Chargement…'} />
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicRoute() {
  const { user, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (user) return <Navigate to={homePathForUser(user)} replace />
  return <Outlet />
}

function TenantRoute() {
  const { user, loading, isSuperAdmin } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (isSuperAdmin) return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}

function AdminRoute() {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (!user || !isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function SuperAdminRoute() {
  const { user, loading, isSuperAdmin } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (!user || !isSuperAdmin) return <Navigate to={homePathForUser(user)} replace />
  return <Outlet />
}

function CatchAll() {
  const { user, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  return <Navigate to={user ? homePathForUser(user) : '/login'} replace />
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Accueil />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />

              <Route element={<SuperAdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/entreprises" element={<AdminEntreprises />} />
                <Route path="/admin/entreprises/new" element={<Navigate to="/admin/entreprises" replace />} />
                <Route path="/admin/entreprises/:id" element={<AdminEntrepriseDetail />} />
              </Route>

              <Route element={<TenantRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/obligations" element={<Obligations />} />
                <Route path="/obligations/:id" element={<ObligationDetail />} />
                <Route path="/entreprise" element={<Entreprise />} />
                <Route element={<AdminRoute />}>
                  <Route path="/users" element={<Users />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<CatchAll />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
