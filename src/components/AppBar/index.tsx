import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';

const GameAppBar = () => {
  console.log("Render AppBar");
  return (
    <AppBar
      position="static"
      sx={{
        top: 0,
        left: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Punchii
        </Typography>

        <IconButton color="inherit">
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default GameAppBar;
 
    

