# FairPlay: Secure Assessment & Anti-Cheat Platform

FairPlay is a comprehensive web-based platform designed for conducting secure, proctored coding assessments. It combines a powerful multi-file React sandbox with an advanced anti-cheat engine to ensure academic integrity while providing a seamless development experience for students.

## 🚀 Key Features

- **🛡️ Anti-Cheat Engine**: Real-time monitoring of tab switching, right-clicks, copy-paste actions, and drag-and-drop events.
- **🖥️ Live Proctoring**: Teachers can monitor student progress and receive instant alerts for any recorded violations.
- **⚛️ Multi-File React Sandbox**: A custom-built IDE using Monaco Editor that supports multi-component React development with live previews.
- **📊 Submission & Review**: Integrated system for students to submit assessments and for teachers to review code with violation logs.
- **🔑 Role-Based Access**: Specialized dashboards for Admins, Teachers, and Students.

## 🏗️ Architecture & Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io for live proctoring alerts
- **Security**: JWT authentication, Bcrypt, Helmet, and Zod validation

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS & Framer Motion
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Icons**: Lucide React

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file based on `.env.example` (if available) or ensure `DATABASE_URL` is set.
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `fairPlay-frontend` directory:
   ```bash
   cd fairPlay-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```text
fairPlay/
├── backend/                # Express API & Prisma Schema
│   ├── prisma/             # Database models and migrations
│   ├── src/                # Backend logic (routes, controllers, middlewares)
│   └── server.js           # API entry point
└── fairPlay-frontend/      # React Vite Application
    ├── src/
    │   ├── components/     # UI Components (Admin, Teacher, Student)
    │   ├── pages/          # Application views
    │   └── App.jsx         # Main routing and provider setup
    └── index.html          # Frontend entry point
```

## 📜 License
This project is licensed under the ISC License.
