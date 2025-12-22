import { Box, Typography, Button } from "@mui/material";
import { FormTextField } from "../../components/FormTextField";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginPlayer } from "./hook/useLoginPlayer";
import { motion } from "framer-motion";
import PaperFrame from "../../components/PaparFrame/PaperFrame";
interface LoginForm {
  username: string;
  password: string;
}

type BootStep = "idle" | "auth" | "loadingData";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function FloatingLetters() {
  const items = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const letter = letters[Math.floor(Math.random() * letters.length)];
      return {
        id: i,
        letter,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 8,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.2,
      };
    });
  }, []);

  return (
    <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: item.opacity }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${item.x}vw`,
            fontSize: item.size,
            fontFamily: "'Press Start 2P'",
            color: "#eaeaea",
            textShadow: "0 0 6px rgba(180,160,255,0.6)",
            pointerEvents: "none",
          }}
        >
          {item.letter}
        </motion.div>
      ))}
    </Box>
  );
}

const LoginPage = () => {
  const { message, loading, loginPlayer } = useLoginPlayer();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const goToRegister = () => {
    navigate("/register");
  };
  const goToHomePage = useCallback(() => {
    navigate("/homepage");
  }, [navigate]);

  // state
  const [formLogin, setFormLogin] = useState<LoginForm>({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // clearBackendMessage();

    // // ล้าง error เฉพาะ field นี้
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setFormLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // error message from backend
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (!message) return;
    setErrors((prev) => ({
      ...prev,
      username: message.includes("username") ? message : undefined,
      password: message.includes("password") ? message : undefined,
    }));
  }, [message]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formLogin.username.trim()) {
      newErrors.username = "Please enter your username";
    }
    if (!formLogin.password.trim()) {
      newErrors.password = "Please enter your password";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // clear form
  const clearForm = () => {
    setFormLogin({
      username: "",
      password: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await loginPlayer(formLogin.username, formLogin.password);

    goToHomePage();
  };

  //loding

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
      radial-gradient(circle at top, #2a1f3f, #0b1020 60%)
    `,
        overflow: "hidden",
      }}
    >
      <FloatingLetters />
      {/* <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        
      </motion.div> */}
      
      <PaperFrame>
        {/* <Box
          sx={{
            width: 520,
            bgcolor: "#f5ecd8", // กระดาษ
            p: 5,
            border: "4px solid #6b4a2d", // ขอบ pixel
            boxShadow: "8px 8px 0 #4a2f18", // เงาแข็ง RPG
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            position: "relative",

            // glow เวทเบาๆ
            "&::before": {
              content: '""',
              position: "absolute",
              inset: -6,
              border: "2px solid rgba(180,160,255,0.3)",
              pointerEvents: "none",
            },
          }}
        > */}
        <Box sx={{ position: "absolute", top: -10, left: -10 }}>⭐</Box>
        <Typography
          sx={{
            fontSize: "48px",
            // fontWeight: "bold",
            fontFamily: "Fantasy",
          }}
        >
          Login
        </Typography>

        <FormTextField
          label="Username"
          name="username"
          isPassword={false}
          value={formLogin.username}
          onChange={handleInputChange}
          errorMessage={errors.username}
          helperText={errors.username}
        />
        <FormTextField
          label="Password"
          name="password"
          showPassword={showPassword}
          isPassword={true}
          onClick={handleClickShowPassword}
          value={formLogin.password}
          onChange={handleInputChange}
          errorMessage={errors.password}
          helperText={errors.password}
        />

        <Button
          fullWidth
          onClick={handleSubmit}
          sx={{
            mt: 2,
            bgcolor: "black",
            color: "white",
            borderRadius: "15px",
            fontSize: "24px",
            fontFamily: "'Concert One'",
            "&:hover": { bgcolor: "#333" },
          }}
        >
          Login
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "80%",
            mt: 1,
          }}
        >
          <Typography sx={{ fontFamily: "'Concert One'", fontSize: "16px" }}>
            Don’t have an account ?
          </Typography>

          <Typography
            sx={{
              fontFamily: "'Concert One'",
              fontSize: "16px",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={goToRegister}
          >
            register
          </Typography>
        </Box>
        {/* </Box> */}
      </PaperFrame>
    </Box>
  );
};

export default LoginPage;
