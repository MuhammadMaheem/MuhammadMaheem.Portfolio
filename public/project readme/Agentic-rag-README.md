<div align="center">

# 🤖 Agentic RAG PDF Chatbot

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/Next.js-14-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-0.128-009688.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791.svg" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

**A production-ready, AI-powered PDF chatbot using Agentic RAG (Retrieval-Augmented Generation) that allows users to upload PDFs and have intelligent conversations with their documents.**

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎯 Core Capabilities
- **🔍 Smart PDF Processing** - Upload and extract content from PDFs with intelligent text chunking and metadata extraction
- **🤖 Agentic RAG** - Advanced retrieval-augmented generation with multi-query expansion and context-aware responses
- **🔐 User Authentication** - Secure JWT-based authentication with access/refresh token management
- **💬 Persistent Chat Sessions** - Multiple chat sessions per document with complete conversation history
- **⚡ Real-time Streaming** - Token-by-token response streaming for enhanced user experience
- **📖 Source Attribution** - Automatic citations with precise page number references
- **🎨 Beautiful UI** - Sleek dark responsive design with Framer Motion animations
- **📱 Mobile Responsive** - Fully optimized for desktop, tablet, and mobile devices

### 🔥 Advanced Features
- **Multi-query Generation** - Expands user queries for better retrieval accuracy
- **Context Window Management** - Maintains last 10 messages for coherent conversations
- **Code Syntax Highlighting** - Beautiful code blocks with copy-to-clipboard functionality
- **Background Processing** - Asynchronous PDF processing with status tracking
- **Vector Similarity Search** - Efficient semantic search using pgvector
- **Session Management** - Create, list, and manage multiple chat sessions per document

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.0 | React framework with App Router |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **Framer Motion** | 11.0.3 | Animation library |
| **Zustand** | 4.5.0 | State management |
| **shadcn/ui** | Latest | UI component library |
| **React Markdown** | 9.0.1 | Markdown rendering |
| **Lucide React** | 0.314.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.128.0 | Modern Python web framework |
| **Python** | 3.11+ | Programming language |
| **SQLAlchemy** | 2.0.46 | SQL ORM |
| **PostgreSQL** | 15+ | Relational database |
| **pgvector** | Latest | Vector similarity search |
| **Alembic** | 1.18.1 | Database migrations |
| **Groq API** | 1.0.0 | LLM inference (llama-3.3-70b-versatile) |
| **sentence-transformers** | 5.2.0 | Text embeddings (all-MiniLM-L6-v2) |
| **python-jose** | 3.5.0 | JWT authentication |
| **Passlib** | 1.7.4 | Password hashing |
| **PyPDF2** | 3.0.1 | PDF text extraction |
| **Uvicorn** | 0.40.0 | ASGI server |

## 📁 Project Structure

