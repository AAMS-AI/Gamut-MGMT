import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Context Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import TeamLayout from './layouts/TeamLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import OrganizationPage from './pages/OrganizationPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import FirestoreDebugPage from './pages/FirestoreDebugPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import PendingPage from './pages/PendingPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/debug" element={<FirestoreDebugPage />} />

          {/* 1. Personal Context (Dashboard) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Navigate to="/dashboard" replace />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 2. Admin Context (Organization) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <TeamsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organization"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <AdminLayout>
                  <OrganizationPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 3. Team Context (Workspace) */}
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <TeamLayout>
                  <TeamDetailsPage />
                </TeamLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
