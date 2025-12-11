import React, { useState } from "react";

export const WordSlots: React.FC = () => {
  const [slots, setSlots] = useState<(string | null)[]>([
    null, null, null, null, null, null, null, null,
  ]);

  const drop = (index: number, letter: string) => {
    const updated = [...slots];
    updated[index] = letter;
    setSlots(updated);
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
            onDrop={(e) => drop(i, e.dataTransfer.getData("letter"))}
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
