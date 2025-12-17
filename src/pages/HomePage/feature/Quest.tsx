import { Box } from "@mui/material";
const Quest = () => {
    return  <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
    
            transform: "translate(-50%, -50%)",
            background: "#feffebff",
            // borderRadius: 2,
            border: "20px solid #000",
            padding: 4,
            // boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 9999,
            height: "400px",
            width: { xs: "80%", sm: "80%", md: "50%", lg: "80%" },
            // pr:
            // overflowY: "auto",
          }}
        >
          
          {/* <Button onClick={() => navigate("/battle")}>play</Button> */}
        </Box>
};
export default Quest;