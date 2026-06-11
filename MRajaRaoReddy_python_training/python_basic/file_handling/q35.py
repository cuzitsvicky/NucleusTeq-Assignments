# Question 35: Create a file and write your name into it.

def write_name_to_file(filename: str, name: str) -> None:
    """
    Write the given name to a file.

    Args:
        filename: Name of the file.
        name: Name to write into the file.
    """
    with open(filename, "w", encoding="utf-8") as file:
        file.write(name)


if __name__ == "__main__":
    write_name_to_file("my_name.txt", "Vicky Reddy")
    print("Name written successfully.")