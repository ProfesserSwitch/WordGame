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
  helperText
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
            type={showPassword ? "text" : "password"}
            value={value}
            name={name}
            onChange={onChange}
            variant="outlined"
            sx={{
              backgroundColor: "white",
              borderRadius: "15px",
              "& fieldset": { borderRadius: "15px" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onClick}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
            value={value}
            name={name}
            onChange={onChange}
            variant="outlined"
            sx={{
              backgroundColor: "white",
              borderRadius: "15px",
              "& fieldset": { borderRadius: "15px" },
            }}
             error={!!errorMessage}
            helperText={helperText}
          />
        </Box>
      )}
    </>
  );
};
