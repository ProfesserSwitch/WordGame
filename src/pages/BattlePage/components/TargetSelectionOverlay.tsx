import React from "react";

interface Props {
  skillName: string;
  current: number;
  max: number;
  onCancel: () => void;
}

export const TargetSelectionOverlay: React.FC<Props> = ({
  skillName,
  current,
  max,
  onCancel,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 0,
        width: "100%",
        textAlign: "center",
        zIndex: 999,
      }}
    >
      <span
        style={{
          background: "rgba(0,0,0,0.85)",
          color: "#ff9f43",
          padding: "8px 16px",
          borderRadius: 20,
          border: "2px solid #fff",
          fontWeight: "bold",
        }}
      >
        {skillName}: SELECT TARGET {current + 1} / {max}
      </span>
      <button
        onClick={onCancel}
        style={{
          marginLeft: 10,
          padding: "5px 10px",
          borderRadius: "10px",
          background: "#fff",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        CANCEL
      </button>
    </div>
  );
};