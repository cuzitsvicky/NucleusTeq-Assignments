# Question 8: Write a program that handles FileNotFoundError when trying to open a file.


def read_file(file_name: str) -> str:
    """
    Args:
        file_name: Name of the file.

    Returns:
        str: File contents.
    """
    with open(file_name, "r", encoding="utf-8") as file:
        return file.read()


if __name__ == "__main__":
    try:
        file_name: str = input("Enter file name: ")

        content: str = read_file(file_name)

        print(content)

    except FileNotFoundError:
        print(f"The file '{file_name}' was not found.")
