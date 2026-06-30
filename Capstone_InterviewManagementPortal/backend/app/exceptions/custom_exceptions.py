from fastapi import HTTPException


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str, headers: dict = None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundException(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)


class BadRequestException(AppException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=400, detail=detail)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Unauthorized", headers: dict = None):
        super().__init__(status_code=401, detail=detail, headers=headers)


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail)


class ConflictException(AppException):
    def __init__(self, detail: str = "Conflict"):
        super().__init__(status_code=409, detail=detail)


class UnprocessableEntityException(AppException):
    def __init__(self, detail: str = "Unprocessable entity"):
        super().__init__(status_code=422, detail=detail)


class InternalServerException(AppException):
    def __init__(self, detail: str = "An unexpected error occurred"):
        super().__init__(status_code=500, detail=detail)
