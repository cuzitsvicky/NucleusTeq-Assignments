""" Custom module containing utility functions. """

# Function to add two numbers
def add_numbers(first_number, second_number):
    return first_number + second_number

# Function to multiply two numbers
def multiply_numbers(first_number, second_number):
    return first_number * second_number

# Function to subtract two numbers
def subtract_numbers(first_number, second_number):
    return first_number - second_number 

# Function to divide two numbers
def divide_numbers(first_number, second_number):
    if second_number != 0:
        return first_number / second_number
    else:
        return "Error: Division by zero is not allowed."    

# Function to calculate power of a number
def power_numbers(first_number, second_number):
    return first_number ** second_number   