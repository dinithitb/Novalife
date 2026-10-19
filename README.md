#  Novalife — Blood Bank Management System

A full-stack web application for managing blood bank operations across multiple branches.

## Quick Start (3 steps)

### Step 1 — Set up the database
```bash
# Install MySQL, then create the database:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS novalife_db;"
```

### Step 2 — Start the backend
```bash
cd backend
npm install
# Edit .env and set DB_PASSWORD to your MySQL password
npm run seed    # loads starter data
npm run dev     # starts the API on http://localhost:3000
```

### Step 3 — Start the frontend
```bash
cd frontend
npm install
npm run dev     # opens the app at http://localhost:5173
```

### Default Login
- **Email:** admin@novalife.local
- **Password:** Admin@123

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | MySQL 8 + Sequelize ORM |
| Auth | JWT (JSON Web Tokens) |

## Folder Structure
```
novalife/
├── backend/          ← Express API server
│   ├── src/
│   │   ├── controllers/   ← business logic
│   │   ├── models/        ← database table definitions
│   │   ├── routes/        ← URL path definitions
│   │   ├── middlewares/   ← auth, error handling
│   │   ├── services/      ← email service
│   │   ├── utils/         ← helper functions
│   │   ├── seed/          ← starter data
│   │   ├── config/        ← database connection
│   │   ├── app.js         ← Express app setup
│   │   └── server.js      ← server entry point
│   ├── .env               ← your private settings
│   └── package.json
└── frontend/         ← React application
    ├── src/
    │   ├── pages/         ← one file per page
    │   ├── components/    ← reusable UI pieces
    │   ├── context/       ← auth & sidebar state
    │   ├── hooks/api/     ← all API calls
    │   ├── lib/           ← utilities
    │   └── types/         ← TypeScript type definitions
    ├── .env               ← VITE_API_URL setting
    └── package.json
```
