import hmac

from fastapi import HTTPException, Request, status

from core.config import settings


PUBLIC_PATHS = {
    f"{settings.API_V1_STR}/health",
    "/health",
}


def authenticate_request(request: Request) -> None:
    """Require a deployment API key for every non-public API operation."""
    if not settings.AUTH_REQUIRED:
        return

    configured_key = (settings.THREATMAP_API_KEY or "").strip()
    if not configured_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API authentication is enabled but THREATMAP_API_KEY is not configured.",
        )

    authorization = request.headers.get("authorization", "")
    bearer = authorization[7:].strip() if authorization.lower().startswith("bearer ") else ""
    supplied_key = request.headers.get("x-api-key", "").strip() or bearer
    if not supplied_key or not hmac.compare_digest(supplied_key, configured_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid API authentication is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
