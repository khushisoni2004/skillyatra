import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ name: "Devendra", email: "dev@gmail.com", role: "student" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("skillyatra_user");
    const token = localStorage.getItem("skillyatra_token");

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("skillyatra_user");
        localStorage.removeItem("skillyatra_token");
      }
    }

    setLoading(false);
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data.token;
    const userData = res.data.user || res.data;

    if (token) {
      localStorage.setItem("skillyatra_token", token);
    }

    localStorage.setItem("skillyatra_user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  }

  async function signup(name, email, password) {
    const res = await api.post("/auth/register", {
      name,
      email,
      password
    });

    const token = res.data.token;
    const userData = res.data.user || res.data;

    if (token) {
      localStorage.setItem("skillyatra_token", token);
    }

    localStorage.setItem("skillyatra_user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  }

  function logout() {
    localStorage.removeItem("skillyatra_token");
    localStorage.removeItem("skillyatra_user");
    setUser({ name: "Devendra", email: "dev@gmail.com", role: "student" });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
