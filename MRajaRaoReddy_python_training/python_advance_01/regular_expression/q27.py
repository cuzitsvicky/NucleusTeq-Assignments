# Question 27: Use re.search() to check whether a word exists in a sentence.

import re


def word_exists(sentence: str, word: str) -> bool:
    """
    Args:
        sentence: Input sentence.
        word: Word to search.

    Returns:
        bool: True if found, otherwise False.
    """
    return bool(re.search(rf"\b{re.escape(word)}\b", sentence))


if __name__ == "__main__":
    sentence: str = ("Python is a powerful programming language.").lower()

    search_word: str = input("Enter word to search: ").lower()

    print(f"Word Found: " f"{word_exists(sentence, search_word)}")
