# Question 33: Write pytest test cases for a function that checks whether a number is prime.


def is_prime(number: int) -> bool:
    """
    Args:
        number: Integer to check.

    Returns:
        bool: True if prime, otherwise False.
    """
    if number < 2:
        return False

    for divisor in range(2, int(number**0.5) + 1):
        if number % divisor == 0:
            return False

    return True


def test_prime_number() -> None:
    """
    Test a prime number.
    """
    assert is_prime(13) is True


def test_non_prime_number() -> None:
    """
    Test a non-prime number.
    """
    assert is_prime(12) is False


def test_zero() -> None:
    """
    Test zero.
    """
    assert is_prime(0) is False


def test_one() -> None:
    """
    Test one.
    """
    assert is_prime(1) is False


def test_two() -> None:
    """
    Test the smallest prime number.
    """
    assert is_prime(2) is True


if __name__ == "__main__":
    number: int = int(input("Enter a number: "))

    print(f"Is Prime: " f"{is_prime(number)}")
