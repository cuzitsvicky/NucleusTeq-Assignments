# Question 17: Write a function to calculate square of a number.

def calculate_square(number: float) -> float:
    """
    Args:
        number: The number to square
        
    Returns:
        float: The square of the number
    """
    return number ** 2


if __name__ == "__main__":
    num = float(input("Enter a number to calculate its square: "))
    result = calculate_square(num)
    print(f"The square of {num} is {result}.")