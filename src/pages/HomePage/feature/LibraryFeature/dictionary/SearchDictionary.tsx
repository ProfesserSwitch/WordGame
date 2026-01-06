import { Box, TextField, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type SearchProps = {
  value?: string;
  handleSearchChange: () => void;
  letter: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
};

export const SearchDictionary = ({
  value,
  setSearchInput,
  handleSearchChange,
  letter,
  setSearchText,
}: SearchProps) => {
  return (
    <Box sx={{ mb: 1 }}>
      <TextField
        fullWidth
        value={value}
        onChange={(e) => {
          const v = e.target.value.toLowerCase();
          setSearchInput(v);
          
          if (v.trim() === "") {
            setSearchText("");
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && handleSearchChange()) {
            handleSearchChange();
          }
        }}
        placeholder="Search word..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ color: "#d6b46a" }} />
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position="end">
              <Typography
                sx={{
                  color: "#fffbe6",
                  fontFamily: `"Press Start 2P"`,
                  fontSize: 14,
                }}
              >
                {letter}
              </Typography>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "40px",
          },
          "& .MuiInputBase-root": {
            fontFamily: `"Press Start 2P"`,
            fontSize: 14,
            backgroundColor: "#2a160f",
            color: "#fffbe6",
            border: "3px solid #7a1f1f",
          },
          "& input::placeholder": {
            color: "#c9b89a",
            fontSize: 9,
            pl: 1,
            opacity: 1,
          },
          "& fieldset": {
            border: "none",
          },
        }}
      />
    </Box>
  );
};
