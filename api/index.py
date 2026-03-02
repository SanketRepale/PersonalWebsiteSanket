# Trigger new deployment with sys.path fix
import secrets
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List

import hashlib
from contextlib import asynccontextmanager
import sys
import os
import logging
from dotenv import load_dotenv

# Set up logging for Vercel Runtime Logs check
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Initializing FastAPI Backend...")

# Explicitly add the backend folder to Vercel's Python Path so it can find database.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, ContactMessage, AdminUser, engine

load_dotenv() # Load variables from .env file locally if present

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create default admin if not exists
    db = SessionLocal()
    from sqlalchemy import text
    try:
        # Migrate DB safely if SQLite vs Postgres
        if engine.dialect.name == "sqlite":
            db.execute(text("ALTER TABLE admin_users ADD COLUMN recovery_pin_hash VARCHAR"))
        else:
            db.execute(text("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS recovery_pin_hash VARCHAR"))
        db.commit()
    except Exception:
        db.rollback() # Column likely already exists
        
    admin = db.query(AdminUser).first()
    
    # Use Environment variables for Production GitHub/Vercel Security, fallback to defaults for local dev setup
    default_user = os.getenv("ADMIN_USERNAME", "admin@example.com")
    default_pass = os.getenv("ADMIN_PASSWORD", "admin123")
    default_pin = os.getenv("ADMIN_RECOVERY_PIN", "12345")
    
    default_pin_hash = get_password_hash(default_pin)
    
    if not admin:
        logger.info("Creating default Admin user on startup.")
        new_admin = AdminUser(
            username=default_user, 
            password_hash=get_password_hash(default_pass),
            recovery_pin_hash=default_pin_hash
        )
        db.add(new_admin)
        db.commit()
    elif not admin.recovery_pin_hash:
        admin.recovery_pin_hash = default_pin_hash
        db.commit()
    db.close()
    yield

app = FastAPI(title="Portfolio API", lifespan=lifespan)
security = HTTPBasic()

# Allow CORS for front-end access dynamically via ENV
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to verify Admin Credentials
def get_current_admin(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    admin = db.query(AdminUser).first()
    
    env_user = os.getenv("ADMIN_USERNAME", "admin@example.com").strip()
    env_pass = os.getenv("ADMIN_PASSWORD", "admin123").strip()
    env_pin = os.getenv("ADMIN_RECOVERY_PIN", "12345").strip()

    if not admin:
        # Vercel Serverless environment fallback. Seed it.
        admin = AdminUser(
            username=env_user, 
            password_hash=get_password_hash(env_pass),
            recovery_pin_hash=get_password_hash(env_pin)
        )
        db.add(admin)
        db.commit()
    elif admin.username == "admin@example.com" and env_user != "admin@example.com":
        # System restarted with new ENVs but old /tmp/ DB exists. Force sync.
        admin.username = env_user
        admin.password_hash = get_password_hash(env_pass)
        admin.recovery_pin_hash = get_password_hash(env_pin)
        db.commit()

    db_correct_user = admin and secrets.compare_digest(credentials.username, admin.username)
    db_correct_pass = admin and secrets.compare_digest(get_password_hash(credentials.password), admin.password_hash)

    env_correct_user = secrets.compare_digest(credentials.username, env_user)
    env_correct_pass = secrets.compare_digest(credentials.password, env_pass)

    if not ((db_correct_user and db_correct_pass) or (env_correct_user and env_correct_pass)):
        logger.warning(f"Failed login attempt for username: {credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    logger.info(f"Successful admin login: {credentials.username}")
    return admin

# Pydantic models for request validation and response formatting
class MessageCreate(BaseModel):
    name: str
    email: str
    message: str

class MessageResponse(MessageCreate):
    id: int
    created_at: str

    class Config:
        from_attributes = True

@app.post("/api/contact", response_model=MessageResponse)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    db_message = ContactMessage(
        name=message.name,
        email=message.email,
        message=message.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    db_message.created_at = db_message.created_at.isoformat()
    return db_message

@app.get("/api/messages", response_model=List[MessageResponse])
def get_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit).all()
    for msg in messages:
        msg.created_at = msg.created_at.isoformat()
    return messages

@app.delete("/api/messages/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"status": "success", "message": "Message deleted successfully"}

class CredentialsUpdate(BaseModel):
    new_username: EmailStr
    new_password: str
    new_recovery_pin: str

@app.put("/api/admin/credentials")
def update_credentials(creds: CredentialsUpdate, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    admin.username = creds.new_username
    admin.password_hash = get_password_hash(creds.new_password)
    admin.recovery_pin_hash = get_password_hash(creds.new_recovery_pin)
    db.commit()
    return {"status": "success", "message": "Credentials updated successfully"}

class PasswordReset(BaseModel):
    username: EmailStr
    recovery_pin: str
    new_password: str

@app.post("/api/admin/reset-password")
def reset_password(reset: PasswordReset, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == reset.username).first()
    if not admin:
        raise HTTPException(status_code=400, detail="Invalid username or recovery PIN")
    
    if not secrets.compare_digest(get_password_hash(reset.recovery_pin), admin.recovery_pin_hash):
        raise HTTPException(status_code=400, detail="Invalid username or recovery PIN")
        
    admin.password_hash = get_password_hash(reset.new_password)
    db.commit()
    return {"status": "success", "message": "Password reset successfully"}
