# ኑ እንማር (Nu Inmar) — Learning Management System

A full-stack LMS built with Node.js/Express/PostgreSQL (backend, MVC architecture,
REST API, JWT auth) and React/React Router/Axios/Bootstrap (frontend).

## Features

- User registration & login (Student / Instructor roles)
- JWT authentication, bcrypt password hashing
- Role-based authorization enforced on the backend
- Course CRUD (instructor-owned)
- Lesson CRUD (nested under courses)
- Student enrollment (many-to-many, enforced unique)
- Lesson content gated behind enrollment (or instructor ownership)
- Per-lesson progress tracking with per-course completion percentage
- Morgan HTTP request logging
- Separate frontend/backend, communicating over a REST API

## Tech Stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Backend    | Node.js, Express.js, PostgreSQL (pg), JWT, bcrypt, Morgan |
| Frontend   | React, React Router, Axios, Bootstrap 5       |
| Architecture | MVC (Models / Controllers / Routes), REST API |

## Project Structure

```
lms-project/
├── backend/
│   ├── config/db.js              # PostgreSQL connection pool
│   ├── models/                   # DB access layer (one file per table)
│   ├── controllers/              # Request handling + business logic
│   ├── routes/                   # Express routers
│   ├── middleware/                # JWT verification + role authorization
│   ├── database/schema.sql       # Full DDL
│   └── server.js                 # App entry point
└── frontend/
    └── src/
        ├── api/axios.js          # Shared axios instance (auto-attaches JWT)
        ├── context/AuthContext.js # Global auth state
        ├── components/           # Navbar, route guards
        ├── pages/                 # Route-level pages
        └── App.js                # Route definitions
```

## Setup

### 1. Database

```bash
psql -U postgres
```
```sql
CREATE DATABASE lms_db;
\c lms_db
\i backend/database/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your PostgreSQL credentials and a real JWT_SECRET
npm run dev
```

Backend runs at `http://localhost:5000`.

Required `.env` variables:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=lms_db
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=1d
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

## Authentication & Authorization Model

- On register/login, the backend signs a JWT containing `{ id, role }`.
- The frontend stores the JWT in `localStorage` and attaches it to every
  request via an Axios interceptor (`Authorization: Bearer <token>`).
- `middleware/authMiddleware.js` verifies the JWT on every protected route.
- `middleware/roleMiddleware.js` restricts specific routes to `student` or
  `instructor` (e.g. only instructors can create courses).
- Beyond role checks, controllers also verify **ownership** (e.g. an
  instructor can only edit/delete their own courses and lessons) and
  **enrollment** (a student can only view lesson content or track progress
  for courses they've enrolled in).
- The frontend's `RoleRoute`/`PrivateRoute` components are a UX convenience
  only — the backend is the actual source of truth for authorization.

## API Endpoints

| Method | Endpoint                             | Access                  | Description |
|--------|---------------------------------------|-------------------------|-------------|
| POST   | /api/auth/register                   | Public                  | Create account |
| POST   | /api/auth/login                      | Public                  | Log in, get JWT |
| GET    | /api/courses                         | Authenticated           | List all courses |
| GET    | /api/courses/mine                    | Instructor              | List own courses |
| GET    | /api/courses/:id                     | Authenticated           | Course details |
| POST   | /api/courses                         | Instructor              | Create course |
| PUT    | /api/courses/:id                     | Instructor (owner)      | Update course |
| DELETE | /api/courses/:id                     | Instructor (owner)      | Delete course |
| GET    | /api/courses/:courseId/lessons       | Authenticated           | List lessons (preview) |
| POST   | /api/courses/:courseId/lessons       | Instructor (owner)      | Create lesson |
| GET    | /api/lessons/:id                     | Owner or enrolled student | Full lesson content |
| PUT    | /api/lessons/:id                     | Instructor (owner)      | Update lesson |
| DELETE | /api/lessons/:id                     | Instructor (owner)      | Delete lesson |
| POST   | /api/enrollments                     | Student                 | Enroll in a course |
| GET    | /api/enrollments/my                  | Student                 | List own enrollments |
| GET    | /api/enrollments/course/:courseId    | Instructor (owner)      | List enrolled students |
| POST   | /api/progress                        | Student (enrolled)      | Mark lesson complete/incomplete |
| GET    | /api/progress/course/:courseId       | Student (enrolled)      | Per-lesson + overall progress |

## Database Schema

See `backend/database/schema.sql` for full DDL. Summary:

- **users** — id, name, email (unique), password (bcrypt hash), role (`student`/`instructor`, enforced via CHECK constraint)
- **courses** — id, title, description, instructor_id (FK → users)
- **lessons** — id, course_id (FK → courses), title, content, video_url, order_index
- **enrollments** — id, student_id (FK → users), course_id (FK → courses), unique(student_id, course_id)
- **lesson_progress** — id, student_id (FK → users), lesson_id (FK → lessons), completed, completed_at, unique(student_id, lesson_id)

## Notes for Graders / Reviewers

- Passwords are never stored or logged in plain text (`bcrypt.hash`, 10 salt rounds).
- JWT secret and DB credentials are kept out of source control via `.env` (gitignored); `.env.example` documents required variables.
- Morgan logs every HTTP request (method, path, status, response time) to the console in dev mode.
- All database access goes through parameterized queries (`$1, $2, ...` placeholders) to prevent SQL injection.
