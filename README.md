# MenStyle - Loja Virtual de Roupas Masculinas

Uma loja virtual completa e profissional para roupas masculinas, construída com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

### Frontend (Cliente)
- **Página inicial** com banner rotativo, produtos em destaque e categorias
- **Catálogo de produtos** com filtros avançados (categoria, preço, tamanho, busca)
- **Visualização detalhada** de produtos com seleção de tamanhos
- **Carrinho de compras** com validação completa
- **Checkout integrado** com WhatsApp para finalização
- **Design responsivo** para todos os dispositivos
- **Animações suaves** e micro-interações

### Backend (Administrador)
- **Sistema de login** seguro com JWT
- **Painel administrativo** com estatísticas
- **Gerenciamento de produtos** (CRUD completo)
- **Visualização de pedidos** e estoque
- **Controle de acesso** com RLS (Row Level Security)

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Yup
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Validação**: Yup
- **Ícones**: Lucide React

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd menstyle-store
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um novo projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a Anon Key

#### 3.2 Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

#### 3.3 Execute as migrations
No painel do Supabase, vá em SQL Editor e execute o conteúdo do arquivo `supabase/migrations/create_tables.sql`.

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 🔐 Acesso Administrativo

### Credenciais padrão:
- **Email**: admin@loja.com
- **Senha**: admin123

### Configuração do Usuário Administrativo:

#### Método 1: Usando o SQL Editor do Supabase
1. Acesse o painel do Supabase
2. Vá em "SQL Editor"
3. Execute o arquivo `supabase/migrations/create_admin_user.sql`
4. Crie o usuário no Supabase Auth:
   - Vá em "Authentication" > "Users"
   - Clique em "Add user"
   - Email: admin@loja.com
   - Senha: admin123
   - Marque "Auto Confirm User"

#### Método 2: Usando o Terminal (se tiver Supabase CLI)
```bash
# Criar usuário via CLI
supabase auth users create admin@loja.com --password admin123
```

### Solução de Problemas de Login:

1. **Erro "Invalid login credentials"**:
   - Verifique se o usuário foi criado no Supabase Auth
   - Confirme se o email está correto: admin@loja.com
   - Confirme se a senha está correta: admin123

2. **Usuário loga mas não tem acesso admin**:
   - Verifique se existe registro na tabela `admin_users`
   - O ID do usuário no Auth deve corresponder ao ID na tabela `admin_users`

3. **Para resetar o usuário admin**:
   ```sql
   -- No SQL Editor do Supabase
   DELETE FROM admin_users WHERE email = 'admin@loja.com';
   
   INSERT INTO admin_users (id, email, password_hash) VALUES 
   (
     '00000000-0000-0000-0000-000000000001'::uuid,
     'admin@loja.com',
     '$2b$10$rQZ9QmSTWzrV8uXffkjHUeJ4GcIoH6.Ks8GbpR9QJmqV8uXffkjHUe'
   );
   ```
## 📱 Funcionalidades Detalhadas

### Sistema de Compras
1. **Navegação**: Explore produtos por categoria ou busca
2. **Detalhes**: Visualize informações completas do produto
3. **Carrinho**: Adicione produtos com tamanhos específicos
4. **Checkout**: Preencha dados pessoais (nome, telefone, endereço)
5. **Finalização**: Pedido é enviado automaticamente para WhatsApp

### Painel Administrativo
- **Dashboard**: Estatísticas de vendas e estoque
- **Produtos**: Adicionar, editar e remover produtos
- **Pedidos**: Visualizar todos os pedidos recebidos
- **Estoque**: Controle de quantidades disponíveis

## 🎨 Design

### Paleta de Cores
- **Primária**: Azul escuro (#1e293b)
- **Secundária**: Cinza (#64748b)
- **Destaque**: Dourado (#f59e0b)
- **Sucesso**: Verde (#10b981)
- **Erro**: Vermelho (#ef4444)

### Responsividade
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Segurança

### Row Level Security (RLS)
- **Produtos**: Leitura pública, escrita apenas para admins
- **Pedidos**: Inserção pública, visualização apenas para admins
- **Usuários**: Acesso restrito apenas aos próprios dados

### Autenticação
- JWT tokens do Supabase
- Verificação de permissões administrativas
- Proteção de rotas sensíveis

## 📞 Integração WhatsApp

O sistema envia automaticamente os pedidos para o WhatsApp configurado:
- **Número**: +5585994015283
- **Formato**: Mensagem estruturada com todos os dados do pedido

## 🚀 Deploy

### Opções de Deploy
1. **Vercel** (Recomendado)
2. **Netlify**
3. **AWS S3 + CloudFront**

### Configuração para Produção
1. Configure as variáveis de ambiente no serviço de deploy
2. Execute `npm run build` para gerar os arquivos otimizados
3. Faça o upload da pasta `dist` para o serviço escolhido

## 📊 Estrutura do Banco de Dados

### Tabela `products`
- `id`: UUID (chave primária)
- `name`: Nome do produto
- `description`: Descrição detalhada
- `price`: Preço (decimal)
- `sizes`: Array de tamanhos disponíveis
- `stock`: Quantidade em estoque
- `image_url`: URL da imagem
- `category`: Categoria do produto

### Tabela `orders`
- `id`: UUID (chave primária)
- `customer_name`: Nome do cliente
- `customer_phone`: Telefone do cliente
- `customer_address`: Endereço completo
- `products`: JSON com produtos do pedido
- `total`: Valor total do pedido

### Tabela `admin_users`
- `id`: UUID (chave primária)
- `email`: Email do administrador
- `password_hash`: Hash da senha

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- **WhatsApp**: (85) 99401-5283
- **Email**: contato@menstyle.com

---

Desenvolvido com ❤️ para o e-commerce brasileiro.