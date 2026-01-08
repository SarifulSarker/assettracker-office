import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoggedIn) {
    // 🔁 redirect back to where user came from
    const redirectTo = location.state?.from || "/assets";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicRoute;
