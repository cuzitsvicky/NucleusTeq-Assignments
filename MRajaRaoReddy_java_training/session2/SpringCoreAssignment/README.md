# 🌱 Spring Boot Assignment — Session 2

> A Spring Boot REST API project demonstrating core concepts like layered architecture, dependency injection, and RESTful services using in-memory data.

---

## 🚀 Technologies Used

| Technology | Purpose |
|------------|---------|
| Java 17 | Core language |
| Spring Boot | Application framework |
| Maven | Build & dependency management |
| REST APIs | Exposing endpoints |
| Postman | API testing |

---

## 🏗️ Project Structure

The project follows a clean **layered architecture**:

```
Controller → Service → Repository
```

```
com.example.springcoreassignment
│
├── controller       # Handles HTTP requests
├── service          # Business logic
├── repository       # Data access layer
├── model            # Entity/model classes
├── component        # Custom Spring components
└── exception        # Global exception handling
```

---

## 🔑 Features Implemented

### 1️⃣ User Management System

Full CRUD operations for managing users.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `GET` | `/users/{id}` | Get user by ID |
| `POST` | `/users` | Create a new user |
| `PUT` | `/users/{id}` | Full update of a user |
| `PATCH` | `/users/{id}` | Partial update of a user |
| `DELETE` | `/users/{id}` | Delete a user |

---

### 2️⃣ Notification System

Triggers a notification via a simple GET request.

```
GET /notify
```

**Response:**
```
Notification Sent
```

---

### 3️⃣ Dynamic Message Formatter

Returns a message based on the provided type query parameter.

```
GET /message?type=SHORT
GET /message?type=LONG
```

---

## ⚙️ Spring Concepts Used

- **Inversion of Control (IoC)**
- **Dependency Injection** (Constructor-based)
- **Component Scanning**
- `@RestController`
- `@Service`
- `@Repository`
- `@Component`

---

## 🧠 In-Memory Data Handling

- Data is stored using **Java collections** (`List`)
- **No database** is used
- Data resets when the application restarts

---

## ❗ Exception Handling

Global exception handling is implemented using `@RestControllerAdvice`.

**Custom Exceptions:**
- `UserNotFoundException`
- `DuplicateUserException`

---

## ✅ Validation

Validation is applied during user creation using the following annotations:

| Annotation | Purpose |
|------------|---------|
| `@NotBlank` | Ensures name is not empty |
| `@Email` | Validates email format |
| `@Valid` | Triggers validation on request body |

---

## 🧪 API Testing

All APIs are tested using **Postman**.

**Example Request:**

```http
POST /users
Content-Type: application/json

{
  "name": "Vicky",
  "email": "vicky@email.com"
}
```

---

## 📦 How to Run

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Open the project** in IntelliJ IDEA

3. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Access APIs** at:
   ```
   http://localhost:8080
   ```

---

## 🔄 Version Control

- Each commit represents a logical step of progress

---

## 👨‍💻 Author

**M Raja Rao Reddy**

---

## 📌 Notes

- This project is built for **learning purposes**
- Follows **clean coding practices**
- Demonstrates **Spring Boot fundamentals** clearly
