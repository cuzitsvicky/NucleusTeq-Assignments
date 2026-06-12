# Question 33: Count frequency of characters in a string using dictionary.

from typing import Dict

def count_character_frequency(text: str) -> Dict[str, int]:
    """
    Args:
        text: Input string
        
    Returns:
        Dict[str, int]: Dictionary with character frequencies
    """
    frequency: Dict[str, int] = {}
    
    for char in text:
        if char in frequency:
            frequency[char] += 1
        else:
            frequency[char] = 1
    
    return frequency

if __name__ == "__main__":
    user_input = input("Enter a string (or press Enter for default): ").strip()
    input_string: str = user_input if user_input else "hello world"

    char_frequency: Dict[str, int] = count_character_frequency(input_string)
    print(f"\nInput string: '{input_string}'")
    print("Character Frequency:")
    for char, freq in char_frequency.items():
        print(f"'{char}': {freq}")