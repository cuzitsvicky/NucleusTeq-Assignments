import logging
from typing import Optional

from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorDatabase,
    AsyncIOMotorGridFSBucket,
)

from .config import settings
import asyncio

logger = logging.getLogger("app")

# Shared MongoDB objects
client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None
fs: Optional[AsyncIOMotorGridFSBucket] = None


async def connect_to_mongo() -> None:
    """
    Initialize the MongoDB client, database and GridFS bucket.
    Call this once during FastAPI startup.
    """
    global client, _db, fs

    try:
        if client is None:
            logger.info("Connecting to MongoDB...")

            client = AsyncIOMotorClient(settings.MONGO_URI)
            await client.admin.command("ping")  # Verify connection

            _db = client[settings.DB_NAME]
            fs = AsyncIOMotorGridFSBucket(_db)

            logger.info(
                "Connected to MongoDB database '%s'",
                settings.DB_NAME,
            )

    except Exception:
        logger.exception("Failed to connect to MongoDB")
        raise


async def close_mongo_connection() -> None:
    """
    Close the MongoDB client.
    Call this once during FastAPI shutdown.
    """
    global client, _db, fs

    try:
        if client is not None:
            client.close()

        client = None
        _db = None
        fs = None

        logger.info("MongoDB connection closed.")

    except Exception:
        logger.exception("Failed to close MongoDB connection")
        raise


def get_active_db() -> AsyncIOMotorDatabase:
    """
    Return the active MongoDB database.
    """
    if _db is None:
        raise RuntimeError(
            "MongoDB has not been initialized. "
            "Ensure connect_to_mongo() is called during application startup."
        )

    return _db


class DatabaseProxy:
    """
    Backward-compatible proxy so existing code like
    db.users or db["users"] continues to work.
    """

    def __getattr__(self, name: str):
        return getattr(get_active_db(), name)

    def __getitem__(self, name: str):
        return get_active_db()[name]


db = DatabaseProxy()


def get_gridfs_bucket() -> AsyncIOMotorGridFSBucket:
    """
    Return the initialized GridFS bucket.
    """
    if fs is None:
        raise RuntimeError(
            "GridFS has not been initialized. "
            "Ensure connect_to_mongo() is called during application startup."
        )

    return fs
