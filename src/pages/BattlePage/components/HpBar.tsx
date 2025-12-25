export function HpBar({ hp, max, color }: { hp: number; max: number; color: string }) {
  // คำนวณ % เลือด ไม่ให้เกิน 0-100
  const percent = Math.max(0, Math.min(100, (hp / max) * 100));

  return (
    <div
      style={{
        // 1. ปรับ Layout (เอา absolute ออก เพื่อให้ Flexbox ของแม่จัดการตำแหน่ง)
        position: "relative",
        
        // 2. ปรับขนาดให้ใหญ่ขึ้น
        width: "100px", 
        height: "18px",
        
        // 3. ดีไซน์กรอบ (ขอบหนา, มุมมน, พื้นหลังเทา)
        background: "#333",
        border: "3px solid #000",
        borderRadius: "6px",
        overflow: "hidden", // เพื่อไม่ให้หลอดสีข้างในทะลุมุมมนออกมา
        boxShadow: "0 3px 0 rgba(0,0,0,0.3)", // เงาใต้หลอด
        
        // จัดกึ่งกลางตัวเลข
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

                   marginBottom: "40px", // 📍 แก้ตรงนี้
                    zIndex: 20
      }}
    >
      {/* ส่วนเนื้อหลอดเลือด (Bar Fill) */}
      <div
        style={{
          position: "absolute", // ให้ลอยอยู่ข้างหลังตัวเลข
          left: 0,
          top: 0,
          height: "100%",
          width: `${percent}%`,
          background: color,
          transition: "width 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)", // อนิเมชันสมูท
          
          // เพิ่มมิติแสงเงาในหลอด (Highlight ด้านบน)
          boxShadow: "inset 0 4px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.1)",
        }}
      />

      {/* ส่วนตัวเลข (Text Overlay) */}
      <span
        style={{
          position: "relative", // ให้ลอยอยู่เหนือหลอดสี
          fontSize: "10px",
          fontWeight: "900",
          color: "#fff",
          textShadow: "1px 1px 0 #000", // ขอบดำรอบตัวหนังสือ
          zIndex: 5,
          lineHeight: 1,
          fontFamily: "monospace, sans-serif" // ใช้ฟอนต์ที่ดูเป็นตัวเลขเกม
        }}
      >
        {Math.ceil(hp)}/{max}
      </span>
    </div>
  );
}