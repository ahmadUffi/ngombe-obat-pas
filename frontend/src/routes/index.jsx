import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../hooks/useAuth";

// Import all pages
import MainPage from "../Page/MainPage";
import Jadwal from "../Page/Jadwal";
import Control from "../Page/Control";
import History from "../Page/History";
import Note from "../Page/Note";
import Login from "../components/Login";
import Register from "../components/Register";

// Protected Route component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirects to dashboard if already authenticated)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
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

  // Protected Routes
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
    isProtected: true,
    title: "Home",
  },
  {
    path: "/dashboard",
    element: <MainPage />,
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
    path: "/history",
    element: <History />,
    isProtected: true,
    title: "Riwayat",
    icon: "📊",
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
