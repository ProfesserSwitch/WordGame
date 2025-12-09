import { Routes, Route, useLocation } from "react-router-dom";
import GameCanvas from "./BattlePage/walk";
import LoginPage from "./LoginPage";
import GameAppBar from "../components/AppBar";

export default function App() {
  const location = useLocation();

  // ซ่อน AppBar เฉพาะหน้า /battle
  const hideAppBar = location.pathname === "/battle";

  return (
    <>
      {!hideAppBar && <GameAppBar />}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/battle" element={<GameCanvas />} />
      </Routes>
    </>
  );
}
