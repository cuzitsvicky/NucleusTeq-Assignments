# Question 15: Write a program that processes a large dataset using a generator instead of storing all values in a list.

from typing import Generator


def process_large_dataset(limit: int) -> Generator[int, None, None]:
    """
    Process records one at a time.

    Args:
        limit: Number of records.

    Returns:
        Generator[int, None, None]: Processed values.
    """
    for record_id in range(limit):
        processed_value: int = record_id * 2
        yield processed_value


if __name__ == "__main__":
    for value in process_large_dataset(1_000_000):
        if value > 10:
            break

        print(value)
