# Question 8: Check whether a number is positive, negative, or zero.

def check_positive_negative_zero(number: float) -> str:
    """
    Args:
        number: The number to check
        
    Returns:
        str: 'Positive', 'Negative', or 'Zero'
    """
    if number > 0:
        return "Positive"
    elif number < 0:
        return "Negative"
    else:
        return "Zero"


if __name__ == "__main__":
    num: float = float(input("Enter a number: "))
    result: str = check_positive_negative_zero(num)
    print(f"The number {num} is {result}.")