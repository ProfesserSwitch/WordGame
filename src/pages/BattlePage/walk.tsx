import { useEffect, useRef, useState } from "react";

// =========================================================
// 💡 CONFIGURATION & TYPES
// =========================================================

// ปุ่มและทิศทาง
type Keys = { [key: string]: boolean };
type Direction = "up" | "down" | "left" | "right";

// 💡 Constants หลักที่ใช้ในการวาด
const CELL_SIZE = 50;

// 💡 Screen Size (ขนาดจอแสดงผล)
const WIDTH = 800;
const HEIGHT = 600;

// ตำแหน่ง Screen X ที่ผู้เล่นจะถูกวาด (กลาง Canvas)
const SCREEN_CENTER_X = WIDTH / 2 - CELL_SIZE / 2;
// ตำแหน่ง Screen Y (คงที่)
const SCREEN_Y = HEIGHT - 6 * CELL_SIZE - CELL_SIZE; 


// 💡 ใหม่: Tile Configuration (Tileset)
const TILE_CONFIG = {
  0: { name: "Air", color: "transparent", isSolid: false },
  1: { name: "Ground", color: "sienna", isSolid: true },
  2: { name: "Door", color: "grey", isSolid: false }, // ประตูไม่ตัน (เดินเข้าได้)
  3: { name: "Wall", color: "darkred", isSolid: false },
} as const; 

type TileID = keyof typeof TILE_CONFIG;


// =========================================================
// 🚀 MAP DATA STRUCTURE (JSON Structure)
// =========================================================
interface Entity {
  type: string;
  col: number;
  row: number;
  target_map: string;
  target_col: number;
}

interface MapData {
  name: string;
  tile_cols: number;
  tile_rows: number;
  player_start_col: number;
  player_start_row: number;
  tilemap: number[][];
  entities: Entity[];
}

const MAP_DATA: Record<string, MapData> = {
  "World_1": {
    "name": "Outside World",
    "tile_cols": 20, // กว้าง 20 ช่อง
    "tile_rows": 12, // สูง 12 ช่อง
    "player_start_col": 16, 
    "player_start_row": 5, 
    
    "tilemap": [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0], // แถว 2: ผนังบ้าน
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0], 
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0], 
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 3, 0, 0], // แถว 5: ประตู (Tile 2)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],

    "entities": [
      {
        "type": "door",
        "col": 16,
        "row": 5, // แถวของประตู
        "target_map": "House_Interior",
        "target_col": 2
      }
    ]
  },

  "House_Interior": {
    "name": "Inside House",
    "tile_cols": 16,
    "tile_rows": 12,
    "player_start_col": 2,
    "player_start_row": 5,

    "tilemap": [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],

    "entities": [
      {
        "type": "door",
        "col": 2,
        "row": 5, 
        "target_map": "World_1",
        "target_col": 16
      }
    ]
  }
};


// =========================================================
// 💡 GameMap Class (Game Engine Structure)
// =========================================================
class GameMap {
  public name: string;
  public tile_cols: number;
  public tile_rows: number;
  public player_start_col: number;
  public player_start_row: number;
  public tilemap: TileID[][];
  public entities: Entity[];

  constructor(data: MapData) {
    this.name = data.name;
    this.tile_cols = data.tile_cols;
    this.tile_rows = data.tile_rows;
    this.player_start_col = data.player_start_col;
    this.player_start_row = data.player_start_row;
    
    // แปลง number ใน MapData เป็น TileID
    this.tilemap = data.tilemap.map(row => 
      row.map(id => id as TileID) 
    );
    this.entities = data.entities;
  }
  
  /** ดึง Tile ที่ตำแหน่ง Col, Row ที่ต้องการ */
  getTileAt(col: number, row: number): { id: TileID, config: typeof TILE_CONFIG[TileID] } | null {
      if (row < 0 || row >= this.tile_rows || col < 0 || col >= this.tile_cols) {
          return null; 
      }
      const id = this.tilemap[row][col];
      return { id, config: TILE_CONFIG[id] };
  }

  /** ตรวจสอบว่า Tile นั้นเป็นสิ่งกีดขวาง (Solid) หรือไม่ */
  isTileSolid(col: number, row: number): boolean {
      const tile = this.getTileAt(col, row);
      return tile ? tile.config.isSolid : true; // นอกแผนที่ = ตัน
  }
}

// สร้าง Instance ของ GameMap จาก JSON Data
const GAME_MAPS: Record<string, GameMap> = Object.fromEntries(
    Object.entries(MAP_DATA).map(([id, data]) => [id, new GameMap(data)])
);


