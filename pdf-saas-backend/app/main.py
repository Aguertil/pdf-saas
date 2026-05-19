from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.database import engine, Base
from app.routes import auth, pdfs

# Créer les tables
Base.metadata.create_all(bind=engine)

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# App
app = FastAPI(
    title="PDFMaster API",
    version="0.1.0",
    description="API pour éditer des PDFs en ligne"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(pdfs.router)

# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "message": "PDFMaster API",
        "version": "0.1.0",
        "docs": "/docs"
    }

logger.info("✅ PDFMaster Backend started successfully!")
