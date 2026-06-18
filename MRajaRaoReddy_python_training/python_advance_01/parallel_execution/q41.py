# Question 41: Write a program to create two threads that print numbers from 1 to 5 simultaneously.

import threading


def print_numbers(thread_name: str) -> None:
    """
    Args:
        thread_name: Name of the thread.

    Returns:
        None
    """
    for number in range(1, 6):
        print(f"{thread_name}: {number}")


if __name__ == "__main__":
    thread_1 = threading.Thread(target=print_numbers, args=("Thread-1",))

    thread_2 = threading.Thread(target=print_numbers, args=("Thread-2",))

    thread_1.start()
    thread_2.start()

    thread_1.join()
    thread_2.join()
