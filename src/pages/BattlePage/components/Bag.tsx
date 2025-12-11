export const Bag: React.FC = () => {
  return (
    <div
      style={{
        width: 120,
        background: "#f8e79d",
        border: "3px solid black",
        padding: 10,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
      }}
    >
      <div style={{ background: "#fff", border: "3px solid black" }}></div>
      <div style={{ background: "#fff", border: "3px solid black" }}></div>
      <div style={{ background: "#fff", border: "3px solid black" }}></div>
      <div style={{ background: "#fff", border: "3px solid black" }}></div>
    </div>
  );
};
