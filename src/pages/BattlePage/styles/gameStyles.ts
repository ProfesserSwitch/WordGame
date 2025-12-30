import type { CSSProperties } from "react";

export const uiStyles: { [key: string]: CSSProperties } = {

  // wrapper: {
  //   width: "100vw",
  //   height: "100vh",
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   background: "#121212",
  //   padding: "0", // ลบ padding ออกเพื่อให้คำนวณเต็มจอได้เป๊ะ
  //   boxSizing: "border-box",
  //   fontFamily: "monospace",
  //   overflow: "hidden", // ป้องกัน Scrollbar โผล่
  // },
  // gameContainer: {
  //   height: "95vh",          
  //   aspectRatio: "10/6",      
  //   width: "auto",          
  //   maxWidth: "100vw",      
  //   display: "flex",
  //   flexDirection: "column",
  //   border: "4px solid #000",
  //   background: "#B3F1FF",
  //   position: "relative",
  //   overflow: "hidden",

  //   boxShadow: "0 0 20px rgba(0,0,0,0.5)", 
  // },
// spriteLayer: {
//     position: "relative",    
//     backgroundPosition: "bottom center",
//     backgroundRepeat: "no-repeat",
//     imageRendering: "pixelated", 
//     transform: "scale(1.5)",     
//     transformOrigin: "bottom center", 
//   },

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
    height: "100%", 
  },

  meaningTag: {
    position: "absolute",
    bottom: "80%",
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