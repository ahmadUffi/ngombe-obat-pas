import React, { useContext, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../hooks/useAuth";
import LoadingScreen from "../components/UI/LoadingScreen";

// Lazy-load pages and large components to reduce initial bundle size
const Dashboard = lazy(() => import("../Page/Dashboard"));
const Jadwal = lazy(() => import("../Page/Jadwal"));
const Control = lazy(() => import("../Page/Control"));
const Note = lazy(() => import("../Page/Note"));
const History = lazy(() => import("../Page/History"));
const Peringatan = lazy(() => import("../Page/Peringatan"));
const Login = lazy(() => import("../components/Auth/Login"));
const Register = lazy(() => import("../components/Auth/Register"));
const EmailCallback = lazy(() => import("../components/Auth/EmailCallback"));
const ForgotPassword = lazy(() => import("../components/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../components/Auth/ResetPassword"));
// Named exports need mapping to default for React.lazy
const Profile = lazy(() =>
  import("../components/Profile").then((m) => ({ default: m.Profile }))
);
const ChangePassword = lazy(() =>
  import("../components/Profile").then((m) => ({ default: m.ChangePassword }))
);

// Protected Route component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirects to mainpage if already authenticated)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

// Route configuration
export const routes = [
  // Public Routes
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Login />
      </Suspense>
    ),
    isProtected: false,
    title: "Login",
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Register />
      </Suspense>
    ),
    isProtected: false,
    title: "Register",
  },
  {
    path: "/auth/callback",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <EmailCallback />
      </Suspense>
    ),
    isProtected: false,
    title: "Email Verification",
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ForgotPassword />
      </Suspense>
    ),
    isProtected: false,
    title: "Forgot Password",
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ResetPassword />
      </Suspense>
    ),
    isProtected: false,
    title: "Reset Password",
  },

  // Protected Routes
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
    isProtected: true,
    title: "Home",
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Dashboard />
      </Suspense>
    ),
    isProtected: true,
    title: "Dashboard",
    icon: "🏠",
    showInNav: true,
  },
  {
    path: "/jadwal",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Jadwal />
      </Suspense>
    ),
    isProtected: true,
    title: "Jadwal Obat",
    icon: "💊",
    showInNav: true,
  },
  {
    path: "/control",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Control />
      </Suspense>
    ),
    isProtected: true,
    title: "Kontrol Dokter",
    icon: "🏥",
    showInNav: true,
  },
  {
    path: "/note",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Note />
      </Suspense>
    ),
    isProtected: true,
    title: "Catatan",
    icon: "📝",
    showInNav: true,
  },
  {
    path: "/history",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <History />
      </Suspense>
    ),
    isProtected: true,
    title: "Riwayat",
    icon: "📊",
    showInNav: true,
  },
  {
    path: "/peringatan",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Peringatan />
      </Suspense>
    ),
    isProtected: true,
    title: "Peringatan",
    icon: "⚠️",
    showInNav: true,
  },
  {
    path: "/profile",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <Profile />
      </Suspense>
    ),
    isProtected: true,
    title: "Edit Profile",
  },
  {
    path: "/change-password",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ChangePassword />
      </Suspense>
    ),
    isProtected: true,
    title: "Ubah Password",
  },
];

// Get navigation routes (routes that should appear in navigation)
export const getNavigationRoutes = () => {
  return routes.filter((route) => route.showInNav && route.isProtected);
};

// Get public routes
export const getPublicRoutes = () => {
  return routes.filter((route) => !route.isProtected);
};

// Get protected routes
export const getProtectedRoutes = () => {
  return routes.filter((route) => route.isProtected);
};