```
Agentic PDF/
├── 📂 backend/                    # FastAPI backend application
│   ├── 📂 app/
│   │   ├── 📂 agents/            # AI agents for PDF interaction
│   │   │   └── pdf_agent.py      # Groq-powered chat agent with streaming
│   │   ├── 📂 models/            # SQLAlchemy database models
│   │   │   ├── user.py           # User model
│   │   │   ├── document.py       # Document & DocumentChunk models
│   │   │   └── chat.py           # ChatSession & ChatMessage models
│   │   ├── 📂 routers/           # API route handlers
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── documents.py      # Document upload/management
│   │   │   └── chat.py           # Chat session & messaging
│   │   ├── 📂 schemas/           # Pydantic validation schemas
│   │   │   ├── user.py           # User DTOs
│   │   │   ├── document.py       # Document DTOs
│   │   │   └── chat.py           # Chat DTOs
│   │   ├── 📂 services/          # Business logic layer
│   │   │   ├── pdf_service.py    # PDF processing & chunking
│   │   │   └── rag_service.py    # RAG pipeline & retrieval
│   │   ├── 📂 utils/             # Helper utilities
│   │   │   ├── auth.py           # JWT token handling
│   │   │   └── file_handler.py   # File upload/validation
│   │   ├── config.py             # Application settings
│   │   ├── database.py           # Database connection
│   │   └── main.py               # FastAPI app entry point
│   ├── 📂 alembic/               # Database migrations
│   │   ├── 📂 versions/
│   │   │   └── 001_initial_migration.py
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── 📂 uploads/               # User-uploaded PDF storage
│   ├── alembic.ini               # Alembic configuration
│   ├── Dockerfile                # Backend Docker image
│   └── requirements.txt          # Python dependencies
│
├── 📂 frontend/                   # Next.js frontend application
│   ├── 📂 app/                   # Next.js 14 App Router
│   │   ├── 📂 auth/
│   │   │   ├── 📂 login/         # Login page
│   │   │   └── 📂 register/      # Registration page
│   │   ├── 📂 chat/[id]/         # Dynamic chat page
│   │   ├── 📂 dashboard/         # User dashboard
│   │   ├── 📂 documents/         # Document management
│   │   │   └── 📂 upload/        # Document upload page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── 📂 components/            # React components
│   │   ├── 📂 ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── spinner.tsx
│   │   ├── FireflyBackground.tsx # Animated background
│   │   ├── MouseTrail.tsx        # Mouse trail effect
│   │   └── Navbar.tsx            # Navigation bar
│   ├── 📂 lib/                   # Utilities
│   │   ├── store.ts              # Zustand store
│   │   └── utils.ts              # Helper functions
│   ├── Dockerfile                # Frontend Docker image
│   ├── middleware.ts             # Next.js middleware
│   ├── next.config.js            # Next.js configuration
│   ├── package.json              # Node dependencies
│   ├── tailwind.config.js        # Tailwind configuration
│   └── tsconfig.json             # TypeScript configuration
│
├── 📄 docker-compose.yml          # Docker orchestration
├── 📄 setup.sh                    # Automated setup script
├── 📄 start.sh                    # Start all services
├── 📄 stop.sh                     # Stop all services
├── 📄 LICENSE                     # MIT License
└── 📄 README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.11 or higher ([Download](https://www.python.org/downloads/))
- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Groq API Key** ([Get one free](https://console.groq.com/))

### Quick Start (Automated Setup)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/agentic-pdf-chatbot.git
cd agentic-pdf-chatbot
```

2. **Run the automated setup**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Configure environment variables**
   - Edit `backend/.env` and add your `GROQ_API_KEY`
   - Edit `backend/.env` and configure your PostgreSQL connection if needed

4. **Start the application**
```bash
chmod +x start.sh
./start.sh
```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create and activate virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. **Create environment file**
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL=postgresql://pdfuser:pdfpass@localhost:5432/pdf_chatbot
SECRET_KEY=your-super-secret-key-min-32-chars
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.3-70b-versatile
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=512
CHUNK_OVERLAP=50
FRONTEND_URL=http://localhost:3000
```

5. **Setup PostgreSQL database**
```bash
# Create database
createdb pdf_chatbot

# Enable pgvector extension
psql pdf_chatbot -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

6. **Run database migrations**
```bash
alembic upgrade head
```

7. **Start backend server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install Node dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Start development server**
```bash
npm run dev
```

</details>

### Docker Setup (Recommended for Production)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/agentic-pdf-chatbot.git
cd agentic-pdf-chatbot
```

2. **Create environment file**
```bash
cp .env.example .env
```

Edit `.env` and add your `GROQ_API_KEY`:
```env
GROQ_API_KEY=your-groq-api-key-here
SECRET_KEY=your-super-secret-key-min-32-chars
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

5. **View logs**
```bash
docker-compose logs -f
```

