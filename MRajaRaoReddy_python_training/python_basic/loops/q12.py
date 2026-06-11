# Question 12: Print numbers from 1 to 100 using loop.

def print_one_to_hundred() -> None:
    
    for number in range(1, 101):
        print(number, end=" ")
    print()

if __name__ == "__main__":
    print_one_to_hundred()    