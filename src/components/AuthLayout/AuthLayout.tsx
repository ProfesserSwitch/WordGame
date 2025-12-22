import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { FloatingLetters } from "../FloatingLetters"; // แยกไฟล์นะ แนะนำ

const AuthLayout = () => {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "radial-gradient(circle at top, #2a1f3f, #0b1020 60%)",
        overflow: "hidden",
      }}
    >
      {/* 🔮 background ไม่ re */}
      <FloatingLetters />

      {/* 🔹 content เปลี่ยน */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
