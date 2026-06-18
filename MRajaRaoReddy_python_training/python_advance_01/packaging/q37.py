# Question 37: Create a module with two utility functions and import it into another Python file.

from q37_utilities import add_numbers, multiply_numbers

if __name__ == "__main__":
    addition_result: int = add_numbers(10, 20)

    multiplication_result: int = multiply_numbers(10, 20)

    print(f"Addition Result: " f"{addition_result}")

    print(f"Multiplication Result: " f"{multiplication_result}")
