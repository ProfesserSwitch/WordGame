// src/utils/sfx.ts

// 1. Import มาทีละไฟล์ (Bundler จะจัดการเรื่อง Path ที่ถูกต้องให้เอง)
import hitSoundUrl from "../assets/sounds/enemyHit.wav";
import missle from "../assets/sounds/alphabetMissle.wav"

const playSound = (audioUrl: string, volume = 0.5) => {
  // 2. ใช้ audioUrl ที่ได้จากการ Import (ห้ามเขียน String Path เอง)
  const audio = new Audio(audioUrl); 
  audio.volume = volume;
  audio.play().catch(e => console.log("Audio play blocked", e));
};

export const sfx = {
  // 3. ส่งตัวแปร URL เข้าไป
  playHit: () => playSound(hitSoundUrl),
  playMissle: () => playSound(missle),
};