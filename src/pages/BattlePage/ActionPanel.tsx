import React from "react";
import { AttackBox } from "./components/AttackBox";
import { LetterInventory } from "./components/LetterInventory";
import { WordSlots } from "./components/WordSlots";
import { ResetButton } from "./components/ResetButton";
import { Bag } from "./components/Bag";

export const ActionPanel: React.FC = () => {
  return (
    <div
      style={{
        height: "200px",
        background: "#222",
        borderTop: "4px solid black",
        display: "flex",
        padding: "10px",
        gap: "20px",
        justifyContent: "space-around",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "150px", // ช่องปุ่มใหญ่ทั้งหมดกว้างเท่าไหร่ก็ใส่ตรงนี้
          height: "100%", // ให้เต็ม panel
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <AttackBox />
        </div>
        <div style={{ flex: 1 }}>
          <ResetButton />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center", // <<< ทำให้ WordSlots อยู่ตรงกลาง
        //   justifyContent: "center",
        }}
      >
        <WordSlots />
        <LetterInventory />
      </div>

      <Bag />
    </div>
  );
};
