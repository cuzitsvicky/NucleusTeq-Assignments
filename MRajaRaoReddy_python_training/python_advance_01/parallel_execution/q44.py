# Question 44: Create multiple threads to simulate file downloading using time.sleep().

import threading
import time


def download_file(file_name: str) -> None:
    """
    Args:
        file_name: File name.

    Returns:
        None
    """
    print(f"Downloading {file_name}...")

    time.sleep(2)

    print(f"{file_name} downloaded successfully.")


if __name__ == "__main__":
    files = ["file_1.pdf", "file_2.pdf", "file_3.pdf"]

    threads = []

    for file_name in files:
        thread = threading.Thread(target=download_file, args=(file_name,))

        threads.append(thread)

        thread.start()

    for thread in threads:
        thread.join()
