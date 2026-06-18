# Question 14: Explain the difference between iterator and generator with a small example.

from typing import Generator, Iterator, List


def create_iterator(values: List[int]) -> Iterator[int]:
    """
    Args:
        values: List of integers.

    Returns:
        Iterator[int]: Iterator object.
    """
    return iter(values)


def create_generator() -> Generator[int, None, None]:
    """
    Returns:
        Generator[int, None, None]: Generator object.
    """
    for number in range(1, 4):
        yield number


if __name__ == "__main__":
    iterator = create_iterator([1, 2, 3])

    generator = create_generator()

    print("Iterator Example:")
    print(next(iterator))
    print(next(iterator))

    print("\nGenerator Example:")
    print(next(generator))
    print(next(generator))

    print("\nIterator: Created using iter().")

    print("Generator: Created using yield.")
