import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import sword from "../../assets/icons/sword.svg";
import store from "../../assets/icons/store.svg";

type AppBarProps = {
  onSelectTab: (tabName: "adventure" | "shop" | "settings") => void;
};

const GameAppBar = ({ onSelectTab }: AppBarProps) => {
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
          Spell & Spell
        </Typography>

        <Tooltip title="Adventure">
          <IconButton color="inherit" onClick={() => onSelectTab("adventure")}>
            <img src={sword} style={{ width: 34, height: 34 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Shop">
          <IconButton color="inherit" onClick={() => onSelectTab("shop")}>
            <img src={store} style={{ width: 34, height: 34 }} />
          </IconButton>
        </Tooltip>

        <IconButton color="inherit" onClick={() => onSelectTab("settings")}>
          <SettingsIcon />
        </IconButton>

      </Toolbar>
    </AppBar>
  );
};


export default GameAppBar;
