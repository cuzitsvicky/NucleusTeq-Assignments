# Exception base class
class AppException(Exception):
    """
    Base exception class for the application.

    Attributes:
        status_code (int): The HTTP status code associated with the exception.
        detail (str): A human-readable error message.
        headers (dict): Optional HTTP headers to include with the response.
    """
    def __init__(self, status_code: int, detail: str, headers: dict = None):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers or {}
        super().__init__(detail)

# Resource not found exception
class NotFoundException(AppException):
    """
    Exception raised when a requested resource is not found.

    Attributes:
        status_code (int): The HTTP status code (404).
        detail (str): The error message.
    """
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)


# Bad request exception
class BadRequestException(AppException):
    """
    Exception raised when the request is invalid or contains errors.

    Attributes:
        status_code (int): The HTTP status code (400).
        detail (str): The error message.
    """
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=400, detail=detail)


# Unauthorized exception
class UnauthorizedException(AppException):
    """
    Exception raised when the request lacks valid authentication credentials.

    Attributes:
        status_code (int): The HTTP status code (401).
        detail (str): The error message.
        headers (dict): Optional HTTP headers to include with the response.
    """
    def __init__(self, detail: str = "Unauthorized", headers: dict = None):
        super().__init__(status_code=401, detail=detail, headers=headers)


class ForbiddenException(AppException):
    """
    Exception raised when the request is not allowed despite valid authentication.

    Attributes:
        status_code (int): The HTTP status code (403).
        detail (str): The error message.
    """
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail)


# Conflict exception
class ConflictException(AppException):
    """
    Exception raised when the request conflicts with the current state of the resource.

    Attributes:
        status_code (int): The HTTP status code (409).
        detail (str): The error message.
    """
    def __init__(self, detail: str = "Conflict"):
        super().__init__(status_code=409, detail=detail)


# Unprocessable entity exception
class UnprocessableEntityException(AppException):
    """
    Exception raised when the request is well-formed but cannot be processed.

    Attributes:
        status_code (int): The HTTP status code (422).
        detail (str): The error message.
    """
    def __init__(self, detail: str = "Unprocessable entity"):
        super().__init__(status_code=422, detail=detail)


# Internal server exception
class InternalServerException(AppException):
    """
    Exception raised when an unexpected server error occurs.

    Attributes:
        status_code (int): The HTTP status code (500).
        detail (str): The error message.
    """
    def __init__(self, detail: str = "An unexpected error occurred"):
        super().__init__(status_code=500, detail=detail)
