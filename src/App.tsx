import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'sonner';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ExploreProjectsPage } from './pages/public/ExploreProjectsPage';
import { ProjectDetailsPage } from './pages/public/ProjectDetailsPage';
import { ExploreStudentsPage } from './pages/public/ExploreStudentsPage';
import { ExploreTeamsPage } from './pages/public/ExploreTeamsPage';
import { AboutPage } from './pages/public/AboutPage';

// Auth Pages
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';
import { StudentRegisterPage } from './pages/auth/StudentRegisterPage';
import { CompanyRegisterPage } from './pages/auth/CompanyRegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/auth/ForgotPasswordPage';

// Student Module
import { StudentLayout } from './components/layout/StudentLayout';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { EditStudentProfilePage } from './pages/student/EditStudentProfilePage';
import { TeamManagementPage } from './pages/student/TeamManagementPage';
import { FindTeammatesPage } from './pages/student/FindTeammatesPage';
import { StudentProjectsPage } from './pages/student/StudentProjectsPage';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage';
import { StudentInvitationsPage } from './pages/student/StudentInvitationsPage';

// Company Module
import { CompanyLayout } from './components/layout/CompanyLayout';
import { CompanyDashboardPage } from './pages/company/CompanyDashboardPage';
import { CompanyProfilePage } from './pages/company/CompanyProfilePage';
import { PostProjectPage } from './pages/company/PostProjectPage';
import { ManageProjectsPage } from './pages/company/ManageProjectsPage';
import { CompanyApplicationsPage } from './pages/company/CompanyApplicationsPage';

// Workspace & Chat
import { ProjectWorkspacePage } from './pages/workspace/ProjectWorkspacePage';
import { MessagesPage } from './pages/chat/MessagesPage';

// Admin Module
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Protected Route Guard
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, token, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'company') return <Navigate to="/company/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Guest Route Guard (Prevents authenticated users from accessing Login / Register)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, token, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (token && user) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'company') return <Navigate to="/company/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ExploreProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="/students" element={<ExploreStudentsPage />} />
        <Route path="/teams" element={<ExploreTeamsPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Auth Routes (Guest Only - Redirect authenticated users) */}
        <Route path="/register" element={<GuestRoute><RoleSelectionPage /></GuestRoute>} />
        <Route path="/register/student" element={<GuestRoute><StudentRegisterPage /></GuestRoute>} />
        <Route path="/register/company" element={<GuestRoute><CompanyRegisterPage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        {/* Student Portal Protected Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="profile/edit" element={<EditStudentProfilePage />} />
          <Route path="teams" element={<TeamManagementPage />} />
          <Route path="find-teammates" element={<FindTeammatesPage />} />
          <Route path="projects" element={<StudentProjectsPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="invitations" element={<StudentInvitationsPage />} />
        </Route>

        {/* Company Portal Protected Routes */}
        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRoles={['company', 'admin']}>
              <CompanyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboardPage />} />
          <Route path="profile" element={<CompanyProfilePage />} />
          <Route path="projects/new" element={<PostProjectPage />} />
          <Route path="projects" element={<ManageProjectsPage />} />
          <Route path="students" element={<ExploreStudentsPage />} />
          <Route path="teams" element={<ExploreTeamsPage />} />
          <Route path="applications" element={<CompanyApplicationsPage />} />
        </Route>

        {/* Workspace & Messaging Protected Routes */}
        <Route
          path="/workspace/:projectId"
          element={
            <ProtectedRoute>
              <ProjectWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Portal Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
