import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShoutBubbleProps {
  text: string | undefined | null; // รับข้อความ (ถ้าไม่มีก็ไม่แสดง)
}

export const ShoutBubble: React.FC<ShoutBubbleProps> = ({ text }) => {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            // position: "absolute",
            // zIndex: 1000,
            // top: "-40px", 
            // left: "50%",
            backgroundColor: "white",
            color: "#333",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            border: "2px solid #000",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            // จัดกึ่งกลาง (ถ้า Parent มี display:flex, align-items:center แล้ว ตัวนี้จะอยู่กลางเอง แต่ใส่ left/transform เผื่อไว้ได้)
            transform: "translateX(-50%)", 
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
          }}
        >
          {text}
         
          {/* สามเหลี่ยมชี้ลง */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #000",
            }}
          />
        </motion.div>
       )} 
    </AnimatePresence>
  );
};