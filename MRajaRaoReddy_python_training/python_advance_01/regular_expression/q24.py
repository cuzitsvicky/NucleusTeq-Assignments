# Question 24: Write a program to extract all numbers from a given string using regular expressions.

import re
from typing import List


def extract_numbers(text: str) -> List[str]:
    """
    Args:
        text: Input string.

    Returns:
        List[str]: Numbers found in the string.
    """
    return re.findall(r"\d+", text)


if __name__ == "__main__":
    sample_text: str = "John is 20 years old and scored 95 marks in 2025."

    numbers: List[str] = extract_numbers(sample_text)

    print(f"Numbers Found: {numbers}")
