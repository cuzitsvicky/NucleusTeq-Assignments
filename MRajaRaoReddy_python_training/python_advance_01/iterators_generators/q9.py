# Question 9: Create an iterator for a list and print elements using next().

from typing import Iterator, List


def create_iterator(numbers: List[int]) -> Iterator[int]:
    """
    Args:
        numbers: List of integers.

    Returns:
        Iterator[int]: Iterator for the list.
    """
    return iter(numbers)


if __name__ == "__main__":
    sample_numbers: List[int] = [10, 20, 30, 40]

    iterator: Iterator[int] = create_iterator(sample_numbers)

    print(next(iterator))
    print(next(iterator))
    print(next(iterator))
    print(next(iterator))
