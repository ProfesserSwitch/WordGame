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
import monster from "../../assets/icons/monster.svg";
import quest from "../../assets/icons/quest.svg";
type AppBarProps = {
  onSelectTab: (tabName: "adventure" | "quest" | "shop" | "monster" | "settings") => void;
};

const GameAppBar = ({ onSelectTab }: AppBarProps) => {
  return (
    <AppBar
      position="static"
      sx={{
        top: 0,
        left: 0,
        background: "rgba(255, 255, 255, 0)",
        // backdropFilter: "blur(8px)",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: "Fantasy" ,color:"#000", fontSize:30}}>
          Spell ★ Spell
        </Typography>


        <Tooltip title="Shop">
          <IconButton color="inherit" onClick={() => onSelectTab("shop")}>
            <img src={store} style={{ width: 34, height: 34 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Quest">
          <IconButton color="inherit" onClick={() => onSelectTab("quest")}>
            <img src={quest} style={{ width: 28, height: 28 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Monster Diary">
          <IconButton color="inherit" onClick={() => onSelectTab("monster")}>
            <img src={monster} style={{ width: 34, height: 34 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Adventure">
          <IconButton color="inherit" onClick={() => onSelectTab("adventure")}>
            <img src={sword} style={{ width: 34, height: 34 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton color="inherit" onClick={() => onSelectTab("settings")}>
            <SettingsIcon fontSize="large" sx={{ color: "black" }} />
          </IconButton>
        </Tooltip>

      </Toolbar>
    </AppBar>
  );
};


export default GameAppBar;
