"""
Supabase client singleton for SmartFit AI backend.
Path: Code/backend/auth/supabase_client.py
"""

import os
from functools import lru_cache
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


@lru_cache()
def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_ANON_KEY missing from environment. "
            "Check Code/backend/.env"
        )
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


@lru_cache()
def get_supabase_admin() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_SERVICE_KEY missing from environment. "
            "Check Code/backend/.env"
        )
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)