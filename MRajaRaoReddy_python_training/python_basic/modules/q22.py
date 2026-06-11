# Question 22: Use math module to find square root, power, and factorial.

import math

def use_math_module() -> None:
    
    number: float = 16
    
    square_root: float = math.sqrt(number)
    power_result: float = math.pow(2, 3)  # 2^3
    factorial_result: int = math.factorial(5)
    
    print(f"\nMath Module Operations:")
    print(f"Square root of {number} = {square_root}")
    print(f"2^3 = {power_result}")
    print(f"Factorial of 5 = {factorial_result}")

if __name__ == "__main__":
    use_math_module()    

