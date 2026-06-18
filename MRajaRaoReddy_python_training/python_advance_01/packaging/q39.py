# Question 39: Create a package with two modules and include an __init__.py file.

from my_package import greet_user, square_number

if __name__ == "__main__":
    greeting: str = greet_user("Vicky")

    square: int = square_number(5)

    print(greeting)

    print(f"Square: {square}")
