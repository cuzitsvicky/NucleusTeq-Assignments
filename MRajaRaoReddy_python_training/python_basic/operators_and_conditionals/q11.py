# Question 11: Check whether a year is a leap year.

def is_leap_year(year: int) -> bool:
    """
    A leap year is:
        - Divisible by 4
        - BUT not divisible by 100, EXCEPT if also divisible by 400
    
    Args:
        year: The year to check
        
    Returns:
        bool: True if leap year, False otherwise
    """
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    if year % 4 == 0:
        return True
    return False

if __name__ == "__main__":
    try:
        year: int = int(input("Enter a year: "))
        if is_leap_year(year):
            print(f"{year} is a leap year.")
        else:
            print(f"{year} is not a leap year.")
    except ValueError:
        print("Invalid input. Please enter a numeric value for the year.")