import {
  MessageSquarePlus,
  FileText,
  MessageCircle,
  FolderOpen,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

export default function Sidebar({
  user,
  sessions,
  activeSession,
  setActiveSession,
  createSession,
  view,
  setView,
  theme,
  toggleTheme,
  logout,
  sidebarOpen,
  setSidebarOpen,
}) {
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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>DocIntel AI</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
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

          {/* Nav */}
          <div className="px-3 space-y-1">
            <button
              onClick={() => setView('chat')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer`}
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer`}
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
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Recent Chats
            </p>
            {sessions.length === 0 && (
              <p className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
            )}
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm truncate transition-all cursor-pointer"
                style={{
                  backgroundColor: activeSession?.id === s.id ? 'var(--accent-light)' : 'transparent',
                  color: activeSession?.id === s.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: activeSession?.id === s.id ? 600 : 400,
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 px-3 py-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
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
