import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../hooks/useAuth";

// Import all pages
import Dashboard from "../Page/Dashboard";
import Jadwal from "../Page/Jadwal";
import Control from "../Page/Control";
import Note from "../Page/Note";
import History from "../Page/History";
import Peringatan from "../Page/Peringatan";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import EmailCallback from "../components/Auth/EmailCallback";
import ForgotPassword from "../components/Auth/ForgotPassword";
import ResetPassword from "../components/Auth/ResetPassword";
import { Profile, ChangePassword } from "../components/Profile";

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
    element: <Login />,
    isProtected: false,
    title: "Login",
  },
  {
    path: "/register",
    element: <Register />,
    isProtected: false,
    title: "Register",
  },
  {
    path: "/auth/callback",
    element: <EmailCallback />,
    isProtected: false,
    title: "Email Verification",
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    isProtected: false,
    title: "Forgot Password",
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
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
    element: <Dashboard />,
    isProtected: true,
    title: "Dashboard",
    icon: "🏠",
    showInNav: true,
  },
  {
    path: "/jadwal",
    element: <Jadwal />,
    isProtected: true,
    title: "Jadwal Obat",
    icon: "💊",
    showInNav: true,
  },
  {
    path: "/control",
    element: <Control />,
    isProtected: true,
    title: "Kontrol Dokter",
    icon: "🏥",
    showInNav: true,
  },
  {
    path: "/note",
    element: <Note />,
    isProtected: true,
    title: "Catatan",
    icon: "📝",
    showInNav: true,
  },
  {
    path: "/history",
    element: <History />,
    isProtected: true,
    title: "Riwayat",
    icon: "📊",
    showInNav: true,
  },
  {
    path: "/peringatan",
    element: <Peringatan />,
    isProtected: true,
    title: "Peringatan",
    icon: "⚠️",
    showInNav: true,
  },
  {
    path: "/profile",
    element: <Profile />,
    isProtected: true,
    title: "Edit Profile",
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
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
