# Question 3: Take user input (name and age) and print a formatted message.


# Prompts the user for their name and age, then prints a personalized welcome message.
def get_user_input_and_print() -> None:
   
    name: str = input("Enter your name: ")
    age: int = int(input("Enter your age: "))
    
    print(f"\nHello, {name}! You are {age} years old.")
    print(f"Welcome to the Python training program, {name}!")


get_user_input_and_print()
