# Question 40: Create a Student class with attributes and display details.

class Student:
    def __init__(self, name: str, age: int, grade: str) -> None:
        self.name = name
        self.age = age
        self.grade = grade

    def display_details(self) -> None:
        print("Student Details")
        print("Name:", self.name)
        print("Age:", self.age)
        print("Grade:", self.grade)


if __name__ == "__main__":
    student = Student("Vicky", 20, "A")

    student.display_details()