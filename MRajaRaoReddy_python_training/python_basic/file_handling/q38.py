# Question 38: Copy content from one file to another.

def copy_file(source_file: str, destination_file: str) -> None:
    """
    Copy contents from one file to another.

    Args:
        source_file: File to copy from.
        destination_file: File to copy to.
    """
    with open(source_file, "r", encoding="utf-8") as source:
        content = source.read()

    with open(destination_file, "w", encoding="utf-8") as destination:
        destination.write(content)


if __name__ == "__main__":
    try:
        copy_file("my_name.txt", "copy.txt")
        print("File copied successfully.")

    except FileNotFoundError:
        print("Source file not found.")