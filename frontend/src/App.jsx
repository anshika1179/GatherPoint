import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Core / Layout ──────────────────────────────────────────────────────────────
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import AccessDenied from './components/AccessDenied';

// ── Auth pages ─────────────────────────────────────────────────────────────────
import StaffPosLogin from './components/StaffPosLogin';
import CustomerLoginPage from './components/CustomerLoginPage';

// ── Staff pages (old Layout wrapper) ──────────────────────────────────────────
import PosTerminal from './components/PosTerminal';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Tables from './components/Tables';
import Kitchen from './components/Kitchen';
import Reports from './components/Reports';
import SessionManager from './components/SessionManager';

// ── Admin shell ────────────────────────────────────────────────────────────────
import AdminLayout from './components/admin/AdminLayout';

// ── Admin pages ────────────────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminEmployees from './pages/admin/Employees';

// ── Hooks / Utils ──────────────────────────────────────────────────────────────
import useAuth from './hooks/useAuth';
import { constants } from './utils/constants';

// ── React-Query client ─────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Map a role to its home route */
const roleHome = (role) => {
  switch (role) {
    case constants.ROLES.ADMIN:         return '/admin/dashboard';
    case constants.ROLES.KITCHEN_STAFF: return '/kitchen';
    case constants.ROLES.EMPLOYEE:
    default:                            return '/pos';
  }
};

/** Full-screen spinner shown while auth resolves */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#020403]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// /staff-pos  — show login OR redirect to role dashboard
// ─────────────────────────────────────────────────────────────────────────────
const StaffPosGate = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user)    return <Navigate to={roleHome(user.role)} replace />;
  return <StaffPosLogin />;
};

// ─────────────────────────────────────────────────────────────────────────────
// Generic protected-route wrapper
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user)   return <Navigate to="/staff-pos" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <AccessDenied />;
  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>

        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* Customer login (Clerk or email) */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <CustomerLoginPage />}
        />

        {/* Staff / admin login — Clerk renders here */}
        <Route path="/staff-pos" element={<StaffPosGate />} />

        {/* ── Staff routes (EMPLOYEE or ADMIN) ─────────────────────────── */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.EMPLOYEE, constants.ROLES.ADMIN]}>
              <Layout><PosTerminal /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.EMPLOYEE, constants.ROLES.ADMIN]}>
              <Layout><Orders /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.EMPLOYEE, constants.ROLES.ADMIN]}>
              <Layout><Customers /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.EMPLOYEE, constants.ROLES.ADMIN]}>
              <Layout><Tables /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.KITCHEN_STAFF, constants.ROLES.ADMIN]}>
              <Layout><Kitchen /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.EMPLOYEE, constants.ROLES.ADMIN]}>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/session"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.EMPLOYEE, constants.ROLES.ADMIN]}>
              <Layout><SessionManager /></Layout>
            </ProtectedRoute>
          }
        />

        {/* ── Admin panel (ADMIN only) ──────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[constants.ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Index → dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"  element={<AdminDashboard />} />

          {/* Management */}
          <Route path="products"   element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tables"     element={<Tables />} />
          <Route path="employees"  element={<AdminEmployees />} />

          {/* Operations */}
          <Route path="orders"     element={<Orders />} />
          <Route path="customers"  element={<Customers />} />
          <Route path="coupons"    element={<Reports />} />   {/* placeholder until CouponsPage built */}

          {/* Analytics */}
          <Route path="reports"    element={<Reports />} />
          <Route path="revenue"    element={<Reports />} />   {/* placeholder until RevenuePage built */}

          {/* Settings / fallback */}
          <Route path="settings"   element={<div className="p-8 text-white text-xl">Settings — coming soon</div>} />
          <Route path="*"          element={<div className="p-8 text-white text-xl">Under Construction</div>} />
        </Route>

        {/* ── Global fallback ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}