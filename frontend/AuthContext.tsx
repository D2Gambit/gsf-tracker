import React, { createContext, useContext } from "react";

const AuthContext = createContext(null);

// Create a custom hook to easily consume the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create a Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const value = {
    isAuthenticated,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
