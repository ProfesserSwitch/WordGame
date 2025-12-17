import {
  Box,
  Typography,
  Grid,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { SearchComponent } from "../components/SearchComponent";

type SpellCardProps = {
  name: string;
  price: number;
  icon?: React.ReactNode;
};

export const SpellCard = ({ name, price, icon }: SpellCardProps) => {
  return (
    <Box
      sx={{
        height: 140,
        borderRadius: "10px",
        backgroundColor: "#f2e1b8",
        border: "4px solid #5c3a1e",

        boxShadow:
          "inset 0 2px 0 #fff3cf, 0 6px 0 #3e2615",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1,
        cursor: "pointer",

        transition: "all 0.15s ease-out",

        "&:hover": {
          transform: "translateY(-4px) scale(1.03)",
          boxShadow:
            "inset 0 2px 0 #fff3cf, 0 10px 0 #3e2615, 0 0 12px rgba(255,215,100,0.6)",
        },

        "&:active": {
          transform: "translateY(0)",
          boxShadow:
            "inset 0 2px 0 #fff3cf, 0 4px 0 #3e2615",
        },
      }}
    >
      {/* ICON */}
      <Box sx={{ fontSize: 34 }}>{icon}</Box>

      {/* NAME */}
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
          color: "#3e2615",
        }}
      >
        {name}
      </Typography>

      {/* PRICE TAG */}
      <Box
        sx={{
          backgroundColor: "#d4a24f",
          border: "2px solid #3e2615",
          borderRadius: "6px",
          px: 1,
          py: "2px",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          boxShadow: "0 2px 0 #3e2615",
        }}
      >
        <Typography fontSize={12} fontWeight="bold">
          {price}
        </Typography>
        <Typography fontSize={12}>💰</Typography>
      </Box>
    </Box>
  );
};

const SearchAndFilterSection = () => {
  return (
    <>
      <Box sx={{ width: "70%", mr: 2 }}>
        <SearchComponent />
      </Box>
      <Box sx={{ width: "30%" }}>
        {/* <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            // value={age}
            label="Type"
            sx={{
              height: "40px",
              backgroundColor: "#ffffff",
             
              

              // "& .MuiSelect-select": {
              //   display: "flex",
              //   alignItems: "center",
              //   height: "100%",
              //   paddingY: 0,
              // },
            }}
            // onChange={handleChange}
          >
          
          </Select>
        </FormControl> */}
        <SearchComponent />
      </Box>
    </>
  );
};

const ListSection = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(4, 1fr)",
          md: "repeat(6, 1fr)",
        }, // ⭐ 6 ต่อแถว
        gap: 1,
        flex: 1,
        // overflowY: "auto",

        p: 1,
        pr: 1,
      }}
    >
      {Array.from({ length: 20 }).map((_, index) => (
       <SpellCard
          key={index}
          name={`Spell ${index + 1}`}
          price={40}
          icon={index % 2 === 0 ? "🔥" : "❄️"}
        />
      ))}
    </Box>
  );
};

const ShopSpellFeature = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",

        transform: "translate(-50%, -50%)",
        // background: "#feffebff",
        // border: "20px solid #000000ff",
        padding: 4,
        zIndex: 9999,
        height: "400px",
        width: { xs: "80%", sm: "80%", md: "80%", lg: "60%" },
      }}
    >
      <Box sx={{ display: "flex", width: "100%", mb: 2, padding: 1 }}>
        <SearchAndFilterSection />
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "calc(100% - 60px)",
          // backgroundColor: "blue",
          overflow: "auto",
          p:1
        }}
      >
        <ListSection />
      </Box>

      {/* <Button onClick={() => navigate("/battle")}>play</Button> */}
    </Box>
  );
};

export default ShopSpellFeature;
