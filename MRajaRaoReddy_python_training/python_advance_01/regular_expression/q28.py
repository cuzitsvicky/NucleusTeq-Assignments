# Question 28: Use re.findall() to extract all words starting with a capital letter.

import re
from typing import List


def extract_capital_words(sentence: str) -> List[str]:
    """
    Args:
        sentence: Input sentence.

    Returns:
        List[str]: Capitalized words.
    """
    return re.findall(r"\b[A-Z][a-zA-Z]*\b", sentence)


if __name__ == "__main__":
    sentence: str = "Raja and Vicky are learning Python " "at NucleusTeq."

    capital_words: List[str] = extract_capital_words(sentence)

    print(f"Capitalized Words: " f"{capital_words}")
