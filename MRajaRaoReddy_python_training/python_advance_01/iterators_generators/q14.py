#Question 14: Explain the difference between iterator and generator with a small example.

# Theory is written in the pdf provided. Below is just the example of iterator and generator.

#Example of Iterator:
class NumberIterator:
    def __init__(self, limit):
        self.current = 1
        self.limit = limit

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= self.limit:
            value = self.current
            self.current += 1
            return value
        raise StopIteration


numbers = NumberIterator(3)

for number in numbers:
    print(number)


#Example of Generator:
def number_generator(limit):
    for number in range(1, limit + 1):
        yield number

for number in number_generator(3):
    print(number)