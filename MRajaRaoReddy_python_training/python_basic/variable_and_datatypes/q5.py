"""
    Question 5: Write a program to swap two numbers.
    
    Demonstrates swapping using Python's tuple unpacking feature.
"""
def swap_two_numbers() -> None:
    
    num1: float = 10
    num2: float = 20
    
    print(f"Before swap: num1 = {num1}, num2 = {num2}")
    
    # Swap using tuple unpacking
    num1, num2 = num2, num1
    
    print(f"After swap: num1 = {num1}, num2 = {num2}")

if __name__ == "__main__":
    swap_two_numbers()
