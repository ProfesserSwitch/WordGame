import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Tooltip,
  Popover,
  Avatar,
  IconButton,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import sword from "../../assets/icons/sword.svg";
import store from "../../assets/icons/store.svg";
import monster from "../../assets/icons/monster.svg";
import quest from "../../assets/icons/quest.svg";
import SettingsFeature from "../../pages/HomePage/feature/SettingFeature";
import taro from "../../assets/icons/taro.jpg";
import coin from "../../assets/icons/coin.svg";

type TabValue = "shop" | "quest" | "monster" | "adventure" | false;

type CenterTab = {
  value: Exclude<TabValue, false>;
  label: string;
  icon: string;
  path: string;
  big?: boolean;
};

const centerTabs: CenterTab[] = [
  { value: "shop", label: "Shop", icon: store, path: "/shop" },
  {
    value: "adventure",
    label: "Adventure",
    icon: sword,
    path: "/adventure",
    big: true,
  },
  // { value: "quest", label: "Quest", icon: quest, path: "/quest" },
  {
    value: "monster",
    label: "Monster Diary",
    icon: monster,
    path: "/monster",
  },
];

const tabStyle = {
  minWidth: { xs: 20, sm: 40, md: 72 },
  minHeight: 48,
  borderRadius: "10px",
  color: "#3e2615",
  transition: "all 0.15s ease-out",

  "&.Mui-selected": {
    backgroundColor: "#c5c6acff",
  },

  "&:hover": {
    backgroundColor: "#c5c6acff",
  },
};

