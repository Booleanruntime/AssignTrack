# AssignTrack

## Project Overview

AssignTrack is a web-based assignment management system developed using React, Node.js, Express, and MongoDB.

The system helps students organise and track assignments across multiple subjects while allowing administrators to manage subjects within the platform.

The project was developed as part of IFQ636 Software Lifecycle Management and demonstrates software engineering practices including requirements analysis, UI/UX design, SysML modelling, version control, CI/CD automation, cloud deployment, and project management.

---

## Features

### Student Features

* Register a new account
* Login and logout
* Create assignments
* View assignments
* Edit assignments
* Delete assignments
* Filter assignments by status and subject
* Sort assignments by due date
* Track assignment status

### Admin Features

* Create subjects
* View subjects
* Edit subjects
* Delete subjects

---

## Technology Stack

### Frontend

* React
* Material UI
* Axios

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* JWT Authentication

### DevOps and Tools

* GitHub
* GitHub Actions
* AWS EC2 Ubuntu
* GitHub Self-Hosted Runner
* PM2
* Nginx
* Jira
* Figma
* Thunder Client

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## Running Automated Tests

```bash
cd backend
npm test
```

---

## CI/CD Pipeline

GitHub Actions is used to automate continuous integration activities.

Pipeline activities include:

* Install backend dependencies
* Run automated backend tests
* Install frontend dependencies
* Build React frontend

A GitHub self-hosted runner is configured on AWS EC2 to support deployment activities.

---

## Deployment

The application is deployed using:

* AWS EC2 Ubuntu Server
* MongoDB Atlas
* GitHub Actions
* GitHub Self-Hosted Runner
* PM2 Process Manager
* Nginx Reverse Proxy

PM2 is configured to manage the backend application process on the EC2 instance.

---

## GitHub Repository

https://github.com/ola-abdelrazzak/AssignTrack

---

## Jira Board

https://assigntrack2026.atlassian.net/jira/software/projects/SCRUM/boards/1

---

## Figma Design

https://www.figma.com/design/ObP5Bt6xujzByRIwDiZ4HJ/AssignTrack-Wireframes?node-id=0-1&p=f

---

## Public URL

http://3.27.70.75

**Note:** The EC2 public IP may change if the instance is stopped and restarted in the AWS teaching environment. If this occurs, start the EC2 instance again, obtain the new Public IPv4 address from the AWS EC2 console, and access the application using:

```text
http://<new-public-ip>
```

No code changes are required because the frontend uses relative API paths (`/api`) and Nginx proxies API requests internally to the backend running on port 5001.

---

## Test Credentials

### Admin Account

Email: [admin@gmail.com]

Password: 123

### Student Account

Email: [john.smith@gmail.com]

Password: 123

---

## Project Artefacts

This project includes:

* Requirements Analysis
* SysML Diagrams
* Jira Project Board
* User Stories
* Figma Prototype
* GitHub Repository
* CI/CD Pipeline
* AWS Cloud Deployment

---

## Author

Ola Abdelrazzak