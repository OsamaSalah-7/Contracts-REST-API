📄 Project Documentation: Contract Management REST API
🧾 Overview
This is a RESTful API for managing contracts, jobs, and payments between clients and contractors. Built using Fastify, TypeScript, TypeORM, and PostgreSQL, the system supports authentication, job payments, contract tracking, and reporting.

🧩 Technologies Used
Fastify: High-performance HTTP framework

TypeORM: ORM for PostgreSQL

TypeScript: Type-safe JavaScript

JWT Authentication: Secure user sessions

Swagger (OpenAPI): Auto-generated API documentation

Vitest/Jest: Unit/integration testing support (optional)

PostgreSQL: Relational database

📘 Main Features
🔐 Authentication
POST /signup: Register new user

POST /login: Authenticate and receive JWT token

GET /profile: Get logged-in user profile

💼 Contracts
GET /contracts/:id: Get contract by ID (if owned)

GET /contracts: Filter contracts by status

🧾 Jobs
GET /jobs: All jobs for authenticated user

GET /jobs/unpaid: Unpaid jobs from active contracts

POST /jobs/:id/pay: Pay for a job (client only)

GET /jobs/best-profession: Top-earning profession in date range

GET /jobs/best-clients: Top clients by total paid in date range

💰 Balance
POST /balances/deposit/:userId: Deposit funds (up to 25% of unpaid jobs)

🧩 Data Models
🧍 Profile
ts
Copy
Edit
firstName: string;
lastName: string;
profession: string;
balance: number;
type: "Client" | "Contractor";
username: string;
password: string;
📄 Contract
ts
Copy
Edit
terms: string;
status: "new" | "in_progress" | "terminated";
client: Profile;
contractor: Profile;
🧾 Job
ts
Copy
Edit
description: string;
price: number;
paid: boolean;
paymentDate: Date;
contract: Contract;
🧪 Testing & Utilities
Structured for unit and integration testing with test-ready routes and services

Database seeding supported via CLI tools

Optional: Async client CLI (ts-node)

📌 CV Summary Entry
Contract Management REST API
Tech Stack: TypeScript, Fastify, TypeORM, PostgreSQL, JWT

Developed a RESTful API for managing contracts and payments between clients and contractors. Implemented user authentication, contract/job tracking, payment processing, and financial analytics. Designed scalable models with TypeORM and secured endpoints using JWT. Integrated Swagger for API documentation and structured the project for future testing and CLI tooling.
