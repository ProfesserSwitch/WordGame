import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { DataFlowProvider } from "./context/DataFlowContext";
import GameAppBar from "../../components/AppBar";
import AdvantureFeature from "./feature/AdvantureFeature";
import ShopSpellFeature from "./feature/ShopSpellFeature";
import MonsterLibrary from "./feature/MonsterLibrary";
import Quest from "./feature/Quest";
import { Loading } from "../../components/Loading/Loading";
import { useLoadData } from "../LoginPage/hook/useLoadData";
// const HomePageInner = () => {
//   const [activeTab, setActiveTab] = useState<null | "shop" |"quest"| "monster" | "adventure" | "settings">(null);

//   return (
//     <>
//       <GameAppBar onSelectTab={setActiveTab} />

//       {activeTab === "shop" && <ShopSpellFeature />}
//       {activeTab === "quest" && <Quest />}
//       {activeTab === "monster" && <MonsterLibrary />}
//       {activeTab === "adventure" && <AdvantureFeature />}

//       {/* {activeTab === "settings" && <SettingsFeature />}  */}
//     </>
//   );
// };

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<
    null | "shop" | "quest" | "monster" | "adventure" | "settings"
  >(null);

  const { loading, fetchAllData } = useLoadData();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Loading />
      </Box>
    );
  };
  
  return (
    <>
      <GameAppBar onSelectTab={setActiveTab} />

      {activeTab === "shop" && <ShopSpellFeature />}
      {activeTab === "quest" && <Quest />}
      {activeTab === "monster" && <MonsterLibrary />}
      {activeTab === "adventure" && <AdvantureFeature />}
      {/* {activeTab === "settings" && <SettingsFeature />}  */}
    </>
  );
};

export default HomePage;
