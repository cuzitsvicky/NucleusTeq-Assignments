from ..exceptions import BadRequestException
from ..constants.app_constants import ALLOWED_RESUME_EXTENSION
import re


def validate_resume_extension(filename: str):
    if not filename.lower().endswith(ALLOWED_RESUME_EXTENSION):
        raise BadRequestException(
            f"Resume must be a {ALLOWED_RESUME_EXTENSION.upper()} file"
        )


def validate_mobile(mobile: str) -> str:
    digits = re.sub(r"[\s\-]", "", mobile)
    if not digits.isdigit():
        raise BadRequestException("Mobile number must contain only digits")
    if len(digits) < 7:
        raise BadRequestException("Mobile number must be at least 7 digits")
    if len(digits) > 10:
        raise BadRequestException("Mobile number must not exceed 10 digits")
    return digits
