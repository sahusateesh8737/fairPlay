# 🛡️ fairPlay — Academic Integrity Assessment Platform

**fairPlay** is a full-stack web application designed to conduct secure, proctored coding assessments in an academic environment. It enforces physical location rules via IP Whitelisting, prevents cheating with a hardened sandbox environment, and gives instructors real-time monitoring and grading tools — all managed through a centralized Admin Portal.

---

## ✨ Core Features

| Role | Capabilities |
|------|-------------|
| **Admin** | IP whitelist management, emergency override, user provisioning, section management, global cheat logs & analytics |
| **Teacher** | Create multi-question coding assessments, monitor live student activity, review submissions, assign grades |
| **Student** | Access assigned exams, write code in a sandboxed Monaco Editor with live preview, auto-submit |

**Anti-Cheat Engine**: Tab-switch detection, copy/paste/right-click blocking, real-time violation logging to the database.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, Monaco Editor |
| Backend | Node.js, Express 5, Socket.IO (real-time) |
| Database | PostgreSQL (via Docker), Prisma ORM 7 |
| Auth | JWT (JSON Web Tokens), bcrypt |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **Docker Desktop** — [docker.com](https://www.docker.com/get-started) (for PostgreSQL)
- **Git** — [git-scm.com](https://git-scm.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/fairPlay.git
cd fairPlay
```

---

### 2. Start the Database

The project uses a PostgreSQL database running inside Docker.

```bash
cd backend
docker compose up -d
```

This starts a PostgreSQL instance on **port 5434** with the following credentials:
- **DB**: `fairplay_db`
- **User**: `fairplay_user`
- **Password**: `fairplay_pass`

---

### 3. Configure the Backend

Create a `.env` file inside the `backend/` directory:

```bash
cp backend/.env.example backend/.env   # if example exists, otherwise create it
```

Or create `backend/.env` manually with the following content:

```env
DATABASE_URL="postgresql://fairplay_user:fairplay_pass@localhost:5434/fairplay_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=5001
CLIENT_URL="http://localhost:5173"
TEACHER_SECRET="your_teacher_onboarding_secret_here"
NODE_ENV="development"
```

> **Note:** `TEACHER_SECRET` is the code teachers must enter when registering — keep it private.

---

### 4. Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Push the Prisma schema to the database & generate the client
npx prisma db push

# (Optional) Seed the default Admin account
node -r dotenv/config seedAdmin.js
# Admin credentials: admin@fairplay.edu / admin123
```

> **Note:** Delete `seedAdmin.js` after running it in production environments.

---

### 5. Set Up the Frontend

```bash
cd fairPlay-frontend

# Install dependencies
npm install
```

The frontend is pre-configured to proxy API calls to `http://localhost:5001`. No additional `.env` setup is needed for local development.

---

### 6. Run the Application

Open **two separate terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5001
```

**Terminal 2 — Frontend:**
```bash
cd fairPlay-frontend
npm run dev
# App starts on http://localhost:5173
```

---

## 🧭 Application Routes

| URL | Description |
|-----|-------------|
| `http://localhost:5173/` | Landing Page |
| `http://localhost:5173/auth` | Student / Teacher Login & Signup |
| `http://localhost:5173/admin` | Admin Login Portal |
| `http://localhost:5173/admin/dashboard` | Admin Command Center (Protected) |
| `http://localhost:5173/teacher/dashboard` | Teacher Portal (Protected) |
| `http://localhost:5173/student/dashboard` | Student Portal (Protected) |

---

## 👤 Default Roles & Access

| Role | How to Create |
|------|--------------|
| **Admin** | Seeded via `seedAdmin.js` script |
| **Teacher** | Register at `/auth` with the `TEACHER_SECRET` code |
| **Student** | Self-register at `/auth`, select their section |

---

## 🗂️ Project Structure

```
fairPlay/
├── backend/                  # Node.js + Express API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── config/           # Prisma client, Socket.IO setup
│   │   ├── controllers/      # Route logic (auth, admin, assignments, etc.)
│   │   ├── middlewares/      # JWT auth & RBAC (protect, authorize)
│   │   ├── routes/           # Express routers
│   │   └── server.js         # HTTP + Socket.IO entry point
│   ├── docker-compose.yml
│   └── .env                  # Environment variables (not committed)
│
└── fairPlay-frontend/        # React + Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── admin/        # Admin Portal modules
    │   │   ├── teacher/      # Teacher Dashboard components
    │   │   └── auth/         # ProtectedRoute, etc.
    │   ├── context/          # AuthContext (JWT state)
    │   ├── pages/            # Top-level page components
    │   └── App.jsx           # Router config
    └── index.html
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository on GitHub.
2. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit them with clear messages:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch.

### Code Style
- Backend: CommonJS (`require`/`module.exports`), async/await everywhere
- Frontend: ES Modules, functional React components with hooks
- Please keep PRs focused and small — one feature or fix per PR

---

## 📄 License

This project is open source under the [MIT License](LICENSE).
