import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .custom_exceptions import AppException

logger = logging.getLogger("app")


def _error_response(status_code: int, error: str, detail, headers: dict = None):
    """
    Unified error response structure for every error in the system.
    {
        "success": false,
        "status_code": 404,
        "error": "Not Found",
        "detail": "Candidate not found"
    }
    """
    content = {
        "success": False,
        "status_code": status_code,
        "error": error,
        "detail": detail,
    }
    return JSONResponse(status_code=status_code, content=content, headers=headers or {})


def register_exception_handlers(app: FastAPI):

    # ── 1. Our own custom AppException and all its subclasses ────────────────
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        error_map = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            409: "Conflict",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
        }
        error_label = error_map.get(exc.status_code, "Error")
        logger.warning(
            f"[{exc.status_code}] {error_label} | "
            f"Path: {request.url.path} | Detail: {exc.detail}"
        )
        return _error_response(
            status_code=exc.status_code,
            error=error_label,
            detail=exc.detail,
            headers=exc.headers,
        )

    # ── 2. Pydantic / FastAPI request validation errors (422) ─────────────────
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        errors = []
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"] if loc != "body")
            errors.append(
                {
                    "field": field if field else "request",
                    "message": error["msg"].replace("Value error, ", ""),
                    "type": error["type"],
                }
            )
        logger.warning(
            f"[422] Validation Error | Path: {request.url.path} | Errors: {errors}"
        )
        return _error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error="Validation Error",
            detail=errors,
        )

    # ── 3. Starlette / FastAPI HTTP exceptions (404 from router, 405, etc.) ───
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        error_map = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            409: "Conflict",
            422: "Unprocessable Entity",
            500: "Internal Server Error",
        }
        error_label = error_map.get(exc.status_code, "HTTP Error")
        logger.warning(
            f"[{exc.status_code}] {error_label} | "
            f"Path: {request.url.path} | Detail: {exc.detail}"
        )
        return _error_response(
            status_code=exc.status_code,
            error=error_label,
            detail=exc.detail,
            headers=dict(exc.headers) if exc.headers else {},
        )

    # ── 4. Catch-all for any unhandled Python exception ───────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception(
            f"[500] Unhandled Exception | Path: {request.url.path} | Error: {str(exc)}"
        )
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error="Internal Server Error",
            detail="An unexpected error occurred. Please try again later.",
        )
