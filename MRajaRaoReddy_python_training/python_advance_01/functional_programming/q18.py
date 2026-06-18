# Question 18: Use map() to convert a list of numbers into their squares.

from typing import List


def get_squared_numbers(numbers: List[int]) -> List[int]:
    """
    Args:
        numbers: List of integers.

    Returns:
        List[int]: Squared numbers.
    """
    return list(map(lambda number: number**2, numbers))


if __name__ == "__main__":
    sample_numbers: List[int] = [1, 2, 3, 4, 5]

    squared_numbers: List[int] = get_squared_numbers(sample_numbers)

    print(f"Original List: {sample_numbers}")
    print(f"Squared List: {squared_numbers}")
