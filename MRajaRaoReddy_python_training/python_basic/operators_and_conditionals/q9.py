# Question 9: Find the largest of three numbers.

def find_largest_of_three(num1: float, num2: float, num3: float) -> float:
    """
    Args:
        num1: First number
        num2: Second number
        num3: Third number
        
    Returns:
        float: The largest of the three numbers
    """
    largest: float = max(num1, num2, num3)
    return largest

if __name__ == "__main__":
    n1: float = float(input("Enter the first number: "))
    n2: float = float(input("Enter the second number: "))
    n3: float = float(input("Enter the third number: "))
    result: float = find_largest_of_three(n1, n2, n3)
    print(f"The largest number is {result}.")