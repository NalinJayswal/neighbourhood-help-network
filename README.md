# 🏘️ Neighbourhood Help Network

**Author:** Nalin Jayswal
**Course:** IFQ636 — Assessment 1.2
**Assignment:** Full-Stack CRUD Application with DevOps Practices

A community web platform where neighbours post help requests (groceries, pet care, transport, etc.) and others volunteer to assist. Built on **Node.js + Express + MongoDB + React.js**.

---

## 🌐 Live Application

| Service | URL |
|---------|-----|
| Frontend | `http://<your-server-ip>:3000` |
| Backend API | `http://<your-server-ip>:5001` |
| Health Check | `http://<your-server-ip>:5001/api/health` |

> Replace `<your-server-ip>` with your actual VPS or deployment IP after deploying.

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (Nalin) | `nalin@network.com` | `admin123` |
| Regular User | `jane@network.com` | `password123` |

---

## 📋 Features

**User Panel**
- Register and log in with JWT authentication
- Browse all community help requests with category filters
- Post new help requests (title, description, category, location, date, urgency)
- Edit and delete your own requests
- Volunteer to help with someone else's request
- Manage your profile (name, email, address)

**Admin Panel** *(Nalin's account)*
- View all help requests across all users
- Delete any help request
- View all registered users
- Delete user accounts
- Dashboard stats (total, open, in-progress, completed)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (local) with Mongoose ODM |
| Authentication | JWT (jsonwebtoken) + bcrypt password hashing |
| HTTP Client | Axios |
| Testing | Mocha, Chai, chai-http |
| CI/CD | GitHub Actions |
| Process Manager | PM2 |

---

## 🚀 Local Setup Guide

### Prerequisites

- [Node.js 18+](https://nodejs.org) — download and install the LTS version
- [MongoDB Community](https://www.mongodb.com/try/download/community) — install with default settings, make sure "Install as a Service" is checked
- [VS Code](https://code.visualstudio.com)

---

### Step 1 — Get the Code

Download and extract the zip, then open the `neighbourhood-help-network` folder in VS Code.

---

### Step 2 — Configure the Backend

Open a terminal in VS Code (**Ctrl + `**) and run:

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` and make sure it contains:

```env
MONGO_URI=mongodb://localhost:27017/nalin-network
JWT_SECRET=Nalin_Jayswal_2026_Secret
PORT=5001
NODE_ENV=development
```

Press **Ctrl + S** to save.

---

### Step 3 — Install Dependencies & Seed the Database

```bash
npm install
npm run seed
```

You should see:
```
✅ MongoDB connected: localhost
✅ Admin account created: nalin@network.com / admin123
✅ Test user created: jane@network.com / password123
✅ Sample help requests created.
🎉 Seeding complete!
```

---

### Step 4 — Start the Backend

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5001
✅ MongoDB connected: localhost
🔗 API: http://localhost:5001/api/health
```

**Leave this terminal running.**

---

### Step 5 — Start the Frontend

Open a **second terminal** (click the **+** in the terminal panel):

```bash
cd frontend
npm install
npm start
```

Your browser opens at **http://localhost:3000** 🎉

Log in with: `nalin@network.com` / `admin123`

---

## 🗂️ Project Structure

```
neighbourhood-help-network/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD pipeline
├── backend/
│   ├── config/
│   │   └── db.js                     # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js         # Register, login, profile CRUD
│   │   ├── helpRequestController.js  # Full help request CRUD + volunteer
│   │   └── adminController.js        # Admin user management
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT protect + adminOnly middleware
│   ├── models/
│   │   ├── User.js                   # User schema (name, email, role)
│   │   └── HelpRequest.js            # Help request schema
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth
│   │   ├── helpRequestRoutes.js      # /api/helprequests
│   │   └── adminRoutes.js            # /api/admin
│   ├── test/
│   │   └── auth.test.js              # Mocha/Chai API tests
│   ├── .env.example                  # Environment variable template
│   ├── seed.js                       # Database seeder script
│   ├── package.json
│   └── server.js                     # Express app entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx            # Navigation bar
│       │   └── HelpRequestForm.jsx   # Create/Edit modal form
│       ├── context/
│       │   └── AuthContext.js        # Global auth state (localStorage)
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx         # Community board
│       │   ├── MyRequests.jsx        # User's own requests
│       │   ├── Profile.jsx           # Profile management
│       │   └── AdminPanel.jsx        # Admin dashboard
│       ├── axiosConfig.jsx           # Axios HTTP client setup
│       └── App.js                    # Routes + auth guards
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new account | No |
| POST | `/login` | Sign in, returns JWT | No |
| GET | `/profile` | Get own profile | ✅ JWT |
| PUT | `/profile` | Update own profile | ✅ JWT |

### Help Requests — `/api/helprequests`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | All community requests | ✅ JWT |
| POST | `/` | Create new help request | ✅ JWT |
| GET | `/mine` | My own requests | ✅ JWT |
| GET | `/:id` | Single request by ID | ✅ JWT |
| PUT | `/:id` | Update request (owner only) | ✅ JWT |
| DELETE | `/:id` | Delete request (owner only) | ✅ JWT |
| PATCH | `/:id/volunteer` | Volunteer for a request | ✅ JWT |

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/helprequests` | All requests (admin view) | ✅ Admin |
| DELETE | `/helprequests/:id` | Delete any request | ✅ Admin |
| GET | `/users` | All registered users | ✅ Admin |
| DELETE | `/users/:id` | Delete a user account | ✅ Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status confirmation |

---

## 🔒 Authentication & Authorisation

- Passwords hashed with **bcrypt** (10 salt rounds) — never stored in plain text
- **JWT tokens** with 30-day expiry — stateless, no server-side sessions
- **Role-based access control**: `user` (default) and `admin` roles
- All protected routes verify the `Authorization: Bearer <token>` header
- Admin routes additionally enforce `req.user.role === 'admin'`
- Auth state **persisted in localStorage** so users stay logged in after refresh
- **Owner enforcement**: update/delete operations verify `createdBy` matches `req.user._id`

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

The test suite covers:
- Health check endpoint
- User registration and duplicate email detection
- Login with correct and incorrect credentials
- Authenticated vs unauthenticated profile access
- Full help request CRUD cycle
- Category filtering
- 401/404 error handling

---

## ⚙️ CI/CD Pipeline

The GitHub Actions pipeline runs on every push and pull request to `main`.

### Pipeline Flow

```
Push to main
     │
     ├── 🧪 backend-test  → npm install → npm test (Mocha/Chai)
     │
     ├── 🏗️ frontend-build → npm install → npm run build
     │
     └── 🚀 deploy ────── (only if both pass)
                           SSH → git pull → npm install
                           → pm2 restart nhn-backend
                           → npm run build
                           → pm2 restart nhn-frontend
                           → pm2 save
```

### GitHub Secrets Required

Go to your GitHub repo → **Settings → Secrets and variables → Actions**

| Secret Name | Value |
|-------------|-------|
| `MONGO_URI` | `mongodb://localhost:27017/nalin-network` (or Atlas URI) |
| `JWT_SECRET` | Your JWT secret key |
| `REACT_APP_API_URL` | `http://<your-server-ip>:5001` |
| `SSH_HOST` | Your VPS IP address |
| `SSH_USER` | SSH username |
| `SSH_PRIVATE_KEY` | Your private SSH key |

---

## 📦 Deployment with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name nhn-backend

# Build and serve frontend
cd ../frontend
npm run build
pm2 serve build 3000 --name nhn-frontend --spa

# Save process list
pm2 save
pm2 startup
```

**Verify deployment:**

```bash
pm2 status
```

Expected output:
```
┌────┬────────────────┬─────────┬──────┬───────────┐
│ id │ name           │ mode    │ pid  │ status    │
├────┼────────────────┼─────────┼──────┼───────────┤
│ 0  │ nhn-backend    │ fork    │ 1234 │ online    │
│ 1  │ nhn-frontend   │ fork    │ 5678 │ online    │
└────┴────────────────┴─────────┴──────┴───────────┘
```

---

## 🌿 Git Branching Strategy

This project follows **GitHub Flow**:

| Branch | Purpose | Example |
|--------|---------|---------|
| `main` | Production-ready code only | — |
| `feature/<n>` | New features | `feature/help-request-crud` |
| `fix/<n>` | Bug fixes | `fix/volunteer-auth-check` |
| `chore/<n>` | Maintenance | `chore/update-ci-pipeline` |

All changes are developed on feature branches and merged to `main` via **Pull Requests**. The CI/CD pipeline validates every PR automatically.

---

## 💡 Design Decisions

**Role-based access control** — A single `role` field on the User model gates admin routes without needing a separate admin collection. The `adminOnly` middleware chains with `protect` keeping routes clean.

**Urgency + volunteer workflow** — Urgent requests sort to the top automatically. Once a volunteer is assigned, status changes to "In Progress" and further volunteering is blocked to prevent double-assignment.

**Owner enforcement** — The API checks `createdBy` against `req.user._id` before allowing edits or deletes, so users can only manage their own content.

**Persistent auth session** — JWT is stored in localStorage so users stay logged in across page refreshes without needing a server-side session store.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoServerError` | Make sure MongoDB service is running (check Windows Services) |
| Port 5001 already in use | Change `PORT=5002` in `.env` |
| Frontend blank page | Make sure backend is running first |
| `Module not found` | Run `npm install` inside the correct folder |
| Admin link not showing | Log in with `nalin@network.com` — only admin role sees it |
| `npm not recognized` | Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` in PowerShell |

---

## 📚 References

- [Express.js Documentation](https://expressjs.com/en/4x/api.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [React.js Documentation](https://react.dev/)
- [React Router v6 Docs](https://reactrouter.com/en/main)
- [JSON Web Tokens (JWT)](https://jwt.io/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Process Manager Docs](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Mocha Test Framework](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/api/)
- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [Axios HTTP Client](https://axios-http.com/docs/intro)

---
test push