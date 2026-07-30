from fastapi import APIRouter, HTTPException, Depends
from auth.supabase_client import get_supabase
from auth.schemas import SignUpRequest, LoginRequest, ForgotPasswordRequest, AuthResponse
from auth.dependencies import get_current_user

from auth.rate_limiter import limiter
from fastapi import APIRouter, HTTPException, Depends, Request

router = APIRouter(prefix="/auth", tags=["Authentication"])

# WHY hardcoded here instead of env var right now: this is the one URL
# that MUST match what's registered in Supabase's redirect allowlist.
# Keeping it visible in code (not buried in .env) makes it obvious when
# you're about to deploy and need to change it for production.
FRONTEND_URL = "http://localhost:5173"


@router.post("/signup", response_model=AuthResponse)
@limiter.limit("5/minute")
async def signup(request: Request, payload: SignUpRequest):
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
@limiter.limit("10/minute")
async def login(request: Request, payload: LoginRequest):
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


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, payload: ForgotPasswordRequest):
    """
    Triggers Supabase's built-in password reset email (magic link).

    SECURITY NOTE: We always return the same success message regardless
    of whether the email exists in the system. This prevents user
    enumeration — an attacker probing random emails should not be able
    to tell which ones are registered based on the response.
    """
    supabase = get_supabase()

    try:
        supabase.auth.reset_password_for_email(
            payload.email,
            options={
                "redirect_to": f"{FRONTEND_URL}/reset-password"
            }
        )
    except Exception as e:
        # Even on internal error, don't leak details — log server-side only
        print(f"forgot_password error for {payload.email}: {e}")

    return {
        "status": "success",
        "message": "If an account exists with that email, a password reset link has been sent."
    }


@router.get("/google")
async def google_oauth_url():
    """
    Returns the Google OAuth URL for the frontend to redirect the browser to.

    FLOW:
    1. Frontend calls this endpoint
    2. Frontend does window.location.href = returned URL
    3. User authenticates with Google
    4. Google redirects to Supabase's callback (registered in Google Console)
    5. Supabase creates/finds the user, then redirects to FRONTEND_URL
       with access_token + refresh_token in the URL fragment (#...)
    6. Frontend reads the fragment and stores the session (see AuthContext update below)
    """
    supabase = get_supabase()

    result = supabase.auth.sign_in_with_oauth({
        "provider": "google",
        "options": {
            "redirect_to": FRONTEND_URL
        }
    })

    return {
        "status": "success",
        "url": result.url
    }


@router.get("/me")
async def get_me(user = Depends(get_current_user)):
    return {
        "status": "success",
        "user_id": user.id,
        "email": user.email,
        "created_at": str(user.created_at) if user.created_at else None,
    }