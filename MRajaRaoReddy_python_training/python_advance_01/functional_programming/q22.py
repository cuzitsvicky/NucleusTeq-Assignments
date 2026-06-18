# Question 22: Write a recursive function to calculate Fibonacci.


def calculate_fibonacci(position: int) -> int:
    """
    Args:
        position: Fibonacci position.

    Returns:
        int: Fibonacci number.
    """
    if position < 0:
        raise ValueError("Position cannot be negative.")

    if position in (0, 1):
        return position

    return calculate_fibonacci(position - 1) + calculate_fibonacci(position - 2)


if __name__ == "__main__":
    try:
        position: int = int(input("Enter Fibonacci position: "))

        fibonacci_number: int = calculate_fibonacci(position)

        print(f"Fibonacci Number: {fibonacci_number}")

    except ValueError as error:
        print(error)
