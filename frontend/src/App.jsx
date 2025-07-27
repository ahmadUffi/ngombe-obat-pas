import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { routes, ProtectedRoute, PublicRoute } from "./routes";
import { AuthContext } from "./hooks/useAuth";
import LoadingScreen from "./components/Utility/LoadingScreen";

const App = () => {
  const { loading } = useContext(AuthContext);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Memuat aplikasi..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              route.isProtected ? (
                <ProtectedRoute>{route.element}</ProtectedRoute>
              ) : (
                <PublicRoute>{route.element}</PublicRoute>
              )
            }
          />
        ))}

        {/* Catch all route - redirect to login if not authenticated, dashboard if authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
