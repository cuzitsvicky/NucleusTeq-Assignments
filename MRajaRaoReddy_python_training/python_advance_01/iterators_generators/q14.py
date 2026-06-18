# Question 14: Explain the difference between iterator and generator with a small example.

"""

Iterator vs Generator

Iterator:
- An iterator is an object that allows traversal through a collection
  one element at a time.
- It implements two special methods:
    1. __iter__() -> returns the iterator object itself.
    2. __next__() -> returns the next value.
- When there are no more elements, it raises StopIteration.
- Iterators are usually created from iterable objects such as lists,
  tuples, strings, and dictionaries using the iter() function.

Example:
numbers = [1, 2, 3]
iterator = iter(numbers)

print(next(iterator))  # 1
print(next(iterator))  # 2
print(next(iterator))  # 3


Generator:
- A generator is a simpler way to create an iterator using the 'yield'
  keyword.
- It automatically implements __iter__() and __next__().
- Values are generated lazily (on demand), which makes generators
  memory-efficient for large datasets.
- A generator pauses execution after each yield and resumes from the
  same point when next() is called again.

Example:
def generate_numbers():
    yield 1
    yield 2
    yield 3

generator = generate_numbers()

print(next(generator))  # 1
print(next(generator))  # 2
print(next(generator))  # 3

"""
