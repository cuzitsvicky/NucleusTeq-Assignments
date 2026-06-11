# Question 23: Generate random numbers using random module.

import random
from typing import List

def generate_random_numbers() -> None:
    
    print("\nRandom Number Generation:")
    
    # Random integer between 1 and 100
    random_int: int = random.randint(1, 100)
    print(f"Random integer (1-100): {random_int}")
    
    # Random float between 0 and 1
    random_float: float = random.random()
    print(f"Random float (0-1): {random_float}")
    
    # Random choice from a list
    choices: List[str] = ["Apple", "Banana", "Cherry", "Date"]
    random_choice: str = random.choice(choices)
    print(f"Random choice: {random_choice}")
    
    # Random sample (multiple unique choices)
    random_sample: List[str] = random.sample(choices, 2)
    print(f"Random sample (2 items): {random_sample}")

if __name__ == "__main__":
    generate_random_numbers()