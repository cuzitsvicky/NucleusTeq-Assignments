# Question 5: Write a program that catches all exceptions and prints the error message.


def divide_hundred(number: int) -> float:
    """
    Args:
        number: Divisor value.

    Returns:
        float: Division result.
    """
    return 100 / number


if __name__ == "__main__":
    try:
        value: int = int(input("Enter a number: "))

        result: float = divide_hundred(value)

        print(f"Result: {result}")

    except Exception as error:
        print(f"An error occurred: {error}")
