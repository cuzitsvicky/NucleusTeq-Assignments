# Question 3: Write a program using try-except-else-finally to read a number from a file  and print its square.

FILE_NAME: str = "number.txt"


def read_number_from_file(file_name: str) -> int:
    """
    Args:
        file_name: Name of the file.

    Returns:
        int: Integer read from the file.
    """
    with open(file_name, "r", encoding="utf-8") as file:
        return int(file.read().strip())


if __name__ == "__main__":
    try:
        number: int = read_number_from_file(FILE_NAME)

    except FileNotFoundError:
        print("File not found.")

    except ValueError:
        print("File does not contain a valid integer.")

    else:
        print(f"Square: {number ** 2}")

    finally:
        print("Program execution completed.")
