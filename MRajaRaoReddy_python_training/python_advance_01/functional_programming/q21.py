# Question 21: Write a recursive function to calculate factorial.


def calculate_factorial(number: int) -> int:
    """
    Args:
        number: Non-negative integer.

    Returns:
        int: Factorial of the number.
    """
    if number < 0:
        raise ValueError("Factorial is not defined for negative numbers.")

    if number in (0, 1):
        return 1

    return number * calculate_factorial(number - 1)


if __name__ == "__main__":
    value: int = int(input("Enter a number: "))

    # Factorials can grow very large, so we limit the input to prevent excessive computation.
    if value > 995:
        print("Please enter a number less than 996.")
    elif value < 0:
        print("Factorial is not defined for negative numbers.")
    else:
        factorial: int = calculate_factorial(value)
        print(f"Factorial: {factorial}")
