"""
Path: Code/backend/auth/rate_limiter.py
Shared limiter instance so both main.py and routes.py reference the same one.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)