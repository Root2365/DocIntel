import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import ChatView from '../components/ChatView'
import DocumentsView from '../components/DocumentsView'
import api from '../lib/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState('chat') // 'chat' | 'documents'
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [documents, setDocuments] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadSessions()
    loadDocuments()
  }, [])

  const loadSessions = async () => {
    try {
      const res = await api.get('/chat/sessions')
      setSessions(res.data.data || [])
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
      return null
    }
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar
        user={user}
        sessions={sessions}
        activeSession={activeSession}
        setActiveSession={(s) => { setActiveSession(s); setView('chat') }}
        createSession={createSession}
        view={view}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {view === 'chat' ? (
          <ChatView
            session={activeSession}
            setActiveSession={setActiveSession}
            createSession={createSession}
            documents={documents}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        ) : (
          <DocumentsView
            documents={documents}
            loadDocuments={loadDocuments}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}
      </main>
    </div>
  )
}
