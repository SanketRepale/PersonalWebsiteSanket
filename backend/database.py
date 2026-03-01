from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import datetime

# Vercel / Production deployment requires a permanent database (like PostgreSQL/Vercel Postgres)
# SQLite is used locally for development
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Vercel's serverless functions are read-only except for the /tmp directory
    if os.getenv("VERCEL") == "1":
        DATABASE_URL = "sqlite:////tmp/portfolio.db"
    else:
        DATABASE_URL = "sqlite:///./portfolio.db"

# Fix for older SQLAlchemy vs newer Postgres connection string schemes
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Only SQLite needs check_same_thread
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ContactMessage(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    recovery_pin_hash = Column(String)

Base.metadata.create_all(bind=engine)
