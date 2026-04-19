import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create the context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      // In a production app, you would ideally hit a /me endpoint here
      // to verify the token is still valid with the backend.
      setUser({ token, role });
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", userData.role);
    setUser({ token, role: userData.role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>; // Prevent flickering before state loads

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
