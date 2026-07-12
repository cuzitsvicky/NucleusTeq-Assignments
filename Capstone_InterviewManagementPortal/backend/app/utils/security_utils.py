import base64

# Utility functions for password encoding and verification using base64.

def get_password_encoded(password: str) -> str:
    return base64.b64encode(password.encode("utf-8")).decode("utf-8")


def verify_encoded_password(plain_password: str, encoded_password: str) -> bool:
    return ( base64.b64encode(plain_password.encode("utf-8")).decode("utf-8") == encoded_password)
