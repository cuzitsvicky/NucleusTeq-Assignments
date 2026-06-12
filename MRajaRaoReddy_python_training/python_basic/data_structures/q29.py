# Question 29: Convert tuple into list and modify it.

from typing import List, Tuple


def convert_tuple_to_list_and_modify() -> None:
    
    original_tuple: Tuple[int, int, int] = (1, 2, 3)
    
    print(f"\nOriginal tuple: {original_tuple}")
    
    # Convert to list
    modified_list: List[int] = list(original_tuple)
    modified_list.append(4)
    modified_list[0] = 10
    
    print(f"Modified list: {modified_list}")
    
    # Can't convert back to modify tuple (tuples are immutable)
    new_tuple: Tuple[int, ...] = tuple(modified_list)
    print(f"New tuple: {new_tuple}")

if __name__ == "__main__":
    convert_tuple_to_list_and_modify()