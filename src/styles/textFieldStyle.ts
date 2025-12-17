// import { makeStyles } from "@mui/material";
import { makeStyles } from "@mui/styles";

export const useTextFieldStyles = makeStyles((theme) => ({
    TextField: {
        '& .MuiOutlinedInput-root': {
            fontSize: '14px',
            borderRadius: '10px',
            height: 35,
            maxHeight: 100,
            maxWidth: "100vw",
            "& fieldset": {
                borderColor : "#000000",
        }
    
    }}
}));
            