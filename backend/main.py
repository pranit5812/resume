from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import connect_to_db, close_db_connection
from core.config import settings
from api import auth, resume, ats, interview, analytics, recommendation, profile


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up database...")
    try:
        await connect_to_db()
        print("Database connected")
    except Exception as exc:
        print(f"Database startup failed: {exc}")
        print("Continuing without DB connection; get_db() will attempt to connect on demand.")

    # Pre-load all NLP models on startup
    print("Loading NLP models (spaCy, NLTK, Sentence Transformers)...")
    try:
        import asyncio
        await asyncio.to_thread(__import__, "services.nlp_setup", fromlist=["NLP"])
        print("NLP models loaded successfully.")
    except Exception as exc:
        print(f"NLP model loading warning: {exc}")

    yield


    print("Shutting down database...")
    try:
        await close_db_connection()
        print("Database closed")
    except Exception as exc:
        print(f"Error closing database: {exc}")

app = FastAPI(lifespan=lifespan, title=settings.PROJECT_NAME)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(ats.router, prefix="/api/ats", tags=["ats"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(recommendation.router, prefix="/api/recommendation", tags=["recommendation"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CareerPilot AI Backend"}
