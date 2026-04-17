# SpringAdvanceAssignment — Todo REST API

A Spring Boot REST API for managing Todo items, built with Spring Data JPA, PostgreSQL, and Bean Validation. The project demonstrates layered architecture (Controller → Service → Repository), custom exception handling, status-transition business rules, and Mockito-based unit testing.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Domain Model](#domain-model)
- [API Endpoints](#api-endpoints)
- [Request & Response Formats](#request--response-formats)
- [Validation Rules](#validation-rules)
- [Status Transition Rules](#status-transition-rules)
- [Error Handling](#error-handling)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 4.0.5 |
| Language | Java 17 |
| Persistence | Spring Data JPA + Hibernate |
| Database | PostgreSQL |
| Validation | Jakarta Bean Validation |
| Build Tool | Maven  |
| Logging | SLF4J + Logback |
| Testing | JUnit 5 + Mockito |

---

## Project Structure

```
src/main/java/com/example/SpringAdvanceAssignment/
├── SpringAdvanceAssignmentApplication.java   # Entry point
├── controller/
│   └── TodoController.java                   # REST endpoints
├── service/
│   ├── TodoService.java                      # Service interface
│   ├── TodoServiceImpl.java                  # Business logic
│   └── NotificationServiceClient.java        # Notification side-effect
├── repository/
│   └── TodoRepository.java                   # JPA repository
├── entity/
│   └── Todo.java                             # JPA entity
├── dto/
│   ├── TodoRequestDTO.java                   # Inbound payload
│   ├── TodoResponseDTO.java                  # Outbound payload
│   └── ErrorResponseDTO.java                 # Error payload
├── enums/
│   └── Status.java                           # PENDING | COMPLETED
└── exception/
    ├── GlobalExceptionHandler.java           # @RestControllerAdvice
    ├── ResourceNotFoundException.java        # 404 trigger
    └── InvalidStatusTransitionException.java # 400 trigger

src/test/java/com/example/SpringAdvanceAssignment/
└── TodoServiceTest.java                      # Unit tests (8 test cases)
```

---

## Domain Model

### Todo Entity

| Field | Type | Notes |
|---|---|---|
| `id` | `Long` | Auto-generated primary key |
| `title` | `String` | Required, min 3 characters |
| `description` | `String` | Required |
| `status` | `Status` (enum) | `PENDING` or `COMPLETED` |
| `createdAt` | `LocalDateTime` | Set on creation |

### Status Enum

```
PENDING
COMPLETED
```

---

## API Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| `POST` | `/todos` | Create a new Todo | `201 Created` |
| `GET` | `/todos` | Retrieve all Todos | `200 OK` |
| `GET` | `/todos/{id}` | Retrieve a Todo by ID | `200 OK` |
| `PUT` | `/todos/{id}` | Update a Todo by ID | `200 OK` |
| `DELETE` | `/todos/{id}` | Delete a Todo by ID | `200 OK` |

### 🔹 1. Create TODO

```
POST /todos
```
![alt text](<screenshots/Screenshot 2026-04-18 024735.png>)

---

### 🔹 2. Get All TODOs

```
GET /todos
```
![alt text](<screenshots/Screenshot 2026-04-18 024811.png>)
---

### 🔹 3. Get TODO by ID

```
GET /todos/{id}
```
![alt text](<screenshots/Screenshot 2026-04-18 024834.png>)
---

### 🔹 4. Update TODO

```
PUT /todos/{id}
```
![alt text](<screenshots/Screenshot 2026-04-18 024916.png>)
---

### 🔹 5. Delete TODO

```
DELETE /todos/{id}
```
![alt text](<screenshots/Screenshot 2026-04-18 024946.png>)
---



## Request & Response Formats

### Create / Update Request Body

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, and bread",
  "status": "PENDING"
}
```

### Todo Response Body

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, and bread",
  "status": "PENDING",
  "createdAt": "2025-04-18T10:30:00"
}
```

### Delete Response

```
Todo deleted successfully
```

---

## Validation Rules

Applied via Jakarta Bean Validation on `TodoRequestDTO`:

| Field | Constraint | Message |
|---|---|---|
| `title` | `@NotNull` | Title cannot be null |
| `title` | `@Size(min = 3)` | Title must be at least 3 characters |
| `description` | `@NotNull` | Description cannot be null |
| `status` | `@NotNull` | Status cannot be null |

Validation failures return `400 Bad Request` with a field-level error map:

```json
{
  "timestamp": "2025-04-18T10:30:00",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "path": "/todos",
  "errors": {
    "title": "Title must be at least 3 characters"
  }
}
```

---

## Status Transition Rules

Only the following status changes are permitted on update:

| From | To | Allowed |
|---|---|---|
| `PENDING` | `COMPLETED` | ✅ Yes |
| `COMPLETED` | `PENDING` | ✅ Yes |
| `PENDING` | `PENDING` | ❌ No |
| `COMPLETED` | `COMPLETED` | ❌ No |
| Any | Invalid value | ❌ No (throws exception) |

An invalid transition returns `400 Bad Request`.

---

## Error Handling

All errors are handled centrally by `GlobalExceptionHandler` (`@RestControllerAdvice`).

### Error Response Format

```json
{
  "timestamp": "2025-04-18T10:30:00",
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Todo not found with id: 99",
  "path": "/todos/99"
}
```

### Error Scenarios

| Exception | HTTP Status | Trigger |
|---|---|---|
| `ResourceNotFoundException` | `404 Not Found` | Todo ID does not exist |
| `InvalidStatusTransitionException` | `400 Bad Request` | Illegal status change |
| `MethodArgumentNotValidException` | `400 Bad Request` | Bean Validation failure |
| `Exception` (catch-all) | `500 Internal Server Error` | Unexpected server error |

### 🔹 1. ResourceNotFoundException

![alt text](<screenshots/Screenshot 2026-04-18 031115.png>)

---

### 🔹 2. InvalidStatusTransitionException

![alt text](<screenshots/Screenshot 2026-04-18 030934.png>)
---

### 🔹 3. MethodArgumentNotValidException

![alt text](<screenshots/Screenshot 2026-04-18 031238.png>)
---

### 🔹 4. Exception (catch-all)

![alt text](<screenshots/Screenshot 2026-04-18 031403.png>)

---

## Database Configuration

Configure in `src/main/resources/application.properties`:

```properties
spring.application.name=SpringAdvanceAssignment

# PostgreSQL connection
spring.datasource.url=jdbc:postgresql://localhost:5432/SpringAdvanceAssignment
spring.datasource.username=postgres
spring.datasource.password=2004

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.format_sql=true
```

**Prerequisites:**
- PostgreSQL running on `localhost:5432`
- Database named `SpringAdvanceAssignment` already created
- Credentials match the properties above (`postgres` / `2004`)

To create the database manually:

```sql
CREATE DATABASE "SpringAdvanceAssignment";
```

---

## Running the Application

**Using Maven Wrapper (recommended):**

```bash
# Unix / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

**Using system Maven:**

```bash
mvn spring-boot:run
```

The application starts on `http://localhost:8080` by default.

---

## Running Tests

```bash
# Run all tests
./mvnw test

# Run tests with verbose output
./mvnw test -Dsurefire.useFile=false
```

### Test Coverage

`TodoServiceTest` contains 8 unit tests covering the service layer in isolation using Mockito mocks for the repository and notification client:

| Test | Scenario |
|---|---|
| `createTodo_shouldSaveAndReturnResponse` | Happy path — todo is saved and notification is sent |
| `getAllTodos_shouldReturnList` | Returns all todos as a list of DTOs |
| `getTodoById_shouldReturnTodo` | Retrieves a single todo by ID |
| `getTodoById_shouldThrowException` | Throws `ResourceNotFoundException` for unknown ID |
| `updateTodo_shouldUpdateSuccessfully` | `PENDING → COMPLETED` transition succeeds |
| `updateTodo_shouldThrowInvalidTransition` | Invalid status string throws exception |
| `updateTodo_shouldThrowNotFound` | Update of non-existent ID throws `ResourceNotFoundException` |
| `deleteTodo_shouldDelete` | Existing todo is deleted via repository |
| `deleteTodo_shouldThrowException` | Delete of non-existent ID throws `ResourceNotFoundException` |