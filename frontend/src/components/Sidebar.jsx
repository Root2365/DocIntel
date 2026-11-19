import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquarePlus,
  FileText,
  MessageCircle,
  FolderOpen,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react'

export default function Sidebar({
  user,
  sessions,
  activeSession,
  setActiveSession,
  createSession,
  renameSession,
  deleteSession,
  view,
  setView,
  theme,
  toggleTheme,
  logout,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const editInputRef = useRef(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const startRename = (e, session) => {
    e.stopPropagation()
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const handleSaveRename = (e, sessionId) => {
    e?.stopPropagation()
    if (editTitle.trim()) {
      renameSession(sessionId, editTitle.trim())
    }
    setEditingId(null)
  }

  const handleCancelRename = (e) => {
    e?.stopPropagation()
    setEditingId(null)
  }

  const handleDelete = (e, sessionId) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      deleteSession(sessionId)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-40 h-full flex flex-col transition-all duration-300
          ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-72 lg:w-0 lg:-translate-x-72'}
        `}
        style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex-1 flex flex-col min-h-0 w-72">
          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <Link to="/" className="flex items-center gap-2.5 group" title="Return to Home">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                DocIntel AI
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              title="Close Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* New chat button */}
          <div className="p-3">
            <button
              onClick={() => createSession()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.01] cursor-pointer"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <MessageSquarePlus size={16} style={{ color: 'var(--accent)' }} />
              New Chat
            </button>
          </div>

          {/* Navigation links */}
          <div className="px-3 space-y-1">
            <button
              onClick={() => setView('chat')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer"
              style={{
                backgroundColor: view === 'chat' ? 'var(--accent-light)' : 'transparent',
                color: view === 'chat' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: view === 'chat' ? 600 : 400,
              }}
            >
              <MessageCircle size={16} />
              Chat
            </button>
            <button
              onClick={() => setView('documents')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer"
              style={{
                backgroundColor: view === 'documents' ? 'var(--accent-light)' : 'transparent',
                color: view === 'documents' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: view === 'documents' ? 600 : 400,
              }}
            >
              <FolderOpen size={16} />
              Documents
            </button>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Conversations
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {sessions.length}
              </span>
            </div>

            {sessions.length === 0 && (
              <p className="px-3 py-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                No chats yet. Start a new conversation!
              </p>
            )}

            {sessions.map((s) => {
              const isActive = activeSession?.id === s.id && view === 'chat'
              const isEditing = editingId === s.id

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (!isEditing) {
                      setActiveSession(s)
                      setView('chat')
                    }
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(e, s.id)
                          if (e.key === 'Escape') handleCancelRename(e)
                        }}
                        className="flex-1 bg-transparent border-b text-xs outline-none px-1 py-0.5"
                        style={{
                          borderColor: 'var(--accent)',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <button
                        onClick={(e) => handleSaveRename(e, s.id)}
                        className="p-1 hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--success)' }}
                        title="Save"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--text-muted)' }}
                        title="Cancel"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                        <MessageCircle size={14} className="shrink-0 opacity-60" />
                        <span className="truncate text-xs leading-normal">{s.title}</span>
                      </div>

                      {/* Action buttons (Rename & Delete) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => startRename(e, s)}
                          className="p-1 rounded-md hover:bg-neutral-800/20 transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Rename Chat"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, s.id)}
                          className="p-1 rounded-md hover:bg-red-500/10 transition-colors"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Chat"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 px-3 py-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.email}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {user?.role}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--danger)' }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
