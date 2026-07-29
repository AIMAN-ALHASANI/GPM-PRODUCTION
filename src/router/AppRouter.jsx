import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalLoader from '../components/common/GlobalLoader';

// Public Pages
const HomePage = React.lazy(() => import('../pages/public/HomePage'));
const Login = React.lazy(() => import('../pages/auth/Login'));
const ArchiveProjectsPage = React.lazy(() => import('../pages/public/ArchiveProjectsPage'));
const ArchiveProjectDetailsPage = React.lazy(() => import('../pages/public/ArchiveProjectDetailsPage'));


// Layouts
import AdminLayout from '../layouts/AdminLayout';
import HODLayout from '../layouts/HODLayout';
import StudentLayout from '../layouts/StudentLayout';
import SupervisorLayout from '../layouts/SupervisorLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';

// Super Admin Pages
const SuperAdminDashboard = React.lazy(() => import('../pages/superadmin/SuperAdminDashboard'));
const CollegesManagement = React.lazy(() => import('../pages/superadmin/CollegesManagement'));
const AdminManagement = React.lazy(() => import('../pages/superadmin/AdminManagement'));
const GlobalUsersOverview = React.lazy(() => import('../pages/superadmin/GlobalUsersOverview'));
const SystemActivity = React.lazy(() => import('../pages/superadmin/SystemActivity'));
const SuperAdminAnalytics = React.lazy(() => import('../pages/superadmin/SuperAdminAnalytics'));
const SuperAdminArchivedProjects = React.lazy(() => import('../pages/superadmin/SuperAdminArchivedProjects'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('../pages/admin/Dashboard'));
const StudentsManagement = React.lazy(() => import('../pages/admin/StudentsManagement'));
const SupervisorsManagement = React.lazy(() => import('../pages/admin/SupervisorsManagement'));
const HeadsOfDepartmentManagement = React.lazy(() => import('../pages/admin/HeadsOfDepartmentManagement'));
const DepartmentsManagement = React.lazy(() => import('../pages/admin/DepartmentsManagement'));
const ProjectsManagement = React.lazy(() => import('../pages/admin/ProjectsManagement'));
const TeamsManagement = React.lazy(() => import('../pages/admin/TeamsManagement'));
const ArchivedProjectsManagement = React.lazy(() => import('../pages/admin/ArchivedProjectsManagement'));
const ProjectArchiveManagement = React.lazy(() => import('../pages/admin/ProjectArchiveManagement'));
const TeamSettings = React.lazy(() => import('../pages/admin/TeamSettings'));
const AddNewUser = React.lazy(() => import('../pages/admin/AddNewUser'));
const AddArchiveProject = React.lazy(() => import('../pages/admin/AddArchiveProject'));

// HOD Pages
const HODDashboard = React.lazy(() => import('../pages/hod/HODDashboard'));
const HODProjectsOverview = React.lazy(() => import('../pages/hod/HODProjectsOverview'));
const HODProposals = React.lazy(() => import('../pages/hod/HODProposals'));
const HODProposalDetails = React.lazy(() => import('../pages/hod/HODProposalDetails'));
const HODProjectDetails = React.lazy(() => import('../pages/hod/HODProjectDetails'));
const HODRequests = React.lazy(() => import('../pages/hod/HODRequests'));
const SupervisorAssignment = React.lazy(() => import('../pages/hod/SupervisorAssignment'));

// Student Pages
const StudentDashboard = React.lazy(() => import('../pages/student/Dashboard'));
const StudentMyTeam = React.lazy(() => import('../pages/student/MyTeam'));
const StudentMyTasks = React.lazy(() => import('../pages/student/StudentMyTasks'));
const StudentTaskDetails = React.lazy(() => import('../pages/student/StudentTaskDetails'));
const StudentProposals = React.lazy(() => import('../pages/student/Proposals'));
const StudentProposalDetails = React.lazy(() => import('../pages/student/ProposalDetails'));
const StudentCreateProposal = React.lazy(() => import('../pages/student/StudentCreateProposal'));
const StudentReports = React.lazy(() => import('../pages/student/Reports'));
const StudentReportDetails = React.lazy(() => import('../pages/student/ReportDetails'));
const StudentMeetings = React.lazy(() => import('../pages/student/Meetings'));
const StudentScheduleMeeting = React.lazy(() => import('../pages/student/StudentScheduleMeeting'));
const StudentLeaderTeamManagement = React.lazy(() => import('../pages/student/StudentLeaderTeamManagement'));
const StudentProjectDetails = React.lazy(() => import('../pages/student/ProjectDetails'));

// Supervisor Pages
const SupervisorDashboard = React.lazy(() => import('../pages/supervisor/SupervisorDashboard'));
const SupervisorMeetings = React.lazy(() => import('../pages/supervisor/SupervisorMeetings'));
const SupervisorReports = React.lazy(() => import('../pages/supervisor/SupervisorReports'));
const SupervisorProjects = React.lazy(() => import('../pages/supervisor/SupervisorProjects'));

// Shared Pages
const MyProfile = React.lazy(() => import('../pages/shared/MyProfile'));
const NotificationsPage = React.lazy(() => import('../pages/NotificationsPage'));

import Navbar from '../components/navbar/Navbar';

const SharedLayout = () => (
  <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
    <Navbar />
    <main className="flex-1 flex flex-col min-w-0 p-6 lg:p-10 overflow-y-auto page-enter">
      <Outlet />
    </main>
  </div>
);

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <GlobalLoader message="جاري التحقق من الهوية..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    const defaultPath = {
      'SuperAdmin': '/superadmin/dashboard',
      'Admin': '/admin/dashboard',
      'Student': '/student/dashboard',
      'Supervisor': '/supervisor/dashboard',
      'HeadOfDepartment': '/hod/dashboard'
    }[user?.role] || '/';

    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<GlobalLoader message="جاري التحميل..." />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/archive" element={<ArchiveProjectsPage />} />
          <Route path="/archive/:id" element={<ArchiveProjectDetailsPage />} />

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={<RoleRoute allowedRoles={['SuperAdmin']}><SuperAdminLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="analytics" element={<SuperAdminAnalytics />} />
            <Route path="activity" element={<SystemActivity />} />
            <Route path="colleges" element={<CollegesManagement />} />
            <Route path="admins" element={<AdminManagement />} />
            <Route path="users" element={<GlobalUsersOverview />} />
            <Route path="archived-projects" element={<SuperAdminArchivedProjects />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<RoleRoute allowedRoles={['Admin']}><AdminLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="supervisors" element={<SupervisorsManagement />} />
            <Route path="hods" element={<HeadsOfDepartmentManagement />} />
            <Route path="departments" element={<DepartmentsManagement />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="teams" element={<TeamsManagement />} />
            <Route path="team-settings" element={<TeamSettings />} />
            <Route path="archived-projects" element={<ArchivedProjectsManagement />} />
            <Route path="project-archive" element={<ProjectArchiveManagement />} />
            <Route path="users/add" element={<AddNewUser />} />
            <Route path="projects/archive/add" element={<AddArchiveProject />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* HOD Routes */}
          <Route path="/hod" element={<RoleRoute allowedRoles={['HeadOfDepartment']}><HODLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HODDashboard />} />
            <Route path="supervisor-assignment" element={<SupervisorAssignment />} />
            <Route path="projects" element={<HODProjectsOverview />} />
            <Route path="projects/:id" element={<HODProjectDetails />} />
            <Route path="proposals" element={<HODProposals />} />
            <Route path="proposals/:id" element={<HODProposalDetails />} />
            <Route path="requests" element={<HODRequests />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<RoleRoute allowedRoles={['Student']}><StudentLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="team" element={<StudentMyTeam />} />
            <Route path="project" element={<StudentProjectDetails />} />
            <Route path="tasks" element={<StudentMyTasks />} />
            <Route path="tasks/:id" element={<StudentTaskDetails />} />
            <Route path="team/management" element={<StudentLeaderTeamManagement />} />
            <Route path="proposals" element={<StudentProposals />} />
            <Route path="proposals/create" element={<StudentCreateProposal />} />
            <Route path="proposals/:id" element={<StudentProposalDetails />} />
            <Route path="reports" element={<StudentReports />} />
            <Route path="reports/:id" element={<StudentReportDetails />} />
            <Route path="meetings" element={<StudentMeetings />} />
            <Route path="meetings/schedule" element={<StudentScheduleMeeting />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Supervisor Routes */}
          <Route path="/supervisor" element={<RoleRoute allowedRoles={['Supervisor']}><SupervisorLayout /></RoleRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SupervisorDashboard />} />
            <Route path="meetings" element={<SupervisorMeetings />} />
            <Route path="reports" element={<SupervisorReports />} />
            <Route path="projects" element={<SupervisorProjects />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>

          {/* Shared Routes */}
          <Route element={<RoleRoute><SharedLayout /></RoleRoute>}>
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
