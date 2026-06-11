# Question 4: Create variables of type int, float, string, and boolean.
 
# Demonstrates the creation of variables of different data types (int, float, string, boolean) and prints their values and types.
def demonstrate_variable_types() -> None:
    
    int_var: int = 42
    float_var: float = 3.14
    str_var: str = "Hello Python"
    bool_var: bool = True
    
    print(f"int_var = {int_var}, type: {type(int_var)}")
    print(f"float_var = {float_var}, type: {type(float_var)}")
    print(f"str_var = {str_var}, type: {type(str_var)}")
    print(f"bool_var = {bool_var}, type: {type(bool_var)}")

if __name__ == "__main__":
    demonstrate_variable_types()