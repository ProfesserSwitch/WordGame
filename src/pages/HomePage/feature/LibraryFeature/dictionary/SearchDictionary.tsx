import { Box, TextField, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type SearchProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchChange: () => void;
  letter: string;
};

export const SearchDictionary = ({
  value,
  onChange,
  handleSearchChange,
  letter,
}: SearchProps) => {
  return (
    <Box sx={{ mb: 1 }}>
      <TextField
        fullWidth
        value={value}
        onChange={onChange}
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
            pl:1,
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
