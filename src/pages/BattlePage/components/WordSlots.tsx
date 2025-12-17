import React, { useEffect, useState } from "react";

type Props = {
  onConsumeLetter?: (index: number) => void; // ✅ ให้ ActionPanel ลบตัวอักษรจาก inventory
};

export const WordSlots: React.FC<Props> = ({ onConsumeLetter }) => {
  const [slots, setSlots] = useState<(string | null)[]>([
    null, null, null, null, null, null, null, null,
  ]);

  useEffect(() => {
    const reset = () => {
      setSlots([null, null, null, null, null, null, null, null]);
      (window as any).__currentWord = "";
    };

    window.addEventListener("resetWordSlots", reset);
    return () => window.removeEventListener("resetWordSlots", reset);
  }, []);

  const drop = (index: number, letter: string) => {
    const updated = [...slots];
    updated[index] = letter;
    setSlots(updated);

    const word = updated.filter(Boolean).join("");
    (window as any).__currentWord = word;
  };

  return (
    <>
      <style>
        {`
          .slot-box {
            transition: transform 0.15s ease;
          }

          .slot-box:hover {
            transform: scale(1.06);
          }

          .slot-box.has-letter {
            background: #ffd55e !important;
            transform: scale(1.1);
          }
        `}
      </style>

      <div style={{ display: "flex", gap: 10 }}>
        {slots.map((l, i) => (
          <div
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const letter = e.dataTransfer.getData("letter");
              const idxStr = e.dataTransfer.getData("letterIndex");
              const invIndex = parseInt(idxStr, 10);

              drop(i, letter);

              // ✅ ลบตัวอักษรจากแถวล่างเมื่อวางสำเร็จ
              if (!Number.isNaN(invIndex)) onConsumeLetter?.(invIndex);
            }}
            className={`slot-box ${l ? "has-letter" : ""}`}
            style={{
              width: 50,
              height: 50,
              background: "#ffe98a",
              border: "3px solid black",
              borderRadius: 6,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 20,
              fontWeight: "bold",
              boxShadow: "0 2px 0 #000",
              transition: "all 0.15s ease",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </>
  );
};
