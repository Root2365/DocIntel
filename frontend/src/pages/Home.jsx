import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  FileText,
  Sparkles,
  Shield,
  Zap,
  Search,
  BookOpen,
  Cpu,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  ChevronRight,
  BarChart3,
  Users,
  Terminal,
  HelpCircle,
} from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const { token, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      q: 'What is DocIntel AI and how does it work?',
      a: 'DocIntel AI is a retrieval-augmented generation (RAG) platform. You upload PDFs, which are split into smart chunks and converted into 768-dimensional vector embeddings stored in PostgreSQL with pgvector. When you ask a question, semantic search retrieves the most relevant passages and generates grounded answers with exact page citations.',
    },
    {
      q: 'How are exact page citations guaranteed?',
      a: 'During chunking, DocIntel AI preserves document page metadata for every text slice. When semantic similarity search matches a document excerpt, the page number, filename, and snippet are paired directly with the AI response, allowing you to verify every claim in the source PDF.',
    },
    {
      q: 'Which AI models and providers are supported?',
      a: 'DocIntel AI supports a dual-engine architecture: Google Gemini 2.0 Flash via OpenAI-compatible endpoints for ultra-fast cloud intelligence, or Ollama (llama3.2 & nomic-embed-text) for completely local, air-gapped deployments.',
    },
    {
      q: 'Is my data and document content secure?',
      a: 'Yes. All documents are tied directly to authenticated user accounts with strict ownership enforcement in Spring Security. System prompts enforce strict anti-hallucination and security boundaries, treating uploaded context as untrusted data so prompts cannot be hijacked.',
    },
    {
      q: 'What is the maximum file size supported?',
      a: 'The platform supports PDF files up to 100MB per document with asynchronous background processing and real-time progress indicators.',
    },
  ]

  const features = [
    {
      icon: <Search className="w-6 h-6 text-indigo-400" />,
      title: 'Dense Vector Search',
      desc: 'Pgvector indexing with 768 dimensions and 0.5 similarity thresholds ensures only top-relevance passages reach the LLM.',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      title: 'Verifiable Page Citations',
      desc: 'Every AI claim links directly back to the source filename, page number, and source snippet so you can audit answers instantly.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      title: 'Dual Engine: Cloud & Local',
      desc: 'Seamlessly switch between Google Gemini 2.0 Flash for hosted speed or Ollama for private on-premise execution.',
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: 'Stateless JWT & RBAC',
      desc: 'Hardened Spring Security with stateless JSON Web Tokens, BCrypt password hashing, and user-isolated document boundaries.',
    },
    {
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      title: 'Multi-Document Ingestion',
      desc: 'Upload multiple PDFs and query across specific documents or your entire library in unified conversational sessions.',
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-400" />,
      title: 'Real-Time Progress Tracking',
      desc: 'Watch real-time upload progress and async embedding pipeline state with granular percentage feedback.',
    },
  ]

  const steps = [
    {
      num: '01',
      title: 'Upload Documents',
      desc: 'Drag and drop standard PDF documents up to 100MB. Real-time feedback tracks byte upload and vector ingestion.',
    },
    {
      num: '02',
      title: 'Chunking & Vectorization',
      desc: 'Apache PDFBox extracts clean text, partitions sections with semantic overlap, and indexes 768-dim embeddings in PostgreSQL.',
    },
    {
      num: '03',
      title: 'Semantic Query Matching',
      desc: 'Ask questions in natural language. Cosine similarity retrieves the most relevant document chunks matching your intent.',
    },
    {
      num: '04',
      title: 'Grounded Answer & Citations',
      desc: 'The AI synthesizes answers strictly from source text, accompanied by interactive page-level citation references.',
    },
  ]

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navigation Bar */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-indigo-500/20"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              DocIntel<span style={{ color: 'var(--accent)' }}>.AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors">Architecture</a>
            <a href="#team" className="hover:text-indigo-400 transition-colors">About & Team</a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-200 cursor-pointer border hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {token ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <span>Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:text-indigo-400"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <span>Get Started</span>
                  <ChevronRight size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 border backdrop-blur-md"
            style={{
              backgroundColor: 'var(--accent-light)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            <Sparkles size={14} />
            <span>Next-Generation Document Intelligence & Citations</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.12]">
            Transform Static PDFs into{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Auditable Intelligence
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Upload research papers, technical manuals, contracts, and financial reports. Ask questions in natural language and receive grounded answers backed by precise, page-level citations.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={token ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <span>{token ? 'Go to Dashboard' : 'Start Analyzing Free'}</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to={token ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium border transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <FileText size={18} style={{ color: 'var(--accent)' }} />
              <span>{token ? 'View Documents' : 'Sign In to Account'}</span>
            </Link>
          </div>

          {/* Interactive UI Mockup Preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border p-2 shadow-2xl backdrop-blur-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              {/* Mockup Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>docintel.ai/workspace/annual-report-2026.pdf</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  <Sparkles size={13} />
                  <span>Gemini 2.0 Flash RAG Connected</span>
                </div>
              </div>

              {/* Mockup Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[320px]">
                {/* Left panel: Document list & chunks */}
                <div className="md:col-span-4 p-4 border-r flex flex-col justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                      Active Document Source
                    </div>
                    <div className="p-3 rounded-xl border mb-3 flex items-start gap-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                      <FileText className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                      <div className="text-left text-xs min-w-0">
                        <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>Q3_Financial_Analysis.pdf</div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>18 Pages • 768-dim Vectorized • Status: READY</div>
                      </div>
                    </div>

                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Vector Chunks Retrieved
                    </div>
                    <div className="space-y-1.5 text-left">
                      <div className="p-2 rounded-lg text-[11px] border" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
                        <div className="font-semibold">Chunk #14 • Page 4</div>
                        <div className="truncate opacity-80 mt-0.5">...operating margins expanded by 340 bps year-over-year...</div>
                      </div>
                      <div className="p-2 rounded-lg text-[11px] border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                        <div className="font-semibold">Chunk #28 • Page 9</div>
                        <div className="truncate opacity-80 mt-0.5">...net cash from operating activities reached $4.2B...</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-2.5 rounded-xl border flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Similarity Score:</span>
                    <span className="font-mono font-semibold" style={{ color: 'var(--success)' }}>0.92 / 1.0 (Top 3)</span>
                  </div>
                </div>

                {/* Right panel: Chat dialogue with citations */}
                <div className="md:col-span-8 p-5 text-left flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="space-y-4">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="px-4 py-2.5 rounded-2xl rounded-br-md text-xs sm:text-sm font-medium text-white max-w-[85%]" style={{ backgroundColor: 'var(--accent)' }}>
                        What were the key drivers behind the revenue growth in Q3?
                      </div>
                    </div>

                    {/* AI Answer with Citation */}
                    <div className="flex justify-start">
                      <div className="p-4 rounded-2xl rounded-bl-md text-xs sm:text-sm leading-relaxed max-w-[95%] border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <p className="mb-2.5">
                          According to the financial review, Q3 revenue grew primarily due to a <strong>28% increase in subscription revenues</strong> and international market expansion, while operating margins expanded by <strong>340 basis points</strong>.
                        </p>

                        {/* Citation Badge */}
                        <div className="mt-3 p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>
                            <BookOpen size={12} />
                            <span>Source: Q3_Financial_Analysis.pdf</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px]" style={{ backgroundColor: 'var(--bg-secondary)' }}>Page 4</span>
                          </div>
                          <div className="text-[11px] italic" style={{ color: 'var(--text-secondary)' }}>
                            &ldquo;Operating margins expanded by 340 bps year-over-year driven by subscription revenue growth of 28% across APAC & EMEA...&rdquo;
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Mockup */}
                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Grounded exclusively on uploaded documents. Zero hallucinations.</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                      Response Time: 640ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics / Highlights */}
      <section className="py-12 border-y" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--accent)' }}>768</div>
              <div className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Vector Dimensions (pgvector)</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--accent)' }}>100%</div>
              <div className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Page-Level Traceability</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--accent)' }}>&lt; 1s</div>
              <div className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Vector Retrieval Latency</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--accent)' }}>0</div>
              <div className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Hallucination Tolerance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            Core Capabilities
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Engineered for Precision, Grounding & Auditability
          </p>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Traditional LLMs guess when answering questions about long PDFs. DocIntel AI anchors every single sentence in verified document chunks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-7 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: 'var(--accent-light)' }}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (Step by Step) */}
      <section id="how-it-works" className="py-24 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Step-by-Step Workflow
            </h2>
            <p className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              From PDF Upload to Cited Insight in Seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border relative flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <div className="text-3xl font-black mb-4 font-mono" style={{ color: 'var(--accent)' }}>
                    {s.num}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Security Deep Dive */}
      <section id="architecture" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
              <Terminal size={14} />
              <span>Full-Stack Enterprise Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              Robust Spring Boot 4 Backend & High-Speed React 19 Frontend
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              DocIntel AI is built without fragile glue code. The backend runs on Java 21 with Spring Boot, Spring AI, Apache PDFBox, and PGVector. The frontend utilizes Vite, React 19, and Tailwind CSS with instant theme toggles and async progress tracking.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Strict Document Sandboxing:</strong> Users can only query documents they own; Admin roles have audited administrative visibility.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Prompt Injection Defenses:</strong> Context is encapsulated within untrusted document boundaries so instructions inside PDFs cannot hijack LLM execution.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Container & Cloud Ready:</strong> Deploys effortlessly to Render, Docker Compose, or Kubernetes with Spring Actuator liveness/readiness probes.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-6 rounded-2xl border font-mono text-xs text-left overflow-x-auto shadow-2xl" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>DocIntel Pipeline Stack</span>
                <span className="text-[11px] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>v1.0.0</span>
              </div>
              <div className="space-y-2.5" style={{ color: 'var(--text-secondary)' }}>
                <div><span style={{ color: 'var(--accent)' }}>[Client]</span> React 19 + Vite + Tailwind CSS (Port 5173)</div>
                <div><span style={{ color: 'var(--accent)' }}>[Proxy]</span> Vite dev reverse proxy &rarr; http://localhost:4000</div>
                <div><span style={{ color: 'var(--accent)' }}>[Security]</span> Stateless JWT + BCrypt + Authorization Filters</div>
                <div><span style={{ color: 'var(--accent)' }}>[Extraction]</span> Apache PDFBox 3.0 (Page-aware token chunking)</div>
                <div><span style={{ color: 'var(--accent)' }}>[Vectors]</span> PGVector 768-dim (nomic-embed-text / Gemini)</div>
                <div><span style={{ color: 'var(--accent)' }}>[Threshold]</span> 0.5 Similarity filter &bull; Top-3 Context Injection</div>
                <div><span style={{ color: 'var(--accent)' }}>[LLM Engine]</span> Gemini 2.0 Flash (OpenAI API spec) | Ollama</div>
                <div><span style={{ color: 'var(--accent)' }}>[Output]</span> Grounded Answer + JSON Jackson Citations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Team Mission */}
      <section id="team" className="py-24 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-4" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
              <Users size={14} />
              <span>About DocIntel AI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Built for Researchers, Legal Teams & Enterprise Analysts
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Our mission is to eliminate ungrounded AI hallucinations in knowledge-critical industries. When decision makers analyze technical documentation, audits, or healthcare data, every assertion must be traceable to the exact page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl border text-left" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-light)' }}>
                <Shield className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Integrity First</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Zero tolerance for hallucinations. If information does not exist in your source PDFs, the assistant explicitly states so.
              </p>
            </div>

            <div className="p-6 rounded-2xl border text-left" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-light)' }}>
                <Lock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Air-Gapped Privacy</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Run entirely on your infrastructure with local Ollama embeddings and models without sending proprietary data to external APIs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border text-left" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-light)' }}>
                <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Auditable Citations</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Click directly to verify quotes against the source document page before making clinical, financial, or legal decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-4" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
            <HelpCircle size={14} />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4 text-left">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border transition-all duration-200 overflow-hidden"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>{faq.q}</span>
                <span className="text-lg transition-transform duration-200 font-mono" style={{ color: 'var(--accent)' }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed border-t pt-3" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-16 rounded-3xl border relative overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight relative z-10" style={{ color: 'var(--text-primary)' }}>
              Ready to interrogate your documents with precision?
            </h2>
            <p className="mt-4 text-base sm:text-lg max-w-2xl mx-auto relative z-10" style={{ color: 'var(--text-secondary)' }}>
              Create your account in 30 seconds and start chatting with your PDFs with 100% cited grounding.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
              <Link
                to={token ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <span>{token ? 'Launch Workspace' : 'Get Started Free'}</span>
                <ArrowRight size={18} />
              </Link>
              {!token && (
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl text-base font-medium border hover:scale-105 active:scale-95 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
              DocIntel AI Platform
            </span>
          </div>

          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; 2026 DocIntel AI. High-Performance Retrieval-Augmented Generation. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Backend: Port 4000
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
