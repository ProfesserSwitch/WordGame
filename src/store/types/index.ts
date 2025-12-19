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