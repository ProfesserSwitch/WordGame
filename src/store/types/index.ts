export interface UserRegister {
  id?: number;
  email: string;
  username: string;
  password?: string;   // ไม่ควรส่งออกหลังบ้าน แต่เอาไว้ตอน register
  createdat?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface StageType {
  id: string;
  orderNo: number;
  name: string;
  description: string;
  
}

export interface ShopType {
  shop_id: string;
  price: number;
  item_id: string;
  name: string;
  type: string;
  description: string;
}

export interface MonsterType {
  id: string;
  name: string;
  max_hp: number;
  atk_power_min: number;
  atk_power_max: number;
  cooldown: number;
  description: string;
}

export interface Dictionary {
  word: string;
  type: string;
  meaning: string;
  level: string;
}

export interface DictionaryFilterRequest {
  startsWith?: string;
  contains?: string;
  length?: number;
  level?: string | null;
  limit?: number;
  lastWord?: string | null;
  append?: boolean; //เพิ่ม
}

export interface DictionaryWord {
  word: string;
  type: string;
  meaning: string;
  level: string;
  length: number;
}

export interface DictionaryResponse {
  isSuccess: boolean;
  count: number;
  hasNext: boolean;
  data: DictionaryWord[];
  lastWord: string | null ;
}