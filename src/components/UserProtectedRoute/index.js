import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const UserProtectedRoute = ({ children }) => {
  const jwtToken = Cookies.get("jwt_Token");
  if (jwtToken === undefined) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default UserProtectedRoute;
