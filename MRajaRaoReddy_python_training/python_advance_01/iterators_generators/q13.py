# Question 13: Write a generator expression to generate even numbers from 1 to 50.

from typing import Generator


def generate_even_numbers() -> Generator[int, None, None]:
    """
    Returns:
        Generator[int, None, None]: Even numbers from 1 to 50.
    """
    return (number for number in range(1, 51) if number % 2 == 0)


if __name__ == "__main__":
    even_numbers = generate_even_numbers()

    for number in even_numbers:
        print(number)
