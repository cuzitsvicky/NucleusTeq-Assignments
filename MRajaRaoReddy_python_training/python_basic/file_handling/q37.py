# Question 37:  Append data to existing file.

def append_to_file(filename: str, text: str) -> None:
    """
    Append text to a file.

    Args:
        filename: Name of the file.
        text: Text to append.
    """
    with open(filename, "a", encoding="utf-8") as file:
        file.write(f"\n{text}")


if __name__ == "__main__":
    user_text = input("Enter text to append (or press Enter for default): ").strip()
    text_to_append: str = user_text if user_text else "Appended text."

    append_to_file("my_name.txt", text_to_append)
    print("Data appended successfully.")