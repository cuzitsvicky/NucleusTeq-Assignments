# Question 11: Write a generator function that yields square numbers up to N.

from typing import Generator


def generate_squares(limit: int) -> Generator[int, None, None]:
    """
    Args:
        limit: Maximum number.

    Returns:
        Generator[int, None, None]: Square numbers.
    """
    for number in range(1, limit + 1):
        yield number**2


if __name__ == "__main__":
    for square in generate_squares(5):
        print(square)
