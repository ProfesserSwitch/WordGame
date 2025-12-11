import { useEffect, useRef } from "react";

// รูป BG / Player
// import bgImage from "../../assets/map/grassland.png";
import walk1 from "../../assets/player/walk/right_1.png";
import walk2 from "../../assets/player/walk/right_2.png";
import idlePlayer from "../../assets/player/walk/right_1.png";

// มอนสเตอร์
import enemy1 from "../../assets/enemy/rat/1.png";
import enemy2 from "../../assets/enemy/rat/2.png";

// พื้น tile
import groundImg from "../../assets/tiles/grass.png";
import treeImg from "../../assets/tiles/tree.png";

// ======================
// Enemy type
// ======================
type Enemy = {
  name: string;
  hp: number;
  speed: number; // วินาทีต่อเดิน 1 ช่อง
  atk: number;
  pos: number;
};

// รายชื่อมอน
const enemyList: Enemy[] = [
  { name: "Rat", hp: 30, speed: 20.0, atk: 1, pos: 10 },
];

// ======================
const GAME_RUN = "RUN";
const GAME_BATTLE = "BATTLE";

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.style.imageRendering = "pixelated";
    canvas.style.imageRendering = "crisp-edges";
    ctx.imageSmoothingEnabled = false;

    let animationId = 0;

    function loadImg(src: string): Promise<HTMLImageElement> {
      return new Promise((res, rej) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          img.style.imageRendering = "pixelated";
          res(img);
        };
        img.onerror = rej;
      });
    }

    async function start() {
      const [p1, p2, idle, e1, e2, groundTile, tree] = await Promise.all([
        loadImg(walk1),
        loadImg(walk2),
        loadImg(idlePlayer),
        loadImg(enemy1),
        loadImg(enemy2),
        loadImg(groundImg),
        loadImg(treeImg),
      ]);

      const walkFrames = [p1, p2];
      const enemyFrames = [e1, e2];

      const tileSize = 40;

      // ======================
      // Random Trees
      // ======================
      const treeObjects: { x: number; y: number; scale: number }[] = [];
      const treeCount = 1;
      const baseTreeW = 90;

      for (let i = 0; i < treeCount; i++) {
        let scale = 0.6 + Math.random() * 0.6;
        let w = baseTreeW * scale;

        let x = 0;
        let tries = 0;
        let overlapped = false;

        do {
          overlapped = false;
          x = Math.random() * canvas.width * 2;

          for (const t of treeObjects) {
            const tw = baseTreeW * t.scale;

            if (Math.abs(t.x - x) < (tw + w) * 0.6) {
              overlapped = true;
              break;
            }
          }

          tries++;
        } while (overlapped && tries < 50);

        treeObjects.push({
          x,
          scale,
          y: canvas.height - tileSize - 80 * scale,
        });
      }

      let treeScrollX = 0;

      // ===== RUN Mode =====
      let bgX = 0;
      let groundX = 0;
      let walkFrame = 0;
      let walkFrameCounter = 0;
      let distance = 0;
      let nextEncounter = 160;

      // ===== Battle Mode =====
      let state = GAME_RUN;
      let enemy: Enemy | null = null;
      let enemyAnimFrame = 0;
      let enemyAnimTimer = 0;
      let enemyMoveTimer = 0;
      let jumpTime = 0;
      let isJumping = false;

      // Player
      const px = 40;
      const py = canvas.height - tileSize - 30;
      let lastTime = performance.now();
      let playerHp = 3;
      const maxPlayerHp = 3;
      const playerAttackRange = 2;

      function spawnEnemy() {
        const e = enemyList[Math.floor(Math.random() * enemyList.length)];
        enemy = { ...e, pos: 10 };
        enemyMoveTimer = 0;
        enemyAnimTimer = 0;
        isJumping = false;
        state = GAME_BATTLE;
      }

      function update(dt: number) {
        if (state === GAME_RUN) {
          distance += 40 * dt;
          if (distance >= nextEncounter) {
            nextEncounter += 100;
            spawnEnemy();
          }
        }

        if (state === GAME_BATTLE && enemy) {
          enemyAnimTimer += dt;
          if (enemyAnimTimer >= 0.2) {
            enemyAnimTimer = 0;
            enemyAnimFrame = (enemyAnimFrame + 1) % 2;
          }

          enemyMoveTimer += dt;
          if (enemyMoveTimer >= enemy.speed) {
            enemyMoveTimer -= enemy.speed;

            // ถ้าอยู่ระยะโจมตีผู้เล่น
            if (enemy.pos <= playerAttackRange) {
              playerHp -= enemy.atk;
              if (playerHp <= 0) {
                playerHp = 0;
                state = GAME_RUN; // Reset
                distance = 0;
              }
            } else {
              isJumping = true;
              jumpTime = 0;
              enemy.pos -= 1;
              if (enemy.pos <= 0) enemy.pos = 0;
            }
          }

          if (isJumping) {
            jumpTime += dt * 4;
            if (jumpTime >= 1) {
              jumpTime = 0;
              isJumping = false;
            }
          }
        }
      }

      function drawGround() {
        const tilesCount = Math.ceil(canvas.width / tileSize) + 1;
        for (let i = 0; i < tilesCount; i++) {
          ctx.drawImage(
            groundTile,
            groundX + i * tileSize,
            canvas.height - tileSize,
            tileSize,
            tileSize
          );
        }

        if (state === GAME_RUN) {
          groundX -= 0.5;
          if (groundX <= -tileSize) groundX += tileSize;
        }
      }

      function drawTrees() {
        const sortedTrees = [...treeObjects].sort((a, b) => a.scale - b.scale);
        for (let t of sortedTrees) {
          const drawX = t.x + treeScrollX;
          ctx.drawImage(tree, drawX, t.y, 90 * t.scale, 80 * t.scale);
        }

        if (state === GAME_RUN) {
          treeScrollX -= 0.5;
          treeObjects.forEach((t) => {
            if (t.x + treeScrollX < -200) {
              t.x += canvas.width + 400;
            }
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTrees();
        drawGround();

        if (state === GAME_RUN) {
          walkFrameCounter++;
          if (walkFrameCounter % 15 === 0) walkFrame = (walkFrame + 1) % 2;
          ctx.drawImage(walkFrames[walkFrame], px, py, 40, 40);
        } else {
          ctx.drawImage(idle, px, py, 40, 40);
        }

        // ⭐ Draw Player HP
        for (let i = 0; i < maxPlayerHp; i++) {
          ctx.fillStyle = i < playerHp ? "red" : "black";
          ctx.beginPath();
          ctx.arc(canvas.width - 20 - i * 20, 20, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Enemy
        if (state === GAME_BATTLE && enemy) {
          const enemyStartX = canvas.width - 80;
          const stepSize = 40;
          const enemyBaseX = enemyStartX - (10 - enemy.pos) * stepSize;
          const enemyBaseY = py;
          const jumpOffset = isJumping ? Math.sin(jumpTime * Math.PI) * 20 : 0;

          ctx.drawImage(enemyFrames[enemyAnimFrame], enemyBaseX, enemyBaseY - jumpOffset, 40, 40);

          // Enemy HP
          const hpPercent = enemy.hp / 30;
          ctx.fillStyle = "black";
          ctx.fillRect(enemyBaseX - 1, enemyBaseY - 46 - jumpOffset, 42, 8);
          ctx.fillStyle = "red";
          ctx.fillRect(enemyBaseX, enemyBaseY - 45 - jumpOffset, 40 * hpPercent, 6);

          // Enemy Cooldown
          const cdPercent = enemyMoveTimer / enemy.speed;
          ctx.fillStyle = "black";
          ctx.fillRect(enemyBaseX - 1, enemyBaseY - 56 - jumpOffset, 42, 6);
          ctx.fillStyle = "cyan";
          ctx.fillRect(enemyBaseX, enemyBaseY - 55 - jumpOffset, 40 * cdPercent, 4);
        }

        // Distance
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(`Distance: ${Math.floor(distance)} m`, canvas.width - 150, 30);
      }

      function loop() {
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        update(dt);
        draw();
        animationId = requestAnimationFrame(loop);
      }

      loop();
    }

    start();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(179, 241, 255, 1)",
        imageRendering: "pixelated",
      }}
    />
  );
};
