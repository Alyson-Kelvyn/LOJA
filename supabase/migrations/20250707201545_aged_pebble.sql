/*
  # Complete MenStyle Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, required)
      - `price` (numeric, required)
      - `sizes` (text array, default empty)
      - `stock` (integer, default 0)
      - `image_url` (text, required)
      - `category` (text, required)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text, required)
      - `customer_phone` (text, required)
      - `customer_address` (text, required)
      - `products` (json, required)
      - `total` (numeric, required)
      - `created_at` (timestamp with timezone)
    
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, required)
      - `password_hash` (text, required)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on all tables
    - Products: Public read access, admin-only write access
    - Orders: Public insert, admin-only read access
    - Admin users: Self-read only access

  3. Functions
    - Update trigger function for products updated_at column
    - Helper function to get current user ID
*/

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION uid() RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  sizes text[] DEFAULT '{}',
  stock integer DEFAULT 0,
  image_url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  products json NOT NULL,
  total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create trigger for products updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Only admins can view orders" ON orders;

DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    uid() IN (SELECT id FROM admin_users)
  );

-- Orders policies
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    uid() IN (SELECT id FROM admin_users)
  );

-- Admin users policies
CREATE POLICY "Only admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (uid() = id);

-- Insert sample admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@loja.com', '$2b$10$rQZ9QmSTWzrV8uXffkjHUeJ4GcIoH6.Ks8GbpR9QJmqV8uXffkjHUe')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, sizes, stock, image_url, category) VALUES
  (
    'Camisa Social Branca',
    'Camisa social masculina em algodão premium, ideal para ocasiões formais e profissionais.',
    89.90,
    ARRAY['P', 'M', 'G', 'GG'],
    25,
    'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Camisas'
  ),
  (
    'Calça Jeans Slim',
    'Calça jeans masculina com corte slim, confeccionada em denim de alta qualidade.',
    129.90,
    ARRAY['38', '40', '42', '44', '46'],
    18,
    'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Calças'
  ),
  (
    'Polo Azul Marinho',
    'Polo masculina em piquet, perfeita para o dia a dia com elegância e conforto.',
    69.90,
    ARRAY['P', 'M', 'G', 'GG'],
    30,
    'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Polos'
  ),
  (
    'Blazer Cinza',
    'Blazer masculino em tecido misto, ideal para compor looks sociais e casuais.',
    199.90,
    ARRAY['P', 'M', 'G', 'GG'],
    12,
    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Blazers'
  ),
  (
    'Camisa Xadrez',
    'Camisa casual masculina em xadrez, perfeita para looks descontraídos.',
    79.90,
    ARRAY['P', 'M', 'G', 'GG'],
    22,
    'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Camisas'
  ),
  (
    'Calça Chino Bege',
    'Calça chino masculina em sarja, versátil para diversas ocasiões.',
    99.90,
    ARRAY['38', '40', '42', '44', '46'],
    20,
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Calças'
  ),
  (
    'Polo Listrada',
    'Polo masculina com listras horizontais, estilo náutico moderno.',
    74.90,
    ARRAY['P', 'M', 'G', 'GG'],
    28,
    'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Polos'
  ),
  (
    'Blazer Preto',
    'Blazer masculino preto, essencial para ocasiões formais.',
    219.90,
    ARRAY['P', 'M', 'G', 'GG'],
    8,
    'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Blazers'
  )
ON CONFLICT (id) DO NOTHING;