6. **Stop services**
```bash
docker-compose down
```

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `SECRET_KEY` | JWT signing key (min 32 chars) | - | ✅ |
| `GROQ_API_KEY` | Groq API key for LLM | - | ✅ |
| `GROQ_MODEL` | Groq model name | `llama-3.3-70b-versatile` | ❌ |
| `UPLOAD_DIR` | PDF upload directory | `./uploads` | ❌ |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) | ❌ |
| `EMBEDDING_MODEL` | Sentence transformer model | `all-MiniLM-L6-v2` | ❌ |
| `CHUNK_SIZE` | Text chunk size | `512` | ❌ |
| `CHUNK_OVERLAP` | Chunk overlap size | `50` | ❌ |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` | ❌ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token expiry | `30` | ❌ |
| `REFRESH_TOKEN_EXPIRE_DAYS` | JWT refresh token expiry | `7` | ❌ |

### Frontend Configuration (`frontend/.env.local`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` | ✅ |

## 📚 API Documentation

### Interactive API Docs

Once the backend is running, explore the API using:

- **Swagger UI**: http://localhost:8000/docs (Interactive API testing)
- **ReDoc**: http://localhost:8000/redoc (Beautiful API documentation)

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

#### Documents
- `POST /api/documents/upload` - Upload PDF document
- `GET /api/documents` - List user's documents
- `GET /api/documents/{document_id}` - Get document details
- `DELETE /api/documents/{document_id}` - Delete document

#### Chat
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions` - List chat sessions
- `GET /api/chat/sessions/{session_id}/history` - Get chat history
- `POST /api/chat/sessions/{session_id}/message` - Send message (streaming)
- `DELETE /api/chat/sessions/{session_id}` - Delete chat session

## 🏗️ Architecture

### RAG Pipeline Flow

```mermaid
graph TB
    A[User Uploads PDF] --> B[PDF Text Extraction]
    B --> C[Text Chunking]
    C --> D[Generate Embeddings]
    D --> E[Store in PostgreSQL + pgvector]
    F[User Query] --> G[Generate Query Embedding]
    G --> H[Vector Similarity Search]
    E --> H
    H --> I[Retrieve Top-K Chunks]
    I --> J[Format Context]
    J --> K[Groq LLM Generation]
    K --> L[Stream Response to User]
    L --> M[Save to Chat History]
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User Browser                          │
│                     (Next.js Frontend)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/SSE
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routers    │  │   Services   │  │    Agents    │     │
│  │ (Auth, Docs, │→ │(PDF, RAG)    │→ │(PDF Agent)   │     │
│  │   Chat)      │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────┬───────┘     │
│         │                                     │             │
│         ▼                                     ▼             │
│  ┌──────────────┐                    ┌──────────────┐     │
│  │  SQLAlchemy  │                    │  Groq API    │     │
│  │    Models    │                    │  (LLM)       │     │
│  └──────┬───────┘                    └──────────────┘     │
└─────────┼──────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL + pgvector                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │Documents │  │  Chunks  │  │  Chats   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### PDF Agent (`backend/app/agents/pdf_agent.py`)
- Formats retrieved chunks with page numbers
- Manages conversation history (last 10 messages)
- Calls Groq API for LLM inference
- Supports both streaming and non-streaming responses
- Uses `llama-3.3-70b-versatile` model

#### RAG Service (`backend/app/services/rag_service.py`)
- Implements vector similarity search
- Generates streaming responses via SSE
- Manages chat history and session state
- Extracts and formats source citations

#### PDF Service (`backend/app/services/pdf_service.py`)
- Extracts text from PDFs using PyPDF2
- Chunks text with configurable size and overlap
- Generates embeddings using sentence-transformers
- Stores chunks in PostgreSQL with vector representations

## 🎯 Usage Guide

### 1. Register an Account
- Navigate to http://localhost:3000
- Click "Get Started" or "Register"
- Fill in your details and create an account

### 2. Upload a PDF
- Go to Dashboard → "Upload Document"
- Select a PDF file (max 10MB)
- Wait for processing (background task)

