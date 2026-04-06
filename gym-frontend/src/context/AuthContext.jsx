import { createContext, useContext, useState } from "react";
import { loginAdmin, verifyLogin2FA } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("gym_token");
  });

  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const { data } = await loginAdmin({ email, password });
      if (data.requires2FA) {
        return { success: true, requires2FA: true, tempToken: data.tempToken, phoneMasked: data.phoneMasked, demoCode: data.demoCode };
      }
      localStorage.setItem("gym_token", data.token);
      localStorage.setItem("gym_admin", JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Check your credentials.";
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const verify2falogin = async (tempToken, code) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const { data } = await verifyLogin2FA({ tempToken, code });
      localStorage.setItem("gym_token", data.token);
      localStorage.setItem("gym_admin", JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed.";
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("gym_token");
    localStorage.removeItem("gym_admin");
  };

  const getAdmin = () => {
    try {
      return JSON.parse(localStorage.getItem("gym_admin")) || {};
    } catch {
      return {};
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, authError, isLoading, getAdmin, verify2falogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
