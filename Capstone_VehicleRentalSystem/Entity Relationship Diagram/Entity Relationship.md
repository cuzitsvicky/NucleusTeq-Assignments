# Entity Relationship Diagram — Vehicle Rental System

## Overview

The database is built on **PostgreSQL** and consists of three core entities: `users`, `vehicles`, and `bookings`. These three tables together support all the system's functionality — authentication, vehicle management, and booking operations.

---

## Entities

### 1. `users`

Stores all registered users, both regular users and administrators. The `role` column controls what each user can do — a `USER` can browse and book vehicles, while an `ADMIN` can add, update, and delete vehicles and view all bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `BIGINT` | PRIMARY KEY, IDENTITY | Auto-generated unique user identifier |
| `username` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login name — must be unique across all users |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | User's email address — must be unique |
| `password` | `VARCHAR(255)` | NOT NULL | BCrypt-hashed password |
| `role` | `VARCHAR(255)` | NOT NULL | Either `USER` or `ADMIN` |
| `created_at` | `TIMESTAMP` | NOT NULL | Auto-set to current timestamp on registration |

---

### 2. `vehicles`

Stores all vehicles available in the system. The `added_by` column is a foreign key that tracks which admin added each vehicle, enforcing accountability. The `availability_status` flag is updated automatically when a booking is created or cancelled.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `vehicle_id` | `BIGINT` | PRIMARY KEY, IDENTITY | Auto-generated unique vehicle identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Display name of the vehicle (e.g., "Honda City") |
| `type` | `VARCHAR(255)` | NOT NULL | Either `CAR` or `BIKE` |
| `description` | `TEXT` | NULLABLE | Optional details about the vehicle |
| `availability_status` | `BOOLEAN` | NOT NULL, DEFAULT true | `true` = available for booking, `false` = currently booked |
| `added_by` | `BIGINT` | FOREIGN KEY → `users.user_id` | The admin user who added this vehicle |
| `created_at` | `TIMESTAMP` | NOT NULL | Auto-set to current timestamp on creation |

---

### 3. `bookings`

Records every booking made by a user. Each booking links a user to a vehicle for a specific time window. The system checks for overlapping confirmed or pending bookings before creating a new one, preventing double-booking. When a booking is created, `availability_status` on the vehicle is set to `false`; when cancelled, it is restored to `true`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `booking_id` | `BIGINT` | PRIMARY KEY, IDENTITY | Auto-generated unique booking identifier |
| `user_id` | `BIGINT` | FOREIGN KEY → `users.user_id` | The user who made the booking |
| `vehicle_id` | `BIGINT` | FOREIGN KEY → `vehicles.vehicle_id` | The vehicle that was booked |
| `start_date` | `TIMESTAMP` | NOT NULL | Booking start date and time |
| `end_date` | `TIMESTAMP` | NOT NULL | Booking end date and time |
| `status` | `VARCHAR(255)` | NOT NULL, DEFAULT `CONFIRMED` | One of: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `created_at` | `TIMESTAMP` | NOT NULL | Auto-set to current timestamp when booking is made |

---

## Relationships

### users → bookings (One-to-Many)
One user can make many bookings over time, but each booking belongs to exactly one user. This relationship is represented by the `user_id` foreign key on the `bookings` table.

### users → vehicles (One-to-Many)
One admin user can add many vehicles to the system, but each vehicle was added by exactly one admin. This is tracked via the `added_by` foreign key on the `vehicles` table.

### vehicles → bookings (One-to-Many)
One vehicle can have many bookings across different time periods, but each individual booking is for exactly one vehicle. This is represented by the `vehicle_id` foreign key on the `bookings` table.

---

