/*
  # Criação das tabelas para loja de roupas masculinas

  1. Novas Tabelas
    - `products` (produtos da loja)
      - `id` (uuid, chave primária)
      - `name` (texto, nome do produto)
      - `description` (texto, descrição)
      - `price` (decimal, preço)
      - `sizes` (array, tamanhos disponíveis)
      - `stock` (inteiro, quantidade em estoque)
      - `image_url` (texto, URL da imagem)
      - `category` (texto, categoria do produto)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `orders` (pedidos dos clientes)
      - `id` (uuid, chave primária)
      - `customer_name` (texto, nome do cliente)
      - `customer_phone` (texto, telefone do cliente)
      - `customer_address` (texto, endereço do cliente)
      - `products` (json, produtos do pedido)
      - `total` (decimal, valor total)
      - `created_at` (timestamp)

    - `admin_users` (usuários administrativos)
      - `id` (uuid, chave primária)
      - `email` (texto, email único)
      - `password_hash` (texto, hash da senha)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas específicas para cada tabela
    - Proteger dados administrativos
*/

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  sizes text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  products json NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos (leitura pública, escrita apenas para admins)
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Políticas para pedidos (inserção pública, visualização apenas para admins)
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Políticas para usuários administrativos (apenas admins podem ver)
CREATE POLICY "Only admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, sizes, stock, image_url, category) VALUES
  ('Camisa Social Slim', 'Camisa social masculina corte slim, tecido algodão premium', 149.90, ARRAY['P', 'M', 'G', 'GG'], 25, 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500', 'Camisas'),
  ('Calça Jeans Skinny', 'Calça jeans masculina skinny, lavagem escura', 199.90, ARRAY['36', '38', '40', '42', '44'], 30, 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=500', 'Calças'),
  ('Polo Básica', 'Polo masculina básica, 100% algodão', 79.90, ARRAY['P', 'M', 'G', 'GG'], 40, 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=500', 'Polos'),
  ('Blazer Casual', 'Blazer masculino casual, tecido leve', 299.90, ARRAY['P', 'M', 'G', 'GG'], 15, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500', 'Blazers'),
  ('Bermuda Sarja', 'Bermuda masculina em sarja, corte reto', 89.90, ARRAY['36', '38', '40', '42', '44'], 35, 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=500', 'Bermudas'),
  ('Camiseta Básica', 'Camiseta masculina básica, 100% algodão', 49.90, ARRAY['P', 'M', 'G', 'GG'], 50, 'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg?auto=compress&cs=tinysrgb&w=500', 'Camisetas');

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO admin_users (email, password_hash) VALUES
  ('admin@loja.com', '$2b$10$rOzJQjZJwE4J8G7wQ7XbkOmGXhUr9QjDgZhLwQ2RJ1MXpAQvB8VhS');