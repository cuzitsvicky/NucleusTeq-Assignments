# Question 24: Create your own module and import it.

from custom_module import add_numbers, multiply_numbers, subtract_numbers, divide_numbers, power_numbers

def use_custom_module() -> None:
    first_number = int(input("Enter first number: "))
    second_number = int(input("Enter second number: "))

    print("Sum =", add_numbers(first_number, second_number))
    print("Product =", multiply_numbers(first_number, second_number))
    print("Difference =", subtract_numbers(first_number, second_number))
    print("Quotient =", divide_numbers(first_number, second_number))
    print("Power =", power_numbers(first_number, second_number))

if __name__ == "__main__":
    use_custom_module()