"""
FastAPI dependency that validates a Supabase JWT on incoming requests.

Usage on any route:
    @app.get("/protected")
    async def protected_route(user = Depends(get_current_user)):
        ...

WHY get_user() INSTEAD OF LOCAL DECODE:
supabase.auth.get_user(token) calls Supabase's auth server to validate
the token. This means expired sessions, revoked refresh tokens, and
banned users are all correctly rejected without us having to replicate
that logic locally. Trade-off is one extra network hop per protected
request — acceptable for MVP traffic levels.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth.supabase_client import get_supabase

# auto_error=False so we control the 401 response format ourselves
# instead of FastAPI's default "Not authenticated" text
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """
    Extracts and validates the Authorization: Bearer <token> header.

    Returns:
        Supabase User object (has .id, .email, .created_at, etc.)

    Raises:
        401 if header is missing, malformed, or token is invalid/expired.
    """

    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected: Bearer <token>"
        )

    token = credentials.credentials
    supabase = get_supabase()

    try:
        response = supabase.auth.get_user(token)
    except Exception:
        # Supabase client raises on invalid/expired/malformed tokens —
        # never leak the raw exception to the client
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )

    if response is None or response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )

    return response.user