// Assets Import (Adjust paths if needed)
import walkPlayer1 from "../assets/image/player/walk/1.png";
import walkPlayer2 from "../assets/image/player/walk/2.png";
import idlePlayer from "../assets/image/player/walk/1.png";
import attackPlayer1 from "../assets/image/player/attack/1.png";
import attackPlayer2 from "../assets/image/player/attack/2.png";
import walkEnemy1 from "../assets/image/enemy/rat/walk/1.png";
import walkEnemy2 from "../assets/image/enemy/rat/walk/2.png";
import idleEnemy from "../assets/image/enemy/rat/walk/1.png";
import attackEnemy1 from "../assets/image/enemy/rat/attack/1.png";
import attackEnemy2 from "../assets/image/enemy/rat/attack/2.png";
import groundImg from "../assets/image/tiles/grass.png";


export function getEnemySprite(en: any, gameState: string, animFrame: number) {
  if (en.atkFrame > 0) {
    return en.atkFrame === 2 ? attackEnemy2 : attackEnemy1;
  }

  if (gameState === "ADVANTURE") {
    return animFrame === 0 ? walkEnemy1 : walkEnemy2;
  }

  return idleEnemy;
}

export function getPlayerSprite(
  isAttacking: boolean,
  atkFrame: number,
  gameState: string,
  animFrame: number
) {
  if (isAttacking) {
    return atkFrame === 1 ? attackPlayer1 : attackPlayer2;
  }

  if (gameState === "ADVANTURE") {
    return animFrame === 0 ? walkPlayer1 : walkPlayer2;
  }

  return idlePlayer;
}
