// @refresh reset
import React, { createContext, useState, useEffect } from "react";
import { api } from "../api/client";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      if (!err.message?.includes("Authentication credentials were not provided")) {
        console.warn("Session check failed:", err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth_unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    await fetchUser();
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    await fetchUser();
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout request failed:", err);
      api.setToken(null);
    }
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
