import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface User { id: string; email: string; name: string; }
interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("seeme_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.get(`${API_BASE}/auth/me`).then(({ data }) => {
        setUser(data.user);
      }).catch(() => {
        setToken(null);
        localStorage.removeItem("seeme_token");
        delete axios.defaults.headers.common["Authorization"];
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("seeme_token", data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  };

  const register = async (email: string, password: string, name: string) => {
    const { data } = await axios.post(`${API_BASE}/auth/register`, { email, password, name });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("seeme_token", data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("seeme_token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
