# Question 12: Write a generator to produce Fibonacci numbers.

from typing import Generator


def generate_fibonacci(count: int) -> Generator[int, None, None]:
    """
    Args:
        count: Number of Fibonacci values.

    Returns:
        Generator[int, None, None]: Fibonacci sequence.
    """
    first: int = 0
    second: int = 1

    for _ in range(count):
        yield first

        first, second = second, first + second


if __name__ == "__main__":
    for number in generate_fibonacci(10):
        print(number)
