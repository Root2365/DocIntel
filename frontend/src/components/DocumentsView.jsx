import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  PanelLeftOpen,
  FolderOpen,
  X,
  Sparkles,
  MessageCircle,
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function DocumentsView({
  documents,
  loadDocuments,
  navigateToChatWithDoc,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [uploadTask, setUploadTask] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const pollIntervalRef = useRef(null)

  // Auto-poll document list if any document is currently in PENDING or PROCESSING state
  useEffect(() => {
    const hasActiveJobs = documents.some(
      (d) => d.status === 'PENDING' || d.status === 'PROCESSING'
    )

    if (hasActiveJobs) {
      pollIntervalRef.current = setInterval(() => {
        loadDocuments()
      }, 2500)
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [documents, loadDocuments])

  // Polling helper for active upload task
  const pollProcessingStatus = async (documentId) => {
    let currentPct = 60
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/pdf/${documentId}`)
        const doc = res.data?.data
        const status = doc?.status

        if (status === 'READY' || status === 'COMPLETED') {
          clearInterval(interval)
          setUploadTask((prev) =>
            prev ? { ...prev, progress: 100, stage: 'completed', status: 'READY' } : null
          )
          toast.success('Document indexed and ready for AI chat!')
          loadDocuments()
          setTimeout(() => {
            setUploadTask(null)
          }, 3500)
        } else if (status === 'FAILED') {
          clearInterval(interval)
          setUploadTask((prev) =>
            prev ? { ...prev, progress: 100, stage: 'error', status: 'FAILED' } : null
          )
          toast.error('Document processing failed.')
          loadDocuments()
        } else {
          // Increment smoothly between 60% and 94%
          currentPct = Math.min(currentPct + Math.floor(Math.random() * 6) + 3, 94)
          setUploadTask((prev) =>
            prev ? { ...prev, progress: currentPct, stage: 'processing' } : null
          )
        }
      } catch {
        // Continue polling if transient error
      }
    }, 1500)
  }

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are accepted')
        return
      }

      setUploadTask({
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        stage: 'uploading', // 'uploading' | 'processing' | 'completed' | 'error'
        status: 'PENDING',
      })

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await api.post('/pdf/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 55) / progressEvent.total
              )
              setUploadTask((prev) =>
                prev && prev.stage === 'uploading'
                  ? { ...prev, progress: percentCompleted }
                  : prev
              )
            }
          },
        })

        const uploadedDoc = response.data?.data
        setUploadTask((prev) =>
          prev
            ? {
                ...prev,
                progress: 60,
                stage: 'processing',
                docId: uploadedDoc?.id,
              }
            : null
        )

        loadDocuments()

        if (uploadedDoc?.id) {
          pollProcessingStatus(uploadedDoc.id)
        }
      } catch (err) {
        setUploadTask((prev) =>
          prev ? { ...prev, progress: 100, stage: 'error' } : null
        )
        toast.error(err.response?.data?.message || 'Upload failed')
      }
    },
    [loadDocuments]
  )

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/pdf/${id}`)
      toast.success('Document deleted')
      loadDocuments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (id, fileName) => {
    try {
      const res = await api.get(`/pdf/${id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: !!uploadTask && uploadTask.stage !== 'completed' && uploadTask.stage !== 'error',
  })

  const statusBadge = (status) => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--success)' }}>
            <CheckCircle2 size={12} />
            Ready
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: 'var(--warning)' }}>
            <Clock size={12} className="animate-spin" />
            Queued
          </span>
        )
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: 'rgba(129, 140, 248, 0.15)', color: 'var(--accent)' }}>
            <Loader2 size={12} className="animate-spin" />
            Indexing Vectors
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', color: 'var(--danger)' }}>
            <AlertCircle size={12} />
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            <Clock size={12} />
            {status}
          </span>
        )
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
        <FolderOpen size={18} style={{ color: 'var(--accent)' }} />
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Document Repository
        </h2>
        <span
          className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          {documents.length} file{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
              ${isDragActive ? 'scale-[1.01]' : 'hover:scale-[1.005]'}
            `}
            style={{
              borderColor: isDragActive ? 'var(--accent)' : 'var(--border)',
              backgroundColor: isDragActive ? 'var(--accent-light)' : 'var(--surface)',
            }}
          >
            <input {...getInputProps()} />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              <Upload size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {isDragActive ? 'Drop your PDF here' : 'Click to browse or drop your PDF document here'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Supports standard PDFs up to 100MB &bull; Automatic chunking &amp; 768-dim vector embeddings
            </p>
          </div>

          {/* ACTIVE UPLOAD / PROCESSING PROGRESS BAR */}
          {uploadTask && (
            <div
              className="p-4 sm:p-5 rounded-2xl border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor:
                  uploadTask.stage === 'error'
                    ? 'var(--danger)'
                    : uploadTask.stage === 'completed'
                    ? 'var(--success)'
                    : 'var(--accent)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    {uploadTask.stage === 'completed' ? (
                      <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                    ) : uploadTask.stage === 'error' ? (
                      <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                    ) : (
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {uploadTask.fileName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {uploadTask.stage === 'uploading' && `Uploading to server (${formatSize(uploadTask.fileSize)})...`}
                      {uploadTask.stage === 'processing' && 'Extracting text pages & computing 768-dim vector embeddings...'}
                      {uploadTask.stage === 'completed' && 'Processing complete! Ready for AI question answering.'}
                      {uploadTask.stage === 'error' && 'Encountered an error during processing.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-base font-extrabold font-mono"
                    style={{
                      color:
                        uploadTask.stage === 'error'
                          ? 'var(--danger)'
                          : uploadTask.stage === 'completed'
                          ? 'var(--success)'
                          : 'var(--accent)',
                    }}
                  >
                    {uploadTask.progress}%
                  </span>
                  {(uploadTask.stage === 'completed' || uploadTask.stage === 'error') && (
                    <button
                      onClick={() => setUploadTask(null)}
                      className="p-1 rounded-lg hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Progress Track */}
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${uploadTask.progress}%`,
                    backgroundColor:
                      uploadTask.stage === 'error'
                        ? 'var(--danger)'
                        : uploadTask.stage === 'completed'
                        ? 'var(--success)'
                        : 'var(--accent)',
                  }}
                />
              </div>

              {/* Dynamic Step Status */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={11} style={{ color: 'var(--accent)' }} />
                  {uploadTask.stage === 'uploading' && 'Stage 1 of 2: Byte Stream Transfer'}
                  {uploadTask.stage === 'processing' && 'Stage 2 of 2: Semantic Vector Store Ingestion'}
                  {uploadTask.stage === 'completed' && 'Indexed with pgvector'}
                  {uploadTask.stage === 'error' && 'Failed'}
                </span>
                <span>{uploadTask.progress < 100 ? 'Please do not close this tab' : 'Complete'}</span>
              </div>
            </div>
          )}

          {/* Documents Section Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Uploaded Documents
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Indexed files available for context retrieval and citation grounding
              </p>
            </div>
            <button
              onClick={() => loadDocuments()}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors hover:text-indigo-400 cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
            >
              Refresh
            </button>
          </div>

          {/* Documents Grid */}
          {documents.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <FileText size={44} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                No documents uploaded yet
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Upload your first PDF above to enable AI question answering with page citations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {documents.map((doc) => {
                const isProcessing = doc.status === 'PROCESSING' || doc.status === 'PENDING'

                return (
                  <div
                    key={doc.id}
                    className="group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--accent-light)' }}
                      >
                        <FileText size={18} style={{ color: 'var(--accent)' }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }} title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {statusBadge(doc.status)}
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {formatSize(doc.fileSize)}
                          </span>
                        </div>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => navigateToChatWithDoc && navigateToChatWithDoc(doc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                          style={{
                            backgroundColor: 'var(--accent-light)',
                            borderColor: 'var(--border)',
                            color: 'var(--accent)',
                          }}
                          title="Open Chat with this document"
                        >
                          <MessageCircle size={13} />
                          <span>Chat</span>
                        </button>

                        <button
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                          className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-neutral-800/20"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Download PDF"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-red-500/10"
                          style={{ color: 'var(--danger)' }}
                          title="Delete PDF"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* In-card progress indicator if processing */}
                    {isProcessing && (
                      <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium" style={{ color: 'var(--accent)' }}>
                          <span className="flex items-center gap-1">
                            <Loader2 size={11} className="animate-spin" />
                            Indexing vector chunks...
                          </span>
                          <span className="font-mono">In Progress</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <div className="h-full rounded-full bg-indigo-500 animate-pulse w-3/4" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
