import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hook/auth";
import { checkAuth } from "../store/reducers/authentication";
import { AdminRoute } from "../routes/AdminRoute";
import PrivateRoute from "../routes/PrivateRoute";
import RootRedirect from "../routes/RootRedirect";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import LoginPage from "./AuthPage/LoginPage";
import RegisterPage from "./AuthPage/RegisterPage";
import HomePage from "./HomePage";
import AdvantureFeature from "./HomePage/feature/AdvantureFeature";
import ShopSpellFeature from "./HomePage/feature/ShopSpellFeature";
import DictionaryLibrary from "./HomePage/feature/LibraryFeature/dictionary/DictionaryLibrary";
import MonsterLibrary from "./HomePage/feature/LibraryFeature/monster/MonsterLibrary";
import SettingsFeature from "./HomePage/feature/SettingFeature";
import GameApp from "./BattlePage/App";
import AuthPage from "./AuthPage";
import { Loading } from "../components/Loading/Loading";
import { HomeLobbyLayout } from "./HomePage/HomeLobbyLayout";
import LibraryFeature from "./HomePage/feature/LibraryFeature";
import AdminPage from "./AdminPage";
import NotFoundPage from "./NotFoundPage";
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
      <Route path="/" element={<RootRedirect />} />
      {/* public */}
      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>

      {/* private (player)*/}
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<HomePage />}>
          <Route index element={<HomeLobbyLayout />} />
          {/* <Route path="adventure" element={<AdvantureFeature />} />
          <Route path="shop" element={<ShopSpellFeature />} />
          <Route path="quest" element={<Quest />} />
          <Route path="monster" element={<MonsterLibrary />} /> */}
        </Route>
        <Route path="/home/adventure" element={<AdvantureFeature />} />
        <Route path="/home/shop" element={<ShopSpellFeature />} />
        <Route path="/home/library" element={<LibraryFeature />} />
        <Route
          path="/home/library/dictionary"
          element={<DictionaryLibrary />}
        />
        <Route path="/home/library/monster" element={<MonsterLibrary />} />
        <Route path="/battle" element={<GameApp />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
