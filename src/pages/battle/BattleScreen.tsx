import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

type Keys = { [key: string]: boolean };
type Direction = "up" | "down" | "left" | "right";

type RemotePlayer = {
  id: string,
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  direction: Direction,
  frame: number,
  frameTime: number,
  speed: number,
  sprite: HTMLImageElement,
}

const WIDTH = 650;
const HEIGHT = 500;
const CELL_SIZE = 50;
const ROWS = 10;
const COLS = 13;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  type GameObject = {
    id: string;
    x: number;  // pixel
    y: number;  // pixel
    w: number;
    h: number;
    sprite: HTMLImageElement;
  };

const objects = useRef<GameObject[]>([]);

const tree = new Image();
tree.src = "src/assets/objects/tree.png";

objects.current.push({
  id: "tree1",
  x: 100,
  y: 100,
  w: 50,
  h: 50,
  sprite: tree
});

const isCollidingObject = (nx: number, ny: number) => {
  const bodyW = 30;
  const bodyH = 20;
  const offsetX = (CELL_SIZE - bodyW) / 2;
  const offsetY = 30;

  const px1 = nx + offsetX;
  const py1 = ny + offsetY;
  const px2 = px1 + bodyW;
  const py2 = py1 + bodyH;

  for (const obj of objects.current) {
    const ox1 = obj.x;
    const oy1 = obj.y;
    const ox2 = obj.x + obj.w;
    const oy2 = obj.y + obj.h;

    const overlap =
      px1 < ox2 &&
      px2 > ox1 &&
      py1 < oy2 &&
      py2 > oy1;

    if (overlap) return true;
  }
  return false;
};


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
    frameInterval: 0.09,
  });

  const otherPlayers = useRef<Record<string, RemotePlayer>>({});
  const keys = useRef<Keys>({});

  const map = useRef<number[][]>([
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,1,1,1,0,0,0,1],
    [1,0,0,0,1,1,1,1,1,0,0,0,1],
    [1,0,0,0,0,1,1,1,0,0,0,0,1],
    [1,0,0,0,1,0,1,0,1,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,1,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
  ]);

  const sprites = useRef<Record<Direction, HTMLImageElement[]>>({
    up: [], down: [], left: [], right: []
  });

  const tiles = useRef<{ grass: HTMLImageElement; water: HTMLImageElement }>({
    grass: new Image(),
    water: new Image()
  });

  // โหลด assets
  useEffect(() => {
    const dirs: Direction[] = ["up", "down", "left", "right"];
    dirs.forEach(dir => {
      sprites.current[dir] = [];
      for (let i = 1; i <= 2; i++) {
        const img = new Image();
        img.src = `src/assets/player/walk/${dir}_${i}.png`;
        sprites.current[dir].push(img);
      }
    });

    tiles.current.grass.src = "src/assets/tiles/grass.png";
    tiles.current.water.src = "src/assets/tiles/water.png";
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; }
  const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; }

  // logic เกม
  const canMove = (x: number, y: number) => {
    const bodyH = 20;
    const bodyW = 30;
    const offsetY = 30;
    const offsetX = (CELL_SIZE - bodyW) / 2;

    if (isCollidingObject(x, y)) return false;

    const corners = [
      [x + offsetX, y + offsetY],
      [x + offsetX + bodyW, y + offsetY],
      [x + offsetX, y + offsetY + bodyH],
      [x + offsetX + bodyW, y + offsetY + bodyH],
    ];

    for (const [cx, cy] of corners) {
      const col = Math.floor(cx / CELL_SIZE);
      const row = Math.floor(cy / CELL_SIZE);
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      if (map.current[row][col] !== 0) return false;
    }
    return true;
  }
  const update = (dt: number) => {
    const p = player.current;
    let moving = false;
    let dx = 0, dy = 0;

    if (keys.current["w"]) { dy -= p.speed * dt; p.dir = "up"; moving = true; }
    if (keys.current["s"]) { dy += p.speed * dt; p.dir = "down"; moving = true; }
    if (keys.current["a"]) { dx -= p.speed * dt; p.dir = "left"; moving = true; }
    if (keys.current["d"]) { dx += p.speed * dt; p.dir = "right"; moving = true; }

    if (canMove(p.x + dx, p.y)) p.x += dx;
    if (canMove(p.x, p.y + dy)) p.y += dy;

    if (moving) {
      p.frameTimer += dt;
      if (p.frameTimer >= p.frameInterval) {
        p.frame = (p.frame + 1) % 2;
        p.frameTimer = 0;
      }
    } else { p.frame = 0; p.frameTimer = 0; }

    if (socketRef.current) {
      socketRef.current.emit("playerMove", {
        x: p.x,
        y: p.y,
        dir: p.dir,
        src: sprites.current[p.dir][p.frame].src
      });
    }
    // เลื่อนผู้เล่นอื่น
    for (const id in otherPlayers.current) {
      const op = otherPlayers.current[id];
      const lerp = 0.1;
      op.x += (op.targetX - op.x) * lerp;
      op.y += (op.targetY - op.y) * lerp;
    }
  }
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // --- วาดพื้น + กรอบ ---
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = map.current[r][c];
        const img = tile === 0 ? tiles.current.grass : tiles.current.water;

        if (img.complete) {
          ctx.drawImage(img, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }

        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // --- รวม entity ทั้งหมด (player ตัวเอง + คนอื่น) ---
    const entities: {
      x: number;
      y: number;
      sprite: HTMLImageElement | null;
      type: "self" | "other";
      id?: string;
    }[] = [];


    // player ตัวเอง
    const p = player.current;
    const dirSprites = sprites.current[p.dir];
    entities.push({
      x: p.x,
      y: p.y,
      sprite: dirSprites.length ? dirSprites[p.frame] : null,
      type: "self",
    });

    // ผู้เล่นอื่น
    for (const id in otherPlayers.current) {
      const op = otherPlayers.current[id];

      entities.push({
        x: op.x,
        y: op.y,
        sprite: op.sprite ?? null,
        type: "other",
        id,
      });
    }

    for (const obj of objects.current) {
      entities.push({
        x: obj.x,
        y: obj.y + (obj.h - CELL_SIZE), // ให้ยืนถูกตำแหน่ง
        sprite: obj.sprite,
        type: "other"
      });
}

    // --- depth sorting ตาม y ---
    entities.sort((a, b) => a.y - b.y);

    // --- วาดตามลำดับ ---
    for (const e of entities) {
      if (e.sprite && e.sprite.complete) {
        ctx.drawImage(e.sprite, e.x, e.y, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = e.type === "self" ? "cyan" : "orange";
        ctx.fillRect(e.x, e.y, CELL_SIZE, CELL_SIZE);
      }

      // ชื่อ player คนอื่น
      if (e.type === "other" && e.id) {
        ctx.fillStyle = "yellow";
        ctx.font = "12px monospace";
        ctx.fillText(e.id.substring(0, 4), e.x, e.y - 5);
      }
    }
  };


  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
    canvas.style.width = `${WIDTH * scale}px`;
    canvas.style.height = `${HEIGHT * scale}px`;
    canvas.style.position = "absolute";
    canvas.style.left = `${(window.innerWidth - WIDTH*scale)/2}px`;
    canvas.style.top = `${(window.innerHeight - HEIGHT*scale)/2}px`;
    canvas.style.imageRendering = "pixelated";
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", resizeCanvas);

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current)/1000;
      lastTimeRef.current = time;

      update(dt);
      draw(ctx);
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
    }
  }, []);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000", { transports: ["websocket"] });

    socketRef.current.on("connect", () => console.log("Connected!", socketRef.current!.id));

    socketRef.current.on("currentPlayers", (players) => {
      for (const id in players) {
        if (id === socketRef.current!.id) continue;
        const op = players[id];
        otherPlayers.current[id] = {
          id,
          x: op.x,
          y: op.y,
          targetX: op.x,
          targetY: op.y,
          direction: op.dir,
          frame: 0,
          frameTime: 0,
          speed: 200,
          sprite: new Image()
        };
        otherPlayers.current[id].sprite.src = otherPlayers.current[id].sprite.src = op.src;
      }
    });

    socketRef.current.on("newPlayer", (player) => {
      if (player.id === socketRef.current!.id) return;
      otherPlayers.current[player.id] = {
        id: player.id,
        x: player.x,
        y: player.y,
        targetX: player.x,
        targetY: player.y,
        direction: player.dir,
        frame: 0,
        frameTime: 0,
        speed: 200,
        sprite: new Image()
      };
      otherPlayers.current[player.id].sprite.src = player.src;
    });

    socketRef.current.on("playerMoved", (data) => {
      if (data.id === socketRef.current!.id) return;
      const op = otherPlayers.current[data.id];
      if (op) {
        op.targetX = data.x;
        op.targetY = data.y;
        op.direction = data.dir;
        op.sprite.src = data.src;
      }
    });

    socketRef.current.on("playerDisconnected", (id) => delete otherPlayers.current[id]);

    return () => { socketRef.current?.disconnect(); }
  }, []);

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{border:"2px solid black"}} />
}
