  import { FC, ReactNode, useContext } from "react";
  import { Navigate } from "react-router-dom";
  import AuthContext from "./AuthContext";

  interface ProtectedRouteProps {
    allowedRoles: string[];
    children: ReactNode;
  }

  const ProtectedRoute: FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
  }) => {
    const { isAuthenticated, role, loading } = useContext(AuthContext);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
      return <Navigate to="/404" />;
    }

    return <>{children}</>;
  };

  export default ProtectedRoute;
