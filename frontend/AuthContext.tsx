import React, { createContext, useContext, useEffect } from "react";

type AuthSession = {
  id: string;
  gsfGroupId: string;
  token: string;
  createdAt: Date;
};

type UserInfo = {
  gsfGroupId: string;
  role: string;
  accountName: string;
  userInfo: any;
};

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  session: AuthSession | null;
  userInfo: UserInfo | null;
  login: (groupName: string, password: string) => Promise<void>;
  selectUser: (info: UserInfo) => void;
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
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);
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

    // Use saved userInfo if it exists
    const storedUser = localStorage.getItem("gsfUserInfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.gsfGroupId === data.gsfGroupId) {
        setUserInfo(parsedUser);
      }
    }
  };

  const selectUser = (info: UserInfo) => {
    localStorage.setItem("gsfUserInfo", JSON.stringify(info));
    setUserInfo(info);
  };

  const logout = () => {
    localStorage.removeItem("gsfSession");
    setSession(null);
    setUserInfo(null);
  };

  useEffect(() => {
    const storedSession = localStorage.getItem("gsfSession");
    const storedUser = localStorage.getItem("gsfUserInfo");

    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.gsfGroupId === parsedSession.gsfGroupId) {
          setUserInfo(parsedUser);
        }
      }
    }
    setLoading(false);
  }, []);

  const value = {
    isAuthenticated: !!session,
    session,
    userInfo,
    login,
    selectUser,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
