# Question 7: Check whether a number is even or odd.

def check_even_or_odd(number: int) -> str:
    
    """
    Args:
        number: The integer to check
        
    Returns:
        str: 'Even' if even, 'Odd' if odd
    """
    if number % 2 == 0:
        return "Even"
    else:
        return "Odd"
    
if __name__ == "__main__":
    num: int = int(input("Enter a number: "))
    result: str = check_even_or_odd(num)
    print(f"The number {num} is {result}.")
