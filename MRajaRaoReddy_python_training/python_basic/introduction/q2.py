import sys

# Question 2: Check and return the Python version.
    
# Checks and returns the current Python version being used.
def check_python_version() -> str:

    return f"Python version: {sys.version}"

if __name__ == "__main__":
    print(check_python_version())

