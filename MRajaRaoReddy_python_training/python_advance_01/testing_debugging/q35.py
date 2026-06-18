# Question 35: Use pdb breakpoints inside a loop and inspect variable values.

import pdb
from typing import List


def display_numbers(numbers: List[int]) -> None:
    """
    Args:
        numbers: List of integers.

    Returns:
        None
    """
    for number in numbers:
        pdb.set_trace()

        print(number)


if __name__ == "__main__":
    sample_numbers: List[int] = [10, 20, 30, 40]

    display_numbers(sample_numbers)
