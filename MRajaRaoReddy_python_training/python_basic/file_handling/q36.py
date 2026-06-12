# Question 36: Read a file and count words, lines, and characters.

from typing import Tuple

def count_file_contents(filename: str) -> Tuple[int, int, int]:
    """
    Count words, lines, and characters in a file.

    Args:
        filename: Name of the file.

    Returns:
        Tuple containing:
        (word_count, line_count, character_count)
    """
    with open(filename, "r", encoding="utf-8") as file:
        content = file.read()

    words = len(content.split())
    lines = len(content.splitlines())
    characters = len(content)

    return words, lines, characters


if __name__ == "__main__":
    try:
        words, lines, characters = count_file_contents("my_name.txt")

        print("Words:", words)
        print("Lines:", lines)
        print("Characters:", characters)

    except FileNotFoundError:
        print("File not found.")