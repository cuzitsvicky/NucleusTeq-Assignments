# Question 44: Demonstrate polymorphism using different classes with the same method name.

class Dog:
    def sound(self) -> None:
        print("Dog barks.")


class Cat:
    def sound(self) -> None:
        print("Cat meows.")


class Cow:
    def sound(self) -> None:
        print("Cow moos.")


if __name__ == "__main__":
    animals = [Dog(), Cat(), Cow()]

    for animal in animals:
        animal.sound()