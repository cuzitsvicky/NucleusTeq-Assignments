# Question 25: Write a regular expression to validate an email address.

# re module is used to work with regular expressions in Python.
# It provides functions to search, match, and manipulate strings using patterns defined by regular expressions.
import re


def is_valid_email(email: str) -> bool:
    """
    Args:
        email: Email address.

    Returns:
        bool: True if valid, otherwise False.
    """
    pattern: str = r"^[a-zA-Z0-9._%+-]+" r"@" r"(?:[a-zA-Z0-9-]+\.)+" r"[a-zA-Z]{2,}$"

    return bool(re.fullmatch(pattern, email))


if __name__ == "__main__":
    email: str = input("Enter an email address: ")

    print(f"Valid Email: " f"{is_valid_email(email)}")
