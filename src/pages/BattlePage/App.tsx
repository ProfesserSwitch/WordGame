import React from "react";
import { GameCanvas } from "./GameCanvas";
import { ActionPanel } from "./ActionPanel";
import { Grid } from "@mui/material";
function GameApp() {
  return (
   <>

        <GameCanvas />

        <ActionPanel />


    {/* <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <GameCanvas />
      <ActionPanel />
    </div> */}
   </>
  );
}

export default GameApp;
