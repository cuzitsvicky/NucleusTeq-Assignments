from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from .config import settings
import asyncio

_clients = {}

def get_active_db():
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
        
    if loop not in _clients:
        _clients[loop] = AsyncIOMotorClient(settings.MONGO_URI)
    return _clients[loop][settings.DB_NAME]

class ClientProxy:
    def __getattr__(self, name):
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None
            
        if loop not in _clients:
            _clients[loop] = AsyncIOMotorClient(settings.MONGO_URI)
        return getattr(_clients[loop], name)

client = ClientProxy()

class DatabaseProxy:
    def __getattr__(self, name):
        return getattr(get_active_db(), name)
        
    def __getitem__(self, name):
        return get_active_db()[name]

db = DatabaseProxy()

class LazyGridFSBucket:
    def __init__(self):
        self._buckets = {}

    @property
    def bucket(self):
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None
            
        if loop not in self._buckets:
            self._buckets[loop] = AsyncIOMotorGridFSBucket(get_active_db())
        return self._buckets[loop]

    def __getattr__(self, name):
        return getattr(self.bucket, name)

fs = LazyGridFSBucket()
