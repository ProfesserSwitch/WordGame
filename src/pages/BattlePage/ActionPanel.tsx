import React, { useEffect, useState } from "react";
import { AttackBox } from "./components/AttackBox";
import { LetterInventory } from "./components/LetterInventory";
import { WordSlots } from "./components/WordSlots";
import { ResetButton } from "./components/ResetButton";
import { Bag } from "./components/Bag";

const WORD_POOL = ["can"]; // ใส่เพิ่มได้
const INITIAL_LETTERS = ["A", "B", "C", "D", "N", "G", "U", "C", "D", "N", "G", "U"];

export const ActionPanel: React.FC = () => {
  const [targetWord, setTargetWord] = useState(
    WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
  );

  const [letters, setLetters] = useState<string[]>(INITIAL_LETTERS);

const rerollWord = () => {
  setTargetWord(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
  setLetters(INITIAL_LETTERS); // เติมตัวอักษรกลับหลังโจมตี
};


  // ✅ ลบตัวอักษรออกจากแถวล่าง เมื่อถูกใช้ไปวางข้างบน
const consumeLetter = (index: number) => {
    setLetters((prev) => prev.filter((_, i) => i !== index));
  };

useEffect(() => {
  const refill = () => setLetters(INITIAL_LETTERS);

  window.addEventListener("resetWordSlots", refill);
  return () => window.removeEventListener("resetWordSlots", refill);
}, []);


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
          width: "150px",
          height: "100%",
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <AttackBox targetWord={targetWord} onAfterAttack={rerollWord} />
        </div>
        <div style={{ flex: 1 }}>
          <ResetButton />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <div style={{ color: "white", fontSize: 18 }}>
          Target: <b style={{ color: "#ffd55e" }}>{targetWord.toUpperCase()}</b>
        </div>

        {/* ✅ ส่ง callback ให้ WordSlots ลบตัวอักษรจาก inventory */}
        <WordSlots onConsumeLetter={consumeLetter} />

        {/* ✅ ส่ง letters จาก state เข้า inventory */}
        <LetterInventory letters={letters} />
      </div>

      <Bag />
    </div>
  );
};
