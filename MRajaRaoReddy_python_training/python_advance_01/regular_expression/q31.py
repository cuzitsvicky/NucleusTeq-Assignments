# Question 31: Create a password validation program using regex (minimum length, one digit, one special character).

import re

MINIMUM_PASSWORD_LENGTH: int = 8


def is_valid_password(password: str) -> bool:
    """
    Args:
        password: Password string.

    Returns:
        bool: True if valid, otherwise False.
    """

    pattern: str = r"^(?=.*\d)" r"(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?])" r".{8,}$"

    return bool(re.fullmatch(pattern, password))


if __name__ == "__main__":
    password: str = input("Enter password: ")

    print(f"Valid Password: " f"{is_valid_password(password)}")
