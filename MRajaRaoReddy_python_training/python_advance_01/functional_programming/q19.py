# Question 19: Use filter() to extract even numbers from a list.

from typing import List


def get_even_numbers(numbers: List[int]) -> List[int]:
    """
    Args:
        numbers: List of integers.

    Returns:
        List[int]: Even numbers.
    """
    return list(filter(lambda number: number % 2 == 0, numbers))


if __name__ == "__main__":
    sample_numbers: List[int] = [1, 2, 3, 4, 5, 6]

    even_numbers: List[int] = get_even_numbers(sample_numbers)

    print(f"Original List: {sample_numbers}")
    print(f"Even Numbers: {even_numbers}")
