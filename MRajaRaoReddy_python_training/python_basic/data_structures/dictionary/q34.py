# Question 34: Merge two dictionaries.

from typing import Dict

def merge_two_dictionaries() -> None:
    dict1: Dict[str, int] = {"a": 1, "b": 2, "c": 3}
    dict2: Dict[str, int] = {"d": 4, "e": 5, "f": 6}
    
    print(f"\nDictionary 1: {dict1}")
    print(f"Dictionary 2: {dict2}")
    
    # Method 1: Using update()
    merged1: Dict[str, int] = dict1.copy()
    merged1.update(dict2)
    print(f"Merged (using update): {merged1}")
    
    # Method 2: Using | operator (Python 3.9+)
    merged2: Dict[str, int] = dict1 | dict2
    print(f"Merged (using | operator): {merged2}")
    
    # Method 3: Using dictionary unpacking
    merged3: Dict[str, int] = {**dict1, **dict2}
    print(f"Merged (using unpacking): {merged3}")

if __name__ == "__main__":
    merge_two_dictionaries()    