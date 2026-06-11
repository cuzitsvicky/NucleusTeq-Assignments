# Question 10: Calculate grade based on marks (A/B/C/Fail).

def calculate_grade(marks: float) -> str:
    """
    Grade scale:
        - A: 90-100
        - B: 75-89
        - C: 50-74
        - Fail: Below 50
    
    Args:
        marks: The student's marks (0-100)
        
    Returns:
        str: The grade ('A', 'B', 'C', or 'Fail')
    """
    if marks >= 90:
        return "A"
    elif marks >= 75:
        return "B"
    elif marks >= 50:
        return "C"
    else:
        return "Fail"
    
    
if __name__ == "__main__":
    try:
        marks: float = float(input("Enter the marks (0-100): "))
        if 0 <= marks <= 100:
            grade: str = calculate_grade(marks)
            print(f"The grade for marks {marks} is: {grade}")
        else:
            print("Please enter marks between 0 and 100.")
    except ValueError:
        print("Invalid input. Please enter a numeric value for marks.")    