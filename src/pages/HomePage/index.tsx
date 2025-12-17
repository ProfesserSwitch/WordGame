
import { useState } from "react";
import { DataFlowProvider } from "./context/DataFlowContext";
import GameAppBar from "../../components/AppBar";
import AdvantureFeature from "./feature/AdvantureFeature";
import ShopSpellFeature from "./feature/ShopSpellFeature";
import MonsterLibrary from "./feature/MonsterLibrary";
import Quest from "./feature/Quest";

const HomePageInner = () => {
  const [activeTab, setActiveTab] = useState<null |"home"| "shop" |"quest"| "monster" | "adventure" | "settings">(null);

  return (
    <>
      {/* <GameAppBar onSelectTab={setActiveTab} /> */}

     
      {activeTab === "shop" && <ShopSpellFeature />}
      {activeTab === "quest" && <Quest />}
      {activeTab === "monster" && <MonsterLibrary />}
      {activeTab === "adventure" && <AdvantureFeature />}
      
      {/* {activeTab === "settings" && <SettingsFeature />}  */}
    </>
  );
};

const HomePage = () => {
  return (
    <DataFlowProvider>
      <HomePageInner />
    </DataFlowProvider>
  );
  
};

export default HomePage;
