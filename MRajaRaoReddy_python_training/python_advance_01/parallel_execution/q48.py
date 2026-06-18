# Question 48: Convert a normal function into parallel execution using ProcessPoolExecutor.

from concurrent.futures import ProcessPoolExecutor
from typing import List


def calculate_cube(number: int) -> int:
    """
    Args:
        number: Input number.

    Returns:
        int: Cube value.
    """
    return number**3


if __name__ == "__main__":
    numbers: List[int] = [1, 2, 3, 4, 5]

    with ProcessPoolExecutor() as executor:
        results = executor.map(calculate_cube, numbers)

    print(list(results))
