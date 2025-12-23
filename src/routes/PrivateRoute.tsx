import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hook/auth";

export default function PrivateRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
