# CareerPilot AI 🚀

> **Resume Intelligence, Redefined.**  
> An AI-powered career co-pilot featuring ATS resume scoring, interactive mock interviews, skill gap analysis, and tailored career roadmap recommendations.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-SentenceTransformers-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql&logoColor=white)](https://supabase.com)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [API Endpoints Reference](#-api-endpoints-reference)
- [AI & Scoring Algorithms](#-ai--scoring-algorithms)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [License](#-license)

---

## 🌟 Overview

**CareerPilot AI** bridges the gap between job seekers and Applicant Tracking Systems (ATS). Modern hiring relies heavily on algorithmic screening and structured interviews. CareerPilot AI provides candidates with:

1. **Deterministic & Semantic ATS Scoring**: Parses PDF resumes, compares them against target job descriptions, identifies missing keywords, and grades match quality.
2. **AI Mock Interviews & Answer Evaluation**: Simulates domain-specific interviews and scores answers on technical depth, confidence, and communication quality.
3. **Skill Gap Roadmaps**: Highlights missing competencies for targeted industry roles and provides curated learning pathways.
4. **Holistic Career Path Recommendation**: Synthesizes education, experience, passions, and hobbies into personalized career archetypes with industry certifications.
5. **Ultra-Modern UI**: Sleek liquid glassmorphism interface with smooth animations and dynamic dashboards.

---

## ✨ Key Features

### 1. 📄 ATS Resume Analyzer
- **PDF Extraction**: Extracts clean text from uploaded PDF resumes via `pdfplumber` and `PyPDF2`.
- **Hybrid Scoring Engine**:
  - **60% Semantic Similarity**: Uses Hugging Face's `all-MiniLM-L6-v2` Sentence Transformer embeddings.
  - **40% Keyword Overlap**: Scikit-Learn TF-IDF vectorization with n-gram extraction.
- **Keyword Auditing**: Identifies matched vs. missing skills from an extensive tech skill taxonomy.
- **Actionable ATS Insights**: Highlights formatting, relevance, and keyword density improvements.

### 2. 🎯 AI Mock Interview Simulator
- **Role-Specific Question Bank**: Generates targeted questions across Frontend, Backend, Machine Learning, Full-Stack, and Behavioral categories.
- **Smart Scoring**: Evaluates candidate responses using semantic similarity against gold-standard answer rubrics.
- **Multi-Vector Feedback**: Grades responses on **Overall Score**, **Technical Accuracy**, **Confidence**, and **Communication**.

### 3. 🔍 Skill Gap Analyzer
- Evaluates candidate skill sets against benchmarks for specific industry roles.
- Returns matched skills, missing competencies, match percentage, and customized step-by-step learning roadmaps with official documentation links.

### 4. 🧭 AI Career Advisor & Archetype Matching
- Maps user experience, skills, hobbies, and personal passions to career archetypes (e.g., *AI/ML Engineer*, *Cloud DevOps Architect*, *Full-Stack Developer*, *Data Scientist*, *UI/UX Designer*).
- Suggests high-value industry certifications (AWS, Google Cloud, Meta, CKA, Terraform, etc.) and learning courses.

### 5. 📊 Analytics & Progress Dashboard
- Unified dashboard tracking historical ATS resume scores and mock interview performance over time using **Recharts**.
- Quick stats for average scores, total resumes analyzed, and interview readiness.

### 6. 🔒 Robust Authentication & Hybrid DB
- JWT (JSON Web Tokens) with `HS256` encryption and bcrypt password hashing.
- Dual-engine database driver: Automatically connects to **PostgreSQL (Supabase)** when configured, with seamless fallback to local **SQLite (`careerpilot.db`)** for zero-friction local development.

---

## 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React 19 Frontend (Vite)                 │
│  - Landing Page           - ATS Resume Scanner              │
│  - Mock Interview Room    - Skill Gap Analyzer              │
│  - Career Path Advisor    - Analytics & Profile             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (Axios)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                  │
│                                                             │
│  [API Routers]                                              │
│  ├── /api/auth          (JWT, bcrypt, session)              │
│  ├── /api/resume        (PDF Parser, skill extraction)      │
│  ├── /api/ats           (Hybrid TF-IDF & Semantic scorer)   │
│  ├── /api/interview     (Question generator & evaluator)    │
│  ├── /api/recommendation(Skill gap & career paths)          │
│  ├── /api/analytics     (Aggregated metrics & history)      │
│  └── /api/profile       (User profile & passions)           │
│                                                             │
│  [NLP & Machine Learning Layer]                             │
│  ├── Sentence Transformers (all-MiniLM-L6-v2)               │
│  ├── spaCy NLP pipeline (en_core_web_sm)                    │
│  ├── NLTK (Tokenization, Stopwords, Lemmatization)          │
│  └── Scikit-Learn (TF-IDF & Cosine Similarity)              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  Primary: PostgreSQL (Supabase pooler)                      │
│  Fallback: Local SQLite (careerpilot.db)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism styles
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Async Python ASGI)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/) & `pydantic-settings`
- **Security**: `python-jose`, `passlib[bcrypt]`

