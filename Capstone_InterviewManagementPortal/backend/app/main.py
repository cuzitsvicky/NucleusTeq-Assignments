from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .routers import auth
from .core.logging_config import setup_logging
from .handlers import register_exception_handlers

# Setup logging
setup_logging()
logger = logging.getLogger("app")

# Create FastAPI app
app = FastAPI(title="Interview Management Portal")

# Register exception handlers
register_exception_handlers(app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
