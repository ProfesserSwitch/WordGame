import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hook/auth";
import { useState, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import { logout } from "../../../store/reducers/authentication";
// ขอทำ logout ก่อนต่อยจัด ิิิ
const SettingsFeature = ({onClose}: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate("/login");
  };

  return (
    <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            fontFamily: "'Concert One'",
            fontSize: 16,
          }}
        >
          🚪 Logout
        </Button>
    </Box>
  );
};

export default SettingsFeature;
