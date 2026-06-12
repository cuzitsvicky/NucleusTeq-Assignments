# Question 43: Implement encapsulation using private variables in Bank class.

class Bank:
    def __init__(self, balance: float) -> None:
        self.__balance = balance

    def deposit(self, amount: float) -> None:
        self.__balance += amount

    def withdraw(self, amount: float) -> None:
        if amount <= self.__balance:
            self.__balance -= amount
        else:
            print("Insufficient balance.")

    def get_balance(self) -> float:
        return self.__balance


if __name__ == "__main__":
    account = Bank(1000)

    account.deposit(500)
    account.withdraw(200)

    print("Balance:", account.get_balance())

