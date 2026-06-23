from pymongo import MongoClient
import gridfs
from ..core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]
fs = gridfs.GridFS(db)
