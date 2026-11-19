import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Mail, Lock, LogIn, Sun, Moon, FileText, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.data)
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left side - branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'var(--accent)' }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--accent)' }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8" style={{ backgroundColor: 'var(--accent)' }}>
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            DocIntel AI
          </h1>
          <p className="text-lg max-w-md" style={{ color: 'var(--text-secondary)' }}>
            Upload your PDFs and chat with AI to extract insights, citations, and answers from your documents.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {['Upload PDFs', 'AI Chat', 'Citations'].map((feature) => (
              <div key={feature} className="text-center">
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-light)' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 transition-colors hover:text-indigo-400"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>DocIntel AI</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading ? (
                <div className="dot-pulse flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                </div>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
