# Question 7: Create a custom exception called AgeException and raise it if age is less than 18.

MINIMUM_AGE: int = 18


class AgeException(Exception):
    """
    Args:
        None

    Returns:
        None
    """

    pass


def validate_age(age: int) -> None:
    """
    Args:
        age: User age.

    Returns:
        None
    """
    if age < MINIMUM_AGE:
        raise AgeException(f"Age must be at least {MINIMUM_AGE}.")


if __name__ == "__main__":
    try:
        age: int = int(input("Enter your age: "))

        validate_age(age)

        print("Age accepted.")

    except ValueError:
        print("Please enter a valid age.")

    except AgeException as error:
        print(error)
