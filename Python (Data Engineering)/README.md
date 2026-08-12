# Data Processor Task

## Project Overview

This project is a core Python training assignment that implements a modular "Data Processor" utility for cleaning and validating raw member data. The package is structured for distribution and can be built into a wheel file for easy installation.

## Project Structure

- `my_processor/`
  - `__init__.py`
  - `core.py`
  - `utils.py`
- `setup.py`
- `pyproject.toml`
- `README.md`
- `main.py`

## Assignment Goals

This package demonstrates the following Python concepts:

- Dictionaries and lists for member profile storage
- Modular functions for validation and formatting
- Multiple files and imports for clean module design
- Object-oriented programming with a `Member` class
- Custom exception handling for malformed data
- Functional programming using `filter()` / `map()` and lambdas
- Regular expression validation for email and phone data

## Packaging Instructions

### Build the wheel file

From the project root directory, run:

```bash
python setup.py sdist bdist_wheel
```
### Output
![alt text](<Screenshot 2026-08-11 124328.png>)
After the build succeeds, the generated wheel file will be located in the `dist/` directory.

### Install the package from wheel

```bash
pip install dist/data_processor_task-1.0.0-py3-none-any.whl
```
### Output
![alt text](<Screenshot 2026-08-11 124344.png>)

## Expected Console Output

Processing raw member data should produce messages similar to this:

![alt text](<Screenshot 2026-08-11 124408.png>)


## How It Works

1. `main.py` defines a hardcoded list of raw member dictionaries.
2. Validation and formatting logic is separated into reusable functions.
3. The `Member` class in `my_processor/core.py` encapsulates member profile data.
4. Regular expressions in `my_processor/utils.py` check email and phone formats.
5. Invalid data is handled with a custom exception and logged before skipping.

## Submission Notes

- The source code includes the package directory, packaging configuration, and README.
- The wheel file is generated in `dist/` after running the packaging command.
- To verify the package, install the wheel and import `Member` from `my_processor.core`.

## Packaging Metadata

The package uses modern packaging configuration from `pyproject.toml` and a simple `setup.py` wrapper for setuptools compatibility.

- Package name: `data_processor_task`
- Version: `1.0.0`
- Description: A core Python training assignment project
