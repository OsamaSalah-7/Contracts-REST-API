##🧾 Overview
This is a RESTful API for managing contracts, jobs, and payments between clients and contractors. Built using Fastify, TypeScript, TypeORM, and PostgreSQL, the system supports authentication, job payments, contract tracking, and reporting.

##🧩 Technologies Used
- **Fastify: High-performance HTTP framework

- **TypeORM: ORM for PostgreSQL

- **TypeScript: Type-safe JavaScript

- **JWT Authentication: Secure user sessions

- **Swagger (OpenAPI): Auto-generated API documentation

- **Vitest/Jest: Unit/integration testing support (optional)

- **PostgreSQL: Relational database



## 📘 Main Features
🔐 Authentication
- **POST /signup: Register new user

- **POST /login: Authenticate and receive JWT token

- **GET /profile: Get logged-in user profile

**💼 Contracts
- **GET /contracts/:id: Get contract by ID (if owned)

- **GET /contracts: Filter contracts by status

🧾 Jobs
- **GET /jobs: All jobs for authenticated user

- **GET /jobs/unpaid: Unpaid jobs from active contracts

- **POST /jobs/:id/pay: Pay for a job (client only)

- **GET /jobs/best-profession: Top-earning profession in date range

- **GET /jobs/best-clients: Top clients by total paid in date range

💰 Balance
- **POST /balances/deposit/:userId: Deposit funds (up to 25% of unpaid jobs)

## 🏗️ Architecture

The project follows a clean architecture pattern with the following structure:

```
src/
├── app.ts                 # Main application entry point
├── dbConnection.ts        # Database configuration
├── controllers/          # Request handlers
├── services/            # Business logic layer
├── models/              # Data models and entities
├── routes/              # API route definitions
└── utils/               # Utility functions (auth, etc.)
```

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify (high-performance web framework)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Development**: ts-node-dev for hot reloading

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mkittani/Contracts-REST-API.git
   cd Contracts-REST-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=contracts_db
   TYPEORM_SYNCHRONIZE=true
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup**
   - Create a PostgreSQL database named `contracts_db`
   - The application will automatically create tables on startup

5. **Start the application**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 🔐 Authentication Endpoints

#### Register User
```http
POST /profiles/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "profession": "Software Developer",
  "balance": 1000,
  "type": "Client",
  "username": "johndoe",
  "password": "password123"
}
```

#### Login User
```http
POST /profiles/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile
```http
GET /profiles/profile
Authorization: Bearer <token>
```

### 📄 Contract Endpoints

#### Create Contract
```http
POST /contracts/contracts
Authorization: Bearer <token>
Content-Type: application/json

{
  "contractorId": 2,
  "terms": "Develop a web application"
}
```

#### Get Contract by ID
```http
GET /contracts/contracts/:id
Authorization: Bearer <token>
```

#### Get Contracts by Status
```http
GET /contracts/contracts?status=new
Authorization: Bearer <token>
```

**Status Options:** `new`, `in_progress`, `terminated`

### 💼 Job Endpoints

#### Create Job
```http
POST /jobs/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Create user authentication system",
  "price": 500,
  "contractId": 1
}
```

#### Get All Jobs
```http
GET /jobs/jobs
Authorization: Bearer <token>
```

#### Get Unpaid Jobs
```http
GET /jobs/jobs/unpaid
Authorization: Bearer <token>
```

#### Pay for Job
```http
POST /jobs/jobs/:id/pay
Authorization: Bearer <token>
```

#### Get Best Profession (Analytics)
```http
GET /jobs/jobs/best-profession?start=2024-01-01&end=2024-12-31
Authorization: Bearer <token>
```

#### Get Best Clients (Analytics)
```http
GET /jobs/jobs/best-clients?start=2024-01-01&end=2024-12-31&limit=5
Authorization: Bearer <token>
```

### 💰 Balance Endpoints

#### Deposit Balance
```http
POST /balance/balances/deposit/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000
}
```

**Note:** Deposits cannot exceed 25% of the total unpaid jobs at the time of deposit.


## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Proper error handling with meaningful messages
- **Authorization**: Route-level authorization checks



## 📊 Business Rules

1. **User Types**: Users can be either Clients or Contractors
2. **Contract Creation**: Only Clients can create contracts
3. **Job Creation**: Jobs are created within contracts
4. **Payment Processing**: 
   - Clients can only pay for jobs if they have sufficient balance
   - Payment transfers balance from client to contractor
   - Job status updates to paid
5. **Balance Deposits**: Cannot exceed 25% of total unpaid jobs
6. **Contract Status**: Only "in_progress" contracts are considered active

## 🚀 Development

### Available Scripts

- `npm start`: Start the development server with hot reload



