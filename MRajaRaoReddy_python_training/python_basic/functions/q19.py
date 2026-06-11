# Question 19: Write a function to find the maximum number in a list.

from typing import List

def find_max_in_list(numbers: List[float]) -> float:
    """
    Return the maximum number in the list.

    Raises:
        ValueError: If the list is empty.
    """
    if not numbers:
        raise ValueError("Cannot find maximum in an empty list.")

    return max(numbers)

if __name__ == "__main__":
    user_input = input("Enter numbers separated by commas: ").strip()

    try:
        number_list = [
            float(num.strip())                    # Convert each input to float and strip whitespace
            for num in user_input.split(",")      # Split input by commas and iterate through each number
            if num.strip()                        # Ensure we don't include empty strings from extra commas
        ]

        max_number = find_max_in_list(number_list)
        print(f"The maximum number in the list is: {max_number}")

    except ValueError as e:
        print(f"Error: {e}")

