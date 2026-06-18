# Question 46: Write a multiprocessing program to calculate the square of numbers using Process class.

import multiprocessing
from typing import List


def calculate_square(number: int) -> None:
    """
    Args:
        number: Input number.

    Returns:
        None
    """
    print(f"Square of {number}: " f"{number ** 2}")


if __name__ == "__main__":
    numbers: List[int] = [1, 2, 3, 4, 5]

    processes = []

    for number in numbers:
        process = multiprocessing.Process(target=calculate_square, args=(number,))

        processes.append(process)

        process.start()

    for process in processes:
        process.join()
