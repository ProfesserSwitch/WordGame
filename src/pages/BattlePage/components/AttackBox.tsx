export const AttackBox: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",          // <<< กินเต็ม
        height: "100%",         // ถ้าอยากให้เต็มคอลัมน์ครึ่งนึง ค่อยไปตั้งที่ parent
        background: "#f5d24d",
        border: "3px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        cursor: "pointer",
      }}
      onClick={() => console.log("ATTACK")}
    >
      Attack
    </div>
  );
};
