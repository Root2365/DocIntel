# DocIntel AI

> **High-Performance Document Intelligence & Retrieval-Augmented Generation (RAG) Platform** with Verified Page-Level Citations, Dual AI Model Support (Google Gemini 2.0 Flash & Local Ollama), and PostgreSQL pgvector Storage.

---

## 📑 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started (Local Development)](#getting-started-local-development)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
  - [Frontend Setup (Vite + React)](#frontend-setup-vite--react)
- [Running with Docker & Docker Compose](#running-with-docker--docker-compose)
- [Deploying to Render](#deploying-to-render)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Security & Grounding Guarantees](#security--grounding-guarantees)

---

## Overview

DocIntel AI allows users to upload standard PDF documents (contracts, financial reports, technical manuals, scientific research papers) and perform conversational question-answering with strict anti-hallucination grounding.

Unlike generic LLM wrappers, **every claim returned by DocIntel AI includes page-level citations** that display the source filename, page number, and original context snippet.

---

## Key Features

- **🎯 Exact Page-Level Citations**: Interactive citation cards provide verifiable audit trails directly pointing to document pages.
- **⚡ 768-Dimensional Vector Search**: Embeddings stored in PostgreSQL using `pgvector` with a strict `0.5` similarity threshold filtering.
- **🔄 Dual AI Provider Engine**:
  - **Google Gemini 2.0 Flash** (via OpenAI-compatible endpoint schema) for instant cloud inference.
  - **Ollama** (`llama3.2` & `nomic-embed-text`) for air-gapped, zero-data-leakage local execution.
- **📊 Real-Time Upload & Processing Progress Bar**: Granular percentage bar tracking byte upload stream and async vector chunk indexing.
- **🛡️ Enterprise Security**: Stateless JWT authentication, BCrypt password hashing, and user-isolated document access controls.
- **🌙 Deep Black OLED & Clean Light Mode**: Native theme toggle with persistent preferences.
- **☁️ Cloud & Docker Ready**: Containerized runtime with Spring Boot Actuator health probes and Render deployment blueprints.

---

## Architecture & Tech Stack

```
                  ┌──────────────────────────────────────────────┐
                  │          Vite + React 19 Frontend            │
                  │   Tailwind CSS • Lucide Icons • React Router │
                  │           (Default Port: 5173)               │
                  └──────────────────────┬───────────────────────┘
                                         │ Reverse Proxy /api
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │         Spring Boot 4.x / Java 21            │
                  │       Spring AI • Spring Security (JWT)      │
                  │             (Port: 4000)                     │
                  └──────────────┬───────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐   ┌───────────────────────────────────┐
│     PostgreSQL 16 + pgvector    │   │           LLM Engine              │
│  768-Dim Vector Store & RDBMS   │   │  • Gemini 2.0 Flash (OpenAI API)  │
│          (Port: 5432)           │   │  • Local Ollama (llama3.2)        │
└─────────────────────────────────┘   └───────────────────────────────────┘
```

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, Axios, React Dropzone, React Router 7, Lucide Icons |
| **Backend** | Java 21, Spring Boot 4.1.2, Spring AI 2.0.2, Apache PDFBox 3.0.3, Jackson |
| **Database & Vector Store** | PostgreSQL 16 with `pgvector` extension (768 dimensions) |
| **Authentication** | Stateless JWT (jjwt 0.12.6) + Spring Security 6 |
| **AI Providers** | Google Gemini (OpenAI Chat Completions endpoint) & Ollama |

---

## Project Directory Structure

```
DocIntel AI/
├── backend/
│   ├── src/main/java/com/docintel/backend/
│   │   ├── Common/              # API Response wrappers & Global Exception Handlers
│   │   ├── Config/              # SecurityConfig, JwtService, JwtFilter, AsyncConfig
│   │   ├── Controller/          # AuthController, PdfController, ChatController
│   │   ├── Dto/                 # Request/Response records & DTOs
│   │   ├── Entity/              # User, PdfDocument, DocumentChunk, ChatSession, ChatMessage
│   │   ├── Repository/          # Spring Data JPA repositories
│   │   └── Service/             # AuthService, PdfService, PdfProcessingService, LlmService, QuestionService
│   ├── src/main/resources/      # application.properties
│   ├── Dockerfile               # Backend container recipe
│   ├── docker-compose.yml       # Local PostgreSQL + PGVector + Backend compose
│   └── pom.xml                  # Maven dependencies & build plugins
├── frontend/
│   ├── src/
│   │   ├── components/          # ChatView, DocumentsView (with progress bar), Sidebar
│   │   ├── context/             # AuthContext, ThemeContext, jwtDecode
│   │   ├── lib/                 # api.js (Axios instance with JWT interceptor)
│   │   ├── pages/               # Home (Landing page), Login, Register, Dashboard
│   │   ├── App.jsx              # Client-side routing & auth gates
│   │   └── index.css            # CSS variables & dark/light mode definitions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js           # Vite dev proxy configuration
├── Dockerfile                   # Repo-root Dockerfile for cloud deploy (Render)
├── render.yaml                  # Infrastructure-as-code for Render deployment
└── README.md                    # Project documentation
```

---

## Getting Started (Local Development)

### Prerequisites
- **Java 21 JDK**
- **Node.js 20+** and **npm**
- **PostgreSQL 16** with `pgvector` extension enabled (or run via Docker)

### 1. Database Setup
Ensure PostgreSQL has the `vector` extension created:
```sql
CREATE DATABASE docintel;
\c docintel
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Configure your `.env` or set environment variables:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=docintel
   DB_USERNAME=postgres
   DB_PASSWORD=password
   JWT_SECRET=yourSuperSecretJwtKeyWithAtLeast32CharactersLong2026
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   AI_PROVIDER=GEMINI
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on **`http://localhost:4000`**.

### 3. Frontend Setup
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at **`http://localhost:5173`**.

---

## Running with Docker & Docker Compose

To start both PostgreSQL with `pgvector` and the Spring Boot backend with a single command:

```bash
cd backend
docker compose up -d --build
```

- PostgreSQL container: `localhost:5432`
- DocIntel Backend container: `localhost:4000`

---

## Deploying to Render

This repository includes a preconfigured **`render.yaml`** blueprint:

1. Push your code to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), select **New +** → **Blueprint**.
3. Select your repository. Render will automatically configure:
   - **`docintel-backend`**: Docker Web Service running Spring Boot on port 4000 with a 1GB persistent disk for uploads.
   - **`docintel-frontend`**: Static Web Site running the Vite production build.
   - **`docintel-db`**: Managed PostgreSQL database with `pgvector`.
4. Add your secrets in the backend service Environment settings:
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
5. Enable `pgvector` in the Render PostgreSQL database shell:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

---

## API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`) &rarr; JWT token |
| `POST` | `/api/auth/login` | Authenticate user (`email`, `password`) &rarr; JWT token |

### 📄 PDF Document Management (`/api/pdf`)
*(Requires `Authorization: Bearer <token>`)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/pdf/upload` | Upload PDF (multipart/form-data with `file`) |
| `GET` | `/api/pdf` | List all uploaded documents for the authenticated user |
| `GET` | `/api/pdf/{id}` | Retrieve document metadata and processing status (`READY`, `PROCESSING`, `FAILED`) |
| `GET` | `/api/pdf/{id}/download` | Stream and download original PDF document |
| `DELETE` | `/api/pdf/{id}` | Delete document file, database chunks, and vector store embeddings |

### 💬 AI Chat & Sessions (`/api/chat`)
*(Requires `Authorization: Bearer <token>`)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/sessions` | Create a new conversation session (`title`) |
| `GET` | `/api/chat/sessions` | Retrieve conversation sessions for the user |
| `PUT` | `/api/chat/sessions/{id}` | Rename conversation session (`title`) |
| `DELETE` | `/api/chat/sessions/{id}` | Delete conversation session and all its messages |
| `GET` | `/api/chat/sessions/{id}/messages` | Retrieve chronological message history with citations |
| `POST` | `/api/chat/ask` | Ask question (`question`, `sessionId`, optional `documentIds`) &rarr; Answer + Citations |

### 🩺 Actuator Health Check
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/actuator/health` | Public liveness & readiness probes |

---

## Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `docintel` | Database name |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `password` | Database password |
| `JWT_SECRET` | *(required)* | Secret HMAC key for signing JWT tokens |
| `AI_PROVIDER` | `GEMINI` | Choice of `GEMINI` or `OLLAMA` |
| `GEMINI_API_KEY` | *(empty)* | Google AI Studio Gemini API Key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model name |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama service URL |
| `VECTOR_DIMENSIONS`| `768` | Pgvector embedding dimensions |
| `CORS_ALLOWED_ORIGINS`| `http://localhost:5173,http://127.0.0.1:5173` | Allowed frontend origins |

---

## Security & Grounding Guarantees

1. **Context Sandboxing**: Document text is wrapped inside `<document_context>` delimiters with strict system prompt directives instructing the LLM to treat document content solely as data and ignore any prompt injections inside PDFs.
2. **Strict Hallucination Boundary**: If the retrieved document context does not answer the question, the system strictly outputs:  
   *`"I cannot find information regarding this in the uploaded documents."`*
3. **Data Isolation**: User document queries are strictly bounded to documents owned by the authenticated JWT subject.
