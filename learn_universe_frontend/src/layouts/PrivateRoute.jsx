import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auths.js";

export const PrivateRoute = ({ children }) => {
  const user = useAuthStore((state) => state.userData);
  const { pathname } = useLocation();
  if (!user) return <Navigate to="/login/" replace />;
  if (pathname.startsWith("/instructor/") && !user.is_teacher) {
    return <Navigate to="/student/dashboard/" replace />;
  }
  return <>{children}</>;
};
