# Question 30: Create two sets and perform union, intersection and difference operations.

from typing import Set

def perform_set_operations() -> None:
   
    set1: Set[int] = {1, 2, 3, 4, 5}
    set2: Set[int] = {4, 5, 6, 7, 8}
    
    print(f"\nSet 1: {set1}")
    print(f"Set 2: {set2}")
    
    # Union
    union_set: Set[int] = set1 | set2
    print(f"Union (set1 | set2): {union_set}")
    
    # Intersection
    intersection_set: Set[int] = set1 & set2
    print(f"Intersection (set1 & set2): {intersection_set}")
    
    # Difference
    difference_set: Set[int] = set1 - set2
    print(f"Difference (set1 - set2): {difference_set}")

if __name__ == "__main__":
    perform_set_operations()
