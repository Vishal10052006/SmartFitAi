"""
Path: Code/backend/auth/schemas.py
"""

from pydantic import BaseModel, EmailStr, Field


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Minimum 8 characters")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    status: str
    user_id: str | None = None
    email: str | None = None
    access_token: str | None = None
    refresh_token: str | None = None
    message: str | None = None