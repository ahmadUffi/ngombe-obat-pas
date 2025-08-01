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

  // Fetch user profile from Supabase
  const fetchUserProfile = async (email) => {
    try {
      console.log("Fetching user profile for email:", email);
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      console.log("User profile fetched successfully:", data);
      setUser(data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Check for existing token and fetch user profile on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const existingToken = apiService.getToken();
      console.log(
        "Checking existing auth, token:",
        existingToken ? "exists" : "none",
        "user:",
        user ? "exists" : "none"
      );

      if (existingToken && !user) {
        // If we have a token but no user data, we need to get the user email somehow
        // For now, let's store the email in localStorage during login
        const storedEmail = localStorage.getItem("user_email");
        console.log("Stored email:", storedEmail);

        if (storedEmail) {
          await fetchUserProfile(storedEmail);
        }
      }
    };

    checkExistingAuth();
  }, []); // Remove user dependency to prevent infinite loops, only run on mount

  // Login with backend API
  const loginWithAPI = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login({ email, password });
      const sessionToken = response.access_token;

      setToken(sessionToken);
      apiService.setToken(sessionToken);

      // Store email for persistent session
      localStorage.setItem("user_email", email);

      // Get user profile from Supabase after successful login
      await fetchUserProfile(email);

      console.log("Login successful, user data should be loaded");

      return response;
    } catch (err) {
      // Enhanced error handling
      console.error("Login API Error:", err);

      let errorToThrow = err;

      // If it's an axios error with response data, preserve the structure
      if (err.response?.data) {
        // Keep the original error structure for better error handling in components
        const errorMessage =
          err.response.data.message || err.response.data.error || err.message;
        setError(errorMessage);

        // Create enhanced error object with response data
        errorToThrow = new Error(errorMessage);
        errorToThrow.response = err.response;
      } else {
        // Handle network or other errors
        const errorMessage = err.message || "Terjadi kesalahan jaringan";
        setError(errorMessage);
        errorToThrow = new Error(errorMessage);
      }

      throw errorToThrow;
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
      localStorage.removeItem("user_email"); // Remove stored email
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
