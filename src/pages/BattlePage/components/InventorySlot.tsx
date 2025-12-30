import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../types"; // ⚠️ เช็ค path ให้ถูกต้อง
import { LETTER_DATA } from "../store/constants";    // ⚠️ เช็ค path ให้ถูกต้อง

// ==========================================
// 1. ส่วนย่อย: Single Slot (Logic ของช่อง 1 ช่อง)
// ==========================================
interface SingleSlotProps {
  item: InventoryItem | undefined;
  index: number;
  isLocked: boolean;
  onSelect: (item: InventoryItem, index: number) => void;
}

const SingleSlot: React.FC<SingleSlotProps> = ({ item, index, isLocked, onSelect }) => {
  return (
    <div
      style={{
        width: "90%",
        height: "90%",
        background: isLocked ? "#1a0f0a" : "rgba(0, 0, 0, 0.3)",
        border: isLocked ? "2px solid #3d2b1f" : "2px inset #2a1a10",
        borderRadius: "6px",
        boxShadow: "inset 1px 1px 4px rgba(0,0,0,0.5)",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* สัญลักษณ์แม่กุญแจ */}
      {isLocked && (
        <div
          style={{
            fontSize: "16px",
            opacity: 0.3,
            filter: "grayscale(1)",
            userSelect: "none",
          }}
        >
          🔒
        </div>
      )}

      {/* ตัวอักษร */}
      <AnimatePresence>
        {item && !isLocked && (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, zIndex: 100 }}
            onClick={() => onSelect(item, index)}
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
            <span
              style={{
                position: "absolute",
                bottom: "2px",
                right: "3px",
                fontSize: "20px",
                color: "#8b4513",
                fontWeight: "bold",
              }}
            >
              {LETTER_DATA[item.char]?.score}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 2. ส่วนหลัก: Inventory Container (ส่งออกตัวนี้)
// ==========================================
interface InventoryProps {
  inventory: (InventoryItem | null)[];
  onSelectLetter: (item: InventoryItem, index: number) => void;
  playerSlots?: number; // รับค่าจำนวนช่องที่ปลดล็อค (default = 10)
}

export const InventorySlot: React.FC<InventoryProps> = ({ 
  inventory, 
  onSelectLetter, 
  playerSlots = 10 
}) => {
  return (
    <div
      id="inventory"
      style={{
        flex: 2,
        maxWidth: "600px",
        background: "linear-gradient(180deg, #3d2b1f 0%, #2e2019 100%)",
        borderRadius: "12px",
        border: "3px solid #eebb55",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          color: "#eebb55",
          fontSize: "12px",
          fontWeight: 900,
          letterSpacing: "2px",
          borderBottom: "2px solid #eebb55",
          width: "95%",
          textAlign: "center",
          paddingBottom: "5px",
          marginBottom: "5px",
        }}
      >
        INVENTORY
      </div>

      {/* GRID CONTAINER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <motion.div
          layout
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            padding: "10px",
            background: "#3e2723",
            border: "4px solid #d4af37",
            borderRadius: "5px",
            height: "90%",
            width: "95%",
          }}
        >
          {/* Loop สร้างช่องโดยใช้ Component ย่อยข้างบน */}
          {inventory.map((item, index) => (
            <SingleSlot
              key={`slot-${index}`}
              item={item ?? undefined}
              index={index}
              isLocked={index >= playerSlots}
              onSelect={onSelectLetter}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};