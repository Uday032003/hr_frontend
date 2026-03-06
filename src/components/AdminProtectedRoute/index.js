import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const AdminProtectedRoute = ({ children }) => {
  const adminToken = Cookies.get("admin_Token");
  if (adminToken === undefined) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default AdminProtectedRoute;
