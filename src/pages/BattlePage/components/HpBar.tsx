
export function HpBar({ hp, max, color }: { hp: number; max: number; color: string }) {
  return (
    <div style={{
            position: "absolute",
            top: -12,
            width: "56px",
            height: "6px",
            background: "#333",
            border: "1.5px solid #000",
    }}>
      <div
        style={{
            height: "100%",
            background: `${color}`,
            transition: "width 0.3s ease",
          width: `${(hp / max) * 100}%`,
        }}
      />
    </div>
  );
}


