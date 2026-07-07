import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .custom_exceptions import AppException

logger = logging.getLogger(__name__)


def error_response( status_code: int, message: str, headers: dict | None = None, errors: list | None = None,):
    """
    Return a JSON response for error cases.
    """
    content = {"success": False, "status_code": status_code,"message": message,}

    if errors:
        content["errors"] = errors

    return JSONResponse(status_code=status_code, content=content, headers=headers,)


def format_validation_errors(exc: RequestValidationError | ValidationError):
    """
    Return JSON-safe validation errors with user-readable messages.
    """
    return [
        {
            "field": (
                ".".join(map(str, error["loc"][1:]))
                if isinstance(exc, RequestValidationError)
                else ".".join(map(str, error["loc"]))
            ),
            "message": error["msg"],
        }
        for error in exc.errors()
    ]

# Register exception handlers for the FastAPI application
def register_exception_handlers(app: FastAPI):

    # Handle custom application exceptions
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):

        logger.warning( "%s on %s: %s", exc.status_code, request.url.path, exc.detail,)

        return error_response(status_code=exc.status_code, message=exc.detail, headers=exc.headers,)

    # Handle validation errors from FastAPI and Pydantic
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError,):

        logger.warning( "Validation error on %s", request.url.path,)

        return error_response(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, message="Validation failed", errors=format_validation_errors(exc),)

    # Handle validation errors from Pydantic models
    @app.exception_handler(ValidationError)
    async def pydantic_validation_exception_handler(request: Request, exc: ValidationError,):

        logger.warning( "Validation error on %s", request.url.path,)

        return error_response(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, message="Validation failed", errors=format_validation_errors(exc),)

    # Handle HTTP exceptions
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException,):

        logger.warning( "%s on %s: %s", exc.status_code, request.url.path, exc.detail,)

        return error_response(status_code=exc.status_code, message=str(exc.detail), headers=exc.headers,)

    # Handle unhandled exceptions( e.g., programming errors, unexpected conditions)
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception,):

        logger.exception("Unhandled error on %s", request.url.path,)

        return error_response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, message="An unexpected error occurred",)
