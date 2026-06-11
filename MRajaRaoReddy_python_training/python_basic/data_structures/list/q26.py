# Question 26: Count even and odd numbers in a list.

from typing import List, Tuple

def count_even_odd_in_list(numbers: List[int]) -> Tuple[int, int]:
    """
    Args:
        numbers: List of integers
        
    Returns:
        Tuple[int, int]: (even_count, odd_count)
    """
    even_count: int = 0
    odd_count: int = 0
    
    for num in numbers:
        if num % 2 == 0:
            even_count += 1
        else:
            odd_count += 1
    
    return even_count, odd_count

if __name__ == "__main__":
    sample_numbers: List[int] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    even_count, odd_count = count_even_odd_in_list(sample_numbers)
    
    print(f"\nIn the list {sample_numbers}:")
    print(f"Even numbers count: {even_count}")
    print(f"Odd numbers count: {odd_count}")