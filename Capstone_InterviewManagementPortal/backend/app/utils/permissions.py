from ..exceptions import ForbiddenException


def require_roles(user: dict, allowed_roles: set[str] | tuple[str, ...], message: str = "Not authorized"):
    allowed_values = {getattr(role, "value", role) for role in allowed_roles}
    if user["role"] not in allowed_values:
        raise ForbiddenException(message)
