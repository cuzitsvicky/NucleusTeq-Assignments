from pymongo import MongoClient
import gridfs
from ..core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]
# Create a GridFS instance for file operations
fs = gridfs.GridFS(db)
