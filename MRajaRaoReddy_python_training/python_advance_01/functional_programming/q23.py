# Question 23: Convert a simple loop-based program into a functional style using map or filter.

from typing import List


def convert_to_uppercase(words: List[str]) -> List[str]:
    """
    Args:
        words: List of strings.

    Returns:
        List[str]: Uppercase strings.
    """
    return list(map(lambda word: word.upper(), words))


if __name__ == "__main__":
    sample_words: List[str] = ["python", "java", "javascript"]

    uppercase_words: List[str] = convert_to_uppercase(sample_words)

    print(f"Original List: {sample_words}")
    print(f"Uppercase List: {uppercase_words}")
