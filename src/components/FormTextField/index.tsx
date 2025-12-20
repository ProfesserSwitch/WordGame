import {
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type FormTextFieldProps = {
  label: string;
  name?: string;
  showPassword?: boolean;
  isPassword?: boolean;
  onClick?: () => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  helperText?: string;
};

export const FormTextField = ({
  label,
  name,
  showPassword,
  isPassword,
  onClick,
  value,
  onChange,
  errorMessage,
  helperText,
}: FormTextFieldProps) => {
  return (
    <>
      {isPassword ? (
        <Box sx={{ width: "100%" }}>
          <Typography
            sx={{
              fontFamily: "'Concert One'",
              fontSize: "20px",
            }}
          >
            {label}
          </Typography>

          <TextField
            fullWidth
            size="small"
            type={showPassword ? "text" : "password"}
            value={value}
            name={name}
            onChange={onChange}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 45,
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 1)",
                "& fieldset": {
                  border: "3px solid #ffffff",
                },
                "&:hover fieldset": {
                  borderColor: "#8c6565ff", // hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8c6565ff", // ตอน focus
                  borderWidth: 3,
                },
              },
            }}
            // sx={{
            //   backgroundColor: "white",
            //   borderRadius: "15px",
            //   "& fieldset": { borderRadius: "15px" },
            // }}

            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onClick}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!errorMessage}
            helperText={helperText}
          />
        </Box>
      ) : (
        <Box sx={{ width: "100%" }}>
          <Typography
            sx={{
              fontFamily: "'Concert One'",
              fontSize: "20px",
            }}
          >
            {label}
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={value}
            name={name}
            onChange={onChange}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 45,
                maxHeight:45,
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 1)",
                "& fieldset": {
                  border: "3px solid #ffffff",
                },
                "&:hover fieldset": {
                  borderColor: "#8c6565ff", // hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8c6565ff", // ตอน focus
                  borderWidth: 3,
                },
              },
            }}
            error={!!errorMessage}
            helperText={helperText}
          />
        </Box>
      )}
    </>
  );
};
