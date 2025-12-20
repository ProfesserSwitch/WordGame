import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { FormTextField } from "../../components/FormTextField";
import { useNavigate } from "react-router-dom";
import { useRegisPlayer } from "./hook/useRegisPlayer";
interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}
const RegisterPage = () => {
  const { registerPlayer, message, clearBackendMessage } = useRegisPlayer();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [confirmsPassword, setConfirmPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleClickConfirmPassword = () => {
    setConfirmPassword(!confirmsPassword);
  };

  // state สำหรับเก็บค่าฟอร์ม
  const [formRegister, setFormRegister] = useState<RegisterForm>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  //errior state
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  //error message from backend
  useEffect(() => {
    if (!message) return;

    setErrors((prev) => ({
      ...prev,
      username: message.includes("username") ? message : undefined,
      email: message.includes("email") ? message : undefined,
    }));
  }, [message]);

  //input change function
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    clearBackendMessage();

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setFormRegister((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // validate function
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formRegister.username.trim()) {
      newErrors.username = "Please enter your username";
    }

    if (!formRegister.email.trim()) {
      newErrors.email = "Please enter your email";
    }

    if (!formRegister.password) {
      newErrors.password = "Please enter your password";
    } else if (formRegister.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องอย่างน้อย 6 ตัว";
    }

    if (formRegister.password !== formRegister.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // clear form function
  const clearForm = () => {
    setFormRegister({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  // submit function
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    registerPlayer(
      formRegister.email,
      formRegister.username,
      formRegister.password
    );

    // clearForm();
    // navigate("/");
  };

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
      {/* กล่องฟอร์มตรงกลาง */}
      {/* <FormLogin /> */}
      <Box
        sx={{
          width: 550,
          bgcolor: "#D9D9D9",
          p: 5,
          borderRadius: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "48px",
            // fontWeight: "bold",
            fontFamily: "Fantasy"
          }}
        >
          Register
        </Typography>

        <FormTextField
          label="Username"
          name="username"
          isPassword={false}
          value={formRegister.username}
          onChange={handleInputChange}
          errorMessage={errors.username}
          helperText={errors.username}
        />
        <FormTextField
          label="Email"
          name="email"
          isPassword={false}
          value={formRegister.email}
          onChange={handleInputChange}
          errorMessage={errors.email}
          helperText={errors.email}
        />
        <FormTextField
          label="Password"
          name="password"
          showPassword={showPassword}
          isPassword={true}
          onClick={handleClickShowPassword}
          value={formRegister.password}
          onChange={handleInputChange}
          errorMessage={errors.password}
          helperText={errors.password}
        />
        <FormTextField
          label="Confirm Password"
          name="confirmPassword"
          showPassword={confirmsPassword}
          isPassword={true}
          onClick={handleClickConfirmPassword}
          value={formRegister.confirmPassword}
          onChange={handleInputChange}
          errorMessage={errors.confirmPassword}
          helperText={errors.confirmPassword}
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
          Register
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "80%",
            mt: 2,
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
              // ":hover":co
            }}
            onClick={() => navigate("/")}
          >
            Login
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
