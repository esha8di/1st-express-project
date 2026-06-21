# Issue Tracker API

A RESTful Issue Tracker API built with Node.js, Express, TypeScript, and PostgreSQL. The application allows contributors to create and manage issues while maintainers can monitor and update issue statuses.

## Live URL

**API Base URL:** `https://first-express-project.vercel.app`

## Features

* User authentication using JWT
* Role-based authorization (Contributor, Maintainer)
* Create, retrieve, update, and delete issues
* Secure password handling
* PostgreSQL database integration
* Centralized error handling
* TypeScript support

## Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL

### Authentication

* JSON Web Token (JWT)

# Project Setup

## Prerequisites

* Node.js (v18 or higher)
* PostgreSQL
* npm 

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/issue-tracker-api.git
cd issue-tracker-api
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the root directory:

```env
PORT = 5000
CONNECTION_STRING = postgresql://neondb_owner:npg_ATd0tqwFrIi1@ep-withered-math-aqc4zazs-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SECRET = sdklfjfjierjfdsm34
```

### Run database migrations

Execute your SQL schema or migration files.

### Start development server

```bash
npm run dev
```

### Build project

```bash
npm run build
```

### Start production server

```bash
npm start
```

---

# API Endpoints

## Authentication

### Register User

```http
POST /api/auth/register
```

### Login User

```http
POST /api/auth/login
```

---

## Issues

### Create Issue

```http
POST /api/v1/issues
```

**Authorization Required**

### Get All Issues

```http
GET /api/issues
```

#### Query Parameters

| Parameter | Description          |
| --------- | -------------------- |
| status    | Filter by status     |
| type      | Filter by issue type |
| sort      | Sort results         |

Example:

```http
GET /api/issues?status=open&type=bug&sort=desc
```

### Get Single Issue

```http
GET /api/issues/:id
```

### Update Issue

```http
PUT /api/issues/:id
```

**Authorization Required**

### Delete Issue

```http
DELETE /api/issues/:id
```
### Update issue status

```http
DELETE /api/issues/:id/status
```

**Authorization Required**

---

# Database Schema Summary

## Users Table

| Column     | Type                              |
| ---------- | --------------------------------- |
| id         | SERIAL PRIMARY KEY                |
| name       | VARCHAR                           |
| email      | VARCHAR UNIQUE                    |
| password   | VARCHAR                           |
| role       | ENUM('contributor', 'maintainer') |
| created_at | TIMESTAMP                         |

## Issues Table

| Column      | Type               |
| ----------- | ------------------ |
| id          | SERIAL PRIMARY KEY |
| title       | VARCHAR            |
| description | TEXT               |
| type        | VARCHAR            |
| status      | VARCHAR            |
| reporter_id | INTEGER (FK)       |
| created_at  | TIMESTAMP          |
| updated_at  | TIMESTAMP          |

### Relationship

* One User can create multiple Issues.
* Each Issue belongs to one User through `reporter_id`.

---

# Authorization

Protected routes require a JWT token in the request header:

```http
Authorization: <token>
```

Example:

```http
Authorization: eyJhbGciOiJIUzI1NiIs...
```


# Author

Shumin Nahar Esha

GitHub: https://github.com/your-username
