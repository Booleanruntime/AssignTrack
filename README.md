# AssignTrack

## Project Overview

AssignTrack is a web-based assignment management system developed using React, Node.js, Express, and MongoDB.

The system helps students organise and track assignments across multiple subjects while allowing administrators to manage subjects within the platform.

---

## Features

### Student Features

* Register and login
* Create assignments
* View assignments
* Edit assignments
* Delete assignments
* Filter assignments by subject and status
* Sort assignments by due date
* Track assignment status

### Admin Features

* Create subjects
* View subjects
* Edit subjects
* Delete subjects

---

## Technology Stack

* React
* Node.js
* Express.js
* MongoDB Atlas
* Material UI
* GitHub Actions
* AWS EC2
* Nginx
* PM2

---

## Setup Instructions

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Run Tests

```bash
cd backend
npm test
```

---

## GitHub Repository

https://github.com/ola-abdelrazzak/AssignTrack

---

## AWS EC2 Instance

Instance Name: AssignTrack

Instance ID: i-08c78e1a2b7e89fd4

If the EC2 instance is stopped:

1. Open the AWS EC2 Console.
2. Locate the instance above.
3. Start the instance.
4. Copy the current Public IPv4 address.
5. Access the application using the current public IP address.

---

## Public URL

Current URL:

http://3.27.70.75

**Note:** The EC2 public IP may change if the instance is stopped and restarted in the AWS teaching environment.

After restarting the instance, obtain the new Public IPv4 address from the AWS EC2 console and access the application using:

```text
http://<new-public-ip>
```

No code changes are required because the frontend uses relative API paths (`/api`) and Nginx proxies API requests internally to the backend running on port 5001.

---

## Test Credentials

### Admin

Email: [admin@gmail.com]

Password: 123

### Student

Email: [john.smith@gmail.com]

Password: 123

---

## Author

Ola Abdelrazzak
