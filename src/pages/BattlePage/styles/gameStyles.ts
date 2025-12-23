import type { CSSProperties } from "react";

export const uiStyles: { [key: string]: CSSProperties } = {

  wrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#121212",
    padding: "0", // ลบ padding ออกเพื่อให้คำนวณเต็มจอได้เป๊ะ
    boxSizing: "border-box",
    fontFamily: "monospace",
    overflow: "hidden", // ป้องกัน Scrollbar โผล่
  },
  gameContainer: {
    // ✅ หัวใจสำคัญ: กำหนดขนาดให้ยืดหดตามจอ แต่ล็อคสัดส่วนไว้
    height: "95vh",           // สูงเกือบเต็มจอ (เหลือขอบนิดนึงสวยๆ)
    aspectRatio: "18/6",      // 🔒 ล็อคสัดส่วนเป็น 9:16 (เหมือนมือถือ) เหมาะกับ 50/50 Grid
    width: "auto",            // ให้ความกว้างปรับตามความสูงและ Ratio
    maxWidth: "100vw",        // แต่ห้ามกว้างเกินจอ
    
    // Flex Layout
    display: "flex",
    flexDirection: "column",
    border: "4px solid #000",
    background: "#B3F1FF",
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)", // เงาเพื่อให้ดูลอยออกมาจากพื้นหลัง
  },
  world: {
    flex: 1, // ✅ กินพื้นที่ 50% (ครึ่งบน)
    position: "relative",
    overflow: "hidden",
    borderBottom: "4px solid #000",
    background: "#87CEEB",
    width: "100%", // เต็มความกว้างคอนเทนเนอร์
  },
  panel: {
    flex: 1, // ✅ กินพื้นที่ 50% (ครึ่งล่าง)
    background: "#2c2c2c",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // จัดทุกอย่างให้อยู่กลาง Panel
    padding: "10px",
    gap: "10px",
    borderTop: "4px solid #000",
    position: "relative",
    width: "100%",
  },
  entity: {
    position: "absolute",
    width: "56px",
    height: "56px",
    transform: "translateY(-100%)",
  },
  spriteLayer: {
    backgroundPosition: "bottom center",
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
  },
  fireball: {
    position: "absolute",
    background: "#ff4500",
    borderRadius: "50%",
    zIndex: 15,
    border: "2px solid #fff",
    boxShadow: "0 0 10px #ff4500",
  },
  targetArrow: {
    position: "absolute",
    top: -45,
    left: "28px",
    transform: "translateX(-50%)",
    color: "yellow",
    fontSize: "16px",
    textShadow: "2px 2px #000",
  },
  damageText: {
    position: "absolute",
    fontWeight: "900",
    fontSize: "26px",
    textShadow: "2px 2px 0px #000",
    pointerEvents: "none",
    zIndex: 999,
    width: "80px",
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  restartBtn: {
    padding: "12px 24px",
    background: "#ffeb3b",
    border: "4px solid #000",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
    alignItems: "center",
  },

  wordSection: {
    // flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  
  },
  inventory: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)", // 4 คอลัมน์
    gridTemplateRows: "repeat(4, 1fr)",    // ✅ เพิ่ม: บังคับ 4 แถวเสมอ
    padding: "10px 10px",
    background: "#3e2723",
    border: "4px solid #d4af37",
    borderRadius: "5px",
    boxShadow: "inset 0 0 15px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5)",
    margin: "0 auto",
    width: "fit-content",
  },
  emptySlot: {
    width: "30px",
    height: "30px",
    background: "rgba(0, 0, 0, 0.3)", // สีดำจางๆ
    border: "2px inset #2a1a10",     // ขอบแบบยุบลงไป (Inset)
    borderRadius: "6px",
    boxShadow: "inset 1px 1px 4px rgba(0,0,0,0.5)", // เงาข้างในให้ดูเป็นหลุม
  },
  letterCard: {
    width: "30px",  // ปรับขนาดให้พอดีมือ
    height: "30px",
    // ปรับสีให้เหมือนกระเบื้องตัวอักษร (สีครีมๆ)
    background: "#fdf5e6", // OldLace color
    border: "2px solid #8b4513", // ขอบน้ำตาล
    borderBottomWidth: "5px", // ขอบล่างหนาหน่อยให้ดูเป็นก้อน 3D
    borderRadius: "6px",
    
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "900", // ตัวหนาเข้ม
    fontSize: "15px",
    color: "#3e2723", // ตัวหนังสือสีน้ำตาลเข้ม
    
    cursor: "pointer",
    position: "relative",
    userSelect: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },

  scoreTag: { 
    position: "absolute", 
    bottom: "2px", 
    right: "3px", 
    fontSize: "10px",
    color: "#8b4513", // ปรับสีแต้มให้เข้ากัน
    fontWeight: "bold"
  },

  meaningTag: {
    position: "absolute",
    bottom: "50%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.85)",
    color: "#00ffcc",
    padding: "6px 16px",
    borderRadius: "20px",
    border: "2px solid #00ffcc",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 50,
  },
};