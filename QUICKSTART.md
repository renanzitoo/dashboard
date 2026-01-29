# 🚀 Início Rápido - Dashboard

## ⚡ Passos Rápidos para Começar

### 1️⃣ Configurar Supabase (5 minutos)

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha:
   - Nome do projeto: `dashboard-app` (ou qualquer nome)
   - Database Password: crie uma senha forte
   - Region: escolha a mais próxima de você
4. Aguarde o projeto ser criado (~2 minutos)

### 2️⃣ Obter as Credenciais

1. No painel do Supabase, clique em **Settings** (⚙️) no menu lateral
2. Clique em **API**
3. Copie:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave longa começando com `eyJ...`)

### 3️⃣ Configurar o Projeto

1. Abra o arquivo `.env.local` na raiz do projeto
2. Cole suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 4️⃣ Criar as Tabelas no Banco de Dados

1. No painel do Supabase, clique em **SQL Editor** no menu lateral
2. Clique em **New Query**
3. Copie TODO o conteúdo do arquivo `supabase-setup.sql` (na raiz do projeto)
4. Cole no editor SQL
5. Clique em **Run** (▶️)
6. Aguarde a mensagem: "Tabelas criadas com sucesso! ✅"

### 5️⃣ Criar um Usuário para Login

1. No painel do Supabase, clique em **Authentication** no menu lateral
2. Clique em **Users**
3. Clique em **Add user** → **Create new user**
4. Preencha:
   - Email: seu email (ex: `admin@example.com`)
   - Password: uma senha forte
   - Email Confirm: ✅ (marque para confirmar automaticamente)
5. Clique em **Create user**

### 6️⃣ Habilitar Realtime (Opcional mas Recomendado)

1. No painel do Supabase, clique em **Database** no menu lateral
2. Clique em **Replication**
3. Habilite o toggle para estas tabelas:
   - ✅ `appointments`
   - ✅ `customers`
   - ✅ `conversations`
   - ✅ `messages`

### 7️⃣ Iniciar o Projeto

No terminal, execute:

```bash
npm run dev
```

### 8️⃣ Acessar a Aplicação

1. Abra o navegador em: [http://localhost:3000](http://localhost:3000)
2. Você será redirecionado para `/login`
3. Entre com o email e senha que você criou no passo 5
4. Pronto! 🎉

---

## 📊 Adicionar Dados de Exemplo (Opcional)

Se quiser dados de exemplo para testar, execute este SQL no **SQL Editor**:

```sql
-- Inserir clientes de exemplo
INSERT INTO customers (name, email, phone) VALUES
  ('João Silva', 'joao@example.com', '(11) 98765-4321'),
  ('Maria Santos', 'maria@example.com', '(11) 98765-1234'),
  ('Pedro Oliveira', 'pedro@example.com', '(11) 98765-5678');

-- Inserir agendamentos de exemplo
INSERT INTO appointments (customer_id, start_time, end_time, status)
SELECT 
  c.id,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
  'pending'
FROM customers c
WHERE c.email = 'joao@example.com';

INSERT INTO appointments (customer_id, start_time, end_time, status)
SELECT 
  c.id,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '1 hour',
  'completed'
FROM customers c
WHERE c.email = 'maria@example.com';

INSERT INTO appointments (customer_id, start_time, end_time, status)
SELECT 
  c.id,
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
  'pending'
FROM customers c
WHERE c.email = 'pedro@example.com';

-- Inserir conversas de exemplo
INSERT INTO conversations (customer_id, status)
SELECT id, 'open' FROM customers WHERE email = 'joao@example.com';

INSERT INTO conversations (customer_id, status)
SELECT id, 'closed' FROM customers WHERE email = 'maria@example.com';

-- Inserir mensagens de exemplo
INSERT INTO messages (conversation_id, sender, content)
SELECT 
  c.id,
  'customer',
  'Olá, gostaria de fazer um agendamento.'
FROM conversations c
JOIN customers cu ON c.customer_id = cu.id
WHERE cu.email = 'joao@example.com';

INSERT INTO messages (conversation_id, sender, content)
SELECT 
  c.id,
  'bot',
  'Olá! Claro, posso te ajudar com isso. Qual data você prefere?'
FROM conversations c
JOIN customers cu ON c.customer_id = cu.id
WHERE cu.email = 'joao@example.com';

INSERT INTO messages (conversation_id, sender, content)
SELECT 
  c.id,
  'customer',
  'Prefiro amanhã às 14h.'
FROM conversations c
JOIN customers cu ON c.customer_id = cu.id
WHERE cu.email = 'joao@example.com';

INSERT INTO messages (conversation_id, sender, content)
SELECT 
  c.id,
  'bot',
  'Perfeito! Seu agendamento foi registrado para amanhã às 14h.'
FROM conversations c
JOIN customers cu ON c.customer_id = cu.id
WHERE cu.email = 'joao@example.com';
```

---

## 🎯 O que você tem agora:

✅ Sistema de login com Supabase  
✅ Dashboard com estatísticas em tempo real  
✅ Página de Agendamentos com filtros  
✅ Página de Clientes  
✅ Página de Conversas  
✅ Visualização de mensagens  
✅ Atualização automática em tempo real  
✅ Design responsivo com Tailwind CSS  
✅ Componentes UI modernos com shadcn/ui  

---

## ❓ Problemas Comuns

### Erro: "Invalid API key"
- Verifique se copiou corretamente as credenciais do Supabase
- Certifique-se de que o arquivo `.env.local` está na raiz do projeto
- Reinicie o servidor: `Ctrl+C` e depois `npm run dev`

### Erro: "relation does not exist"
- As tabelas não foram criadas
- Execute o script `supabase-setup.sql` no SQL Editor

### Não consigo fazer login
- Verifique se criou o usuário no Authentication → Users
- Certifique-se de que marcou "Email Confirm" ao criar o usuário
- Tente resetar a senha do usuário

### Página em branco
- Abra o console do navegador (F12) e veja os erros
- Verifique se o arquivo `.env.local` está configurado corretamente
- Certifique-se de que o servidor está rodando

---

## 📚 Documentação Completa

Veja o arquivo `README-DASHBOARD.md` para documentação completa e detalhada.

---

**Boa sorte com seu projeto! 🚀**
