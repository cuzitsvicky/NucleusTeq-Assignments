# Question 16: Show an example of a built-in generator (like range) and iterate over it.

from typing import Iterator


def create_range_iterator(limit: int) -> Iterator[int]:
    """
    Args:
        limit: Range limit.

    Returns:
        Iterator[int]: Iterator from range.
    """
    return iter(range(limit))


if __name__ == "__main__":
    iterator: Iterator[int] = create_range_iterator(5)

    for value in iterator:
        print(value)
