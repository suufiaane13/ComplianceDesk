import { useMemo, useState } from 'react'
import Button from './ui/Button'
import Badge from './ui/Badge'
import { Input, Select } from './ui/FormFields'
import Modal, { ConfirmModal } from './ui/Modal'
import { ViewToggle } from './ui/DataTable'
import SearchFilterBar from './SearchFilterBar'
import { ShieldCheckIcon, UserIcon, PlusIcon, TrashIcon, PencilIcon, ClipboardIcon } from './icons'

export const USER_ROLES = [
  { value: 'user', label: 'Utilisateur', Icon: UserIcon, description: 'Peut consulter et téléverser des documents' },
  { value: 'admin', label: 'Administrateur', Icon: ShieldCheckIcon, description: 'Gestion complète des obligations, documents et utilisateurs' },
]

const ROLE_FILTERS = [
  { value: '', label: 'Tous', Icon: ClipboardIcon },
  { value: 'admin', label: 'Administrateur', Icon: ShieldCheckIcon },
  { value: 'user', label: 'Utilisateur', Icon: UserIcon },
]

const emptyUser = { nom: '', prenom: '', email: '', password: '', role: 'user' }

export default function UserListPanel({
  users = [],
  onCreate,
  onUpdate,
  onDelete,
  title = 'Tous les utilisateurs',
  subtitle,
  addLabel = 'Nouvel utilisateur',
  currentUserId = null,
  entrepriseName = null,
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [viewMode, setViewMode] = useState('table')
  const [error, setError] = useState('')
  const [newUser, setNewUser] = useState(emptyUser)
  const [editForm, setEditForm] = useState({ ...emptyUser, password: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false
      if (!q) return true
      const fullName = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase()
      return (
        fullName.includes(q)
        || (u.email || '').toLowerCase().includes(q)
        || (u.nom || '').toLowerCase().includes(q)
        || (u.prenom || '').toLowerCase().includes(q)
      )
    })
  }, [users, search, roleFilter])

  const getRoleBadge = (role) => role === 'admin'
    ? <Badge tone="info" className="bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-400/20">Administrateur</Badge>
    : <Badge tone="neutral">Utilisateur</Badge>

  const openEdit = (u) => {
    setEditForm({ nom: u.nom, prenom: u.prenom, email: u.email, role: u.role, password: '' })
    setShowEdit(u)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onCreate?.(newUser)
      setShowAdd(false)
      setNewUser(emptyUser)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...editForm }
      if (!payload.password) delete payload.password
      await onUpdate?.(showEdit.id, payload)
      setShowEdit(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la modification.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    setError('')
    try {
      await onDelete?.(showDelete.id)
      setShowDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression.')
    } finally {
      setSaving(false)
    }
  }

  const canDelete = (u) => !currentUserId || u.id !== currentUserId

  const panelTitle = entrepriseName ? `Utilisateurs — ${entrepriseName}` : title
  let panelSubtitle = subtitle
  if (!panelSubtitle) {
    panelSubtitle = entrepriseName
      ? `${users.length} membre${users.length !== 1 ? 's' : ''} rattaché${users.length !== 1 ? 's' : ''} à cette entreprise`
      : `${users.length} membre${users.length !== 1 ? 's' : ''} dans l'équipe`
  }

  let usersBody
  if (filtered.length === 0) {
    usersBody = (
      <div className="px-6 py-12 text-center">
        <UserIcon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Aucun utilisateur trouvé</p>
      </div>
    )
  } else if (viewMode === 'table') {
    usersBody = (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/50">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Utilisateur</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rôle</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((u) => (
              <tr key={u.id} className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/70">
                <td className="whitespace-nowrap px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-xs font-extrabold text-white shadow-sm shadow-teal-200/50 dark:shadow-teal-900/40">
                      {u.prenom?.[0]}{u.nom?.[0]}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{u.prenom} {u.nom}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                <td className="px-6 py-3.5">{getRoleBadge(u.role)}</td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button type="button" onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {canDelete(u) && (
                      <button type="button" onClick={() => setShowDelete(u)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  } else {
    usersBody = (
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <div key={u.id} className="group relative rounded-xl border border-slate-100 bg-white p-4 transition hover:border-teal-200 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-teal-700 dark:hover:bg-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-sm font-extrabold text-white shadow-sm shadow-teal-200/50 dark:shadow-teal-900/40">
                {u.prenom?.[0]}{u.nom?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{u.prenom} {u.nom}</p>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {u.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-0.5">
              <button type="button" onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200">
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
              {canDelete(u) && (
                <button type="button" onClick={() => setShowDelete(u)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/30 dark:hover:text-red-400">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div id="utilisateurs" className="space-y-4 scroll-mt-6">
      {entrepriseName && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white px-4 py-3 dark:border-teal-800/50 dark:from-teal-950/40 dark:to-slate-900">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-xs font-extrabold text-white shadow-sm shadow-teal-200/50 dark:shadow-teal-900/40">
            {entrepriseName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'E'}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700/80 dark:text-teal-300/80">
              Entreprise concernée
            </p>
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{entrepriseName}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{panelTitle}</h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            {panelSubtitle}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <PlusIcon className="h-4 w-4" /> {addLabel}
        </Button>
      </div>

      <SearchFilterBar
        title="Filtrer les utilisateurs"
        subtitle="Affinez la liste par rôle ou recherche"
        Icon={UserIcon}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ex: nom, prénom, email…"
        filters={ROLE_FILTERS}
        filterValue={roleFilter}
        onFilterChange={setRoleFilter}
        total={filtered.length}
        filtersLabel="Par rôle"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{panelTitle}</h3>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {filtered.length} membre{filtered.length !== 1 ? 's' : ''}
              {entrepriseName ? ` · ${entrepriseName}` : ''}
            </p>
          </div>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>

        {usersBody}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nouvel utilisateur">
        <form onSubmit={handleAdd} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom" name="add_nom" required placeholder="Ex: Benali" value={newUser.nom} onChange={(e) => setNewUser((prev) => ({ ...prev, nom: e.target.value }))} />
            <Input label="Prénom" name="add_prenom" required placeholder="Ex: Sara" value={newUser.prenom} onChange={(e) => setNewUser((prev) => ({ ...prev, prenom: e.target.value }))} />
          </div>
          <Input label="Email" name="add_email" type="email" required autoComplete="off" placeholder="sara.benali@entreprise.ma" value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} />
          <Input label="Mot de passe" name="add_password" type="password" required autoComplete="new-password" placeholder="Minimum 8 caractères" value={newUser.password} onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))} />
          <Select label="Rôle" name="add_role" required value={newUser.role} onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))} options={USER_ROLES.map((r) => ({ value: r.value, label: r.label }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAdd(false)} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Création...' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Modifier l'utilisateur">
        {showEdit && (
          <form onSubmit={handleEdit} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nom" name="edit_nom" required placeholder="Ex: Benali" value={editForm.nom} onChange={(e) => setEditForm((prev) => ({ ...prev, nom: e.target.value }))} />
              <Input label="Prénom" name="edit_prenom" required placeholder="Ex: Sara" value={editForm.prenom} onChange={(e) => setEditForm((prev) => ({ ...prev, prenom: e.target.value }))} />
            </div>
            <Input label="Email" name="edit_email" type="email" required autoComplete="off" placeholder="sara.benali@entreprise.ma" value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />
            <Select label="Rôle" name="edit_role" required value={editForm.role} onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))} options={USER_ROLES.map((r) => ({ value: r.value, label: r.label }))} />
            <Input label="Nouveau mot de passe" name="edit_password" type="password" autoComplete="new-password" placeholder="Laisser vide pour conserver le mot de passe actuel" value={editForm.password} onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))} />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowEdit(null)} className="flex-1">Annuler</Button>
              <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Supprimer ${showDelete?.prenom} ${showDelete?.nom} ?`}
        confirmLabel={saving ? 'Suppression...' : 'Supprimer'}
        loading={saving}
      />
    </div>
  )
}
