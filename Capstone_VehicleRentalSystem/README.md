# 🚗 NexRide — Vehicle Rental System

<div align="center">



**A full-stack vehicle rental platform with role-based access control, real-time availability checking, and seamless booking management.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Security & Authentication](#-security--authentication)
- [Frontend Pages](#-frontend-pages)
- [Environment Configuration](#-environment-configuration)

---

## 🌟 Overview

NexRide is a full-stack vehicle rental system built with a **Spring Boot** REST backend and a **vanilla JavaScript** frontend. It supports two distinct user roles — **USER** and **ADMIN** — each with a tailored interface and access to different system capabilities.

Users can browse vehicles, check availability for specific date ranges, and manage their bookings. Admins can manage the entire vehicle inventory and view all bookings across the platform.

---

## ✨ Features

### For Users
- 🔐 Register and log in securely with JWT-based authentication
- 🚘 Browse all available vehicles (Cars & Bikes)
- 📅 Check real-time vehicle availability for a custom date/time range
- 🔍 Filter vehicles by type (Car/Bike), availability status, or name search
- 📝 Book a vehicle for a specific time window
- ❌ Cancel upcoming bookings (before the start date)
- 👤 View personal profile and account details
- 📋 View complete booking history with live status updates

### For Admins
- ➕ Add new vehicles to the platform
- ✏️ Update vehicle details and availability status
- 🗑️ Delete vehicles (only if no active/upcoming bookings exist)
- 📊 View all bookings across all users
- 🔎 View booking history for any individual vehicle

### System-level
- 🔒 Role-based access control enforced at both API and UI levels
- ⚡ Auto-completion of expired bookings (CONFIRMED → COMPLETED)
- 🚫 Double-booking prevention via overlap detection
- 🌐 CORS-enabled for frontend-backend separation
- 🛡️ Global exception handling with structured error responses

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Spring Boot 4.0.5 |
| **Language** | Java 17 |
| **Database** | PostgreSQL |
| **ORM** | Spring Data JPA / Hibernate |
| **Security** | Spring Security + JWT (jjwt 0.13.0) |
| **Validation** | Jakarta Bean Validation |
| **Password Hashing** | BCrypt |
| **Build Tool** | Maven (via Maven Wrapper) |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Fonts** | Google Fonts (Playfair Display, DM Sans) |

---

## 📁 Project Structure

```
Capstone_VehicleRentalSystem/
│
├── Entity Relationship.md          # Database ER documentation
│
├── backend/                        # Spring Boot application
│   ├── mvnw / mvnw.cmd             # Maven wrapper scripts
│   ├── pom.xml                     # Maven dependencies & build config
│   └── src/
│       └── main/
│           ├── java/com/example/backend/
│           │   │
│           │   ├── BackendApplication.java         # Application entry point
│           │   │
│           │   ├── config/
│           │   │   ├── AppConfig.java              # BCrypt bean configuration
│           │   │   └── CorsConfig.java             # CORS mapping configuration
│           │   │
│           │   ├── controller/
│           │   │   ├── AdminController.java        # Admin vehicle management endpoints
│           │   │   ├── AuthController.java         # Auth (signup/login) endpoints
│           │   │   ├── BookingController.java      # Booking CRUD endpoints
│           │   │   ├── UserController.java         # User profile endpoint
│           │   │   └── VehicleController.java      # Vehicle browsing endpoints
│           │   │
│           │   ├── dto/
│           │   │   ├── request/
│           │   │   │   ├── BookingRequestDto.java
│           │   │   │   ├── LoginRequestDto.java
│           │   │   │   ├── SignupRequestDto.java
│           │   │   │   └── VehicleRequestDto.java
│           │   │   └── response/
│           │   │       ├── BookingResponseDto.java
│           │   │       ├── ErrorResponse.java
│           │   │       ├── LoginResponseDto.java
│           │   │       ├── SignUpResponseDto.java
│           │   │       └── VehicleResponseDto.java
│           │   │
│           │   ├── exception/
│           │   │   ├── BadRequestException.java
│           │   │   ├── DuplicateResourceException.java
│           │   │   ├── ForbiddenException.java
│           │   │   ├── GlobalExceptionHandler.java  # Centralized error handling
│           │   │   ├── ResourceNotFoundException.java
│           │   │   └── UnauthorizedException.java
│           │   │
│           │   ├── model/
│           │   │   ├── Booking.java                # Booking entity
│           │   │   ├── User.java                   # User entity (USER/ADMIN roles)
│           │   │   └── Vehicle.java                # Vehicle entity (CAR/BIKE types)
│           │   │
│           │   ├── repository/
│           │   │   ├── BookingRepository.java      # JPA repository for bookings
│           │   │   ├── UserRepository.java         # JPA repository for users
│           │   │   └── VehicleRepository.java      # JPA repository for vehicles
│           │   │
│           │   ├── security/
│           │   │   ├── AuthService.java            # Signup & login business logic
│           │   │   ├── AuthUtil.java               # JWT generation & validation
│           │   │   ├── CustomUserDetailsService.java # Spring Security user loader
│           │   │   ├── JwtAuthFilter.java          # JWT request filter
│           │   │   └── WebSecurityConfig.java      # Security filter chain config
│           │   │
│           │   └── service/
│           │       ├── BookingService.java         # Booking business logic
│           │       ├── UserService.java            # User retrieval logic
│           │       └── VehicleService.java         # Vehicle business logic
│           │
│           └── resources/
│               └── application.properties          # App configuration (gitignored)
│
└── frontend/                       # Static HTML/CSS/JS frontend
    ├── index.html                  # Landing page & login overlay
    ├── register.html               # User registration page
    ├── vehicles.html               # Vehicle browsing (user view)
    ├── bookings.html               # My bookings (user view)
    ├── UserProfile.html            # User profile page
    ├── admin.html                  # Admin dashboard
    │
    ├── css/
    │   ├── styles.css              # Global stylesheet (dark theme)
    │   └── userprofile.css         # Profile page-specific styles
    │
    ├── js/
    │   ├── scripts.js              # Shared utilities (API, auth, helpers)
    │   ├── index.js                # Login page logic
    │   ├── register.js             # Registration form logic
    │   ├── vehicles.js             # Vehicle browsing, filtering, booking
    │   ├── bookings.js             # My bookings page logic
    │   ├── profile.js              # Profile page logic
    │   └── admin.js                # Admin dashboard logic
    │
    └── img/                        # Static image assets
        ├── logo.png
        ├── car.png
        ├── car2.png
        ├── car3.png
        └── bike.png
```

---

## 🗄 Database Schema

The system uses three core tables in PostgreSQL.

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `BIGINT` | PK, IDENTITY | Auto-generated unique identifier |
| `username` | `VARCHAR(255)` | NOT NULL | Display name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login credential |
| `password` | `VARCHAR(255)` | NOT NULL | BCrypt-hashed password |
| `role` | `VARCHAR(255)` | NOT NULL | `USER` or `ADMIN` |
| `created_at` | `TIMESTAMP` | NOT NULL | Account creation time |

### `vehicles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `vehicle_id` | `BIGINT` | PK, IDENTITY | Auto-generated unique identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Vehicle display name |
| `type` | `VARCHAR(255)` | NOT NULL | `CAR` or `BIKE` |
| `description` | `TEXT` | NULLABLE | Optional vehicle details |
| `availability_status` | `BOOLEAN` | NOT NULL, DEFAULT `true` | `true` = bookable |
| `added_by` | `BIGINT` | FK → `users.user_id` | Admin who added the vehicle |
| `created_at` | `TIMESTAMP` | NOT NULL | Record creation time |

### `bookings`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `booking_id` | `BIGINT` | PK, IDENTITY | Auto-generated unique identifier |
| `user_id` | `BIGINT` | FK → `users.user_id` | Booking owner |
| `vehicle_id` | `BIGINT` | FK → `vehicles.vehicle_id` | Booked vehicle |
| `start_date` | `TIMESTAMP` | NOT NULL | Rental start |
| `end_date` | `TIMESTAMP` | NOT NULL | Rental end |
| `status` | `VARCHAR(255)` | NOT NULL, DEFAULT `CONFIRMED` | `PENDING` / `CONFIRMED` / `COMPLETED` / `CANCELLED` |
| `created_at` | `TIMESTAMP` | NOT NULL | Booking creation time |

### Entity Relationships
```
users ──< bookings >── vehicles
  │                        │
  └── (added_by) ──────────┘
```
- One **user** → many **bookings**
- One **vehicle** → many **bookings**
- One **admin user** → many **vehicles** (via `added_by`)

---

## 📡 API Endpoints

Base URL: `http://localhost:8080`

### 🔓 Auth — `/api/auth`
> Public endpoints, no token required.

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | `{ username, email, password, role? }` |
| `POST` | `/api/auth/login` | Log in and receive a JWT | `{ email, password }` |

**Signup Request**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "USER"
}
```

**Login Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER"
}
```

---

### 🚘 Vehicles — `/api/vehicles`
> GET endpoints are public. All others require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | ❌ Public | Get all vehicles |
| `GET` | `/api/vehicles/{vehicleId}` | ❌ Public | Get a specific vehicle by ID |
| `GET` | `/api/vehicles/available` | ❌ Public | Get all available vehicles (simple flag check) |
| `GET` | `/api/vehicles/available?start={ISO}&end={ISO}` | ❌ Public | Get vehicles with no booking conflicts in the given date range |

**Date-Range Query Example**
```
GET /api/vehicles/available?start=2025-06-01T10:00:00&end=2025-06-05T10:00:00
```

**Vehicle Response**
```json
{
  "vehicleId": 3,
  "name": "Honda City",
  "type": "Car",
  "description": "Comfortable sedan for city drives",
  "availabilityStatus": true,
  "addedByUserId": 1,
  "addedByUsername": "admin_user",
  "createdAt": "2025-01-15T09:30:00"
}
```

---

### 🔒 Admin — `/api/admin`
> Requires `ADMIN` role. Send `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/admin/vehicles` | Add a new vehicle | `{ name, type, description?, availabilityStatus? }` |
| `PUT` | `/api/admin/vehicles/{vehicleId}` | Update a vehicle | `{ name, type, description?, availabilityStatus? }` |
| `DELETE` | `/api/admin/vehicles/{vehicleId}` | Delete a vehicle (blocks if active bookings exist) | — |

**Add/Update Vehicle Request**
```json
{
  "name": "Royal Enfield Classic 350",
  "type": "Bike",
  "description": "Retro-style touring motorcycle",
  "availabilityStatus": true
}
```

> ⚠️ `type` must be exactly `"Car"` or `"Bike"`. Deletion is blocked if the vehicle has active or upcoming `CONFIRMED`/`PENDING` bookings.

---

### 📋 Bookings — `/api/bookings`
> All endpoints require authentication. Some are ADMIN-only.

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | USER / ADMIN | Create a new booking |
| `GET` | `/api/bookings/my-bookings` | USER / ADMIN | Get bookings for the authenticated user |
| `GET` | `/api/bookings/all` | ADMIN only | Get all bookings in the system |
| `GET` | `/api/bookings/vehicle/{vehicleId}` | ADMIN only | Get all bookings for a specific vehicle |
| `DELETE` | `/api/bookings/{bookingId}` | USER / ADMIN | Cancel a booking (owner or admin) |

**Create Booking Request**
```json
{
  "vehicleId": 3,
  "startDate": "2025-06-01T10:00:00",
  "endDate": "2025-06-05T10:00:00"
}
```

**Booking Response**
```json
{
  "bookingId": 12,
  "userId": 5,
  "username": "john_doe",
  "vehicleId": 3,
  "vehicleName": "Honda City",
  "type": "Car",
  "startDate": "2025-06-01T10:00:00",
  "endDate": "2025-06-05T10:00:00",
  "status": "CONFIRMED",
  "createdAt": "2025-05-20T14:22:00"
}
```

> **Booking Rules:**
> - Start date must be in the future.
> - End date must be after start date.
> - No overlapping `CONFIRMED` or `PENDING` bookings for the same vehicle.
> - Cancellation is only allowed before the start date.
> - Expired `CONFIRMED`/`PENDING` bookings are auto-transitioned to `COMPLETED` on retrieval.

---

### 👤 Users — `/api/users`
> Requires authentication.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/me` | Get the currently authenticated user's profile |

**Response**
```json
{
  "userId": 5,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2025-01-10T08:00:00"
}
```

---

### ⚠️ Error Responses

All errors follow a consistent structure:

```json
{
  "timestamp": "2025-05-20T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Vehicle is not available for the selected time range",
  "validationErrors": null
}
```

| HTTP Status | Exception | When |
|---|---|---|
| `400 Bad Request` | `BadRequestException` | Invalid dates, double-booking attempt, etc. |
| `401 Unauthorized` | `UnauthorizedException` | Wrong credentials or missing token |
| `403 Forbidden` | `ForbiddenException` | Attempting to access another user's resource |
| `404 Not Found` | `ResourceNotFoundException` | Vehicle, user, or booking not found |
| `409 Conflict` | `DuplicateResourceException` | Email already registered |
| `400 Bad Request` | `MethodArgumentNotValidException` | Bean validation failure (includes field-level errors) |

---

## 🔐 Security & Authentication

NexRide uses **stateless JWT-based authentication**:

1. On login, the server generates a signed JWT containing the user's email and role.
2. The client stores the token in `localStorage` and sends it in the `Authorization: Bearer <token>` header on subsequent requests.
3. The `JwtAuthFilter` intercepts every request, validates the token, and populates the Spring Security context.
4. Method-level security (`@PreAuthorize`) enforces role restrictions on service methods.

**Token Details**
- Algorithm: HMAC-SHA (configured secret key)
- Expiry: 10 hours
- Claims: `sub` (email), `role`

**Access Control Summary**

| Resource | PUBLIC | USER | ADMIN |
|---|---|---|---|
| `GET /api/vehicles/**` | ✅ | ✅ | ✅ |
| `POST /api/auth/**` | ✅ | ✅ | ✅ |
| `POST /api/bookings` | ❌ | ✅ | ✅ |
| `GET /api/bookings/my-bookings` | ❌ | ✅ | ✅ |
| `GET /api/bookings/all` | ❌ | ❌ | ✅ |
| `GET /api/bookings/vehicle/{id}` | ❌ | ❌ | ✅ |
| `POST /api/admin/vehicles` | ❌ | ❌ | ✅ |
| `PUT /api/admin/vehicles/{id}` | ❌ | ❌ | ✅ |
| `DELETE /api/admin/vehicles/{id}` | ❌ | ❌ | ✅ |

---

## 🖥 Frontend Pages

| Page | File | Access | Description |
|---|---|---|---|
| Landing | `index.html` | Public | Hero page with login overlay |
| Register | `register.html` | Public | New user registration form |
| Vehicles | `vehicles.html` | USER / ADMIN | Browse, filter, and book vehicles |
| My Bookings | `bookings.html` | USER / ADMIN | View and cancel personal bookings |
| Profile | `UserProfile.html` | USER / ADMIN | Account details and activity |
| Admin Dashboard | `admin.html` | ADMIN only | Manage vehicles and view all bookings |

### Shared JavaScript (`js/scripts.js`)
Central utility module providing:
- `apiRequest()` — Unified fetch wrapper with auth header injection and error parsing
- `saveLoginData()` / `getToken()` / `getCurrentUser()` — Token and session management
- `requireLogin()` / `requireAdminPage()` — Route guards
- `formatDateTime()` / `escapeHtml()` / `getVehicleImage()` — View helpers
- `showError()` / `clearError()` — UI error display

---

## ⚙️ Environment Configuration

| Property | Description | Example |
|---|---|---|
| `spring.datasource.url` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/nexride` |
| `spring.datasource.username` | DB username | `postgres` |
| `spring.datasource.password` | DB password | `yourpassword` |
| `spring.jpa.hibernate.ddl-auto` | Schema strategy | `update` (dev) / `validate` (prod) |
| `jwt.secretKey` | HS256 signing secret (≥32 chars) | `my-super-secret-key-for-nexride` |
| `server.port` | Backend server port | `8080` |

The frontend base URL is configured at the top of `js/scripts.js`:
```javascript
const BASE_URL = "http://localhost:8080";
```
Update this value if your backend runs on a different host or port.

---

