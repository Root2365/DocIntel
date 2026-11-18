import { useState, useCallback } from 'react'
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
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function DocumentsView({ documents, loadDocuments, sidebarOpen, setSidebarOpen }) {
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('PDF uploaded successfully!')
      loadDocuments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [loadDocuments])

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
    disabled: uploading,
  })

  const statusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
      case 'PENDING':
      case 'PROCESSING':
        return <Clock size={14} style={{ color: 'var(--warning)' }} />
      case 'FAILED':
        return <AlertCircle size={14} style={{ color: 'var(--danger)' }} />
      default:
        return <Clock size={14} style={{ color: 'var(--text-muted)' }} />
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
        <FolderOpen size={18} style={{ color: 'var(--accent)' }} />
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Documents</h2>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          {documents.length} file{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
              ${isDragActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
            `}
            style={{
              borderColor: isDragActive ? 'var(--accent)' : 'var(--border)',
              backgroundColor: isDragActive ? 'var(--accent-light)' : 'var(--surface)',
            }}
          >
            <input {...getInputProps()} />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              {uploading ? (
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
              ) : (
                <Upload size={24} style={{ color: 'var(--accent)' }} />
              )}
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {uploading ? 'Uploading...' : isDragActive ? 'Drop your PDF here' : 'Drop a PDF here, or click to browse'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              PDF files up to 100MB
            </p>
          </div>

          {/* Documents Grid */}
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 p-4 rounded-xl transition-all duration-200"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    <FileText size={18} style={{ color: 'var(--accent)' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {doc.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {statusIcon(doc.status)}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.status}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatSize(doc.fileSize)}</span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(doc.uploadedAt)}</p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(doc.id, doc.fileName)}
                      className="p-2 rounded-lg transition-colors cursor-pointer"
                      style={{ color: 'var(--text-secondary)' }}
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="p-2 rounded-lg transition-colors cursor-pointer"
                      style={{ color: 'var(--danger)' }}
                      title="Delete"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
