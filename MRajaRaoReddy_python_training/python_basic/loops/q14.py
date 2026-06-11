# Question 14: Find factorial of a number.

def calculate_factorial(number: int) -> int:
    """
    Args:
        number: Non-negative integer
        
    Returns:
        int: Factorial of the number
        
    Raises:
        ValueError: If number is negative
    """
    if number < 0:
        raise ValueError("Factorial not defined for negative numbers")
    
    factorial: int = 1
    for i in range(1, number + 1):
        factorial *= i
    
    return factorial

if __name__ == "__main__":  
    try:
        num: int = int(input("Enter a non-negative integer: "))
        result: int = calculate_factorial(num)
        print(f"The factorial of {num} is {result}.")
    except ValueError as e:
        print(e)