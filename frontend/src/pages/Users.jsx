import { useState, useEffect } from 'react'
import api from '../api/axios'
import LoadingScreen from '../components/ui/LoadingScreen'
import PageShell from '../components/ui/PageShell'
import UserListPanel from '../components/UserListPanel'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Users() {
  const { isAdmin, user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data.data || res.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  if (loading) return <LoadingScreen />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {users.length} utilisateur{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        <UserListPanel
          users={users}
          currentUserId={user?.id}
          onCreate={async (payload) => {
            await api.post('/users', payload)
            await fetchUsers()
          }}
          onUpdate={async (id, payload) => {
            await api.put(`/users/${id}`, payload)
            await fetchUsers()
          }}
          onDelete={async (id) => {
            await api.delete(`/users/${id}`)
            await fetchUsers()
          }}
        />
      </div>
    </PageShell>
  )
}
