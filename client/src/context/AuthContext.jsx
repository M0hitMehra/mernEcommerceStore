import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { authApi, getErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      if (data?.success && data?.user) {
        setUser(data.user);
        return data.user;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    if (data?.success) {
      setUser(data.user);
      toast.success(data.message || "Welcome back!");
    }
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    if (data?.success) {
      setUser(data.user);
      toast.success(data.message || "Registered successfully!");
    }
    return data;
  };

  const logout = async () => {
    try {
      const { data } = await authApi.logout();
      setUser(null);
      toast.success(data?.message || "Logged out");
    } catch (err) {
      setUser(null);
      toast.error(getErrorMessage(err, "Logout failed"));
    }
  };

  const updateProfile = async (payload) => {
    const { data } = await authApi.updateProfile({
      ...payload,
      email: user?.email || payload.email,
    });
    if (data?.success && data?.user) {
      setUser(data.user);
      toast.success(data.message || "Profile updated");
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 1,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
