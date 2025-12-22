import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch , useAppSelector } from "../hook/auth";
import { checkAuth } from "../store/reducers/authentication";

import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import HomePage from "./HomePage";
import GameApp from "./BattlePage/App";
import PrivateRoute from "../routes/PrivateRoute";

import { Loading } from "../components/Loading/Loading";

export default function App() {
  const dispatch = useAppDispatch();
  const { authLoading } = useAppSelector((state) => state.auth);

  // เช็ค auth ตอนเปิดเว็บ
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (authLoading) {
    return null;
  }
  

  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* private */}
      <Route element={<PrivateRoute />}>
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/battle" element={<GameApp />} />
      </Route>
    </Routes>
  );
}
