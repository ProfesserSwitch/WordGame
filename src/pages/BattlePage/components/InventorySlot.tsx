// inventory/InventorySlot.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../types";
import { LETTER_DATA } from "../constants";

interface Props {
  item: InventoryItem | undefined;
  index: number;
  isLocked?: boolean;
  onSelect: (item: InventoryItem, index: number) => void;
}

export const InventorySlot: React.FC<Props> = ({ item, index, onSelect, isLocked }) => {
  return (
    <div
      style={{
        width: "90%",
        height: "90%",
        // ✅ ถ้า Locked ให้ดูมืดและกดไม่ได้
        background: isLocked ? "#1a0f0a" : "rgba(0, 0, 0, 0.3)",
        border: isLocked ? "2px solid #3d2b1f" : "2px inset #2a1a10",
        borderRadius: "6px",
        boxShadow: "inset 1px 1px 4px rgba(0,0,0,0.5)",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
      }}
    >
      {/* ✅ แสดงสัญลักษณ์แม่กุญแจสำหรับช่องที่ Locked */}
      {isLocked && (
        <div style={{
          fontSize: "16px",
          opacity: 0.3,
          filter: "grayscale(1)",
          userSelect: "none"
        }}>
          🔒
        </div>
      )}
      <AnimatePresence>
        {item && !isLocked && ( // ✅ ป้องกันไม่ให้ไอเทมแสดงในช่องที่ Locked (กันเหนียว)
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, zIndex: 100 }}
            onClick={() => onSelect(item, index)} // ยังคงทำงานได้ปกติถ้ามีไอเทม
            style={{
              width: "90%",
              height: "90%",
              background: "#fdf5e6",
              border: "2px solid #8b4513",
              borderBottomWidth: "5px",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "900",
              fontSize: "32px",
              color: "#3e2723",
              cursor: "pointer",
              userSelect: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {item.char} 
            <span style={{ position: "absolute", bottom: "2px", right: "3px", fontSize: "20px", color: "#8b4513", fontWeight: "bold" }}>
              {LETTER_DATA[item.char]?.score}  
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};