# Question 38: Explain the difference between a module and a package with an example.

"""


Module:
- A module is a single Python file (.py) that contains Python code,
  such as functions, classes, and variables.
- Modules help organize code and promote reusability.
- A module can be imported into another Python file using the
  import statement.

Example:

File: math_operations.py

def add(a: int, b: int) -> int:
    return a + b


File: main.py

import math_operations

result = math_operations.add(10, 20)
print(result)  # 30


Package:
- A package is a collection of related modules organized inside a
  directory (folder).
- Packages help structure large applications into logical components.
- Traditionally, a package contains an __init__.py file, although
  modern Python versions also support namespace packages.

Example:

project/
│
├── utilities/
│   ├── __init__.py
│   ├── math_operations.py
│   └── string_operations.py
│
└── main.py


File: utilities/math_operations.py

def add(a: int, b: int) -> int:
    return a + b


File: main.py

from utilities.math_operations import add

result = add(10, 20)
print(result)  # 30

Summary:
- Module = Single Python file containing code.
- Package = Folder containing multiple related modules.
- Every package can contain many modules, but a module is just one
  Python file.

"""
