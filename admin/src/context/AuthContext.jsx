import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMeRequest, loginRequest } from "../api";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  async function login(email, password) {
    setLoading(true);

    try {
      const response = await loginRequest({ email, password });
      const data = response.data;

      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token;

      const loggedInUser =
        data?.user ||
        data?.data?.user ||
        null;

      if (!token) {
        throw new Error("Login succeeded but no JWT token was returned.");
      }

      if (loggedInUser?.role && loggedInUser.role !== "admin") {
        throw new Error("This account does not have administrator access.");
      }

      localStorage.setItem("admin_token", token);

      if (loggedInUser) {
        localStorage.setItem("admin_user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      return data;
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const response = await getMeRequest();
      const me = response.data?.user || response.data?.data || response.data;

      if (me) {
        localStorage.setItem("admin_user", JSON.stringify(me));
        setUser(me);
      }

      return me;
    } catch {
      return null;
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  }

  useEffect(() => {
    if (localStorage.getItem("admin_token")) {
      refreshUser();
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(localStorage.getItem("admin_token")),
      login,
      logout,
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
