# Question 17: Write a lambda function to find the square of a number.

from typing import Callable


# Callable[[int], int] indicates a function that takes an int and returns an int.
def get_square_function() -> Callable[[int], int]:
    """
    Returns:
        Callable[[int], int]: Lambda function to calculate square.
    """
    return lambda number: number**2


if __name__ == "__main__":
    square = get_square_function()

    number: int = int(input("Enter a number: "))

    print(f"Square: {square(number)}")
