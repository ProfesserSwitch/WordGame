import { Routes, Route,} from "react-router-dom";
import GameCanvas from "./BattlePage/App";
import HomePage from "./HomePage";
import RegisterPage from "./RegisterPage";
import GameAppBar from "../components/AppBar";
import LoginPage from "./LoginPage";
export default function App() {


  return (
    <>
      {/* {!hideAppBar && <GameAppBar />} */}

      <Routes>
        {/* <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage/>}/> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/battle" element={<GameCanvas />} />
      </Routes>
    </>
  );
}
