# Question 6: Create a function that raises a ValueError if a number is negative.


def validate_non_negative(number: int) -> None:
    """
    Args:
        number: Number to validate.

    Returns:
        None
    """
    if number < 0:
        raise ValueError("Negative numbers are not allowed.")


if __name__ == "__main__":
    try:
        value: int = int(input("Enter a number: "))

        validate_non_negative(value)

        print("Valid number.")

    except ValueError as error:
        print(error)
