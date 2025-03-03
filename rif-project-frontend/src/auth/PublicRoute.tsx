import React, { FC, useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "./AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, role, isNewUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    if (isNewUser) {
      return <Navigate to="/prerequisites" />;
    }
    if (role === "ROLE_ADMIN") {
      return <Navigate to="/admin" />;
    } else if (role === "ROLE_APPROVER") {
      return <Navigate to="/approver/approverdetails" />; // Updated URL
    } else if (role === "ROLE_USER") {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute;
