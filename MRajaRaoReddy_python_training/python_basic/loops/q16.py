# Question 16: Check whether a number is prime.

def is_prime_number(number: int) -> bool:
    """ 
    A prime number is greater than 1 and has no divisors other than 1 
    and itself.
    
    Args:
        number: The number to check
        
    Returns:
        bool: True if prime, False otherwise
    """
    if number <= 1:
        return False
    if number <= 3:
        return True
    if number % 2 == 0 or number % 3 == 0:
        return False
    
    # Check divisors up to sqrt(number)
    i: int = 5
    while i * i <= number:
        if number % i == 0 or number % (i + 2) == 0:
            return False
        i += 6
    
    return True

if __name__ == "__main__":
    try:
        num: int = int(input("Enter a number: "))
        if is_prime_number(num):
            print(f"{num} is a prime number.")
        else:
            print(f"{num} is not a prime number.")
    except ValueError:
        print("Invalid input. Please enter a numeric value.")