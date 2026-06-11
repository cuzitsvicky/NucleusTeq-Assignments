# Question 20: Write a function using default parameters.

def greet_user(name: str = "Guest", age: int = 18) -> str:
    """
    Args:
        name: User's name (default: "Guest")
        age: User's age (default: 18)
        
    Returns:
        str: Formatted greeting message
    """
    return f"Hello, {name}! You are {age} years old."

if __name__ == "__main__":
    user_name = input("Enter your name (or press Enter to use default): ").strip()
    user_age_input = input("Enter your age (or press Enter to use default): ").strip()
    
    user_age = int(user_age_input) if user_age_input else 18
    greeting_message = greet_user(name=user_name or "Guest", age=user_age)
    print(greeting_message)