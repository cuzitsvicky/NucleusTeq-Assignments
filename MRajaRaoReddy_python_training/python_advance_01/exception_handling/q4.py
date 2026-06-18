# Question 4: Handle multiple exceptions  in a single program.

from typing import List


def divide_numbers(dividend: int, divisor: int) -> float:
    """
    Args:
        dividend: Number to divide.
        divisor: Divisor value.

    Returns:
        float: Division result.
    """
    return dividend / divisor


def get_list_element(values: List[int], index: int) -> int:
    """
    Args:
        values: List of integers.
        index: Position to access.

    Returns:
        int: Element at the given index.
    """
    return values[index]


if __name__ == "__main__":
    try:
        number: int = int(input("Enter a number: "))
        divisor: int = int(input("Enter divisor: "))

        result: float = divide_numbers(number, divisor)

        sample_list: List[int] = [10, 20, 30]

        index: int = int(input("Enter index (0-2): "))

        element: int = get_list_element(sample_list, index)

        print(f"Division Result: {result}")
        print(f"List Element: {element}")

    except ValueError:
        print("Invalid integer input.")

    except ZeroDivisionError:
        print("Division by zero is not allowed.")

    except IndexError:
        print("List index out of range.")
