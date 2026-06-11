# Question 18: Write a function to check if a given string or number is a palindrome.

from typing import Union

def is_palindrome(value: Union[int, str]) -> bool:
    value = str(value).lower()
    return value == value[::-1]

if __name__ == "__main__":
    user_input = input("Enter a string or number: ")
    if is_palindrome(user_input):
        print(f"{user_input} is a palindrome.")
    else:
        print(f"{user_input} is not a palindrome.")

