# Question 47: Convert a normal function into parallel execution using ThreadPoolExecutor.

from concurrent.futures import ThreadPoolExecutor
from typing import List


def calculate_square(number: int) -> int:
    """
    Args:
        number: Input number.

    Returns:
        int: Square value.
    """
    return number**2


if __name__ == "__main__":
    numbers: List[int] = [1, 2, 3, 4, 5]

    with ThreadPoolExecutor() as executor:
        results = executor.map(calculate_square, numbers)

    print(list(results))
