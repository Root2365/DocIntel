import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import ChatView from '../components/ChatView'
import DocumentsView from '../components/DocumentsView'
import AdminUsersView from '../components/AdminUsersView'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState('chat') // 'chat' | 'documents'
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedDocs, setSelectedDocs] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadSessions()
    loadDocuments()
  }, [])

  const loadSessions = async () => {
    try {
      const res = await api.get('/chat/sessions')
      const fetched = res.data.data || []
      setSessions(fetched)
      if (fetched.length > 0 && !activeSession) {
        // Do not auto-force active session if user wants a clean new chat
      }
    } catch {
      setSessions([])
    }
  }

  const loadDocuments = async () => {
    try {
      const res = await api.get('/pdf')
      setDocuments(res.data.data || [])
    } catch {
      setDocuments([])
    }
  }

  const createSession = async (title) => {
    try {
      const res = await api.post('/chat/sessions', { title: title || 'New Chat' })
      const newSession = res.data.data
      setSessions((prev) => [newSession, ...prev])
      setActiveSession(newSession)
      setView('chat')
      return newSession
    } catch {
      toast.error('Failed to create new session')
      return null
    }
  }

  const renameSession = async (sessionId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return
    try {
      const res = await api.put(`/chat/sessions/${sessionId}`, { title: newTitle.trim() })
      const updated = res.data.data
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: updated.title } : s))
      )
      if (activeSession?.id === sessionId) {
        setActiveSession((prev) => (prev ? { ...prev, title: updated.title } : prev))
      }
      toast.success('Chat renamed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rename chat')
    }
  }

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (activeSession?.id === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId)
        setActiveSession(remaining.length > 0 ? remaining[0] : null)
      }
      toast.success('Chat deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete chat')
    }
  }

  const navigateToChatWithDoc = (doc) => {
    if (doc?.id) {
      setSelectedDocs([doc.id])
    }
    setView('chat')
    toast.success(`Selected "${doc.fileName}" for chat`)
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar
        user={user}
        sessions={sessions}
        activeSession={activeSession}
        setActiveSession={(s) => {
          setActiveSession(s)
          setView('chat')
        }}
        createSession={createSession}
        renameSession={renameSession}
        deleteSession={deleteSession}
        view={view}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {view === 'admin' && user?.role === 'ADMIN' ? (
          <AdminUsersView />
        ) : view === 'chat' ? (
          <ChatView
            session={activeSession}
            setActiveSession={setActiveSession}
            createSession={createSession}
            renameSession={renameSession}
            deleteSession={deleteSession}
            documents={documents}
            loadDocuments={loadDocuments}
            selectedDocs={selectedDocs}
            setSelectedDocs={setSelectedDocs}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        ) : (
          <DocumentsView
            documents={documents}
            loadDocuments={loadDocuments}
            navigateToChatWithDoc={navigateToChatWithDoc}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}
      </main>
    </div>
  )
}
