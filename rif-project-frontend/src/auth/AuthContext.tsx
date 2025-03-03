import React, { createContext, useState, FC, ReactNode, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

interface AuthContextProps {
  isAuthenticated: boolean;
  role: string;
  displayRole: string;
  loading: boolean;
  isNewUser: boolean;
  isPrerequisiteComplete: boolean;
  isEsignatureComplete: boolean;
  isApproverDetailsComplete: boolean;
  user: { firstname: string; lastname: string; email: string } | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  role: "",
  displayRole: "",
  loading: true,
  isNewUser: false,
  isPrerequisiteComplete: false,
  isEsignatureComplete: false,
  isApproverDetailsComplete: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("");
  const [displayRole, setDisplayRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isPrerequisiteComplete, setIsPrerequisiteComplete] = useState(false);
  const [isEsignatureComplete, setIsEsignatureComplete] = useState(false);
  const [isApproverDetailsComplete, setIsApproverDetailsComplete] = useState(false);
  const [user, setUser] = useState<{ firstname: string; lastname: string; email: string } | null>(null);

  const roleMapping: { [key: string]: string } = {
    ROLE_USER: "User",
    ROLE_APPROVER: "Approver",
    ROLE_AUDITOR: "Auditor",
    ROLE_ADMIN: "Administrator",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as any;
        const userRole = decodedToken?.roles?.[0];
        const userIsNew = decodedToken?.isNewUser || false;
        if (userRole && new Date(decodedToken.exp * 1000) > new Date()) {
          setIsAuthenticated(true);
          setRole(userRole);
          setIsNewUser(userIsNew);
          setDisplayRole(roleMapping[userRole] || userRole);
          setUser({
            firstname: decodedToken.firstname,
            lastname: decodedToken.lastname,
            email: decodedToken.sub,
          });
          fetchStatuses(token);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Invalid token format", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const fetchStatuses = async (token: string) => {
    try {
      const [prerequisiteRes, esignatureRes, approverRes] = await Promise.all([
        fetch("http://localhost:8080/api/prerequisites/status", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/api/esignatures/status", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/api/approvers/status", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (prerequisiteRes.ok && esignatureRes.ok && approverRes.ok) {
        const isPrerequisiteComplete = await prerequisiteRes.json();
        const isEsignatureComplete = await esignatureRes.json();
        const isApproverDetailsComplete = await approverRes.json();
        setIsPrerequisiteComplete(isPrerequisiteComplete);
        setIsEsignatureComplete(isEsignatureComplete);
        setIsApproverDetailsComplete(isApproverDetailsComplete);
      } else {
        console.error("Failed to fetch statuses");
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode(token) as any;
    const userRole = decodedToken?.roles?.[0];
    const userIsNew = decodedToken?.isNewUser || false;
    setIsAuthenticated(true);
    setRole(userRole);
    setIsNewUser(userIsNew);
    setDisplayRole(roleMapping[userRole] || userRole);
    setUser({
      firstname: decodedToken.firstname,
      lastname: decodedToken.lastname,
      email: decodedToken.sub,
    });
    fetchStatuses(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setRole("");
    setDisplayRole("");
    setIsNewUser(false);
    setIsPrerequisiteComplete(false);
    setIsEsignatureComplete(false);
    setIsApproverDetailsComplete(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        displayRole,
        loading,
        isNewUser,
        isPrerequisiteComplete,
        isEsignatureComplete,
        isApproverDetailsComplete,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
