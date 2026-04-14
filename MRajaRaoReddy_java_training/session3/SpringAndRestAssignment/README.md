# 🚀 User Management System — Spring Boot

> A Spring Boot REST API for managing users using an in-memory data store, demonstrating IoC, Dependency Injection, layered architecture, and RESTful API design.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Java 17 | Core language |
| Spring Boot | Application framework |
| Maven | Build & dependency management |
| REST APIs | Exposing endpoints |

---

## 🧱 Project Structure

```
java/session3/
└── user-management/
    ├── controller/
    │   └── UserController.java
    ├── service/
    │   └── UserService.java
    ├── repository/
    │   └── UserRepository.java
    ├── model/
    │   └── User.java
    ├── dto/
    │   └── UserRequest.java
    ├── exception/
    │   ├── BadRequestException.java
    │   └── GlobalExceptionHandler.java
    └── UserManagementApplication.java
```

---

## ⚙️ Features Implemented

### ✅ 1. Search Users API

- **Endpoint:** `GET /users/search`
- Supports dynamic filtering using query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `String` | Case-insensitive name filter |
| `age` | `Integer` | Exact age match |
| `role` | `String` | Case-insensitive role filter |

**Examples:**

```
GET /users/search
GET /users/search?name=Priya
GET /users/search?age=30
GET /users/search?role=USER
GET /users/search?age=30&role=USER
```

---

### ✅ 2. Submit User API

- **Endpoint:** `POST /users/submit`
- Accepts a JSON request body via DTO
- Performs manual validation

**Sample Request:**

```json
{
  "name": "Vicky",
  "age": 22,
  "role": "USER"
}
```

**Responses:**

| Status | Meaning |
|--------|---------|
| `201 Created` | User created successfully |
| `400 Bad Request` | Invalid input provided |

---

### ✅ 3. Delete User API

- **Endpoint:** `DELETE /users/{id}`
- Requires a `confirm` query parameter for safe deletion

**Examples:**

```
DELETE /users/1
DELETE /users/1?confirm=false
DELETE /users/1?confirm=true
```

**Behavior:**

| Condition | Response |
|-----------|----------|
| `confirm` missing or `false` | `"Confirmation required"` |
| `confirm=true` | User is deleted successfully |

---

## 🧠 Key Concepts Used

### 🔹 Inversion of Control (IoC)
Spring manages object creation and lifecycle — no manual `new` keyword needed.

### 🔹 Dependency Injection
Constructor-based dependency injection is used consistently across all layers.

### 🔹 Layered Architecture
Strict separation of concerns across three layers:

```
Controller  →  Handles HTTP requests & responses
Service     →  Contains business logic
Repository  →  Handles in-memory data storage
```

### 🔹 Exception Handling
- Custom exception: `BadRequestException`
- Global handler using `@RestControllerAdvice`

---

## 🔒 Validation Rules

| Field | Rule |
|-------|------|
| `name` | Cannot be empty |
| `age` | Must not be null |
| `role` | Cannot be empty |

---

## 📊 Sample Data

The application initializes with **6 dummy users** stored in memory on startup. No external database is required.

---

## 🧪 Testing with Postman

1. Start the application
2. Use base URL:
   ```
   http://localhost:8080
   ```
3. Test the following:

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/users/search` | Fetch / filter users |
| `POST` | `/users/submit` | Create a new user |
| `DELETE` | `/users/{id}?confirm=true` | Delete a user |

---

## 🚀 How to Run

```bash
# Clone the repository
git clone https://github.com/your-username/YourName_java_training.git

# Navigate to the project
cd java/session3/user-management

# Run the application
mvn spring-boot:run
```

Access APIs at: `http://localhost:8080`

---

## 📈 Code Quality Highlights

- ✅ Clean and readable code
- ✅ Proper naming conventions
- ✅ Separation of concerns
- ✅ RESTful API design principles
- ✅ Constructor-based dependency injection throughout

---

## 👨‍💻 Author

**M Raja Rao Reddy**

---

## 📌 Notes

- No database used — in-memory storage as per assignment requirement
- Built as part of the **Spring Boot REST — Session 3** assignment