### AI / NLP / Parsing
- **Sentence Transformers**: `all-MiniLM-L6-v2` for dense semantic embeddings
- **spaCy**: `en_core_web_sm` for tokenization and entity matching
- **NLTK**: Tokenization, lemmatization, and stopwords filtering
- **Scikit-Learn**: TF-IDF keyword vectorization and pairwise cosine similarity
- **Document Extractors**: `pdfplumber`, `PyPDF2`, `python-docx`

### Database
- **PostgreSQL**: Production-grade connection pooling (Supabase) via `psycopg2`
- **SQLite3**: Built-in zero-config local fallback

---

## 📁 Project Structure

```text
resume/
├── backend/
│   ├── api/                     # FastAPI route handlers
│   │   ├── analytics.py         # ATS and interview stats
│   │   ├── ats.py               # ATS scan & history endpoints
│   │   ├── auth.py              # User registration & login
│   │   ├── interview.py         # Mock interview questions & scoring
│   │   ├── profile.py           # User profile & preferences
│   │   ├── recommendation.py    # Career paths & skill gap
│   │   └── resume.py            # PDF upload & parsing
│   ├── core/                    # App configuration & infrastructure
│   │   ├── config.py            # Pydantic settings & env loader
│   │   ├── database.py          # Dual PostgreSQL / SQLite driver
│   │   └── security.py          # JWT & password hashing
│   ├── models/                  # Pydantic request/response schemas
│   │   └── user.py
│   ├── services/                # Core AI / NLP algorithms
│   │   ├── ai_evaluator.py      # Answer evaluation & feedback
│   │   ├── ats_matcher.py       # Hybrid ATS matching engine
│   │   ├── career_advisor.py    # Career archetypes & recommendations
│   │   ├── nlp_setup.py         # Centralized spaCy/NLTK/Transformer loader
│   │   └── text_extractor.py    # PDF text parsing & skill extraction
│   ├── .env                     # Backend environment configuration
│   ├── main.py                  # FastAPI application entrypoint
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── public/                  # Static assets & background media
│   ├── src/
│   │   ├── assets/              # Icons and images
│   │   ├── components/          # Reusable UI components (BackgroundVideo, etc.)
│   │   ├── pages/               # Application views
│   │   │   ├── CareerRec.jsx     # Career recommendations & certifications
│   │   │   ├── Dashboard.jsx     # Dashboard layout & sidebar navigation
│   │   │   ├── DashboardHome.jsx # Analytics overview & quick stats
│   │   │   ├── Landing.jsx       # Landing page with CTA
│   │   │   ├── Login.jsx         # User login form
│   │   │   ├── MockInterview.jsx # Interactive interview simulator
│   │   │   ├── Profile.jsx       # User profile, skills, passions
│   │   │   ├── Register.jsx      # User registration form
│   │   │   ├── ResumeUpload.jsx  # Resume ATS scanner & keyword report
│   │   │   └── SkillGap.jsx      # Skill gap calculator & roadmaps
│   │   ├── services/            # Axios API client setup
│   │   ├── store/               # AuthContext & global state
│   │   ├── App.jsx              # Main routing configuration
│   │   ├── index.css            # Global CSS & glassmorphic tokens
│   │   └── main.jsx             # React entrypoint
│   ├── package.json             # NPM dependencies & scripts
│   ├── tailwind.config.js       # Tailwind configuration
│   └── vite.config.js           # Vite build configuration
│
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.10 or higher ([Download Python](https://www.python.org/))
- **Git**: ([Download Git](https://git-scm.com/))

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Download required NLP models (spaCy & NLTK)**:
   The backend will auto-download missing models on startup, but you can pre-fetch them manually:
   ```bash
   python -m spacy download en_core_web_sm
   python -c "import nltk; nltk.download(['stopwords', 'punkt', 'wordnet', 'averaged_perceptron_tagger'])"
   ```

5. **Configure environment variables**:
   Create or verify `backend/.env`:
   ```env
   PROJECT_NAME="CareerPilot AI"
   DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>"
   SECRET_KEY="your_super_secret_jwt_key_here"
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   ```
   > 💡 *Note: If `DATABASE_URL` is omitted or unavailable, the backend gracefully defaults to a local SQLite database (`careerpilot.db`).*

6. **Start the FastAPI backend server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Backend will be running at: `http://localhost:8000`  
   Interactive API docs (Swagger UI): `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install NPM dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to: `http://localhost:5173`

