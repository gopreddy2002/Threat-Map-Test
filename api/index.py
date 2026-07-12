"""
Vercel serverless function entry point
Imports the FastAPI app from backend and exposes handler for Vercel
"""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the handler from main.py
from main import handler

# Export handler for Vercel
__all__ = ['handler']
