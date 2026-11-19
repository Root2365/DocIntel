import { useState, useEffect, useRef } from 'react'
import {
  Send,
  PanelLeftOpen,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Paperclip,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function ChatView({
  session,
  setActiveSession,
  createSession,
  renameSession,
  deleteSession,
  documents,
  loadDocuments,
  selectedDocs,
  setSelectedDocs,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDocPicker, setShowDocPicker] = useState(false)

  // Header rename states
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')

  // In-chat PDF upload states
  const [chatUploadTask, setChatUploadTask] = useState(null)
  const fileInputRef = useRef(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (session?.id) {
      loadMessages(session.id)
      setTitleInput(session.title || 'New Chat')
    } else {
      setMessages([])
      setTitleInput('New Chat')
    }
    setIsEditingTitle(false)
  }, [session?.id, session?.title])

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
      currentSession = await createSession(question.substring(0, 45))
      if (!currentSession) {
        toast.error('Failed to create session')
        return
      }
    }

    // Optimistic user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: question,
      citations: null,
      createdAt: new Date().toISOString(),
    }
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

  const handleSaveTitle = () => {
    if (session?.id && titleInput.trim()) {
      renameSession(session.id, titleInput.trim())
    }
    setIsEditingTitle(false)
  }

  const handleDeleteCurrentSession = () => {
    if (!session?.id) return
    if (window.confirm('Delete this conversation?')) {
      deleteSession(session.id)
    }
  }

  // Handle uploading PDF directly from chat
  const handleChatPdfSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF documents are supported')
      return
    }

    setChatUploadTask({
      fileName: file.name,
      progress: 0,
      stage: 'uploading',
    })

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 55) / progressEvent.total)
            setChatUploadTask((prev) =>
              prev ? { ...prev, progress: pct } : null
            )
          }
        },
      })

      const uploadedDoc = res.data?.data
      setChatUploadTask((prev) =>
        prev
          ? {
              ...prev,
              progress: 65,
              stage: 'processing',
              docId: uploadedDoc?.id,
            }
          : null
      )

      if (uploadedDoc?.id) {
        // Auto select this document for current chat
        setSelectedDocs((prev) => Array.from(new Set([...prev, uploadedDoc.id])))

        // Poll until READY
        let currentPct = 65
        const poll = setInterval(async () => {
          try {
            const check = await api.get(`/pdf/${uploadedDoc.id}`)
            const status = check.data?.data?.status

            if (status === 'READY' || status === 'COMPLETED') {
              clearInterval(poll)
              setChatUploadTask((prev) =>
                prev ? { ...prev, progress: 100, stage: 'completed' } : null
              )
              toast.success(`"${file.name}" indexed and selected for this chat!`)
              if (loadDocuments) loadDocuments()
              setTimeout(() => setChatUploadTask(null), 3000)
            } else if (status === 'FAILED') {
              clearInterval(poll)
              setChatUploadTask((prev) =>
                prev ? { ...prev, progress: 100, stage: 'error' } : null
              )
              toast.error('PDF processing failed.')
              if (loadDocuments) loadDocuments()
            } else {
              currentPct = Math.min(currentPct + 8, 95)
              setChatUploadTask((prev) =>
                prev ? { ...prev, progress: currentPct } : null
              )
            }
          } catch {
            // Keep polling
          }
        }, 1500)
      }
    } catch (err) {
      setChatUploadTask((prev) =>
        prev ? { ...prev, progress: 100, stage: 'error' } : null
      )
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const readyDocs = documents.filter((d) => d.status === 'READY' || d.status === 'COMPLETED')

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header with Title, Rename & Delete Controls */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              style={{ color: 'var(--text-muted)' }}
              title="Open Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}

          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--accent-light)' }}
          >
            <Sparkles size={15} style={{ color: 'var(--accent)' }} />
          </div>

          {/* Editable Session Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') setIsEditingTitle(false)
                }}
                className="bg-transparent border-b text-sm font-semibold outline-none px-1 py-0.5"
                style={{
                  borderColor: 'var(--accent)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--success)' }}
                title="Save Title"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h2
                onClick={() => {
                  if (session?.id) setIsEditingTitle(true)
                }}
                className="font-semibold text-sm truncate cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-primary)' }}
                title="Click to rename"
              >
                {session?.title || 'New Conversation'}
              </h2>
              {session?.id && (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Rename Chat"
                >
                  <Edit2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2 shrink-0">
          {session?.id && (
            <button
              onClick={handleDeleteCurrentSession}
              className="p-1.5 rounded-lg border hover:bg-red-500/10 transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--danger)',
              }}
              title="Delete This Chat"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              <Sparkles size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ask anything about your documents
            </h3>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
              Upload PDFs directly from this chat or select from your repository. Every answer is grounded with verified page-level citations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                'Summarize the core findings',
                'What are the key terms or figures?',
                'Are there any risk factors mentioned?',
                'Extract the methodology and conclusions',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left px-4 py-3 rounded-xl text-xs sm:text-sm border transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    borderColor: 'var(--border)',
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
                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser ? 'rounded-br-md' : 'rounded-bl-md border'
                    }`}
                    style={{
                      backgroundColor: isUser ? 'var(--accent)' : 'var(--surface)',
                      borderColor: isUser ? 'transparent' : 'var(--border)',
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

                  {/* Citations List */}
                  {!isUser && citations.length > 0 && <CitationBlock citations={citations} />}
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-md border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="dot-pulse flex gap-1.5 items-center">
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

      {/* Input & Toolbar Container */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Active Upload / Vectorization Progress Box in Chat */}
          {chatUploadTask && (
            <div
              className="p-3.5 rounded-xl border transition-all animate-in fade-in slide-in-from-bottom-2"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor:
                  chatUploadTask.stage === 'error'
                    ? 'var(--danger)'
                    : chatUploadTask.stage === 'completed'
                    ? 'var(--success)'
                    : 'var(--accent)',
              }}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {chatUploadTask.stage === 'completed' ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  ) : chatUploadTask.stage === 'error' ? (
                    <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
                  ) : (
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
                  )}
                  <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {chatUploadTask.fileName}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {chatUploadTask.stage === 'uploading' && 'Uploading...'}
                    {chatUploadTask.stage === 'processing' && 'Extracting & generating vector embeddings...'}
                    {chatUploadTask.stage === 'completed' && 'Ready & selected!'}
                    {chatUploadTask.stage === 'error' && 'Failed'}
                  </span>
                </div>
                <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                  {chatUploadTask.progress}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${chatUploadTask.progress}%`,
                    backgroundColor:
                      chatUploadTask.stage === 'error'
                        ? 'var(--danger)'
                        : chatUploadTask.stage === 'completed'
                        ? 'var(--success)'
                        : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Document Context Selector & Direct PDF Upload Action */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Document Picker Toggle */}
              <button
                onClick={() => setShowDocPicker(!showDocPicker)}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer"
                style={{
                  color: selectedDocs.length > 0 ? 'var(--accent)' : 'var(--text-secondary)',
                  backgroundColor: selectedDocs.length > 0 ? 'var(--accent-light)' : 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <FileText size={13} />
                <span>
                  {selectedDocs.length > 0
                    ? `${selectedDocs.length} Doc${selectedDocs.length !== 1 ? 's' : ''} Selected`
                    : 'All Indexed Documents'}
                </span>
                {showDocPicker ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {/* Clear selected documents pill if any selected */}
              {selectedDocs.length > 0 && (
                <button
                  onClick={() => setSelectedDocs([])}
                  className="text-[11px] px-2 py-1 rounded-md text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Direct PDF Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleChatPdfSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!!chatUploadTask && chatUploadTask.stage !== 'completed'}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--accent)',
                }}
                title="Upload PDF directly into this chat"
              >
                <Paperclip size={13} />
                <span>Upload PDF</span>
              </button>
            </div>
          </div>

          {/* Dropdown Document Picker Menu */}
          {showDocPicker && (
            <div
              className="p-3 rounded-xl border space-y-2 max-h-48 overflow-y-auto shadow-lg"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Filter Query Scope
              </div>
              {readyDocs.length === 0 ? (
                <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                  No indexed documents ready yet. Upload a PDF to start!
                </p>
              ) : (
                readyDocs.map((doc) => {
                  const isChecked = selectedDocs.includes(doc.id)
                  return (
                    <label
                      key={doc.id}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-xs border"
                      style={{
                        backgroundColor: isChecked ? 'var(--accent-light)' : 'transparent',
                        borderColor: isChecked ? 'var(--accent)' : 'var(--border)',
                        color: isChecked ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDoc(doc.id)}
                          className="rounded accent-[var(--accent)]"
                        />
                        <span className="truncate">{doc.fileName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">Ready</span>
                    </label>
                  )
                })
              )}
            </div>
          )}

          {/* Main Question Textarea Input */}
          <div
            className="flex items-end gap-2 rounded-2xl px-4 py-3 border transition-all focus-within:ring-2"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              '--tw-ring-color': 'var(--accent)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed"
              style={{ color: 'var(--text-primary)', maxHeight: '140px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-indigo-500/20 shrink-0"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              title="Send message"
            >
              <Send size={15} />
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
    <div className="mt-2 text-left">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer border"
        style={{
          color: 'var(--accent)',
          backgroundColor: 'var(--accent-light)',
          borderColor: 'var(--border)',
        }}
      >
        <BookOpen size={12} />
        <span>
          {citations.length} Verified Source Citation{citations.length !== 1 ? 's' : ''}
        </span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {citations.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-xl text-xs border leading-relaxed"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <FileText size={12} style={{ color: 'var(--accent)' }} />
                <span className="font-bold" style={{ color: 'var(--accent)' }}>
                  {c.fileName}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  Page {c.pageNumber}
                </span>
              </div>
              <p className="italic" style={{ color: 'var(--text-secondary)' }}>
                &ldquo;{c.snippet}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
