"""
Path: Code/backend/auth/routes.py
"""

from fastapi import APIRouter, HTTPException
from auth.supabase_client import get_supabase
from auth.schemas import SignUpRequest, LoginRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignUpRequest):
    supabase = get_supabase()
    try:
        result = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if result.user is None:
        raise HTTPException(status_code=400, detail="Sign up failed — no user returned.")

    if result.session is None:
        return AuthResponse(
            status="pending_confirmation",
            user_id=result.user.id,
            email=result.user.email,
            message="Account created. Check your email to confirm before logging in."
        )

    return AuthResponse(
        status="success",
        user_id=result.user.id,
        email=result.user.email,
        access_token=result.session.access_token,
        refresh_token=result.session.refresh_token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    supabase = get_supabase()
    try:
        result = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if result.user is None or result.session is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return AuthResponse(
        status="success",
        user_id=result.user.id,
        email=result.user.email,
        access_token=result.session.access_token,
        refresh_token=result.session.refresh_token,
    )