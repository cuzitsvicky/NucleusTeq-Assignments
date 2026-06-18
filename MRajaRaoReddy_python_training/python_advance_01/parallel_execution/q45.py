# Question 45: Write a program to create two processes that print their Process IDs.

import multiprocessing
import os


def display_process_id() -> None:
    """
    Returns:
        None
    """
    print(f"Process ID: {os.getpid()}")


if __name__ == "__main__":
    process_1 = multiprocessing.Process(target=display_process_id)

    process_2 = multiprocessing.Process(target=display_process_id)

    process_1.start()
    process_2.start()

    process_1.join()
    process_2.join()
