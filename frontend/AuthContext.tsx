import React, { createContext, useContext, useEffect } from "react";

type AuthSession = {
  id: string;
  gsfGroupId: string;
  token: string;
  createdAt: Date;
};

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  session: AuthSession | null;
  login: (groupName: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Create a custom hook to easily consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  const login = async (groupName: string, password: string) => {
    const formData = new FormData();
    formData.append("gsfGroupId", groupName);
    formData.append("password", password);

    const res = await fetch("/api/login", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Invalid group name or password");
    }

    const data = await res.json();
    const sessionData = {
      id: data.id,
      gsfGroupId: data.gsfGroupId,
      token: data.passwordHash,
      createdAt: data.createdAt,
    };

    localStorage.setItem("gsfSession", JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const logout = () => {
    localStorage.removeItem("gsfSession");
    setSession(null);
  };

  useEffect(() => {
    const stored = localStorage.getItem("gsfSession");
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const value = {
    isAuthenticated: !!session,
    session,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
