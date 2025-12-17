import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import sword from "../../assets/icons/sword.svg";
import store from "../../assets/icons/store.svg";
import monster from "../../assets/icons/monster.svg";
import quest from "../../assets/icons/quest.svg";
type AppBarProps = {
  onSelectTab: (
    tabName:
      | "home"
      | "adventure"
      | "quest"
      | "shop"
      | "monster"
      | "settings"
      | false
  ) => void;
};

type TabValue = "shop" | "quest" | "monster" | "adventure" | false;

type CenterTab = {
  value: "shop" | "quest" | "monster" | "adventure";
  label: string;
  icon: string;
};

const centerTabs: CenterTab[] = [
  {
    value: "shop",
    label: "Shop",
    icon: store,
  },
  {
    value: "quest",
    label: "Quest",
    icon: quest,
  },
  {
    value: "monster",
    label: "Monster Diary",
    icon: monster,
  },
  {
    value: "adventure",
    label: "Adventure",
    icon: sword,
  },
];

const tabStyle = {
  minWidth: 72,
  minHeight: 48,
  borderRadius: "10px",
  color: "#3e2615",
  transition: "all 0.15s ease-out",

  "&.Mui-selected": {
    backgroundColor: "#f5e6c8",
  },

  "&:hover": {
    backgroundColor: "#f0ddb0",
  },
};

const GameAppBar = ({ onSelectTab }: AppBarProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>(false);

  const handleChange = (_: React.SyntheticEvent, value: TabValue) => {
    setActiveTab(value);
    onSelectTab(value);
  };

  const handleSettingsClick = () => {
    setActiveTab(false);
    onSelectTab("settings");
  };
  const handleHomeClick = () => {
    setActiveTab(false);
    onSelectTab("home");
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "#e6d3a3",
        borderBottom: "6px solid #5c3a1e",
        boxShadow: "0 6px 0 #3e2615",
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* 🔹 LEFT : LOGO */}
        <Box sx={{ flex: 1 }}>
          <Typography
            onClick={handleHomeClick}
            sx={{
              fontFamily: "Fantasy",
              fontSize: 28,
              cursor: "pointer",
              color: "#3e2615",
              textShadow: "2px 2px 0 #fff3cf",
            }}
          >
            Spell ★ Spell
          </Typography>
        </Box>

        {/* 🔸 CENTER : TABS (เหมือน Facebook) */}
        <Box sx={{ flex: 2, display: "flex", justifyContent: "center" }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            TabIndicatorProps={{
              sx: {
                height: 4,
                borderRadius: 2,
                backgroundColor: "#5c3a1e",
              },
            }}
            sx={{
              minHeight: 48,
              "& .MuiTabs-flexContainer": {
                gap: 1,
              },
            }}
          >
            {centerTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={
                  <Tooltip title={tab.label}>
                    <Box component="span">
                      <img src={tab.icon} width={28} />
                    </Box>
                  </Tooltip>
                }
                aria-label={tab.label}
                sx={tabStyle}
              />
            ))}
          </Tabs>
        </Box>

        {/* 🔹 RIGHT : SETTINGS */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Box
            onClick={handleSettingsClick}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#f0ddb0",
              border: "3px solid #5c3a1e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 3px 0 #3e2615",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 5px 0 #3e2615",
              },
            }}
          >
            <SettingsIcon sx={{ color: "#3e2615" }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GameAppBar;
