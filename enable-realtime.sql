-- ========================================
-- HABILITAR REALTIME NO SUPABASE
-- ========================================
-- Execute este script no SQL Editor do Supabase
-- para habilitar as atualizações em tempo real

-- 1. Habilitar Realtime para a tabela appointments
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- 2. Habilitar Realtime para a tabela customers
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- 3. Habilitar Realtime para a tabela conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 4. Habilitar Realtime para a tabela messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ========================================
-- VERIFICAR SE O REALTIME FOI HABILITADO
-- ========================================
SELECT 
  schemaname,
  tablename
FROM 
  pg_publication_tables
WHERE 
  pubname = 'supabase_realtime'
ORDER BY 
  tablename;

-- ========================================
-- MENSAGEM DE SUCESSO
-- ========================================
SELECT 'Realtime habilitado com sucesso para todas as tabelas! ✅' as status;
