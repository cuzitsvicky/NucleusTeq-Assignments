# Question 15: Reverse a number using loop.

def reverse_number(number: int) -> int:
    """
    Args:
        number: The integer to reverse
        
    Returns:
        int: The reversed number
    """
    reversed_num: int = 0
    original: int = abs(number)
    
    while original > 0:
        digit: int = original % 10
        reversed_num = reversed_num * 10 + digit
        original //= 10
    
    # Preserve negative sign
    if number < 0:
        reversed_num = -reversed_num
    
    return reversed_num


if __name__ == "__main__":
    try:
        num: int = int(input("Enter a number: "))
        result: int = reverse_number(num)
        print(f"The reverse of {num} is {result}.")
    except ValueError:
        print("Invalid input. Please enter a numeric value.")