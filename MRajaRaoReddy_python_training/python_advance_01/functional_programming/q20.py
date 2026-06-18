# Question 20: Use reduce() to find the product of all elements in a list.

from functools import reduce
from typing import List


def calculate_product(numbers: List[int]) -> int:
    """
    Args:
        numbers: List of integers.

    Returns:
        int: Product of all elements.
    """
    return reduce(lambda result, number: result * number, numbers, 1)


if __name__ == "__main__":
    sample_numbers: List[int] = [1, 2, 3, 4]

    product: int = calculate_product(sample_numbers)

    print(f"Numbers: {sample_numbers}")
    print(f"Product: {product}")
