import SignInOutlook from "@/pages/auth/sign-in/sign-in-Outlook";
import PublicRoute from "./public-route";
import AdminDashboard from "@/pages/admin/adminDashboard";
import PrivateRoute from "./private-route";
import PilotDashboard from "@/pages/pilot/PilotDashboard";
import PersonalDetails from "@/pages/pilot/PersonalDetails";
import VerifierHistory from "@/pages/VerifierHistory/VerifierHistory";
import NotificationPage from "@/pages/notification";


export const routes = [
  {
    path: '/',
    element: (
      <PublicRoute>
        <SignInOutlook />
      </PublicRoute>
    ),
  },

  {
    path: '/admin/dashboard',
    element: (
      <PrivateRoute>
        <AdminDashboard />
      </PrivateRoute>
    ),
  },

  {
    path: '/pilot/dashboard',
    element: (
      <PrivateRoute>
        <PilotDashboard />
      </PrivateRoute>
    ),
  },

  {
    path: '/personal-details',
    element: (
      <PrivateRoute allowedRoles={['pilot', 'admin']}>
        <PersonalDetails />
      </PrivateRoute>
    ),
  },

  {
    path: '/notification/:id',
    element: (
      <PrivateRoute allowedRoles={['pilot', 'admin']}>
        <NotificationPage />
      </PrivateRoute>
    ),
  },

  {
    path: '/notification',
    element: (
      <PrivateRoute allowedRoles={['pilot', 'admin']}>
        <NotificationPage />
      </PrivateRoute>
    ),
  },

  {
    path: '/verifier-history',
    element: (
      <PrivateRoute allowedRoles={['admin']}>
        <VerifierHistory />
      </PrivateRoute>
    ),
  },
];
