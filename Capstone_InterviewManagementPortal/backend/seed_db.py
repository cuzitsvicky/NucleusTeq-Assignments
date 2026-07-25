import os
from pymongo import MongoClient
from app.utils import get_password_encoded


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["Interview_Management_Portal"]

users = [
    {"name": "System Admin",      "email": "admin@nucleusteq.com",       "password": get_password_encoded("admin1"), "role": "Admin",       "active": True, "reset_required": False},
    {"name": "HR Manager",        "email": "hr@nucleusteq.com",          "password": get_password_encoded("hr1234"), "role": "HR",          "active": True, "reset_required": False},
    {"name": "Senior Interviewer","email": "interviewer@nucleusteq.com", "password": get_password_encoded("int123"), "role": "Interviewer", "active": True, "reset_required": False},
]

for user in users:
    if not db.users.find_one({"email": user["email"]}):
        db.users.insert_one(user)
        print(f"Created user: {user['email']}")
    else:
        print(f"User {user['email']} already exists.")

print("Database seeding completed.")