// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const loginHandle = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const sessionToken = data.session.access_token;
    const userInfo = data.user;

    setToken(sessionToken);
    setUser(userInfo);
    localStorage.setItem("token", sessionToken);
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, user, loginHandle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
