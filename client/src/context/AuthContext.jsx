import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, send } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { user: current } = await api("/auth/me");
      setUser(current);
      setConnectionError("");
    } catch (error) {
      setUser(null);
      if (error.status !== 401) setConnectionError(error.message);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (credentials) => {
    const { user: current } = await api("/auth/login", send("POST", credentials));
    setUser(current);
    setConnectionError("");
    return current;
  };
  const register = async (details) => {
    const { user: current } = await api("/auth/register", send("POST", details));
    setUser(current);
    setConnectionError("");
    return current;
  };
  const logout = async () => {
    await api("/auth/logout", send("POST", {}));
    setUser(null);
  };
  const updateUser = (current) => setUser(current);
  const value = useMemo(() => ({ user, ready, connectionError, login, register, logout, refresh, updateUser }), [user, ready, connectionError, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
