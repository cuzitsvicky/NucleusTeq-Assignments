from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .core.database import close_mongo_connection, connect_to_mongo
from .core.logging_config import setup_logging
<<<<<<< HEAD
from .routers import auth, users
=======
from .routers import auth
>>>>>>> 08fb3b28937a3a8ed1083bd53e6092851205540a
from .exceptions import register_exception_handlers

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    try:
        yield
    finally:
        await close_mongo_connection()


app = FastAPI(title="Interview Management Portal", lifespan=lifespan)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/auth", tags=["Users"])
