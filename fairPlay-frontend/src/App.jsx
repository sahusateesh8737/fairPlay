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
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Routes>
                  <Route path="/" element={<AdminAuth />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/teacher/*" 
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <Routes>
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="live-monitor/:sectionId" element={<LiveMonitor />} />
                  <Route path="review/:submissionId" element={<SubmissionReviewer />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="exam/:assignmentId" element={<StudentExamSandbox />} />
                </Routes>
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
