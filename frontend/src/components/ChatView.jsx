import { useState, useEffect, useRef } from 'react'
import { Send, PanelLeftOpen, Sparkles, FileText, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function ChatView({ session, setActiveSession, createSession, documents, sidebarOpen, setSidebarOpen }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState([])
  const [showDocPicker, setShowDocPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (session?.id) {
      loadMessages(session.id)
    } else {
      setMessages([])
    }
  }, [session?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (sessionId) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}/messages`)
      setMessages(res.data.data || [])
    } catch {
      setMessages([])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput('')

    let currentSession = session
    if (!currentSession) {
      currentSession = await createSession(question.substring(0, 50))
      if (!currentSession) {
        toast.error('Failed to create session')
        return
      }
    }

    // Optimistic: add user message
    const userMsg = { id: Date.now(), role: 'user', content: question, citations: null, createdAt: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])

    setLoading(true)
    try {
      const res = await api.post('/chat/ask', {
        question,
        sessionId: currentSession.id,
        documentIds: selectedDocs.length > 0 ? selectedDocs : null,
      })

      const data = res.data.data
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        parsedCitations: data.citations || [],
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get answer')
      // Remove optimistic user message
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const parseCitations = (citationStr) => {
    if (!citationStr) return []
    try {
      return JSON.parse(citationStr)
    } catch {
      return []
    }
  }

  const toggleDoc = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    )
  }

  const readyDocs = documents.filter((d) => d.status === 'COMPLETED')

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
      >
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        <Sparkles size={18} style={{ color: 'var(--accent)' }} />
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {session?.title || 'New Conversation'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              <Sparkles size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ask anything about your documents
            </h3>
            <p className="text-sm max-w-md text-center" style={{ color: 'var(--text-secondary)' }}>
              Upload PDFs in the Documents tab, then ask questions here. AI will find answers with page-level citations.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                'Summarize the key points',
                'What are the main conclusions?',
                'Find specific data or statistics',
                'Compare different sections',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            const citations = msg.parsedCitations || parseCitations(msg.citations)

            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
                  {/* Message bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
                    style={{
                      backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: isUser ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    {isUser ? (
                      msg.content
                    ) : (
                      <div className="prose-chat">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Citations */}
                  {!isUser && citations.length > 0 && (
                    <CitationBlock citations={citations} />
                  )}
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-md"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <div className="dot-pulse flex gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--accent)' }} />
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--accent)' }} />
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          {/* Doc picker */}
          {readyDocs.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowDocPicker(!showDocPicker)}
                className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <FileText size={12} />
                {selectedDocs.length > 0 ? `${selectedDocs.length} doc(s) selected` : 'Select documents'}
                {showDocPicker ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showDocPicker && (
                <div
                  className="mt-2 p-2 rounded-xl space-y-1 max-h-40 overflow-y-auto"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
                >
                  {readyDocs.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-sm"
                      style={{
                        backgroundColor: selectedDocs.includes(doc.id) ? 'var(--accent-light)' : 'transparent',
                        color: selectedDocs.includes(doc.id) ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => toggleDoc(doc.id)}
                        className="rounded accent-[var(--accent)]"
                      />
                      <FileText size={14} />
                      <span className="truncate">{doc.fileName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div
            className="flex items-end gap-2 rounded-2xl px-4 py-3"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm outline-none"
              style={{ color: 'var(--text-primary)', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl transition-all duration-200 disabled:opacity-30 hover:scale-105 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CitationBlock({ citations }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-all cursor-pointer"
        style={{ color: 'var(--accent)' }}
      >
        <BookOpen size={12} />
        {citations.length} source{citations.length !== 1 ? 's' : ''}
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          {citations.map((c, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-xl text-xs"
              style={{
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={11} style={{ color: 'var(--accent)' }} />
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                  {c.fileName}
                </span>
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  Page {c.pageNumber}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>{c.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