---

## ⚙️ Configuration & Environment Variables

### Backend (`backend/.env`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `PROJECT_NAME` | String | `CareerPilot AI` | Application display name |
| `DATABASE_URL` | String | *None* | PostgreSQL / Supabase connection URI |
| `DATABASE_FILE` | String | `careerpilot.db` | Local SQLite database fallback file |
| `SECRET_KEY` | String | `supersecretkey_change_in_production` | Secret key used to sign JWT tokens |
| `ALGORITHM` | String | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Integer | `10080` (7 days) | Token expiration duration |

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register`: Create a new user account with hashed password.
- `POST /api/auth/login`: Authenticate and receive a Bearer JWT access token.

### 📄 Resume Management (`/api/resume`)
- `POST /api/resume/upload`: Upload PDF resume, extract text, and parse technical skills.
- `GET /api/resume/my-resumes`: Retrieve recent uploaded resumes for the current user.

### 🎯 ATS Analyzer (`/api/ats`)
- `POST /api/ats/analyze`: Score resume against a job description; outputs similarity score, matched keywords, and missing keywords.
- `GET /api/ats/history`: List user's past ATS audit reports with detailed insights.

### 🎙️ Mock Interview (`/api/interview`)
- `POST /api/interview/generate-questions`: Generate role-specific interview questions.
- `POST /api/interview/submit-answers`: Evaluate answers against model templates for technical, confidence, and communication scores.

### 💡 Recommendations & Skills (`/api/recommendation`)
- `POST /api/recommendation/skill-gap`: Calculate skill coverage against target job requirements and output study roadmaps.
- `GET /api/recommendation/career-paths`: Get career path suggestions, certifications, and recommended learning resources based on profile.

### 👤 Profile (`/api/profile`)
- `GET /api/profile`: Retrieve user profile, skills, education, hobbies, and career goals.
- `POST /api/profile`: Update profile attributes and trigger career archetype re-computation.

### 📊 Analytics (`/api/analytics`)
- `GET /api/analytics/summary`: Aggregate metrics including average ATS scores, interview scores, and scan history.

---

## 🧠 AI & Scoring Algorithms

### ATS Match Engine
$$\text{Score} = (0.60 \times \text{Semantic Cosine Similarity}) + (0.40 \times \text{TF-IDF Cosine Similarity})$$
- **Semantic Vector**: Encoded with `all-MiniLM-L6-v2` to understand conceptual alignment (e.g., matching "PostgreSQL" with "Relational Database").
- **TF-IDF Keyword Vector**: Verifies presence of exact industry terms and technical stack requirements.
- **Fail-Safe Mode**: If PyTorch/CUDA/Transformers are not supported on the host, the engine automatically falls back to an enhanced TF-IDF algorithm.

### Answer Evaluation
Candidate answers are evaluated by comparing embeddings against high-scoring model responses:
- **Technical Accuracy**: Cosine similarity against gold-standard concepts.
- **Communication & Confidence**: Sentence structure, length, clarity, and absence of filler phrases.

---

## 🛠️ Troubleshooting & FAQs

### 1. `torch.utils._pytree` or SentenceTransformer import error
The project includes a patch in `backend/services/nlp_setup.py` for PyTorch 2.1+ compatibility. If PyTorch fails on your machine, CareerPilot AI automatically falls back to Scikit-Learn TF-IDF scoring without crashing.

### 2. Database connection failure
If your Supabase or PostgreSQL database is unreachable, the system will log a warning and fall back to SQLite (`careerpilot.db`). Ensure your PostgreSQL IP whitelist / connection string is up to date if you wish to use Supabase.

### 3. Port conflicts
- Default backend port: `8000` (change with `uvicorn main:app --port <NEW_PORT>`)
- Default frontend port: `5173` (change in `vite.config.js` or `npm run dev -- --port <NEW_PORT>`)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for job seekers aiming to supercharge their careers.
</p>
