# Question 32: Create a student dictionary and access values.

from typing import Any, Dict

def create_student_dictionary() -> None:
    student_dict: Dict[str, Any] = {
        "name": "Bob Johnson",
        "age": 22,
        "grade": 88.5,
        "course": "Computer Science",
        "id": 12345
    }
    
    print(f"\nStudent Dictionary: {student_dict}")
    print(f"Name: {student_dict['name']}")
    print(f"Age: {student_dict['age']}")
    print(f"Grade: {student_dict['grade']}")
    print(f"Course: {student_dict['course']}")

if __name__ == "__main__":
    create_student_dictionary()    