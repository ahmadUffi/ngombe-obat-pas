import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { routes, ProtectedRoute, PublicRoute } from "./routes";
import { AuthContext } from "./hooks/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "./components/UI/LoadingScreen";

const App = () => {
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

      {/* Toast notifications container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
};

export default App;
