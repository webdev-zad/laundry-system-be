# Laundry Management System API

Backend API for the Laundry Management System built with Node.js, Express, Prisma, and MongoDB.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     NODE_ENV=development
     PORT=5000
     DATABASE_URL=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES_IN=30d
     ```

3. Generate Prisma client:
   ```
   npx prisma generate
   ```

4. Seed the database:
   ```
   npm run seed
   ```

5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Register a new user (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a customer
- `GET /api/customers/:id` - Get a customer by ID
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer (admin only)

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a task
- `GET /api/tasks/:id` - Get a task by ID
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/status` - Update task status

## Default Users

After running the seed script, you can log in with these credentials:

- Admin User:
  - Email: admin@laundry.com
  - Password: admin123

- Staff User:
  - Email: staff@laundry.com
  - Password: staff123 