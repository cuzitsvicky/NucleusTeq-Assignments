# Question 24: Create your own module and import it.

# Importing functions from the custom module created in the same directory (custom_module.py)
from custom_module import add_numbers, multiply_numbers, subtract_numbers, divide_numbers, power_numbers

# Taking input from the user for two numbers
first_number = int(input("Enter first number: "))
second_number = int(input("Enter second number: "))

# Using the imported functions to perform operations and print results
print("Sum =", add_numbers(first_number, second_number))
print("Product =", multiply_numbers(first_number, second_number))
print("Difference =", subtract_numbers(first_number, second_number))
print("Quotient =", divide_numbers(first_number, second_number))
print("Power =", power_numbers(first_number, second_number))