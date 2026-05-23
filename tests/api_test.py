import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add api folder to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'api')))

# Set environment variables for testing before importing
os.environ["DATABASE_URL"] = "sqlite:///./test_portfolio.db"
os.environ["ADMIN_USERNAME"] = "admin@example.com"
os.environ["ADMIN_PASSWORD"] = "admin123"

from index import app, get_password_hash

client = TestClient(app)

def test_contact_submission():
    with TestClient(app) as client:
        response = client.post(
            "/api/contact",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "message": "This is a test message from Pytest!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test User"
        assert data["email"] == "test@example.com"
        assert "id" in data

def test_get_messages_unauthorized():
    with TestClient(app) as client:
        response = client.get("/api/messages")
        assert response.status_code == 401

def test_get_messages_authorized():
    with TestClient(app) as client:
        # Use the default test credentials set in lifespan
        response = client.get("/api/messages", auth=("admin@example.com", "admin123"))
        assert response.status_code == 200
        assert isinstance(response.json(), list)
