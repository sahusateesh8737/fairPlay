import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentExamSandbox from './pages/StudentExamSandbox';
import LiveMonitor from './components/teacher/LiveMonitor';
import SubmissionReviewer from './components/teacher/SubmissionReviewer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route path="/admin" element={<AdminAuth />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/live-monitor/:sectionId" 
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <LiveMonitor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/review/:submissionId" 
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <SubmissionReviewer />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/exam/:assignmentId" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentExamSandbox />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </Router>
    </AuthProvider>
  );
}

export default App;
