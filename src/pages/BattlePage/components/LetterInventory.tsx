import React from "react";

type LetterInventoryProps = {
  letters?: string[];
};

export const LetterInventory: React.FC<LetterInventoryProps> = ({
  letters = ["A", "B", "C", "D", "N", "G", "U", "C", "D", "N", "G", "U"],
}) => {
  return (
    <>
      <style>
        {`
          .letter-tile {
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }

          .letter-tile:hover {
            transform: translateY(-4px) scale(1.08);
            box-shadow: 0 4px 0 #000;
          }

          .letter-tile:active {
            transform: translateY(2px) scale(0.95);
            box-shadow: 0 1px 0 #000;
          }
        `}
      </style>

      <div style={{ display: "flex", gap: 8 }}>
        {letters.map((l, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("letter", l)}
            className="letter-tile"
            style={{
              width: 40,
              height: 40,
              background: "#f2a654",
              border: "3px solid black",
              borderRadius: 6,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 22,
              cursor: "grab",
              boxShadow: "0 2px 0 #000",
              userSelect: "none",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </>
  );
};
