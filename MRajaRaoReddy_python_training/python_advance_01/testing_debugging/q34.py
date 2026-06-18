# Question 34: Create a function with a logical bug and use pdb to identify the issue.

import pdb


def calculate_average(total: int, count: int) -> float:
    """
    Args:
        total: Total value.
        count: Number of items.

    Returns:
        float: Average value.
    """
    pdb.set_trace()

    # Intentional bug
    return total * count


if __name__ == "__main__":
    average: float = calculate_average(100, 5)

    print(f"Average: {average}")
