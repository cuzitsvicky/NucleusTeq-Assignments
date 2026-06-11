# Question 24: Create your own module and import it.

from MRajaRaoReddy_python_training.python_basic.functions.q17 import calculate_square
from MRajaRaoReddy_python_training.python_basic.functions.q18 import is_palindrome
from MRajaRaoReddy_python_training.python_basic.functions.q19 import find_max_in_list


def create_and_import_module() -> None:
    
    print("\nImporting and using custom module functions:")
    
    squared: float = calculate_square(7)
    print(f"Square of 7 = {squared}")
    
    is_pal: bool = is_palindrome("racecar")
    print(f"Is 'racecar' a palindrome? {is_pal}")
    
    max_val: float = find_max_in_list([3, 7, 1, 9, 4])
    print(f"Maximum in [3, 7, 1, 9, 4] = {max_val}")

if __name__ == "__main__":
    create_and_import_module()