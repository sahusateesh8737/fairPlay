-- ==========================================
-- FairPlay Database Schema (PostgreSQL/MySQL)
-- ==========================================

-- 1. SECTIONS
-- Represents a class or cohort of students.
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
-- Stores Admins, Teachers, and Students.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    section_id INTEGER REFERENCES sections(id) ON DELETE SET NULL, -- Only needed for students
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ALLOWED IPS
-- Managed by Admins to restrict access to the exam portal.
CREATE TABLE allowed_ips (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    description VARCHAR(255),
    added_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ASSIGNMENTS
-- Created by Teachers and assigned to a specific Section.
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    target_section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. QUESTIONS (Variations)
-- Multiple variations of a question can belong to an Assignment for randomization.
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    boilerplate TEXT, -- Stores default multi-file state or single string code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. SUBMISSIONS
-- A wrapper for what a student turns in for a specific assignment.
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    final_score DECIMAL(5,2) -- For optional auto-grading or teacher grading later
);

-- 7. SUBMISSION FILES
-- Because we support a multi-file sandbox, a single submission has multiple files.
CREATE TABLE submission_files (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CHEAT LOGS
-- Stores every violation (Right-Click, Tab Switch, etc) detected during an exam.
CREATE TABLE cheat_logs (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    event_type VARCHAR(255) NOT NULL, -- e.g., 'Tab Switched', 'Copy', 'Paste'
    event_timestamp TIMESTAMP NOT NULL, -- The time it happened on the client
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
