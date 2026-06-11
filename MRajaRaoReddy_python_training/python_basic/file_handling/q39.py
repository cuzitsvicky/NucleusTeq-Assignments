# Question 39: Search a word in a file.

def search_word_in_file(filename: str, word: str) -> bool:
    """
    Search for a word in a file.

    Args:
        filename: Name of the file.
        word: Word to search.

    Returns:
        True if found, otherwise False.
    """
    with open(filename, "r", encoding="utf-8") as file:
        content = file.read()

    return word.lower() in content.lower()


if __name__ == "__main__":
    search_word = input("Enter a word to search: ")

    try:
        if search_word_in_file("my_name.txt", search_word):
            print(f"'{search_word}' found in the file.")
        else:
            print(f"'{search_word}' not found in the file.")

    except FileNotFoundError:
        print("File not found.")