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
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" ,gap:5}}
    >
      <Typography
        align="center"
        sx={{
          fontSize: "79px",
          // fontWeight: "bold",
          fontFamily: "'Press Start 2P'",
          color: "#E8E9CD",
          letterSpacing: "2px",
        }}
      >
        Login
      </Typography>{" "}
      <PaperFrame>
        {/* <Box sx={{ position: "absolute", top: -10, left: -10 }}>⭐</Box> */}

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
            mb: 2,
            bgcolor: "#694037",
            color: "#E8E9CD",
            borderRadius: "15px",
            fontSize: "20px",
            fontFamily: "'Press Start 2P'",
            "&:hover": { bgcolor: "#4f2e27ff" },
          }}
        >
          Login
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            mt: 1,
          }}
        >
          <Typography sx={{ fontFamily: "'Press Start 2P'", fontSize: "10px" }}>
            Don’t have an account ?
          </Typography>

          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: "10px",
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
