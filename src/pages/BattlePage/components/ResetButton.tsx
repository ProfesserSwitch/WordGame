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
      onClick={() => {
              // รีช่องบน
              window.dispatchEvent(new CustomEvent("resetWordSlots"));

              //  รีตัวอักษรแถวล่างกลับมา
              window.dispatchEvent(new CustomEvent("refillInventory"));

              // เคลียร์คำปัจจุบัน
              (window as any).__currentWord = "";
            }}
    >
      ⟳
    </div>
  );
};
