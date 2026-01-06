import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { isAuthenticated, loading, session } = useAuth();

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  if (loading) {
    return null; // or a spinner
  }

  if (
    session &&
    parsedUserInfo &&
    session?.gsfGroupId !== parsedUserInfo.gsfGroupId
  ) {
    localStorage.removeItem("gsfUserInfo");
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
