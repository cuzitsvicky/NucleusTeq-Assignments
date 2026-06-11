# Question 25: Create a list of 10 numbers and find sum, max, sort it and remove duplicates.

from typing import List

def perform_list_operations() -> None:
   
    numbers: List[int] = [5, 2, 8, 2, 9, 1, 8, 5, 3, 7]
    
    print(f"\nOriginal list: {numbers}")
    
    # Sum
    list_sum: int = sum(numbers)
    print(f"Sum: {list_sum}")
    
    # Max
    list_max: int = max(numbers)
    print(f"Max: {list_max}")
    
    # Sort
    sorted_numbers: List[int] = sorted(numbers)
    print(f"Sorted: {sorted_numbers}")
    
    # Remove duplicates using set
    unique_numbers: List[int] = list(set(numbers))
    print(f"Without duplicates: {unique_numbers}")

if __name__ == "__main__":
    perform_list_operations()
