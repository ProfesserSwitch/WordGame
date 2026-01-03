// --- ENEMY ASSETS ---
import walkEnemy1 from "../../../assets/image/enemy/rat/walk/1.png";
import walkEnemy2 from "../../../assets/image/enemy/rat/walk/2.png";
import idleEnemy from "../../../assets/image/enemy/rat/walk/1.png";
import attackEnemy1 from "../../../assets/image/enemy/rat/attack/1.png";
import attackEnemy2 from "../../../assets/image/enemy/rat/attack/2.png";

// --- PLAYER ASSETS (เพิ่มใหม่) ---
import walkPlayer1 from "../../../assets/image/player/walk/1.png";
import walkPlayer2 from "../../../assets/image/player/walk/2.png";
import idlePlayer from "../../../assets/image/player/walk/1.png"; 
import attackPlayer1 from "../../../assets/image/player/attack/1.png";
import attackPlayer2 from "../../../assets/image/player/attack/2.png";

// ✅ รวมรูปทั้งหมด (ทั้งศัตรูและผู้เล่น) เพื่อเอาไปวนลูป Preload ในหน้า Loading
export const ASSET_LIST = [
  // Enemy
  walkEnemy1,
  walkEnemy2,
  idleEnemy,
  attackEnemy1,
  attackEnemy2,
  
  // Player
  walkPlayer1,
  walkPlayer2,
  idlePlayer,
  attackPlayer1,
  attackPlayer2,
];

// Export แยก Object สำหรับนำไปใช้ใน Component (ถ้าต้องการใช้แบบ Prop)
export const ENEMY_ASSETS = {
  walkEnemy1,
  walkEnemy2,
  idleEnemy,
  attackEnemy1,
  attackEnemy2,
};

// (Optional) จะ export PLAYER_ASSETS ด้วยก็ได้ แต่ถ้า PlayerEntity import เองอยู่แล้วก็ไม่จำเป็นต้องใช้ตัวนี้
export const PLAYER_ASSETS = {
  walkPlayer1,
  walkPlayer2,
  idlePlayer,
  attackPlayer1,
  attackPlayer2,
};