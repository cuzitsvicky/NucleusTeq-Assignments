# Question 41: Create a Car class with a constructor.

class Car:
    def __init__(self, brand: str, model: str) -> None:
        self.brand = brand
        self.model = model

    def display(self) -> None:
        print(f"Car: {self.brand} {self.model}")


if __name__ == "__main__":
    car = Car("Toyota", "Fortuner")

    car.display()