import { useEffect, useRef } from "react";

type Keys = { [key: string]: boolean };

const WIDTH = 650;
const HEIGHT = 500;
const CELL_SIZE = 50; // ขนาด cell
const ROWS = 10;
const COLS = 13;

type Direction = "up" | "down" | "left" | "right";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTimeRef = useRef(0);
  const deltaRef = useRef(0);

  const FPS = 60;
  const drawInterval = 1000 / FPS;

  const player = useRef({
    x: CELL_SIZE * 4,
    y: CELL_SIZE * 1,
    speed: 200,
    dir: "down" as Direction,
    frame: 0,
    frameTimer: 0,
    frameInterval: 0.2,
  });

  const keys = useRef<Keys>({});

  // Map 0 = grass, 1 = water
  const map = useRef<number[][]>([
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,1,1,1,0,0,0,0,1],
    [1,0,0,0,1,1,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
  ]);

  // โหลด sprite images
  const sprites = useRef<Record<Direction, HTMLImageElement[]>>({
    up: [],
    down: [],
    left: [],
    right: [],
  });
  const tiles = useRef<{ grass: HTMLImageElement; water: HTMLImageElement }>({
    grass: new Image(),
    water: new Image(),
  });

  useEffect(() => {
    // load player sprites
    const directions: Direction[] = ["up", "down", "left", "right"];
    directions.forEach((dir) => {
      sprites.current[dir] = [];
      for (let i = 1; i <= 2; i++) {
        const img = new Image();
        img.src = `src/assets/player/walk/${dir}_${i}.png`;
        sprites.current[dir].push(img);
      }
    });

    // load map tiles
    tiles.current.grass.src = "src/assets/tiles/grass.png";
    tiles.current.water.src = "src/assets/tiles/water.png";
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = true;
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = false;
  };

  // ตรวจการชน
  const canMove = (x: number, y: number) => {
    const bodyHeight = 20;      // สูงลำตัว
    const bodyWidth = 30;       // กว้างลำตัว (แคบลง)
    const bodyOffsetY = 30;     // ส่วนหัวสูง
    const bodyOffsetX = (CELL_SIZE - bodyWidth) / 2; // เว้นซ้าย-ขวา เท่ากัน

    const corners = [
      [x + bodyOffsetX, y + bodyOffsetY],                      // มุมบนซ้าย
      [x + bodyOffsetX + bodyWidth, y + bodyOffsetY],          // มุมบนขวา
      [x + bodyOffsetX, y + bodyOffsetY + bodyHeight],         // มุมล่างซ้าย
      [x + bodyOffsetX + bodyWidth, y + bodyOffsetY + bodyHeight], // มุมล่างขวา
    ];

    for (const [cx, cy] of corners) {
      const col = Math.floor(cx / CELL_SIZE);
      const row = Math.floor(cy / CELL_SIZE);
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      if (map.current[row][col] !== 0) return false;
    }

    return true;
  };

  const update = (dt: number) => {
    const p = player.current;
    let moving = false;

    let dx = 0;
    let dy = 0;

    if (keys.current["w"]) { dy -= p.speed * dt; p.dir = "up"; moving = true; }
    if (keys.current["s"]) { dy += p.speed * dt; p.dir = "down"; moving = true; }
    if (keys.current["a"]) { dx -= p.speed * dt; p.dir = "left"; moving = true; }
    if (keys.current["d"]) { dx += p.speed * dt; p.dir = "right"; moving = true; }

    // แยกเช็คแกน X
    if (canMove(p.x + dx, p.y)) p.x += dx;
    // แยกเช็คแกน Y
    if (canMove(p.x, p.y + dy)) p.y += dy;

    // ในขณะกำลังวิ่ง ให้เปลี่ยน frame sprite
    if (moving) {
      p.frameTimer += dt;
      if (p.frameTimer >= p.frameInterval) {
        p.frame = (p.frame + 1) % 2;
        p.frameTimer = 0;
      }
    } else {
      p.frame = 0;
      p.frameTimer = 0;
    }
  };
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw map
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = map.current[r][c];
        const img = tile === 0 ? tiles.current.grass : tiles.current.water;
        if (img.complete) ctx.drawImage(img, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // วาดกรอบแต่ละ cell
        ctx.strokeStyle = "rgba(255,255,255,0.3)"; 
        ctx.lineWidth = 1;
        ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // วาดผู้เล่น
    const p = player.current;
    const dirSprites = sprites.current[p.dir];
    if (dirSprites.length > 0 && dirSprites[p.frame].complete) {
      ctx.drawImage(dirSprites[p.frame], p.x, p.y, CELL_SIZE, CELL_SIZE);
    } else {
      ctx.fillStyle = "cyan";
      ctx.fillRect(p.x, p.y, CELL_SIZE, CELL_SIZE);
    }

    const bodyWidth = 30;       // กว้างลำตัว
    const bodyHeight = 20;      // สูงลำตัว
    const bodyOffsetX = (CELL_SIZE - bodyWidth) / 2; 
    const bodyOffsetY = 30;     // ส่วนหัว

    const hitboxX = p.x + bodyOffsetX;
    const hitboxY = p.y + bodyOffsetY;

    // คำนวณ grid index ของ hitbox
    const gridX = Math.floor((hitboxX + bodyWidth/2) / CELL_SIZE);
    const gridY = Math.floor((hitboxY + bodyHeight/2) / CELL_SIZE);

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText(`x: ${gridX}, y: ${gridY}`, 10, 10);

    // วาด hitbox ให้เห็น
    ctx.strokeStyle = "rgba(255,0,0,0.5)";
    ctx.strokeRect(hitboxX, hitboxY, bodyWidth, bodyHeight);

  };

  const resizeCanvas = () => {

  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", resizeCanvas);

    const loop = (currentTime: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = currentTime;
      const elapsed = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      deltaRef.current += elapsed;
      while (deltaRef.current >= drawInterval) {
        update(drawInterval / 1000);
        deltaRef.current -= drawInterval;
      }

      draw(ctx);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ border: "2px solid black" }} />;
}
