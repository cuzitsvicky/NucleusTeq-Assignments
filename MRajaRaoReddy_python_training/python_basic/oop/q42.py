# Question 42: Implement inheritance using Person and Employee class.

class Person:
    def __init__(self, name: str) -> None:
        self.name = name

    def introduce(self) -> None:
        print(f"My name is {self.name}.")


class Employee(Person):
    def __init__(self, name: str, employee_id: int) -> None:
        super().__init__(name)
        self.employee_id = employee_id

    def display_employee(self) -> None:
        print("Employee ID:", self.employee_id)


if __name__ == "__main__":
    employee = Employee("Vicky", 101)

    employee.introduce()
    employee.display_employee()