type AppBarProps = {
  username: string | undefined;
}
const GameAppBar = ({username}:AppBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // 🔹 หา tab ที่ตรงกับ path ปัจจุบัน
  const activeTab: TabValue =
    centerTabs.find((tab) => location.pathname.startsWith(tab.path))?.value ??
    false;

  const handleChange = (_: React.SyntheticEvent, value: TabValue) => {
    const target = centerTabs.find((t) => t.value === value);
    if (target) navigate(target.path);
  };

  return (
    // <AppBar
    //   position="static"
    //   sx={{
    //     backgroundColor: "#E8E9CD",
    //     borderBottom: "10px solid #694037",
    //     boxShadow: "0 6px 0 #3e2615",
    //   }}
    // >
    //   <Toolbar sx={{ minHeight: 80, height: 80 }}>
    //     {/* 🔹 LEFT : LOGO */}
    //     <Box
    //       sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2, ml: 2 }}
    //     >
    //       <Typography
    //         onClick={() => navigate("/")}
    //         sx={{
    //           fontFamily: "'Press Start 2P'",
    //           fontSize: { xs: 20, sm: 20, md: 23 },
    //           cursor: "pointer",
    //           color: "#3e2615",
    //           textShadow: "2px 2px 0 #fff3cf",
    //         }}
    //       >
    //         Spell ★ Spell
    //       </Typography>

    //     </Box>

    //     {/* 🔸 CENTER : TABS */}
    //     <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
    //       <Tabs
    //         value={activeTab}
    //         onChange={handleChange}
    //         TabIndicatorProps={{
    //           sx: {
    //             height: 4,
    //             borderRadius: 2,
    //             backgroundColor: "#5c3a1e",
    //           },
    //         }}
    //         sx={{
    //           minHeight: 48,
    //           "& .MuiTabs-flexContainer": { gap: 1 },
    //         }}
    //       >
    //         {centerTabs.map((tab) => (
    //           <Tab
    //             key={tab.value}
    //             value={tab.value}
    //             icon={
    //               <Tooltip title={tab.label}>
    //                 <Box
    //                   component="img"
    //                   src={tab.icon}
    //                   sx={{
    //                     width: {
    //                       xs: tab.big ? 25 : 20,
    //                       sm: tab.big ? 30 : 20,
    //                       md: tab.big ? 40 : 28,
    //                     },
    //                     imageRendering: "pixelated", // ฟิลเกม pixel
    //                     /* ค่าเริ่มต้น (ยังไม่ selected) */
    //                     filter: "brightness(0.7) saturate(0.6)",
    //                     opacity: 0.7,
    //                     transition: "all 0.2s ease",

    //                     /* ตอนถูกเลือก */
    //                     ".Mui-selected &": {
    //                       filter: "brightness(1.1) saturate(1)",
    //                       opacity: 1,
    //                     },
    //                   }}
    //                 />
    //               </Tooltip>
    //             }
    //             aria-label={tab.label}
    //             sx={tabStyle}
    //           />
    //         ))}
    //       </Tabs>
    //     </Box>

    //     {/* 🔹 RIGHT : SETTINGS */}
    //     <Box
    //       sx={{
    //         flex: 1,
    //         display: "flex",
    //         justifyContent: "flex-end",
    //         gap: 2,
    //         alignItems: "center",
    //       }}
    //     >
    //       {/* <Box
    //         onClick={(e) => setAnchorEl(e.currentTarget)}
    //         sx={{
    //           width: 44,
    //           height: 44,
    //           borderRadius: "50%",
    //           backgroundColor: "#E8E9CD",
    //           border: "3px solid #5c3a1e",
    //           display: "flex",
    //           alignItems: "center",
    //           justifyContent: "center",
    //           cursor: "pointer",
    //         }}
    //       >
    //         <SettingsIcon sx={{ color: "#3e2615" }} />
    //       </Box> */}
    //       {/* // profile icon เพิ่มเติม */}
    //       <Box
    //         sx={{
    //           position: "relative",
    //           display: "flex",
    //           alignItems: "center",
    //           pl: 4, // 👈 เผื่อที่ให้ icon
    //           pr: 2,
    //           py: 0.5,
    //           backgroundColor: "#ffffff",
    //           border: "3px solid #000",
    //           borderRadius: "15px",
    //           height: 25,
    //         }}
    //       >
    //         {/* 🪙 ICON ลอยทับเส้น */}
    //         <Box
    //           component="img"
    //           src={coin}
    //           sx={{
    //             position: "absolute",
    //             left: -14, // 👈 ดันออกนอกกล่อง
    //             width: 40,
    //             height: 40,
    //             borderRadius: "50%",
    //             backgroundColor: "inherit",
    //             // border: "3px solid #000",
    //             display: "flex",
    //             alignItems: "center",
    //             justifyContent: "center",
    //             fontSize: 16,
    //           }}
    //         />

    //         {/* 💰 MONEY */}
    //         <Typography
    //           sx={{
    //             fontFamily: "'Press Start 2P'",
    //             fontSize: 14,
    //             color: "rgba(0, 0, 0, 1)",
    //           }}
    //         >
    //           100000
    //         </Typography>
    //       </Box>

    //       <Box
    //         onClick={(e) => setAnchorEl(e.currentTarget)}
    //         sx={{
    //           width: 44,
    //           height: 44,
    //           borderRadius: "50%",
    //           backgroundColor: "#ffffffff",
    //           border: "4px solid #3e2615",
    //           display: "flex",
    //           alignItems: "center",
    //           justifyContent: "center",
    //           cursor: "pointer",
    //         }}
    //       >
    //          <Avatar
    //           alt="profile-player"
    //           src={taro}
    //           sx={{ width: 44, height: 44 }}
    //         />
    //       </Box>

    //       <Popover
    //         open={open}
    //         anchorEl={anchorEl}
    //         onClose={() => setAnchorEl(null)}
    //         anchorOrigin={{
    //           vertical: "bottom",
    //           horizontal: "right",
    //         }}
    //         transformOrigin={{
    //           vertical: "top",
    //           horizontal: "right",
    //         }}
    //         marginThreshold={16} // 👈 กันชนขอบจอ (สำคัญ)
    //         PaperProps={{
    //           sx: {
    //             borderRadius: "12px",
    //             border: "3px solid #5c3a1e",
    //             backgroundColor: "#feffeb",
    //             boxShadow: "4px 4px 0 #3e2615",
    //             maxWidth: "calc(100vw - 32px)", // 👈 กันจอล้น mobile
    //           },
    //         }}
    //       >
    //         <SettingsFeature onClose={() => setAnchorEl(null)} />
    //       </Popover>
    //     </Box>
    //   </Toolbar>
    // </AppBar>
    <AppBar
      position="static"
      // sx={{
      //   backgroundColor: "#E8E9CD",
      //   borderBottom: "10px solid #694037",
      //   boxShadow: "0 6px 0 #3e2615",
      // }}
      sx={{
        backgroundColor: "#0e0e1250",
      }}
    >
      <Toolbar sx={{ minHeight: 10, height: 10 ,}}>
        {/* 🔹 LEFT : LOGO */}
        <Box sx={{ flex: 1 , ml:2}}>
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {/* กล่องชื่อ */}
            <Box
              sx={{
                pl: "48px", // เว้นที่ให้ avatar
                pr: 5,
                py: 1,
                backgroundColor: "#E8E9CD",
                borderRadius: "15px",
                border: "4px solid #5A3A2E",
                boxShadow: "0 4px 0 #2b1a12",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: { xs: 8, md: 8 },
                  color: "#3e2615",
                  whiteSpace: "nowrap",
                }}
              >
                {username}
              </Typography>
            </Box>

            {/* Avatar ทับกล่อง */}
            <Box
              sx={{
                position: "absolute",
                left: "-18px",
                width: 35,
                height: 35,
                borderRadius: "50%",
                backgroundColor: "#E8E9CD",
                border: "4px solid #5A3A2E",
                boxShadow: "0 4px 0 #2b1a12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar
                src={taro}
                alt="profile-player"
                sx={{
                  width: 35,
                  height: 35,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* 🔹 RIGHT : SETTINGS */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            alignItems: "center",
          }}
        >

          {/* //  icon เพิ่มเติม */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              pl: 4, // 👈 เผื่อที่ให้ icon
              pr: 2,
              py: 1,
              backgroundColor: "#E8E9CD",
              border: "4px solid #5A3A2E",
              borderRadius: "15px",
            }}
          >
            {/* 🪙 ICON ลอยทับเส้น */}
            <Box
              component="img"
              src={coin}
              sx={{
                position: "absolute",
                left: -14, // 👈 ดันออกนอกกล่อง
                width: 35,
                height: 35,
                borderRadius: "50%",
                backgroundColor: "#E8E9CD",
                // border: "3px solid #3e2615",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            />

            {/* 💰 MONEY */}
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: { xs: 8, md: 8 },
                color: "rgba(0, 0, 0, 1)",
              }}
            >
              100000
            </Typography>
          </Box>

          {/* <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#E8E9CD",
              border: "4px solid #5A3A2E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <SettingsIcon sx={{ color: "#3e2615" }} />
          </Box>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            marginThreshold={16} // 👈 กันชนขอบจอ (สำคัญ)
            PaperProps={{
              sx: {
                borderRadius: "12px",
                border: "3px solid #5c3a1e",
                backgroundColor: "#feffeb",
                boxShadow: "4px 4px 0 #3e2615",
                maxWidth: "calc(100vw - 32px)", // 👈 กันจอล้น mobile
              },
            }}
          >
            <SettingsFeature onClose={() => setAnchorEl(null)} />
          </Popover> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GameAppBar;
