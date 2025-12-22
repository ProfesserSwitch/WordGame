import { Box } from "@mui/material";
import { Outlet, Navigate } from "react-router-dom";
import GameAppBar from "../../components/AppBar";
import { Loading } from "../../components/Loading/Loading";
import { useLoadData } from "../LoginPage/hook/useLoadData";
import { useEffect } from "react";

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
    <>
      <GameAppBar />

      {/* “ช่องว่าง” ที่ React Router เอา component ของ route ลูกมาใส่ เหมือนกล่องอะ กล่องว่างๆๆ */}
      <Outlet />
    </>
  );
};

export default HomePage;
