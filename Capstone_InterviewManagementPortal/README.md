# Capstone: Interview Management Portal

The **Interview Management Portal** is a secure, role-restricted, end-to-end recruitment management web application. It automates candidate profile management, resume uploads, interview scheduling, and feedback evaluations while enforcing a strict candidate status validation state machine.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC)**: Secure access restricted to three core system roles: **Admin**, **HR**, and **Interviewer** with ProtectedRoutes wrapping UI pages.
*   **Security & Password Enforcement**: Authenticates via Base64 Basic Auth headers. Newly created users start with a `reset_required` flag and are forced to reset their password on their first login.
*   **Candidate Profile Tracking**: Details like name, email (under `nucleusteq.com`), unique 10-digit mobile numbers, and experience metrics are strictly validated using Pydantic regex rules.
*   **Resume Management with GridFS**: Seamless PDF uploads. The system validates file types and sizes (up to 5MB) and streams files directly to and from MongoDB GridFS buckets to prevent database bottlenecks.
*   **Stateful Candidate Validation**: Enforces candidate state transitions through a logical pipeline:
    Profile Created → Interview Scheduled →  Interview Completed → Selected / Rejected.
    Reversions and illegal status jumps are blocked by the backend validator.
*   **Scheduling System**: HR can schedule and reschedule interviews with active interviewers at future date/times. The system prevents double-booking an interviewer at the same date and time.
*   **Evaluation & Ratings**: Interviewers submit scored feedback (Technical, Communication, and Problem Solving on a 1-5 scale), tech topics covered, comments, and a selection recommendation after the scheduled interview time starts.
*   **Deactivation Safeguards**: Admins cannot deactivate Interviewers who have pending future interviews.

---

## 🛠️ Technology Stack

### Backend
*   **Framework**: FastAPI (Python 3) for high-performance, asynchronous endpoints and automatic interactive documentation (Swagger UI).
*   **Database Integration**: Motor (AsyncIOMotorClient) for asynchronous interactions with MongoDB.
*   **Data Validation**: Pydantic v2.
*   **Testing**: Pytest, Pytest-Asyncio, Pytest-Cov.

### Frontend
*   **Framework**: Vite + React.
*   **Routing**: React Router DOM.
*   **Icons**: Lucide React.
*   **Styling**: Vanilla CSS (Tailored UI without bloated frameworks).

### Database
*   **Database Engine**: MongoDB (Local or Atlas).
*   **Asset Storage**: GridFS Bucket for PDF resume binaries.

---

## 📂 Project Structure

```text
Capstone_InterviewManagementPortal/
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── constants/         # App constants (allowed sizes, domain constraint)
│   │   ├── core/              # DB connection init, settings configuration
│   │   ├── enums/             # System states and status enums
│   │   ├── exceptions/        # Custom exceptions and global middleware handlers
│   │   ├── repositories/      # Database CRUD layer
│   │   ├── routers/           # REST endpoints
│   │   ├── schemas/           # Pydantic request and response models
│   │   ├── services/          # Core business logic & validations
│   │   ├── utils/             # Helper utilities (auth hashing, pagination)
│   │   └── main.py            # FastAPI entry point
│   ├── tests/                 # Unit test suite
│   ├── requirements.txt       # Backend dependencies
│   ├── seed_db.py             # Database seeder script
│   └── pytest.ini             # Pytest config
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI widgets (e.g., Alerts)
│   │   ├── pages/             # Login, Dashboard, Candidates, Interviews, Jobs, Users
│   │   ├── apiService.js      # Fetch API wrappers with Basic Auth injection
│   │   ├── App.jsx            # Routing and global layout sidebar
│   │   ├── main.jsx           # React app mountpoint
│   │   └── style.css          # Core stylesheet
│   ├── package.json           # Frontend packages
│   └── vite.config.js         # Vite compilation config
└── README.md                  # Project documentation
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
1.  **Python 3.8+** installed.
2.  **Node.js (v16+)** installed.
3.  **MongoDB** running locally on `mongodb://localhost:27017` (or configured via `.env`).

---

### Step 1: Database Setup & Seeding

1.  Start your MongoDB server locally.
2.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Seed the database with default accounts:
    ```bash
    python seed_db.py
    ```
    This seeds three default users for testing (with passwords hashed as base64):
    *   **Admin**: `admin@nucleusteq.com` / Password: `admin1`
    *   **HR**: `hr@nucleusteq.com` / Password: `hr1234`
    *   **Interviewer**: `interviewer@nucleusteq.com` / Password: `int123`

---

### Step 2: Running the Backend

1.  Make sure the configuration matches your local database settings in `backend/.env`:
    ```env
    MONGO_URI=mongodb://localhost:27017
    DB_NAME=Interview_Management_Portal
    ```
2.  Start the FastAPI server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
3.  Access the interactive API documentation at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step 3: Running the Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install npm dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the portal in your browser: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing

The backend has a complete test suite verifying routers, services, and validation logic.

To run the tests with code coverage:
```bash
cd backend
pytest --cov=app tests/
```

---

## 🔒 Security & Role Constraints Matrix

| Feature | Admin | HR | Interviewer |
| :--- | :---: | :---: | :---: |
| View System Analytics Dashboard | ✅ | ✅ | ✅ (Own Stats) |
| Manage System Users  | ✅ | ❌ | ❌ |
| Create & Manage Job Postings | ❌ | ✅ | ❌ (View Only) |
| Add Candidates & Upload Resumes | ❌ | ✅ | ❌ (View Assigned Only) |
| Schedule & Edit Interviews | ❌ | ✅ | ❌ |
| View Resume PDFs | ❌ | ✅ | ✅ (If Assigned) |
| Submit Candidate Evaluation & Ratings | ❌ | ❌ | ✅ (If Assigned) |
| Selection Decision (Selected/Rejected) | ❌ | ✅ | ❌ |
