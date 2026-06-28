import asyncio
import logging
from typing import Optional

from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorDatabase,
    AsyncIOMotorGridFSBucket,
)

from .config import settings

logger = logging.getLogger("app")

client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None
fs: Optional[AsyncIOMotorGridFSBucket] = None
_client_loop: Optional[asyncio.AbstractEventLoop] = None


def _ensure_client() -> AsyncIOMotorClient:
    global client, _db, fs, _client_loop

    loop = asyncio.get_running_loop()
    if client is None or _client_loop is not loop or _client_loop.is_closed():
        if client is not None:
            client.close()
        client = AsyncIOMotorClient(settings.MONGO_URI, io_loop=loop)
        _db = client[settings.DB_NAME]
        fs = None
        _client_loop = loop
    return client


def get_active_db() -> AsyncIOMotorDatabase:
    _ensure_client()
    if _db is None:
        raise RuntimeError("MongoDB database is not initialized")
    return _db


class DatabaseProxy:
    def __getattr__(self, name: str):
        return getattr(get_active_db(), name)

    def __getitem__(self, name: str):
        return get_active_db()[name]


db = DatabaseProxy()


def get_gridfs_bucket() -> AsyncIOMotorGridFSBucket:
    global fs

    if fs is None:
        fs = AsyncIOMotorGridFSBucket(get_active_db())
    return fs


async def connect_to_mongo() -> None:
    try:
        active_client = _ensure_client()
        await active_client.admin.command("ping")
        get_gridfs_bucket()
        logger.info("Connected to MongoDB database '%s'", settings.DB_NAME)
    except Exception:
        logger.exception("Failed to connect to MongoDB")
        raise


async def close_mongo_connection() -> None:
    global client, _db, fs, _client_loop

    try:
        if client is not None:
            client.close()
        client = None
        _db = None
        fs = None
        _client_loop = None
        logger.info("Closed MongoDB connection")
    except Exception:
        logger.exception("Failed to close MongoDB connection")
        raise
