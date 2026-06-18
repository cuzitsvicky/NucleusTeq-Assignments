# Python Advanced Training - Assignment Solutions

This folder contains comprehensive Python advanced training materials covering essential concepts for professional Python development.

## 📋 Table of Contents

- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [Topics Covered](#topics-covered)
- [Prerequisites](#prerequisites)
- [How to Run](#how-to-run)
- [Assignment Breakdown](#assignment-breakdown)


## 📁 Folder Structure

```
python_advance_01/
├── exception_handling/          # Exception handling fundamentals
├── iterators_generators/        # Iterators and generators
├── functional_programming/      # Functional programming concepts
├── regular_expression/          # Pattern matching and regex
├── testing_debugging/           # Testing and debugging techniques
├── parallel_execution/          # Threading and multiprocessing
├── packaging/                   # Modules and packages
└── README.md
```

## 📚 Topics Covered

### 1. **Exception Handling** (Questions 1-8)
Master error handling and exception management in Python.

| Question | Topic | File |
|----------|-------|------|
| Q1 | ValueError handling | `q1.py` |
| Q2 | ZeroDivisionError handling | `q2.py` |
| Q3 | Try-except-else-finally blocks | `q3.py` |
| Q4 | Multiple exception handling | `q4.py` |
| Q5 | Generic Exception catching | `q5.py` |
| Q6 | Raising ValueError | `q6.py` |
| Q7 | Custom exceptions (AgeException) | `q7.py` |
| Q8 | FileNotFoundError handling | `q8.py` |

**Key Concepts:**
- try, except, else, finally blocks
- Exception types and hierarchy
- Custom exception classes
- Exception propagation

---

### 2. **Iterators and Generators** (Questions 9-16)
Learn to work with iterators and generators for memory-efficient data processing.

| Question | Topic | File |
|----------|-------|------|
| Q9 | Iterator creation with next() | `q9.py` |
| Q10 | Custom iterator class | `q10.py` |
| Q11 | Generator function for squares | `q11.py` |
| Q12 | Fibonacci generator | `q12.py` |
| Q13 | Generator expressions | `q13.py` |
| Q14 | Iterator vs Generator comparison | `q14.py` |
| Q15 | Large dataset processing | `q15.py` |
| Q16 | Built-in generators (range) | `q16.py` |

**Key Concepts:**
- `__iter__()` and `__next__()` methods
- StopIteration exception
- yield keyword
- Generator expressions
- Memory efficiency

---

### 3. **Functional Programming** (Questions 17-23)
Embrace functional programming paradigms in Python.

| Question | Topic | File |
|----------|-------|------|
| Q17 | Lambda functions | `q17.py` |
| Q18 | map() function | `q18.py` |
| Q19 | filter() function | `q19.py` |
| Q20 | reduce() function | `q20.py` |
| Q21 | Recursive factorial | `q21.py` |
| Q22 | Recursive Fibonacci | `q22.py` |
| Q23 | Functional style conversion | `q23.py` |

**Key Concepts:**
- Lambda functions (anonymous functions)
- map(), filter(), reduce()
- Recursion
- Functional vs imperative programming
- Type hints with Callable

---

### 4. **Regular Expressions** (Questions 24-31)
Master pattern matching and text processing with regex.

| Question | Topic | File |
|----------|-------|------|
| Q24 | Extract numbers from text | `q24.py` |
| Q25 | Email validation | `q25.py` |
| Q26 | Mobile number validation | `q26.py` |
| Q27 | re.search() for word matching | `q27.py` |
| Q28 | Extract capitalized words | `q28.py` |
| Q29 | Remove extra spaces | `q29.py` |
| Q30 | Alphabets-only validation | `q30.py` |
| Q31 | Password validation | `q31.py` |

**Key Concepts:**
- Regex patterns and syntax
- `re.search()`, `re.findall()`, `re.sub()`
- `re.fullmatch()` and pattern compilation
- Lookahead assertions
- Special characters and character classes

---

### 5. **Testing and Debugging** (Questions 32-36)
Learn professional testing and debugging practices.

| Question | Topic | File |
|----------|-------|------|
| Q32 | Pytest for addition function | `q32.py` |
| Q33 | Pytest for prime number checker | `q33.py` |
| Q34 | PDB debugging with logical bugs | `q34.py` |
| Q35 | PDB breakpoints in loops | `q35.py` |
| Q36 | IDE debugger advantages | `q36.py` |

**Key Concepts:**
- pytest framework
- Test cases and assertions
- pdb debugger
- Breakpoints and stepping
- IDE debugging features

---

### 6. **Modules and Packages** (Questions 37-40)
Organize code into reusable modules and packages.

| Question | Topic | File |
|----------|-------|------|
| Q37 | Module creation and import | `q37.py` |
| Q38 | IDE debugger advantages | `q38.py` |
| Q39 | Package with __init__.py | `q39.py` |
| Q40 | Math operations package | `q40.py` |

**Packages Included:**
- `my_package/`: Greeting and calculation functions
- `math_package/`: Add, subtract, multiply, divide operations

**Key Concepts:**
- Module structure
- `__init__.py` files
- Package organization
- Importing from packages

---

### 7. **Parallel Execution** (Questions 41-48)
Implement concurrent programming with threading and multiprocessing.

| Question | Topic | File |
|----------|-------|------|
| Q41 | Basic threading | `q41.py` |
| Q42 | Thread for calculations | `q42.py` |
| Q43 | join() method demonstration | `q43.py` |
| Q44 | Multiple threads for downloads | `q44.py` |
| Q45 | Multiprocessing and Process IDs | `q45.py` |
| Q46 | Process pool for calculations | `q46.py` |
| Q47 | ThreadPoolExecutor | `q47.py` |
| Q48 | ProcessPoolExecutor | `q48.py` |

**Key Concepts:**
- Threading vs multiprocessing
- Thread creation and joining
- Process management
- ThreadPoolExecutor
- ProcessPoolExecutor
- Concurrent futures
- GIL (Global Interpreter Lock)

---

## 🚀 How to Run

### Running Individual Programs

```bash
# Navigate to specific topic folder
cd exception_handling

# Run a program
python q1.py

# Run with input
echo "25" | python q1.py
```

### Running with pytest

```bash
# Install pytest (if not already installed)
pip install pytest

# Run all tests in testing_debugging folder
pytest testing_debugging/

# Run specific test file
pytest testing_debugging/q32.py -v

# Run with detailed output
pytest testing_debugging/ -v --tb=short
```

### Using the pdb Debugger

```bash
# Run with debugger
python -m pdb testing_debugging/q34.py

# Inside pdb:
# l (list)           - Show current code
# n (next)           - Execute next line
# s (step)           - Step into function
# c (continue)       - Continue execution
# p variable_name    - Print variable
# q (quit)           - Exit debugger
```



## 💡 Key Learning Outcomes



✅ Handle exceptions gracefully and create custom exception classes  
✅ Use iterators and generators for efficient data processing  
✅ Write functional-style Python code using map, filter, and reduce  
✅ Validate data using regular expressions  
✅ Write comprehensive pytest test cases  
✅ Debug code effectively using IDE debuggers and pdb  
✅ Organize code into reusable modules and packages  
✅ Implement concurrent programming with threads and processes  

## 📝 Notes

- All programs include type hints for better code clarity
- Docstrings are provided for all functions
- Programs demonstrate best practices and Python conventions
- Some programs have intentional bugs for debugging practice (Q34, Q35)




---
  
**Author:** M. Raja Rao Reddy  
