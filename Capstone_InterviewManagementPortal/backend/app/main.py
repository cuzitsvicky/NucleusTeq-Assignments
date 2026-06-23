from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .core.logging_config import setup_logging
from .handlers import register_exception_handlers

setup_logging()
logger = logging.getLogger("app")

app = FastAPI(title="Interview Management Portal")

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)