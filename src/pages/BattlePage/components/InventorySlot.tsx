import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "../types"; 
import { LETTER_DATA } from "../store/constants"; 

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
        borderRadius: "4px", // ลด Radius ลงนิดหน่อย
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
            fontSize: "12px", // ลดขนาดไอคอน
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
              width: "92%", // ขยายให้เต็มช่องมากขึ้นเล็กน้อย
              height: "92%",
              background: "#fdf5e6",
              border: "2px solid #8b4513",
              borderBottomWidth: "4px", // ลดความหนาขอบล่าง
              borderRadius: "4px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "900",
              fontSize: "24px", // ✅ ลดขนาดฟอนต์ (เดิม 32px)
              color: "#3e2723",
              cursor: "pointer",
              userSelect: "none",
              boxShadow: "0 2px 3px rgba(0,0,0,0.2)",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {item.char}
            <span
              style={{
                position: "absolute",
                bottom: "1px",
                right: "2px",
                fontSize: "12px", // ✅ ลดขนาดคะแนน (เดิม 20px)
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
// 2. ส่วนหลัก: Inventory Container
// ==========================================
interface InventoryProps {
  inventory: (InventoryItem | null)[];
  onSelectLetter: (item: InventoryItem, index: number) => void;
  playerSlots?: number;
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
        boxSizing: "border-box", // สำคัญ: ป้องกัน padding ดันความกว้าง
        flex: 1.5,           // ✅ ลด Flex ลง (เดิม 2)
        maxWidth: "380px",   // ✅ ลดความกว้างสูงสุดลง (เดิม 600px)
        minWidth: "250px",   // กำหนด minWidth กันมันบีบจนเละ
        background: "linear-gradient(180deg, #3d2b1f 0%, #2e2019 100%)",
        borderRadius: "12px",
        border: "3px solid #eebb55",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          color: "#eebb55",
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "2px",
          borderBottom: "2px solid #eebb55",
          width: "90%",
          textAlign: "center",
          paddingBottom: "4px",
          marginBottom: "4px",
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
            gap: "4px", // ✅ เพิ่ม Gap เพื่อให้ดูไม่อึดอัด
            padding: "6px",
            background: "#3e2723",
            border: "3px solid #d4af37", // ลดความหนาขอบ
            borderRadius: "5px",
            height: "auto",      // ให้สูงตาม content
            aspectRatio: "5/4",  // บังคับอัตราส่วนให้เป็นสี่เหลี่ยมสวยๆ
            width: "98%",
          }}
        >
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