# Question 30: Write a pattern to check if a string contains only alphabets.

import re


def contains_only_alphabets(text: str) -> bool:
    """
    Args:
        text: Input string.

    Returns:
        bool: True if only alphabets.
    """
    return bool(re.fullmatch(r"[A-Za-z]+", text))


if __name__ == "__main__":
    text: str = input("Enter a string: ")

    print(f"Contains Only Alphabets: " f"{contains_only_alphabets(text)}")
