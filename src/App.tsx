import React, { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import JobsList from '@/pages/jobs/JobsList';
import { OrgManagement } from '@/pages/org/OrgManagement';

// New Components
import { OperationsBoard } from '@/pages/jobs/OperationsBoard';
import { StaffDirectory } from '@/pages/team/StaffDirectory';
import { OfficeDepartments } from '@/pages/org/OfficeDepartments';
import { GlobalUserTable } from '@/pages/team/GlobalUserTable';
import { BranchDashboard } from '@/pages/dashboard/BranchDashboard';
import { DepartmentDashboard } from '@/pages/dashboard/DepartmentDashboard';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard';
import { PlaceholderPage } from '@/pages/PlaceholderPage';


const ProtectedRoute: React.FC<{ children: ReactNode; useMainLayout?: boolean; requireOnboarding?: boolean }> = ({
  children,
  useMainLayout = true,
  requireOnboarding = true
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-accent-electric font-bold tracking-tighter text-2xl animate-pulse">GAMUT</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Special case: If we are in the onboarding flow, we shouldn't redirect loop
  // But this component logic handles "If I am here, am I allowed?"

  // If the route REQUIRES onboarding (default), and the user hasn't done it
  if (requireOnboarding && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // If the user HAS done onboarding but tries to go to /onboarding (handled by explicit route usually, but good check)
  // We can handle that in the route definition or a separate "UnprotectedRoute" equivalent, 
  // but for now let's just focus on protecting the main app.

  return useMainLayout ? <MainLayout>{children}</MainLayout> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* User Onboarding */}
            <Route path="/onboarding" element={
              <ProtectedRoute useMainLayout={false} requireOnboarding={false}>
                <OnboardingWizard />
              </ProtectedRoute>
            } />

            {/* --- Global & Enterprise Context --- */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/kanban" element={<ProtectedRoute><OperationsBoard /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><JobsList /></ProtectedRoute>} />
            <Route path="/dispatch" element={<ProtectedRoute><PlaceholderPage title="Dispatch Command" /></ProtectedRoute>} />

            <Route path="/offices" element={<ProtectedRoute><PlaceholderPage title="Offices Management" /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><PlaceholderPage title="Departments Management" /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><GlobalUserTable /></ProtectedRoute>} />

            <Route path="/reports/ops" element={<ProtectedRoute><PlaceholderPage title="Operational Reports" /></ProtectedRoute>} />
            <Route path="/reports/financial" element={<ProtectedRoute><PlaceholderPage title="Financial Reports" /></ProtectedRoute>} />

            <Route path="/settings/org" element={<ProtectedRoute><OrgManagement /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><PlaceholderPage title="Billing & Plans" /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><PlaceholderPage title="Integrations" /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/uploads" element={<ProtectedRoute><PlaceholderPage title="Quick Uploads" /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><PlaceholderPage title="Help & Support" /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><PlaceholderPage title="My Tasks" /></ProtectedRoute>} />

            {/* --- Office Context --- */}
            <Route path="/office/:officeId/dashboard" element={<ProtectedRoute><BranchDashboard /></ProtectedRoute>} />
            <Route path="/office/:officeId/kanban" element={<ProtectedRoute><OperationsBoard /></ProtectedRoute>} />
            <Route path="/office/:officeId/ops" element={<ProtectedRoute><OperationsBoard /></ProtectedRoute>} /> {/* Legacy/Alias */}
            <Route path="/office/:officeId/jobs" element={<ProtectedRoute><JobsList /></ProtectedRoute>} />
            <Route path="/office/:officeId/dispatch" element={<ProtectedRoute><PlaceholderPage title="Office Dispatch" /></ProtectedRoute>} />

            <Route path="/office/:officeId/depts" element={<ProtectedRoute><OfficeDepartments /></ProtectedRoute>} />
            <Route path="/office/:officeId/departments" element={<ProtectedRoute><OfficeDepartments /></ProtectedRoute>} /> {/* Alias */}
            <Route path="/office/:officeId/team" element={<ProtectedRoute><StaffDirectory /></ProtectedRoute>} />

            <Route path="/office/:officeId/settings" element={<ProtectedRoute><PlaceholderPage title="Office Settings" /></ProtectedRoute>} />

            {/* --- Department Context --- */}
            <Route path="/office/:officeId/department/:departmentId" element={<ProtectedRoute><DepartmentDashboard /></ProtectedRoute>} />
            <Route path="/office/:officeId/department/:departmentId/kanban" element={<ProtectedRoute><OperationsBoard /></ProtectedRoute>} />
            <Route path="/office/:officeId/department/:departmentId/jobs" element={<ProtectedRoute><JobsList /></ProtectedRoute>} />
            <Route path="/office/:officeId/department/:departmentId/dispatch" element={<ProtectedRoute><PlaceholderPage title="Department Assignment" /></ProtectedRoute>} />
            <Route path="/office/:officeId/department/:departmentId/tasks" element={<ProtectedRoute><PlaceholderPage title="Department Tasks" /></ProtectedRoute>} />
            <Route path="/office/:officeId/department/:departmentId/team" element={<ProtectedRoute><StaffDirectory /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;
