import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const PrepHomePage = lazy(() => import('./pages/PrepHomePage'));
const SyllabusPage = lazy(() => import('./pages/SyllabusPage'));
const Auth = lazy(() => import('./pages/Auth'));
const AdminAuth = lazy(() => import('./pages/AdminAuth'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentExamSandbox = lazy(() => import('./pages/StudentExamSandbox'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentResults = lazy(() => import('./pages/StudentResults'));
const SubmissionDetailView = lazy(() => import('./pages/SubmissionDetailView'));
const LiveMonitor = lazy(() => import('./components/teacher/LiveMonitor'));
const SubmissionReviewer = lazy(() => import('./components/teacher/SubmissionReviewer'));
const PracticeHub = lazy(() => import('./pages/PracticeHub'));
const StudentPracticeSandbox = lazy(() => import('./pages/StudentPracticeSandbox'));
const SQLDay1 = lazy(() => import('./pages/SQLDay1'));
const SQLDay2 = lazy(() => import('./pages/SQLDay2'));
const SQLDay3 = lazy(() => import('./pages/SQLDay3'));
const SQLDay4 = lazy(() => import('./pages/SQLDay4'));
const SQLDay5 = lazy(() => import('./pages/SQLDay5'));
const SQLDay6 = lazy(() => import('./pages/SQLDay6'));
const SQLDay7 = lazy(() => import('./pages/SQLDay7'));
const SQLDay8 = lazy(() => import('./pages/SQLDay8'));
const SQLHub = lazy(() => import('./pages/SQLHub'));
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
        <main className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden selection:bg-primary/30 selection:text-white">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(124,109,250,0.5)]"></div>
            </div>
          }>
            <Routes>
            <Route 
              path="/" 
              element={import.meta.env.VITE_EXAM_MODE === 'true' ? <PrepHomePage /> : <Home />} 
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/syllabus" element={<SyllabusPage />} />
            <Route path="/practice" element={<PracticeHub />} />
            <Route path="/practice/:id" element={<StudentPracticeSandbox />} />
            <Route path="/placement-prep/sql" element={<SQLHub />} />
            <Route path="/placement-prep/sql/day-1" element={<SQLDay1 />} />
            <Route path="/placement-prep/sql/day-2" element={<SQLDay2 />} />
            <Route path="/placement-prep/sql/day-3" element={<SQLDay3 />} />
            <Route path="/placement-prep/sql/day-4" element={<SQLDay4 />} />
            <Route path="/placement-prep/sql/day-5" element={<SQLDay5 />} />
            <Route path="/placement-prep/sql/day-6" element={<SQLDay6 />} />
            <Route path="/placement-prep/sql/day-7" element={<SQLDay7 />} />
            <Route path="/placement-prep/sql/day-8" element={<SQLDay8 />} />
            
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
          </Suspense>
      </main>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
