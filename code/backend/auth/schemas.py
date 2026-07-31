from pydantic import BaseModel, EmailStr, Field


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Minimum 8 characters")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class AuthResponse(BaseModel):
    status: str
    user_id: str | None = None
    email: str | None = None
    access_token: str | None = None
    refresh_token: str | None = None
    message: str | None = None


class ProfileUpdate(BaseModel):
    """Payload the frontend sends when onboarding completes (or later,
    when a Settings screen exists, when the user edits their answers)."""
    onboarding_complete: bool = True
    gender: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    lifestyle: list[str] | None = None


class ProfileResponse(BaseModel):
    onboarding_complete: bool
    gender: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    lifestyle: list[str] | None = None