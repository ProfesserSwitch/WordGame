
import { useState } from "react";
import GameAppBar from "../../components/AppBar";
import AdvantureFeature from "./feature/AdvantureFeature";
import ShopSpellFeature from "./feature/ShopSpellFeature";
const HomePage = () => {
  const [activeTab, setActiveTab] = useState<null | "adventure" | "shop" | "settings">(null);

  return (
    <>
      <GameAppBar onSelectTab={setActiveTab} />

      <h1>Scene</h1>

      {activeTab === "adventure" && <AdvantureFeature />}
      {activeTab === "shop" && <ShopSpellFeature />}
      {/* {activeTab === "settings" && <SettingsFeature />}  */}
    </>
  );
};

export default HomePage;
