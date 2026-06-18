# Question 10: Write a custom iterator class that returns numbers from 1 to N.


class NumberIterator:
    """
    Custom iterator that returns numbers from 1 to N.
    """

    def __init__(self, limit: int) -> None:
        self.limit: int = limit
        self.current: int = 1

    def __iter__(self) -> "NumberIterator":
        return self

    def __next__(self) -> int:
        if self.current <= self.limit:
            number: int = self.current
            self.current += 1

            return number

        raise StopIteration


if __name__ == "__main__":
    iterator: NumberIterator = NumberIterator(5)

    for number in iterator:
        print(number)
