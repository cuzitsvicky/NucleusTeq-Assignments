# Question 27: Reverse a list without using reverse().

from typing import List

def reverse_list_without_method(numbers: List[int]) -> List[int]:
    """
    Args:
        numbers: List to reverse
        
    Returns:
        List[int]: Reversed list
    """
    reversed_list: List[int] = []
    
    for i in range(len(numbers) - 1, -1, -1):
        reversed_list.append(numbers[i])
    
    return reversed_list

if __name__ == "__main__":
    original_list: List[int] = [1, 2, 3, 4, 5]
    reversed_list: List[int] = reverse_list_without_method(original_list)
    
    print(f"\nOriginal list: {original_list}")
    print(f"Reversed list: {reversed_list}")
