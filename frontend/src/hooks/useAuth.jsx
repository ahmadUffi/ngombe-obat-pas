// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { apiService } from "../api/apiservice";

export const AuthContext = createContext();

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => apiService.getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login with backend API
  const loginWithAPI = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login({ email, password });
      const sessionToken = response.access_token;

      setToken(sessionToken);
      apiService.setToken(sessionToken);

      // Optional: You can still get user info from Supabase if needed
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Original Supabase login (keep for compatibility)
  const loginHandle = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      const sessionToken = data.session.access_token;
      const userInfo = data.user;

      setToken(sessionToken);
      setUser(userInfo);
      apiService.setToken(sessionToken);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setToken(null);
      setUser(null);
      apiService.removeToken();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return apiService.isAuthenticated();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loginHandle,
        loginWithAPI,
        logout,
        isAuthenticated,
        loading,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