// =========================================================
// ⚛️ REACT COMPONENT
// =========================================================
export default function GameCanvas() {
  // ... [canvasRef, lastTimeRef, useState, player useRef เดิม] ...
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTimeRef = useRef(0);

  const [mapId, setMapId] = useState('World_1'); 
  
  // 💡 Helper เพื่อดึง GameMap ปัจจุบัน (ต้องจำไว้ว่าค่านี้จะอัปเดตในรอบถัดไป)
  const currentMap = GAME_MAPS[mapId];

  const player = useRef({
    worldX: currentMap.player_start_col * CELL_SIZE, 
    y: SCREEN_Y, 
    speed: 200,
    dir: "down" as Direction,
    frame: 0,
    frameTimer: 0,
    frameInterval: 0.09,
  });

  const [displayWorldX, setDisplayWorldX] = useState(player.current.worldX);
  const [displayRC, setDisplayRC] = useState(
    `${currentMap.player_start_col}`
  );

  const keys = useRef<Keys>({});
  const sprites = useRef<Record<Direction, HTMLImageElement[]>>({ up: [], down: [], left: [], right: [] });

  const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; }
  const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; }

  // logic เกม
  const canMove = (x: number, dx: number) => {
    // 💡 แก้ไข: ดึง currentMap ภายในฟังก์ชันนี้เพื่อความมั่นใจ
    const map = GAME_MAPS[mapId];
    const currentMapWidth = map.tile_cols * CELL_SIZE; 
    
    const nextX = x + dx;
    
    // 1. ตรวจสอบขอบเขตโลก
    if(nextX < 0 || nextX > currentMapWidth - CELL_SIZE) return false;
    
    // 2. ตรวจสอบการชนกับ Tile ที่เป็น Solid
    const centerNextX = nextX + CELL_SIZE / 2;
    const nextCol = Math.floor(centerNextX / CELL_SIZE);
    const playerRow = Math.floor(player.current.y / CELL_SIZE);
    
    // ใช้เมธอดของ GameMap Class
    return !map.isTileSolid(nextCol, playerRow);
  }
    
  const checkDoorCollision = () => {
    const p = player.current;
    // 1. หาตำแหน่ง Grid ที่ผู้เล่นยืนอยู่
    const playerCol = Math.floor((p.worldX + CELL_SIZE / 2) / CELL_SIZE);
    const playerRow = Math.floor(p.y / CELL_SIZE);
    
    // 2. 🚀 ค้นหา Door Entity ใน Map ปัจจุบัน
    // 💡 แก้ไข: ดึง currentMap จาก GAME_MAPS
    const map = GAME_MAPS[mapId];
    
    // ใช้ entities จาก GameMap Class
    const door = map.entities.find(e => 
        e.type === 'door' && e.col === playerCol && e.row === playerRow
    );

    // 3. ตรวจสอบว่าชนประตูและกดปุ่ม 'W' หรือไม่
    if (door && keys.current["w"]) {
        // Teleport ไปยัง Map และ Col เป้าหมาย
        
        // 💡 อัพเดท player.current.worldX ก่อน
        player.current.worldX = door.target_col * CELL_SIZE;
        
        // 💡 อัพเดท mapId
        setMapId(door.target_map);
        
        keys.current["w"] = false;
        return true;
    }
    return false;
  }
    
  const update = (dt: number) => {
    const p = player.current;

    let moving = false;
    let dx = 0;

    if (keys.current["a"]) { dx -= p.speed * dt; p.dir = "left"; moving = true; }
    if (keys.current["d"]) { dx += p.speed * dt; p.dir = "right"; moving = true; }
    
    // *** W ไม่ควรทำให้ตัวละครเคลื่อนที่ในเกม 2D Side-view ***
    if (keys.current["w"]) { p.dir = "up"; } // สามารถคงทิศทางไว้ได้
    else if (!moving && keys.current["s"]) { p.dir = "down"; } // สามารถคงทิศทางไว้ได้

    // 💡 เช็คการเปลี่ยนฉากก่อนการเคลื่อนที่
    if (checkDoorCollision()) return; 

    // p.worldX คือ World X: ผู้เล่นขยับในโลกจริง
    if (canMove(p.worldX, dx)) p.worldX += dx;

    if (moving) {
      p.frameTimer += dt;
      if (p.frameTimer >= p.frameInterval) {
        p.frame = (p.frame + 1) % 2;
        p.frameTimer = 0;
      }
    } else { p.frame = 0; p.frameTimer = 0; }
  }

  // ... [draw, resizeCanvas, useEffect โหลด assets และ useEffect game loop/listeners/mapId change เดิม] ...
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const p = player.current;

    // 💡 ดึง GameMap ปัจจุบัน
    const currentMap = GAME_MAPS[mapId]; 
    const currentWorldWidth = currentMap.tile_cols * CELL_SIZE;
    
    // --- 1. Camera Clamp Logic ---
    const idealOffset = p.worldX - SCREEN_CENTER_X; 
    const minOffset = 0; 
    const maxOffset = currentWorldWidth - WIDTH; 
    const effectiveMaxOffset = Math.max(0, maxOffset); 
    const cameraOffset = Math.max(minOffset, Math.min(idealOffset, effectiveMaxOffset));


    // --- 2. วาดพื้นหลัง ---
    ctx.fillStyle = currentMap.name.includes('Outside') ? "skyblue" : "darkslategray";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


    // --- 3. วาด Tilemap และ Grid ---
    const drawGridAndTiles = () => {
        
        const mapToDraw = currentMap.tilemap; 
        const mapCols = currentMap.tile_cols;
        const mapRows = currentMap.tile_rows;

        for (let r = 0; r < mapRows; r++) {
            for (let c = 0; c < mapCols; c++) {
                const tileId = mapToDraw[r][c];
                const tileConfig = TILE_CONFIG[tileId]; 
                
                if (tileId !== 0) { // วาด Tile ที่ไม่ใช่ "Air"
                    const worldX = c * CELL_SIZE;
                    const screenX = worldX - cameraOffset;
                    const screenY = r * CELL_SIZE;

                    // 💡 ใช้ TILE_CONFIG.color แทน Hardcode
                    ctx.fillStyle = tileConfig.color; 

                    ctx.fillRect(screenX, screenY, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        // วาดเส้น Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"; 
        ctx.lineWidth = 1;
        const startX = Math.floor(cameraOffset / CELL_SIZE) * CELL_SIZE; 
        
        for (let x = startX; x < cameraOffset + WIDTH + CELL_SIZE; x += CELL_SIZE) {
            const screenX = x - cameraOffset;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, HEIGHT);
            ctx.stroke();
        }

        for (let y = 0; y < HEIGHT; y += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(WIDTH, y);
            ctx.stroke();
        }
    }
    drawGridAndTiles();


    // --- 4. วาดตัวละคร ---
    
    let playerScreenX = p.worldX - cameraOffset;

    const entities: { x: number; sprite: HTMLImageElement | null; type: "self" | "other"; id?: string; }[] = [];

    const dirSprites = sprites.current[p.dir];
    entities.push({
      x: playerScreenX, 
      sprite: dirSprites.length ? dirSprites[p.frame] : null,
      type: "self",
    });
    
    for (const e of entities) {
      if (e.sprite && e.sprite.complete) {
        ctx.drawImage(e.sprite, e.x, p.y, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = e.type === "self" ? "cyan" : "orange";
        ctx.fillRect(e.x, p.y, CELL_SIZE, CELL_SIZE);
      }
    }
  };

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
  }, []);


  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);

    canvas.style.width = `${WIDTH * scale}px`;
    canvas.style.height = `${HEIGHT * scale}px`;

    canvas.style.position = "absolute";
    canvas.style.left = `${(window.innerWidth - WIDTH * scale) / 2}px`;
    canvas.style.top = `${(window.innerHeight - HEIGHT * scale) / 2}px`;

    canvas.style.imageRendering = "pixelated";
  }

  // 💡 Effect สำหรับ Game Loop และ Event Listeners
  useEffect(() => {
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 💡 ตั้งค่าตำแหน่งเริ่มต้นของผู้เล่นใหม่เมื่อ mapId เปลี่ยน
    const map = GAME_MAPS[mapId];
    player.current.worldX = map.player_start_col * CELL_SIZE;

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
      
      const currentCol = Math.floor((player.current.worldX + CELL_SIZE / 2) / CELL_SIZE);
      
      setDisplayWorldX(player.current.worldX); 
      setDisplayRC(`${currentCol}`);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
    }
  }, [mapId]); // 🚀 ใส่ mapId ใน dependency array เพื่อให้ Component รีเซ็ตเมื่อเปลี่ยนฉาก

  // ส่วนแสดงผล JSX
  return (
    <>
      <div 
        style={{ 
          position: "absolute", 
          top: "10px", 
          right: "10px", 
          color: "white", 
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "8px 12px",
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "14px",
          zIndex: 100 
        }}
      >
        **Current Map:** {GAME_MAPS[mapId].name}
        <div style={{marginTop: "4px"}}>World X: **{Math.round(displayWorldX)}**</div>
        <div>Block Col: **{displayRC}**</div>
        <div>Press **W** to check Door</div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={WIDTH} 
        height={HEIGHT} 
        style={{border:"2px solid black"}} 
      />
    </>
  );
}