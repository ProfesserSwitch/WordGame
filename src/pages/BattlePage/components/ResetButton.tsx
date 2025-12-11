export const ResetButton: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",         // <<< กินเต็ม
        height: "100%",        // <<< เดี๋ยว parent คุมอีกที
        background: "#f5ca5c",
        border: "3px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        fontSize: 24,
      }}
      onClick={() => console.log("RESET LETTERS")}
    >
      ⟳
    </div>
  );
};
