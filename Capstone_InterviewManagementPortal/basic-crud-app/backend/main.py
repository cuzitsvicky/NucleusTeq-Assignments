from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
import httpx
import logging
from dotenv import load_dotenv

# Load local .env file if it exists
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("basic-crud-backend")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "basic_crud_db")
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "interview-portal")

db_client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_client, db
    logger.info(f"Connecting to MongoDB at {MONGO_URI}...")
    db_client = AsyncIOMotorClient(MONGO_URI)
    db = db_client[DB_NAME]
    logger.info(f"Connected to database: {DB_NAME}")
    yield
    db_client.close()
    logger.info("MongoDB connection closed.")

app = FastAPI(title="Basic CRUD Backend (FastAPI)", lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication logic
async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header"
        )
    
    token = authorization.split(" ")[1]
    userinfo_url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/userinfo"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(userinfo_url, headers={"Authorization": f"Bearer {token}"})
            if response.status_code == 200:
                user_data = response.json()
                if not user_data.get("email"):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Keycloak token does not contain email"
                    )
                return user_data
            else:
                logger.warning(f"Keycloak token verification failed: {response.status_code} {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )
    except httpx.RequestError as exc:
        logger.error(f"Error communicating with Keycloak: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

# Pydantic Schemas
class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "Pending"

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Serializer helper
def serialize_item(item: dict) -> dict:
    item_copy = dict(item)
    if "_id" in item_copy:
        item_copy["_id"] = str(item_copy["_id"])
    if "createdAt" in item_copy and isinstance(item_copy["createdAt"], datetime):
        item_copy["createdAt"] = item_copy["createdAt"].isoformat()
    return item_copy

# API Routes

@app.get("/api/items")
async def get_items(current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    cursor = db["items"].find({"ownerEmail": email}).sort("createdAt", -1)
    items = []
    async for document in cursor:
        items.append(serialize_item(document))
    return items

@app.post("/api/items", status_code=201)
async def create_item(item_data: ItemCreate, current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    if not item_data.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
        
    new_item = {
        "title": item_data.title,
        "description": item_data.description,
        "status": item_data.status,
        "ownerEmail": email,
        "createdAt": datetime.utcnow()
    }
    result = await db["items"].insert_one(new_item)
    new_item["_id"] = result.inserted_id
    return serialize_item(new_item)

@app.put("/api/items/{item_id}")
async def update_item(item_id: str, item_data: ItemUpdate, current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID format")
        
    item = await db["items"].find_one({"_id": ObjectId(item_id), "ownerEmail": email})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or unauthorized")
        
    update_fields = {}
    if item_data.title is not None:
        update_fields["title"] = item_data.title
    if item_data.description is not None:
        update_fields["description"] = item_data.description
    if item_data.status is not None:
        update_fields["status"] = item_data.status
        
    if update_fields:
        await db["items"].update_one({"_id": ObjectId(item_id)}, {"$set": update_fields})
        item = await db["items"].find_one({"_id": ObjectId(item_id)})
        
    return serialize_item(item)

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str, current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID format")
        
    result = await db["items"].delete_one({"_id": ObjectId(item_id), "ownerEmail": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found or unauthorized")
        
    return {"message": "Item deleted successfully"}

@app.get("/health")
async def health():
    db_status = "disconnected"
    if db_client:
        try:
            await db_client.admin.command('ismaster')
            db_status = "connected"
        except Exception as e:
            logger.error(f"Health check MongoDB connection error: {e}")
            
    return {
        "status": "healthy",
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
