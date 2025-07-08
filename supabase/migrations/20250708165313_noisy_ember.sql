/*
  # Atualizar tabela de pedidos para suportar vendas locais

  1. Alterações na tabela orders
    - Adicionar coluna payment_method (forma de pagamento)
    - Adicionar coluna order_type (tipo do pedido: online/local)

  2. Função para diminuir estoque
    - Criar função RPC para diminuir estoque de forma segura
*/

-- Adicionar novas colunas à tabela orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'Online';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_type text DEFAULT 'online';
  END IF;
END $$;

-- Criar função para diminuir estoque de forma segura
CREATE OR REPLACE FUNCTION decrease_product_stock(product_id uuid, quantity_sold integer)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET stock = stock - quantity_sold
  WHERE id = product_id AND stock >= quantity_sold;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estoque insuficiente ou produto não encontrado';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;