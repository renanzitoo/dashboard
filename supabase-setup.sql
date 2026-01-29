-- ========================================
-- Script de Criação de Tabelas - Dashboard
-- ========================================
-- Execute este script no SQL Editor do Supabase
-- Database -> SQL Editor -> New Query

-- 1. TABELA DE CLIENTES
-- ========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

COMMENT ON TABLE customers IS 'Armazena informações dos clientes';

-- 2. TABELA DE AGENDAMENTOS
-- ========================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

COMMENT ON TABLE appointments IS 'Armazena todos os agendamentos da aplicação';

-- 3. TABELA DE CONVERSAS
-- ========================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

COMMENT ON TABLE conversations IS 'Armazena conversas entre clientes e o sistema';

-- 4. TABELA DE MENSAGENS
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('bot', 'customer')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

COMMENT ON TABLE messages IS 'Armazena mensagens das conversas';

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para customers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ========================================
-- Descomente as linhas abaixo para inserir dados de exemplo

/*
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
*/

-- ========================================
-- VERIFICAR TABELAS CRIADAS
-- ========================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('customers', 'appointments', 'conversations', 'messages')
ORDER BY table_name;

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso! ✅' as status;
