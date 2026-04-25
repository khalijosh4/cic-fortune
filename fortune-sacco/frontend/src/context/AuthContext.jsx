import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token    = localStorage.getItem("fs_token");
    const stored   = localStorage.getItem("fs_user");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        // Verify token is still valid
        authAPI.me()
          .then(r => setUser(r.data.data))
          .catch(() => { localStorage.clear(); setUser(null); })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem("fs_token", token);
    localStorage.setItem("fs_user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem("fs_token");
    localStorage.removeItem("fs_user");
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
