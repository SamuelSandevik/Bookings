# Fullstack (Rust + Next.js) Template

A fullstack template with built-in authentication — ready to plug and play.

Skip the hassle of setting up the foundation. Just add your routes, migrations, and build your app.

---

## 🚀 Getting Started

> **Important:** The PostgreSQL database **must** be named `app`, since cron jobs are configured to target this specific name in `postgresql.conf`.  
> If you change the database name, make sure to update it everywhere (cron job scripts, config files, etc.).

> 🧹 A cron job is configured to delete `event_logs` older than 30 days to conserve memory.  
> You can change this behavior in the `init.sql` migration file.

---

## 🔐 Authentication Methods

This template includes multiple authentication methods out of the box:

- **Credentials**  
  Authenticate users using email and password.

- **One-Time Codes (OTC)**  
  Login without a password using a one-time code.  
  Codes older than 1 day are automatically deleted daily at 03:00.  
  > ✉️ Some setup is required for sending OTCs via email/SMS.

- **Lost Password Codes (LPWC)**  
  Used to reset a forgotten password.  
  LPWCs older than 1 day are also deleted daily at 03:00.  
  > ✉️ Configuration is required for sending LPWCs.

---

## 🧱 Architecture Overview

### 👤 User Creation Flow

Each user has two related entities:

- A **Profile**, containing general user info like name and email.
- A **User Account**, storing credentials and access control. It references the profile via `profile_uuid`.

This allows for creation of users (e.g. employees) without assigning login credentials until needed.

### 🗃 Example Database Schema

```text
 _________________________
|       User Table        |
|_________________________|
| uuid: 0000-1111         |
| profile_uuid: 0000-1211 |
| password_hash: ...      |
| created_at: 170234145656|
|_________________________|

 _________________________
|      Profile Table      |
|_________________________|
| uuid: 0000-1211         |
| first_name: John        |
| last_name: Doe          |
| created_at: 170234145656|
|_________________________|

```

---

## ⚙️ Running the Application

### ENV vars
```bash
    DATABASE_URL=postgres://{user}:{password}@{db_location}:5432/app
    BACKEND_SERVER_URI=http://0.0.0.0:8005
    BACKEND_HOST=0.0.0.0
    BACKEND_PORT=8005
    JWT_SECRET=...
```

### ▶️ Backend

# Command

`cd backend`  
`cargo run`

> Starts the backend at the configured address (default: `localhost:PORT`)

---

### 💻 Frontend

# Command

`cd frontend`  
`npx run dev`

> Starts the frontend at `http://localhost:3000` by default

---

## 🧩 Working with the Database

### 📄 Creating New Tables

# Command

`cd backend`  
`sqlx migrate add <migration_name>`

> Creates a new SQL migration file. Add your schema changes inside it.

---

### ⬆️ Running Migrations

# Command

`cd backend`  
`sqlx migrate run`

> Runs all migration files in order.

---