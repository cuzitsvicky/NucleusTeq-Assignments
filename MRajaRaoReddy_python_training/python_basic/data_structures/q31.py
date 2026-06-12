# Question 31: Remove duplicates from list using set.

from typing import List, Set


def remove_duplicates_using_set(numbers: List[int]) -> List[int]:
    """
    Args:
        numbers: List with potential duplicates
        
    Returns:
        List[int]: List without duplicates
    """
    unique_set: Set[int] = set(numbers)
    return list(unique_set)

if __name__ == "__main__":
    original_list: List[int] = [1, 2, 3, 2, 4, 5, 1, 6]
    unique_list: List[int] = remove_duplicates_using_set(original_list)
    
    print(f"\nOriginal list: {original_list}")
    print(f"List without duplicates: {unique_list}")