### 3. Start Chatting
- Click on a processed document
- A new chat session is created automatically
- Type your questions and get AI-powered answers
- View source citations with page numbers

### 4. Manage Sessions
- Create multiple chat sessions per document
- View chat history anytime
- Delete old conversations

## 🧪 Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Frontend Development

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Management

```bash
# Connect to database
psql pdf_chatbot

# View tables
\dt

# View table structure
\d+ users

# Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

## 📦 Deployment

### Backend Deployment (Railway/Render)

1. **Prepare for deployment**
```bash
# Ensure Dockerfile is in backend/
# Set environment variables in platform dashboard
```

2. **Deploy to Railway**
```bash
railway init
railway up
railway variables set GROQ_API_KEY=your-key
railway variables set SECRET_KEY=your-secret
```

3. **Deploy to Render**
- Connect GitHub repository
- Select `backend` directory
- Add environment variables
- Deploy

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
```bash
cd frontend
npm install -g vercel
vercel
```

2. **Configure environment**
- Add `NEXT_PUBLIC_API_URL` in Vercel dashboard
- Point to your deployed backend URL

### Docker Production Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f backend frontend
```

## 🐛 Troubleshooting

<details>
<summary>Database connection issues</summary>

**Problem**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
sudo systemctl start postgresql

# Check DATABASE_URL in .env
# Ensure format: postgresql://user:pass@host:port/dbname
```
</details>

<details>
<summary>Groq API errors</summary>

**Problem**: `401 Unauthorized` or `Invalid API key`

**Solution**:
- Verify `GROQ_API_KEY` in `backend/.env`
- Get a new key from https://console.groq.com/
- Ensure no extra spaces in the key
```bash
export GROQ_API_KEY="your-actual-key-here"
```
</details>

<details>
<summary>Frontend not connecting to backend</summary>

**Problem**: CORS errors or connection refused

**Solution**:
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify NEXT_PUBLIC_API_URL in frontend/.env.local
# Ensure FRONTEND_URL in backend/.env matches frontend origin

# Check CORS configuration in backend/app/main.py
```
</details>

<details>
<summary>PDF upload fails</summary>

**Problem**: File upload returns 413 or 500 error

**Solution**:
- Check file size (max 10MB by default)
- Ensure `UPLOAD_DIR` exists and is writable
- Verify `MAX_FILE_SIZE` in backend config
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```
</details>

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/agentic-pdf-chatbot.git
cd agentic-pdf-chatbot
```

2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
```bash
git add .
git commit -m "Add amazing feature"
```

5. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues

### Development Guidelines

- **Backend**: Follow PEP 8 style guide
- **Frontend**: Use ESLint and Prettier
- **Commits**: Use conventional commit messages
- **Tests**: Add tests for new features
- **Documentation**: Update README and docstrings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Groq](https://groq.com/)** - Ultra-fast LLM inference
- **[Sentence Transformers](https://www.sbert.net/)** - Text embeddings
- **[pgvector](https://github.com/pgvector/pgvector)** - Vector similarity search for PostgreSQL
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[Next.js](https://nextjs.org/)** - React framework for production

## 📧 Support

For questions and support:
- **Issues**: [GitHub Issues](https://github.com/yourusername/agentic-pdf-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/agentic-pdf-chatbot/discussions)

## 🗺️ Roadmap

- [ ] Add support for multiple document formats (DOCX, TXT, etc.)
- [ ] Implement user preferences and settings
- [ ] Add document sharing and collaboration features
- [ ] Support for custom LLM models
- [ ] Advanced analytics and usage statistics
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Export chat history to PDF/Markdown
- [ ] Batch document processing
- [ ] Enhanced vector search with re-ranking

---

<div align="center">

**Built with ❤️ using Next.js, FastAPI, and Groq**

[⬆ Back to Top](#-agentic-rag-pdf-chatbot)

</div>
