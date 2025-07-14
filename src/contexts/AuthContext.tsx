"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type JSX,
} from "react";
import Cookies from "js-cookie";
import { env } from "../config/env";
import { useNavigate } from "react-router-dom";

interface User {
  id: string | number;
  email: string;
  name?: string;
  // Add other user properties as needed
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface AuthContextType {
  user: User | null;
  admin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (
    email: string,
    password: string,
    secretKey: string
  ) => Promise<void>;
  logout: () => void;
  GoogleOneTap: () => JSX.Element | null;
  checkAdmin: () => Promise<boolean>;
  fetchUserData: (token: string) => Promise<User | null>;
  fetchUserDetails: (token: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if admin first
        const isAdmin = await checkAdminStatus(token);
        if (isAdmin) {
          setAdmin(true);
          setIsLoading(false);
          return;
        }

        // If not admin, check regular user
        const userData = await fetchUserData(token);
        if (userData) {
          setUser(userData);
          localStorage.setItem("userId", userData.id.toString());
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const checkAdminStatus = async (token: string) => {
    try {
      const response = await fetch(`${env.API_MAIN}/admin/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.ok;
    } catch (error) {
      console.error("Admin check failed:", error);
      return false;
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${env.API_MAIN}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  };
  const fetchUserDetails = async (token: string) => {
    try {
      const response = await fetch(`${env.API_MAIN}/user/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  };
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_MAIN}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const token = data.data.split(" ")[1];
      if (Cookies.get("token")) {
        Cookies.remove("token");
      }
      Cookies.set("token", token, { expires: 7 });
      const userData = await fetchUserData(token);

      if (!userData) {
        throw new Error("Failed to fetch user data");
      }

      setUser(userData);
      localStorage.setItem("userId", userData.id.toString());
      console.log("login successfull!!!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (
    email: string,
    password: string,
    secretKey: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${env.API_MAIN}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, secretKey }),
      });

      if (!response.ok) {
        throw new Error("Admin login failed");
      }

      const data = await response.json();
      const token = data.data.token;

      Cookies.set("token", token, { expires: 7 });
      const isAdmin = await checkAdminStatus(token);

      if (!isAdmin) {
        throw new Error("Not authorized as admin");
      }

      setAdmin(true);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("userId");
    setUser(null);
    setAdmin(false);
    navigate("/login");
  };

  const logout = async () => {
    try {
      const token = Cookies.get("token");
      if (token) {
        await fetch(`${env.API_MAIN}/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      handleLogout();
    }
  };

  const checkAdmin = async () => {
    const token = Cookies.get("token");
    if (!token) return false;
    return checkAdminStatus(token);
  };

  // Google OAuth implementation
  const GoogleOneTap = () => {
    useEffect(() => {
      if (!window.google || !env.REACT_APP_GOOGLE_CLIENT_ID) return;

      window.google.accounts.id.initialize({
        client_id: env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            const res = await fetch(`${env.API_MAIN}/user/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: response.credential }),
            });

            const data = await res.json();
            if (data.token) {
              const token = data.token.split(" ")[1];
              Cookies.set("token", token, { expires: 7 });

              const userData = await fetchUserData(token);
              if (userData) {
                setUser(userData);
                localStorage.setItem("userId", userData.id.toString());
                navigate("/", { replace: true });
              }
            }
          } catch (error) {
            console.error("Google login failed:", error);
          }
        },
        auto_select: true,
        cancel_on_tap_outside: false,
      });

      window.google.accounts.id.prompt();

      return () => {
        // Cleanup if needed
      };
    }, []);

    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isAuthenticated: !!user || admin,
        isLoading,
        login,
        adminLogin,
        logout,
        GoogleOneTap,
        checkAdmin,
        fetchUserData,
        fetchUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
