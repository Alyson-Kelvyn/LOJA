/*
  # Criar usuário administrativo padrão

  1. Inserir usuário admin na tabela admin_users
    - Email: admin@loja.com
    - ID específico para funcionar com Supabase Auth
  
  2. Configurar autenticação
    - Criar usuário no Supabase Auth
    - Vincular com tabela admin_users
*/

-- Primeiro, vamos limpar qualquer usuário admin existente
DELETE FROM admin_users WHERE email = 'admin@loja.com';

-- Inserir o usuário admin com um ID específico que será usado no Supabase Auth
INSERT INTO admin_users (id, email, password_hash) VALUES 
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@loja.com',
  '$2b$10$rQZ9QmSTWzrV8uXffkjHUeJ4GcIoH6.Ks8GbpR9QJmqV8uXffkjHUe'
)
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  password_hash = EXCLUDED.password_hash;