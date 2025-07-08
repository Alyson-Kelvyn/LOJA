import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  stock: number;
  image_url: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  products: CartItem[];
  total: number;
  created_at: string;
  order_type?: string; // Adicionado para diferenciar pedidos locais e online
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image_url: string;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
};
