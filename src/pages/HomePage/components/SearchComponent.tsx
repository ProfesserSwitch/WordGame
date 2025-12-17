import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const SearchComponent = () => {
  return (
    <TextField
      placeholder="Search spell..."
      variant="outlined"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{
                fontSize: 20,
                color: "#5c3a1e", // น้ำตาลไม้
              }}
            />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 42,
          fontSize: "14px",
          backgroundColor: "#f5e6c8", // สีไม้สว่าง
          borderRadius: "6px",

          /* 🌲 WOOD FRAME */
          border: "3px solid #5c3a1e",
          boxShadow: "inset 0 2px 0 #e7d3a1, 0 4px 0 #3e2615",

          transition: "all 0.15s ease-out",

          "& fieldset": {
            border: "none", // ใช้ border เอง
          },

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "inset 0 2px 0 #e7d3a1, 0 6px 0 #3e2615",
          },

          "&.Mui-focused": {
            transform: "translateY(-2px)",
            boxShadow:
              "inset 0 2px 0 #fff1c1, 0 6px 0 #3e2615, 0 0 0 2px #c99a3a",
          },
        },

        "& input": {
          fontWeight: "bold",
          color: "#3e2615",
        },

        "& input::placeholder": {
          color: "#6b4a2d",
          opacity: 0.8,
        },
      }}
    />
  );
};
