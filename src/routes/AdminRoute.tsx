import { useAppSelector } from "../hook/auth";
import { Navigate, Outlet } from "react-router-dom";

export const AdminRoute = () => {
  const { currentUser } = useAppSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
