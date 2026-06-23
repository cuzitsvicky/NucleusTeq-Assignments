import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "Interview_Management_Portal")

settings = Settings()
