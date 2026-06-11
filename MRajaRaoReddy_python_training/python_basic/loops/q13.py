# Question 13: Print multiplication table of a number.

def print_multiplication_table(number: int) -> None:
    """
    Args:
        number: The number to create multiplication table for
    """
    print(f"\nMultiplication Table for {number}:")
    for i in range(1, 11):
        result: int = number * i
        print(f"{number} x {i} = {result}")

if __name__ == "__main__":
    try:
        number: int = int(input("Enter a number: "))
        print_multiplication_table(number)
    except ValueError:
        print("Invalid input. Please enter a numeric value.")