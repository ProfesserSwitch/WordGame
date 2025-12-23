import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import GameAppBar from "../../components/AppBar";
import { Loading } from "../../components/Loading/Loading";
import { useLoadData } from "../LoginPage/hook/useLoadData";
import { useEffect } from "react";
import StarBackground from "./components/StarBackground";

const HomePage = () => {
  const { loading, fetchAllData } = useLoadData();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Loading />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <GameAppBar />

      {/* 🌌 Sky */}
      <Box
        sx={{
          position: "relative",
          height: "calc(100vh - 64px)", // หัก AppBar
          backgroundColor: "#16141A",
          overflow: "hidden",
        }}
      >
        {/* ดาว */}
        <StarBackground />

        {/* เนื้อหาเกม */}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Outlet />
        </Box>

        {/* 🪨 Ground */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "80px",
            bgcolor: "#4F4E4E",
            borderTop: "10px solid #ffffff",
            zIndex: 1,
          }}
        />
      </Box>
    </Box>
  );
};

export default HomePage;
