from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.database import connect_to_mongo, close_mongo_connection
from .core.logging_config import setup_logging
from .routers import auth, users, jobs
from .exceptions import register_exception_handlers
from .routers import auth

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Interview Management Portal...")

    await connect_to_mongo()

    yield

    await close_mongo_connection()
    logger.info("Application shutdown completed.")


app = FastAPI(
    title="Interview Management Portal",
    description="Backend APIs for Interview Management Portal.",
    version="1.0.0",
    lifespan=lifespan,
)

register_exception_handlers(app)

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


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/auth", tags=["Users"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
