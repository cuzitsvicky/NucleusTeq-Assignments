from ..exceptions import BadRequestException
from ..constants.app_constants import ALLOWED_RESUME_EXTENSION

def validate_resume_extension(filename: str):
    if not filename.lower().endswith(ALLOWED_RESUME_EXTENSION):
        raise BadRequestException(
            f"Resume must be a {ALLOWED_RESUME_EXTENSION.upper()} file"
        )