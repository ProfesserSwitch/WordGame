import { Box, Typography, Button } from "@mui/material";
import { FormTextField } from "../../components/FormTextField";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginPlayer } from "./hook/useLoginPlayer";
import { useLoadData } from "./hook/useLoadData";
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
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        sx={{
          width: 550,
          bgcolor: "#D9D9D9",
          p: 5,
          borderRadius: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "48px",
            fontWeight: "bold",
            fontFamily: "'Concert One', sans-serif",
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
            }}
            onClick={goToRegister}
          >
            register
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
