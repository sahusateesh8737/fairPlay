import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrepHomePage from './pages/PrepHomePage';
import Auth from './pages/Auth';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentExamSandbox from './pages/StudentExamSandbox';
import StudentProfile from './pages/StudentProfile';
import StudentResults from './pages/StudentResults';
import SubmissionDetailView from './pages/SubmissionDetailView';
import LiveMonitor from './components/teacher/LiveMonitor';
import SubmissionReviewer from './components/teacher/SubmissionReviewer';
import PracticeHub from './pages/PracticeHub';
import StudentPracticeSandbox from './pages/StudentPracticeSandbox';
import SQLDay1 from './pages/SQLDay1';
import SQLDay2 from './pages/SQLDay2';
import SQLDay3 from './pages/SQLDay3';
import SQLDay4 from './pages/SQLDay4';
import SQLDay5 from './pages/SQLDay5';
import SQLDay6 from './pages/SQLDay6';
import SQLHub from './pages/SQLHub';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
        <main className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden selection:bg-primary/30 selection:text-white">
          <Routes>
          <Route 
            path="/" 
            element={import.meta.env.VITE_EXAM_MODE === 'true' ? <PrepHomePage /> : <Home />} 
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/practice" element={<PracticeHub />} />
          <Route path="/practice/:id" element={<StudentPracticeSandbox />} />
          <Route path="/placement-prep/sql" element={<SQLHub />} />
          <Route path="/placement-prep/sql/day-1" element={<SQLDay1 />} />
          <Route path="/placement-prep/sql/day-2" element={<SQLDay2 />} />
          <Route path="/placement-prep/sql/day-3" element={<SQLDay3 />} />
          <Route path="/placement-prep/sql/day-4" element={<SQLDay4 />} />
          <Route path="/placement-prep/sql/day-5" element={<SQLDay5 />} />
          <Route path="/placement-prep/sql/day-6" element={<SQLDay6 />} />
          
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
            path="/student/profile" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentProfile />
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
          <Route 
            path="/student/results" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentResults />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/results/:submissionId" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <SubmissionDetailView />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
