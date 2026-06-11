# Question 28: Create a tuple and access elements.

from typing import Tuple

def create_and_access_tuple() -> None:
    
    student_tuple: Tuple[str, int, float] = ("Alice", 20, 85.5)
    
    print(f"\nTuple: {student_tuple}")
    print(f"Name: {student_tuple[0]}")
    print(f"Age: {student_tuple[1]}")
    print(f"Grade: {student_tuple[2]}")

if __name__ == "__main__":
    create_and_access_tuple()    