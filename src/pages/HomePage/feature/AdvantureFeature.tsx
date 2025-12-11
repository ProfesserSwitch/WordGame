import { useNavigate } from "react-router-dom"; //เปลี่ยน หน้า
import { memo } from "react";
import { DialogComponent } from "../../../components/Dialog";
import { Box , Button} from "@mui/material";
import App from "../../BattlePage/App.tsx";

const AdvantureFeature = () => {
    const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fff",
        borderRadius: 2,
        padding: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      <h2>Adventure Coming Soon!</h2>
      <Button onClick={() => navigate("/battle")}>play</Button>
    </Box>
  );
};

export default AdvantureFeature;
