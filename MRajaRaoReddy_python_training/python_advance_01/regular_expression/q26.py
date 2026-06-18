# Question 26: Write a regular expression to validate a 10-digit mobile number.

import re


def is_valid_mobile_number(mobile_number: str) -> bool:
    """
    Args:
        mobile_number: Mobile number.

    Returns:
        bool: True if valid, otherwise False.
    """
    return bool(re.fullmatch(r"^[0-9]{10}$", mobile_number))


if __name__ == "__main__":
    mobile_number: str = input("Enter a mobile number: ")

    print(f"Valid Mobile Number: " f"{is_valid_mobile_number(mobile_number)}")
