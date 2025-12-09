import { useNavigate } from "react-router-dom"; //เปลี่ยน หน้า

import { Button } from "@mui/material";
const LoginPage = () => {
  console.log("Login Page");
  const navigate = useNavigate();
  return (
    <>
      <h1>Login Page</h1>
      <Button onClick={() => navigate("/battle")}>gooooooo</Button>
    </>
  );
};
export default LoginPage;
