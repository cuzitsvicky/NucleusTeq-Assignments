from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import connect_to_mongo, close_mongo_connection
from .core.logging_config import setup_logging
from .exceptions import register_exception_handlers
from .routers import auth, users, jobs, candidates, interviews, dashboard

# Setup logging configuration
setup_logging()

logger = logging.getLogger(__name__)

# Lifespan context manager for FastAPI application
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Interview Management Portal...")

    await connect_to_mongo()

    yield

    await close_mongo_connection()
    logger.info("Application shutdown completed.")

# FastAPI application instance
app = FastAPI(
    title="Interview Management Portal",
    description="Backend APIs for Interview Management Portal.",
    version="1.0.0",
    lifespan=lifespan,
)

# Register exception handlers for the FastAPI application
register_exception_handlers(app)

# Configure CORS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Interview Management Portal API",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
    }

# Register API routers for different modules of the application
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/auth", tags=["Users"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])