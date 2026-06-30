# AssignTrack

A full-stack assignment management platform developed using the **MERN** stack as part of **IFQ636 – Software Lifecycle Management** at Queensland University of Technology (QUT).

AssignTrack streamlines the complete assignment lifecycle by enabling administrators to configure the system, teachers to create and grade assignments, and students to manage submissions and receive feedback through a single web application.

---

# Project Overview

Educational institutions often rely on multiple disconnected systems to manage subjects, assignments, enrolments and grading. This can create duplicated work, inconsistent processes and poor visibility for both staff and students.

AssignTrack addresses this problem by providing a centralised assignment management platform built using the MERN technology stack. The system streamlines the complete assignment lifecycle by enabling administrators to configure the system, teachers to create and grade assignments, and students to manage submissions and receive feedback through a single platform. The system also supports automatic assignment distribution, rubric-based grading, notifications, activity logging and secure role-based access control.

---

# Key Features

## Administrator

* Create teachers
* Create and manage subjects
* Allocate teachers to subjects
* Enrol students into subjects

## Teacher

* Create assignments using reusable templates
* Set assignment details and due dates
* Automatically distribute assignments to enrolled students
* Review student submissions
* Grade assignments using rubrics
* Provide structured feedback

## Student

* Register and log in securely
* View assigned work
* Track assignment progress
* Search, sort and filter assignments
* Submit assignments
* View grades and feedback
* Archive completed assignments

## System

* JWT authentication
* Role-based access control
* Automatic assignment distribution
* Notifications
* Activity logging
* Assignment lifecycle management

---

# Technology Stack

| Category       | Technologies                                                             |
| -------------- | ------------------------------------------------------------------------ |
| **Frontend**   | React, React Router, Axios, Tailwind CSS                                 |
| **Backend**    | Node.js, Express.js, MongoDB Atlas, Mongoose, JWT Authentication, bcrypt |
| **Testing**    | Mocha, Chai, Sinon, Postman                                              |
| **Deployment** | AWS EC2, Nginx, PM2, GitHub Actions                                      |

---

# System Architecture

```text
                Users
                  │
                  ▼
          React Frontend
                  │
          Axios REST API
                  │
                  ▼
          Express Backend
                  │
      Business Logic & Services
                  │
                  ▼
          MongoDB Atlas
```

---

# Git Branching Strategy

| Branch        | Purpose                                   |
| ------------- | ----------------------------------------- |
| **feature/*** | Individual feature development            |
| **develop**   | Integration branch for completed features |
| **main**      | Stable production-ready branch            |

---

# Repository Structure

```text
AssignTrack
│
├── .github/
│
├── backend/
│   ├── builders/
│   ├── commands/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── events/
│   ├── factories/
│   ├── middleware/
│   ├── models/
│   ├── proxies/
│   ├── routes/
│   ├── services/
│   ├── states/
│   ├── strategies/
│   ├── test/
│   ├── utils/
│   ├── server.js
│   └── seed.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── constants/
│       ├── context/
│       ├── pages/
│       ├── utils/
│       ├── App.js
│       └── index.js
│
├── CHANGELOG.md
└── README.md
```

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Booleanruntime/AssignTrack.git

cd AssignTrack
```

## 2. Install Backend Dependencies

```bash
cd backend

npm install
```

## 3. Install Frontend Dependencies

```bash
cd ../frontend

npm install
```

---

# Environment Variables

Create a `.env` file inside the **backend** directory.

```env
MONGO_URI=
JWT_SECRET=
PORT=
```

---

# Running the Application

## Start the Backend

```bash
cd backend

npm run dev
```

## Start the Frontend

```bash
cd frontend

npm start
```

---

# Testing

## Backend Unit Tests

```bash
cd backend

npm test
```

---

# Continuous Integration (CI/CD)

GitHub Actions automates the build and testing process. Each push to the repository triggers the CI workflow to help ensure code quality before deployment.

---

# Public URL

```text
http://13.211.223.217/login
```

---

# Default Test Accounts

| Role              | Email                                         | Password     |
| ----------------- | --------------------------------------------- | ------------ |
| **Administrator** | [admin@gmail.com](mailto:admin@gmail.com)     | 123          |
| **Student**       | [student@seed.test](mailto:student@seed.test) | Password123! |
| **Teacher**       | [teacher@seed.test](mailto:teacher@seed.test) | Password123! |

---

# Repository

GitHub Repository:

https://github.com/Booleanruntime/AssignTrack

---

# Contributors

* Avi Chand
* Nathan King
* Ola Abdelrazzak
