import React, { createContext, useContext } from "react";

type AuthSession = {
  id: string;
  gsfGroupId: string;
  accountName: string;
  role: "organizer" | "member";
  token: string;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthContextType = {
  isAuthenticated: boolean;
  session: AuthSession | null;
  login: (groupName: string, password: string) => Promise<void>;
  logout: () => void;
};

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

    const data: AuthSession = await res.json();

    localStorage.setItem("gsfSession", JSON.stringify(data));
    setSession({
      id: data.id,
      gsfGroupId: data.gsfGroupId,
      role: data.role,
      token: data.token,
    });
  };

  const logout = () => {
    localStorage.removeItem("gsfSession");
    setSession(null);
  };

  React.useEffect(() => {
    const stored = localStorage.getItem("gsfSession");
    if (stored) {
      setSession(JSON.parse(stored));
    }
  }, []);

  const value = {
    isAuthenticated: !!session,
    session,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
