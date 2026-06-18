# Question 1: Write a program that takes a number as input and handles ValueError if the input is not a valid integer.


def convert_to_integer(user_input: str) -> int:
    """
    Args:
        user_input: User-provided input string.

    Returns:
        int: Converted integer value.
    """
    return int(user_input)


if __name__ == "__main__":
    try:
        value: str = input("Enter an integer: ")
        number: int = convert_to_integer(value)

        print(f"Valid integer: {number}")

    except ValueError:
        print("Invalid input. Please enter a valid integer.")
