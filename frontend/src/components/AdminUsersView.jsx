import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, Users, RefreshCw, Shield, UserRound, FileText, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function AdminUsersView() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.data || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    api.get('/admin/users')
      .then((response) => {
        if (active) setUsers(response.data.data || [])
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load users.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const loadDocuments = async () => {
    setDocumentsLoading(true)
    setDocumentsError('')
    try {
      const response = await api.get('/pdf/admin/all')
      setDocuments(response.data.data || [])
    } catch (requestError) {
      setDocumentsError(requestError.response?.data?.message || 'Unable to load documents.')
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    api.get('/pdf/admin/all')
      .then((response) => {
        if (active) setDocuments(response.data.data || [])
      })
      .catch((requestError) => {
        if (active) {
          setDocumentsError(requestError.response?.data?.message || 'Unable to load documents.')
        }
      })
      .finally(() => {
        if (active) setDocumentsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const downloadDocument = async (item) => {
    setDownloadingId(item.id)
    try {
      const response = await api.get(`/pdf/${item.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = item.fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error(`Unable to download ${item.fileName}.`)
    } finally {
      setDownloadingId(null)
    }
  }

  const changeRole = async (target) => {
    const role = target.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const action = role === 'ADMIN' ? 'grant administrator access to' : 'remove administrator access from'
    if (!window.confirm(`Are you sure you want to ${action} ${target.email}?`)) return

    setUpdatingId(target.id)
    try {
      const response = await api.patch(`/admin/users/${target.id}/role`, { role })
      const updatedUser = response.data.data
      setUsers((current) => current.map((item) => item.id === target.id ? updatedUser : item))
      toast.success(`Updated ${target.email} to ${role}`)
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Unable to update user role.')
    } finally {
      setUpdatingId(null)
    }
  }

  const administratorCount = users.filter((item) => item.role === 'ADMIN').length

  return (
    <section className="flex-1 overflow-y-auto p-5 sm:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User management</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              View registered accounts and manage administrator access.
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Newly promoted users need to sign in again before admin access becomes active.
            </p>
          </div>
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <StatCard icon={Users} label="Registered users" value={users.length} />
          <StatCard icon={Shield} label="Administrators" value={administratorCount} />
        </div>

        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
              <button type="button" onClick={loadUsers} className="mt-3 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading users…</div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users are registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => {
                    const isCurrentUser = String(item.id) === String(currentUser?.id)
                    const isAdmin = item.role === 'ADMIN'
                    const disabled = isCurrentUser || item.protectedAdmin || updatingId !== null

                    return (
                      <tr key={item.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-5 py-4">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                          <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{item.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{
                              backgroundColor: isAdmin ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                              color: isAdmin ? 'var(--accent)' : 'var(--text-secondary)',
                            }}
                          >
                            {isAdmin ? <Shield size={12} /> : <UserRound size={12} />}
                            {isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => changeRole(item)}
                            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45"
                            style={{
                              borderColor: 'var(--border)',
                              color: isAdmin ? 'var(--danger)' : 'var(--accent)',
                              backgroundColor: 'var(--bg-primary)',
                            }}
                            title={isCurrentUser ? 'You cannot change your own role' : item.protectedAdmin ? 'Bootstrap administrator is protected' : undefined}
                          >
                            {updatingId === item.id ? 'Saving…' : isCurrentUser ? 'You' : isAdmin ? 'Remove admin' : 'Make admin'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-9 mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              <FileText size={19} style={{ color: 'var(--accent)' }} />
              All uploaded PDFs
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Download documents from any user account.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDocuments}
            disabled={documentsLoading}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            <RefreshCw size={15} className={documentsLoading ? 'animate-spin' : ''} />
            Refresh PDFs
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          {documentsError ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{documentsError}</p>
              <button type="button" onClick={loadDocuments} className="mt-3 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                Try again
              </button>
            </div>
          ) : documentsLoading ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading PDFs…</div>
          ) : documents.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No PDFs have been uploaded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    <th className="px-5 py-3 font-semibold">Document</th>
                    <th className="px-5 py-3 font-semibold">Uploaded by</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Uploaded</th>
                    <th className="px-5 py-3 text-right font-semibold">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((item) => (
                    <tr key={item.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                          <FileText size={15} className="shrink-0" style={{ color: 'var(--accent)' }} />
                          <span className="max-w-[260px] truncate" title={item.fileName}>{item.fileName}</span>
                        </div>
                        <div className="mt-1 pl-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatFileSize(item.fileSize)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.ownerName}</div>
                        <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{item.ownerEmail}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={documentStatusStyle(item.status)}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={downloadingId !== null}
                          onClick={() => downloadDocument(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ borderColor: 'var(--border)', color: 'var(--accent)', backgroundColor: 'var(--bg-primary)' }}
                        >
                          <Download size={13} />
                          {downloadingId === item.id ? 'Downloading…' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function documentStatusStyle(status) {
  if (status === 'READY') {
    return { backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--success)' }
  }
  if (status === 'FAILED') {
    return { backgroundColor: 'rgba(248, 113, 113, 0.15)', color: 'var(--danger)' }
  }
  return { backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}
