# Question 29: Replace multiple spaces in a string with a single space using re.sub().

import re


def remove_extra_spaces(text: str) -> str:
    """
    Args:
        text: Input string.

    Returns:
        str: Cleaned string.
    """
    return re.sub(r"\s+", " ", text).strip()


if __name__ == "__main__":
    text: str = "Python    is     easy      to learn."

    cleaned_text: str = remove_extra_spaces(text)

    print(f"Original: {text}")
    print(f"Cleaned: {cleaned_text}")
