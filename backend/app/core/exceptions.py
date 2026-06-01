from typing import Any, Dict, Optional
from fastapi import HTTPException, status

class APIException(HTTPException):
    """
    Base API Exception used to ensure responses are standard across the system.
    Prevents leaking raw stack traces to the client.
    """
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: Any = "An unexpected error occurred.",
        headers: Optional[Dict[str, str]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class AuthenticationFailedException(APIException):
    """Raised when passwords mismatch or tokens are invalid/expired."""
    def __init__(self, detail: str = "Invalid authentication credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

class ForbiddenException(APIException):
    """Raised when a user is authenticated but lacks access rights (e.g., modifying another user's flat)."""
    def __init__(self, detail: str = "Not enough permissions to perform action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )

class ResourceNotFoundException(APIException):
    """Raised when trying to lookup a metric, flat, or user that does not exist."""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )

class ConflictException(APIException):
    """Raised during constraint violations (e.g., user already exists, or already joined flat)."""
    def __init__(self, detail: str = "Data conflict detected"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )

class ValidationException(APIException):
    """Raised when a business rule fails (e.g., trying to complete a workout in the future)."""
    def __init__(self, detail: str = "Unprocessable entity"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )
