# Question 6: Take two numbers and print sum, difference, multiplication, and division.

# Performs basic arithmetic operations (sum, difference, multiplication, division) on two user-input numbers and prints the results.
def perform_arithmetic_operations() -> None:

    num1: float = float(input("Enter first number: "))
    num2: float = float(input("Enter second number: "))
    
    sum_result: float = num1 + num2
    diff_result: float = num1 - num2
    mult_result: float = num1 * num2
    div_result: float = num1 / num2 if num2 != 0 else float('inf')
    
    print(f"\nArithmetic Operations:")
    print(f"Sum: {num1} + {num2} = {sum_result}")
    print(f"Difference: {num1} - {num2} = {diff_result}")
    print(f"Multiplication: {num1} × {num2} = {mult_result}")
    print(f"Division: {num1} ÷ {num2} = {div_result}")

if __name__ == "__main__":
    perform_arithmetic_operations()    