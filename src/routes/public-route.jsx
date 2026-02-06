import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // return !isAuthenticated ? children : <Navigate to={role === "admin" ? "/admin/dashboard" : "/pilot/dashboard"} replace />;

  if (isAuthenticated && role) {
    const path = role === "admin" ? "/admin/dashboard" : "/pilot/dashboard";
    return <Navigate to={path} replace />;
  }

  return children;
};

export default PublicRoute;
