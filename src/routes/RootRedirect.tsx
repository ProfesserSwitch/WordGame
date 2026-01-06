import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hook/auth";

export default function RootRedirect() {
  const { currentUser } = useAppSelector((state) => state.auth);

  // App กัน authLoading ไว้แล้ว → ไม่ต้องเช็คซ้ำ
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/home" replace />;
}
