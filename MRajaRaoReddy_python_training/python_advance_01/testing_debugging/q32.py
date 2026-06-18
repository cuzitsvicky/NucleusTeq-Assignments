# Question 32: Write pytest test cases for a function that adds two numbers.


def add_numbers(first_number: int, second_number: int) -> int:
    """
    Args:
        first_number: First integer.
        second_number: Second integer.

    Returns:
        int: Sum of both numbers.
    """
    return first_number + second_number


def test_add_positive_numbers() -> None:
    """
    Test addition of positive numbers.
    """
    assert add_numbers(2, 3) == 5


def test_add_negative_numbers() -> None:
    """
    Test addition of negative numbers.
    """
    assert add_numbers(-2, -3) == -5


def test_add_zero() -> None:
    """
    Test addition with zero.
    """
    assert add_numbers(10, 0) == 10


if __name__ == "__main__":
    result: int = add_numbers(10, 20)

    print(f"Result: {result}")
